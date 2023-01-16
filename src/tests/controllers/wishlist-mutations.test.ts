import mongoose from "mongoose";
import request from "supertest";
import { v4 as uuid } from "uuid";
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

test("Create wishlist", async () => {
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
});

test("Update wishlist", async () => {
  const createdWishlist = await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [],
    })
    .expect(200);

  const firstGame = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid() })
    .expect(200);

  const secondGame = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid() })
    .expect(200);

  await assertGamesPartOfWishlistAfterUpdate(createdWishlist.body, [firstGame.body.id]);
  await assertGamesPartOfWishlistAfterUpdate(createdWishlist.body, [
    firstGame.body.id,
    secondGame.body.id,
  ]);
  await assertGamesPartOfWishlistAfterUpdate(createdWishlist.body, [
    secondGame.body.id,
  ]);
  await assertGamesPartOfWishlistAfterUpdate(createdWishlist.body, []);

  await request(app)
    .put(`/wishlists/${new mongoose.Types.ObjectId()}`)
    .send({ games: [] })
    .expect(404);
});

async function assertGamesPartOfWishlistAfterUpdate(
  createdWishlist: { id: string },
  gameIds: string[]
) {
  await request(app)
    .put(`/wishlists/${createdWishlist.id}`)
    .set("content-type", "application/json")
    .send({
      games: gameIds.map((g) => ({ id: g, amount: 1 })),
    })
    .expect(200);

  const wishlist = await request(app)
    .get(`/wishlists/${createdWishlist.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(wishlist.body.games.map((g) => g.id)).toEqual(gameIds);
}

test("Forbid create wishlist with non existing game", async () => {
  await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: new mongoose.Types.ObjectId(), amount: 1 }],
    })
    .expect(400);

  const createdGame = await request(app)
    .post(`/games`)
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);

  await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: createdGame.body.id, amount: 1 }],
    })
    .expect(200);
});

test("Forbid update wishlist with non existing game", async () => {
  const createdWishlist = await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [],
    })
    .expect(200);

  await request(app)
    .put(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: new mongoose.Types.ObjectId(), amount: 1 }],
    })
    .expect(400);

  const createdGame = await request(app)
    .post(`/games`)
    .set("content-type", "application/json")
    .send({
      name: uuid(),
      availability: 1,
    })
    .expect(200);

  await request(app)
    .put(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: createdGame.body.id, amount: 1 }],
    })
    .expect(200);
});

test("Update game in wishlist to 0 amount will result game removal", async () => {
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

  var wishlist = await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(wishlist.body.games.length).toEqual(1);

  await request(app)
    .put(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 0 }],
    })
    .expect(200);

  wishlist = await request(app)
    .get(`/wishlists/${createdWishlist.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(wishlist.body.games.length).toEqual(0);
});

test("Cannot create more than one wishlist for the same user", async () => {
  const game = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: uuid(), availability: 1 })
    .expect(200);
  await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 1 }],
    })
    .expect(200);

  await request(app)
    .post(`/wishlists`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 1 }],
    })
    .expect(400);
});
