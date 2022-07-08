import * as Control from './Control'

//入口文件
var myDate = new Date();
var nowDate = myDate.toLocaleString( );
console.log("entry start:",nowDate);

async function entry() {
    //页面载完成
    window.onload = function () {
        Control.initPre();//脚本 前置 - 初始化
        getEntryExecTime();
    };

}


entry().then(() => { });

function getEntryExecTime(){
    var end =new Date().getTime() -  myDate.getTime() ;
    console.log("entry exec time:",end , " (ms)");
}