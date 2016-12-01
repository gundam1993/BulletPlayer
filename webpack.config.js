var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, './app');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

module.exports = {
  entry: {
    index: './app/index.js'
  },

  output: {
    path: BUILD_PATH,
    //publicPath: "/static/build/",
    filename: '[name].js'
  },

  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progres: true,
  },

  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"],
        include: APP_PATH
      },
      {
        test: /\.css$/,
        loaders: ["style", "css"],
        include: APP_PATH
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: APP_PATH,
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './app/index.html',
        inject: true
      }),
      new OpenBrowserPlugin({
        url: 'http://localhost:8080'
      })
    ]
};
