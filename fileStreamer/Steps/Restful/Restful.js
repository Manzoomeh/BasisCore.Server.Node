import { FormData, Blob } from "formdata-node";
import BinaryContent from "../../Models/BinaryContent.js";
import Status from "../../Models/Status.js";
import Step from "../Step.js";
import RestfulOptions from "./RestfulOptions.js";


export default class Restful extends Step {
  /**
   * @param {BinaryContent} content
   * @param {RestfulOptions} options
   * @returns {Promise<BinaryContent>}
   */
  async processContentAsync(content, options) {
    try {
      const form = new FormData();
      const blob = new Blob(content.payload, { type: content.mime });
      form.set(content.name, blob);
      const response = await fetch(options.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })
    } catch (er) {
      content.AddLog("rest-error", er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }
}
