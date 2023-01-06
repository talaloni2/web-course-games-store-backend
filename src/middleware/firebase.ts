import admin from "firebase-admin";
const serviceAccount = require("./private-key.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = app.auth;

export { auth as getAuth, app };
