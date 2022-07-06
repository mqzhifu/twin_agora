import * as Control from './Control'

//入口文件

async function startBasicCall() {
    Control.initPre();//脚本 前置 - 初始化
    //页面载完成
    window.onload = function () {
        Control.initRtc();//初始化RTC
        Control.initRtm();//初始化RTM
    };

}


startBasicCall();
