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

test("Get wishlist", async () => {
  const game = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid(), availability: 1 })
    .expect(200);

  const createdWishlist = await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 1 }],
    })
    .expect(200);
  const wishlistResponse = await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(wishlistResponse.body.games.length).toEqual(1);
  expect(wishlistResponse.body.games[0].id).toEqual(game.body.id);
  expect(wishlistResponse.body.games[0].amount).toEqual(1);
  expect(wishlistResponse.body.games[0].isAvailable).toEqual(true);
  await request(app).get(`/wishlists/${new mongoose.Types.ObjectId()}`).expect(404);
});

test("Get wishlist not enough available copies", async () => {
  const game = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid(), availability: 1 })
    .expect(200);

  const createdWishlist = await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 2 }],
    })
    .expect(200);
  const wishlistResponse = await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(wishlistResponse.body.games.length).toEqual(1);
  expect(wishlistResponse.body.games[0].isAvailable).toEqual(false);
});

test("Cannot get other users wishlists", async () => {
  const createdWishlist = await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [],
    })
    .expect(200);
  
    await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  mockUserId = uuid();

  await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(404);
});
