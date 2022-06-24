const axios = require("axios").default

module.exports = class DatabaseManager { // Static property
  dbs = {
    // dbName: {
    //   dbUrl: "localhost:27000"
    // },
  }

  constructor() {}

  async connect(url, options = {}, callback) {
    if (typeof (url) === "string") {
      // Check if the url isn't already in
      for (const db in this.dbs) {
        if (url == db) {
          return
        }
      }

      // Check if the url exists
      await axios.get(url).then((res) => {
        console.log(res)

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
      }).catch((err) => { });
      console.log(`Connected to ${url}`);
    }
  }

}