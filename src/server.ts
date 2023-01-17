import cors from "cors";
import express, {urlencoded} from "express";
import initRoutes from "./routes";
import {port} from "./config/server";
import "./middleware/db"; // initializing db on server startup
import {Server} from "http";
import {json} from "body-parser";

const socketio = require("socket.io");

const app = express();
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(json());

app.use(urlencoded({extended: true}));
initRoutes(app);

var server: Server = null;
if (process.env.NODE_ENV === "test") {
    console.log("===========================================testing!");
    server = app.listen(0, () => console.log(`Listening on randomport`));
} else {
    server = app.listen(port, () => {
        console.log(`Running at localhost:${port}`);
    });

    var io = require('socket.io')(server, {
        cors: {
            origin: '*',
        }
    });
    let gamesWatchingCounter = {};
    io.on('connect', socket => {
        socket.on("connectGameId", gameId => {
            if (!gamesWatchingCounter[gameId]) {
                gamesWatchingCounter[gameId] = [];
            }
            gamesWatchingCounter[gameId].push(socket.id);
            socket.broadcast.emit(gameId, "" + gamesWatchingCounter[gameId].length);
            socket.emit(gameId, "" + gamesWatchingCounter[gameId].length);
        });

        // socket.on("disconnectGameId", gameId => {
        //     gamesWatchingCounter[gameId] = (gamesWatchingCounter[gameId] || 0) - 1;
        //     console.log(gamesWatchingCounter);
        //     socket.broadcast.emit("counter", "" + gamesWatchingCounter[gameId]);
        //     socket.emit("counter", "" + gamesWatchingCounter[gameId]);
        // });

        socket.on("disconnect", () => {
            let gameId = "";
            for (const [key, value] of Object.entries(gamesWatchingCounter)) {
                // @ts-ignore
                let index = value.indexOf(socket.id);
                if (index > -1) {
                    // @ts-ignore
                    value.splice(index, 1);
                    gameId = key;
                    break;
                }
            }
            socket.broadcast.emit(gameId, "" + gamesWatchingCounter[gameId].length);
            socket.emit(gameId, "" + gamesWatchingCounter[gameId].length);
        });
    });
}

export {app, server};
