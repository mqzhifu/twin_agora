import * as Control from './Control'

//入口文件

async function startBasicCall() {
    //页面载完成
    window.onload = function () {
        Control.initPre();//脚本 前置 - 初始化
    };

}


startBasicCall();
