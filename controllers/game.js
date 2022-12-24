const Game = require("../models/game");
const gamesMapper = require("./dto-mappers/game-mapper");
const { buildGameListQuery, buildGameListSort } = require("./query-builders/game-query-builder");

const gamesList = async (req, resp) => {
    const search = buildGameListQuery(req.query)
    let games = await Game.find(search).sort(buildGameListSort(req.query.sort));
    games = gamesMapper.mapToGamesList(games);
    resp.json(games);
}

module.exports = {
    gamesList
}