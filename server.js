const cors = require("cors");
const express = require("express");
const app = express();
const initRoutes = require("./routes");
const serverConfig = require("./config/server");
require("./middleware/db"); // initializing db on server startup

const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let port = serverConfig.port;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});