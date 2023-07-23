

export default class IL {
  /** * @type {string}*/
  $type;
  /** * @type {string} */
  core;
  /** * @type {string}*/
  name;
  /** * @type {string|array|object}*/
  content;
  /** * @type {IL[]} */
  Commands;
  /** @type {object} */
  "extra-attribute" = {
    
  };
  addExtraAttribute(key, value) {
    this["extra-attribute"][key] = value;
  }
  addCustomProperty(key, value) {
    this[key] = value;
  }
  pushToFaces(face) {
    if (!this.faces) {
      this.addCustomProperty(faces, []);
    }
    this.faces.push(face);
  }
}
