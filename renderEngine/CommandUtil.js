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
import UnknownCommand from "./Command/UnknownCommand.js";
import CookieCommand from "./Command/CookieCommand.js";
import ClientComponent from "./Command/ClientComponent.js";
import RepeaterCommand from "./Command/Collection/RepeaterCommand.js";
export default class CommandUtil {
  /**
   * @param {Object} commandIl
   * @param {Object.<string, any>} externalCommands
   * @returns {CommandBase}
   */
  static createCommand(commandIl, externalCommands) {
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
        retVal = new GroupCommand(commandIl, externalCommands);
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
        retVal = new RepeaterCommand(commandIl, externalCommands);
        break;
      }
      case "cookie": {
        retVal = new CookieCommand(commandIl);
        break;
      }
      case "clientcomponent": {
        retVal = new ClientComponent(commandIl);
        break;
      }
      default: {
        const CommandClass =
          externalCommands[commandIl.$type.toLowerCase()]?.default;
        if (CommandClass) {
        } else {
          retVal = new UnknownCommand(commandIl);
          break;
        }
      }
    }
    return retVal;
  }
}
