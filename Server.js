//外部导出
export {
    request,
    configInfo,
}

// 服务器信息
let configInfo = {
    //后端公共HTTP接口-头信息
    header_X_Source_Type: WEBPACK_SERVER.Header_X_Source_Type,
    header_X_Project_Id : WEBPACK_SERVER.Header_X_Project_Id,
    header_X_Access     :WEBPACK_SERVER.Header_X_Access,
    Http_Protocol       : WEBPACK_SERVER.Http_Protocol,
    ipPort              : WEBPACK_SERVER.IpPort,
    // ipPort              : "192.168.11.38:1111",
}

//请求后端接口 - 公共头信息
let get_request_server_comm_header = function(){
    return {
        "X-Source-Type": configInfo.header_X_Source_Type,
        "X-Project-Id": configInfo.header_X_Project_Id,
        "X-Access": configInfo.header_X_Access,
    }
}
//请求后端接口
let request = function (uri, data,callbackFunc){
    var url = configInfo.Http_Protocol+"://"+configInfo.ipPort+uri;
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