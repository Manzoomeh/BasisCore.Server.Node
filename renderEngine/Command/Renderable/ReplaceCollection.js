import CancellationToken from "../../Cancellation/CancellationToken.js";

export default class ReplaceCollection {
  /** @type {NodeJS.Dict<string>} */
  items;

  /**
   *
   * @param {NodeJS.Dict<string>} collection
   */
  constructor(collection) {
    this.items = collection;
  }

  /**
   *
   * @param {string} content
   * @param {CancellationToken} cancellationToken
   */
  apply(content, cancellationToken) {
    let retVal = content;
    //TODO: implement replace business
    let startIndex = 0;
    startIndex = content.indexOf("[(", startIndex);
    while (startIndex != -1) {
      cancellationToken.throwIfCancellationRequested();
      const from = startIndex + 2;
      startIndex = content.indexOf(")", startIndex);
      if (startIndex != -1) {
        let to = startIndex;
        const tagName = content.substring(from, to);
        to++;
        startIndex = content.indexOf("]", startIndex);
        if (startIndex != -1) {
          const param = content.substring(to, startIndex);
          const template = this.items[tagName];
          if (template) {
            const newContent = applyTemplate(content, template);
          }
        }
      }
    }
    return retVal;
  }

  applyTemplate(content, template) {
    // if(template){
    //     let index =
    // }
    return content;
  }
}
