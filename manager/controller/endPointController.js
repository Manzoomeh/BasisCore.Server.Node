import Controller from "./Controller.js";
import HostManager from "../../hostManager.js";

class EndPointController extends Controller {
  constructor() {
    super();
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async addEndPoint(req, res) {
    try {
      await this._addEndPoint(
        req.body.name,
        req.body.endpoint,
        req.body.services
      );
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.name + " added successfuly");
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("error: " + error.message);
    }
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async deleteEndPoint(req, res) {
    // try {
      await this._deleteEndPoint(req.body.name);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.name + " deleted successfuly");
    // } catch (error) {
    //   res.writeHead(400, { "Content-Type": "text/plain" });
    //   res.end("error " + error.message);
    // }
  }
}

const endPointController = new EndPointController();
export default endPointController;
