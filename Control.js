import AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";
import * as Server from './Server'
//此文件：核心控制文件

//输出函数
let show = function(msg){
    console.log("show:",msg)
}
//外部导出
export {
    // show,
    // initRtc,
    // initRtm,
    initPre,
}
//工具栏
var canvasTools = null;
//当前页面是否已经有截图了
var screenshotsExist = null;

//rtc公共变量
let rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteVideoTrack:null,//给截图使用
};
//rtm公共变量
let rtm = {
    client  : null,
    channel : null,
}
//rtm rtc 公共配置信息
var options = {
    appId: WEBPACK_AGORA.APP_ID,
    channel: WEBPACK_AGORA.CHANNEL,
    rtc_user:{
        token : "",
        uid: WEBPACK_AGORA.RTC_USER_ID,
    },
    // rtc_local_video_width:"1600",
    // rtc_local_video_height:"600",
    rtc_remote_video_width:WEBPACK_AGORA.RTC_REMOTE_VIDEO_WIDTH,
    rtc_remote_video_height:WEBPACK_AGORA.RTC_REMOTE_VIDEO_HEIGHT,
    rtm_user :{
        uid : WEBPACK_AGORA.RTM_USER_ID,
        token: ""
    },
}
//前置 - 初始化，主要是获取rtm rtc 的token ，为后续 初始化使用
let initPre = function(){

    var data = {"username":options.rtm_user.uid.toString()};
    Server.request("/twin/agora/rtm/get/token",data,getRTMTokenCallback)

    var data =  {"username":options.rtm_user.uid.toString(),"channel":options.channel}
    Server.request("/twin/agora/rtc/get/token",data,getRTCTokenCallback)
}
//前置 - 初始化 ， 获取rtc token 回调函数
let getRTCTokenCallback = function(data){
    // console.log("getRTCTokenCallback");
    options.rtc_user.token = data;
    initRtcPre();
    initRtc();//初始化RTC
}
//前置 - 初始化 ， 获取rtm token 回调函数
let getRTMTokenCallback = function(data){
    // console.log("getRTMTokenCallback");
    options.rtm_user.token = data;
    initRtm();//初始化RTM
}

function getVideoSize (direction){
    var rs = 0;
    if (direction == "width"){
        rs = parseInt(options.rtc_remote_video_width ) / 2;
    }else if (direction == "height"){
        rs = parseInt(options.rtc_remote_video_height ) / 2;
    }else{
        alert("err:getVideoSize direction: "+ direction);
    }

    return rs;
}

function getVideoSizePlusPX (direction){
    var num  = getVideoSize(direction);
    return num.toString() + "px";
}

