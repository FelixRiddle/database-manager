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

```javascript
const os = require("os");
const DatabaseManager = require("./database-manager/index");
const db = new DatabaseManager("users", ["username", "email"]);

(async () => {
  try {
    const userData = { // Test data
      username: "juja",
      password: "asdfasdfasdf",
      email: "joemama@email.com",
      alternativeEmails: [
        "joemama@gmail.com",
      ],
      address: {
        street: "Joe mama",
        number: "6532",
        city: "Joe city",
      },
      os: {
        homedir: os.homedir(),
        hostname: os.hostname(),
      },
      hardware: {
        cpus: os.cpus(),
      },
      sessions: [{
        started: Date.now(),
        ended: Date.now(),
      }],
      time: {
        joinDate: Date.now(),
        lastUpdated: Date.now(),
      },
    };
    console.log(`Data to store: `, userData);
    console.log(`Database name: `, db.dbName);

    // Connect to couchdb
    await db.connect("http://admin:asd123@127.0.0.1:38000", () => {
      console.log(`Connected to couchdb!`);
    });

    // Connect to redis
    const redisProtocol = "redis://"
    const redisUsername = "fede";
    const redisPassword = "9b3f682ffb4f85a4f73668829dd26484f7ac64a00ca6b436151fc022ced4cb43";
    const redisIP = "127.0.0.1";
    const redisPort = "6379";
    await db.connect(
      `${redisProtocol}${redisUsername}:${redisPassword}@${redisIP}:${redisPort}`,
      () => {
        console.log(`Connected to redis`);
      })

    console.log(`Database list: `, db.getDatabaseList());

    // Set data
    console.log(`Set`);
    await db.set(userData);

    // Get data
    console.log(`Get`);
    const data_received = await db.get(userData);
    console.log(`Data received: `, data_received);
  } catch (err) {
    console.error(err);
  }
})();
```

