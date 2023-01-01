import { Express } from "express";
import { download, getListFiles } from "../../controllers/upload";

const routes = (app: Express) => {
  app.get("/files", getListFiles);
  app.get("/files/:name", download);
};

export default routes;
