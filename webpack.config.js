const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BabiliPlugin = require("babili-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");


const buildTo = "./dest/";
var env = process.env.NODE_ENV || "dev";

var point = ["webpack-dev-server/client?http://localhost:8080/", "./index.js"];
var plugins = [
    new CleanWebpackPlugin(buildTo)
];

if (env == "prod") {
    point = ["./index.js"];
    plugins = [
        new BabiliPlugin(),
        // new UglifyJSPlugin()
    ];
}
plugins.push(
    new HtmlWebpackPlugin({
        filename: "index.html",
        template: "template/index.html"
    })
);

plugins.push(
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require("cssnano"),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
    })
);
plugins.push(
    new ExtractTextPlugin(buildTo + "bundle-[hash:6].css")
);

module.exports = {
    context: __dirname + "/",
    entry: {
        main: point
    },
    output: {
        filename: buildTo + "build-[hash:6].js"
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "raw-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                query: {
                    babelrc: false,
                },
            }
        ]
    },
    plugins: plugins,

    devServer: {
        contentBase: __dirname + "/",
        host: "localhost",
        port: 8080,
        inline: true,
        // hot: true
    },
    devtool: "source-map"
};
