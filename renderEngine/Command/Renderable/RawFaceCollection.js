import IContext from "../../Context/IContext.js";
import IDataSource from "../../Source/IDataSource.js";
import SourceUtil from "../../Source/SourceUtil.js";
import StringUtil from "../../Token/StringUtil.js";
import Face from "./Face.js";
import FaceCollection from "./FaceCollection.js";
import FaceRowType from "./FaceRowType.js";
import RawFace from "./RawFace.js";
import CommandElement from "../CommandElement.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const alasql = require("alasql")

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceOutsideQuotedStrings(input, replaceSegment) {
  let result = "";
  let segment = "";
  let quote = null;
  let escaped = false;

  for (const char of String(input || "")) {
    if (quote) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      result += replaceSegment(segment);
      segment = "";
      quote = char;
      result += char;
      continue;
    }

    segment += char;
  }

  return result + replaceSegment(segment);
}

const FACE_DIAGNOSTIC_TERMS = [
  "selectlocation",
  "itemid",
  "textlocation",
  "parent-item",
  "child-item",
];

function isFaceDiagnosticEnabled() {
  return /^(1|true|yes)$/i.test(String(process.env.RENDER_FACE_DIAGNOSTICS || ""));
}

function safePreview(value, maxLength = 500) {
  try {
    const text =
      typeof value === "string" ? value : JSON.stringify(value ?? null);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...(truncated)` : text;
  } catch {
    return String(value);
  }
}

function isDiagnosticFaceText(...values) {
  if (isFaceDiagnosticEnabled()) {
    return true;
  }
  return values.some((value) => {
    const text = String(value || "").toLowerCase();
    return FACE_DIAGNOSTIC_TERMS.some((term) => text.includes(term));
  });
}

function summarizeRows(rows) {
  return (rows || []).slice(0, 5).map((row) => ({
    Id: row?.Id ?? row?.id,
    ParentId: row?.ParentId ?? row?.parentid,
    Field: row?.Field ?? row?.field,
    Type: row?.Type ?? row?.type,
    Value: safePreview(row?.Value ?? row?.value, 140),
    Path: row?.Path ?? row?.path,
  }));
}

function getObjectKey(value, ...names) {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(value, name)) {
      return name;
    }
    const foundKey = Object.keys(value).find(
      (key) => key.toLowerCase() === name.toLowerCase()
    );
    if (foundKey) {
      return foundKey;
    }
  }
  return undefined;
}

function getObjectField(value, ...names) {
  const key = getObjectKey(value, ...names);
  return key ? value[key] : undefined;
}

function normalizeFilterText(filter) {
  return String(filter || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isLegacyRootObjectFilter(filter) {
  const normalized = normalizeFilterText(filter);
  return (
    /\bfield\s*=\s*['"]root['"]/.test(normalized) &&
    /\btype\s*=\s*['"]object['"]/.test(normalized)
  );
}

function getLegacyRootObjectRows(rows) {
  const rootIds = new Set(
    rows
      .filter((row) => {
        const field = String(getObjectField(row, "Field", "field") || "")
          .toLowerCase();
        const type = String(getObjectField(row, "Type", "type") || "")
          .toLowerCase();
        return field === "root" && type === "array";
      })
      .map((row) => getObjectField(row, "Id", "id"))
      .filter((id) => id != null)
  );
  if (rootIds.size === 0) {
    return [];
  }
  return rows.filter((row) => {
    const type = String(getObjectField(row, "Type", "type") || "")
      .toLowerCase();
    const parentId = getObjectField(row, "ParentId", "parentid");
    return type === "object" && rootIds.has(parentId);
  });
}

export default class RawFaceCollection {
  /**@type {RawFace[]} */
  faces;
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    this.faces = ilObject.map((x) => new RawFace(x));
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<FaceCollection>}
   */
  async getFaceListAsync(source, context) {
    const rows = source
      ? SourceUtil.ensureDataArray(source, "prepare face source rows")
      : [];
    const faces = this.faces.map(async (x, index) => {
      const applyReplace = x.applyReplace.getValueAsync(context);
      const applyFunction = x.applyFunction.getValueAsync(context);
      const rowType = x.rowType.getValueAsync(context);
      const filter = x.filter.getValueAsync(context);
      const template = x.content.getValueAsync(context);
      const level = x.level.getValueAsync(context);
      const retVal = new Face();
      retVal.applyFunction = await applyFunction;
      retVal.applyReplace = await applyReplace;
      retVal.rowType = FaceRowType[(await rowType) ?? FaceRowType.notset];
      retVal.columns = source?.columns ? [...source.columns] : null;
      retVal.sourceRows = rows;
      retVal.debugIndex = index;
      retVal.sourceId = source?.id || "";
      retVal.rawFilter = await filter;
      retVal.rawTemplate = await template;
      retVal.formattedFilter = this.formatFilter(source, retVal.rawFilter);
      retVal.formattedContent = this.formatTemplate(source, retVal.rawTemplate);
      retVal.relatedRows = this.getRelatedRows(
        source,
        retVal.formattedFilter
      );
      const strLevel = await level;
      retVal.levels = strLevel ? strLevel.split("|") : null;
      if (
        isDiagnosticFaceText(
          retVal.rawTemplate,
          retVal.formattedContent,
          retVal.rawFilter,
          retVal.formattedFilter
        )
      ) {
        console.warn("[face.prepare.diagnostic]", {
          sourceId: retVal.sourceId,
          faceIndex: retVal.debugIndex,
          rowType: retVal.rowType,
          levels: retVal.levels,
          columns: retVal.columns,
          rawFilter: safePreview(retVal.rawFilter),
          formattedFilter: safePreview(retVal.formattedFilter),
          relatedRowsCount: retVal.relatedRows?.length ?? 0,
          relatedRowsPreview: summarizeRows(retVal.relatedRows),
          rawTemplate: safePreview(retVal.rawTemplate),
          formattedTemplate: safePreview(retVal.formattedContent),
        });
      }
      return retVal;
    });
    return new FaceCollection(...(await Promise.all(faces)));
  }

  /**
   * @param {IDataSource} source
   * @param {string?} template
   * @returns {string?}
   */
  formatTemplate(source, template) {
    if (template && source?.columns) {
      source.columns.forEach((col, index) => {
        const replacement = `{${index}}`;
        const pattern = `(?:@${col}|@col${index + 1}(?!\\d))|@${col}`;
        template = StringUtil.replace(template, pattern, replacement);
      });
    }
    return template;
  }

  /**
   * @param {IDataSource} source
   * @param {string?} filter
   * @returns {string?}
   */
  formatFilter(source, filter) {
    if (filter && source?.columns) {
      filter = replaceOutsideQuotedStrings(filter, (segment) => {
        source.columns.forEach((col, index) => {
          const escapedColumn = escapeRegExp(col);
          const tokenPattern = `(?:@${escapedColumn}|@col${index + 1}(?!\\d))`;
          const columnPattern = `(^|[^\\w.\\[\\]\`"'])(${escapedColumn})(?![\\w\\]\`"'])`;
          segment = StringUtil.replace(segment, tokenPattern, col);
          segment = segment.replace(new RegExp(columnPattern, "gi"), `$1${col}`);
        });
        return SourceUtil.escapeReservedColumnNames(source, segment);
      });
      filter = SourceUtil.normalizeJsonMemberTypeLiterals(filter);
    }
    return filter;
  }

  /**
   * @param {IDataSource} source
   * @param {string} filter
   * @returns {Array<any>}
   */
  getRelatedRows(source, filter) {
    /**
     * @type {Array<any>}
     */
    let retVal = null;
    const rows = source ? SourceUtil.ensureDataArray(source, "apply face filter") : [];
    if (rows.length === 0) {
      return [];
    }
    try {
      if (filter) {
        retVal = SourceUtil.runQuery(
          `SELECT VALUE FROM ? WHERE ${filter}`,
          [rows],
          {
            sourceId: source?.id || "",
            operation: "face-filter",
            rowCount: rows.length,
          }
        );
      } else {
        retVal = rows;
      }
    } catch (ex) {
      console.error("error in apply filter in face", ex);
      retVal = [];
    }
    if (retVal.length === 0 && isLegacyRootObjectFilter(filter)) {
      retVal = getLegacyRootObjectRows(rows);
      if (retVal.length > 0) {
        console.warn("[face.filter.legacy_root_object_fallback]", {
          sourceId: source?.id || "",
          filter: safePreview(filter),
          relatedRowsCount: retVal.length,
          relatedRowsPreview: summarizeRows(retVal),
        });
      }
    }
    return retVal;
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return this.faces.length > 0;
  }

  /**
   * @param {CommandElement} ownerTag
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addHtmlElementAsync(ownerTag, context) {
    await Promise.all(
      this.faces.map(async (face) => {
        ownerTag.addChild(await face.createHtmlElementAsync(context));
      })
    );
  }
}
