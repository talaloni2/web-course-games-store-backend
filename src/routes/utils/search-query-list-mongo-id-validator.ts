import { CustomValidator } from "express-validator";
import { isValidObjectId } from "mongoose";

const searchQueryMongoIdValidator: CustomValidator = async (
  queryParam: string
) => {
  if (
    queryParam !== undefined &&
    queryParam !== null &&
    queryParam.split(",").some((gid) => !isValidObjectId(gid))
  ) {
    return Promise.reject(`id search criteria contain invalid ids`);
  }
  return Promise.resolve();
};

export default searchQueryMongoIdValidator;