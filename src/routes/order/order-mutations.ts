import { Express } from "express";
import { body, header, param } from "express-validator";

import { json } from "body-parser";
import { addOrder, deleteOrder, updateOrder } from "../../controllers/order";
import { ensureValidThenExecute } from "../utils";
import validateToken from "../utils/token-validator";
import { IOrderDeliveryDetails } from "../../models/order";

const jsonParser = json();

const validateDeliveryDetails = async (
  deliveryDetails: IOrderDeliveryDetails,
  { req }
) => {
  if (!deliveryDetails) {
    return Promise.reject("Delivery details not supplied");
  }
  try {
    const fullNameValid =
      deliveryDetails.fullName &&
      deliveryDetails.fullName.length > 4 &&
      deliveryDetails.fullName.includes(" ");
    const mobileValid =
      deliveryDetails.mobile && /^[0-9]{10}$/.test(deliveryDetails.mobile);
    const streetValid =
      deliveryDetails.street && deliveryDetails.street.length > 2;
    const cityValid = deliveryDetails.city && deliveryDetails.city.length > 2;
    const regionValid =
      deliveryDetails.region && deliveryDetails.region.length > 2;
    const postcodeValid =
      deliveryDetails.postcode && /^[0-9]{7}$/.test(deliveryDetails.postcode);

    if (
      fullNameValid &&
      mobileValid &&
      streetValid &&
      cityValid &&
      regionValid &&
      postcodeValid
    ) {
      return Promise.resolve();
    }
    return Promise.reject("Delivery Details check failed");
  } catch (err) {
    return Promise.reject("Delivery Details check failed Due to error");
  }
};

const routes = (app: Express) => {
  app.post(
    "/orders",
    [
      body("games.*.id").isMongoId(),
      body("games").isLength({ min: 1 }),
      body("deliveryDetails").custom(validateDeliveryDetails),
      body("email").isEmail(),
      body("cardLastDigits").isLength({ min: 4, max: 4 }).isNumeric(),
      header("Authorization").custom(validateToken),
    ],
    jsonParser,
    ensureValidThenExecute(addOrder)
  );

  app.put(
    "/orders/:id",
    [
      param("id").isMongoId(),
      body("deliveryDetails").custom(validateDeliveryDetails),
      header("Authorization").custom(validateToken),
    ],
    jsonParser,
    ensureValidThenExecute(updateOrder)
  );

  app.delete(
    "/orders/:id",
    param("id").isMongoId(),
    ensureValidThenExecute(deleteOrder)
  );
};

export default routes;
