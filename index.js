const connect = require("./lib/connect");
// const {
//   v4
// } = require("uuid");
// const uuidv4 = v4;

module.exports = class DatabaseManager { // Static property
  dbName = "undefined";
  dbs = [];
  redisClient = "";
  uniqueIdentifierKeys = [];

  constructor(dbName, uniqueIdentifierKeys) {
    // Database name
    if (dbName && typeof (dbName) === "string") {
      this.dbName = dbName;
    }

    if (uniqueIdentifierKeys &&
      uniqueIdentifierKeys.constructor === Array) {
      // The given var has a corrrect format
      this.uniqueIdentifierKeys = uniqueIdentifierKeys;
    } else {
      throw new Error(`We need unique identifier key name for redis`);
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

    const connectionResult = await connect(uri, this.dbName, this.uniqueIdentifierKeys)
      .catch((err) => {});
    this.dbs.push(connectionResult);

    return callback();
  }

  /** Set data to every connected database
   * 
   * @param {*} queryObject 
   * @returns 
   */
  async set(queryObject, callback = () => {}, options = {}) {
    for (let db of this.dbs) {
      db.set(queryObject);
    }

    if (typeof (callback) === "function")
      return callback();
    return;
  }

  /** Get data from every type of connected database
   * 
   * @param {*} queryObject 
   * @param {*} callback 
   * @param {*} options 
   * @returns 
   */
  async get(queryObject, callback = () => {}, options = {}) {
    const output = {};

    for (let db of this.dbs) {
      const unparsedData = await db.get(queryObject);
      const parsedData = JSON.parse(unparsedData);
      output[db["name"]] = parsedData;
    }

    if (typeof (callback) === "function")
      return callback(output);
    return;
  }

  /**Get a list(array) of the connected databases
   * 
   * @returns 
   */
  getDatabaseList() {
    return this.dbs;
  }
}