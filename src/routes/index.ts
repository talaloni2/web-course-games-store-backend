import { json } from "body-parser";
import { Express } from "express";
import {
  addGame,
  attachCover,
  attachScreenshot,
  deleteGame,
  gamesList,
  singleGame,
  updateGame,
} from "../controllers/game";
import {
  addGameCollection,
  deleteGameCollection,
  gameCollectionsList,
  singleGameCollection,
  updateGameCollection,
} from "../controllers/game-collection";
import {
  addPlatform,
  attachPlatformLogo,
  deletePlatform,
  platformsList,
  singlePlatform,
  updatePlatform,
} from "../controllers/platform";
import { download, getListFiles, uploadFiles } from "../controllers/upload";
import { param, body } from "express-validator";

const jsonParser = json();

const routes = (app: Express) => {
  app.post("/upload", uploadFiles);
  app.get("/files", getListFiles);
  app.get("/files/:name", download);

  app.get("/games", body("platforms.*").optional().isMongoId(), gamesList);
  app.get("/games/:id", param("id").isMongoId(), singleGame);
  app.post("/games", jsonParser, addGame);
  app.post("/games/:id/cover", param("id").isMongoId(), attachCover);
  app.post("/games/:id/screenshot", param("id").isMongoId(), attachScreenshot);
  app.put("/games/:id", param("id").isMongoId(), jsonParser, updateGame);
  app.delete("/games/:id", param("id").isMongoId(), deleteGame);

  app.get("/platforms", platformsList);
  app.get("/platforms/:id", param("id").isMongoId(), singlePlatform);
  app.post("/platforms", jsonParser, addPlatform);
  app.post("/platforms/:id/logo", param("id").isMongoId(), attachPlatformLogo);
  app.put("/platforms/:id", param("id").isMongoId(), jsonParser, updatePlatform);
  app.delete("/platforms/:id", param("id").isMongoId(), deletePlatform);

  app.get("/gameCollections", gameCollectionsList);
  app.get("/gameCollections/:id", param("id").isMongoId(), singleGameCollection);
  app.post("/gameCollections", body("games.*").isMongoId(), jsonParser, addGameCollection);
  app.put("/gameCollections/:id", param("id").isMongoId(), jsonParser, updateGameCollection);
  app.delete("/gameCollections/:id", param("id").isMongoId(), deleteGameCollection);
};

export default routes;
