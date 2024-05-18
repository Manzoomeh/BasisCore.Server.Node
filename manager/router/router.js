import { ServerResponse, IncomingMessage } from "http";
import endPointController from "../controller/endPointController.js";

/**
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns
 */
const router = (req, res) => {
  const { url, method } = req;
  if (url == "/manager" && method === "POST") {
    return endPointController.addEndPoint(req, res);
  }
  if (url == "/manager" && method === "DELETE") {
    return endPointController.deleteEndPoint(req,res)
  }
  if (url == "/manager" && method === "GET") {
    return endPointController.getEndPoint(req,res)
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
};
export default router;
