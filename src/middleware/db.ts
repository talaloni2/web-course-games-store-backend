import mongoose from "mongoose";
import {url as dbUrl , database as dbName} from "../config/db";

const url = dbUrl;
const databaseName = dbName;

mongoose.connect(url + databaseName)
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })

const database: mongoose.Connection = mongoose.connection;
export {database};