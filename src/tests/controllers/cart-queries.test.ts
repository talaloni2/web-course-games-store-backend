import mongoose from "mongoose";
import request from "supertest";
import { v4 as uuid } from "uuid";
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

test("Get cart", async () => {
  const game = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid(), availability: 1 })
    .expect(200);

  const createdCart = await request(app)
    .post(`/carts`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 1 }],
    })
    .expect(200);
  const cartResponse = await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(cartResponse.body.games.length).toEqual(1);
  expect(cartResponse.body.games[0].id).toEqual(game.body.id);
  expect(cartResponse.body.games[0].amount).toEqual(1);
  expect(cartResponse.body.games[0].isAvailable).toEqual(true);
  await request(app).get(`/carts/${new mongoose.Types.ObjectId()}`).expect(404);
});

test("Get cart not enough available copies", async () => {
  const game = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid(), availability: 1 })
    .expect(200);

  const createdCart = await request(app)
    .post(`/carts`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 2 }],
    })
    .expect(200);
  const cartResponse = await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(cartResponse.body.games.length).toEqual(1);
  expect(cartResponse.body.games[0].isAvailable).toEqual(false);
});

test("Cannot get other users carts", async () => {
  const createdCart = await request(app)
    .post(`/carts`)
    .set("content-type", "application/json")
    .send({
      games: [],
    })
    .expect(200);
  
    await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  mockUserId = uuid();

  await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(404);
});
