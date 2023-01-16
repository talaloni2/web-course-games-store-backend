import ICreateOrderRequest from "../../interfaces/orders/ICreateOrderRequest";
import IUpdateOrderRequest from "../../interfaces/orders/IUpdateOrderRequest";
import { IOrder, IOrderDeliveryDetails } from "../../models/order";

const mapToSingleOrderResponse = (order: IOrder) => {
  return {
    id: order._id,
    games: order.games.map((g) => ({
      id: g.id.toString(),
      amount: g.amount,
      buyPrice: g.buyPrice,
    })),
    email: order.email,
    deliveryDetails: order.deliveryDetails,
    createdAt: order.createdAt.toISOString(),
  };
};

const mapToDbOrder = (
  order: ICreateOrderRequest,
  userId,
  gameIdToPrice: Map<string, number>
): IOrder => {
  return {
    games: order.games.map(g => ({...g, buyPrice: gameIdToPrice.get(g.id.toString())})),
    userId: userId,
    email: order.email,
    deliveryDetails: order.deliveryDetails,
    cardLastDigits: order.cardLastDigits,
  };
};

const mapToDbOrderUpdate = (
  order: IUpdateOrderRequest
): { deliveryDetails: IOrderDeliveryDetails } => {
  return {
    deliveryDetails: order.deliveryDetails,
  };
};

export { mapToSingleOrderResponse, mapToDbOrder, mapToDbOrderUpdate };
