import { Express } from "express";
import { body, param } from "express-validator";

import { json } from "body-parser";
import {
  addGameCollection,
  deleteGameCollection,
  updateGameCollection,
} from "../../controllers/game-collection";

const jsonParser = json();

const routes = (app: Express) => {
  app.post(
    "/gameCollections",
    body("games.*").isMongoId(),
    jsonParser,
    addGameCollection
  );
  app.put(
    "/gameCollections/:id",
    param("id").isMongoId(),
    jsonParser,
    updateGameCollection
  );
  app.delete(
    "/gameCollections/:id",
    param("id").isMongoId(),
    deleteGameCollection
  );
};

export default routes;
