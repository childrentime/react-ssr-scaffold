import { createContextMiddleware } from "./context";
import { Express } from "express";
import cookieParser from "cookie-parser";

export const builtInMiddlewares = [
  {
    name: "cookieParser",
    middleware: cookieParser(),
  },
  {
    name: "context",
    middleware: createContextMiddleware(),
  },
];

export const applyMiddleware = (app: Express, customMiddleware: any) => {
  let middlewares = builtInMiddlewares;
  if (Array.isArray(customMiddleware)) {
    middlewares.unshift(...customMiddleware);
  } else if (typeof customMiddleware === "function") {
    middlewares = customMiddleware(builtInMiddlewares);
  }

  middlewares.forEach((middleware: any) => {
    if (typeof middleware === "function") {
      app.use(middleware);
    } else if (typeof middleware.path !== "undefined") {
      app.use(middleware.path, middleware.middleware);
    } else {
      app.use(middleware.middleware);
    }
  });
};
