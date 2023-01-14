import { Express } from "express";
import { header, param } from "express-validator";
import { getOrder, getOrdersByUser } from "../../controllers/order";
import { ensureValidThenExecute } from "../utils";
import validateToken from "../utils/token-validator";

const routes = (app: Express) => {
  app.get(
    "/orders/:id",
    [param("id").isMongoId(), header("Authorization").custom(validateToken)],
    ensureValidThenExecute(getOrder)
  );
  app.get(
    "/orders",
    [header("Authorization").custom(validateToken)],
    ensureValidThenExecute(getOrdersByUser)
  )
};

export default routes;
