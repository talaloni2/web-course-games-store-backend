import initGameQueries from "./game-queries";
import initGameMutations from "./game-mutations";
import { Express } from "express";


const initGameEndpoints = (app: Express) => {
    initGameQueries(app);
    initGameMutations(app);
}

export default initGameEndpoints;
