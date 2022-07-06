const path = require("path");
var webpack = require('webpack');
// const fs = require("fs");
// const dotenv = require("dotenv");
//
// // const NODE_ENV = process.env.NODE_ENV ;
// const now_dnv = "development";
// // console.log(NODE_ENV);
// const envFiles = `.env.${now_dnv}`;
// const envConfig = dotenv.parse(fs.readFileSync(envFiles))
// console.log(envConfig)
// for (const k in envConfig) {
//     process.env[k] = envConfig[k]
// }


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
            AGORA : JSON.stringify( {"APP_ID": "8ff429463a234c7bae327d74941a5956"}),
        })
    ]
}