//前置 - 初始化 ，RTC ， 获取 摄像头、喇叭，创建监听事件等
let initRtcPre = function(){
    console.log("initRtcPre ~ : createClient , ListeningEvent : user-published , user-unpublished. ");
    // Create an AgoraRTCClient object.
    rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});

    // 监听 "user-published" 事件, 获取远程用户对象 AgoraRTCRemoteUser.
    rtc.client.on("user-published", async (user, mediaType) => {
        // Subscribe to the remote user when the SDK triggers the "user-published" event
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
        // If the remote user publishes a video track.
        if (mediaType === "video") {
            // Get the RemoteVideoTrack object in the AgoraRTCRemoteUser object.
            const remoteVideoTrack = user.videoTrack;
            rtc.remoteVideoTrack = remoteVideoTrack;//给外部使用

            var remotePlayerContainer =  document.getElementById("remote_video");
            // Specify the ID of the DIV container. You can use the uid of the remote user.

            remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
            // remotePlayerContainer.style.width = options.rtc_remote_video_width + "px";
            // remotePlayerContainer.style.height = options.rtc_remote_video_height + "px";
            remotePlayerContainer.style.width = getVideoSizePlusPX("width");
            remotePlayerContainer.style.height = getVideoSizePlusPX("height");

            // Dynamically create a container in the form of a DIV element for playing the remote video track.
            // const remotePlayerContainer = document.createElement("div");
            // remotePlayerContainer.id = user.uid.toString();
            // document.body.append(remotePlayerContainer);

            // 在DIV容器内，开始播放远程的视频流
            remoteVideoTrack.play(remotePlayerContainer);
        }

        // If the remote user publishes an audio track.
        if (mediaType === "audio") {
            // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
            const remoteAudioTrack = user.audioTrack;
            // Play the remote audio track. No need to pass any DOM element.
            remoteAudioTrack.play();
        }

        // Listen for the "user-unpublished" event
        rtc.client.on("user-unpublished", user => {
            // Get the dynamically created DIV container.
            // const remotePlayerContainer = document.getElementById(user.uid);
            // Destroy the container.
            // remotePlayerContainer.remove();
            rtc.remoteVideoTrack = null;
            document.getElementById("remote_video").innerHTML="";
            document.getElementById("bnt_send_screenshots").style.display = "none";

            closeCanvasTools();
        });
    });
}
//页面加载完成后，开始初始化RTC ,1:监听按钮事件 2:截图事件监听
let initRtc = function (){
    console.log("initRtc ~ :"," token:",options.rtc_user.token , " ListeningEvent:join , leave. ");

    document.getElementById("rtc_join").onclick = async function () {
        // Join an RTC channel.

        console.log("rtc jon :",options.rtc_user)
        await rtc.client.join(options.appId, options.channel, options.rtc_user.token, options.rtc_user.uid);
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(); //创建一个：本地 音频追踪 -> 通过麦克风，获取音频采样
        // rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();//创建一个：本地 视频追踪 -> 通过摄像头，获取音频采样
        // await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);//发布本地音频和视频到 RTC通道
        await rtc.client.publish([rtc.localAudioTrack]);//发布本地音频-> RTC通道
        // //创建一个DIV，用来播放本地视频
        // const localPlayerContainer = document.createElement("div");
        // localPlayerContainer.id = options.uid;
        // localPlayerContainer.textContent = "Local user " + options.rtc_user.uid;
        // localPlayerContainer.style.width = options.rtc_local_video_width + "px";
        // localPlayerContainer.style.height = options.rtc_local_video_height + "px";
        // document.body.append(localPlayerContainer);
        // rtc.localVideoTrack.play(localPlayerContainer);

        console.log("local AudioTrack json success, publish success!");
    };
    //点击按钮：自己离开
    document.getElementById("rtc_leave").onclick = async function () {
        // Destroy the local audio and video tracks.
        rtc.localAudioTrack.close();
        // rtc.localVideoTrack.close();

        // // Traverse all remote users.
        // rtc.client.remoteUsers.forEach(user => {
        //     // Destroy the dynamically created DIV containers.
        //     const playerContainer = document.getElementById(user.uid);
        //     playerContainer && playerContainer.remove();
        // });
        rtc.remoteVideoTrack = null;
        document.getElementById("remote_video").innerHTML="";
        document.getElementById("bnt_send_screenshots").style.display = "none";

        closeCanvasTools();
        // Leave the channel.
        await rtc.client.leave();
    };

    initScreenshots();
}
//初始化：视频截图功能
function initScreenshots(){
    //给外部节点绑定点击事件(截图)
    var bnt_screenshots = document.getElementById("bnt_screenshots");
    // bnt_screenshots.addEventListener('click',screenshots);
    bnt_screenshots.onclick = screenshots;
    var cv =  document.getElementById("my_canvas");
    cv.width = getVideoSize("width");
    cv.height = getVideoSize("height");

    var ctx = cv.getContext('2d');
    // ctx.strokeRect(20,20,150,100);

    // 设置字体
    ctx.font = "12px 微软雅黑 bolder";
    // 设置字体颜色
    ctx.fillStyle = "#955f17";
    ctx.textAlign = "center";
    // 添加文字和位置
    ctx.fillText("此处为截图", 60, 40);

    var remote_video_div =  document.getElementById("remote_video");
    remote_video_div.style.width = getVideoSizePlusPX("width");
    remote_video_div.style.height = getVideoSizePlusPX("height");
}

