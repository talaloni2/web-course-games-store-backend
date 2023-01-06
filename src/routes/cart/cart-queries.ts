import { header, param, query } from "express-validator";
import { getCart } from "../../controllers/cart";
import { Express } from "express";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";
import validateToken from "../utils/token-validator";

const routes = (app: Express) => {
  app.get(
    "/carts/:id",
    [param("id").isMongoId(), header("Authorization").custom(validateToken)],
    ensureValidThenExecute(getCart)
  );
};

export default routes;
