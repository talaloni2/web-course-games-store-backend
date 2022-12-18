const express = require("express");
const uploadController = require("../controllers/upload");

let routes = app => {

  app.post("/upload", uploadController.uploadFiles);
  app.get("/files", uploadController.getListFiles);
  app.get("/files/:name", uploadController.download);

};

module.exports = routes;