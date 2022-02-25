const path = require('path')
const webpack = require('webpack');

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
            '/api': {
                target: 'http://localhost:3001',
                pathRewrite: { '^/api': '' }
            },
        },
        compress: true,
        port: 3000,
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.ProvidePlugin({
               process: 'process/browser',
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