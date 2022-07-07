const path = require("path");
var webpack = require('webpack');

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
        disableHostCheck: true,
    },
    mode:"development",
    plugins: [
        new webpack.DefinePlugin({
            // APP_ID: "8ff429463a234c7bae327d74941a5956",
            AGORA : JSON.stringify( {"APP_ID": "8ff429463a234c7bae327d74941a5956","RTC_USER_ID":2222,"RTM_USER_ID":"2222", RTC_REMOTE_VIDEO_WIDTH :"1600" ,RTC_REMOTE_VIDEO_HEIGHT:"800","CHANNEL":"ckck",}),
        })
    ]
}

