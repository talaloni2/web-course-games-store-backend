import { header, param, query } from "express-validator";
import { getCart, getCartByUser } from "../../controllers/cart";
import { Express } from "express";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";
import validateToken from "../utils/token-validator";

const routes = (app: Express) => {
  app.get(
    "/carts/:id",
    [param("id").isMongoId(), header("Authorization").custom(validateToken)],
    ensureValidThenExecute(getCart)
  );
  app.get(
    "/carts",
    [header("Authorization").custom(validateToken)],
    ensureValidThenExecute(getCartByUser)
  )
};

export default routes;
