import {header, param} from "express-validator";
import {getWishlist, getWishlistByUser} from "../../controllers/wishlist";
import {Express} from "express";
import {ensureValidThenExecute} from "../utils";
import validateToken from "../utils/token-validator";

const routes = (app: Express) => {
    app.get(
        "/wishlists/:id",
        [param("id").isMongoId(), header("Authorization").custom(validateToken)],
        ensureValidThenExecute(getWishlist)
    );
    app.get(
        "/wishlists",
        [header("Authorization").custom(validateToken)],
        ensureValidThenExecute(getWishlistByUser)
    )
};

export default routes;
