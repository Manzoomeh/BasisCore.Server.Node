import im from "imagemagick";
import BinaryContent from "../../Models/BinaryContent.js";
import Step from "../Step.js";
import ConvertOptions from "./ConvertOptions.js";
import Status from "../../Models/Status.js";

export default class Convert extends Step {
  /**
   * @param {BinaryContent} content
   * @param {ConvertOptions} options
   * @returns {Promise<BinaryContent>}
   */
  async processContentAsync(content, options) {
    return new Promise((resolve, reject) => {
      var op = ["-", "-format", options.Format.toUpperCase(), "-"];
      const process = im.convert(op, (err, stdout) => {
        if (err) {
          console.error(err);
          content.status = Status.StepError;
          content.AddLog("step-error", err.toString());
        }
        try {
          content.payload = Buffer.from(stdout, "binary");
          content.name = this._changeFileExtension(
            content.name,
            options.Format
          );
          content.AddLog("convert-to", options.Format);
        } catch (err) {
          console.error(err);
          content.status = Status.StepError;
          content.AddLog("step-error", err.toString());
        }
        resolve(content);
      });
      process.stdin.end(content.payload);
    });
  }

  /**
   * @param {string} filename
   * @param {string} newExtension
   * @returns {string}
   */
  _changeFileExtension(filename, newExtension) {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return filename;
    }
    const filenameWithoutExtension = filename.slice(0, lastDotIndex);
    return filenameWithoutExtension + "." + newExtension;
  }
}
