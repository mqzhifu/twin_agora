const path = require("path");

module.exports = {
    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist"),
    },
    devServer: {
        // https: true,
        // compress: true,
        // host : "192.168.11.38",
        // contentBase: path.resolve(__dirname, 'dist'),
        port: 9000,
        hot: true,
        contentBase: __dirname,
    },
    mode:"development",
};

