import fs from "fs";
import path, { resolve } from "path";
import IL from "./models/IL.mjs";
import { type } from "os";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";

class ConvertTORawHtml {
  constructor(configDir) {
    this.configDir = configDir;
    this.parserConfig;
    this.configObj;
  }

  async _getTheParserConfig(filePath) {
    const config = await this.readAllConfigFiles(this.configDir);
    const fileData = await fsPromises.readFile(filePath, "utf8");
    const json = JSON.parse(fileData);
    this.parserConfig = json;
    const renderingConfigAttributes = ["run", "renderto", "rendertype"];
    let result = config;
    for (let attribute of renderingConfigAttributes) {
      result = this.deletePropertyFromAttributes(result, attribute);
    }
    this.configObj = this.convertKeysToLowerCase(result);
  }
  readAllConfigFiles(configDir = this.configDir) {
    return new Promise(async (resolve, reject) => {
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const files = await fsPromises.readdir(__dirname + configDir);
        const jsonFiles = files.filter(
          (file) => path.extname(file) === ".json"
        );

        const result = {};

        for (const file of jsonFiles) {
          const filePath = path.join(__dirname + configDir, file);
          const fileData = await fsPromises.readFile(filePath, "utf8");
          const json = JSON.parse(fileData);

          // Merge the contents of the JSON file into the result object
          Object.assign(result, json);
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  async _readJSONFile(filePath) {
    const fileData = await fsPromises.readFile(filePath, "utf8");
    const json = JSON.parse(fileData);
    return json;
  }
  findElementInArray(value, array) {
    const index = array.indexOf(value);
    if (index !== -1) {
      return index;
    } else {
      return false;
    }
  }
  /**
   *
   * @param {IL} object
   * @returns {promise<string>|error}
   */
  async processIL(object) {
    return new Promise((resolve, reject) => {
      for (let childObject of object.Commands) {
        let childObjectResult;
        let finalString = "";
        if (
          !childObject ||
          childObject == {} ||
          Object.keys(childObject) == 0
        ) {
          continue;
        }
        if (childObject["$type"] == "htmltag") {
          childObjectResult = this._processHtmlTagType(childObject);
        } else if (childObject["$type"] == "rawtext") {
          childObjectResult = this._processRawTextType(childObject);
        } else if (!childObject["$type"]) {
          console.log(childObject);
          throw new Error(
            `type for one of objects with core of ${childObject["core"]} is not defined`
          );
        } else {
          childObjectResult = this._processBasisTagType(childObject);
        }
        finalString += childObjectResult;
      }
      resolve(childObjectResult);
    });
  }
  /**
   *
   * @param {object} obj
   * @returns {string}
   */
  objectToKeyValueString(obj) {
    if (Object.keys(obj).length === 0) {
      return "";
    }
    const array = Object.entries(obj).map(
      ([key, value]) => `${key}='${value}'`
    );
    return array.join(" ");
  }
  /**
   * @param {IL} object
   * @returns {string}
   */
  async _processHtmlTagType(object) {
    const finalContent =
      Array.isArray(object.content) 
        ? processArrayWithBindings(object)
        : object.content;
    const validHtmlTags = this.parserConfig.htmlTags;
    if ((validHtmlTags.length = 0)) {
      throw new Error("html tags is not available with this config");
    }
    const index = this.findElementInArray(object.core, validHtmlTags);
    if (index == false) {
      throw new Error("this core is not defiend in configuration");
    }
    const config = validHtmlTags[index];
    if (config.type == single) {
      return `<${config.tag} ${this.objectToKeyValueString(
        object.attributes
      )} />`;
    } else if (config["allow-content"] == false) {
      return `<${config.tag} ${this.objectToKeyValueString(
        object.attributes
      )} ></${config.tag}>`;
    } else {
      return `<${config.tag} ${this.objectToKeyValueString(
        object.attributes
      )} > ${finalContent}</${config.tag}>`;
    }
  }
  /**
   *
   * @param {array} Array
   */
  _processArrayWithBinding(Array) {
    let finalString = "";
    Array.forEach((element) => {
      if (typeof element == "string") {
        finalString += element;
      } else if (typeof element == "object") {
        for (let bindings of element.Params) {
          finalString += `[##${bindings.values.join(".")}##]`;
        }
      } else {
        throw new Error("Invalid Type");
      }
    });
  }
  /**
   * @param {IL} object
   * @returns {string}
   */
  async _processRawTextType(object) {
    const finalContent = Array.isArray(object.content)
      ? processArrayWithBindings(object)
      : object.content;
    return finalContent;
  }
  /**
   * @param {IL} object
   * @returns {string}
   */
  async _processBasisTagType(object) {
    let finalResult = `<basis core=${object.core}`;
    const objectConfig = this.configObj[object.core];
    const elementsConfig = objectConfig["Elements"];
    delete objectConfig["Elements"];
    for (let i in objectConfig.attributes) {
      if (objectConfig.attributes[i].To) {
        if (object[objectConfig.attributes[i].To]) {
          finalResult += `'${i}'='${object[objectConfig.attributes[i].To]} '`;
          delete object[objectConfig.attributes[i].To];
        } else {
          if (objectConfig.attributes[i].required == true) {
            throw new Error("the property required");
          }
        }
      } else {
        if (object.attributes[i]) {
          finalResult += `'${i}'='${object[i]}' `;
          delete object[i];
        } else {
          if (objectConfig.attributes[i].required == true) {
            throw new Error("the property required");
          }
        }
      }
    }
    if (objectConfig.AddExtraAttribute == true && object["extra-attribute"]) {
      for (let j in object["extra-attribute"]) {
        finalResult = `'${j}'='${object["extra-attribute"][j]}' `;
      }
      delete object["extra-attribute"];
    } else if (
      objectConfig.AddExtraAttribute == false &&
      object["extra-attribute"]
    ) {
      throw new Error("adding extra attributes not allowed");
    }
    if (object.content || object.Commands || elementsConfig) {
      finalResult += ">";
      if (object.content) {
        if (Array.isArray(object.content)) {
          finalResult += this._processArrayWithBinding(object.content);
          delete object.content;
        } else if (typeof object.content == "string") {
          finalResult += object.content;
          delete object.content;
        } else {
          throw new Error("unvalid object content");
        }
      }
      if (object.Commands) {
        finalResult += this.processIL(object);
        delete object.Commands;
      }
      if (
        elementsConfig &&
        Object.keys(elementsConfig).length !== 0 &&
        Object.keys(object).length !== 0
      ) {
        finalResult += this._processElements(elementsConfig, object);
      }
      finalResult += `</basis>`;
    } else {
      finalResult += `/>`;
    }
  }
  /**
   *
   * @param {object} elementsConfig
   * @param {object} object
   *
   * @returns {string}
   */
  _processElements(elementsConfig, object) {
    let result = "";
    for (let element in object) {
      for (let config in elementsConfig) {
        if (element == elementsConfig[config].To || element == config) {
          if (Array.isArray(object[element])) {
            object[element].forEach((subElement) => {
              const content = subElement.content;
              if (!content) {
                result += `<${config} ${this.objectToKeyValueString(
                  subElement
                )} />`;
              } else {
                delete subElement.content;
                result += `<${config} ${this.objectToKeyValueString(
                  subElement
                )} >`;
                if (typeof content == "string") {
                  result += content;
                } else if (Array.isArray(content)) {
                  result += this._processArrayWithBinding(content);
                }
              }
            });
          } else if (typeof object[element] == "object") {
            const content = object[element].content;
            if (!content) {
              result += `<${config} ${this.objectToKeyValueString(
                object[element]
              )} />`;
            } else {
              delete object[element].content;
              result += `<${config} ${this.objectToKeyValueString(
                object[element]
              )} >`;
              if (typeof content == "string") {
                result += content;
              } else if (Array.isArray(content)) {
                result += this._processArrayWithBinding(content);
              }
            }
          } else if (typeof object[element] == "string") {
            result += object[element];
          } else {
            throw new error(`invalid element "${element}" type`);
          }
        }
      }
    }
    return result;
  }

  /**
   *
   * @param {string} filepath
   * @param {string}resultPath
   * @param {}
   * @returns {promise<void>}
   */
  static async process(jsonName, resultName, parserConfig) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const convertTORawHtml = new ConvertTORawHtml("/configs");
      const jsonDir = path.join(__dirname, "result", jsonName + ".json");
      await convertTORawHtml._getTheParserConfig(
        path.join(__dirname, parserConfig)
      );
      const object = await convertTORawHtml._readJSONFile(jsonDir);
      const result = await convertTORawHtml.processIL(object);
      await fs.promises.writeFile(
        path.join(__dirname, "result", resultName + ".html"),
        result
      );
      return console.log("parsing IL was succsessful");
    } catch (error) {
      console.log(error);
    }
  }
  deletePropertyFromAttributes(obj, propertyName) {
    const newObj = {};
    const finalObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let property = obj[key];
        if (
          property.Attributes &&
          property.Attributes.hasOwnProperty(propertyName)
        ) {
          const { Attributes, ...rest } = property;
          newObj[key] = { ...rest, Attributes: { ...Attributes } };
          delete newObj[key].Attributes[propertyName];
        } else {
          newObj[key] = { ...property };
        }
      }
    }
    return newObj;
  }
  convertKeysToLowerCase(obj) {
    const newObj = {};

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowercaseKey = key.toLowerCase();
        newObj[lowercaseKey] = obj[key];
      }
    }

    return newObj;
  }
}

await ConvertTORawHtml.process("final", "htmresult", "./parserConfig.json");
