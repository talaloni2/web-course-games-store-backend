import mongoose from "mongoose";

export default interface IUpdateCartRequest {
  name: string;
  games: {id: mongoose.Types.ObjectId, amount: number}[];
}
