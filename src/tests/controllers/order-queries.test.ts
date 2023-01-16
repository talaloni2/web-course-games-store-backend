import mongoose from "mongoose";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { IOrderDeliveryDetails } from "../../models/order";
import { app } from "../../server";
import { closeServerResources } from "./utils";

var mockUserId = "mockUUID";

jest.mock("../../middleware/firebase", () => ({
  get getAuth() {
    const verifyIdToken = jest.fn();
    verifyIdToken.mockReturnValue({ uid: mockUserId });
    return () => ({ verifyIdToken });
  },
  app: jest.fn(),
}));

jest.mock("../../config/db", () => ({
  get url() {
    const testConfig = require("../tests-config");
    return `mongodb://${testConfig.mongoDockerConfig.host}:${testConfig.mongoDockerConfig.port}/`;
  },
  database: "web_course_final_project",
  imgBucket: "photos",
}));

beforeEach(() => {
  mockUserId = uuid();
});

afterAll(async () => {
  await closeServerResources();
});

const mockDeliveryDetails: IOrderDeliveryDetails = {
  fullName: "Test User",
  mobile: "0541111111",
  street: "Imagined",
  city: "Imagined",
  region: "Imagined",
  postcode: "1234576",
};

const mockEmailAddress: string = "feyobeh748@tohup.com";
const buyPrice = 100;

const createGame = async (availability: number): Promise<string> => {
  var resp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: buyPrice,
      availability: availability,
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;
  return responseObject.id;
};

test("Get order", async () => {
  const createdGameId = await createGame(2);
  const createdOrder = await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(200);

  const orderResponse = await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(orderResponse.body.games.length).toEqual(1);
  expect(orderResponse.body.games[0].id).toEqual(createdGameId);
  expect(orderResponse.body.games[0].amount).toEqual(1);
  expect(orderResponse.body.games[0].buyPrice).toEqual(buyPrice);
  expect(orderResponse.body.email).toEqual(mockEmailAddress);
  expect(orderResponse.body.deliveryDetails).toEqual(mockDeliveryDetails);
  expect(orderResponse.body.createdAt).not.toBeNull();
  expect(orderResponse.body.createdAt).not.toBe("");
  expect(orderResponse.body.createdAt).not.toBe(undefined);
  expect(orderResponse.body.id).not.toBeNull();
  expect(orderResponse.body.id).not.toBe("");
  expect(orderResponse.body.id).not.toBe(undefined);
  await request(app).get(`/orders/${new mongoose.Types.ObjectId()}`).expect(404);
});

test("Cannot get other users orders", async () => {
  const createdGameId = await createGame(2);
  const createdOrder = await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(200);
  
    await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  mockUserId = uuid();

  await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(404);
});
