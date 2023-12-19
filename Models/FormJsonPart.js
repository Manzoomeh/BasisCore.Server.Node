export default class FormJsonPart {
  constructor(name, value) {
    this.Value = value;
    this.Parents = name.split(".").filter(Boolean);
  }
}
