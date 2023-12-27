import express from "express";
import { createServerContext } from "../../core/requestContext/index";

export const createContextMiddleware = () => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    req.$context = createServerContext(req, res);
    next();
  };
};
