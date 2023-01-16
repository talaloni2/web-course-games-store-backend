import mongoose from "mongoose";

interface IWishlistGame {
  id: mongoose.Types.ObjectId;
  amount: number;
}

const wishlistGameSchema = new mongoose.Schema<IWishlistGame>(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    amount: mongoose.Schema.Types.Number,
  },
  { _id: false }
);

interface IWishlist {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  games: IWishlistGame[];
}

const wishlistCollectionSchema = new mongoose.Schema<IWishlist>({
  games: [wishlistGameSchema],
  userId: mongoose.Schema.Types.String,
});

const Wishlist = mongoose.model("Wishlist", wishlistCollectionSchema);
export { IWishlist, IWishlistGame, Wishlist };
