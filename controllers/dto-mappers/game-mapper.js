const serverConfig = require("../../config/server");
const Game = require("../../models/game");
const { filterUndefined } = require("../../utils/request-builder");

imagesUrl = serverConfig.filesURL;

const getImageUrlIfExists = (imageId) => {
    if (imageId === null || imageId === undefined) return null;
    return `${imagesUrl}${imageId}`;
}

const mapToGamesListResponse = (games) => {
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


const mapToSingleGameResponse = (game, platforms) => {
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

const mapToDbGame = (gameDto, gameId) => {
    return {
        _id: gameId,
        totalRating: gameDto.totalRating,
        name: gameDto.name,
        platforms: gameDto.platforms,
        slug: gameDto.slug,
        summary: gameDto.summary,
        price: gameDto.price,
        availability: gameDto.availability
    };
}

const mapToDbGameUpdate = (gameDto) => {
    return filterUndefined({
        totalRating: gameDto.totalRating,
        name: gameDto.name,
        platforms: gameDto.platforms,
        slug: gameDto.slug,
        summary: gameDto.summary,
        price: gameDto.price,
        availability: gameDto.availability
    });
}

module.exports = {
    mapToGamesListResponse,
    mapToSingleGameResponse,
    mapToDbGame,
    mapToDbGameUpdate,
};