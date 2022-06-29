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
  connect(url, options = {
    username: "",
    password: "",
  }, callback = () => {}) {
    if (typeof (url) === "string") {
      // Check if the url isn't already in
      for (const db in this.dbs) {
        if (url == db) {
          return
        }
      }


      // Check if the url exists
      axios.get(url).then(async (res) => {

        // Get data
        const data = res.data;
        let dbName = ""

        // Detect db type
        if ("couchdb" in data) {
          // The database is couchdb
          // Do stuff...
          dbName = "couchdb"

        } else if (options.username.length >= 1 &&
          options.password >= 1) {
          // Try to connect to redis
          // If the username and the password were provided
          // Create client with user password and server
          const redisClient = Redis.createClient({
            url: `redis://${options.username}:${options.password}@
              ${url}`
          });
          redisClient.on("error", (err) => {});

          await this.redisClient.connect()

          // await client.set('key', 'value');
          // const value = await client.get('key');
        }

        // Insert the db url
        this.dbs = {
          ...this.dbs,
          [dbName]: {
            url,
          },
        };

        callback();
      }).catch((err) => {
        callback();
      });
    }
  }
}