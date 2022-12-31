import { createReadStream, readdirSync, readFileSync } from "fs";
import { default as mongoose } from "mongoose";
import path, { join } from "path";
import { database as _database, imgBucket, url as _url } from "./config/db";
import { Game } from "./models/game";
import { GameCollection } from "./models/game-collection";
import { Platform } from "./models/platform";

import { GridFSBucket } from "mongodb";

const url = _url;
const databaseName = _database;

mongoose
  .connect(url + databaseName)
  .then(() => {
    console.log("mongo connection open!!");
  })
  .catch((err) => {
    console.log("no connection start");
  });
const insertPlatforms = async (): Promise<Map<number, string>> => {
  const platformsFile = path.resolve(
    __dirname,
    "../resources/seed-data/platforms.json"
  );
  const content: string = readFileSync(platformsFile, "utf-8");
  const platforms: {
    id: number;
    platform_logo: number;
    [key: string]: any;
    _id: mongoose.Types.ObjectId;
  }[] = JSON.parse(content).map((p) => ({
    ...p,
    _id: new mongoose.Types.ObjectId(),
  }));
  await Platform.insertMany(
    platforms.map((p) => {
      return { ...p, platform_logo: `${p.platform_logo}.jpg`, _id: p._id };
    })
  );
  return new Map(platforms.map((p) => [p.id, p._id.toString()]));
};

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

const insertGames = async (
  platformsMapping: Map<number, string>
): Promise<Map<number, string>> => {
  const gamesFile = path.resolve(
    __dirname,
    "../resources/seed-data/games.json"
  );
  const games = JSON.parse(readFileSync(gamesFile, "utf-8")).map((g) => {
    return {
      ...g,
      _id: new mongoose.Types.ObjectId(),
      price: getRandomInt(10, 60) + 0.99,
      availability: getRandomInt(3, 20),
      screenshots: g.screenshots && g.screenshots.map((sc) => `${sc}.jpg`),
      cover: `${g.cover}.jpg`,
      platforms: g.platforms && g.platforms.map((p) => platformsMapping.get(p)),
    };
  });
  await Game.insertMany(games);
  return new Map(games.map((g) => [g.id, g._id.toString()]));
};

const insertCollections = async (gamesMapping: Map<number, string>) => {
  const gameCollectionsFile = path.resolve(
    __dirname,
    "../resources/seed-data/collections.json"
  );
  const gameCollections = JSON.parse(
    readFileSync(gameCollectionsFile, "utf-8")
  ).map((c) => {
    return { ...c, games: c.games.map((g) => gamesMapping.get(g)) };
  });
  await GameCollection.insertMany(gameCollections);
};

const insertImages = async () => {
  const database = mongoose.connection;
  const bucket = new GridFSBucket(database.db, {
    bucketName: imgBucket,
  });

  const scrapedDataDir = path.resolve(
    __dirname,
    "../resources/seed-data/images"
  ); // 1GB images, request folder from teammate
  let fileNames = readdirSync(scrapedDataDir);

  await Promise.allSettled(
    fileNames.map(async (fileName) => {
      const fullPath = join(scrapedDataDir, fileName);
      if (!fileName.endsWith(".jpg")) {
        return;
      }
      return new Promise((resolve, reject) =>
        createReadStream(fullPath)
          .pipe(bucket.openUploadStream(fileName))
          .on("finish", resolve)
      );
    })
  );
};

const performInserts = async () => {
  const platforms = await insertPlatforms();
  const games = await insertGames(platforms);
  await insertCollections(games);
  await insertImages();
};

performInserts().then(() => mongoose.connection.close());
