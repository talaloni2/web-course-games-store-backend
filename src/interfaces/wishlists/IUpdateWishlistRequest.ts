import mongoose from "mongoose";

export default interface IUpdateWishlistRequest {
  name: string;
  games: {id: mongoose.Types.ObjectId, amount: number}[];
}
