const Game = require("../models/game");
const Platform = require("../models/platform");
const gamesMapper = require("./dto-mappers/game-mapper");
const { buildGameListQuery, buildGameListSort } = require("./query-builders/game-query-builder");
const dbConfig = require("../config/db");
const { database } = require("../middleware/db");
const uploadImage = require("../middleware/upload");


const gamesList = async (req, resp) => {
    const search = buildGameListQuery(req.query)
    let games = await Game.find(search).sort(buildGameListSort(req.query.sort));
    games = gamesMapper.mapToGamesListResponse(games);
    resp.json(games);
}

const singleGame = async (req, resp) => {
    const game = await Game.findById(req.params.id);
    if (game === null) {
        resp.sendStatus(404);
        return;
    }
    let platforms = await Platform.find({ _id: game.platforms })
    const gameResponse = gamesMapper.mapToSingleGameResponse(game, platforms);
    resp.json(gameResponse);
}

const addGame = async (req, resp) => {

    const gameWithSameName = await Game.findOne({name: req.body.name});
    if (gameWithSameName !== null) {
        resp.status(400);
        return resp.json({"message": "game with the same name already exists"});
    }

    const gameWithLargestId = await Game.find({}).sort({ _id: -1 }).limit(1);
    const currentId = gameWithLargestId.at(0)._id + 1;

    let createdGame = gamesMapper.mapToDbGame(req.body, currentId);

    const requestedPlatforms = req.body.platforms;
    let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
    if (platforms.length != requestedPlatforms.length) {
        resp.sendStatus(400);
        resp.send("One or more specified platforms do not exist");
    }

    var game = new Game(createdGame);
    game = await game.save();
    return resp.json({ id: game._id });
}

const attachCover = async (req, resp) => {
    try {
        var game = await Game.findById(req.params.id);
        if (game === null) {
            return resp.sendStatus(404);
        }

        await uploadImage(req, resp);
        if (req.file == undefined) {
            resp.status(400);
            return resp.json({
                message: "You must select a file.",
            });
        }
        game.cover = req.file.filename;
        game = await game.save();
        return resp.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
}

const attachScreenshot = async (req, resp) => {
    try {
        var game = await Game.findById(req.params.id);
        if (game === null) {
            return resp.sendStatus(404);
        }

        await uploadImage(req, resp);
        if (req.file == undefined) {
            resp.status(400);
            return resp.json({
                message: "You must select a file.",
            });
        }
        game.screenshots = game.screenshots || [];
        game.screenshots.push(req.file.filename);
        game = await game.save();
        return resp.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
}

const updateGame = async (req, resp) => {

    const gameWithSameName = await Game.findOne({name: req.body.name, _id: {$ne: req.params.id}});
    if (gameWithSameName !== null) {
        resp.status(400);
        return resp.json({"message": "game with the same name already exists"});
    }

    var gameToUpdate = await Game.findById(req.params.id);
    if (gameToUpdate === null){
        return resp.sendStatus(404);
    }

    var updatedFields = gamesMapper.mapToDbGameUpdate(req.body);
    Object.assign(gameToUpdate, updatedFields);

    const requestedPlatforms = gameToUpdate.platforms;
    let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
    if (platforms.length != requestedPlatforms.length) {
        resp.sendStatus(400);
        resp.send("One or more specified platforms do not exist");
    }

    var game = await gameToUpdate.save();
    return resp.json({ id: game._id });
}



module.exports = {
    gamesList,
    singleGame,
    addGame,
    attachCover,
    attachScreenshot,
    updateGame,
}