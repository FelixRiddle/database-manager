// Nodejs
const fs = require("fs");

// Defined
const Couchdb = require("./db/Couchdb");
const IORedis = require("./db/IORedis");
const GlobalNames = require("./GlobalNames");

module.exports = class Connection {
  static connectionsDataPath = `${__dirname}/../data/connection/connections.json`;

  /**Connect to a database service
   * 
   * @param {*} uri 
   * @param {*} dbName 
   * @param {*} uniqueIdentifierKeys 
   * @param {*} options 
   * @returns 
   */
  static async connect(uri, dbName, uniqueIdentifierKeys) {
    if (IORedis.isRedisURI(uri)) {
      return new IORedis({
        dbName,
        uniqueIdentifierKeys,
        uri,
      });
    } else if (await Couchdb.isCouchdbURIAsync(uri)
      .catch((err) => false)) {
      return new Couchdb({
        dbName,
        uniqueIdentifierKeys,
        uri,
      });
    }
  }

  static createDbsByPreviousConnection() {
    const dbs = [];
    const prevConnectionData = this.loadConnections();

    if (prevConnectionData) {
      for (let connection of Object.keys(prevConnectionData)) {
        const {
          name,
          ...data
        } = prevConnectionData[connection];
        dbs.push(this.createDbByName(name, data));
      }
      return dbs;
    }

  }

  static createDbByName(name, data) {
    if (name === GlobalNames.redis) {
      return new IORedis(data);
    } else if (name === GlobalNames.couchdb) {
      return new Couchdb(data);
    }
  }

  /**Save the connections locally to reconnect fast
   * 
   * @param {*} connectionsData 
   */
  static async saveConnections(connectionsData) {
    const data = JSON.stringify(connectionsData);
    fs.writeFile(this.connectionsDataPath,
      data,
      (err) => {});
  }

  /**Load cached previous connections
   * 
   * @returns 
   */
  static loadConnections() {
    const prevConnections = fs.readFileSync(
      this.connectionsDataPath,
      (err) => {
        console.error(err);
      });
    return JSON.parse(prevConnections);
  }
}