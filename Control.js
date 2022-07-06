import AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";

let show = function(msg){
    console.log("show:",msg)
}

export {
    show,
    initRtc,
    initRtm,
    initPre,
}
// 服务器信息
let server_info = {
    //后端公共HTTP接口-头信息
    header_X_Source_Type: "11",
    header_X_Project_Id : "6",
    header_X_Access     : "imzgoframe",
    // ipPort              : "192.168.11.38:1111",
    ipPort              : "127.0.0.1:1111",
}

let rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteVideoTrack:null,//给截图使用
};

let rtm = {
    client  : null,
    channel : null,
}

let options = {
    appId: "8ff429463a234c7bae327d74941a5956",
    channel: "ckck",
    rtc_user:{
        token : "",
        uid: 22222,
    },
    rtc_local_video_width:"1600",
    rtc_local_video_height:"600",
    rtc_remote_video_width:"1600",
    rtc_remote_video_height:"600",
    rtm_user :{
        uid : "22222",
        token: ""
    },
}



let getRTCTokenCallback = function(data){
    // console.log("getRTCTokenCallback");
    options.rtc_user.token = data;
    initRtcPre();
}

let getRTMTokenCallback = function(data){
    // console.log("getRTMTokenCallback");
    options.rtm_user.token = data;
}

let initPre = function(){

    var data = {"username":options.rtm_user.uid.toString()};
    request_server("/twin/agora/rtm/get/token",data,getRTMTokenCallback)

    var data =  {"username":options.rtm_user.uid.toString(),"channel":options.channel}
    request_server("/twin/agora/rtc/get/token",data,getRTCTokenCallback)
    // getRTMToken(options.rtm_user.uid);
    // getRTCToken(options.rtc_user.uid,options.channel);
}

let initRtcPre = function(){
    console.log("initRtcPre : createClient , ListeningEvent : user-published , user-unpublished. ");
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
            // Dynamically create a container in the form of a DIV element for playing the remote video track.
            // const remotePlayerContainer = document.createElement("div");
            var remotePlayerContainer =  document.createElement("remote_video");
            // Specify the ID of the DIV container. You can use the uid of the remote user.
            remotePlayerContainer.id = user.uid.toString();
            remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
            remotePlayerContainer.style.width = options.rtc_remote_video_width + "px";
            remotePlayerContainer.style.height = options.rtc_remote_video_height + "px";
            document.body.append(remotePlayerContainer);

            // 在DIV容器内，开始播放远程的视频流
            remoteVideoTrack.play(remotePlayerContainer);

            // setTimeout(aaa,5000);
            // console.log("=====remoteVideoTrack.getMediaStreamTrack().getSettings():",remoteVideoTrack.getMediaStreamTrack().getSettings());
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
            const remotePlayerContainer = document.getElementById(user.uid);
            // Destroy the container.
            remotePlayerContainer.remove();
        });
    });
}


let initRtc = function (){
    console.log("initRtc :"," token:",options.rtc_user.token , " ListeningEvent:join , leave. ");

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

    document.getElementById("rtc_leave").onclick = async function () {
        // Destroy the local audio and video tracks.
        rtc.localAudioTrack.close();
        rtc.localVideoTrack.close();
        rtc.remoteVideoTrack = null;
        // Traverse all remote users.
        rtc.client.remoteUsers.forEach(user => {
            // Destroy the dynamically created DIV containers.
            // const playerContainer = document.getElementById(user.uid);
            // playerContainer && playerContainer.remove();
            document.getElementById("remote_video").innerHTML="";
            document.getElementById("bnt_send_screenshots").style.display = "none";
        });

        // Leave the channel.
        await rtc.client.leave();
    };
    //给外部节点绑定点击事件(截图)
    var bnt_screenshots = document.getElementById("bnt_screenshots");
    // bnt_screenshots.addEventListener('click',screenshots);
    bnt_screenshots.onclick = screenshots;
    var cv =  document.getElementById("my_canvas");
    cv.width = parseInt(options.rtc_remote_video_width ) / 2;
    cv.height = parseInt( options.rtc_remote_video_height) / 2;

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
    remote_video_div.style.width = ( parseInt(options.rtc_remote_video_width ) / 2) + "px";
    remote_video_div.style.height =( parseInt(options.rtc_remote_video_height ) / 2) + "px";
}

