import ConnectionInfo from "./ConnectionInfo.js";

export default class InlineConnectionInfo extends ConnectionInfo {
  /** @type {object} */
  engine;

  /**
   * @param {string} name
   * @param {object} engine
   */
  constructor(name, engine) {
    super(name);
    this.engine = engine;
  }

  /**
   * @returns {Promise<boolean>}
   */
  testConnectionAsync() {
    return typeof this.engine.testConnectionAsync === "function"
      ? this.engine.testConnectionAsync()
      : super.testConnectionAsync();
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  loadDataAsync(parameters, cancellationToken) {
    return typeof this.engine.loadDataAsync === "function"
      ? this.engine.loadDataAsync(parameters, cancellationToken)
      : super.loadDataAsync(parameters, cancellationToken);
  }

  /**
   * @param {Request} httpRequest
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<Request>}
   */
  getRoutingDataAsync(httpRequest, cancellationToken) {
    return typeof this.engine.getRoutingDataAsync === "function"
      ? this.engine.getRoutingDataAsync(httpRequest, cancellationToken)
      : super.getRoutingDataAsync(httpRequest, cancellationToken);
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {number} pageSize
   * @param {number} domainId
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<ILoadPageResult>}
   */
  loadPageAsync(pageName, rawCommand, pageSize, domainId, cancellationToken) {
    return typeof this.engine.loadPageAsync === "function"
      ? this.engine.loadPageAsync(
          pageName,
          rawCommand,
          pageSize,
          domainId,
          cancellationToken
        )
      : super.loadPageAsync(
          pageName,
          rawCommand,
          pageSize,
          domainId,
          cancellationToken
        );
  }
}
