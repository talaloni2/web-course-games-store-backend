const Game = require("../models/game");
const { sort } = require("../utils/request-builder");
const gamesMapper = require("./dto-mappers/game-mapper");
const { buildGameListQuery } = require("./query-builders/game-query-builder");

const gamesList = async (req, resp) => {

    const search = buildGameListQuery(req.query)

    let games = await Game.find(search).sort(sort(req.query.sort));
    games = gamesMapper.mapToGamesList(games);
    resp.json(games);
}

module.exports = {
    gamesList
}