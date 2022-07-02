const axios = require("axios").default;
const Redis = require("redis");

module.exports = class DatabaseManager { // Static property
  dbName = "db-manager";
  redisClient = "";
  dbs = {
    // Example format:
    // [url]: {
    //   dbServiceName: "couchdb"
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
          [url]: {
            dbServiceName: "redis"
          },
        };
        
        return callback();
      } else {
        // Check if the url exists
        await axios.get(url).then((res) => {

          // Get data
          const data = res.data;
          let dbServiceName = ""

          // It's couchdb?
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
            [url]: {
              dbServiceName,
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

    for (let url of Object.keys(this.dbs)) {
      let dbServiceName = this.dbs[url]["dbServiceName"];

      if (dbServiceName == "couchdb") {
        output[dbServiceName] = await axios.post(`${url}/${this.dbName}`,
          {
            _id: id,
            ...normalData,
          });
      } else if (dbServiceName == "redis") {
        output[dbServiceName] = await this.redisClient.set(id,
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