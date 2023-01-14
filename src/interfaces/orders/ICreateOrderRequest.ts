import mongoose from "mongoose";
import { IOrderDeliveryDetails, IOrderGame } from "../../models/order";

export default interface ICreateOrderRequest {
  games: { id: mongoose.Types.ObjectId; amount: number }[];
  cardLastDigits: string;
  deliveryDetails: IOrderDeliveryDetails;
  email: string;
}
