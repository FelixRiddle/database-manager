const Redis = require("ioredis");

// Defined
const GlobalNames = require("../GlobalNames");

module.exports = class IORedis {
	dbName = GlobalNames.defaultDbName;
	name = GlobalNames.redis;
	redis;
	uniqueIdentifierKeys = [];
	uri;

	constructor({ dbName, uniqueIdentifierKeys, uri, debug = false }) {
		if (dbName) {
			this.dbName = dbName;
		}

		if (uri) {
			this.uri = uri;
			if (debug) console.log(`Uri: `, uri);
			try {
				this.redis = new Redis(uri);
			} catch (err) {
				console.log(`Couldn't connect to redis, error: `, err);
			}
		} else {
			throw Error("Error: Uri not given for Redis");
		}

		if (uniqueIdentifierKeys && uniqueIdentifierKeys.constructor === Array) {
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

		if (typeof queryObject === typeof {}) {
			// Get every unique identifier key name
			for (let key of this.uniqueIdentifierKeys) {
				// Check if the value exists and is not undefined
				if (queryObject[key]) {
					redisQuery += `:${queryObject[key]}`;
				}
			}
		} else if (typeof queryObject === typeof "") {
			redisQuery += `:${queryObject}`;
		}

		return redisQuery;
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
		const encodedQueryObject = this.#encodeQueryObject(query);
		const data = await this.redis.get(encodedQueryObject);

		// If data is null
		if (typeof data == typeof null) {
			// To maintain consistency we, will return undefined every time
			// data doesn't exist
			return undefined;
		}

		return data;
	}
};
