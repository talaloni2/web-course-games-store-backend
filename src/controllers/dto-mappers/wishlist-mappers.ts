import ICreateWishlistRequest from "../../interfaces/wishlists/ICreateWishlistRequest";
import IUpdateWishlistRequest from "../../interfaces/wishlists/IUpdateWishlistRequest";
import { IWishlist, IWishlistGame } from "../../models/wishlist";

const mapToSingleWishlistResponse = (
  wishlist: IWishlist,
  gameToAvailability: Map<string, number>
) => {
  return {
    id: wishlist._id,
    games: wishlist.games.map((g) => ({
      id: g.id.toString(),
      amount: g.amount,
      isAvailable: gameToAvailability.get(g.id.toString()) >= g.amount,
    })),
  };
};

const mapToDbWishlist = (wishlist: ICreateWishlistRequest, userId): IWishlist => {
  return {
    games: wishlist.games,
    userId: userId,
  };
};

const mapToDbWishlistUpdate = (wishlist: IUpdateWishlistRequest): {games: IWishlistGame[]} => {
  return {
    games: wishlist.games.filter((g) => g.amount !== 0)
  };
};

export { mapToSingleWishlistResponse, mapToDbWishlist, mapToDbWishlistUpdate };
