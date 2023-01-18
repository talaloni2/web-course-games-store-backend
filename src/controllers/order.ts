import { Request, Response } from "express";
import { Game } from "../models/game";
import { Order } from "../models/order";
import { nowMilliseconds } from "../utils/time-utils";
import {
  mapToDbOrder,
  mapToDbOrderUpdate,
  mapToSingleOrderResponse,
} from "./dto-mappers/order-mappers";

const getOrder = async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.headers.userId,
  });
  if (order === null) {
    res.sendStatus(404);
    return;
  }

  const response = mapToSingleOrderResponse(order);
  res.json(response);
};

const getOrdersByUser = async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.headers.userId });

  const response = orders.map((o) => mapToSingleOrderResponse(o));
  res.json(response);
};

const addOrder = async (req: Request, res: Response) => {
  const requestedGameIds = req.body.games.map((g) => g.id);
  let games = [];
  try {
    games = await Game.find({ _id: { $in: requestedGameIds } });
    if (games.length != requestedGameIds.length) {
      res.status(400);
      return res.send("One or more specified games do not exist");
    }

    const gameAvailabilityById: Map<string, number> = new Map(
      games.map((g) => [g._id.toString(), g.availability])
    );
    const requestedAboveAvailability = req.body.games.some(
      (g) => g.amount > gameAvailabilityById.get(g.id.toString())
    );
    if (requestedAboveAvailability) {
      res.status(400);
      return res.send("Some games aren't available at the requested amount");
    }

    const gameIdToOrderedAmount: Map<string, number> = new Map(
      req.body.games.map((g) => [g.id, g.amount])
    );
    await Promise.all(
      games.map(async (game) => {
        game.availability =
          game.availability - gameIdToOrderedAmount.get(game._id.toString());
        await game.save();
      })
    );
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }

  const gameIdToPrice: Map<string, number> = new Map(
    games.map((g) => [g._id.toString(), g.price])
  );

  let createdOrder = mapToDbOrder(req.body, req.headers.userId, gameIdToPrice);

  var order = new Order(createdOrder);
  order = await order.save();
  return res.json({ id: order._id });
};

const updateOrder = async (req: Request, res: Response) => {
  const orderToUpdate = await Order.findOne({
    _id: req.params.id,
    userId: req.headers.userId,
  });

  if (orderToUpdate === null) {
    return res.sendStatus(404);
  }

  var updatedFields = mapToDbOrderUpdate(req.body);
  Object.assign(orderToUpdate, updatedFields);

  var order = await orderToUpdate.save();
  return res.json({ id: order._id });
};

const deleteOrder = async (req: Request, res: Response) => {
  var orderToDelete = await Order.findById(req.params.id);
  if (orderToDelete === null) {
    return res.sendStatus(404);
  }

  const nowMS = nowMilliseconds();
  if (nowMilliseconds() > orderToDelete.createdAt.getTime() + 30 * 60000) {
    res.status(400);
    return res.json({
      message:
        "Cannot delete order because more than 30 minutes had passed since it was placed",
    });
  }

  const requestedGameIds = orderToDelete.games.map((g) => g.id.toString());
  const games = await Game.find({ _id: { $in: requestedGameIds } });
  const gameIdToOrderedAmount: Map<string, number> = new Map(
    orderToDelete.games.map((g) => [g.id.toString(), g.amount])
  );
  await Promise.all(
    games.map(async (game) => {
      game.availability =
        game.availability + gameIdToOrderedAmount.get(game._id.toString());
      await game.save();
    })
  );

  await orderToDelete.delete();
  return res.sendStatus(200);
};

const getTotalOrders = async (req: Request, res: Response) => {
  const totalOrdersWithSpent = await Order.aggregate([
    {
      $group: {
        _id: "$userId",
        total: {
          $accumulator: {
            init: "function(){return {ordersCount: 0, totalSpent: 0}}",
            accumulate:
              "function(state, games){const orderTotal = games.reduce((prev, game)=>prev + (game.buyPrice * game.amount), 0); return {ordersCount: state.ordersCount + 1, totalSpent:state.totalSpent + orderTotal}}",
            accumulateArgs: ["$games"],
            merge:
              "function(state1, state2){return {ordersCount: state1.ordersCount + state2.ordersCount, totalSpent: state1.totalSpent + state2.totalSpent}}",
            lang: "js",
          },
        },
      },
    },
  ]);

  const aggregatedTotalForUser = totalOrdersWithSpent.find(
    (e) => e._id === req.headers.userId
  ) || { ordersCount: 0, totalSpent: 0 };

  res.json(aggregatedTotalForUser.total);
};

export {
  addOrder,
  getOrder,
  updateOrder,
  getOrdersByUser,
  deleteOrder,
  getTotalOrders,
};
