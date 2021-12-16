import { Message, MessageBox } from 'element-ui';
import { isEmpty } from '../utils/utils.js';

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>websocket工具开始<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var ws;
var m_isConnectWS = false;
let timeOut1 = null;
let timeOut2 = null;
let getMessage = false;
let FUNC = null;
let url = "ws://172.16.66.48:18884";
let callFun;

export function connect() {
    console.log("制卡机：进入connect");
    if ('WebSocket' in window) {
        ws = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(url);
    } else {
        MessageBox("浏览器版本过低，请升级您的浏览器。\r\n浏览器要求：IE10+/Chrome14+/FireFox7+/Opera11+");
    }
    ws.onopen = function () {
        m_isConnectWS = true;
        console.log('制卡机：websocket服务已经连接上 ');
        //openwshandle();
        Message.success("制卡机websocket服务已连接")
    };
    ws.onmessage = (evt) => {
        getMessage = true; //接受到消息
        if (typeof (evt.data) == "string") {
            let str = evt.data;
            if (str.length <= 0) {
                return;
            }
            //var sss = onResiveServerMsg(JSON.parse(str));
            if (!isEmpty(FUNC)) {
                FUNC(str);
            }

        }
    }
    ws.onclose = function () {
        m_isConnectWS = false;
        FUNC = null;
        console.log("制卡机：成功断开webscoket服务连接");
        //connect(callback);
    };
    ws.onerror = err => {
        window.alert(`错误:${err.message}`);
        console.log("websocket 报错" + JSON.stringify(err));
        callFun(0);
    };
}

export function disconnect() {
    if (ws !== null) {
        ws.close()
    }
}

function send(body, callback, time) {
    ws.send(JSON.stringify(body));
    console.log("制卡机发送指令：" + JSON.stringify(body));

    timeOut2 = setTimeout(() => {
        if (!getMessage) {
            console.log("服务端响应超时");
            FUNC = null;
            callback("{'bizcode': '-9999','recode':'-9999', 'reinfo':'服务端响应超时','body': {'pOutInfo':'服务端响应超时'}}")
            // typeof FUNC === "function" ? FUNC() : callback();
        }
    }, time);
}

function sendMsg(body, callback, time) {
    getMessage = false;
    FUNC = null;
    clearTimeout(timeOut1);
    clearTimeout(timeOut2);
    if (typeof callback !== "function") {
        // MessageBox("callback is not a function");
        callback("{'bizcode': '-9999','recode':'-9999', 'reinfo':'callback is not a function','body': {'pOutInfo':'callback is not a function'}}")
        return;
    }
    FUNC = callback;

    //如果传入为空 默认1分钟超时时间
    if (isEmpty(time)) {
        time = 1000 * 60; //1分钟
    }

    if (m_isConnectWS) { //有连接直接发送
        send(body, callback, time);
    } else {
        connect(); //先连接websocket
        timeOut1 = setTimeout(function () { //等2秒后在执行
            if (ws.readyState == 0 || ws.readyState == 3) { //判断是否有启动本地服务
                MessageBox("本地服务疑似未启动，请启动后重试");
                return;
            }
            if (!m_isConnectWS) {
                MessageBox("本地服务疑似未连接，已为您重新连接，请重试");
                return;
            }
            send(body, callback, time);
        }, 2000)
    }
}

//建立连接
export function onload() {
    console.log("制卡机：建立webscoket服务连接");
    connect();
}

//断开连接
export function onunload() {
    console.log("制卡机：断开webscoket服务连接");
    disconnect();
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>websocket工具完毕<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>发送指令开始<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//获取设备信息 4006
export function f4006(callback) {
    sendMsg({ 'bizcode': '4006', 'body': {} }, callback);
}

//退废卡 4005
export function f4005(callback) {
    sendMsg({ 'bizcode': '4005', 'body': {} }, callback);
}

//执行打印 4004
export function f4004(callback) {
    sendMsg({ 'bizcode': '4004', 'body': {} }, callback);
}


//打印文字（4003）
export function f4003(Text, Left, Top, Font, FontSize, bBold, callback) {
    if (isEmpty(Text)) {
        MessageBox("打印文字为空");
        return;
    }
    sendMsg({
        'bizcode': '4003',
        'body': {
            'Text': Text, //待打印文字
            'Left': '' + Left, //左边距 单位毫米(mm)
            'Top': '' + Top, //上边距 单位毫米(mm)
            'Font': '' + Font, //字体
            'Font_Size': '' + FontSize, //字号
            'bBold': '' + bBold //是否加粗 true or false
        }
    }, callback);
}

//打印文字 集合
export function ftext(listtext, callback) {

    if (listtext.length < 1) {
        MessageBox("打印文字为空");
        return;
    }
    for (var i = 0; i < listtext.length; i++) {
        console.log(listtext[i])
        // setTimeout(function(){
        //   console.log("aaa>>"+listtext[i])
        f4003(listtext[i], "28", "" + (19 + i * 5), "宋体", "8", "false", callback);
        // },(i + 1) *300)
    }
}


//打印图片（4002）
export function f4002(Image, Left, Top, Width, Height, callback) {
    // if (isEmpty(Image)) {
    //     MessageBox("打印照片内容为空");
    //     return;
    // }
    sendMsg({
        'bizcode': '4002',
        'body': {
            'Image': Image, //待打印照片的BASE64编码字符串。
            'Left': '' + Left, //左边距 单位毫米(mm)
            'Top': '' + Top, //上边距 单位毫米(mm)
            'Width': '' + Width, //宽
            'Height': '' + Height //高
        }
    }, callback);
}

//设备进卡（4001）
export function f4001(Slot_Number, callback, fun) {
    callFun = fun;
    if (isEmpty(Slot_Number)) {
        MessageBox("卡槽号不可为空");
        return;
    }
    sendMsg({
        'bizcode': '4001',
        'body': {
            'Slot_Number': Slot_Number //卡槽号 （0~20：单卡槽设备传0，多卡槽设备传具体卡槽编号）
        }
    }, callback);
}

//打印图标
export function ficon(Slot_Number, callback) {
    if (isEmpty(Slot_Number)) {
        MessageBox("卡槽号不可为空");
        return;
    }
    sendMsg({
        'bizcode': '4001',
        'body': {
            'Slot_Number': Slot_Number //卡槽号 （0~20：单卡槽设备传0，多卡槽设备传具体卡槽编号）
        }
    }, callback);
}



export function openwshandle() {

}