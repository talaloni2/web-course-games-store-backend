import { server } from "../../server";
import { database } from "../../middleware/db";
const closeServerResources = async () => {
  server.close();
  await database.close();
};

export { closeServerResources };
