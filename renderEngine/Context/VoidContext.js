import StringResult from "../Models/StringResult.js";
import VoidStep from "../Models/VoidStep.js";
import LogContext from "./LogContext.js";
export default class VoidContext extends LogContext {
  constructor(title) {
    super(title, "None");
  }

  complete() {
    
  }

  newStep(title) {
    return new VoidStep()
  }

  newWait(title) {
    return null;
  }

  failed() {}

  addDebugInformation() {}

  get debugInfo() {
    return [new StringResult("")];
  }
  _convertHttpRequestSettingToArray() {}
}
