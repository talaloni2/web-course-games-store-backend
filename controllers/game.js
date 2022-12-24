const Game = require("../models/game")
const gamesMapper = require("../dto-mappers/game-mapper");

const gamesList = async (req, resp) => {
    let games = await Game.find({});
    games = gamesMapper.mapToGamesList(games);

    resp.json(games);
}

module.exports = {
    gamesList
}