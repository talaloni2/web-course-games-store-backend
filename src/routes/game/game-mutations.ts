import { Express } from "express";
import { body, param } from "express-validator";

import { json } from "body-parser";
import {
  addGame,
  attachCover,
  attachScreenshot,
  deleteGame,
  updateGame,
} from "../../controllers/game";
import { ensureValidThenExecute } from "../utils";

const jsonParser = json();

const routes = (app: Express) => {
  app.post(
    "/games",
    [body("platforms.*").isMongoId()],
    jsonParser,
    ensureValidThenExecute(addGame)
  );

  app.post(
    "/games/:id/cover",
    param("id").isMongoId(),
    ensureValidThenExecute(attachCover)
  );

  app.post(
    "/games/:id/screenshot",
    param("id").isMongoId(),
    ensureValidThenExecute(attachScreenshot)
  );

  app.put(
    "/games/:id",
    param("id").isMongoId(),
    jsonParser,
    ensureValidThenExecute(updateGame)
  );

  app.delete(
    "/games/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(deleteGame)
  );
};

export default routes;
