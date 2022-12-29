import { SortOrder } from "mongoose";
import IPlatformUserSearchRequest from "../../interfaces/platforms/IPlatformUserSearchRequest";
import { contains, filterUndefined, sort } from "../../utils/request-builder";

const buildPlatformListQuery = (
  params: IPlatformUserSearchRequest
): { [key: string]: any } => {
  let search = {
    _id: params.id,
    name: contains(params.name),
    alternative_name: contains(params.alternativeName),
    abbreviation: contains(params.abbreviation),
  };
  return filterUndefined(search);
};

const buildPlatformListSort = (
  sortFields: string
): { [key: string]: SortOrder } => {
  let sortRequest = sort(sortFields);
  return {
    _id: sortRequest.id,
    name: sortRequest.name,
    alternative_name: sortRequest.price,
    abbreviation: sortRequest.availability,
  };
};

export { buildPlatformListQuery, buildPlatformListSort };
