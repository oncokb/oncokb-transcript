const webpack = require('webpack');
const webpackMerge = require('webpack-merge').merge;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const sass = require('sass');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'production';

module.exports = async () =>
  webpackMerge(await commonConfig({ env: ENV }), {
    devtool: 'source-map', // Enable source maps.This slows down the build, but we need it to show error in Sentry properly
    mode: ENV,
    entry: {
      main: './src/main/webapp/app/index',
    },
    output: {
      path: utils.root('target/classes/static/'),
      filename: 'app/[name].[contenthash].bundle.js',
      chunkFilename: 'app/[name].[chunkhash].chunk.js',
    },
    module: {
      rules: [
        {
          test: /\.module\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]__[hash:base64:5]',
                },
                importLoaders: 2,
              },
            },
            'sass-loader',
            utils.sassResourcesLoader,
          ],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /\.module\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: { sourceMap: true },
            },
            utils.sassResourcesLoader,
          ],
        },
      ],
    },
    optimization: {
      runtimeChunk: false,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          // sourceMap: true, // Enable source maps. Please note that this will slow down the build
          terserOptions: {
            ecma: 6,
            toplevel: true,
            module: true,
            compress: {
              warnings: false,
              ecma: 6,
              module: true,
              toplevel: true,
            },
            output: {
              comments: false,
              beautify: false,
              indent_level: 2,
              ecma: 6,
            },
            mangle: {
              keep_fnames: true,
              module: true,
              toplevel: true,
            },
          },
        }),
        new CssMinimizerPlugin({
          parallel: true,
        }),
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        filename: 'content/[name].[contenthash].css',
        chunkFilename: 'content/[name].[chunkhash].css',
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        exclude: [/swagger-ui/],
      }),
      // Sentry Webpack plugin needs to be put after all other plugins
      sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'memorial-sloan-kettering',
        project: 'oncokb-curation-website',
      }),
    ],
  });
