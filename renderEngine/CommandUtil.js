import ApiCommand from "./Command/ApiCommand.js";
import GroupCommand from "./Command/Collection/GroupCommand.js";
import CommandBase from "./Command/CommandBase.js";
import PrintCommand from "./Command/PrintCommand.js";
import RawText from "./Command/RawText.js";
import DbSource from "./Command/Source/DbSource.js";
import InlineSourceCommand from "./Command/Source/InlineSourceCommand.js";
import TreeCommand from "./Command/TreeCommand.js";
import ViewCommand from "./Command/ViewCommand.js";
import ListCommand from "./Command/ListCommand.js";
import CallCommand from "./Command/Collection/CallCommand.js";
import CookieCommand from "./Command/CookieCommand.js";
import ClientComponent from "./Command/ClientComponent.js";
import RepeaterCommand from "./Command/Collection/RepeaterCommand.js";
export default class CommandUtil {
  /**
   * @returns {Object.<string, any>}
   */
  static addDefaultCommands() {
    //TODO:must be better with dic of ctor
    /** @type {CommandBase?} */
    let retVal = {
      api: { default: ApiCommand },
      group: { default: GroupCommand },
      print: { default: PrintCommand },
      rawtext: { default: RawText },
      dbsource: { default: DbSource },
      inlinesource: { default: InlineSourceCommand },
      view: { default: ViewCommand },
      tree: { default: TreeCommand },
      list: { default: ListCommand },
      call: { default: CallCommand },
      cookie: { default: CookieCommand },
      clientcomponent: { default: ClientComponent },
      repeater: { default: RepeaterCommand },
    };
    return retVal;
  }
}
