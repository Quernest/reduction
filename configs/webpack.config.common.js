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
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } }
        ]
      },
      // static assets
      { test: /\.html$/, use: "html-loader" },
      { test: /\.(a?png|svg)$/, use: "url-loader?limit=10000" },
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
