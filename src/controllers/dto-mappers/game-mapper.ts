import ICreateGameRequest from "../../interfaces/games/ICreateGameRequest";
import IUpdateGameRequest from "../../interfaces/games/IUpdateGameRequest";
import {IGame} from "../../models/game";
import { filterUndefined } from "../../utils/request-builder";
import { getImageUrlIfExists } from "./utils";

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


const mapToSingleGameResponse = (game: IGame) => {
    return {
        platforms: game.platforms,
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

const mapToDbGame = (gameDto: ICreateGameRequest): IGame => {
    return {
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