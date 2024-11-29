import WebSettingData from "./WebSettingData.js";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import BasisCoreException from "../Exceptions/BasisCoreException.js";

export default class WebConnectionInfo extends ConnectionInfo {
  /** @type {string} */
  url;
  /**
   * @param {string} name
   * @param {WebSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.url = settings.url;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      let body = new URLSearchParams(parameters);
      const response = await fetch(url, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return new DataSourceCollection(await response.json());
    } catch (error) {
      return new BasisCoreException(
        "Failed to fetch request from url " + this.url
      );
    }
  }
}
