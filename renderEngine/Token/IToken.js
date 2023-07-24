import IContext from "../Context/IContext";

export default class IToken{
    /** 
     * @param {IContext}
     * @returns {Promise<string>}
     */
    getValueAsync(context);
}

