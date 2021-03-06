var path = require('path');
var _ = require('lodash');
var webpack = require('webpack');
var postcssSprites = require('postcss-sprites');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ImageminPlugin = require('imagemin-webpack-plugin').default;

var config = require('./config');

// webpack.config.js
module.exports = {

  output: {
    path: config.dist,
    filename: '[name].[chunkhash:8].js',
  },

  vue: {
    loaders: {
      sass: ExtractTextPlugin.extract('css!postcss!sass'),
      scss: ExtractTextPlugin.extract('css!postcss!sass'),
      css: ExtractTextPlugin.extract('css!postcss'),
      js: 'babel!eslint'
    },
    postcss: [postcssSprites({
      stylesheetPath: path.join(config.src, 'a/b'), // 这里为了让编译的时候样式能找到图片的正确路径，无奈，暂不深究
      spritePath: path.join(config.src, 'assets/images'),
      relativeTo: true,
      rem: true,
      remToPxRatio: 1000,
      spritesmith: { // 图片间有一定的间距才不会出现有些分辨率下图片显示超出的问题
        padding: 10
      },
      filterBy: image => {
        if (image.url.indexOf('sprite-icons') === -1) {
          return Promise.reject();
        }
        return Promise.resolve();
      },
      groupBy: function(image) {
        var spriteName = _.get(image.url.match(/sprite\-icons\/(.*?)\//), '[1]');
        if (!spriteName) {
          return Promise.reject();
        }

        return Promise.resolve(spriteName);
      }
    })]
  },

  plugins: [
    // extract style file
    new ExtractTextPlugin("style.[contenthash:8].css"),

    // compress js
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),

    // extract vendor libs
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.[chunkhash:8].js",
      minChunks: Infinity
    }),

    // handle index.html
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(config.src, 'index.html'),
      inject: true,
      scriptLocationIdentifier: /<\!--script location-->/,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),

    new ImageminPlugin({
      disable: false,
      optipng: {
        optimizationLevel: 3
      },
      gifsicle: {
        optimizationLevel: 1
      },
      jpegtran: {
        progressive: false
      },
      svgo: {
      },
      pngquant: {
        floyd: 1
      },
      plugins: []
    })
  ]
};
