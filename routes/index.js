const express = require("express");
const uploadController = require("../controllers/upload");
const gamesController = require("../controllers/game");

let routes = app => {

  app.post("/upload", uploadController.uploadFiles);
  app.get("/files", uploadController.getListFiles);
  app.get("/files/:name", uploadController.download);
  app.get("/games", gamesController.gamesList);
  app.get("/games/:id", gamesController.singleGame);

};

module.exports = routes;