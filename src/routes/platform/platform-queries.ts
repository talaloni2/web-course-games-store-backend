import { Express } from "express";
import { param } from "express-validator";
import { platformsList, singlePlatform } from "../../controllers/platform";
import { ensureValidThenExecute } from "../utils";

const routes = (app: Express) => {
  app.get("/platforms", platformsList);

  app.get(
    "/platforms/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(singlePlatform)
  );
};

export default routes;
