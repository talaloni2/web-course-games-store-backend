import mongoose from "mongoose";

export default interface ICreateCartRequest {
  name: string;
  games: {id: mongoose.Types.ObjectId, amount: number}[];
}
