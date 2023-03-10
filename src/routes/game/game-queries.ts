import { param, query } from "express-validator";
import {gamesList, getGamesForPromotions, singleGame} from "../../controllers/game";
import { Express } from "express";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";

const routes = (app: Express) => {
  app.get(
    "/gamesForPromotions",
    ensureValidThenExecute(getGamesForPromotions)
  );
  app.get(
    "/games",
    [
      query("platforms").custom(searchQueryMongoIdValidator),
      query("id").custom(searchQueryMongoIdValidator),
    ],
    ensureValidThenExecute(gamesList)
  );
  app.get(
    "/games/:id",
    [param("id").isMongoId()],
    ensureValidThenExecute(singleGame)
  );
};

export default routes;
