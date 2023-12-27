import WebpackBar from "webpackbar";
import webpack from "webpack";
import path from "path";
import { getServerEntry, pageEntries } from "./pages";
import WebpackDemandEntryPlugin from "./plugins/WebpackDemandEntry";
import { APP_PATH, development } from "./constant";
import { DefinePlugin } from "webpack";

const target = "node";

const webpackServerConfig: webpack.Configuration = {
  name: target,
  node: false,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  mode: development ? "development" : "production",
  entry: {
    index: [getServerEntry(), path.resolve(__dirname, "../server/app.ts")],
  },
  output: {
    path: APP_PATH,
    libraryTarget: "commonjs2",
    chunkFilename: "[id].chunk.js",
  },
  target: `node${process.versions.node.split(".").slice(0, 2).join(".")}`,
  devtool: "eval-cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            caller: { target },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new DefinePlugin({
      "process.env.BROWSER": false,
    }),
    new WebpackBar({ name: "server", color: "yellow" }),
    new WebpackDemandEntryPlugin({
      pageEntries,
    }),
  ],
};

export default webpackServerConfig;
