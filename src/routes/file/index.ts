import initFileQueries from "./file-queries";
import initFileMutations from "./file-mutations";
import { Express } from "express";


const initFileEndpoints = (app: Express) => {
    initFileQueries(app);
    initFileMutations(app);
}

export default initFileEndpoints;
