const axios = require("axios").default
const Redis = require("redis")

module.exports = class DatabaseManager { // Static property
  redisClient = ""
  dbs = {
    // Example format:
    // [dbName]: {
    //   dbUrl: "localhost:27000"
    // },
  }

  constructor() {}

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
  async connect(url, options = {
  }, callback = () => {}) {
    if (typeof (url) === "string") {
      // Check if the url isn't already in
      for (const db in this.dbs) {
        if (url == db) {
          return
        }
      }

      // Connect to redis
      if (url.startsWith("redis://")) {
        this.redisClient = Redis.createClient({
          url
        });
        this.redisClient.on("error", (err) => {
          throw Error(err);
        });

        await this.redisClient.connect();
        // Insert the db url
        this.dbs = {
          ...this.dbs,
          "redis": {
            url,
          },
        };
        return callback()
      } else {
        // Check if the url exists
        axios.get(url).then((res) => {

          // Get data
          const data = res.data;
          let dbName = ""

          // Detect db type
          if ("couchdb" in data) {
            // The database is couchdb
            // Do stuff...
            dbName = "couchdb"

          }

          // Insert the db url
          this.dbs = {
            ...this.dbs,
            [dbName]: {
              url,
            },
          };

          return callback();
        }).catch((err) => {
          throw Error(err);
        });
      }
    }
  }
  
  /**Get a list(object) of the connected databases
   * 
   * @returns 
   */
  getDatabaseList() {
    return this.dbs;
  }
}