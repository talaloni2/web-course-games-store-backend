import { filesURL } from "../../config/server";
import ICreateGameRequest from "../../interfaces/ICreateGameRequest";
import IUpdateGameRequest from "../../interfaces/IUpdateGameRequest";
import {IGame} from "../../models/game";
import { IPlatform } from "../../models/platform";
import { filterUndefined } from "../../utils/request-builder";

let imagesUrl = filesURL;

const getImageUrlIfExists = (imageId: string) => {
    if (imageId === null || imageId === undefined) return null;
    return `${imagesUrl}${imageId}`;
}

const mapToGamesListResponse = (games: IGame[]) => {
    return games.map(game => {
        return {
            rating: game.totalRating || null,
            name: game.name,
            cover: getImageUrlIfExists(game.cover),
            id: game._id,
            price: game.price,
            availability: game.availability,
            platforms: game.platforms,
        }
    });
}


const mapToSingleGameResponse = (game: IGame, platforms: IPlatform[]) => {
    return {
        platforms: platforms.map(p => { return { id: p._id, name: p.name } }),
        rating: game.totalRating || null,
        name: game.name,
        cover: getImageUrlIfExists(game.cover),
        screenshots: game.screenshots.map(sc => getImageUrlIfExists(sc)),
        summary: game.summary,
        id: game._id,
        price: game.price,
        availability: game.availability,
    };
}

const mapToDbGame = (gameDto: ICreateGameRequest, gameId: number): IGame => {
    return {
        _id: gameId,
        totalRating: gameDto.totalRating || 1,
        name: gameDto.name,
        platforms: gameDto.platforms || [],
        summary: gameDto.summary || "",
        price: gameDto.price || 10,
        availability: gameDto.availability || 1,
        screenshots: [],
        cover: null,
    };
}

const mapToDbGameUpdate = (gameDto: IUpdateGameRequest) => {
    return filterUndefined({
        totalRating: gameDto.totalRating,
        name: gameDto.name,
        platforms: gameDto.platforms,
        summary: gameDto.summary,
        price: gameDto.price,
        availability: gameDto.availability
    });
}

export {
    mapToGamesListResponse,
    mapToSingleGameResponse,
    mapToDbGame,
    mapToDbGameUpdate,
};