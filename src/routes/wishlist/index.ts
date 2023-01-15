import initWishlistQueries from "./wishlist-queries";
import initWishlistMutations from "./wishlist-mutations";
import {Express} from "express";


const initWishlistEndpoints = (app: Express) => {
    initWishlistQueries(app);
    initWishlistMutations(app);
}

export default initWishlistEndpoints;
