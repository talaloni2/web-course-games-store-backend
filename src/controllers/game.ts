import { Game } from "../models/game";
import { Platform } from "../models/platform";
import {
  mapToGamesListResponse,
  mapToSingleGameResponse,
  mapToDbGame,
  mapToDbGameUpdate,
} from "./dto-mappers/game-mapper";
import {
  buildGameListQuery,
  buildGameListSort,
} from "./query-builders/game-query-builder";
import uploadImage from "../middleware/upload";
import { Request, Response } from "express";
import IGameUserSearchRequest from "../interfaces/games/IGameUserSearchRequest";
import { GameCollection } from "../models/game-collection";
import { listContainseOneOrMore } from "../utils/request-builder";
import { Cart } from "../models/cart";

const getGamesForPromotions = async (req: Request, res: Response) => {
  res.json(await Game.aggregate([{$group: {_id: "$totalRating", count: {$sum: 1}}}]).sort({_id: -1}));
};

const gamesList = async (
  req: Request<{}, {}, {}, IGameUserSearchRequest>,
  res: Response
) => {
  const search = buildGameListQuery(req.query);
  const page = req.query.page || 0;
  const size = req.query.size || 10;
  let games = await Game.find(search)
    .sort(buildGameListSort(req.query.sort))
    .skip(page * size)
    .limit(size);
  res.json(mapToGamesListResponse(games));
};

const singleGame = async (req: Request, res: Response) => {
  const game = await Game.findById(req.params.id);
  if (game === null) {
    res.sendStatus(404);
    return;
  }
  const gameResponse = mapToSingleGameResponse(game);
  res.json(gameResponse);
};

const addGame = async (req: Request, res: Response) => {
  const gameWithSameName = await Game.findOne({ name: req.body.name });
  if (gameWithSameName !== null) {
    res.status(400);
    return res.json({ message: "game with the same name already exists" });
  }

  let createdGame = mapToDbGame(req.body);

  const requestedPlatforms = createdGame.platforms;
  let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
  if (platforms.length != requestedPlatforms.length) {
    res.status(400);
    return res.send("One or more specified platforms do not exist");
  }

  var game = new Game(createdGame);
  game = await game.save();
  return res.json({ id: game._id });
};

const attachCover = async (req: Request, res: Response) => {
  try {
    var game = await Game.findById(req.params.id);
    if (game === null) {
      return res.sendStatus(404);
    }

    await uploadImage(req, res);
    if (req.file == undefined) {
      res.status(400);
      return res.json({
        message: "You must select a file.",
      });
    }
    game.cover = req.file.filename;
    game = await game.save();
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const attachScreenshot = async (req: Request, res: Response) => {
  try {
    var game = await Game.findById(req.params.id);
    if (game === null) {
      return res.sendStatus(404);
    }

    await uploadImage(req, res);
    if (req.file == undefined) {
      res.status(400);
      return res.json({
        message: "You must select a file.",
      });
    }
    game.screenshots = game.screenshots;
    game.screenshots.push(req.file.filename);
    game = await game.save();
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const updateGame = async (req: Request, res: Response) => {
  const gameWithSameName = await Game.findOne({
    name: req.body.name,
    _id: { $ne: req.params.id },
  });
  if (gameWithSameName !== null) {
    res.status(400);
    return res.json({ message: "game with the same name already exists" });
  }

  var gameToUpdate = await Game.findById(req.params.id);
  if (gameToUpdate === null) {
    return res.sendStatus(404);
  }

  var updatedFields = mapToDbGameUpdate(req.body);
  Object.assign(gameToUpdate, updatedFields);

  const requestedPlatforms = gameToUpdate.platforms;
  let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
  if (platforms.length != requestedPlatforms.length) {
    res.status(400);
    return res.send("One or more specified platforms do not exist");
  }

  var game = await gameToUpdate.save();
  return res.json({ id: game._id });
};

const deleteGame = async (req: Request, res: Response) => {
  var gameToDelete = await Game.findById(req.params.id);
  if (gameToDelete === null) {
    return res.sendStatus(404);
  }

  await deleteGameReferenceFromCollections(req);
  await deleteGameReferenceFromCarts(req);

  await gameToDelete.delete();
  return res.sendStatus(200);
};

const deleteGameReferenceFromCollections = async (req: Request) => {
  var collectionsContainingGame = await GameCollection.find(
    listContainseOneOrMore(req.params.id, "games")[0]
  );
  collectionsContainingGame.forEach(async (col) => {
    col.games = col.games.filter(
      (gameId) => gameId.toString() !== req.params.id
    );
    await col.save();
  });
};

const deleteGameReferenceFromCarts = async (req: Request) => {
  var collectionsContainingGame = await Cart.find(
    listContainseOneOrMore(req.params.id, "'games.id'")[0]
  );
  collectionsContainingGame.forEach(async (col) => {
    col.games = col.games.filter(
      (game) => game.id.toString() !== req.params.id
    );
    await col.save();
  });
};

export {
  getGamesForPromotions,
  gamesList,
  singleGame,
  addGame,
  attachCover,
  attachScreenshot,
  updateGame,
  deleteGame,
};
