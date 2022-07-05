const Connection = require("./lib/Connection");
const FilesManager = require("./lib/FilesManager");

module.exports = class DatabaseManager { // Static property
  dbName = "undefined";
  dbs = [];
  connectionsData = {
    // 1000 * 60 = 1 second
    // 1000 * 60 * 60 = 1 minute
    // 1000 * 60 * 60 * 60 = 1 hour
    // ttl: 1000 * 60 * 60
  };
  uniqueIdentifierKeys = [];

  constructor(dbName, uniqueIdentifierKeys) {
    // Load previous connections
    try {
      // Create directories
      FilesManager.createFolders();
      
      const newDbs = Connection.createDbsByPreviousConnection();
      
      if (newDbs) {
        this.dbs = newDbs;
      }
    } catch (err) {
      console.error(err);
      // The file doesn't exists, proceed to create it the normal way
      // Database name
      if (dbName && typeof (dbName) === "string") {
        this.dbName = dbName;
      } else {
        throw new Error(`Database name not specified`);
      }

      // In short: Search keys
      if (uniqueIdentifierKeys &&
        uniqueIdentifierKeys.constructor === Array) {
        // The given var has a corrrect format
        this.uniqueIdentifierKeys = uniqueIdentifierKeys;
      } else {
        throw new Error(`We need unique identifier key names.`);
      }
    }
  }

  /** Connect to a database, it can be one of the following:
   * * Couchdb
   * * Redis
   * * PostgreSQL
   * 
   * @param {string} url 
   * @param {object} options 
   * @param {function} callback 
   * @returns 
   */
  async connect(uri, callback = () => {}) {
    if (typeof (uri) !== "string") {
      // throw new Error("The url is not a string");
      return;
    }

    const connectionResult = await Connection.connect(uri, this.dbName, this.uniqueIdentifierKeys)
      .catch((err) => {});
    this.dbs.push(connectionResult);
    
    // Store connection to reconnect elsewhere without
    // re-entering data
    this.connectionsData[uri] = {
      name: connectionResult["name"],
      uri: connectionResult["uri"],
      dbName: connectionResult["dbName"],
      uniqueIdentifierKeys: connectionResult["uniqueIdentifierKeys"],
    };
    Connection.saveConnections(this.connectionsData);

    return callback();
  }

  /** Set data to every connected database
   * 
   * @param {*} queryObject 
   * @returns 
   */
  async set(queryObject) {
    for (let db of this.dbs) {
      db.set(queryObject);
    }
  }

  /** Get data from every type of connected database
   * 
   * @param {*} queryObject 
   * @param {*} callback 
   * @param {*} options 
   * @returns 
   */
  async get(queryObject) {
    const output = {};

    for (let db of this.dbs) {
      const data = await db.get(queryObject);
      const dbServiceName = db["name"];
      if (data && typeof (data) === "string") {
        const parsedData = JSON.parse(data);
        output[dbServiceName] = parsedData;
      } else {
        output[dbServiceName] = data;
      }
    }

    return output;
  }

  /**Get a list(array) of the connected databases
   * 
   * @returns 
   */
  getDatabaseList() {
    return this.dbs;
  }
}