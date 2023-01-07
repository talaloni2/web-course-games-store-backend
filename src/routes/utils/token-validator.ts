import { getAuth } from "../../middleware/firebase";

const validateToken = async (authorization: string, { req }) => {
  try {
    const verifiedToken = await getAuth().verifyIdToken(authorization);
    req.headers.userId = verifiedToken.uid;
    return Promise.resolve();
  } catch (err) {
    return Promise.reject("Security check failed");
  }
};

export default validateToken;
