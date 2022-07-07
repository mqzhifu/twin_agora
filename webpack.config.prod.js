const path = require("path");
var webpack = require('webpack');

module.exports = {

    entry: "./entry.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./dist/prod"),
    },
    mode:"production",
    plugins: [
        new webpack.DefinePlugin({
            // APP_ID: "8ff429463a234c7bae327d74941a5956",
            WEBPACK_AGORA : JSON.stringify( {"APP_ID": "8ff429463a234c7bae327d74941a5956","RTC_USER_ID":7777,"RTM_USER_ID":"7777", RTC_REMOTE_VIDEO_WIDTH :"1600" ,RTC_REMOTE_VIDEO_HEIGHT:"800","CHANNEL":"ckck",}),
            WEBPACK_SERVER : JSON.stringify({"Header_X_Source_Type":"11", "Header_X_Project_Id":"12","Header_X_Access":"imtwinagora","Http_Protocol":"https","IpPort":"api.seedreality.com"}),

        })
    ]
}
