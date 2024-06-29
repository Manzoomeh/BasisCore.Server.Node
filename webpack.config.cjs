
const path = require("path");
const webpack = require("webpack")

module.exports =  {
  entry: "./hostManager.js", 
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    library: {
      name: "webserver.js", 
      type: "umd", 
    },
    globalObject: "this",
  },
  target: "node", 
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env"] },
        },
      }
    ],
    noParse:[/alasql/]
  },
  resolve: { extensions: [".js"] },
};
