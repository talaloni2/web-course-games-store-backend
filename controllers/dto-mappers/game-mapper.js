const serverConfig = require("../../config/server");

imagesUrl = serverConfig.filesURL;

const getImageUrlIfExists = (imageId) => {
    if (imageId === null || imageId === undefined) return null;
    return `${imagesUrl}${imageId}.jpg`;
}

const mapToGamesList = (games) => {
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


const mapToSingleGame = (game, platforms) => {
    return {
        platforms: platforms.map(p => {return {id: p._id, name: p.name}}),
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

module.exports = {
    mapToGamesList,
    mapToSingleGame,
};