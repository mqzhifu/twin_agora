const path = require("path");

module.exports = {
    entry: "./basicVideoCall.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist"),
    },
    devServer: {
        // compress: true,
        // host : "192.168.11.38",
        // contentBase: path.resolve(__dirname, 'dist'),
        port: 9000,
        hot: true,
        contentBase: __dirname,
    },
    mode:"development",
};

