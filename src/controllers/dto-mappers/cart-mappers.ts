import ICreateCartRequest from "../../interfaces/carts/ICreateCartRequest";
import IUpdateCartRequest from "../../interfaces/carts/IUpdateCartRequest";
import { ICart, ICartGame } from "../../models/cart";

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

const mapToDbCart = (cart: ICreateCartRequest, userId): ICart => {
  return {
    games: cart.games.filter((g) => g.amount !== 0),
    userId: userId,
  };
};

const mapToDbCartUpdate = (cart: IUpdateCartRequest): {games: ICartGame[]} => {
  return {
    games: cart.games.filter((g) => g.amount !== 0)
  };
};

export { mapToSingleCartResponse, mapToDbCart, mapToDbCartUpdate };
