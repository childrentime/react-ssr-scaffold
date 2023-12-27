import webpack, { DefinePlugin } from "webpack";
import { clientOutput, development } from "./constant";
import { getClientEntries, pageEntries } from "./pages";
import AssetsWebpackPlugin from "assets-webpack-plugin";
import WebpackBar from "webpackbar";
import WebpackDemandEntryPlugin from "./plugins/WebpackDemandEntry";

const target = "web";

const webpackClientConfig: webpack.Configuration = {
  name: target,
  node: false,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  devtool: development ? "eval-cheap-module-source-map" : "source-map",
  mode: development ? "development" : "production",
  entry: getClientEntries(),
  output: {
    path: clientOutput,
    publicPath: "/",
    filename: "assets/js/[name].bundle.js",
    chunkFilename: "assets/js/[id].chunk.js",
  },
  devServer: {
    static: {
      // directory: clientOutput,
    },
  },
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
  plugins: [
    new DefinePlugin({
      "process.env": Object.assign(
        {},
        {
          BROWSER: JSON.stringify(true),
        }
      ),
      global: "window", // config.node中的global
    }),
    new AssetsWebpackPlugin({
      path: clientOutput,
      entrypoints: true,
    }),
    new WebpackBar({ name: "client" }),
    new WebpackDemandEntryPlugin({
      pageEntries,
    }),
  ],
};

export { webpackClientConfig as default };
