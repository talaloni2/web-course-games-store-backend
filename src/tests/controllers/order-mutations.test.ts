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
});

jest.mock("../../config/db", () => ({
  get url() {
    const testConfig = require("../tests-config");
    return `mongodb://${testConfig.mongoDockerConfig.host}:${testConfig.mongoDockerConfig.port}/`;
  },
  database: "web_course_final_project",
  imgBucket: "photos",
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

  // const updateOrder = await request(app)
  // .put()

  await request(app)
    .put(`/orders/${new mongoose.Types.ObjectId()}`)
    .send({ deliveryDetails: mockDeliveryDetails })
    .expect(404);
});

// test("Forbid create order with non existing game", async () => {
//   await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: new mongoose.Types.ObjectId(), amount: 1 }],
//     })
//     .expect(400);

//   const createdGame = await request(app)
//     .post(`/games`)
//     .set("content-type", "application/json")
//     .send({
//       name: uuid(),
//     })
//     .expect(200);

//   await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: createdGame.body.id, amount: 1 }],
//     })
//     .expect(200);
// });

// test("Forbid update order with non existing game", async () => {
//   const createdOrder = await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [],
//     })
//     .expect(200);

//   await request(app)
//     .put(`/orders/${createdOrder.body.id}`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: new mongoose.Types.ObjectId(), amount: 1 }],
//     })
//     .expect(400);

//   const createdGame = await request(app)
//     .post(`/games`)
//     .set("content-type", "application/json")
//     .send({
//       name: uuid(),
//       availability: 1,
//     })
//     .expect(200);

//   await request(app)
//     .put(`/orders/${createdOrder.body.id}`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: createdGame.body.id, amount: 1 }],
//     })
//     .expect(200);
// });

// test("Update game in order to 0 amount will result game removal", async () => {
//   const game = await request(app)
//     .post("/games")
//     .set("content-type", "application/json")
//     .send({ name: uuid(), availability: 1 })
//     .expect(200);

//   const createdOrder = await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: game.body.id, amount: 1 }],
//     })
//     .expect(200);

//   var order = await request(app)
//     .get(`/orders/${createdOrder.body.id}`)
//     .set("content-type", "application/json")
//     .expect(200);
//   expect(order.body.games.length).toEqual(1);

//   await request(app)
//     .put(`/orders/${createdOrder.body.id}`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: game.body.id, amount: 0 }],
//     })
//     .expect(200);

//   order = await request(app)
//     .get(`/orders/${createdOrder.body.id}`)
//     .set("content-type", "application/json")
//     .expect(200);
//   expect(order.body.games.length).toEqual(0);
// });

// test("Cannot create more than one order for the same user", async () => {
//   const game = await request(app)
//     .post("/games")
//     .set("content-type", "application/json")
//     .send({ name: uuid(), availability: 1 })
//     .expect(200);
//   await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: game.body.id, amount: 1 }],
//     })
//     .expect(200);

//   await request(app)
//     .post(`/orders`)
//     .set("content-type", "application/json")
//     .send({
//       games: [{ id: game.body.id, amount: 1 }],
//     })
//     .expect(400);
// });
