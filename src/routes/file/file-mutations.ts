import { Express } from "express";

import { uploadFiles } from "../../controllers/upload";

const routes = (app: Express) => {
  app.post("/files", uploadFiles);
};

export default routes;
