import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import IL from "./models/IL.mjs";
import { promises as fsPromises } from "fs";
class HTMLParser {
  constructor(htmlDir, configDir) {
    this.htmlDir = htmlDir;
    this.position = 0;
    this.state = this.parseText;
    this.currentToken = null;
    this.tokens = [];
    this.html;
    this.configDir = configDir;
    this.configObj;
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

  async getTheParserConfig() {
    const config = await this.readAllConfigFiles(this.configDir);
    const renderingConfigAttributes = ["run", "renderto", "rendertype"];
    let result = config;
    for (let attribute of renderingConfigAttributes) {
      result = this.deletePropertyFromAttributes(result, attribute);
    }
    this.configObj = this.convertKeysToLowerCase(result);
  }
  readAllConfigFiles(configDir) {
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
  validateHTMLFilePath(filePath) {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const extname = path.extname(filePath);
    if (extname !== ".html") {
      return false;
    }
    return true;
  }
  /**
   * Escapes special characters in the HTML content before writing to the file.
   * @param {string} content - The HTML content to escape.
   * @returns {string} - The escaped HTML content.
   */
  escapeHTMLBeforeWrite(content) {
    return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Unescapes special characters in the HTML content after reading from the file.
   * @param {string} content - The HTML content to unescape.
   * @returns {string} - The unescaped HTML content.
   */
  unescapeHTMLAfterRead(content) {
    return content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  }

  /**
   * @param {string} data
   * @returns {Promise<void>}
   */
  async writeJsonFile(data, filePath) {
    try {
      const escapedData = this.escapeHTMLBeforeWrite(JSON.stringify(data));
      await fsPromises.writeFile(filePath, escapedData, "utf8");
    } catch (error) {
      throw new Error(error.stack);
    }
  }

  async readHtmlFile() {
    return new Promise((resolve, reject) => {
      try {
        if (this.validateHTMLFilePath(this.htmlDir)) {
          fs.readFile(this.htmlDir, "utf8", async (error, data) => {
            if (error) {
              reject(error);
            } else {
              const html = this.removeComments(data);

              this.html = this.unescapeHTMLAfterRead(
                html.replace(/\n\s*\n/g, "\n")
              );
              resolve();
            }
          });
        } else {
          reject("file not found or file is not html");
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  removeComments(content) {
    return content.replace(/<!--[\s\S]*?-->/g, "");
  }
  /**
   * @param {string} data
   * @returns {promise<void>}
   */
  writeJsonFile(data, filePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), "utf8", (error) => {
        if (error) {
          throw new Error(error.stack);
        } else {
          resolve();
        }
      });
    });
  }
  parse() {
    while (this.position < this.html.length) {
      this.state();
    }
    return this.tokens;
  }

  parseText() {
    const tagStart = this.html.indexOf("<", this.position);

    if (tagStart === this.position) {
      this.state = this.parseTag;
      return;
    }

    if (tagStart === -1) {
      const text = this.html.slice(this.position);
      this.tokens.push({ type: "text", value: text });
      this.position = this.html.length;
      return;
    }

    const text = this.html.slice(this.position, tagStart);
    this.tokens.push({ type: "text", value: text });
    this.position = tagStart;
  }

  parseTag() {
    let single = false;
    const tagEnd = this.html.indexOf(">", this.position);
    if (tagEnd === -1) {
      throw new Error("Invalid HTML: unclosed tag");
    }

    const tagText = this.html.slice(this.position + 1, tagEnd);
    const [tagName, ...attributes] = tagText.split(" ");
    const attributeMap = {};

    for (let attr of attributes) {
      let [attrName, attrValue] = attr.split("=");

      // Check if the attribute has a value
      if (attrValue) {
        attributeMap[attrName] = attrValue.replace(/['"]/g, "");
      } else {
        continue;
      }
    }

    // Check if it's a self-closing tag
    if (tagText.endsWith("/")) {
      single = true;
    }

    if (single === true) {
      if ("/" in attributeMap) {
        delete attributeMap["/"];
      }
      this.tokens.push({
        type: "tag",
        name: tagName,
        attributes: attributeMap,
        tagType: "single",
      });
    } else {
      this.tokens.push({
        type: "tag",
        name: tagName,
        attributes: attributeMap,
        tagType: "double",
      });
    }

    this.position = tagEnd + 1;
    this.state = this.parseText;
  }

  objectToKeyValueString(obj) {
    if (Object.keys(obj).length === 0) {
      return "";
    }
    const array = Object.entries(obj).map(([key, value]) => `${key}=${value}`);
    return array.join(" ");
  }

  async processTags(array) {
    return new Promise(async (resolve, reject) => {
      try {
        const resultArray = [];
        let tempArray = [];
        let basisNumber = 0;
        let tempObject = { basis: true };

        if (array.length > 0) {
          array.forEach((object) => {
            if (object.type === "tag") {
              if (object.name === "basis" || /^basis:g\d+$/.test(object.name)) {
                if (object.tagType === "single") {
                  resultArray.push(tempArray);
                  tempArray = [];
                  tempObject.attributes = object.attributes;
                  tempObject.content = [];
                  resultArray.push(tempObject);
                  tempObject = { basis: true };
                } else {
                  basisNumber += 1;
                  if (basisNumber === 1) {
                    resultArray.push(tempArray);
                    tempArray = [];
                    tempObject.attributes = object.attributes;
                  } else {
                    tempArray.push(object);
                  }
                }
              } else if (object.name === "/basis") {
                basisNumber -= 1;
                if (basisNumber === 0) {
                  tempObject.content = tempArray;
                  tempArray = [];
                  resultArray.push(tempObject);
                  tempObject = { basis: true };
                } else {
                  tempArray.push(object);
                }
              } else {
                tempArray.push(object);
              }
            } else if (object.type === "text") {
              tempArray.push(object);
            }
          });

          if (tempArray.length > 0) {
            resultArray.push(tempArray);
            tempArray = [];
          }
        } else {
          resolve([]);
          return;
        }
        const result = [];
        for (let i = 0; i < resultArray.length; i++) {
          let item = resultArray[i];

          if (
            item.basis === true &&
            item.content &&
            item.content.length > 0 &&
            this.hasElementWithKeyValue(item.content, "name", "basis")
          ) {
            let content = await this.processTags(item.content);
            item.content = content;
          }

          result.push(item);
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  hasElementWithKeyValue(array, key, value) {
    for (const obj of array) {
      if (obj.hasOwnProperty(key) && obj[key] === value) {
        return true;
      }
    }
    return false;
  }
  async processArray(array) {
    const childrenArray = [];

    for (const item of array) {
      if (Array.isArray(item) && item.length > 0) {
        let partResults = await this.processRawTextArray(item);
        if (partResults != null) {
          childrenArray.push(partResults);
        }
      } else {
        if (item.basis === true) {
          let partResults = await this.processBasisTags(item);
          childrenArray.push(partResults);
        }
      }
    }
    const rootObject = new IL();
    rootObject.$type = "group";
    rootObject.core = "group";
    rootObject.name = "ROOT_GROUP";
    rootObject.commands = childrenArray;
    rootObject.content = [];
    return rootObject;
  }
  processRawTextArray(array) {
    return new Promise(async (resolve, reject) => {
      let rawTextString = "";
      let keyValueString = "";
      let rawTextObject = {};
      let rawTextResultContent;
      array.forEach(async (subItem) => {
        if (!subItem || !subItem.type) {
          return;
        } else {
          if (subItem.type == "tag") {
            rawTextString += `<${subItem.name}` + " ";
            if (Object.keys(subItem.attributes).length > 0) {
              keyValueString = this.objectToKeyValueString(subItem.attributes);
              rawTextString += keyValueString + " ";
            }
            if (subItem.tagType === "single") {
              rawTextString += "/>";
            } else {
              rawTextString += " >";
            }
          } else if (subItem.type == "text") {
            if (subItem.value.trim() === "") {
              // If the string consists of whitespace only, do nothing (continue)
              return;
            } else {
              // If the string is not empty or contains non-whitespace characters, return the value
              rawTextString += subItem.value;
            }
          }
        }
      });
      rawTextObject = new IL();
      rawTextObject.$type = "rawtext";
      rawTextObject.core = "rawtext";
      if (rawTextString !== "" && rawTextString) {
        rawTextResultContent = this.splitByBindings(rawTextString);
        rawTextString = "";
        rawTextObject.content = rawTextResultContent;
        resolve(rawTextObject);
        rawTextObject = {};
      } else {
        resolve();
      }
    });
  }
  processBasisTags(object) {
    return new Promise(async (resolve, reject) => {
      try {
        const config = this.configObj[object.attributes.core];
        let coreForError;
        coreForError = object.attributes.core;
        if (object.attributes.core == undefined) {
          throw new Error(`the core is required `);
        }
        if (!config) {
          throw new Error(`the config for ${coreForError} is not defined`);
        }
        let result = new IL();
        if (config.Attributes.core && object.attributes.core) {
          result.$type = object.attributes.core;
        }
        for (let key in config.Attributes) {
          if (config.Attributes.hasOwnProperty(key)) {
            let value = object.attributes[key];

            const attributeConfig = config.Attributes[key];
            if (attributeConfig.Required && attributeConfig.Required === true) {
              if (!value) {
                throw new Error(
                  `Required attribute ${key} is missing in ${coreForError}`
                );
              }
            }

            if (!value) {
              continue;
            }
            if (value.startsWith("[##") && value.endsWith("##]")) {
              value = value.slice(3, -3).split(".");
              if (value.length > 3 || value.length < 3) {
                throw new Error("invalid binding expression");
              }
              let [source, member, columnWithDefault] = value;
              let column;
              let defaultValue;
              if (columnWithDefault.includes("|")) {
                [column, defaultValue] = columnWithDefault.split("|");
              } else {
                column = columnWithDefault;
              }
              if (!defaultValue) {
                value = {
                  params: [{ Source: source, Member: member, Column: column }],
                };
              } else {
                value = {
                  params: [
                    { Source: source, Member: member, Column: column },
                    { value: defaultValue },
                  ],
                };
              }
            }
            if (attributeConfig.To) {
              result.addCustomProperty(attributeConfig.To, value);
              delete object.attributes[key];
            } else {
              result.addCustomProperty(key, value);
              delete object.attributes[key];
            }
          }
        }
        const keys = Object.keys(object.attributes);
        if (keys.length > 0) {
          if (config.AddExtraAttribute == true) {
            for (let key of keys) {
              result.addExtraAttribute(key, object.attributes[key]);
            }
          }
        }
        if (!this.configObj[coreForError].Elements) {
          resolve(result);
          return;
        }

        result = await this.processBasisContent(
          object.content,
          this.configObj[coreForError].Elements,
          result
        );
        resolve(result);
      } catch (error) {
        console.log(error.stack);
        reject(error);
      }
    });
  }

  async processBasisContent(content, elements, il) {
    //    try {
    const elementsKeys = Object.keys(elements);
    if (!elements || elementsKeys.length === 0) {
      return il;
    }
    let tempAttributes = {content : ""}
    let elementMultiState = elementsKeys.reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});
    let elementsState = "";
    for (let item of content) {
      if (item.basis === true) {
        let result = await this.processBasisTags(item);
        if (!il.content) {
          il.content = [];
        }
        il.content.push(result);
      } else {
        if (item.type == "text") {
          if (elementsState.trim() !== "") {
            tempAttributes.content += item.value;
          } else {
            continue;
          }
        } else if (item.type == "tag") {
          if (item.tagType === "double") {
            if (item.name.startsWith("/")) {
              if (
                //elementsKeys.includes(item.name) ||
                elementsKeys.includes(item.name.slice(1)) &&
                elementsState == item.name.slice(1)
              ) {
                elementsState = "";
                let finalAttributes = {};
                if (
                  typeof elements[item.name.slice(1)].Attributes == "object"
                ) {
                  if (
                    Object.keys(elements[item.name.slice(1)].Attributes)
                      .length > 0
                  ) {
                    for (let attrKey in tempAttributes) {
                      if (attrKey in elements[item.name.slice(1)].Attributes) {
                        let attrConfig =
                          elements[item.name.slice(1)].Attributes[attrKey];
                        console.log(attrConfig);
                        if (attrConfig.To) {
                          finalAttributes[attrConfig.TO] =
                            tempAttributes[attrKey];
                        } else {
                          finalAttributes[attrKey] = tempAttributes[attrKey];
                        }
                        const requiredAttributes = Object.keys(
                          elements[item.name.slice(1)].Attributes
                        ).filter((key) => {
                          return (
                            elements[item.name.slice(1)].Attributes[key][
                              "Required"
                            ] === true
                          );
                        });
                        this.checkProperties(
                          tempAttributes,
                          requiredAttributes
                        );
                        if (
                          Array.isArray(attrConfig.values) &&
                          !attrConfig.values.includes(tempAttributes[attrKey])
                        ) {
                          throw new Error(
                            `the correct value for ${attrKey} is values like ${attrConfig.values}`
                          );
                        }
                        let missingProperties = this.findMissingProperties(
                          tempAttributes,
                          attrConfig
                        );
                        if (
                          attrConfig.AddExtraAttribute &&
                          missingProperties.length > 0
                        ) {
                          for (let missingProperty of missingProperties) {
                            finalAttributes["extra-attribute"][
                              missingProperty
                            ] = tempAttributes[missingProperties];
                          }
                        }
                      }
                    }
                    console.log(item.name.slice(1));
                    if (typeof item.name.slice(1) == "string") {
                      if (elements[item.name.slice(1)].To) {
                        if (!il[elements[item.name.slice(1)].To]) {
                          il[elements[item.name.slice(1)].To] = [];
                        }
                        il[elements[item.name.slice(1)].To].push(
                          finalAttributes
                        );
                      } else {
                        if (!il[elements[item.name.slice(1)]]) {
                          il[elements[item.name.slice(1)]] = [];
                        }
                        il[item.name.slice(1)].push(finalAttributes);
                      }
                    }
                  }
                }
                if (elements[item.name.slice(1)].TO) {
                  if (
                    elements[item.name.slice(1)] &&
                    elements[item.name.slice(1)].Multi == true
                  ) {
                    if (!il.hasOwnProperty(item.name)) {
                      il[elements[item.name.slice(1)].TO] = [];
                    }
                    if (tempAttributes.content == "") {
                      if (elements[item.name]["To"]) {
                        if (il[elements[item.name]["To"]] == undefined) {
                          il[elements[item.name]["To"]] = [];
                        }
                        il[elements[item.name]["To"]].push(tempAttributes);
                      } else {
                        if (il[item.name] == undefined) {
                          il[item.name] = [];
                        }
                        il[item.name].push(tempAttributes);
                      }
                    } else {
                      elementsState = "";
                    }
                  } else {
                    if (tempAttributes.content == "") {
                      if (elements[item.name]["To"]) {
                        if (il[elements[item.name]["To"]] == undefined) {
                          il[elements[item.name]["To"]] = [];
                        }
                        il[elements[item.name]["To"]].push(tempAttributes);
                        tempAttributes = {};
                      } else {
                        if (il[item.name] == undefined) {
                          il[item.name] = [];
                        }
                        il[item.name].push(tempAttributes);
                        tempAttributes = {};
                      }
                    } else {
                      il[elements[item.name.slice(1)].TO] = tempAttributes.content;
                      tempAttributes.content = "";
                      elementsState = "";
                    }
                  }
                } else {
                  if (
                    elements[item.name.slice(1)] &&
                    elements[item.name.slice(1)].Multi == true
                  ) {
                    if (!il.hasOwnProperty(item.name)) {
                      il[item.name.slice(1)] = [];
                    }
                    if (tempAttributes.content == "") {
                      if (elements[item.name.slice(1)]["To"]) {
                        if (
                          il[elements[item.name.slice(1)]["To"]] == undefined
                        ) {
                          il[elements[item.name.slice(1)]["To"]] = [];
                        }
                        il[elements[item.name.slice(1)]["To"]].push(
                          tempAttributes
                        );
                        tempAttributes = {};
                      } else {
                        if (il[item.name] == undefined) {
                          il[item.name] = [];
                        }
                        il[item.name].push(tempAttributes);
                        tempAttributes = {};
                      }
                    } else {
                      il[item.name.slice(1)].push(tempAttributes.content);
                    }
                    tempAttributes = {};
                    tempAttributes.content = "";
                    elementsState = "";
                  } else {
                    if(elements[item.name.slice(1)].TO){
                      if(il[elements[item.name.slice(1)].TO]){
                        il[elements[item.name.slice(1)].TO] = tempAttributes.content
                      }else{
                        il[elements[item.name.slice(1)].TO] = tempAttributes.content
                      }
                    }
                    if(!il[item.name.slice(1)]){
                      il[item.name.slice(1)] ={}
                    }
                    il[item.name.slice(1)].content = tempAttributes.content;
                    tempAttributes.content = "";
                    elementsState = "";
                  }
                }
              } else {
                tempAttributes.content += `<${item.name}` + " ";
                if (Object.keys(item.attributes).length > 0) {
                  keyValueString = this.objectToKeyValueString(item.attributes);
                  tempAttributes.content += keyValueString + " ";
                }
                if (item.tagType === "single") {
                  tempAttributes.content += "/>";
                } else {
                  tempAttributes.content += " >";
                }
              }
              if (
                elementsKeys.some((key) => key === item.name) &&
                elementsState == item.name
              ) {
              }
            } else {
              elementsState = `${item.name}`;
              elementMultiState[item.name] += 1;
              tempAttributes = item.attributes;
            }
          } else {
            if (elementsKeys.includes(item.name) && elementsState == "") {
              if (elements[item.name]["To"]) {
                if (il[elements[item.name]["To"]] == undefined) {
                  il[elements[item.name]["To"]] = [];
                }
                il[elements[item.name]["To"]].push(item.attributes);
              } else {
                if (il[item.name] == undefined) {
                  il[item.name] = [];
                }
                il[item.name].push(item.attributes);
              }
            }
          }
          if (!elements[item.name]) {
            if (elements[item.name] == undefined) {
              let trueProperties = Object.entries(elementsState)
                .filter(([key, value]) => value === true)
                .map(([key, value]) => key);
              if (1 > trueProperties.length > 0) {
                const nestedElementConfig = elements[trueProperties[0]];
                for (let attribute in nestedElementConfig) {
                  if (
                    attribute.Required == true &&
                    !item.attributes[attribute]
                  ) {
                    throw new Error(
                      `Required attribute ${attribute} is missing in ${item.name}`
                    );
                  }
                  if (attribute.To) {
                    if (!il[attribute.To]) {
                      il[elementsKeys[trueProperties[0]]][`${attribute}`] =
                        item.attributes[attribute];
                    } else {
                      il[elementsKeys[trueProperties[0]]][attribute.To].push(
                        item.attributes[attribute]
                      );
                    }
                    delete item.attributes[attribute];
                  }
                  il[attribute] = item.attributes[attribute];
                }
              } else if (trueProperties.length > 1) {
                throw new Error("cannot be on two element state");
              } else {
                throw new Error("this tag is not defined in basis config");
              }
            }
          }
          if (elements[item.name] && elements[item.name].Multi == true) {
            if (elementMultiState[item.name] == 1) {
              if (Array.isArray(il[item.name]) && il[item.name].length == 1) {
                throw new Error(
                  `${item.name} is already defined and in basis you can only define one of them`
                );
              }
            }
          }
        }
      }
    }
    return il;
    //    } catch (error) {
    //throw new Error(error);
    //    }
  }
  findMissingProperties(object1, object2) {
    const object1Keys = Object.keys(object1);
    const missingKeys = object1Keys.filter(
      (key) => !object2.hasOwnProperty(key)
    );
    return missingKeys;
  }
  checkProperties(obj, propertiesArray) {
    for (const property of propertiesArray) {
      if (!obj.hasOwnProperty(property)) {
        throw new Error(`Object is missing the property "${property}"`);
      }
    }
  }
  getKeyByValue(obj, value) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === value) {
        return key;
      }
    }
    return null; // Return null if the value is not found in any property
  }
  splitStringByPattern(inputString) {
    const regex = /\[##|##\]/g;
    const elements = inputString.split(regex);

    // Process the elements array and join empty strings with the next element
    for (let i = elements.length - 1; i > 0; i--) {
      if (elements[i] === "") {
        elements[i - 1] += elements.splice(i, 1)[0];
      }
    }
    return elements;
  }
  splitByBindings(string) {
    const resultArray = [];
    let object = {};
    const splitedArray = this.splitStringByPattern(string);
    if (splitedArray.length == 1) {
      return string;
    }
    for (let i = 0; i < splitedArray.length; i++) {
      if ((i + 1) % 2 == 0) {
        let column;
        let value;

        let bindingsArray = splitedArray[i].split(".");
        let [source, member, columnWithDefault] = bindingsArray;

        if (columnWithDefault.includes("|")) {
          [column, value] = columnWithDefault.split("|");
        } else {
          column = columnWithDefault;
        }
        if (!value) {
          object = {
            params: [{ source: source, member: member, column: column }],
          };
        } else {
          object = {
            params: [
              { source: source, member: member, column: column },
              { value: value },
            ],
          };
        }
        resultArray.push(object);
      } else {
        resultArray.push(splitedArray[i]);
      }
    }
    return resultArray;
  }
  splitByTagPairs(inputString) {
    const splitArray = [];
    let startIdx = inputString.indexOf("[##");
    let endIdx = inputString.indexOf("##]");

    while (startIdx !== -1 && endIdx !== -1) {
      if (startIdx < endIdx) {
        splitArray.push(inputString.substring(startIdx + 3, endIdx));
        inputString = inputString.substring(endIdx + 3);
      } else {
        splitArray.push(inputString.substring(0, startIdx));
        inputString = inputString.substring(startIdx + 3);
      }

      startIdx = inputString.indexOf("[##");
      endIdx = inputString.indexOf("##]");
    }

    if (inputString.length > 0) {
      splitArray.push(inputString);
    }

    return splitArray;
  }
  static async parse(htmlName, filename) {
    //console.time("appTime");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const htmlDir = path.join(__dirname, "src", htmlName + ".html");
    const parser = new HTMLParser(htmlDir, "/configs");
    await parser.readHtmlFile();
    await parser.getTheParserConfig();
    const tokens = parser.parse();
    const result = await parser.processTags(tokens);
    const resultObj = await parser.processArray(result);
    const final = resultObj.toFilteredObject();
    await parser.writeJsonFile(
      final,
      path.join(__dirname, "result", filename + ".json")
    );
    // console.timeEnd("appTime");
  }
}
HTMLParser.parse("index", "final");
export default HTMLParser.parse;
