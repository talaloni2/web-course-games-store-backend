import mongoose from "mongoose";
import path from "path";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { app, server } from "../../server";
import { database } from "../../middleware/db";
import { closeServerResources } from "./utils";

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

test("Added game successfully", async () => {
  var resp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  expect(responseObject.id).not.toBeNull();
});

test("Uploaded cover successfully", async () => {
  var resp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  var requestedFile = path.resolve(__dirname, "../resources/190352.jpg");
  await request(app)
    .post(`/games/${responseObject.id}/cover`)
    .set("content-type", "multipart/form-data; boundry=100000000000")
    .attach("file", requestedFile);

  const getGameAfterUpdateResp = await request(app)
    .get(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(getGameAfterUpdateResp.body.cover).toContain("190352.jpg");
});

test("Attached screenshot successfully", async () => {
  var resp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  var requestedFile = path.resolve(__dirname, "../resources/190352.jpg");
  await request(app)
    .post(`/games/${responseObject.id}/screenshot`)
    .set("content-type", "multipart/form-data; boundry=100000000000")
    .attach("file", requestedFile);

  const getGameAfterUpdateResp = await request(app)
    .get(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(getGameAfterUpdateResp.body.screenshots[0]).toContain("190352.jpg");
});

test("Updated game successfully to different name", async () => {
  let firstName = uuid();
  let secondName = uuid();
  var createResp = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: firstName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
  let responseObject: { id: string } = createResp.body;
  var gameAfterCreate = await request(app)
    .get(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .put(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      totalRating: 2,
      name: secondName,
      platforms: [],
      summary: "test summary",
      price: 50,
      availability: 3,
    })
    .expect(200);
  var gameAfterUpdate = await request(app)
    .get(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameAfterCreate.body.rating).not.toEqual(gameAfterUpdate.body.rating);
  expect(gameAfterCreate.body.summary).toEqual(gameAfterUpdate.body.summary);
  expect(gameAfterCreate.body.summary).toEqual(gameAfterUpdate.body.summary);
  expect(gameAfterCreate.body.name).not.toEqual(gameAfterUpdate.body.name);
});

test("Forbid update game name to existing name", async () => {
  let usedName = uuid();
  let createdGameName = uuid();
  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: usedName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);

  var createGameResponse = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: createdGameName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
  let responseObject: { id: string } = createGameResponse.body;

  await request(app)
    .put(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      totalRating: 2,
      name: usedName,
      platforms: [],
      summary: "test summary",
      price: 50,
      availability: 3,
    })
    .expect(400);

  await request(app)
    .put(`/games/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      totalRating: 2,
      name: createdGameName,
      platforms: [],
      summary: "test summary",
      price: 50,
      availability: 3,
    })
    .expect(200);
});

test("Forbid create game with existing name", async () => {
  let usedName = uuid();
  let createdGameName = uuid();
  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: usedName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);

  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: usedName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(400);

  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: createdGameName,
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
});

test("Delete game", async () => {
  var createResponse = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);

  await request(app)
    .get(`/games/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  var createdGameCollectionResponse = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
      games: [createResponse.body.id],
    })
    .expect(200);

  var gameCollectionBeforeGameDelete = await request(app)
    .get(`/gameCollections/${createdGameCollectionResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameCollectionBeforeGameDelete.body.games).toEqual([
    createResponse.body.id,
  ]);

  await request(app).delete(`/games/${createResponse.body.id}`).expect(200);

  var gameCollectionAfterGameDelete = await request(app)
    .get(`/gameCollections/${createdGameCollectionResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameCollectionAfterGameDelete.body.games).toEqual([]);
});

test("Forbid create game with non existing platform", async () => {
  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [new mongoose.Types.ObjectId()],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(400);

  const platformCreateResponse = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({ name: "lalala" })
    .expect(200);

  await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [platformCreateResponse.body.id],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);
});
