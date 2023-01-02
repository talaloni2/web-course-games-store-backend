import initGameCollectionQueries from "./game-collection-queries";
import initGameCollectionMutations from "./game-collection-mutations";
import { Express } from "express";

const initGameCollectionEndpoints = (app: Express) => {
  initGameCollectionQueries(app);
  initGameCollectionMutations(app);
};

export default initGameCollectionEndpoints;
