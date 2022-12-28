import ICreatePlatformRequest from "../../interfaces/platforms/IPlatformUserSearchRequest";
import IUpdatePlatformRequest from "../../interfaces/platforms/IUpdatePlatformRequest";
import { IPlatform } from "../../models/platform";
import { filterUndefined } from "../../utils/request-builder";
import { getImageUrlIfExists } from "./utils";

const mapToPlatformsListResponse = (platforms: IPlatform[]) => {
  return platforms.map((platform) => {
    return mapToPlatformsSingleResponse(platform);
  });
};

const mapToPlatformsSingleResponse = (platform: IPlatform) => {
  return {
    name: platform.name,
    id: platform._id,
    platformLogo: getImageUrlIfExists(platform.platform_logo),
    abbreviation: platform.abbreviation,
    alternativeName: platform.alternative_name,
  };
};

const mapToDbPlatform = (
  platformDto: ICreatePlatformRequest,
  platformId: number
): IPlatform => {
  return {
    _id: platformId,
    abbreviation: platformDto.abbreviation,
    name: platformDto.name,
    platform_logo: null,
    alternative_name: platformDto.alternativeName,
  };
};

const mapToDbPlatformUpdate = (platformDto: IUpdatePlatformRequest) => {
  return filterUndefined({
    abbreviation: platformDto.abbreviation,
    name: platformDto.name,
    alternative_name: platformDto.alternativeName,
  });
};

export {
  mapToPlatformsListResponse,
  mapToPlatformsSingleResponse,
  mapToDbPlatform,
  mapToDbPlatformUpdate,
};
