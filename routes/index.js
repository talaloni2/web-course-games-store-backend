const express = require("express");
const uploadController = require("../controllers/upload");
const gamesController = require("../controllers/game");
const bodyParser = require("body-parser");

var jsonParser = bodyParser.json();


let routes = app => {

  app.post("/upload", uploadController.uploadFiles);
  app.get("/files", uploadController.getListFiles);
  app.get("/files/:name", uploadController.download);
  app.get("/games", gamesController.gamesList);
  app.get("/games/:id", gamesController.singleGame);
  app.post("/games", jsonParser, gamesController.addGame);
  app.post("/games/:id/cover", gamesController.attachCover);
  app.post("/games/:id/screenshot", gamesController.attachScreenshot);
  app.put("/games/:id", jsonParser, gamesController.updateGame);
};

module.exports = routes;