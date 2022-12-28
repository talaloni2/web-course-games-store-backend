const Game = require("../models/game");
const Platform = require("../models/platform");
const gamesMapper = require("./dto-mappers/game-mapper");
const { buildGameListQuery, buildGameListSort } = require("./query-builders/game-query-builder");
const dbConfig = require("../config/db");
const { database } = require("../middleware/db");
const uploadImage = require("../middleware/upload");


const gamesList = async (req, res) => {
    const search = buildGameListQuery(req.query)
    let games = await Game.find(search).sort(buildGameListSort(req.query.sort));
    games = gamesMapper.mapToGamesListResponse(games);
    res.json(games);
}

const singleGame = async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (game === null) {
        res.sendStatus(404);
        return;
    }
    let platforms = await Platform.find({ _id: game.platforms })
    const gameResponse = gamesMapper.mapToSingleGameResponse(game, platforms);
    res.json(gameResponse);
}

const addGame = async (req, res) => {

    const gameWithSameName = await Game.findOne({name: req.body.name});
    if (gameWithSameName !== null) {
        res.status(400);
        return res.json({"message": "game with the same name already exists"});
    }

    const gameWithLargestId = await Game.find({}).sort({ _id: -1 }).limit(1);
    const currentId = gameWithLargestId.at(0)._id + 1;

    let createdGame = gamesMapper.mapToDbGame(req.body, currentId);

    const requestedPlatforms = createdGame.platforms;
    let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
    if (platforms.length != requestedPlatforms.length) {
        res.sendStatus(400);
        res.send("One or more specified platforms do not exist");
    }

    var game = new Game(createdGame);
    game = await game.save();
    return res.json({ id: game._id });
}

const attachCover = async (req, res) => {
    try {
        var game = await Game.findById(req.params.id);
        if (game === null) {
            return res.sendStatus(404);
        }

        await uploadImage(req, res);
        if (req.file == undefined) {
            res.status(400);
            return res.json({
                message: "You must select a file.",
            });
        }
        game.cover = req.file.filename;
        game = await game.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
}

const attachScreenshot = async (req, res) => {
    try {
        var game = await Game.findById(req.params.id);
        if (game === null) {
            return res.sendStatus(404);
        }

        await uploadImage(req, res);
        if (req.file == undefined) {
            res.status(400);
            return res.json({
                message: "You must select a file.",
            });
        }
        game.screenshots = game.screenshots;
        game.screenshots.push(req.file.filename);
        game = await game.save();
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
}

const updateGame = async (req, res) => {

    const gameWithSameName = await Game.findOne({name: req.body.name, _id: {$ne: req.params.id}});
    if (gameWithSameName !== null) {
        res.status(400);
        return res.json({"message": "game with the same name already exists"});
    }

    var gameToUpdate = await Game.findById(req.params.id);
    if (gameToUpdate === null){
        return res.sendStatus(404);
    }

    var updatedFields = gamesMapper.mapToDbGameUpdate(req.body);
    Object.assign(gameToUpdate, updatedFields);

    const requestedPlatforms = gameToUpdate.platforms;
    let platforms = await Platform.find({ _id: { $in: requestedPlatforms } });
    if (platforms.length != requestedPlatforms.length) {
        res.sendStatus(400);
        res.send("One or more specified platforms do not exist");
    }

    var game = await gameToUpdate.save();
    return res.json({ id: game._id });
}

const deleteGame = async (req, res) => {
    var gameToDelete = await Game.findById(req.params.id);
    if (gameToDelete === null){
        return res.sendStatus(404);
    }

    await gameToDelete.delete();
    return res.sendStatus(200);
}

module.exports = {
    gamesList,
    singleGame,
    addGame,
    attachCover,
    attachScreenshot,
    updateGame,
    deleteGame,
}