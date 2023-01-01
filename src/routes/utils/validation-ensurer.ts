import { validationResult } from "express-validator";
import { Request, Response } from "express";

const ensureValidThenExecute = (
  controllerMethod: (req: Request, res: Response) => any
) => {
  return async (req: Request, res: Response) => {
    var err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ validationErrors: err.mapped() });
    }
    await controllerMethod(req, res);
  };
};

export { ensureValidThenExecute };
