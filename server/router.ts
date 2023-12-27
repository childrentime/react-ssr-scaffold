import express, { Express } from "express";
import { createPageHandler } from "./render";
import { IRunTimeConfig } from "./runtime.config";

export const startRoutes = (app: Express) => {
  const runTimeConfig = app.getRuntimeConfig();

  if (runTimeConfig === null) {
    console.error("runTimeConfig is null");
    process.exit(1);
  }
  const { assets, pages, layouts } = runTimeConfig;
  const pageRouter = createRouter({ assets, pages, layouts });
  app.get("/*.html", pageRouter);
};

const normalizeAssets = (assets = {} as IRunTimeConfig["assets"]["string"]) => {
  const { js = [], css = [] } = assets;
  return {
    js: ([] as any[]).concat(js),
    css: ([] as any[]).concat(css),
  };
};

const createRouter = ({ assets, pages, layouts }: IRunTimeConfig) => {
  const modules = Object.entries(pages).reduce(
    (routes, [pageModuleId, module]) => {
      routes[pageModuleId] = createPageHandler({
        page: module,
        assets: normalizeAssets(assets[pageModuleId]),
        pageModuleId,
        layouts,
      });
      return routes;
    },
    {} as Record<string, any>
  );

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    req.params.page = req.params[0];
    console.log("page", req.params.page);
    const pageModuleId = req.params.page;
    modules[pageModuleId] ? modules[pageModuleId](req, res, next) : next();
  };
};
