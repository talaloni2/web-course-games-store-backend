import {Request, Response} from "express";
import {Wishlist} from "../models/wishlist";
import {Game} from "../models/game";
import {
    mapToDbWishlist,
    mapToDbWishlistUpdate,
    mapToSingleWishlistResponse,
} from "./dto-mappers/wishlist-mappers";

const getWishlist = async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({
        _id: req.params.id,
        userId: req.headers.userId,
    });
    if (wishlist === null) {
        res.sendStatus(404);
        return;
    }

    let relatedGames = await Game.find({
        _id: {$in: wishlist.games.map((g) => g.id)},
    });
    let availabilityById: Map<string, number> = new Map(
        relatedGames.map((g) => [g._id.toString(), g.availability])
    );

    const gameResponse = mapToSingleWishlistResponse(wishlist, availabilityById);
    res.json(gameResponse);
};

const getWishlistByUser = async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({userId: req.headers.userId});
    if (wishlist === null) {
        res.sendStatus(404);
        return;
    }

    let relatedGames = await Game.find({
        _id: {$in: wishlist.games.map((g) => g.id)},
    });
    let availabilityById: Map<string, number> = new Map(
        relatedGames.map((g) => [g._id.toString(), g.availability])
    );

    const gameResponse = mapToSingleWishlistResponse(wishlist, availabilityById);
    res.json(gameResponse);
};

const addWishlist = async (req: Request, res: Response) => {
    const existingWishlistForUser = await Wishlist.findOne({
        userId: req.headers.userId,
    });
    if (existingWishlistForUser !== null) {
        return res.status(400).send("User already have a wishlist");
    }

    let createdWishlist = mapToDbWishlist(req.body, req.headers.userId);

    const requestedGameIds = createdWishlist.games.map((g) => g.id);
    try {
        let games = await Game.find({_id: {$in: requestedGameIds}});
        if (games.length != requestedGameIds.length) {
            res.status(400);
            return res.send("One or more specified games do not exist");
        }
    } catch (err) {
        console.log(err);
    }

    var wishlist = new Wishlist(createdWishlist);
    wishlist = await wishlist.save();
    return res.json({id: wishlist._id});
};

const updateWishlist = async (req: Request, res: Response) => {
    var wishlistToUpdate = await Wishlist.findById(req.params.id);
    if (wishlistToUpdate === null) {
        return res.sendStatus(404);
    }

    var updatedFields = mapToDbWishlistUpdate(req.body);
    Object.assign(wishlistToUpdate, updatedFields);

    const requestedGameIds = wishlistToUpdate.games.map((g) => g.id);
    let games = await Game.find({_id: {$in: requestedGameIds}});
    if (games.length != requestedGameIds.length) {
        res.status(400);
        return res.send("One or more specified games do not exist");
    }

    var wishlist = await wishlistToUpdate.save();
    return res.json({id: wishlist._id});
};


const deleteWishlistByUser = async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({userId: req.headers.userId});
    if (wishlist === null) {
        res.sendStatus(404);
        return;
    }
    try {
        res.json(await Wishlist.deleteOne({userId: req.headers.userId}));
    } catch (err) {
        res.sendStatus(500);
    }


};

export {addWishlist, getWishlist, updateWishlist, getWishlistByUser, deleteWishlistByUser};
