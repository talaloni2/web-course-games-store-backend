import cors from "cors";
import express, { urlencoded } from "express";
import initRoutes from "./routes";
import { port } from "./config/server";
import "./middleware/db"; // initializing db on server startup
import { Server } from "http";

const app = express();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(urlencoded({ extended: true }));
initRoutes(app);

var server: Server = null;
if (process.env.NODE_ENV === "test") {
  console.log("===========================================testing!");
  server = app.listen(0, () => console.log(`Listening on randomport`));
} else {
  server = app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
  });
}

export { app, server };
