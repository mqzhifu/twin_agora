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
        port: 9000,
        hot: true,
        // contentBase: path.resolve(__dirname, 'dist'),
        contentBase: __dirname,
    },
    mode:"development",
};
