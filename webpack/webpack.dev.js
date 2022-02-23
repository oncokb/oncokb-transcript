const webpack = require('webpack');
const webpackMerge = require('webpack-merge').merge;
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const path = require('path');
const sass = require('sass');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = async options =>
  webpackMerge(await commonConfig({ env: ENV }), {
    devtool: 'cheap-module-source-map', // https://reactjs.org/docs/cross-origin-errors.html
    mode: ENV,
    entry: ['./src/main/webapp/app/index'],
    output: {
      path: utils.root('target/classes/static/'),
      filename: 'app/[name].bundle.js',
      chunkFilename: 'app/[id].chunk.js',
    },
    optimization: {
      moduleIds: 'named',
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
    devServer: {
      hot: true,
      static: {
        directory: './target/classes/static/',
      },
      port: 9060,
      proxy: [
        {
          context: [
            '/api',
            '/services',
            '/management',
            '/swagger-resources',
            '/v2/api-docs',
            '/v3/api-docs',
            '/h2-console',
            '/oauth2',
            '/login',
            '/auth',
          ],
          target: `http${options.tls ? 's' : ''}://localhost:9090`,
          secure: false,
          changeOrigin: options.tls,
        },
      ],
      https: options.tls,
      historyApiFallback: true,
    },
    stats: process.env.JHI_DISABLE_WEBPACK_LOGS ? 'none' : options.stats,
    plugins: [
      process.env.JHI_DISABLE_WEBPACK_LOGS
        ? null
        : new SimpleProgressWebpackPlugin({
            format: options.stats === 'minimal' ? 'compact' : 'expanded',
          }),
      new BrowserSyncPlugin(
        {
          https: options.tls,
          host: 'localhost',
          port: 9000,
          proxy: {
            target: `http${options.tls ? 's' : ''}://localhost:9060`,
            proxyOptions: {
              changeOrigin: false, //pass the Host header to the backend unchanged  https://github.com/Browsersync/browser-sync/issues/430
            },
          },
          socket: {
            clients: {
              heartbeatTimeout: 60000,
            },
          },
          /*
      ,ghostMode: { // uncomment this part to disable BrowserSync ghostMode; https://github.com/jhipster/generator-jhipster/issues/11116
        clicks: false,
        location: false,
        forms: false,
        scroll: false
      } */
        },
        {
          reload: false,
        }
      ),
      new webpack.HotModuleReplacementPlugin(),
      new WebpackNotifierPlugin({
        title: 'Oncokb Transcript',
        contentImage: path.join(__dirname, 'logo-oncokb.png'),
      }),
    ].filter(Boolean),
  });
