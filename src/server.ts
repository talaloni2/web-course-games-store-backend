import cors from "cors";
import express, { urlencoded } from "express";
import initRoutes from "./routes";
import { port } from "./config/server";
import "./middleware/db"; // initializing db on server startup

const app = express();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(urlencoded({ extended: true }));
initRoutes(app);

app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
