import CancellationToken from "./CancellationToken";

export default class ICommandResult {
    /**
     * @param {*} stream
     * @param {CancellationToken} cancellationToken
     * @returns {Promise<void>}
     */
    writeAsync(stream,  cancellationToken);
}
