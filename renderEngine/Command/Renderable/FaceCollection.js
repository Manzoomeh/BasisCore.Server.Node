import StringUtil from "../../Token/StringUtil.js";
import Face from "./Face.js";
import FaceRowType from "./FaceRowType.js";

function getObjectField(value, ...names) {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const key = getObjectKey(value, ...names);
  return key ? value[key] : undefined;
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

function setObjectField(value, fieldValue, fallbackName, ...names) {
  if (!value || typeof value !== "object") {
    return;
  }
  const key = getObjectKey(value, ...names) || fallbackName;
  value[key] = fieldValue;
}

function parseObjectLikeValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!/^[\[{]/.test(trimmed)) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function isEmptyObjectValue(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

function isMissingScalarValue(value) {
  return (
    value == null ||
    value === "" ||
    value === "{}" ||
    isEmptyObjectValue(value)
  );
}

function resolveScalarValueFromSourceRows(row, sourceRows) {
  if (!Array.isArray(sourceRows) || !row || typeof row !== "object") {
    return undefined;
  }
  const field = getObjectField(row, "Field");
  const parentId = getObjectField(row, "ParentId", "parentid");
  if (!field || parentId == null) {
    return undefined;
  }
  const parentRow = sourceRows.find(
    (candidate) => getObjectField(candidate, "Id", "id") === parentId
  );
  if (parentRow) {
    const parentValue = parseObjectLikeValue(getObjectField(parentRow, "Value"));
    if (
      parentValue &&
      typeof parentValue === "object" &&
      !Array.isArray(parentValue)
    ) {
      const resolved = getObjectField(parentValue, field);
      if (resolved !== undefined) {
        return resolved;
      }
    }
  }
  const siblingRow = sourceRows.find((candidate) => {
    if (candidate === row) {
      return false;
    }
    return (
      getObjectField(candidate, "ParentId", "parentid") === parentId &&
      String(getObjectField(candidate, "Field") || "").toLowerCase() ===
        String(field).toLowerCase() &&
      !isMissingScalarValue(getObjectField(candidate, "Value"))
    );
  });
  return siblingRow ? getObjectField(siblingRow, "Value") : undefined;
}

function getRenderableData(row, sourceRows) {
  if (!row || typeof row !== "object") {
    return row;
  }
  const rowField = getObjectField(row, "Field");
  const rawValue = parseObjectLikeValue(getObjectField(row, "Value"));
  const scalarFallbackValue =
    rowField && isMissingScalarValue(rawValue)
      ? resolveScalarValueFromSourceRows(row, sourceRows)
      : undefined;
  const effectiveRawValue = scalarFallbackValue ?? rawValue;
  const objectValue =
    effectiveRawValue &&
    typeof effectiveRawValue === "object" &&
    !Array.isArray(effectiveRawValue)
      ? effectiveRawValue
      : null;
  const value = {
    ...(row.__basisObjectFields || {}),
    ...(objectValue || {}),
  };
  const hasDerivedFields = Object.keys(value).length > 0;
  const hasDirectDisplayField =
    getObjectField(row, "title", "name", "text", "textlocation") !== undefined;
  if (
    !objectValue &&
    !hasDerivedFields &&
    !hasDirectDisplayField &&
    isMissingScalarValue(effectiveRawValue)
  ) {
    return row;
  }
  const renderableRow = {
    ...row,
  };
  const id = getObjectField(value, "id") ?? getObjectField(row, "id");
  const parentId =
    getObjectField(value, "parentid", "parentId") ??
    getObjectField(row, "parentid", "parentId");
  const displayValue =
    getObjectField(value, "title", "name", "value") ??
    getObjectField(row, "title", "name", "text", "textlocation") ??
    (hasDerivedFields ? JSON.stringify(value) : effectiveRawValue);

  setObjectField(renderableRow, id, "Id", "id");
  setObjectField(renderableRow, parentId, "ParentId", "parentid", "parentId");
  setObjectField(renderableRow, displayValue, "Value", "value");
  return renderableRow;
}

function getRenderValues(row, columns, sourceRows) {
  const renderableRow = getRenderableData(row, sourceRows);
  if (Array.isArray(columns) && columns.length > 0) {
    return columns.map((column) => getObjectField(renderableRow, column));
  }
  return Object.values(renderableRow);
}

function safePreview(value, maxLength = 400) {
  try {
    const text =
      typeof value === "string" ? value : JSON.stringify(value ?? null);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...(truncated)` : text;
  } catch {
    return String(value);
  }
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

function isDiagnosticFace(face) {
  if (isFaceDiagnosticEnabled()) {
    return true;
  }
  const text = [
    face?.rawTemplate,
    face?.formattedContent,
    face?.rawFilter,
    face?.formattedFilter,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return FACE_DIAGNOSTIC_TERMS.some((term) => text.includes(term));
}

function isDiagnosticRow(row) {
  if (isFaceDiagnosticEnabled()) {
    return true;
  }
  const field = String(getObjectField(row, "Field", "field") || "").toLowerCase();
  const type = String(getObjectField(row, "Type", "type") || "").toLowerCase();
  const value = parseObjectLikeValue(getObjectField(row, "Value", "value"));
  return (
    ["id", "title", "parentid"].includes(field) ||
    ["object", "array", "scalar.numeric", "scalar.string"].includes(type) ||
    (value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (getObjectField(value, "id") !== undefined ||
        getObjectField(value, "title") !== undefined))
  );
}

function summarizeRow(row) {
  return {
    Id: getObjectField(row, "Id", "id"),
    ParentId: getObjectField(row, "ParentId", "parentid"),
    Field: getObjectField(row, "Field", "field"),
    Type: getObjectField(row, "Type", "type"),
    Value: safePreview(getObjectField(row, "Value", "value"), 180),
    Path: getObjectField(row, "Path", "path"),
  };
}

function getFaceMatchDiagnostic(face, row, rowType, levels) {
  const related = face.relatedRows?.indexOf(row) != -1;
  const rowTypeOk =
    face.rowType == FaceRowType.notset || face.rowType == rowType;
  const levelOk =
    face.levels == null ||
    face.levels.some((level) => levels?.indexOf(level) != -1);
  return {
    faceIndex: face.debugIndex,
    sourceId: face.sourceId,
    related,
    rowTypeOk,
    levelOk,
    willMatch: related && rowTypeOk && levelOk,
    rowType: face.rowType,
    levels: face.levels,
    relatedRowsCount: face.relatedRows?.length ?? 0,
    rawFilter: safePreview(face.rawFilter, 220),
    formattedFilter: safePreview(face.formattedFilter, 220),
    template: safePreview(face.formattedContent, 260),
  };
}

export default class FaceCollection extends Array {
  /**
   * @param {RenderParam} param
   * @param {IContext} context
   * @returns {string}
   */
  render(param, context) {
    /** @type {string} */
    let retVal = null;
    if (this.length == 0) {
      retVal = param.data[0]?.toString();
      param.setRendered();
    } else {
      const currentRowType = param.rowType;
      const diagnosticFaces = this.filter(isDiagnosticFace);
      const shouldLogMatchDiagnostics =
        diagnosticFaces.length > 0 && isDiagnosticRow(param.data);
      /** @type {Face} */
      const firstMatchFace = this.find((x) => {
        /** @type {Face} */
        const current = x;
        return (
          current.relatedRows.indexOf(param.data) != -1 &&
          (current.rowType == FaceRowType.notset ||
            current.rowType == currentRowType) &&
          (current.levels == null ||
            current.levels.some((x) => param.levels.indexOf(x) != -1))
        );
      });
      if (shouldLogMatchDiagnostics) {
        console.warn("[face.match.diagnostic]", {
          row: summarizeRow(param.data),
          rowType: currentRowType,
          levels: param.levels,
          selectedFaceIndex: firstMatchFace?.debugIndex,
          candidates: Array.from(diagnosticFaces, (face) =>
              getFaceMatchDiagnostic(face, param.data, currentRowType, param.levels)
            )
            .slice(0, 20),
        });
      }
      if (firstMatchFace) {
        if (firstMatchFace.formattedContent) {
          const renderValues = getRenderValues(
            param.data,
            firstMatchFace.columns,
            firstMatchFace.sourceRows
          );
          retVal = StringUtil.format(
            firstMatchFace.formattedContent,
            renderValues
          );
          if (shouldLogMatchDiagnostics && isDiagnosticFace(firstMatchFace)) {
            console.warn("[face.render.selected]", {
              faceIndex: firstMatchFace.debugIndex,
              sourceId: firstMatchFace.sourceId,
              row: summarizeRow(param.data),
              renderValues: safePreview(renderValues, 500),
              output: safePreview(retVal, 700),
            });
          }
          if (
            firstMatchFace.formattedContent.includes("textlocation") &&
            (retVal?.includes(">{}</span>") ||
              retVal?.includes(">[object Object]</span>"))
          ) {
            console.warn("[face.render.diagnostic]", {
              template: safePreview(firstMatchFace.formattedContent),
              columns: firstMatchFace.columns ?? [],
              rowKeys: param.data ? Object.keys(param.data) : [],
              row: safePreview(param.data),
              renderableRow: safePreview(
                getRenderableData(param.data, firstMatchFace.sourceRows)
              ),
              renderValues: safePreview(renderValues),
              output: safePreview(retVal),
            });
          }
          if (firstMatchFace.applyReplace && param.replaces) {
            retVal = param.replaces.apply(retVal, context.cancellation);
          }
          if (firstMatchFace.applyFunction) {
            //TODO: apply function
          }
        }
        param.setRendered();
        if (param.mustApplyDivider && param.dividerTemplate) {
          retVal += param.dividerTemplate;
        }
        if (param.isEnd && param.incompleteTemplate) {
          let tmp = param.emptyCell;
          while (tmp > 0) {
            context.cancellation.throwIfCancellationRequested();
            retVal += param.incompleteTemplate;
            tmp--;
          }
        }
      } else {
        param.setIgnored();
      }
    }
    return retVal;
  }
}
