import { Express } from "express";
import { param, query } from "express-validator";
import {
  gameCollectionsList,
  singleGameCollection,
} from "../../controllers/game-collection";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";

const routes = (app: Express) => {
  app.get(
    "/gameCollections",
    query("games").custom(searchQueryMongoIdValidator),
    ensureValidThenExecute(gameCollectionsList)
  );

  app.get(
    "/gameCollections/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(singleGameCollection)
  );
};

export default routes;
