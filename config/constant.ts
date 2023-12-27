import path from "path";

export const development =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const clientOutput = path.resolve(__dirname, "../dist");

export const TEMP = path.resolve(__dirname, "../.temp");
export const CLIENT_DIR = path.resolve(TEMP, "./client");
export const entryPath = path.resolve(TEMP, "./server.ts");
export const PAGE_DIR = path.resolve(__dirname, "../pages");
export const port = +(process.env.PORT || "") || 3000;
export const httpPort = +(process.env.HTTP_PORT || "") || 3001;
export const httpsPort = +(!!process.env.HTTPS_PORT || "") || 3002;
export const assetsPath = path.resolve(
  __dirname,
  "../dist/webpack-assets.json"
);
export const APP_PATH = path.resolve(__dirname, "../dist/server");
export const LAYOUTS_DIR = path.resolve(__dirname, "../layouts");
