import { app } from "../server";
const mongoDockerConfig = {
  port: 27018,
  host: "localhost",
  dockerName: "mongodb-test",
};

export { mongoDockerConfig, app };
