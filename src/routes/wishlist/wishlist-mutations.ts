import { Express } from "express";
import { body, header, param } from "express-validator";

import { json } from "body-parser";
import {addWishlist, deleteWishlistByUser, updateWishlist} from "../../controllers/wishlist";
import { ensureValidThenExecute } from "../utils";
import validateToken from "../utils/token-validator";

const jsonParser = json();

const routes = (app: Express) => {
  app.post(
    "/wishlists",
    [body("games.*.id").isMongoId(), header("Authorization").custom(validateToken)],
    jsonParser,
    ensureValidThenExecute(addWishlist)
  );

  app.put(
    "/wishlists/:id",
    [param("id").isMongoId(), body("games.*.id").isMongoId(), header("Authorization").custom(validateToken)],
    jsonParser,
    ensureValidThenExecute(updateWishlist)
  );

  app.delete(
    "/wishlists",
    [header("Authorization").custom(validateToken)],
    ensureValidThenExecute(deleteWishlistByUser)
  );
};

export default routes;
