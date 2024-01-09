import StringResult from "../Models/StringResult.js";
import TokenUtil from "../Token/TokenUtil.js";
import fetch, { Request } from "node-fetch";
import fs from "fs";
import { JSDOM } from "jsdom";
import Util from "../../Util.js";
import IToken from "../Token/IToken.js";
export default class ViewBCCommand {
  /**@type {IToken} */
  html;
  /**@type {IToken} */
  type;
  /**@type {number} */

  timeout = 0;
  /**
   * @param {object} ViewBCCommandIl
   */

  constructor(ViewBCCommandIl) {
    this.html = TokenUtil.getFiled(ViewBCCommandIl, "html");
    this.type = TokenUtil.getFiled(ViewBCCommandIl, "type");

    // Create a fetch function with the custom Agent
  }

  async executeAsync() {
    const renderResult = await this.renderInternallyAsync(this.html);
    return new StringResult(renderResult);
  }

  /**
   * @param {Window} window
   * @returns {object}
   */

  getSchemaJsonFromHTML(window) {
    var questionTags = window.document.querySelectorAll("[data-bc-question]");
    var extractedData = {};

    questionTags.forEach(function (questionTag) {
      var questionTitle = questionTag.querySelector(
        "[data-bc-question-title]"
      ).innerHTML;

      var label = [];
      const answers = questionTag.querySelectorAll("[data-bc-answer]");
      const titles = [];

      console.log("answers.length :>> ", answers);
      if (answers.length > 1) {
        questionTag.querySelectorAll("[data-bc-answer-title]").forEach((k) => {
          titles.push(k.textContent);
        });
        const ret = {
          titles,
          values: [],
        };
        answers.forEach((j) => {
          const values = [];
          j.querySelectorAll("[data-bc-part]").forEach((l) =>
            values.push(l.textContent)
          );
          ret.values.push(values);
        });
        label.push(ret);
      } else {
        if (questionTag.querySelector("[data-bc-part-checkbox]") != undefined) {
          questionTag
            .querySelector("[data-bc-answer-container]")
            .querySelectorAll("[data-sys-text]")
            .forEach((e) => {
              label.push(e.textContent);
            });
        } else {
          questionTag
            .querySelectorAll("[data-bc-part]")
            .forEach(
              (e) => e.textContent.trim() && label.push(e.textContent.trim())
            );
        }
      }

      // if (questionTag.querySelector("[data-bc-part-checkbox]") != undefined) {
      //   questionTag
      //     .querySelector("[data-bc-answer-container]")
      //     .querySelectorAll("[data-sys-text]")
      //     .forEach((e) => {
      //       label.push(e.textContent);
      //     });
      // } else {
      //   questionTag
      //     .querySelectorAll("label")
      //     .forEach((e) => label.push(e.innerHTML));
      // }

      extractedData[questionTitle] = label;
    });
    return extractedData;
  }
  waitForRequestsWrapper(dom) {
    return new Promise((resolve) => {
      this.waitForRequests(dom, resolve);
    });
  }
  waitForRequests(dom, resolve) {
    if (this.timeout >= 5000 && dom.window.fetching == 0) {
      if (this.type.value == "json") {
        const retval = this.getSchemaJsonFromHTML(dom.window);
        resolve(retval);
      } else {
        const retval = dom.serialize();
        resolve(retval);
      }
    } else {
      this.timeout += 1000;
      setTimeout(() => this.waitForRequests(dom, resolve), 1000); // Check again after 1 second
    }
  }
  async renderInternallyAsync() {
    const dom = new JSDOM(this.html.value, {
      resources: "usable",
      runScripts: "dangerously",
      beforeParse(window) {
        window.fetch = function () {
          Util.startFetch(window);
          return fetch.apply(this, arguments).finally(Util.endFetch(window));
        };
        window.Request = Request;
      },
    });

    const buildFileContents = fs.readFileSync("./basiscore.min.js", "utf-8");
    await dom.window.eval(buildFileContents);
    const res = await this.waitForRequestsWrapper(dom);

    return res;
  }
}
