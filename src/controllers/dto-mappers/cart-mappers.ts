import ICreateCartRequest from "../../interfaces/carts/ICreateCartRequest";
import IUpdateCartRequest from "../../interfaces/carts/IUpdateCartRequest";
import { ICart } from "../../models/cart";

const mapToSingleCartResponse = (
  cart: ICart,
  gameToAvailability: Map<string, number>
) => {
  return {
    id: cart._id,
    games: cart.games.map((g) => ({
      id: g.id.toString(),
      amount: g.amount,
      isAvailable: gameToAvailability.get(g.id.toString()) >= g.amount,
    })),
  };
};

const mapToDbCart = (cart: ICreateCartRequest): ICart => {
  return {
    games: cart.games.filter((g) => g.amount !== 0),
    userId: "mock",
  };
};

const mapToDbCartUpdate = (cart: IUpdateCartRequest): ICart => {
  return {
    games: cart.games.filter((g) => g.amount !== 0),
    userId: "mock",
  };
};

export { mapToSingleCartResponse, mapToDbCart, mapToDbCartUpdate };
