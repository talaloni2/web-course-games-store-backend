import initPlatformQueries from "./platform-queries";
import initPlatformMutations from "./platform-mutations";
import { Express } from "express";

const initPlatformEndpoints = (app: Express) => {
  initPlatformQueries(app);
  initPlatformMutations(app);
};

export default initPlatformEndpoints;
