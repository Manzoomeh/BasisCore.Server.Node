
import BinaryContent from "../../Models/BinaryContent.js";
import Step from "../Step.js";
import WebPOptions from "./WebPOptions.js";
import sharp from "sharp"
import Status from "../../Models/Status.js";

export default class WebP extends Step {
  /**
   * @param {BinaryContent} content
   * @param {WebPOptions} options
   * @returns {Promise<BinaryContent>}
   */
  async procesContentAsync(content, options) {
    try {
      const webpData = await sharp(content.payload).toFormat("webp").toBuffer();
      content.payload = webpData;
      content.mime = "webp";
      content.AddLog("convertToWebP", "");
    } catch (error) {
      content.AddLog("webP-error", error);
      content.status = Status.StepError;
    }
    return content;
  }
}