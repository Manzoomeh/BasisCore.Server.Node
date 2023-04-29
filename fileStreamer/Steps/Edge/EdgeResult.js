export default class EdgeResult {
  /** @type {string} */
  name;
  /** @type {string} */
  mime;
  /** @type {string} */
  payload;
  /** @type {EdgeLog[]} */
  logs;
}

class EdgeLog {
  /** @type {string} */
  title;
  /** @type {string} */
  message;
}
