const merge = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.config.common");

module.exports = merge(common, {
  mode: "development",
  entry: "./index.tsx",
  output: {
    globalObject: "this"
  },
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    },
    open: true,
    port: 3000
  },
  devtool: "cheap-eval-source-map",
  plugins: []
});
