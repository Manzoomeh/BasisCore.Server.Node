import path from "path";
import im from "imagemagick";
import BinaryContent from "../../Models/BinaryContent.js";
import Step from "../Step.js";
import ResizeOptions from "./ResizeOptions.js";
import Status from "../../Models/Status.js";

//https://github1s.com/dlemstra/Magick.NET/blob/HEAD/src/Magick.NET/Types/MagickGeometry.cs
//https://imagemagick.org/script/command-line-processing.php
export default class Resize extends Step {
  /**
   * @param {BinaryContent} content
   * @param {ResizeOptions} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {
    return new Promise((resolve) => {
      const op = [
        "-",
        // "-set",
        // "option:filter:blur",
        // "0.8",
        // "-filter",
        // "Lagrange",
        // "-strip",
        "-resize",
        this._optionsToString(options),
        // "-quality",
        // "80",
        "-",
      ];
      const process = im.convert(op, function (err, stdout) {
        if (err) {
          console.error(err);
          content.status = Status.StepError;
          content.AddLog("step-error", err.toString());
        }
        try {
          content.payload = Buffer.from(stdout, "binary");
          content.AddLog("resize-to", JSON.stringify(options));
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
   *
   * @param {ResizeOptions} options
   * @returns {string}
   */
  _optionsToString(options) {
    let result = "";

    if (options.Width > 0) {
      result += options.Width;
    }
    if (options.Height > 0) {
      result += "x" + options.Height;
    } else if (!options.IsPercentage) {
      result += "x";
    }

    if (options.X && options.X !== 0) {
      if (options.X >= 0) {
        result += "+";
      }
      result += options.X;
    }

    if (options.Y && options.Y !== 0) {
      if (options.Y >= 0) {
        result += "+";
      }
      result += options.Y;
    }

    if (options.IsPercentage) {
      result += "%";
    }

    if (options.IgnoreAspectRatio) {
      result += "!";
    }
    if (options.Greater) {
      result += ">";
    }

    if (options.Less) {
      result += "<";
    }

    if (options.FillArea) {
      result += "^";
    }

    if (options.LimitPixels) {
      result += "@";
    }

    return result;
  }

  /**
   * @param {string} format
   * @param {string} filename
   * @returns {string}
   */
  formatName(format, filename) {
    const temp = path.parse(filename);
    return format
      .replace("{0}", temp.name)
      .replace("{1}", temp.ext.substring(1));
  }
}
