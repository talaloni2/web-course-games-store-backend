import mongoose from "mongoose";
import request from "supertest";
import { v4 as uuid } from "uuid";
import ICreateOrderRequest from "../../interfaces/orders/ICreateOrderRequest";
import { IOrderDeliveryDetails, IOrderGame } from "../../models/order";
import { app } from "../../server";
import { closeServerResources } from "./utils";

var mockUserId;

jest.mock("../../middleware/firebase", () => ({
  get getAuth() {
    const verifyIdToken = jest.fn();
    verifyIdToken.mockReturnValue({ uid: mockUserId });
    return () => ({ verifyIdToken });
  },
  app: jest.fn(),
}));

beforeEach(() => {
  mockUserId = uuid();
  mockGetCurrentTime.mockReturnValue(new Date().getTime());
});

jest.mock("../../config/db", () => ({
  get url() {
    const testConfig = require("../tests-config");
    return `mongodb://${testConfig.mongoDockerConfig.host}:${testConfig.mongoDockerConfig.port}/`;
  },
  database: "web_course_final_project",
  imgBucket: "photos",
}));

var mockGetCurrentTime = jest.fn();
mockGetCurrentTime.mockReturnValue(new Date().getTime());
jest.mock("../../utils/time-utils", () => ({
  get nowMilliseconds() {
    return mockGetCurrentTime;
  },
}));

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

const createGame = async (availability: number): Promise<string> => {
  var resp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: availability,
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;
  return responseObject.id;
};

test("Create order", async () => {
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

  const gameAfterOrder = await request(app)
    .get(`/games/${createdGameId}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameAfterOrder.body.availability).toBe(1);
});

test("Create order forbid invalid delivery details", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: {},
      games: [{ id: createdGameId, amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Create order forbid game amount more than availability", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: {},
      games: [{ id: createdGameId, amount: 5 }],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Create order forbid invalid cardLastDigits", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "123",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Create order forbid empty games", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Create order forbid non existing game", async () => {
  const createdOrder = await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: new mongoose.Types.ObjectId(), amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Create order forbid invalid email", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: "hehe",
    })
    .expect(400);
});

test("Create order forbid empty email", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "1234",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: "",
    })
    .expect(400);
});

test("Create order forbid empty card details", async () => {
  const createdGameId = await createGame(2);
  await request(app)
    .post(`/orders`)
    .set("content-type", "application/json")
    .send({
      cardLastDigits: "",
      deliveryDetails: mockDeliveryDetails,
      games: [{ id: createdGameId, amount: 1 }],
      email: mockEmailAddress,
    })
    .expect(400);
});

test("Update order", async () => {
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

  const orderBeforeUpdate = await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(orderBeforeUpdate.body.deliveryDetails).toEqual(mockDeliveryDetails);

  const updatedDetails = { ...mockDeliveryDetails, mobile: "0542222222" };
  await request(app)
    .put(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .send({ deliveryDetails: updatedDetails })
    .expect(200);

  const orderAfterUpdate = await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(orderAfterUpdate.body.deliveryDetails).not.toEqual(
    mockDeliveryDetails
  );

  const order = await request(app)
    .put(`/orders/${new mongoose.Types.ObjectId()}`)
    .send({ deliveryDetails: mockDeliveryDetails })
    .expect(404);
});

test("Delete order", async () => {
  var createdGameId = await createGame(2);
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

  await request(app)
    .delete(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(404);
});

test("Delete order forbid after more than 30 minutes", async () => {
  var createdGameId = await createGame(2);
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

  mockGetCurrentTime.mockReturnValue(new Date().getTime() + 45 * 60000);

  await request(app)
    .delete(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(400);
});

test("Delete order affects availability", async () => {
  var createdGameId = await createGame(2);
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

  const gameAfterOrderCreated = await request(app)
    .get(`/games/${createdGameId}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameAfterOrderCreated.body.availability).toEqual(1);

  await request(app)
    .delete(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  const gameAfterOrderDeleted = await request(app)
    .get(`/games/${createdGameId}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameAfterOrderDeleted.body.availability).toEqual(2);

  await request(app)
    .get(`/orders/${createdOrder.body.id}`)
    .set("content-type", "application/json")
    .expect(404);
});
