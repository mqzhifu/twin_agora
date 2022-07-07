const path = require("path");
var webpack = require('webpack');

// const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {

    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist"),
    },
    mode:"production",
    plugins: [
        new webpack.DefinePlugin({
            // APP_ID: "8ff429463a234c7bae327d74941a5956",
            WEBPACK_AGORA : JSON.stringify( {
                "APP_ID": "8ff429463a234c7bae327d74941a5956",
                "RTC_USER_ID":77777,
                "RTM_USER_ID":"77777",
                "RTC_REMOTE_VIDEO_WIDTH" :"1600" ,
                "RTC_REMOTE_VIDEO_HEIGHT":"800",
                "CHANNEL":"ckck",}),
            WEBPACK_SERVER : JSON.stringify({
                "Header_X_Source_Type":"11",
                "Header_X_Project_Id":"12",
                "Header_X_Access":"imtwinagora",
                "Http_Protocol":"https",
                "IpPort":"api.seedreality.com"
            }),

        })
        ,
        //dist 下有一个index.html ，里面有些内容不能动态生成，另外:jquery.js 也有使用，所以 CleanWebpackPlugin 暂时不能使用
        // new CleanWebpackPlugin(),
    ]
}
