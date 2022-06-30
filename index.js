const axios = require("axios").default;
const Redis = require("redis");

module.exports = class DatabaseManager { // Static property
  dbName = "db-manager";
  redisClient = "";
  dbs = {
    // Example format:
    // [dbServiceName]: {
    //   url: "localhost:27000"
    // },
  };

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
  async connect(url, options = {}, callback = () => {}) {
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
          let dbServiceName = ""

          // Detect db type
          if ("couchdb" in data) {
            // The database is couchdb
            // Do stuff...
            dbServiceName = "couchdb"

            // Create a db
            axios
              .put(`${url}/${this.dbName}`)
              .then((res) => {})
              .catch((err) => {
                // Probably it already exists
              });
          }

          // Insert the db url
          this.dbs = {
            ...this.dbs,
            [dbServiceName]: {
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

  /**Tries to parse data
   * 
   * @param {*} data 
   * @returns 
   */
  #stringify(data) {
    if (typeof (data) == "object") {
      return JSON.stringify(data);
    }
    return data;
  }

  /**
   * 
   * @param {*} unparsedData 
   * @param {*} options 
   * @param {*} callback 
   * @returns 
   */
  async set(id, normalData, options = {}, callback = () => {}) {
    const data = this.#stringify(normalData);
    const output = {};

    for (let key of Object.keys(this.dbs)) {
      let url = this.dbs[key]["url"];

      if (key == "couchdb") {
        output[key] = "";
      } else if (key == "redis") {
        output[key] = await this.redisClient.set(id,
          data,
        );
      }
    }

    return callback({
      output
    });
  }

  /**Get a list(object) of the connected databases
   * 
   * @returns 
   */
  getDatabaseList() {
    return this.dbs;
  }
}