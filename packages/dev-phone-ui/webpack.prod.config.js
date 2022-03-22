const path = require('path')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LicensePlugin = require('webpack-license-plugin')

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.[contenthash].js'
    },
    plugins: [
        new webpack.ProvidePlugin({
               process: 'process/browser',
        }),
        new webpack.DefinePlugin({
            'process.env': {
              'NODE_ENV': JSON.stringify('production')
            }
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new LicensePlugin({
          replenishDefaultLicenseTexts: true,
          licenseOverrides: {
            'precond@0.2.3': "MIT"
          }
        })
    ],
    module: {
        rules: [{
            use: 'babel-loader',
            test: /\.(js|jsx)$/,
            exclude: /node_modules/
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
        {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: true
                }
              }
            ]
          }]
    },
    ignoreWarnings: [/Failed to parse source map/],
    resolve: {
      modules: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '../../node_modules'),
          'node_modules',
      ],
      extensions: ['*', '.js', '.jsx'],
      fallback: {
          "util": require.resolve("util/")
      }
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all"
          }
        }
      }
    }
}