export default class JsonValue {
  constructor(name) {
    this.Name = name;
    this.Properties = [];
  }

  Find(objectName) {
    let retVal = null;
    if (this.Name === objectName) {
      retVal = this;
    } else {
      for (const property of this.Properties) {
        retVal = property.Find(objectName);
        if (retVal !== null) {
          break;
        }
      }
    }
    return retVal;
  }

}
