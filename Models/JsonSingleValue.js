import JsonValue from "./JsonValue.js";
export default class JsonSingleValue extends JsonValue {
  constructor(name, value) {
    super(name);
    this.Value = value;
  }

}
