import mongoose from "mongoose";

export default interface IUpdateCartRequest {
  games: { id: mongoose.Types.ObjectId; amount: number }[];
}
