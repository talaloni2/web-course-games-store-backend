import mongoose from "mongoose";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { app, server } from "../../server";
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

test("Get single Game Collection", async () => {
  const name = uuid();
  const createResponse = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name,
      games: [],
    })
    .expect(200);

  const getResponse = await request(app)
    .get(`/gameCollections/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(getResponse.body.name).toEqual(name);
  expect(getResponse.body.games).toEqual([]);
});

test("Search Game collection", async () => {
  const gameCollectionName = uuid();
  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: gameCollectionName,
      games: [],
    })
    .expect(200);

  const searchResponseWithResults = await request(app)
    .get(`/gameCollections?name=${gameCollectionName}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  const searchResponseWithoutResults = await request(app)
    .get(`/gameCollections?name=${uuid()}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithoutResults.body.length).toEqual(0);
});

test("Search Game collection by games", async () => {
  const firstGame = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  const secondGame = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);

  const gameCollectionName = uuid();
  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: gameCollectionName,
      games: [firstGame.body.id, secondGame.body.id],
    })
    .expect(200);

  var searchResponseWithResults = await request(app)
    .get(`/gameCollections?games=${firstGame.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect((<Array<{}>>searchResponseWithResults.body).length).toEqual(1);

  searchResponseWithResults = await request(app)
    .get(`/gameCollections?games=${secondGame.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  searchResponseWithResults = await request(app)
    .get(`/gameCollections?games=${secondGame.body.id},${firstGame.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  const searchResponseWithoutResults = await request(app)
    .get(`/gameCollections?games=${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithoutResults.body.length).toEqual(0);
});

test("get game collection forbid invalid id", async () => {
  await request(app)
    .get("/gameCollections/1")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/gameCollections/hello")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get(`/gameCollections/${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(404);
});

test("Search game collection forbid invalid game ids", async () => {
  await request(app)
    .get("/gameCollections?games=1,2")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/gameCollections?games=hello,bye")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get("/gameCollections?games=hello")
    .set("content-type", "application/json")
    .expect(400);

  await request(app)
    .get(`/gameCollections?games=${new mongoose.Types.ObjectId()}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .get(
      `/gameCollections?games=${new mongoose.Types.ObjectId()},${new mongoose.Types.ObjectId()}`
    )
    .set("content-type", "application/json")
    .expect(200);
});

test("search game collections with pagination", async () => {
  for (let i = 0; i < 20; i++) {
    await request(app)
      .post("/gameCollections")
      .set("content-type", "application/json")
      .send({ name: uuid() })
      .expect(200);
  }
  const defaultPaginationResponse = await request(app)
    .get(`/gameCollections`)
    .set("content-type", "application/json")
    .expect(200);
  expect(defaultPaginationResponse.body.length).toEqual(10);

  const paginationResponseWithOnlySize = await request(app)
    .get(`/gameCollections?size=3`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithOnlySize.body.length).toEqual(3);

  const paginationResponseWithOnlyPage = await request(app)
    .get(`/gameCollections?page=1`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithOnlyPage.body.length).toEqual(10);
  expect(paginationResponseWithOnlyPage.body).not.toEqual(
    defaultPaginationResponse.body
  );

  const paginationResponseWithPageAndSize = await request(app)
    .get(`/gameCollections?page=1&size=2`)
    .set("content-type", "application/json")
    .expect(200);
  expect(paginationResponseWithPageAndSize.body.length).toEqual(2);
  expect(paginationResponseWithPageAndSize.body.slice(0)).toEqual(
    defaultPaginationResponse.body.slice(2, 4)
  );
});
