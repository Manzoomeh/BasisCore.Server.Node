import CommandBase from "./CommandBase.js";
import TokenUtil from "../Token/TokenUtil.js";
import VoidResult from "../Models/VoidResult.js";
import IContext from "../Context/IContext.js";
import { query } from "mssql";

export default class TrackerCommand extends CommandBase {
  /*** @type {IToken}*/
  connectionName;
  /*** @type {IToken}*/
  collectionname;
  /*** @type {IToken}*/
  dbname;
  /*** @type {IToken}*/
  addcookie

  /**
   * @param {object} trackerIl
   */
  constructor(trackerIl) {
    super(trackerIl);
    this.connectionName = TokenUtil.getFiled(trackerIl, "ConnectionName");
    this.collectionname= TokenUtil.getFiled(trackerIl, "collectionname");
    this.dbname = TokenUtil.getFiled(trackerIl, "dbname");
    this.addcookie = TokenUtil.getFiled(trackerIl, "addcookie");
    this.cookieName = TokenUtil.getFiled(trackerIl, "cookieName");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const [connectionName, collectionname, dbname, addcookie] = await Promise.all([
      this.connectionName.getValueAsync(context),
      this.collectionname.getValueAsync(context),
      this.dbname.getValueAsync(context),
      this.addcookie.getValueAsync(context),
    ]);
    let params =  {
      collectionname,dbname,method : "insertOne", query : context.requestObj
    }
    const finalCollectionName =
      collectionname || context.getDefault("trackingCollectionName", "monitoring");
    const {_id} =  await context.loadDataAsync("",connectionName, params)
    if (addcookie) {
      let cookieName;
      try {
        cookieName = await this.cookieName?.getValueAsync(context);
      } catch (error) {
        cookieName = context.getDefault("monitoringCookieName", "monitoring_id");
      }

      context.addCookie(cookieName, _id.toString(), null, null);
    }
    return VoidResult.result;
  }
}
