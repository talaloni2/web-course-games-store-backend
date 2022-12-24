const { default: mongoose } = require("mongoose");
const dbConfig = require("../config/db");

const url = dbConfig.url;
const databaseName = dbConfig.database;

mongoose.connect(url + databaseName, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })

module.exports = {database: mongoose.connection}