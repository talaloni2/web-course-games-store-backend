import { SortOrder } from "mongoose";
import IGameUserSearchRequest from "../../interfaces/games/IGameUserSearchRequest";
import {
  filterUndefined,
  contains,
  between,
  sort,
  listContainseOneOrMore,
} from "../../utils/request-builder";

const buildGameListQuery = (params: IGameUserSearchRequest) => {
  let search = {
    _id: params.id && params.id.split(","),
    name: contains(params.name),
    price: between(params.priceMin, params.priceMax),
    availability: between(params.availabilityMin, params.availabilityMax),
    $or: listContainseOneOrMore(params.platforms, "platforms"),
  };
  return filterUndefined(search);
};

const buildGameListSort = (sortFields: string): {[key: string]: SortOrder} => {
  let sortRequest = sort(sortFields);
  return {
    _id: sortRequest.id,
    name: sortRequest.name,
    price: sortRequest.price,
    availability: sortRequest.availability,
  };
};

export {
  buildGameListQuery,
  buildGameListSort,
};
