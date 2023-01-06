import { Express } from "express";
import { param, query } from "express-validator";
import { platformsList, singlePlatform } from "../../controllers/platform";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";

const routes = (app: Express) => {
  app.get(
    "/platforms",
    query("id").custom(searchQueryMongoIdValidator),
    ensureValidThenExecute(platformsList)
  );

  app.get(
    "/platforms/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(singlePlatform)
  );
};

export default routes;
