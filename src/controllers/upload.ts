import { imgBucket } from "../config/db";
import { filesURL } from "../config/server";
import { database } from "../middleware/db";
import upload from "../middleware/upload";

import { Request, Response } from "express";
import { GridFSBucket } from "mongodb";
import sharp from "sharp";

const baseUrl = filesURL;

const uploadFiles = async (req: Request, res: Response) => {
  try {
    await upload(req, res);
    console.log(req.file);

    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }

    return res.send({
      message: "File has been uploaded.",
    });
  } catch (error) {
    console.log(error);

    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const getListFiles = async (req: Request, res: Response) => {
  try {
    const images = database.collection(imgBucket + ".files");

    if ((await images.estimatedDocumentCount()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    const cursor = images.find({});

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req: Request<{name}, {}, {}, {height, width}>, res: Response) => {
  try {
    const bucket = new GridFSBucket(database.db, {
      bucketName: imgBucket,
    });
    const height: number = parseInt(req.query.height, 10) || 300;
    const width: number = parseInt(req.query.width, 10) || 300;

    var transformer = sharp().resize(width, height, {
      fit: sharp.fit.fill,
    });

    var cursor = database.collection(imgBucket + ".files").find({filename: req.params.name});
    if ((await cursor.toArray()).length == 0){
      return res.sendStatus(404);
    }

    let downloadStream = bucket
      .openDownloadStreamByName(req.params.name)
      .pipe(transformer);

    downloadStream.on("data", async function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

export { uploadFiles, getListFiles, download };
