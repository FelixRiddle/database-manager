const Redis = require("ioredis");

module.exports = class IORedis {
  dbName = "undefined";
  name = "redis";
  redis;
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

    if (uri) {
      this.uri = uri;
      this.redis = new Redis(uri);
    }

    if (uniqueIdentifierKeys &&
      uniqueIdentifierKeys.constructor === Array) {
      this.uniqueIdentifierKeys = uniqueIdentifierKeys;
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
    let redisQuery = this.dbName;

    // Get every unique identifier key name
    for (let key of this.uniqueIdentifierKeys) {
      // Check if the value exists and is not undefined
      if (queryObject[key]) {
        redisQuery += `:${queryObject[key]}`;
      }
    }

    return redisQuery
  }

  static isRedisURI(uri) {
    // Connect to redis
    if (uri.startsWith("redis://")) {
      return true;
    }
    return false;
  }

  async set(data) {
    const encodedQuery = this.#encodeQueryObject(data);
    const stringObject = JSON.stringify(data);
    return this.redis.set(encodedQuery, stringObject);
  }

  async get(query) {
    return this.redis.get(this.#encodeQueryObject(query));
  }
}