const axios = require("axios").default;

module.exports = class CouchDB {
  axiosConnection;
  dbName = "undefined";
  name = "couchdb";
  uniqueIdentifierKeys = [];
  uri;

  constructor({
    dbName,
    uniqueIdentifierKeys,
    uri,
  }) {
    if (dbName) {
      this.dbName = dbName;
    }

    if (uniqueIdentifierKeys &&
      uniqueIdentifierKeys.constructor === Array) {
      this.uniqueIdentifierKeys = uniqueIdentifierKeys;
    }

    if (uri) {
      this.uri = uri;

      // Create a db
      const dbHeaders = {};
      axios.put(`${uri}/${this.dbName}`)
        .catch((err) => {
          // Likely, the database already exists
        });
      dbHeaders["Accept"] = "application/json";
      this.axiosConnection = axios.create({
        baseURL: uri,
        headers: dbHeaders,
      });
    }
  }

  /**Transform into a query string for the databases
   * TODO:
   * () If the unique identifiers is a bool with 
   * false value or is undefined, it will throw
   * an error, make it so that this doesn't
   * happen.
   * 
   * @param {*} queryObject 
   * @returns 
   */
  #encodeQueryObject(queryObject) {
    const couchdbQuery = {
      "selector": {},
    };

    // Get every unique identifier key name
    for (let key of this.uniqueIdentifierKeys) {
      // Check if the value exists and is not undefined
      if (queryObject[key]) {
        couchdbQuery["selector"][key] = {
          "$eq": queryObject[key],
        };
      }
    }

    return JSON.stringify(couchdbQuery);
  }

  static async isCouchdbURIAsync(uri) {
    // Check if the url exists
    return await axios.get(uri)
      .then((res) => {
        // Get data
        const data = res.data;

        // It's couchdb?
        if ("couchdb" in data) {
          // The database is couchdb
          return true;
        }
      }).catch((err) => {
        return false;
      });
  }

  async set(data) {
    return axios.post(`${this.uri}/${this.dbName}`, data)
      .catch((err) => {});
  }

  async get(query) {
    return axios.post(`${this.uri}/${this.dbName}`,
        this.#encodeQueryObject(query))
      .catch((err) => {});
  }
}