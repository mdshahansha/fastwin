// import path from "path";
// import webpackNodeExternals from "webpack-node-externals";
// import Dotenv from "dotenv-webpack";
const path = require("path");
const webpackNodeExternals = require("webpack-node-externals");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./server.js",
  target: "node",
  mode: "development",
  externals: [webpackNodeExternals()],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: "./.env",
    }),
  ],
};
