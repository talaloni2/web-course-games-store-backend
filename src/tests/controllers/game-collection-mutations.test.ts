import path from "path";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { app, server } from "../../server";

jest.mock("../../config/db", () => ({
  get url() {
    const testConfig = require("../tests-config");
    return `mongodb://${testConfig.mongoDockerConfig.host}:${testConfig.mongoDockerConfig.port}/`;
  },
  database: "web_course_final_project",
  imgBucket: "photos",
}));

jest.setTimeout(1000000);

afterAll(() => {
  server.close();
});

test("Added game collection successfully with increment", async () => {
  var resp = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  let currentId = responseObject.id;

  resp = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  expect(resp.body).toStrictEqual({ id: currentId + 1 });
});

test("Updated game collection successfully to different name", async () => {
  let firstName = uuid();
  let secondName = uuid();
  var createResp = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: firstName,
      games: [],
    })
    .expect(200);
  let responseObject: { id: string } = createResp.body;
  var platformAfterCreate = await request(app)
    .get(`/gameCollections/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .put(`/gameCollections/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      name: secondName,
      games: []
    })
    .expect(200);
  var platformAfterUpdate = await request(app)
    .get(`/gameCollections/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(platformAfterCreate.body.games).toEqual(
    platformAfterUpdate.body.games
  );
  expect(platformAfterCreate.body.name).not.toEqual(
    platformAfterUpdate.body.name
  );
});

test("Forbid update game collection name to existing name", async () => {
  let usedName = uuid();
  let createdName = uuid();
  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(200);

  var createGameCollectionResponse = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: createdName,
    })
    .expect(200);
  let responseObject: { id: string } = createGameCollectionResponse.body;

  await request(app)
    .put(`/gameCollections/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(400);

  await request(app)
    .put(`/gameCollections/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      name: createdName,
    })
    .expect(200);
});

test("Forbid create game collection with existing name", async () => {
  let usedName = uuid();
  let createdName = uuid();
  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(200);

  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(400);

  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: createdName,
    })
    .expect(200);
});

test("Delete game collection", async () => {
  var createResponse = await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
      games: [],
    })
    .expect(200);

  await request(app)
    .get(`/gameCollections/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app).delete(`/gameCollections/${createResponse.body.id}`).expect(200);
  await request(app).get(`/gameCollections/${createResponse.body.id}`).expect(404);

});

test("Forbid create game collection with non existing game", async () => {
  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
      games: [-1],
    })
    .expect(400);

  const gameCreateResponse = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({ name: "lalala" })
    .expect(200);

  await request(app)
    .post("/gameCollections")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
      games: [gameCreateResponse.body.id],
    })
    .expect(200);
});