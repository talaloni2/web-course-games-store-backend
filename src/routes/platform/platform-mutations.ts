import { Express } from "express";
import { param } from "express-validator";

import { json } from "body-parser";
import {
  addPlatform,
  attachPlatformLogo,
  deletePlatform,
  updatePlatform,
} from "../../controllers/platform";
import { ensureValidThenExecute } from "../utils";

const jsonParser = json();

const routes = (app: Express) => {
  app.post("/platforms", jsonParser, addPlatform);

  app.post(
    "/platforms/:id/logo",
    param("id").isMongoId(),
    ensureValidThenExecute(attachPlatformLogo)
  );

  app.put(
    "/platforms/:id",
    param("id").isMongoId(),
    jsonParser,
    ensureValidThenExecute(updatePlatform)
  );

  app.delete(
    "/platforms/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(deletePlatform)
  );
};

export default routes;
