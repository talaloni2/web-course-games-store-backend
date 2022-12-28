import { filesURL } from "../../config/server";

let imagesUrl = filesURL;

const getImageUrlIfExists = (imageId: string) => {
  if (imageId === null || imageId === undefined) return null;
  return `${imagesUrl}${imageId}`;
};

export { getImageUrlIfExists };
