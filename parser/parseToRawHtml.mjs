import fs from "fs";
import path from "path";
import IL from "./models/IL.mjs";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";

class ConvertTORawHtml {
  parserConfig;
  configObj;
  configDir;
  constructor(configDir) {
    this.configDir = configDir;
  }

  async _getTheParserConfig(filePath) {
    const config = await this.readAllConfigFiles(this.configDir);
    const fileData = await fsPromises.readFile(filePath, "utf8");
    this.parserConfig = JSON.parse(fileData);
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
  /**
   *
   * @param {string} value
   * @param {array} array
   * @returns {number|boolean}
   */
  findElementInArray(value, array) {
    for (let index in array) {
      let object = array[index];
      if (value == object.tag) {
        return index;
      }
    }
    return -1;
  }
  /**
   *
   * @param {IL} object
   * @returns {promise<string>|error}
   */
  async processIL(object) {
    return new Promise(async (resolve, reject) => {
      let finalString = "";
      for (let childObject of object.Commands) {
        let childObjectResult;

        if (
          !childObject ||
          childObject == {} ||
          Object.keys(childObject) == 0
        ) {
          continue;
        }
        if (childObject["$type"] == "htmltag") {
          childObjectResult = await this._processHtmlTagType(childObject);
        } else if (childObject["$type"] == "rawtext") {
          childObjectResult = await this._processRawTextType(childObject);
        } else if (!childObject["$type"]) {
          throw new Error(
            `type for one of objects with core of ${childObject["core"]} is not defined`
          );
        } else {
          childObjectResult = await this._processBasisTagType(childObject);
        }
        finalString += childObjectResult;
      }
      resolve(finalString);
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
   * @returns {promise<string>}
   */
  async _processHtmlTagType(object) {
    return new Promise((resolve, reject) => {
      const finalContent = Array.isArray(object.content)
        ? this._processArrayWithBinding(object.content)
        : object.content;
      const validHtmlTags = this.parserConfig.htmlTags;
      if (validHtmlTags.length == 0) {
        throw new Error("html tags is not available with this config");
      }
      const index = this.findElementInArray(object.core, validHtmlTags);
      if (index == -1) {
        throw new Error(
          `this core ${object.core} is not defiend in configuration`
        );
      }
      const config = validHtmlTags[index];
      if (config.type == "single") {
        resolve(
          `<${config.tag} ${this.objectToKeyValueString(object.attributes)} />`
        );
      } else if (config["allow-content"] == false) {
        resolve(
          `<${config.tag} ${this.objectToKeyValueString(
            object.attributes
          )} ></${config.tag}>`
        );
      } else {
        resolve(
          `<${config.tag} ${this.objectToKeyValueString(
            object.attributes
          )} > ${finalContent}</${config.tag}>`
        );
      }
    });
  }
  /**
   *
   * @param {array} content
   */
  _processArrayWithBinding(content) {
    let finalString = "";
    content.forEach((element) => {
      if (typeof element == "string") {
        finalString += element;
      } else if (typeof element == "object") {
        finalString+= `[##`;
        for (let bindings of element.Params) {
          finalString += `${bindings.Source}.${bindings.Member}.${bindings.Column}|`;
        }
        if (element.Value) {
          finalString += `(${element.Value})`;
        }
        finalString += `##]`
      } else {
        throw new Error("Invalid Type");
      }
    });
    console.log(finalString)
    return(finalString)
  }
  /**
   * @param {IL} object
   * @returns {promise<string>}
   */
  async _processRawTextType(object) {
    return new Promise((resolve, reject) => {
      const finalContent = Array.isArray(object.content)
        ? this._processArrayWithBinding(object.content)
        : object.content;
      resolve(finalContent);
    });
  }
  /**
   * @param {IL} object
   * @returns {promise<string>}
   */
  async _processBasisTagType(object) {
    return new Promise(async (resolve, reject) => {
      let finalResult = `<basis core='${object.core}'`;
      const objectConfig = this.configObj[object.core];
      delete object.core;
      delete objectConfig.core;
      const elementsConfig = objectConfig["Elements"];
      for (let i in objectConfig.Attributes) {
        if (objectConfig.Attributes[i].To) {
          if (object[objectConfig.Attributes[i].To]) {
            if (typeof objectConfig.Attributes[i].To == "object") {
              let finalString = `'${i}=[##`;
              for (let bindings of objectConfig.Attributes[i].To.Params) {
                finalString += `${bindings.Source}.${bindings.Member}.${bindings.Column}|`;
              }
              if (objectConfig.Attributes[i].To.Value) {
                finalString += `(${objectConfig.Attributes[i].To.Value})`;
              }

              finalResult += finalString.slice(0, -1) + `##] '`;
              delete object[objectConfig.Attributes[i].To];
            } else {
              finalResult += `${i}='${object[objectConfig.Attributes[i].To]} '`;
              delete object[objectConfig.Attributes[i].To];
            }
          } else {
            if (objectConfig.Attributes[i].required == true) {
              throw new Error("the property required");
            }
          }
        } else {
          if (objectConfig.Attributes[i]) {
            if (!object[i]) {
              if (objectConfig.Attributes[i].required == true) {
                throw new Error("the property required");
              }
              continue;
            }
            if (typeof object[i] == "object") {
              let finalString = `${i}='[##`;
              for (let bindings of object[i].Params) {
                finalString += `${bindings.Source}.${bindings.Member}.${bindings.Column}|`;
              }
              if (element.Value) {
                finalString += `(${object[i].Value})`;
              }
              finalResult += finalString.slice(0, -1) +`##]' `;

              delete object[i];
            } else {
              finalResult += `${i}='${object[i]}' `;
              delete object[i];
            }
          }
        }
      }
      if (objectConfig.AddExtraAttribute == true && object["extra-attribute"]) {
        for (let j in object["extra-attribute"]) {
          if (typeof object["extra-attribute"][j] == "object") {
            let finalString = `${j}='[##`;
            for (let bindings of object["extra-attribute"][j].Params) {
              finalString += `${bindings.Source}.${bindings.Member}.${bindings.Column}|`;
            }
            if (object["extra-attribute"][j].Value) {
              finalString += `(${object["extra-attribute"][j].Value})`;
            }

              finalResult += finalString.slice(0, -1) + `##]'`;
          } else {
            finalResult += `${j}='${object["extra-attribute"][j]}' `;
          }
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
          finalResult += await this._processElements(elementsConfig, object);
        }
        finalResult += `</basis>`;
      } else {
        finalResult += `/>`;
      }
      resolve(finalResult);
    });
  }
  /**
   *
   * @param {object} elementsConfig
   * @param {object} object
   *
   * @returns {promise<string>}
   */
  _processElements(elementsConfig, object) {
    return new Promise((resolve, reject) => {
      let result = "";
      for (let element in object) {
        for (let config in elementsConfig) {
          if (element == elementsConfig[config].To || element == config) {
            if (Array.isArray(object[element])) {
              object[element].forEach((subElement) => {
                let extraAttrString = "";
                if (
                  elementsConfig[config].AddExtraAttribute == true &&
                  subElement["extra-attributes"]
                ) {
                  for (let j in subElement["extra-attributes"]) {
                    extraAttrString += `${j}='${subElement["extra-attributes"][j]}' `;
                  }
                  delete subElement["extra-attributes"];
                } else if (
                  elementsConfig[config].AddExtraAttribute == false &&
                  subElement["extra-attributes"]
                ) {
                  throw new Error("adding extra attributes not allowed");
                }
                const content = subElement.content;
                if (!content) {
                  result += `<${config} ${this.objectToKeyValueString(
                    subElement
                  )} ${extraAttrString}/>`;
                } else {
                  delete subElement.content;
                  result += `<${config} ${this.objectToKeyValueString(
                    subElement
                  )} ${extraAttrString}>`;
                  if (typeof content == "string") {
                    result += content + `</${config}>`;
                  } else if (Array.isArray(content)) {
                    result +=
                      this._processArrayWithBinding(content) + `</${config}>`;
                  }
                }
              });
            } else if (typeof object[element] == "object") {
              let extraAttrString = "";
              if (
                elementsConfig[element].AddExtraAttribute == true &&
                object[element]["extra-attributes"]
              ) {
                for (let j in object[element]["extra-attributes"]) {
                  extraAttrString += `${j}='${object[element]["extra-attributes"][j]}' `;
                }
                delete object[element]["extra-attributes"];
              } else if (
                elementsConfig[element].AddExtraAttribute == false &&
                object[element]["extra-attributes"]
              ) {
                throw new Error("adding extra attributes not allowed");
              }
              const content = object[element].content;
              if (!content) {
                result += `<${config} ${this.objectToKeyValueString(
                  object[element]
                )} ${extraAttrString}/>`;
              } else {
                delete object[element].content;
                result += `<${config} ${this.objectToKeyValueString(
                  object[element]
                )} ${extraAttrString}>`;
                if (typeof content == "string") {
                  result += content + `</${config}>`;
                } else if (Array.isArray(content)) {
                  result +=
                    this._processArrayWithBinding(content) + `</${config}>`;
                }
              }
            } else if (typeof object[element] == "string") {
              result += object[element] + `</${config}>`;
            } else {
              throw new error(`invalid element "${element}" type`);
            }
          }
        }
      }
      resolve(result);
    });
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
  detectBasisTags(object) {
    return new Promise(async (resolve, reject) => {
      let finalArray = [];
      let childObject;
      for (let index in object.Commands) {
        childObject = object.Commands[index];

        if (
          !childObject ||
          childObject == {} ||
          Object.keys(childObject) == 0
        ) {
          continue;
        }
        if (childObject["$type"] == "htmltag") {
          continue;
        } else if (childObject["$type"] == "rawtext") {
          continue;
        } else if (!childObject["$type"]) {
          throw new Error(
            `type for one of objects with core of ${childObject["core"]} is not defined`
          );
        } else {
          const resultString = await this._processBasisTagType(childObject);
          let childObjectResult = {
            basis: resultString,
            index,
          };
          finalArray.push(childObjectResult);
        }
      }
      resolve(finalArray);
    });
  }
  /**
   *
   * @param {string} filepath
   * @param {string}resultPath
   * @param {string}parserConfig
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

  /**
   *
   * @param {string} filepath
   * @param {string}resultPath
   * @param {string}parserConfig
   * @returns {promise<void>}
   */
  static async findBasisTags(jsonName, resultName, parserConfig) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const convertTORawHtml = new ConvertTORawHtml("/configs");
      const jsonDir = path.join(__dirname, "result", jsonName + ".json");
      await convertTORawHtml._getTheParserConfig(
        path.join(__dirname, parserConfig)
      );
      const object = await convertTORawHtml._readJSONFile(jsonDir);
      const result = await convertTORawHtml.detectBasisTags(object);
      await fs.promises.writeFile(
        path.join(__dirname, "result", resultName + ".json"),
        JSON.stringify(result)
      );
      return console.log("detecting JSON was succsessful");
    } catch (error) {
      console.log(error);
    }
  }
}

await ConvertTORawHtml.process("final", "htmresult", "./parserConfig.json");
await ConvertTORawHtml.findBasisTags(
  "final",
  "htmresult",
  "./parserConfig.json"
);
