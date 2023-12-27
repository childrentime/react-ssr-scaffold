import express from "express";
import { httpPort, assetsPath, APP_PATH, httpsPort } from "./constant";
import WebpackDevServer from "webpack-dev-server";
import webpackClientConfig from "./webpack.client";
import { webpack } from "webpack";
import { port } from "./constant";
import { pageEntries } from "./pages";
import { createDemandEntryMiddleware } from "./middleware/createDemandEntryMiddleware";
import webpackServerConfig from "./webpack.server";
import { existsSync } from "fs-extra";
import { certificateFor } from "devcert";
import { rootCAKeyPath } from "devcert/dist/constants";
import devcertUserInterface from "devcert/dist/user-interface";
import https from "https";
import net from "net";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import consola from "consola";

process.on("unhandledRejection", consola.error);
process.on("rejectionHandled", consola.error);

const clientCompiler = webpack(webpackClientConfig);
const serverCompiler = webpack(webpackServerConfig);
const devServerConfig = webpackClientConfig.devServer || {};

clientCompiler.hooks.done.tap("ClearCache", () => {
  console.log("客户端代码构建完毕！");
  try {
    delete require.cache[require.resolve(assetsPath)];
    const assets = require(assetsPath);
    Object.values(assets).forEach((asset: any) => {
      asset.js = ([] as any[])
        .concat(asset.js)
        .filter((path) => !~path.indexOf(".hot-update"));
    });
  } catch (e) {
    console.log("error", e);
  }
  console.log("manifest缓存清理完毕！");
});

let serverResolve: any;
const serverCompilePromise = new Promise((res, rej) => {
  serverResolve = res;
});

const server = new WebpackDevServer(
  {
    port: httpPort,
    allowedHosts: "all",
    static: false,
    devMiddleware: {
      publicPath: webpackClientConfig!.output!.publicPath,
    },
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
      webSocketURL: {
        port,
      },
    },
    ...devServerConfig,
    setupMiddlewares: (middlewares, devServer) => {
      const clientWatcher = devServer.middleware!.context.watching;
      middlewares.push(
        bodyParser.json(),
        bodyParser.urlencoded({ extended: false }),
        {
          path: "/proxy/api",
          middleware: createProxyMiddleware({
            target: "http://localhost:8080",
            changeOrigin: true,
            logLevel: "debug",
            pathRewrite: { "^/proxy/api": "" },
            onProxyReq: (proxyReq, req) => {
              // 重置 body-parser 解析后的 body
              if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader("Content-Type", "application/json");
                proxyReq.setHeader(
                  "Content-Length",
                  Buffer.byteLength(bodyData)
                );
                proxyReq.write(bodyData);
              }
            },
          }),
        },
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => serverCompilePromise.then(next).catch(next),
        // 按需编译路由
        createDemandEntryMiddleware({
          pageEntries,
          clientWatcher,
          serverWatcher,
        }),
        // 业务代码加载
        async (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          console.log(req.url);
          try {
            const app = require(APP_PATH);
            app.default.app.handle(req, res, next);
          } catch (error) {
            // todo 错误的overlay
            consola.error(error);
            res.end(String(error));
          }
        }
      );
      return middlewares;
    },
  },
  clientCompiler
);

// 生成 https 证书
const httpsOptsPromise = (() => {
  const httpsAllowDomains = ["localhost", "react-ssr-scaffold.com"];
  if (!existsSync(rootCAKeyPath)) {
    console.log("> sudo install https certificate..");
  }
  return certificateFor(httpsAllowDomains, {
    skipCertutilInstall: true,
    skipHostsFile: true,
    // @ts-expect-error
    ui: {
      startFirefoxWizard: async (...args) => {
        await serverCompilePromise;
        console.warn(
          "Firefox 需要信任生成的 https 证书，阅读以下说明后按任意键开始。如果你从来不用 Firefox 开发也可以忽略此步骤，重启下服务即可访问页面"
        );
        return devcertUserInterface.startFirefoxWizard(...args);
      },
    },
  });
})();

server.start().then(async () => {
  const httpsOpts = await httpsOptsPromise;
  const httpsServer = https
    .createServer(httpsOpts, server.app)
    .listen(httpsPort);

  // 支持 devServer 的 wss
  httpsServer.on("upgrade", (req, sock, head) => {
    const webSocketServer = server.webSocketServer!.implementation;
    // @ts-ignore
    if (!webSocketServer.shouldHandle(req)) {
      return;
    }
    // @ts-ignore
    webSocketServer.handleUpgrade(req, sock, head, (ws) => {
      webSocketServer.emit("connection", ws, req);
    });
  });

  // 在同一端口同时支持 http/https 服务
  net
    .createServer((socket) => {
      socket.once("data", (buf) => {
        // https 数据流的第一位是十六进制“16”，转换成十进制就是22
        const port = buf[0] === 22 ? httpsPort : httpPort;
        const proxy = net.createConnection(String(port), () => {
          proxy.write(buf);
          // 反向代理，tcp 接受的数据交给代理端口，代理端口服务返回数据交由 socket 返回给客户端
          socket.pipe(proxy).pipe(socket);
        });
        proxy.on("error", console.error);
      });
      socket.on("error", (err) => {
        // console.log(err);
      });
    })
    .listen(port, () => {
      server.logger.info(
        `HTTP/HTTPS server is running on port: ${port}  (HTTP: ${httpPort}, HTTPS: ${httpsPort})`
      );
    });
});

const serverWatcher = serverCompiler.watch(
  {
    ignored: ["dist/**", "node_modules/!**"],
  },
  (_err, stats) => {
    if (_err) {
      console.log(_err, stats!.compilation.errors);
    }

    console.log("服务端代码构建完毕！");
    delete require.cache[require.resolve(`${APP_PATH}/index.js`)];
    console.log("服务端代码缓存清理完毕！");
    // server端变更让浏览器reload
    server.sendMessage(server.webSocketServer!.clients, "static-changed");
    serverResolve();
  }
);
