export default class ResizeOptions {
  //
  // Summary:
  //     Gets or sets the width of the geometry.
  /**@type {number} */
  Width = 0;
  //
  // Summary:
  //     Gets or sets a value indicating whether the image is resized using a pixel area
  //     count limit (@).
  /** @type {boolean} */
  LimitPixels = false;
  //
  // Summary:
  //     Gets or sets a value indicating whether the image is resized if the image is
  //     less than size (<).
  /** @type {boolean} */
  Less = false;
  //
  // Summary:
  //     Gets or sets a value indicating whether the width and height are expressed as
  //     percentages.
  /** @type {boolean} */
  IsPercentage = false;
  //
  // Summary:
  //     Gets or sets a value indicating whether the image is resized without preserving
  //     aspect ratio (!).
  /** @type {boolean} */
  IgnoreAspectRatio = false;
  //
  // Summary:
  //     Gets or sets the height of the geometry.
  /** @type {number} */
  Height = 0;
  //
  // Summary:
  //     Gets or sets a value indicating whether the image is resized if image is greater
  //     than size (>).
  /** @type {boolean} */
  Greater = false;
  //
  // Summary:
  //     Gets or sets a value indicating whether the image is resized based on the smallest
  //     fitting dimension (^).
  /** @type {boolean} */
  FillArea = false;
  //
  // Summary:
  //     Gets a value indicating whether the value is an aspect ratio.
  /** @type {boolean} */
  AspectRatio = false;
  //
  // Summary:
  //     Gets or sets the Y offset from origin.
  /** @type {number} */
  Y = 0;
  //
  // Summary:
  //     Gets or sets the X offset from origin.
  /** @type {number} */
  X = 0;

  // toString() {
  //   let result = "";

  //   if (this.Width > 0) {
  //     result += this.Width;
  //   }
  //   if (this.Height > 0) {
  //     result += "x" + this.Height;
  //   } else if (!this.IsPercentage) {
  //     result += "x";
  //   }

  //   if (this.X != 0 || this.Y != 0) {
  //     if (this.X >= 0) {
  //       result += "+";
  //     }
  //     result += this.X;

  //     if (this.Y >= 0) {
  //       result += "+";
  //     }
  //     result += this.Y;
  //   }

  //   if (this.IsPercentage) {
  //     result += "%";
  //   }

  //   if (this.IgnoreAspectRatio) {
  //     result += "!";
  //   }
  //   if (this.Greater) {
  //     result += ">";
  //   }

  //   if (this.Less) {
  //     result += "<";
  //   }

  //   if (this.FillArea) {
  //     result += "^";
  //   }

  //   if (this.LimitPixels) {
  //     result += "@";
  //   }

  //   return result;
  // }
}
