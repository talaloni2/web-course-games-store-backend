import { IOrderDeliveryDetails, IOrderGame } from "../../models/order";

export default interface IUpdateOrderRequest {
  deliveryDetails: IOrderDeliveryDetails;
}
