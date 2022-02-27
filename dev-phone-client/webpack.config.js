const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    devServer: {
        static: {
          directory: path.join(__dirname, 'public'),
        },
        proxy: {
            '**': {
                target: 'http://localhost:3001',
                bypass: (req) => (req.headers.accept.includes("html") ? "/" : null)
            },
        },
        compress: true,
        port: 3000,
    },
    devtool: 'eval',
    plugins: [
        new webpack.ProvidePlugin({
               process: 'process/browser',
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
    ],
    module: {
        rules: [{
            use: 'babel-loader',
            test: /\.(js|jsx)$/,
            exclude: /node_modules/
        },
        {
            use: 'css-loader',
            test: /\.css$/,
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        fallback: {
            "util": require.resolve("util/")
        }
    },
}