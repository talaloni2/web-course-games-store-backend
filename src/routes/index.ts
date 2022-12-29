import { json } from "body-parser";
import { Express } from "express";
import {
  addGame,
  attachCover,
  attachScreenshot,
  deleteGame,
  gamesList,
  singleGame,
  updateGame
} from "../controllers/game";
import {
  addGameCollection,
  deleteGameCollection,
  gameCollectionsList,
  singleGameCollection,
  updateGameCollection
} from "../controllers/game-collection";
import {
  addPlatform,
  attachPlatformLogo,
  deletePlatform,
  platformsList,
  singlePlatform,
  updatePlatform
} from "../controllers/platform";
import { download, getListFiles, uploadFiles } from "../controllers/upload";

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

  app.get("/platforms", platformsList);
  app.get("/platforms/:id", singlePlatform);
  app.post("/platforms", jsonParser, addPlatform);
  app.post("/platforms/:id/logo", attachPlatformLogo);
  app.put("/platforms/:id", jsonParser, updatePlatform);
  app.delete("/platforms/:id", deletePlatform);

  app.get("/gameCollections", gameCollectionsList);
  app.get("/gameCollections/:id", singleGameCollection);
  app.post("/gameCollections", jsonParser, addGameCollection);
  app.put("/gameCollections/:id", jsonParser, updateGameCollection);
  app.delete("/gameCollections/:id", deleteGameCollection);
};

export default routes;
