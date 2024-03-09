import ApiCommand from "../../renderEngine/Command/ApiCommand.js";
import GroupCommand from "../../renderEngine/Command/Collection/GroupCommand.js";
import CommandBase from "../../renderEngine/Command/CommandBase.js";
import PrintCommand from "../../renderEngine/Command/PrintCommand.js";
import RawText from "../../renderEngine/Command/RawText.js";
import DbSource from "../../renderEngine/Command/Source/DbSource.js";
import InlineSourceCommand from "../../renderEngine/Command/Source/InlineSourceCommand.js";
import TreeCommand from "../../renderEngine/Command/TreeCommand.js";
import ViewCommand from "../../renderEngine/Command/ViewCommand.js";
import ListCommand from "../../renderEngine/Command/ListCommand.js";
import CallCommand from "../../renderEngine/Command/Collection/CallCommand.js";
import UnknownCommand from "../../renderEngine/Command/UnknownCommand.js";
import RepeaterCommand from "../../renderEngine/Command/Collection/RepeaterCommand.js";
export default class CommandUtil {
  /**
   * @param {Object} commandIl
   * @returns {CommandBase}
   */
  static createCommand(commandIl) {
    //TODO:must be better with dic of ctor
    /** @type {CommandBase?} */
    let retVal = null;
    switch (commandIl.$type.toLowerCase()) {
      case "rawtext": {
        retVal = new RawText(commandIl);
        break;
      }
      case "print": {
        retVal = new PrintCommand(commandIl);
        break;
      }
      case "group": {
        retVal = new GroupCommand(commandIl);
        break;
      }
      case "dbsource": {
        retVal = new DbSource(commandIl);
        break;
      }
      case "inlinesource": {
        retVal = new InlineSourceCommand(commandIl);
        break;
      }
      case "tree": {
        retVal = new TreeCommand(commandIl);
        break;
      }
      case "view": {
        retVal = new ViewCommand(commandIl);
        break;
      }
      case "list": {
        retVal = new ListCommand(commandIl);
        break;
      }
      case "call": {
        retVal = new CallCommand(commandIl);
        break;
      }
      case "api": {
        retVal = new ApiCommand(commandIl);
        break;
      }
      case "repeater": {
        retVal = new RepeaterCommand(commandIl);
        break;
      }
      default: {
        retVal = new UnknownCommand(commandIl);
        break;
      }
    }
    return retVal;
  }
}
