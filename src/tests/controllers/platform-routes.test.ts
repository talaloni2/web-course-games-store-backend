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

test("Get single Platform", async () => {
  const name = uuid();
  const abbreviation = "trol";
  const alternativeName = "trololo";
  const createResponse = await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      name,
      abbreviation,
      alternativeName,
    })
    .expect(200);

  const getResponse = await request(app)
    .get(`/platforms/${createResponse.body.id}`)
    .set("content-type", "application/json")
    .expect(200);
  expect(getResponse.body.name).toEqual(name);
  expect(getResponse.body.abbreviation).toEqual(abbreviation);
  expect(getResponse.body.alternativeName).toEqual(alternativeName);
});

test("Search Platform", async () => {
  const platformName = uuid();
  await request(app)
    .post("/platforms")
    .set("content-type", "application/json")
    .send({
      abbreviation: "adsad",
      name: platformName,
      alternativeName: "hehe",
    })
    .expect(200);

  const searchResponseWithResults = await request(app)
    .get(`/platforms?name=${platformName}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithResults.body.length).toEqual(1);

  const searchResponseWithoutResults = await request(app)
    .get(`/platforms?name=${uuid()}`)
    .set("content-type", "application/json")
    .expect(200);

  expect(searchResponseWithoutResults.body.length).toEqual(0);
});
