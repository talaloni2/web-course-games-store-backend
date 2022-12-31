import util from "util";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { database } from "./db";
import { imgBucket } from "../config/db";

var storage = new GridFsStorage({
  db: database,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: imgBucket,
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
export default uploadFilesMiddleware;
