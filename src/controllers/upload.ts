import { imgBucket } from "../config/db";
import { filesURL } from "../config/server";
import { database } from "../middleware/db";
import upload from "../middleware/upload";

import { Request, Response } from "express";
import { GridFSBucket } from "mongodb";

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

const download = async (req: Request, res: Response) => {
  try {
    const bucket = new GridFSBucket(database.db, {
      bucketName: imgBucket,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
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

export {
  uploadFiles,
  getListFiles,
  download,
};
