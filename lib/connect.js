const Couchdb = require("./db/Couchdb");
const IORedis = require("./db/IORedis");

module.exports = async function connect(uri, dbName, uniqueIdentifierKeys, options = {}) {
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