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

  /**
   * 
   * @param {*} queryObject 
   * @returns 
   */
  async set(queryObject) {
    const output = {};

    return output;
  }

  // /**
  //  * 
  //  * @param {*} unparsedData 
  //  * @param {*} options 
  //  * @param {*} callback 
  //  * @returns 
  //  */
  // async set(normalData, options = {}, callback = () => {}) {
  //   normalData["_id"] = uuidv4();
  //   const data = this.#stringify(normalData);
  //   const output = {};

  //   for (let url of Object.keys(this.dbs)) {
  //     let dbServiceName = this.dbs[url]["dbServiceName"];

  //     if (dbServiceName == "couchdb") {
  //       output[dbServiceName] =
  //         await axios
  //         .post(`${url}/${this.dbName}`, {
  //           // In case it's possible to use multiple values for
  //           // the same thing(like email), replace the original
  //           // to point to the new value, and convert this as the
  //           // original
  //           //_pointsTo: "asdf@gmail.com",
  //           ...normalData,
  //         }).catch((err) => {
  //           // throw Error(err);
  //         });
  //     } else if (dbServiceName == "redis") {
  //       const redisKeyword = this.#getQueryString(normalData);
  //       // node-redis set doesn't accept a key with the
  //       // format key1:key2:key3, so this caused a big ass
  //       // problem obviously.
  //       // console.log(`Rediskeyword: `, redisKeyword["redis"]);
  //       // console.log(`Its typeof: `, typeof (redisKeyword["redis"]));
  //       // console.log(`UUIDV4 type: `, typeof (uuidv4()));
  //       // console.log(`Data type: `, typeof (data));
  //       output[dbServiceName] =
  //         await redisClient.set(redisKeyword, data);
  //     }
  //   }

  //   return callback({
  //     output
  //   });
  // }

  /**Get a list(array) of the connected databases
   * 
   * @returns 
   */
  getDatabaseList() {
    return this.dbs;
  }
}