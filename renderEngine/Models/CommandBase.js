import  ICommandResult  from "./ICommandResult";
import IContext from "../Context/IContext";
import IToken from "../Token/IToken";

export default class CommandBase{
    /**@type {string} */
    core;
    /**@type {IToken} */
    name;
    /**@type {IToken} */
    if;
    /**@type {IToken} */
    runType;
    /**@type {IToken} */
    renderTo;
    /**@type {IToken} */
    renderType;
    /** 
     * @param {IContext} context
     * @returns {Promise<ICommandResult>}
     */
    executeAsync(context);
}


