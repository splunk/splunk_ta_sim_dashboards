const path = require('path');
const fs = require('fs');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');
const appConfig = require('./appConfig');

const srcDir = path.join(__dirname, 'src');
const pages = fs.readdirSync(path.join(srcDir, 'pages')).reduce((entries, name) => {
  // eslint-disable-next-line no-param-reassign
  entries[name] = path.join(srcDir, 'pages', name, 'index.jsx');
  return entries;
}, {});

const jsBuildDir = path.join(__dirname, 'build', appConfig.id, 'appserver', 'static', 'build');

module.exports = {
  mode: process.env.NODE_ENV !== 'production' ? 'development' : 'production',
  entry: pages,
  output: {
    path: jsBuildDir,
    publicPath: `/static/app/${appConfig.id}/build/`,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.txt$/,
        use: ['raw-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[hash].[ext]',
              limit: 100000,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|wav|mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new MonacoWebpackPlugin({
      languages: ['json'],
    }),
  ],
};
