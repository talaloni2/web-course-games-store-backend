import { Request, Response } from "express";
import IPlatformUserSearchRequest from "../interfaces/platforms/IPlatformUserSearchRequest";
import { Platform } from "../models/platform";
import {
  mapToDbPlatform,
  mapToDbPlatformUpdate,
  mapToPlatformsListResponse,
  mapToPlatformsSingleResponse,
} from "./dto-mappers/platform-mappers";
import {
  buildPlatformListQuery,
  buildPlatformListSort,
} from "./query-builders/platform-query-builder";
import uploadImage from "../middleware/upload";
import { Game } from "../models/game";
import { listContainseOneOrMore } from "../utils/request-builder";

const platformsList = async (
  req: Request<{}, {}, {}, IPlatformUserSearchRequest>,
  res: Response
) => {
  const search = buildPlatformListQuery(req.query);
  let platforms = await Platform.find(search).sort(
    buildPlatformListSort(req.query.sort)
  );
  res.json(mapToPlatformsListResponse(platforms));
};

const singlePlatform = async (req: Request, res: Response) => {
  const platform = await Platform.findById(req.params.id);
  if (platform === null) {
    res.sendStatus(404);
    return;
  }
  const platformResponse = mapToPlatformsSingleResponse(platform);
  res.json(platformResponse);
};

const addPlatform = async (req: Request, res: Response) => {
  const platformWithSameName = await Platform.findOne({ name: req.body.name });
  if (platformWithSameName !== null) {
    res.status(400);
    return res.json({ message: "platform with the same name already exists" });
  }

  const platformWithLargestId = await Platform.find({}).sort({ _id: -1 }).limit(1);
  const currentId = platformWithLargestId.at(0)._id + 1;

  let createdPlatform = mapToDbPlatform(req.body, currentId);

  var platform = new Platform(createdPlatform);
  platform = await platform.save();
  return res.json({ id: platform._id });
};

const attachPlatformLogo = async (req: Request, res: Response) => {
  try {
    var platform = await Platform.findById(req.params.id);
    if (platform === null) {
      return res.sendStatus(404);
    }

    await uploadImage(req, res);
    if (req.file == undefined) {
      res.status(400);
      return res.json({
        message: "You must select a file.",
      });
    }
    platform.platform_logo = req.file.filename;
    platform = await platform.save();
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const updatePlatform = async (req: Request, res: Response) => {
  const platformWithSameName = await Platform.findOne({
    name: req.body.name,
    _id: { $ne: req.params.id },
  });
  if (platformWithSameName !== null) {
    res.status(400);
    return res.json({ message: "platform with the same name already exists" });
  }

  var platformToUpdate = await Platform.findById(req.params.id);
  if (platformToUpdate === null) {
    return res.sendStatus(404);
  }

  var updatedFields = mapToDbPlatformUpdate(req.body);
  Object.assign(platformToUpdate, updatedFields);

  var platform = await platformToUpdate.save();
  return res.json({ id: platform._id });
};

const deletePlatform = async (req: Request, res: Response) => {
  var platformToDelete = await Platform.findById(req.params.id);
  if (platformToDelete === null) {
    return res.sendStatus(404);
  }

  deletePlatformReferenceFromGames(req);

  await platformToDelete.delete();
  return res.sendStatus(200);
};

const deletePlatformReferenceFromGames = async (req: Request) => {
  var collectionsContainingGame = await Game.find(
    listContainseOneOrMore(req.params.id, "platforms")[0]
  );
  collectionsContainingGame.forEach(async (game) => {
    game.platforms = game.platforms.filter(
      (platformId) => platformId != parseInt(req.params.id)
    );
    await game.save();
  });
};

export {
  platformsList,
  singlePlatform,
  addPlatform,
  attachPlatformLogo,
  updatePlatform,
  deletePlatform,
};
