import { SortOrder } from "mongoose";
import IGameCollectionUserSearchRequest from "../../interfaces/game-collections/IGameCollectionUserSearchRequest";
import { contains, filterUndefined, listContainseOneOrMore, sort } from "../../utils/request-builder";

const buildGameCollectionListQuery = (
  params: IGameCollectionUserSearchRequest
): { [key: string]: any } => {
  let search = {
    _id: params.id,
    name: contains(params.name),
    $or: listContainseOneOrMore(params.games, "games"),
  };
  return filterUndefined(search);
};

const buildGameCollectionListSort = (
  sortFields: string
): { [key: string]: SortOrder } => {
  let sortRequest = sort(sortFields);
  return {
    _id: sortRequest.id,
    name: sortRequest.name,
  };
};

export { buildGameCollectionListQuery, buildGameCollectionListSort };
