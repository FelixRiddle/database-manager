const axios = require("axios").default;

// Defined
const GlobalNames = require("../GlobalNames");

module.exports = class CouchDB {
  axiosConnection;
  dbName = GlobalNames.defaultDbName;
  name = GlobalNames.couchdb;
  uniqueIdentifierKeys = [];
  uri;
  static #version = "3.2.2";

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
      dbHeaders["Content-Type"] = "application/json";
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
    const prevDocument = await this.get(data);

    if (prevDocument) {
      const id = prevDocument["_id"];
      const prev_rev = prevDocument["_rev"];

      // Couchdb docs on updating documents:
      /* When updating an existing document, the current
      document revision must be included in the document
      (i.e. the request body), as the rev query parameter,
      or in the If - Match request header.*/
      data["_rev"] = prev_rev;
      return axios.put(`${this.uri}/${this.dbName}/${id}`, data)
        .then((res) => {
          // console.log(`Response: `, res);
        })
        .catch((err) => {
          // console.error(err);
        });
    } else {
      return axios.post(`${this.uri}/${this.dbName}`, data)
        .catch((err) => {});
    }
  }

  async get(query) {
    const encodedQuery = this.#encodeQueryObject(query);
    return await this.axiosConnection
      .post(`${this.uri}/${this.dbName}/_find`,
        encodedQuery)
      .then((res) => {
        const document = res.data.docs[0];
        return document;
      })
      .catch((err) => {
        // console.error(`Error: `, err);
        return;
      });
  }

  async delete(query) {
    const prevDocument = await this.get(data);

    if (prevDocument) {
      const id = prevDocument["_id"];
      const prev_rev = prevDocument["_rev"];

      // Couchdb docs on updating documents:
      /* When updating an existing document, the current
      document revision must be included in the document
      (i.e. the request body), as the rev query parameter,
      or in the If - Match request header.*/
      data["_rev"] = prev_rev;
      return axios.delete(
          `${this.uri}/${this.dbName}/${id}`,
          data)
        .then((res) => {
          // console.log(`Response: `, res);
        })
        .catch((err) => {
          // console.error(err);
        });
    }
  }

  async getAll() {
    return await this.axiosConnection
      .get(`${this.uri}/${this.dbName}/_all_docs`)
      .then((res) => {
        const allDocs = res.data;
        return allDocs;
      }).catch((err) => {
      });
  }

  async deleteAll() {
    const documents = await this.getAll();
    if (documents) {
      // console.log(`Documents: `, documents);
      for (let row of documents["rows"]) {
        const rev = row["value"]["rev"];
        const id = row["id"];
        this.axiosConnection
          .delete(`${this.uri}/${this.dbName}/${id}?rev=${rev}`)
          .catch((err) => {
            // An error here, likely means that, there are no
            // more documents to delete.
          });
      }
    }
  }

  async #getId(queryObject) {
    const document = await this.get(queryObject);
    return document["_id"];
  }
}