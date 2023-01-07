import { Express } from "express";
import { body, header, param } from "express-validator";

import { json } from "body-parser";
import { addCart, updateCart } from "../../controllers/cart";
import { ensureValidThenExecute } from "../utils";
import validateToken from "../utils/token-validator";

const jsonParser = json();

const routes = (app: Express) => {
  app.post(
    "/carts",
    [body("games.*.id").isMongoId(), header("Authorization").custom(validateToken)],
    jsonParser,
    ensureValidThenExecute(addCart)
  );

  app.put(
    "/carts/:id",
    [param("id").isMongoId(), body("games.*.id").isMongoId(), header("Authorization").custom(validateToken)],
    jsonParser,
    ensureValidThenExecute(updateCart)
  );
};

export default routes;
