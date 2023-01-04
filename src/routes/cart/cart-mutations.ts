import { Express } from "express";
import { body, param } from "express-validator";

import { json } from "body-parser";
import { addCart, updateCart } from "../../controllers/cart";
import { ensureValidThenExecute } from "../utils";

const jsonParser = json();

const routes = (app: Express) => {
  app.post(
    "/carts",
    [body("games.*.id").isMongoId()],
    jsonParser,
    ensureValidThenExecute(addCart)
  );

  app.put(
    "/carts/:id",
    [param("id").isMongoId(), body("games.*.id").isMongoId()],
    jsonParser,
    ensureValidThenExecute(updateCart)
  );
};

export default routes;
