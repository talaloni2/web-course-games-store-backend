import ICreateGameCollectionRequest from "../../interfaces/game-collections/ICreateGameCollectionRequest";
import IUpdateGameCollectionRequest from "../../interfaces/game-collections/IUpdateGameCollectionRequest";
import { IGameCollection } from "../../models/game-collection";
import { filterUndefined } from "../../utils/request-builder";

const mapToGameCollectionsListResponse = (gameCollections: IGameCollection[]) => {
  return gameCollections.map((platform) => {
    return mapToGameCollectionSingleResponse(platform);
  });
};

const mapToGameCollectionSingleResponse = (gameCollection: IGameCollection) => {
  return {
    name: gameCollection.name,
    id: gameCollection._id,
    games: gameCollection.games,
  };
};

const mapToDbGameCollection = (
  gameCollectionDto: ICreateGameCollectionRequest,
): IGameCollection => {
  return {
    name: gameCollectionDto.name,
    games: gameCollectionDto.games || [],
  };
};

const mapToDbGameCollectionUpdate = (gameCollectionDto: IUpdateGameCollectionRequest) => {
  return filterUndefined({
    name: gameCollectionDto.name,
    games: gameCollectionDto.games,
  });
};

export {
  mapToDbGameCollectionUpdate,
  mapToDbGameCollection,
  mapToGameCollectionSingleResponse,
  mapToGameCollectionsListResponse,
};
