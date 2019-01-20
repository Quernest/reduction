const merge = require("webpack-merge");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const common = require("./webpack.config.common");

module.exports = merge(common, {
  mode: "production",
  entry: "./index.tsx",
  output: {
    filename: "bundle.[hash].min.js",
    chunkFilename: "[chunkhash].js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    globalObject: "this"
  },
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        commons: {
          chunks: "initial",
          minChunks: 2
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: -10
        }
      }
    },
    runtimeChunk: true
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, "../"),
      verbose: true
    })
  ]
});
