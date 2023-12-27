import { WebpackDemandEntryCompiler } from "./../plugins/WebpackDemandEntry";
import express from "express";
import { assetsPath } from "../constant";
import fs from "fs-extra";
import { recoverEntryContent } from "../utils/replaceEntry";
import { Watching } from "webpack";

export const createDemandEntryMiddleware = ({
  clientWatcher,
  pageEntries,
  serverWatcher,
}: {
  clientWatcher: Watching;
  pageEntries: Record<string, string>;
  serverWatcher: Watching;
}) => {
  const clientCompiler = clientWatcher.compiler as WebpackDemandEntryCompiler;
  const serverComplier = serverWatcher.compiler as WebpackDemandEntryCompiler;
  if (!fs.existsSync(assetsPath)) {
    fs.createFileSync(assetsPath);
    fs.writeFileSync(assetsPath, "{}"); // 兜下底，访问了非html页面会报错
  }

  const compiledPromise = {} as Record<string, Promise<any>>;

  return async function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const name = req.path
        .replace("/csr", "")
        .replace("/", "")
        .replace(".html", "");
      const isPage = !!pageEntries[name];

      // 非入口页面
      if (!isPage) {
        return next();
      }

      if (!compiledPromise[name]) {
        console.log(`${name} is building ...`);

        // 添加server端入口
        recoverEntryContent(pageEntries[name]);

        // 添加client端入口
        clientCompiler.compiledEntries[name] = clientCompiler.allEntries[name];

        const invalidateClientWatcherPromise = (() => {
          return new Promise<void>((resolve, reject) => {
            clientWatcher.invalidate((err) => {
              if (err) {
                delete clientCompiler.compiledEntries[name];
                reject(err);
              } else {
                resolve();
              }
            });
          });
        })();

        const afterEmitServerPromise = (() => {
          return new Promise<void>((resolve, reject) => {
            serverComplier.hooks.afterEmit.tap("emit complete", () => {
              console.log("???");
              resolve();
              return true;
            });
          });
        })();

        // 只在第一次按需编译的时候 执行promise函数
        compiledPromise[name] = Promise.all([
          invalidateClientWatcherPromise,
          afterEmitServerPromise,
        ]);
      }

      await compiledPromise[name];

      next();
    } catch (e) {
      next();
    }
  };
};
