import initCartQueries from "./cart-queries";
import initCartMutations from "./cart-mutations";
import { Express } from "express";


const initCartEndpoints = (app: Express) => {
    initCartQueries(app);
    initCartMutations(app);
}

export default initCartEndpoints;