let initRtm = function (){
    var optionsHtml = "";
    for(let key  in options){
        if (key == "rtc_user" || key == "rtm_user"){
            continue;
        }
        optionsHtml += "<tr><td>"+key+"</td><td>"+options[key]+"</td></tr>";
    }
    $("#options_info").html(optionsHtml);

    var server_config = "";
    for(let key  in Server.configInfo){
        server_config += "<tr><td>"+key+"</td><td>"+Server.configInfo[key]+"</td></tr>";
    }
    // console.log("============== sInfo:",Server.configInfo);
    // alert(server_config);
    $("#server_config").html(server_config);



    console.log("initRtm , "," token:",options.rtm_user.token);

    rtm.client = AgoraRTM.createInstance(options.appId);
    rtm.channel = rtm.client.createChannel(options.channel);

    autoLoginJoinChannel();

}
//RTM - 页面初始化后，自动登陆并加入渠道
async function autoLoginJoinChannel(){
    console.log("rtm login:",options.rtm_user);
    await  rtm.client.login(options.rtm_user).then(() => {
        document.getElementById("log").appendChild(document.createElement('div')).append("login finish.");
        rtm.channel.join().then (() => {
            document.getElementById("log").appendChild(document.createElement('div')).append("You have successfully joined channel " + rtm.channel.channelId)
        })
    });
}


//截取 - 对方视频 - 图片
let screenshots = function (){
    screenshotsExist = 1;//标记下：已经有截图的图片了

    if (!rtc.remoteVideoTrack){
        return alert("对端还未接入视频，请等待...");
    }
    var videoFrameImgData = rtc.remoteVideoTrack.getCurrentFrameData();
    var  canvas = document.getElementById("my_canvas");
    var ctx = canvas.getContext('2d');
    // 这里先注释掉，暂时不要改变大小
    // canvas.width = videoFrameImgData.width;
    // canvas.height = videoFrameImgData.height;
    ctx.putImageData(videoFrameImgData, 0, 0);

    //给发送截图 按钮：注册点击事件
    var bnt_send_screenshots_obj = document.getElementById("bnt_send_screenshots");
    //先给按钮点击事件置空，防止重复添加事件
    bnt_send_screenshots_obj.onclick = null;
    bnt_send_screenshots_obj.onclick = function(){
        //将截图发送到服务端
        send_server();
    }
    //打开：发送截图 按钮
    bnt_send_screenshots_obj.style.display = "";
    //打开涂雅工具条
    openCanvasTools();
}
//打开涂雅工具条
let openCanvasTools = function(){
    var canvas = document.getElementById("my_canvas");
    canvasTools = new CanvasTools(canvas, {
        container : document.getElementById('myCanvasTools')
    });
}

let closeCanvasTools = function(){
    if(!screenshotsExist){
        return alert("未加入频道，也不需要关闭截图工具栏");
    }

    document.getElementById('myCanvasTools').innerHTML = "";
    canvasTools = null;
}

//截图后发送图片到服务端，回调函数，最后，再通过RTM推送到对端
let screenshotsCallback = function(data){
    var r= Math.random();
    if (process.env.NODE_ENV == "development"){
        var url = data.full_local_ip_url;
    }else{
        var url = data.full_local_domain_url;
    }
    url += "?r="+r;//加随机数，防止缓存

    var now = new Date().getTime();
    var msg = url + "," + now.toString();
    console.log("start send message:",msg);
    rtm.channel.sendMessage({ text: msg }).then(() => {
        console.log("send unity msg finish.")
        document.getElementById("log").appendChild(document.createElement('div')).append("Channel message: " + url + " from " + rtm.channel.channelId)
    });

    console.log("server back img url:",url);
}

function send_server(){
    if (!screenshotsExist){
        return alert("请先截图，再发送...");
    }
    //从canvas中读取图片流
    var  canvas = document.getElementById("my_canvas");
    var myImg = new Image();
    myImg.src = canvas.toDataURL("image/jpeg",0.7);
    //将图片流传到server端
    var data = {"stream":myImg.src}
    Server.request("/file/upload/img/one/stream/base64",data,screenshotsCallback);

}
