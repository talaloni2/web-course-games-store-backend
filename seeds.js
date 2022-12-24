const fs = require('fs');
const { default: mongoose } = require('mongoose');
const path = require('path')
const dbConfig = require("./config/db");
const Game = require('./models/game');
const GameCollection = require('./models/game-collection');
const Platform = require('./models/platform');

const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;
const databaseName = dbConfig.database;

mongoose.connect(url + databaseName, { useNewUrlParser: true })
    .then(() => {
        console.log("mongo connection open!!");
    }).catch(err => {
        console.log("no connection start");
    })
const insertPlatforms = async () => {
    const platforms = JSON.parse(fs.readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/platforms.json"), "utf-8")
        .map(p => { return { _id: p.id, ...p }; })
    await Platform.insertMany(platforms);
}
const insertGames = async () => {
    const games = JSON.parse(fs.readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/games.json"), "utf-8")
        .map(g => { return { _id: g.id, ...g }; })
    await Game.insertMany(games);
}

const insertCollections = async () => {
    const gameCollections = JSON.parse(fs.readFileSync("/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/collections.json"), "utf-8")
        .map(c => { return { _id: c.id, ...c }; })
    await GameCollection.create(gameCollections);
}

const insertImages = async () => {
    const database = mongoose.connection;
    const bucket = new GridFSBucket(database, {
        bucketName: dbConfig.imgBucket,
    });

    const scrapedDataDir = "/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/images";
    let fileNames = fs.readdirSync(scrapedDataDir);

    await Promise.allSettled(fileNames.map(async (fileName) => {
        const fullPath = path.join(scrapedDataDir, fileName);
        if (!fileName.endsWith(".jpg")) {
            return;
        }
        return new Promise((resolve, reject) => fs.createReadStream(fullPath).pipe(bucket.openUploadStream(fileName)).on("finish", resolve));
    }));
}

const performInserts = async () => {
    await insertPlatforms();
    await insertGames();
    await insertCollections();
    await insertImages();
}

performInserts().then(() => mongoose.connection.close());