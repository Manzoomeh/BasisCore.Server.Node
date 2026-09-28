import Util from "../../Util.js";
import IContext from "../Context/IContext.js";
import IToken from "./IToken.js";
import SimpleTokenElement from "./SimpleTokenElement.js";
import SourceUtil from "../Source/SourceUtil.js";
import {
  getRequestTraceId,
  traceError,
  traceRequest,
} from "../../modules/requestTrace.js";

function resolveRootRequest(context) {
  const visited = new Set();
  let current = context;

  while (current && !visited.has(current)) {
    if (current._request) {
      return current._request;
    }
    visited.add(current);
    current = current._owner;
  }

  return null;
}

function toClientBinding(item) {
  const path = [item.source, item.member, item.column]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(".");
  return path ? `{##${path}##}` : "";
}

function serializeLegacyResult(data) {
  const rows = Array.isArray(data) ? data : [data];
  return JSON.stringify(
    rows.map((row) => {
      if (!row || typeof row !== "object") {
        return row;
      }
      const normalized = { ...row };
      delete normalized.RowNumber;
      return normalized;
    })
  );
}

function serializeColumnValue(value) {
  return value !== null && typeof value === "object"
    ? JSON.stringify(value)
    : Util.toString(value);
}

export default class ObjectToken extends IToken {
  /** @type {Array<SimpleTokenElement>} */
  elements;

  /**
   *
   * @param {Array<SimpleTokenElement>} elements
   */
  constructor(elements) {
    super();
    this.elements = elements;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  async getValueAsync(context) {
    let retVal = null;
    for (let i = 0; i < this.elements.length; i++) {
      const isLastItem = this.elements.length == i + 1;
      const item = this.elements[i];
      if (item.value) {
        retVal = item.value;
        break;
      } else {
        if (item.member) {
          const dataMember = `${item.source}.${item.member}`;
          let dataSource = context.tryGetSource(dataMember);
          if (dataSource == null) {
            if (isLastItem) {
              if (dataMember.startsWith("cms.")) {
                break;
              }
              if (context.preserveUnresolvedClientBindings) {
                const request = resolveRootRequest(context);
                const binding = toClientBinding(item);
                traceRequest("token.source.preserved", {
                  traceId: getRequestTraceId(request),
                  dataMember,
                  binding,
                });
                retVal = binding;
                break;
              }
              //Only Wait For Last Item in List
              const startedAt = Date.now();
              const request = resolveRootRequest(context);
              const tracePayload = {
                traceId: getRequestTraceId(request),
                dataMember,
                source: item.source || "",
                member: item.member || "",
                column: item.column || "",
              };
              traceRequest("token.source.wait.start", tracePayload);
              try {
                dataSource = await context.waitToGetSourceAsync(dataMember);
                context.cancellation.throwIfCancellationRequested();
                traceRequest("token.source.wait.done", {
                  ...tracePayload,
                  elapsedMs: Date.now() - startedAt,
                });
              } catch (error) {
                traceError("token.source.wait.error", error, {
                  ...tracePayload,
                  elapsedMs: Date.now() - startedAt,
                });
                throw error;
              }
            } else {
              continue;
            }
          }
          
          /**@type{string} */
          const tmpColumnName =
            Util.isNullOrEmpty(item.column) ||
            dataSource.columns.includes(item.column)
              ? item.column
              : SourceUtil.getExactColumnName(dataSource, item.column);
          const columnName = tmpColumnName ?? dataSource.columns[0];
          if (!dataSource.columns.includes(columnName)) {
            if (
              String(item.column || "").toLowerCase() === "result" &&
              Array.isArray(dataSource.data)
            ) {
              retVal = serializeLegacyResult(dataSource.data);
              break;
            }
            if (isLastItem) {
              break;
            } else {
              continue;
            }
          }
          if (dataSource.data.length == 1) {
            const columnRawValue = dataSource.data[0][columnName]
            const columnValue = serializeColumnValue(columnRawValue);
            if (Util.isNullOrEmpty(columnRawValue)) {
              //if value in source is null or blank,process next source
              if (!isLastItem) {
                continue;
              }
            } else {
              retVal = columnValue;
              break;
            }
          } else if (dataSource.data.length > 1) {
            try {
              retVal = dataSource.data
                .map((x) => {
                  const columnValue = x[columnName];
                  return typeof columnValue === "string"
                    ? `'${columnValue}'`
                    : serializeColumnValue(columnValue);
                })
                .join(",");
            } catch {
              /*Nothing*/
            }
          }
        } else {
          if (!Util.isNullOrEmpty(item.source)) {
            const isOk = await context.checkConnectionAsync(item.source);
            retVal = isOk.toString();
          }
        }
      }
    }
    return retVal;
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return true;
  }
}
