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
  responses = [];
  constructor(ViewBCCommandIl) {
    this.html = TokenUtil.getFiled(ViewBCCommandIl, "html");
    this.type = TokenUtil.getFiled(ViewBCCommandIl, "type");
  }

  async executeAsync() {
    const renderResult = await this.renderInternallyAsync(this.html);
    return new StringResult(renderResult);
  }

  /**
   * @param {Window} window
   * @returns {object}
   */

  async getSchemaJsonFromHTML(window) {
    const res1 = this.responses[0];
    const res2 = this.responses[1];
    const data = {};

    if (res1.sources[0].data[0].properties) {
      data["answers"] = res1.sources[0].data[0].properties;
      data["questions"] = res2.sources[0].data[0].questions;
    } else {
      data["answers"] = res2.sources[0].data[0].properties;
      data["questions"] = res1.sources[0].data[0].questions;
    }
    // data.answers.map((e) => {
    //   const questionTag = window.document
    //     .querySelector('[data-bc-schema-info-prpid="1360"]')
    //     .closest("data-bc-question");
    //   const parts = questionTag.querySelectorAll(
    //     "[data-bc-part]:not([data-part-btn-container])"
    //   );
    //   if (e.multi) {
    //     if (parts.length > 1) {
    //       parts.forEach(
    //         (e) =>
    //           this.extractValue(e.textContent) &&
    //           label.push(this.extractValue(e.textContent))
    //       );
    //     } else {
    //       label = this.extractValue(parts[0]?.textContent);
    //     }
    //   }
    // });
    var questionTags = window.document.querySelectorAll("[data-bc-question]");
    var extractedData = {};
    questionTags.forEach((questionTag) => {
      var questionTitle = questionTag.querySelector(
        "[data-bc-question-title]"
      ).innerHTML;
      const prpId = Number(
        questionTag
          .querySelector("[data-bc-question-title]")
          .getAttribute("data-bc-schema-info-prpid")
      );
      var label = [];
      const answers = questionTag.querySelectorAll("[data-bc-answer]");
      const titles = [];

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
          j.querySelector("[data-bc-part-container]")
            .querySelectorAll("[data-bc-part]")
            .forEach((l, i) =>
              values.push(
                this.extractValue(
                  l.textContent,
                  data.questions.find((i) => i.prpId == prpId).parts[i]
                    .validations.dataType || "text"
                )
              )
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
              label.push(this.extractValue(e.textContent, "text"));
            });
        } else {
          const parts = questionTag.querySelectorAll(
            "[data-bc-part]:not([data-part-btn-container])"
          );
          if (parts.length > 1) {
            parts.forEach(
              (e, i) =>
                this.extractValue(e.textContent) &&
                label.push(
                  this.extractValue(
                    e.textContent,
                    data.questions.find((i) => i.prpId == prpId).parts[i]
                      .validations.dataType || "text"
                  )
                )
            );
          } else {
            label = this.extractValue(
              parts[0]?.textContent,
              data.questions.find((i) => i.prpId == prpId).parts[0].validations
                ?.dataType || "text"
            );
          }
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
  isNumeric(string) {
    return /^\d+$/.test(string);
  }
  extractValue(textContent, type) {
    const res = textContent.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();

    if (type == "int") {
      return Number(res);
    } else {
      return res;
    }
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
    const addToResponses = async (e) => {
      const clone = e.clone();
      const clonedResponse = new Response(clone.body);
      try {
        const m = await clonedResponse.json();
        this.responses.push(m);
      } catch (e) {}

      return e;
    };
    const dom = new JSDOM(this.html.value, {
      resources: "usable",
      runScripts: "dangerously",
      beforeParse(window) {
        window.fetch = function () {
          Util.startFetch(window);
          return fetch
            .apply(this, arguments)
            .then((e) => {
              addToResponses(e);
              return e;
            })
            .finally((e) => {
              Util.endFetch(window);
              return e;
            });
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
