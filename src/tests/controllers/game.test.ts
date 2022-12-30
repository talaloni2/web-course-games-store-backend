import { addGame } from "../../controllers/game";
import { Request, Response } from "express";

jest.mock("../../config/db", () => ({
  get url() {
    const testConfig = require("../tests-config");
    return `mongodb://${testConfig.mongoDockerConfig.host}:${testConfig.mongoDockerConfig.port}/`;
  },
  database: "web_course_final_project",
  imgBucket: "photos",
}));

test("Added game successfully with increment", async () => {
  let responseObject: { id?: string } = {};
  const res: Partial<Response> = {
    json: jest.fn().mockImplementation((result) => {
      responseObject = result;
    }),
  };
  let req = {
    body: {
      totalRating: 1,
      name: "helloooo",
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    },
  } as Request;

  await addGame(req as Request, res as Response);

  expect(res.json).toHaveBeenCalledTimes(1);
  let currentId = responseObject.id;

  (<jest.Mock>res.json).mockClear();
  req.body.name = "test2";
  await addGame(req as Request, res as Response);
  expect(res.json).toHaveBeenCalledTimes(1);
  expect(responseObject).toStrictEqual({ id: currentId + 1 });
});

test("Uploaded cover successfully", async () => {
    let responseObject: { id?: string } = {};
  const res: Partial<Response> = {
    json: jest.fn().mockImplementation((result) => {
      responseObject = result;
    }),
  };
  let req = {
    body: {
      totalRating: 1,
      name: "helloooo",
      platforms: [],
      summary: "test summary",
      price: 100,
      availability: 2,
    },
  } as Request;

  await addGame(req as Request, res as Response);

  expect(res.json).toHaveBeenCalledTimes(1);
  let currentId = responseObject.id;
})
