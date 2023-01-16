import { Express } from "express";
import initWishlistEndpoints from "./wishlist";
import initCartEndpoints from "./cart";
import initFileEndpoints from "./file";
import initGameEndpoints from "./game";
import initGameCollectionEndpoints from "./game-collection";
import initPlatformEndpoints from "./platform";

const routes = (app: Express) => {
  initFileEndpoints(app);
  initPlatformEndpoints(app);
  initGameEndpoints(app);
  initGameCollectionEndpoints(app);
  initWishlistEndpoints(app);
  initCartEndpoints(app);
};

export default routes;
