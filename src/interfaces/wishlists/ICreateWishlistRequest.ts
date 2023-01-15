import mongoose from "mongoose";

export default interface ICreateWishlistRequest {
  name: string;
  games: {id: mongoose.Types.ObjectId, amount: number}[];
}
