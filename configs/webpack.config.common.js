const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  target: "web",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  context: path.resolve(__dirname, "../src/"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: false // enable it if you want to increase compilation performance
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: "html-loader"
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      {
        test: /\.(a?png|svg)$/,
        use: "url-loader?limit=10000"
      },
      {
        test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|eot|ttf|woff|woff2)$/,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "../public/index.html",
      favicon: "../public/favicon.ico",
      minify: true
    })
  ],
  performance: {
    hints: false
  }
};