let initRtm = function (){
    console.log("initRtm:"," token:",options.rtc_user.token);

    rtm.client = AgoraRTM.createInstance(options.appId);
    rtm.channel = rtm.client.createChannel(options.channel);

    $("#appId").html(options.appId);
    $("#channel_name").html(options.channel);
    // document.getElementById("userID").value = options.rtm_user.uid;
    // // 登录
    // document.getElementById("login").onclick = async function () {
    //     options.rtm_user.uid = document.getElementById("userID").value.toString()
    //     console.log(options.rtm_user)
    //     await rtm.client.login(options.rtm_user)
    // }
    //
    //
    // // 创建并加入频道
    // document.getElementById("rtm_join").onclick = async function () {
    //     // Channel event listeners
    //     // Display channel messages
    //     await rtm.channel.join().then (() => {
    //         document.getElementById("log").appendChild(document.createElement('div')).append("You have successfully joined channel " + rtm.channel.channelId)
    //     })
    // }
    //
    // 发送频道消息
    // document.getElementById("send_channel_message").onclick = async function () {
    //
    //     let channelMessage = document.getElementById("channelMessage").value.toString()
    //
    //     if (rtm.channel != null) {
    //         await rtm.channel.sendMessage({ text: channelMessage }).then(() => {
    //
    //                 document.getElementById("log").appendChild(document.createElement('div')).append("Channel message: " + channelMessage + " from " + rtm.channel.channelId)
    //
    //             }
    //
    //         )
    //     }
    // }

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
//请求后端接口 - 公共头信息
let get_request_server_comm_header = function(){
    return {
        "X-Source-Type": server_info.header_X_Source_Type,
        "X-Project-Id": server_info.header_X_Project_Id,
        "X-Access": server_info.header_X_Access,
    }
}
//请求后端接口
let request_server = function (uri, data,callbackFunc){
    var url = "http://"+server_info.ipPort+uri;
    console.log("request_server url:",url , " data:",data);

    $.ajax({
        headers: get_request_server_comm_header(),
        contentType: "application/json;charset=utf-8",
        type: "POST",
        data :JSON.stringify(data),
        url: url,
        success: function(backData){
            console.log("request_server backInfo : ",backData)
            backData = eval(   backData  );
            if(backData.code != 200){
                return alert("ajax req back data err");
            }

            if (!callbackFunc){
                console.log("request_server no callback")
                return 1;
            }
            callbackFunc(backData.data);
        }
    });

}

//截取 - 对方视频 - 图片
let screenshots = function (){
    if (!rtc.remoteVideoTrack){
        return alert("对端还未接入视频，请等待...");
    }
    var videoFrameImgData = rtc.remoteVideoTrack.getCurrentFrameData();
    // var canvas = document.createElement('canvas');
    var  canvas = document.getElementById("my_canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = videoFrameImgData.width;
    canvas.height = videoFrameImgData.height;
    ctx.putImageData(videoFrameImgData, 0, 0);

    var myImg = new Image();
    myImg.src = canvas.toDataURL("image/jpeg",0.7);

    // request_service(myImg);
    var data = {"stream":myImg.src}
    request_server("/file/upload/img/one/stream/base64",data,screenshotsCallback);
}
//将截图后图片 推送到服务端 ，服务端返回图片的URL，再通过RTM推送到对端
let screenshotsCallback = function(data){
    var r= Math.random();
    // var url = "http://"+server_info.ipPort+"/"+data.local_url + "?r="+r;
    var url = data.full_local_ip_url;
    console.log("server back img url:",url);

    var bnt_send_screenshots_obj = document.getElementById("bnt_send_screenshots");
    bnt_send_screenshots_obj.onclick = null;
    bnt_send_screenshots_obj.onclick = function(url){
        rtm.channel.sendMessage({ text: url }).then(() => {
            console.log("send unity msg.")
            document.getElementById("log").appendChild(document.createElement('div')).append("Channel message: " + url + " from " + rtm.channel.channelId)
        });
    }
    bnt_send_screenshots_obj.style.display = "block";


}
