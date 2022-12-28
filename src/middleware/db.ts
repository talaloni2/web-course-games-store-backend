import mongoose from "mongoose";
import dbConfig from "../config/db";

const url = dbConfig.url;
const databaseName = dbConfig.database;

mongoose.connect(url + databaseName)
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })

const database: mongoose.Connection = mongoose.connection;
export {database};