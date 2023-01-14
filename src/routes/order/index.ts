import initOrderQueries from "./order-queries";
import initOrderMutations from "./order-mutations";
import { Express } from "express";

const initOrderEndpoints = (app: Express) => {
  initOrderQueries(app);
  initOrderMutations(app);
};

export default initOrderEndpoints;
