import { param, query } from "express-validator";
import { getCart } from "../../controllers/cart";
import { Express } from "express";
import { ensureValidThenExecute, searchQueryMongoIdValidator } from "../utils";

const routes = (app: Express) => {
  app.get(
    "/carts/:id",
    [param("id").isMongoId()],
    ensureValidThenExecute(getCart)
  );
};

export default routes;
