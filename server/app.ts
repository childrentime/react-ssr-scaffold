import express from "express";
import { port } from "../config/constant";
import { applyMiddleware, builtInMiddlewares } from "./middleware/index";
import { startRoutes } from "./router";
import { getConfig } from "./runtime.config";

const startServer = () => {
  const app = express();
  app.getRuntimeConfig = getConfig;

  applyMiddleware(app, builtInMiddlewares);
  startRoutes(app);

  if (process.env.NODE_ENV === "development") {
    return { app };
  }
  const server = app.listen(port);

  return { server, app };
};

export default startServer();
