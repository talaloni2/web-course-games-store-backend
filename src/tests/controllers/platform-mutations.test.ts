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

afterAll(() => {
  server.close();
});

test("Added platform successfully with increment", async () => {
  var resp = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  let currentId = responseObject.id;

  resp = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  expect(resp.body).toStrictEqual({ id: currentId + 1 });
});

test("Uploaded logo successfully", async () => {
  var resp = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: uuid(),
    })
    .expect(200);
  let responseObject: { id: string } = resp.body;

  var requestedFile = path.resolve(__dirname, "../resources/190352.jpg");
  await request(app)
    .post(`/platforms/${responseObject.id}/logo`)
    .set("content-type", "multipart/form-data; boundry=100000000000")
    .attach("file", requestedFile);

  const getLogoAfterUpdateResp = await request(app)
    .get(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(getLogoAfterUpdateResp.body.platformLogo).toContain("190352.jpg");
});

test("Updated platform successfully to different name", async () => {
  let firstName = uuid();
  let secondName = uuid();
  var createResp = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      alternativeName: "hehe",
      name: firstName,
      abbreviation: "lol",
    })
    .expect(200);
  let responseObject: { id: string } = createResp.body;
  var platformAfterCreate = await request(app)
    .get(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  await request(app)
    .put(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      alternativeName: "hehe",
      name: secondName,
      abbreviation: "lol2",
    })
    .expect(200);
  var platformAfterUpdate = await request(app)
    .get(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(platformAfterCreate.body.abbreviation).not.toEqual(
    platformAfterUpdate.body.abbreviation
  );
  expect(platformAfterCreate.body.alternativeName).toEqual(
    platformAfterUpdate.body.alternativeName
  );
  expect(platformAfterCreate.body.name).not.toEqual(
    platformAfterUpdate.body.name
  );
});

test("Forbid update platform name to existing name", async () => {
  let usedName = uuid();
  let createdPlatformName = uuid();
  await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(200);

  var createPlatformResponse = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: createdPlatformName,
    })
    .expect(200);
  let responseObject: { id: string } = createPlatformResponse.body;

  await request(app)
    .put(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(400);

  await request(app)
    .put(`/platforms/${responseObject.id}`)
    .set("content-type", "application/json")
    .send({
      name: createdPlatformName,
    })
    .expect(200);
});

test("Forbid create platform with existing name", async () => {
  let usedName = uuid();
  let createdPlatformName = uuid();
  await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(200);

  await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: usedName,
    })
    .expect(400);

  await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name: createdPlatformName,
    })
    .expect(200);
});

test("Delete platform", async () => {
  var createResponse = await request(app)
    .post("/platforms")
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
    .get(`/platforms/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  var createdGame = await request(app)
    .post("/games")
    .set("content-type", "application/json")
    .send({
      totalRating: 1,
      name: uuid(),
      platforms: [createResponse.body.id],
      summary: "test summary",
      price: 100,
      availability: 2,
    })
    .expect(200);

  var gameBeforePlatformDelete = await request(app)
    .get(`/games/${createdGame.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameBeforePlatformDelete.body.platforms).toEqual([createResponse.body.id]);

  await request(app).delete(`/platforms/${createResponse.body.id}`).expect(200);

  var gameCollectionAfterPlatformDelete = await request(app)
    .get(`/games/${createdGame.body.id}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(gameCollectionAfterPlatformDelete.body.platforms).toEqual([]);
});
