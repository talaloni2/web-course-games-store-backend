import { app } from "../../server";
import request from "supertest";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";

test("Create cart", async () => {
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
});

test("Update cart", async () => {
  const createdCart = await request(app)
    .post(`/carts`)
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

  await assertGamesPartOfCartAfterUpdate(createdCart.body, [firstGame.body.id]);
  await assertGamesPartOfCartAfterUpdate(createdCart.body, [
    firstGame.body.id,
    secondGame.body.id,
  ]);
  await assertGamesPartOfCartAfterUpdate(createdCart.body, [
    secondGame.body.id,
  ]);
  await assertGamesPartOfCartAfterUpdate(createdCart.body, []);

  await request(app)
    .put(`/carts/${new mongoose.Types.ObjectId()}`)
    .send({ games: [] })
    .expect(404);
});

async function assertGamesPartOfCartAfterUpdate(
  createdCart: { id: string },
  gameIds: string[]
) {
  await request(app)
    .put(`/carts/${createdCart.id}`)
    .set("content-type", "application/json")
    .send({
      games: gameIds.map((g) => ({ id: g, amount: 1 })),
    })
    .expect(200);

  const cart = await request(app)
    .get(`/carts/${createdCart.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(cart.body.games).toEqual(gameIds);
}

test("Forbid create cart with non existing game", async () => {
  await request(app)
    .post(`/carts`)
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
    .post(`/carts`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: createdGame.body.id, amount: 1 }],
    })
    .expect(200);
});

test("Forbid update cart with non existing game", async () => {
  const createdCart = await request(app)
    .post(`/carts`)
    .set("content-type", "application/json")
    .send({
      games: [],
    })
    .expect(200);

  await request(app)
    .put(`/carts/${createdCart.body.id}`)
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
    .put(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: createdGame.body.id, amount: 1 }],
    })
    .expect(200);
});

test("Update game in cart to 0 amount will result game removal", async () => {
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

  var cart = await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(cart.body.games.length).toEqual(1);

  await request(app)
    .put(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .send({
      games: [{ id: game.body.id, amount: 0 }],
    })
    .expect(200);

  cart = await request(app)
    .get(`/carts/${createdCart.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(cart.body.games.length).toEqual(0);
});
