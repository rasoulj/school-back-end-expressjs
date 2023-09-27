//Set up mongoose connection
console.log('in db config');
const mongoose = require('mongoose');

// const mongoDB = 'mongodb://dbAdmin:123sallam@localhost/school_db?retryWrites=false';
const mongoDB = 'mongodb://school_db_admin:123sallam@157.90.207.53/school_db';
const mongoDBProd = 'mongodb://dbAdmin:123sallam@135.181.237.237/school_db';

/*
db.createUser(
  {
    user: "dbAdmin",
    pwd: "123sallam",
    roles: [ { role: "readWrite", db: "school_db" } ]
  }
)

db.createUser(
  {
    user: "dbMainAdmin",
    pwd: "dSHp73ufnkkFAR2kXrCD",
    roles: [
             {"userAdminAnyDatabase",
              "dbAdminAnyDatabase",
              "readWriteAnyDatabase"}
           ]
  }
)
 */

const {argv} = process;


const prod = argv.length >= 3 && argv[2] === "--prod";
console.log("argv", prod);

//const mongoDB = "mongodb+srv://rasoulj:123sallam@clustertest1.d7cx9.mongodb.net/testDB1";
// var mongoDB = "mongodb://rasoulj:123sallam@clustertest1-shard-00-00.d7cx9.mongodb.net:27017,clustertest1-shard-00-01.d7cx9.mongodb.net:27017,clustertest1-shard-00-02.d7cx9.mongodb.net:27017/testDB1?ssl=true&replicaSet=atlas-akm7vk-shard-0&authSource=admin&retryWrites=true&w=majority";

//clustertest1.d7cx9.mongodb.net/testDB1
// const mongoDB = 'mongodb+srv://rasoulj:123sallam@cluster0-vnyp7.mongodb.net/test?retryWrites=true&w=majority';
//const mongoDB = 'mongodb+srv://rasoulj:LADN7KCEvzTLdkeH@cluster0-vnyp7.mongodb.net/test?retryWrites=true&ssl=true&authSource=rasoulj';
mongoose.connect(prod ? mongoDBProd : mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
/*const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));*/

/*
db.createUser(
    {
        user: "dbAdmin",
        pwd: passwordPrompt(),  // or cleartext password
        roles: [
            { role: "readWrite", db: "school_db" }
        ]
    }
)

use school_db
db.createUser({user: "dbAdmin", pwd: passwordPrompt(), roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]})

db.createUser({user: "dbAdmin", pwd: "123sallam", roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]})

db.changeUserPassword("dbAdmin", "123sallam")

 */
