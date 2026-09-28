import CommandBase from "./CommandBase.js";
import TokenUtil from "../Token/TokenUtil.js";
import JsonSource from "../Source/JsonSource.js";
import VoidResult from "../Models/VoidResult.js";

export default class TrackingCommand extends CommandBase {
  /**
   * Tracking publishes `${name}.inserted`, so dependent commands (for
   * example a cookie) must run after it has completed.
   */
  get isSourceProducer() {
    return true;
  }

  constructor(trackingIl) {
    super(trackingIl);

    this.connectionName = TokenUtil.getFiled(trackingIl, "source");
    this.collectionName = TokenUtil.getFiled(trackingIl, "collectionname");
    this.databaseName = TokenUtil.getFiled(trackingIl, "dbname");
    this.addCookie = TokenUtil.getFiled(trackingIl, "addcookie");
  }

  async _executeCommandAsync(context) {
    const [name, sourceName, collectionName, databaseName] =
      await Promise.all([
        this.name.getValueAsync(context),
        this.connectionName.getValueAsync(context),
        this.collectionName.getValueAsync(context),
        this.databaseName.getValueAsync(context),
      ]);

    if (!name) {
      throw new Error("tracking command requires the 'name' attribute");
    }

    /*
     * مهم:
     * اگر به علت call/include یا اجرای مجدد render engine،
     * tracking دوباره صدا زده شد، همان source قبلی استفاده شود.
     */
    const sourceId = `${name}.inserted`.toLowerCase();
    const existingSource = context.tryGetSource(sourceId);

    if (existingSource) {
      return VoidResult.result;
    }

    if (!context.__executedTrackingCommands) {
      context.__executedTrackingCommands = new Map();
    }

    const executionKey = [
      name,
      databaseName,
      collectionName,
    ]
      .map((item) => String(item || "").toLowerCase())
      .join(":");

    const existingExecution =
      context.__executedTrackingCommands.get(executionKey);

    if (existingExecution) {
      await existingExecution;
      return VoidResult.result;
    }

    const execution = this.insertTrackingAsync(context, {
      name,
      sourceName,
      collectionName,
      databaseName,
    });

    context.__executedTrackingCommands.set(executionKey, execution);

    try {
      await execution;
    } catch (error) {
      context.__executedTrackingCommands.delete(executionKey);
      throw error;
    }

    return VoidResult.result;
  }

  async insertTrackingAsync(
    context,
    {
      name,
      sourceName,
      collectionName,
      databaseName,
    }
  ) {
    const connectionName =
      databaseName || name || sourceName;

    if (!connectionName) {
      throw new Error(
        "tracking command could not resolve a Mongo connection name"
      );
    }

    if (!collectionName) {
      throw new Error(
        "tracking command requires the 'collectionname' attribute"
      );
    }

    const document = context.createTrackingDocument();

    const insertedId =
      await context.insertMongoDocumentAsync(
        connectionName,
        databaseName,
        collectionName,
        document
      );

    const id =
      insertedId?.toHexString?.() ??
      String(insertedId);

    const insertedSource = new JsonSource(
      [{ id }],
      `${name}.inserted`
    );

    if (typeof context.addGlobalSource === "function") {
      context.addGlobalSource(insertedSource);
    } else {
      context.addSource(insertedSource);
    }
  }

  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);

    await Promise.all([
      tag.addAttributeIfExistAsync(
        "source",
        this.connectionName,
        context
      ),
      tag.addAttributeIfExistAsync(
        "collectionname",
        this.collectionName,
        context
      ),
      tag.addAttributeIfExistAsync(
        "dbname",
        this.databaseName,
        context
      ),
      tag.addAttributeIfExistAsync(
        "addcookie",
        this.addCookie,
        context
      ),
    ]);

    return tag;
  }
}
