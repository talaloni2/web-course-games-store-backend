import mongoose from "mongoose";

export default interface ICreateCartRequest {
  games: { id: mongoose.Types.ObjectId; amount: number }[];
}
