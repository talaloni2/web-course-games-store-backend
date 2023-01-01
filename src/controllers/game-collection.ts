import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import IGameCollectionUserSearchRequest from "../interfaces/game-collections/IGameCollectionUserSearchRequest";
import { Game } from "../models/game";
import { GameCollection } from "../models/game-collection";
import {
  mapToDbGameCollection,
  mapToDbGameCollectionUpdate,
  mapToGameCollectionSingleResponse,
  mapToGameCollectionsListResponse
} from "./dto-mappers/game-collection-mappers";
import {
  buildGameCollectionListQuery,
  buildGameCollectionListSort
} from "./query-builders/game-collection-query-builder";

const gameCollectionsList = async (
  req: Request<{}, {}, {}, IGameCollectionUserSearchRequest>,
  res: Response
) => {
  if (req.query.games !== undefined && req.query.games !== null && req.query.games.split(",").some(gid => !isValidObjectId(gid))){
    return res.status(400).json({message: "searching for invalid game ids"});
  }
  const search = buildGameCollectionListQuery(req.query);
  let gameCollections = await GameCollection.find(search).sort(
    buildGameCollectionListSort(req.query.sort)
  );
  res.json(mapToGameCollectionsListResponse(gameCollections));
};

const singleGameCollection = async (req: Request, res: Response) => {
  // if (!isValidObjectId(req.params.id)){
  //   return res.status(400).json({message: "searching for invalid game collection id"});
  // }
  const gameCollection = await GameCollection.findById(req.params.id);
  if (gameCollection === null) {
    return res.sendStatus(404);
  }
  const gameCollectionResponse =
    mapToGameCollectionSingleResponse(gameCollection);
  res.json(gameCollectionResponse);
};

const addGameCollection = async (req: Request, res: Response) => {
  const gameCollectionWithSameName = await GameCollection.findOne({
    name: req.body.name,
  });
  if (gameCollectionWithSameName !== null) {
    res.status(400);
    return res.json({
      message: "game collection with the same name already exists",
    });
  }

  const gameCollectionWithLargestId = await GameCollection.find({})
    .sort({ _id: -1 })
    .limit(1);
  const currentId =
    (gameCollectionWithLargestId.length !== 0 &&
      gameCollectionWithLargestId.at(0)._id + 1) ||
    1;

  let createdGameCollection = mapToDbGameCollection(req.body);

  if (createdGameCollection.games.length !== 0 && createdGameCollection.games.some(gid => !isValidObjectId(gid))){
    return res.status(400).json({message: "trying to use invalid game ids"});
  }
  const requestedGames = createdGameCollection.games;
  let games = await Game.find({ _id: { $in: requestedGames } });
  if (games.length != requestedGames.length) {
    res.status(400);
    return res.send("One or more specified games do not exist");
  }

  var gameCollection = new GameCollection(createdGameCollection);
  gameCollection = await gameCollection.save();
  return res.json({ id: gameCollection._id });
};

const updateGameCollection = async (req: Request, res: Response) => {
  const gameCollectionWithSameName = await GameCollection.findOne({
    name: req.body.name,
    _id: { $ne: req.params.id },
  });
  if (gameCollectionWithSameName !== null) {
    res.status(400);
    return res.json({
      message: "game collection with the same name already exists",
    });
  }

  var gameCollectionToUpdate = await GameCollection.findById(req.params.id);
  if (gameCollectionToUpdate === null) {
    return res.sendStatus(404);
  }

  var updatedFields = mapToDbGameCollectionUpdate(req.body);
  Object.assign(gameCollectionToUpdate, updatedFields);

  const requestedGames = gameCollectionToUpdate.games;
  let games = await Game.find({ _id: { $in: requestedGames } });
  if (games.length != requestedGames.length) {
    res.status(400);
    return res.send("One or more specified games do not exist");
  }

  var gameCollection = await gameCollectionToUpdate.save();
  return res.json({ id: gameCollection._id });
};

const deleteGameCollection = async (req: Request, res: Response) => {
  var gameCollectionToDelete = await GameCollection.findById(req.params.id);
  if (gameCollectionToDelete === null) {
    return res.sendStatus(404);
  }

  await gameCollectionToDelete.delete();
  return res.sendStatus(200);
};

export {
  gameCollectionsList,
  singleGameCollection,
  addGameCollection,
  updateGameCollection,
  deleteGameCollection,
};
