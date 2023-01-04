import mongoose, { mongo } from "mongoose";
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

test("Get single Game", async () => {
  const createdGameName = uuid();
  const summary = "test summary";
  const price = 100;
  const availability = 2;
  const totalRating = 1;
  const createResponse = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating,
      name: createdGameName,
      platforms: [],
      summary,
      price,
      availability,
    })
    .expect(200);

  const getResponse = await request(app)
    .get(`/games/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(getResponse.body.name).toEqual(createdGameName);
  expect(getResponse.body.rating).toEqual(totalRating);
  expect(getResponse.body.platforms).toEqual([]);
  expect(getResponse.body.summary).toEqual(summary);
  expect(getResponse.body.price).toEqual(price);
  expect(getResponse.body.availability).toEqual(availability);
});

test("Search Game", async () => {
  const createdGameName = uuid();
  const createResponse = await request(app)
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

  const searchResponseWithResults = await request(app)
    .get(`/games?name=${createdGameName}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  const searchResponseWithoutResults = await request(app)
    .get(`/games?name=${uuid()}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithoutResults.body.length).toEqual(0);
});

test("Search Game by platform", async () => {
  const firstPlatform = await createRandomPlatform();
  const secondPlatform = await createRandomPlatform();

  const createdGameName = uuid();
  const createResponse = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: createdGameName,
      platforms: [firstPlatform.body.id, secondPlatform.body.id],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);

  var searchResponseWithResults = await request(app)
    .get(`/games?platforms=${firstPlatform.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  searchResponseWithResults = await request(app)
    .get(`/games?platforms=${secondPlatform.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  searchResponseWithResults = await request(app)
    .get(`/games?platforms=${secondPlatform.body.id},${firstPlatform.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  const searchResponseWithoutResults = await request(app)
    .get(`/games?platforms=${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithoutResults.body.length).toEqual(0);
});

async function createRandomPlatform() {
  return await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
}

test("get game forbid invalid id", async () => {
  await request(app)
    .get("/games/1")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/games/hello")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get(`/games/${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(404);
});

test("Search game forbid invalid platform ids", async () => {
  await request(app)
    .get("/games?platforms=1,2")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/games?platforms=hello,bye")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/games?platforms=hello")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get(`/games?platforms=${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .get(
      `/games?platforms=${new mongoose.Types.ObjectId()},${new mongoose.Types.ObjectId()}`
    )
    .set("content-type", "application/json")
    .expect(200);
});

test("search games with pagination", async () => {
  for (let i = 0; i < 20; i++) {
    await request(app)
      .post("/games")
      .set("content-type", "application/json")
      .send({ name: uuid() })
      .expect(200);
  }
  const defaultPaginationResponse = await request(app)
    .get(`/games`)
    .set("content-type", "application/json")
    .expect(200);
  expect(defaultPaginationResponse.body.length).toEqual(10);

  const paginationResponseWithOnlySize = await request(app)
    .get(`/games?size=3`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithOnlySize.body.length).toEqual(3);

  const paginationResponseWithOnlyPage = await request(app)
    .get(`/games?page=1`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithOnlyPage.body.length).toEqual(10);
  expect(paginationResponseWithOnlyPage.body).not.toEqual(
    defaultPaginationResponse.body
  );

  const paginationResponseWithPageAndSize = await request(app)
    .get(`/games?page=1&size=2`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithPageAndSize.body.length).toEqual(2);
  expect(paginationResponseWithPageAndSize.body.slice(0)).toEqual(
    defaultPaginationResponse.body.slice(2, 4)
  );
});
