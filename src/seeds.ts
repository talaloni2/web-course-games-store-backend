import { readFileSync, readdirSync, createReadStream } from 'fs';
import { default as mongoose } from 'mongoose';
import { join } from 'path';
import { url as _url, database as _database, imgBucket } from "./config/db";
import { Game } from './models/game';
import { GameCollection } from './models/game-collection';
import { Platform } from './models/platform';
import { database } from './config/db';

import { GridFSBucket } from "mongodb";

const url = _url;
const databaseName = _database;

mongoose.connect(url + databaseName)
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })
const insertPlatforms = async () => {
    const content: string = readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/platforms.json", "utf-8");
    const platforms: {id: number, platform_logo: number, [key: string]: any}[] = JSON.parse(content);
    await Platform.insertMany(platforms.map(p => { return { ...p, _id: p.id, platform_logo: `${p.platform_logo}.jpg` }; }));
}

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const insertGames = async () => {
    const games = JSON.parse(readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/games.json", "utf-8"))
        .map(g => { 
            return { ...g, _id: g.id, price: getRandomInt(10, 60) + 0.99, availability: getRandomInt(3, 20), screenshots: g.screenshots && g.screenshots.map(sc => `${sc}.jpg`), cover: `${g.cover}.jpg`}; 
        });
    await Game.insertMany(games);
}

const insertCollections = async () => {
    const gameCollections = JSON.parse(readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/collections.json", "utf-8"))
        .map(c => { return { _id: c.id, ...c }; })
    await GameCollection.insertMany(gameCollections);
}

const insertImages = async () => {
    const database = mongoose.connection;
    const bucket = new GridFSBucket(database.db, {
        bucketName: imgBucket,
    });

    const scrapedDataDir = "/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/images";
    let fileNames = readdirSync(scrapedDataDir);

    await Promise.allSettled(fileNames.map(async (fileName) => {
        const fullPath = join(scrapedDataDir, fileName);
        if (!fileName.endsWith(".jpg")) {
            return;
        }
        return new Promise((resolve, reject) => createReadStream(fullPath).pipe(bucket.openUploadStream(fileName)).on("finish", resolve));
    }));
}

const performInserts = async () => {
    await insertPlatforms();
    await insertGames();
    await insertCollections();
    await insertImages();
}

performInserts().then(() => mongoose.connection.close());