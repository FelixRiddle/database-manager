# database-manager
<p>A package that can store data to multiple types of </br>
database services, for now the <strong>only supported</strong></br>
databases are:</br>
<ul>
  <li>Couchdb</li>
  <li>Redis</li>
</ul>
</p>

# Example use
Import the package and create a new instance, once it has been
setup you will be able to create a new one anywhere on the project
without inserting the same data again.
```javascript
const DatabaseManager = require("felixriddle.database-manager");
// The users will be the database name
// The username and email will be the search keys
const db = new DatabaseManager("users", ["username", "email"]);
```

Establish a connection to some databases
```javascript
(async () => {
  try {
		const localhost = "127.0.0.1";
		
    // You must create a file called .env and add the fields:
    // COUCHDB_USERNAME, COUCHDB_PASSWORD, REDIS_USERNAME, REDIS_PASSWORD
		// Connect to couchdb
		const couchDbUsername = process.env.COUCHDB_USERNAME;
		const couchDbPassword = process.env.COUCHDB_PASSWORD;
		const couchDbPort = process.env.COUCHDB_PORT ? process.env.COUCHDB_PORT : 5984;
		await db.connect(
			`http://${couchDbUsername}:${couchDbPassword}@${localhost}:${couchDbPort}`
		);
    
		// Connect to redis
		const redisProtocol = "redis://";
		const redisUsername = process.env.REDIS_USERNAME;
		const redisPassword = process.env.REDIS_PASSWORD;
		const redisPort = "6379";
		await db.connect(
			`${redisProtocol}${redisUsername}:${redisPassword}@${localhost}:${redisPort}`
		);
    
    //...
  } catch(err) {
    console.error(err);
  }
})();
```

Set and get data
```javascript
//...
const userData = { // Test data
  username: "joefoo",
  password: "pleasedonthackme",
  email: "joefoo@email.com",
  alternativeEmails: [
    "joefoo@gmail.com",
  ],
  address: {
    street: "Fake street",
    number: "1234",
    city: "Fake city",
  },
  time: {
    joinDate: Date.now(),
    lastUpdated: Date.now(),
  },
};
console.log(`Data to store: `, userData);
console.log(`Database name: `, db.dbName);

// Set data
console.log(`Set`);
await db.set(userData);

// Get data
console.log(`Get`);
const data_received = await db.get(userData);
console.log(`Data received: `, data_received);
//...
```

Connect to the same databases on another location/script,
because the uri and other information are stored locally
inside the module, you can just create a new instance, and
it will already be connected to the databases
```javascript
// Instantiate a new db manager, it will automatically
// connect to previous databases
const db = new DatabaseManager();

console.log(`Database services: `, db.dbs)
console.log(`Get`);
// Get by the search keys
const data_received = await db.get({
  username: userData["username"],
  email: userData["email"]
});

console.log(`Data received: `, data_received);
```