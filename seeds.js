const fs = require('fs');
const path = require('path')
const dbConfig = require("./config/db");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;

const mongoClient = new MongoClient(url);

mongoClient.connect().then((_) => {
    return new Promise((resolve, reject) => {const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

    const scrapedDataDir = "/Users/talaloni/PycharmProjects/colman/web-course-games-api-scraper/scraped_data/images";
    let fileNames = fs.readdirSync(scrapedDataDir);
    
    Promise.allSettled(fileNames.map((fileName) => {
        const fullPath = path.join(scrapedDataDir, fileName);
        if (!fileName.endsWith(".jpg")){
            return;
        }
        return new Promise( (resolve, reject)=> fs.createReadStream(fullPath).pipe(bucket.openUploadStream(fileName)).on("finish", resolve));
    })).then(resolve);
})
}).then(process.exit);
