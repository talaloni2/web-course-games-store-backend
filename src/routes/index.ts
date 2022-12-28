import { uploadFiles, getListFiles, download } from "../controllers/upload";
import {
  gamesList,
  singleGame,
  addGame,
  attachCover,
  attachScreenshot,
  updateGame,
  deleteGame,
} from "../controllers/game";
import { json } from "body-parser";
import { Express } from "express";

const jsonParser = json();

const routes = (app: Express) => {
  app.post("/upload", uploadFiles);
  app.get("/files", getListFiles);
  app.get("/files/:name", download);
  app.get("/games", gamesList);
  app.get("/games/:id", singleGame);
  app.post("/games", jsonParser, addGame);
  app.post("/games/:id/cover", attachCover);
  app.post("/games/:id/screenshot", attachScreenshot);
  app.put("/games/:id", jsonParser, updateGame);
  app.delete("/games/:id", deleteGame);
};

export default routes;
