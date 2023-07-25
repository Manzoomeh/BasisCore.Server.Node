
  
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
          il[elements[item.name.slice(1)].TO] =
            tempAttributes.content;
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
        if (elements[item.name.slice(1)].TO) {
          if (il[elements[item.name.slice(1)].TO]) {
            il[elements[item.name.slice(1)].TO] =
              tempAttributes.content;
          } else {
            il[elements[item.name.slice(1)].TO] =
              tempAttributes.content;
          }
        }
        if (!il[item.name.slice(1)]) {
          il[item.name.slice(1)] = {};
        }
        il[item.name.slice(1)].content = tempAttributes.content;
        tempAttributes.content = "";
        elementsState = "";
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
