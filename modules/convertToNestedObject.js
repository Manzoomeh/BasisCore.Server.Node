import JsonSingleValue from "../Models/JsonSingleValue.js";
import JsonValue from "../Models/JsonValue.js";
import JsonArray from "../Models/JsonArray.js";
import ArrayObject from "../Models/ArrayObject.js";
import JsonObject from "../Models/JsonObject.js";
import FormJsonPart from "../Models/FormJsonPart.js";
import { ModelObject } from "../Models/ModelObject.js";
/**
 * @param {FormJsonPart[]} parts
 * @returns
 */
function ConvertFormJsonPartToJsonObject(parts) {
  let retVal = null;

  const execute = (jsonObj, parents, value) => {
    if (parents === null) {
      throw new Error("Invalid Path");
    }

    if (parents.length === 1) {
      jsonObj.Properties.push(new JsonSingleValue(parents[0], value));
    } else {
      if (retVal === null) {
        jsonObj = retVal = new JsonValue(parents[0]);
      }

      let newParent = jsonObj.Find(parents[0]);

      if (newParent === null) {
        if (parents[0].includes("__")) {
          const groupName = parents[0].split("__")[0];
          let arrayParent = jsonObj.Find(groupName);

          if (arrayParent === null) {
            arrayParent = new JsonArray(groupName);
            jsonObj.Properties.push(arrayParent);
          }

          newParent = new ArrayObject(parents[0]);
          arrayParent.Properties.push(newParent);
        } else {
          newParent = new JsonObject(parents[0]);
          jsonObj.Properties.push(newParent);
        }
      }

      execute(newParent, parents.slice(1), value);
    }
  };

  for (const part of parts) {
    execute(retVal, part.Parents, part.Value);
  }

  return JSON.stringify(convert(retVal));
}
function convertToNestedStructure(array) {
  const parts = array.map((element) => {
    for (let property in element) {
      return new FormJsonPart(property, element[property]);
    }
  });
  return ConvertFormJsonPartToJsonObject(parts);
}
export function convertObjectToNestedStructure(object) {
  const parts = [];
  for (let property in object) {
    parts.push(new FormJsonPart(property, object[property]));
  }
  return ConvertFormJsonPartToJsonObject(parts);
}

/**
 *
 * @param {ModelObject} object
 */
function convert(object) {
  let val = [];
  const name = object.Name;
  const properties = object.Properties;
  if (name.includes("__")) {
    let inner_obj = {};
    for (let element of properties) {
      inner_obj = { ...inner_obj, ...convert(element) };
    }
    return inner_obj;
  } else {
    if (properties.length > 0) {
      for (let element of properties) {
        if (element.Name.includes("__")) {
          val.push(convert(element));
        } else {
          if (Array.isArray(val)) {
            val = {};
          }
          const convertedElement = convert(element);
          for (let key in convertedElement) {
            let value = convertedElement[key];
            val[key] = value;
          }
        }
      }
    } else {
      val = object.Value;
    }
  }
  const ret_val = {};
  ret_val[name.toLowerCase()] = val;
  return ret_val;
}
export default convertToNestedStructure;
