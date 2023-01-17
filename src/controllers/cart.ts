import { Request, Response } from "express";
import { Cart } from "../models/cart";
import { Game } from "../models/game";
import {
  mapToDbCart,
  mapToDbCartUpdate,
  mapToSingleCartResponse,
} from "./dto-mappers/cart-mappers";
import { Mutex } from "async-mutex";

const getCart = async (req: Request, res: Response) => {
  const cart = await Cart.findOne({
    _id: req.params.id,
    userId: req.headers.userId,
  });
  if (cart === null) {
    res.sendStatus(404);
    return;
  }

  let relatedGames = await Game.find({
    _id: { $in: cart.games.map((g) => g.id) },
  });
  let availabilityById: Map<string, number> = new Map(
    relatedGames.map((g) => [g._id.toString(), g.availability])
  );

  const gameResponse = mapToSingleCartResponse(cart, availabilityById);
  res.json(gameResponse);
};

const mutex = new Mutex();
const getCartByUser = async (req: Request, res: Response) => {
  const cart = await mutex.runExclusive(async () => {
    var cart = await Cart.findOne({ userId: req.headers.userId });
    if (cart === null) {
      cart = new Cart({ userId: req.headers.userId, games: [] });
      await cart.save();
    }
    return cart;
  });

  let relatedGames = await Game.find({
    _id: { $in: cart.games.map((g) => g.id) },
  });
  let availabilityById: Map<string, number> = new Map(
    relatedGames.map((g) => [g._id.toString(), g.availability])
  );

  const gameResponse = mapToSingleCartResponse(cart, availabilityById);
  res.json(gameResponse);
};

const addCart = async (req: Request, res: Response) => {
  return await mutex.runExclusive(async () => {
    var existingCartForUser = await Cart.findOne({
      userId: req.headers.userId,
    });
    if (existingCartForUser !== null) {
      return res.status(400).send("User already have a cart");
    }

    let createdCart = mapToDbCart(req.body, req.headers.userId);

    const requestedGameIds = createdCart.games.map((g) => g.id);
    try {
      let games = await Game.find({ _id: { $in: requestedGameIds } });
      if (games.length != requestedGameIds.length) {
        res.status(400);
        return res.send("One or more specified games do not exist");
      }
    } catch (err) {
      console.log(err);
    }

    var cart = new Cart(createdCart);
    existingCartForUser = await Cart.findOne({
      userId: req.headers.userId,
    });
    if (existingCartForUser !== null) {
      return res.json({ id: cart._id });
    }
    cart = await cart.save();
    return res.json({ id: cart._id });
  });
};

const updateCart = async (req: Request, res: Response) => {
  var cartToUpdate = await Cart.findById(req.params.id);
  if (cartToUpdate === null) {
    return res.sendStatus(404);
  }

  var updatedFields = mapToDbCartUpdate(req.body);
  Object.assign(cartToUpdate, updatedFields);

  const requestedGameIds = cartToUpdate.games.map((g) => g.id);
  let games = await Game.find({ _id: { $in: requestedGameIds } });
  if (games.length != requestedGameIds.length) {
    res.status(400);
    return res.send("One or more specified games do not exist");
  }

  var cart = await cartToUpdate.save();
  return res.json({ id: cart._id });
};

const deleteCart = async (req: Request, res: Response) => {
  var cartToDelete = await Cart.findById(req.params.id);
  if (cartToDelete === null) {
    return res.sendStatus(404);
  }

  await cartToDelete.delete();
  return res.sendStatus(200);
};

export { addCart, getCart, updateCart, getCartByUser, deleteCart };
