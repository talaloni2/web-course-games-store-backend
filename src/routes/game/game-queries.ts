import { param, query } from "express-validator";
import { gamesList, singleGame } from "../../controllers/game";
import { Express } from "express";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";

const routes = (app: Express) => {
  app.get(
    "/games",
    query("platforms").custom(searchQueryMongoIdValidator),
    ensureValidThenExecute(gamesList)
  );
  app.get(
    "/games/:id",
    [param("id").isMongoId()],
    ensureValidThenExecute(singleGame)
  );
};

export default routes;
