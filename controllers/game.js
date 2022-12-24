const Game = require("../models/game");
const Platform = require("../models/platform");
const gamesMapper = require("./dto-mappers/game-mapper");
const { buildGameListQuery, buildGameListSort } = require("./query-builders/game-query-builder");

const gamesList = async (req, resp) => {
    const search = buildGameListQuery(req.query)
    let games = await Game.find(search).sort(buildGameListSort(req.query.sort));
    games = gamesMapper.mapToGamesList(games);
    resp.json(games);
}

const singleGame = async (req, resp) => {
    const game = await Game.findById(req.params.id);
    if (game === null){
        resp.sendStatus(404);
        return;
    }
    let platforms = await Platform.find({_id: game.platforms})
    const gameResponse = gamesMapper.mapToSingleGame(game, platforms);
    resp.json(gameResponse);
}

module.exports = {
    gamesList,
    singleGame,
}