import mongoose from "mongoose";

interface IOrderDeliveryDetails {
  fullName: string;
  mobile: string;
  street: string;
  city: string;
  region: string;
  postcode: string;
}

const orderDeliveryDetailsSchema = new mongoose.Schema<IOrderDeliveryDetails>(
  {
    fullName: mongoose.Schema.Types.String,
    mobile: mongoose.Schema.Types.String,
    street: mongoose.Schema.Types.String,
    city: mongoose.Schema.Types.String,
    region: mongoose.Schema.Types.String,
    postcode: mongoose.Schema.Types.String,
  },
  { _id: false }
);

interface IOrderGame {
  id: mongoose.Types.ObjectId;
  amount: number;
  buyPrice: number;
}

const orderGameSchema = new mongoose.Schema<IOrderGame>(
  {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    amount: mongoose.Schema.Types.Number,
    buyPrice: mongoose.Schema.Types.Number,
  },
  { _id: false }
);

interface IOrder {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  games: IOrderGame[];
  deliveryDetails: IOrderDeliveryDetails;
  cardLastDigits: string;
}

const orderCollectionSchema = new mongoose.Schema<IOrder>({
  games: [orderGameSchema],
  userId: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  deliveryDetails: orderDeliveryDetailsSchema,
  cardLastDigits: mongoose.Schema.Types.String,
});

const Order = mongoose.model("Order", orderCollectionSchema);
export { IOrder, IOrderDeliveryDetails, IOrderGame, Order };
