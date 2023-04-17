import LoggerItem from "./LoggerItem.js";

export default class Logger {
  /** @type {LoggerItem[]} */
  _logs = [];

  /**
   * @param {string} title
   * @param {string} value
   */
  add(title, value) {
    this._logs.push(new LoggerItem(title, value));
  }

  /**
   * @param {NodeJS.Dict<object>} list
   */
  addLogs(list) {
    for (const log of this._logs) {
      if (list[log.title]) {
        let index = 0;
        const newTitle = `${log.title}_${index}`;
        while (list[newTitle]) {
          index++;
          newTitle = `${log.title}_${index}`;
        }
        list[newTitle] = log.value;
      } else {
        list[log.title] = log.value;
      }
    }
  }
}
