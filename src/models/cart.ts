import mongoose from "mongoose";

interface ICartGame {
  id: mongoose.Types.ObjectId;
  amount: number;
}

const cartGameSchema = new mongoose.Schema<ICartGame>(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    amount: mongoose.Schema.Types.Number,
  },
  { _id: false }
);

interface ICart {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  games: ICartGame[];
}

const cartCollectionSchema = new mongoose.Schema<ICart>({
  games: [cartGameSchema],
});

const Cart = mongoose.model("Cart", cartCollectionSchema);
export { ICart, ICartGame, Cart };
