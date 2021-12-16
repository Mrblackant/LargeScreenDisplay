import { Message, MessageBox } from 'element-ui';
import { isEmpty } from '../utils/utils.js';
// import {confirmSignIn, signIn, signOut} from "../../api/eCard/eCardSignInAndOut";
// import {eCardRequest} from "../request";

// 社保卡：
// 开机认证  			sbk_kjrz 			1001
// 读基本信息			sbk_djbxx			1002
// 通用读卡  			sbk_tydk 			1005
// 通用写卡  			sbk_tyxk 			1008

// CA:
// 获取公钥  			ca_hqgy 			1021
// 写入证书  			ca_xrzs 			1022
// 获取CA证书信息  	ca_hqcazs 			1023
// 修改PIN  			ca_xgpin 			1024
// 修改主控密钥		ca_xgzkmy 			1025

// 北京通：
// 读基本信息  		bjt_djbxx 			1027
// 通用读卡	  		bjt_tydk 			1030
// 通用写卡	  		bjt_tyxk 			1033
//写北京通号      bjt_xbjth      1054

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>websocket工具开始<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var ws;
var m_isConnectWS = false;
let timeOut1 = null;
let timeOut2 = null;
let getMessage = false;
let FUNC = null;
// let url = "ws://172.16.66.48:18881";
let url = "ws://172.16.66.48:9005";
// this.ws = new WebSocket("ws://172.16.66.48:9006/");

let callFun;
export function connect() {
    console.log("读写器：进入connect");
    if ('WebSocket' in window) {
        ws = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(url);
    } else {
        MessageBox("浏览器版本过低，请升级您的浏览器。\r\n浏览器要求：IE10+/Chrome14+/FireFox7+/Opera11+");
    }
    ws.onopen = function () {
        m_isConnectWS = true;
        console.log('读写器：websocket服务已经连接上 ');
        //openwshandle();
        Message.success("读写器websocket服务已连接")
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
        console.log("读写器：成功断开webscoket服务连接");
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
    console.log("读写器发送指令：" + JSON.stringify(body));

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
    console.log("读写器：建立webscoket服务连接");
    connect();
}

//断开连接
export function onunload() {
    console.log("读写器：断开webscoket服务连接");
    disconnect();
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>websocket工具完毕<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>发送指令开始<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//读取证件信息
export function dqsfz(callback) {
    // for(var i=0;i<100;i++){
    // setTimeout(function(){
    sendMsg({
        'bizcode': '1055',
        'body': {
            'iType': "1",
            'pPhotoPath': ''
        }
    }, callback);
    // },(i + 1) *3000)
    // }
}

//读取电子社保卡二维码
export function dzsbk(callback) {
    sendMsg({ 'bizcode': '1056', 'body': {} }, callback);
}

//读银行卡号（1106）
export function dyhkh(callback) {
    sendMsg({ 'bizcode': '1057', 'body': { 'card_slot': '0x01' } }, callback);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  开始

//获取终端唯一标识
export function getDeviceId(callback, fun) {
    callFun = fun;
    sendMsg({ 'bizcode': '1056', 'body': {} }, callback);
}

//开机认证
export function sbk_kjrz(pDevInfo, callback) {
    if (isEmpty(pDevInfo)) { MessageBox("开机认证，机构编码不可为空"); return; }

    sendMsg({
        'bizcode': '1001',
        'body': {
            'pDevInfo': '' + pDevInfo
        }
    }, callback);
}

// 终端注册
export function sbk_zdzc(pDevInfo, callback) {
    if (isEmpty(pDevInfo)) { MessageBox("终端注册，机构编码不可为空"); return; }

    sendMsg({
        'bizcode': '1052',
        'body': {
            'pDevInfo': '' + pDevInfo
        }
    }, callback);
}
// 终端注销
export function sbk_zdzx(iCancelType, pDevInfo, callback) {
    if (isEmpty(iCancelType)) { MessageBox("终端注销，注销类型不可为空"); return; }
    if (isEmpty(pDevInfo)) { MessageBox("终端注销，机构编码不可为空"); return; }

    sendMsg({
        'bizcode': '1053',
        'body': {
            'iCancelType': '' + iCancelType,
            'pDevInfo': '' + pDevInfo
        }
    }, callback);
}

//读基本信息
export function sbk_djbxx(iType, pDevInfo, callback) {
    if (isEmpty(iType)) { MessageBox("社保读基本信息，卡类型不可为空"); return; }
    if (isEmpty(pDevInfo)) { MessageBox("社保读基本信息，机构编码不可为空"); return; }

    sendMsg({
        'bizcode': '1002',
        'body': {
            'iType': '' + iType,
            'pDevInfo': '' + pDevInfo,
        }
    }, callback);
}


// 读残联卡号
export function sbk_djclkh(callback) {
    console.log('进入了读取残联卡号的环节')
    sendMsg({
        'bizcode': '1201',
        'body': {
            'iType': '1'
        }
    }, callback);
}


// 读芯片序列号
export function sbk_djxpxlh(callback) {
    console.log('读取芯片序列号')
    sendMsg({
        'bizcode': '1204',
        'body': {
            'iType': '1'
        }
    }, callback);
}

// 生成卡片SM2公私密钥
export function sbk_djhash(hash, callback) {
    console.log('读取芯片序列号')
    sendMsg({
        'bizcode': '1203',
        'body': {
            'iType': '1',
            'Hash': hash
        }
    }, callback);
}

// 写残联信息
export function sbk_djxclxx(body, callback) {
    console.log('开始写残联信息')
    sendMsg({
        'bizcode': '1200',
        'body': body
    }, callback);
}

//通用读卡
export function sbk_tydk(iType, iAuthType, pCardInfo, pFileAddr, pin, callback) {
    if (isEmpty(iType)) { MessageBox("社保读通用读卡，卡类型不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("社保读通用读卡，卡基本信息不可为空"); return; }
    if (isEmpty(pFileAddr)) { MessageBox("社保读通用读卡，数据项不可为空"); return; }
    if (isEmpty(pin)) { MessageBox("社保读通用读卡，社保卡密码不可为空"); return; }

    sendMsg({
        'bizcode': '1005',
        'body': {
            'iType': '' + iType,
            'pPin': '' + pin,
            'iAuthType': '' + iAuthType,
            'pCardInfo': '' + pCardInfo, //卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割， 且最后一个数据项以“|”  结尾
            'pFileAddr': '' + pFileAddr //文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如读取持卡人姓名表示为： SSSEEF06|09|$
        }
    }, callback);
}


// 通用写卡
export function sbk_tyxk(iType, pCardInfo, pFileAddr, pWriteData, callback) {
    if (isEmpty(iType)) { MessageBox("社保通用写卡，iType（卡类型）不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("社保通用写卡，pCardInfo（卡基本信息）不可为空"); return; }
    if (isEmpty(pFileAddr)) { MessageBox("社保通用写卡，pFileAddr（数据项）不可为空"); return; }
    if (isEmpty(pWriteData)) { MessageBox("社保通用写卡，pWriteData（写卡信息）不可为空"); return; }

    sendMsg({
        'bizcode': '1008',
        'body': {
            'iType': '' + iType,
            'pCardInfo': '' + pCardInfo, //卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割，且最后一个数据项以“|”  结尾
            'pFileAddr': '' + pFileAddr, //文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如写入持卡人姓名表示为： SSSEEF06|09|$。本函数只允许对一个文件进行操作。若传入多个文件则只对第一个文件进行操作，后续内容将被忽略
            'pWriteData': '' + pWriteData
        }
    }, callback);
}


//PIN校验
export function sbk_pinjy(iType, pPIN, callback) {
    if (isEmpty(iType)) { MessageBox("参数不可为空"); return; }
    sendMsg({
        'bizcode': '1011',
        'body': {
            'iType': "" + iType,
            'pPIN': '' + pPIN
        }
    }, callback);
}

//PIN修改
export function sbk_pinxg(iType, pOldPIN, pNewPIN, callback) {
    if (isEmpty(iType)) { MessageBox("pin修改，iType（卡类型）不可为空"); return; }
    if (isEmpty(pOldPIN)) { MessageBox("社保通用写卡，pOldPIN（旧密码）不可为空"); return; }
    if (isEmpty(pNewPIN)) { MessageBox("社保通用写卡，pNewPIN（新密码）不可为空"); return; }


    sendMsg({
        'bizcode': '1012',
        'body': {
            'iType': "" + iType,
            'pOldPIN': '' + pOldPIN,
            'pNewPIN': '' + pNewPIN
        }
    }, callback);
}

//PIN重置
export function sbk_pincz(iType, pCardInfo, callback) {
    if (isEmpty(iType)) { MessageBox("pin重置，iType（卡类型）不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("pin重置，pCardInfo（卡信息）不可为空"); return; }

    sendMsg({ 'bizcode': '1013', 'body': { 'iType': "" + iType, "pCardInfo": pCardInfo } }, callback);
}

//PIN解锁
export function sbk_pinjs(iType, pCardInfo, callback) {
    if (isEmpty(iType)) { MessageBox("pin解锁，iType（卡类型）不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("pin解锁，pCardInfo（卡信息）不可为空"); return; }

    sendMsg({ 'bizcode': '1017', 'body': { 'iType': "" + iType, "pCardInfo": pCardInfo } }, callback);
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  结束


//>>>>>>>>>>>>>>>>>>>>>>>>>>CA应用操作  开始
//获取公钥
export function ca_hqgy(iType, iPublicKeyType, pin, callback) {
    if (isEmpty(iType)) { MessageBox("获取公钥，iType（卡类型）不可为空"); return; }
    if (isEmpty(iPublicKeyType)) { MessageBox("获取公钥，iPublicKeyType（公钥类型）不可为空"); return; }
    if (isEmpty(pin)) { MessageBox("获取公钥，pPIN（用户pin）不可为空"); return; }

    sendMsg({
        'bizcode': '1021',
        'body': {
            'iType': '' + iType,
            'iPublicKeyType': '' + iPublicKeyType,
            'pPIN': '' + pin
        }
    }, callback);
}

//获取CA证书信息
export function ca_hqcazs(pPublicKey, pPersonInfo, callback) {
    if (isEmpty(pPublicKey)) { MessageBox("获取ca证书信息，pPublicKey（签名公钥）不可为空"); return; }
    if (isEmpty(pPersonInfo)) { MessageBox("获取ca证书信息，pPersonInfo（卡信息）不可为空"); return; }

    sendMsg({
        'bizcode': '1023',
        'body': {
            'pPublicKey': '' + pPublicKey,
            'pPersonInfo': '' + pPersonInfo
        }
    }, callback);
}


//写入证书
export function ca_xrzs(iType, pPIN, pSCertificate, pECertificate, pEKey, callback) {
    if (isEmpty(iType)) { MessageBox("写入证书，iType（卡类型）不可为空"); return; }
    if (isEmpty(pPIN)) { MessageBox("写入证书，pPIN（用户pin）不可为空"); return; }
    if (isEmpty(pSCertificate)) { MessageBox("写入证书，pSCertificate（签名证书）不可为空"); return; }
    if (isEmpty(pECertificate)) { MessageBox("写入证书，pECertificate（加密证书）不可为空"); return; }
    if (isEmpty(pEKey)) { MessageBox("写入证书，pEKey（加密密钥）不可为空"); return; }

    sendMsg({
        'bizcode': '1022',
        'body': {
            'iType': '' + iType,
            'pUserPIN': '' + pPIN,
            'pSCertificate': '' + pSCertificate,
            'pECertificate': '' + pECertificate,
            'pEKey': '' + pEKey //用户PIN
        }
    }, callback);
}

//修改PIN
export function ca_xgpin(iType, iPinType, pOldPIN, pNewPIN, callback) {
    if (isEmpty(iType)) { MessageBox("修改PIN ，iType（卡类型）不可为空"); return; }
    if (isEmpty(iPinType)) { MessageBox("修改PIN， iPinType（密钥类型）不可为空"); return; }
    if (isEmpty(pOldPIN)) { MessageBox("修改PIN ，pOldPIN（旧密码）不可为空"); return; }
    if (isEmpty(pNewPIN)) { MessageBox("修改PIN ，pNewPIN（新密码）不可为空"); return; }

    sendMsg({
        'bizcode': '1024',
        'body': {
            'iType': '' + iType,
            'iPinType': '' + iPinType,
            'pOldPIN': '' + pOldPIN,
            'pNewPIN': '' + pNewPIN
        }
    }, callback);
}

//修改主控密钥
export function ca_xgzkmy(iType, pOldDF01, pOldPKI, pPrimaryKey, callback) {
    if (isEmpty(iType)) { MessageBox("修改主控密钥 ，iType（卡类型）不可为空"); return; }
    if (isEmpty(pOldDF01)) { MessageBox("修改主控密钥， pOldDF01（原始DF01主控密钥）不可为空"); return; }
    if (isEmpty(pOldPKI)) { MessageBox("修改主控密钥 ，pOldPKI（原始PKI主控密钥）不可为空"); return; }
    if (isEmpty(pPrimaryKey)) { MessageBox("修改主控密钥 ，pPrimaryKey（新主控密钥）不可为空"); return; }

    sendMsg({
        'bizcode': '1025',
        'body': {
            'iType': '' + iType,
            'pOldDF01': '' + pOldDF01,
            'pOldPKI': '' + pOldPKI,
            'pPrimaryKey': '' + pPrimaryKey
        }
    }, callback);
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>CA应用操作  结束


//>>>>>>>>>>>>>>>>>>>>>>>>>>北京通操作定义  开始
//读基本信息
export function bjt_djbxx(iType, iAppType, pDevInfo, callback) {
    if (isEmpty(iType)) { MessageBox("北京通读基本信息 ，iType（卡类型）不可为空"); return; }
    if (isEmpty(iAppType)) { MessageBox("北京通读基本信息， iAppType（应用标识）不可为空"); return; }
    if (isEmpty(pDevInfo)) { MessageBox("北京通读基本信息 ，pDevInfo（终端信息）不可为空"); return; }

    sendMsg({
        'bizcode': '1027',
        'body': {
            'iType': '' + iType,
            'iAppType': '' + iAppType,
            'pDevInfo': '' + pDevInfo
        }
    }, callback);
}

//通用读卡
export function bjt_tydk(iType, pin, iAuthType, iAppType, pCardInfo, pFileAddr, callback) {
    if (isEmpty(iType)) { MessageBox("北京通读通用读卡，卡类型不可为空"); return; }
    if (isEmpty(iAppType)) { MessageBox("北京通读通用读卡，iAppType（应用标识）不可为空"); return; }
    if (isEmpty(iAuthType)) { MessageBox("北京通读通用读卡，iAuthType（认证方式）不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("北京通读通用读卡，pCardInfo（卡基本信息）不可为空"); return; }
    if (isEmpty(pFileAddr)) { MessageBox("北京通读通用读卡，pFileAddr（数据项）不可为空"); return; }
    if (isEmpty(pin)) { MessageBox("北京通读通用读卡，pPIN（应用密码）不可为空"); return; }

    sendMsg({
        'bizcode': '1030',
        'body': {
            'iType': '' + iType,
            'pPIN': '' + pin,
            'iAuthType': '' + iAuthType,
            'iAppType': '' + iAppType,
            'pCardInfo': '' + pCardInfo,
            'pFileAddr': '' + pFileAddr
        }
    }, callback);
}


//通用写卡
export function bjt_tyxk(iType, iAppType, pCardInfo, pFileAddr, pWriteData, callback) {
    if (isEmpty(iType)) { MessageBox("北京通读通用写卡，卡类型不可为空"); return; }
    if (isEmpty(iAppType)) { MessageBox("北京通读通用写卡，iAppType（应用标识）不可为空"); return; }
    if (isEmpty(pWriteData)) { MessageBox("北京通读通用写卡，pWriteData（写卡信息）不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("北京通读通用写卡，pCardInfo（卡基本信息）不可为空"); return; }
    if (isEmpty(pFileAddr)) { MessageBox("北京通读通用写卡，pFileAddr（数据项）不可为空"); return; }

    sendMsg({
        'bizcode': '1033',
        'body': {
            'iType': '' + iType,
            'iAppType': '' + iAppType,
            'pCardInfo': '' + pCardInfo, //卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割，且最后一个数据项以“|”  结尾
            'pFileAddr': '' + pFileAddr, //文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如写入持卡人姓名表示为： SSSEEF06|09|$。本函数只允许对一个文件进行操作。若传入多个文件则只对第一个文件进行操作，后续内容将被忽略
            'pWriteData': '' + pWriteData
        }
    }, callback);
}

//写北京通号
export function bjt_xbjth(iType, pCardInfo, pDevInfo, callback) {
    if (isEmpty(iType)) { MessageBox("写北京通号，卡类型不可为空"); return; }
    if (isEmpty(pCardInfo)) { MessageBox("写北京通号，pCardInfo（北京通号）不可为空"); return; }
    if (isEmpty(pDevInfo)) { MessageBox("写北京通号，pDevInfo（终端信息）不可为空"); return; }

    sendMsg({
        'bizcode': '1054',
        'body': {
            'iType': '' + iType,
            'pCardInfo': '' + pCardInfo, //北京通号
            'pDevInfo': '' + pDevInfo //网点编号|渠道编码|
        }
    }, callback);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  结束
export function openwshandle() {

}


// >>>>>>>>>>>>>>>>>>> 一卡通 相关
var formInline = {
    mobileno: '',
    name: '', // 本二
    image: '',
    identifyid: '', // 371525199010277960 420321199512050325
    idtype: '00',
    mscardno: '', // A00012900
    cardno: '', //   03105170000000000216
    banknumber: '',
    cardcsn: '', //   59B1BA83 59B1865B
    cardenabledate: "",
    cardexpdate: "",
    cardst: "00",
    cardtype: "",
}
const idTypesMap = {
    '1': '00',
    '5': '03',
    '6': '02',
    '16': '04',
    '18': '05',
    '8': '01'
}
var readerhandle;
var card_slot = '0x31';
var psamNo = '';
let psamSlot = '0x11';
// let url = '/traffic/issue';
export function OpenDevice(callback) //打开读写器
{
    sendMsg({
        'bizcode': '1100',
        'body': {
            'DeviceName': 'AUTO'
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            readerhandle = reinfomsg['body']['pOutInfo'];
            if (readerhandle < 0) {
                readerhandle = '';
                callback(false);
            } else {
                callback(true);
            }
        } else {
            callback(false);
        }
    });
}

export function CloseDevice() //关闭读写器
{
    sendMsg({
        'bizcode': '1101',
        'body': {
            'readerhandle': '' + readerhandle
        }
    }, callback);
}

export function PowerOn(card_slot, callback) //CPU卡上电
{
    sendMsg({
        'bizcode': '1102',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            const ret = reinfomsg['body']['pOutInfo'];
            if (ret < 0) {
                callback(false)
            } else {
                callback(true)
            }
        } else {
            callback(false);
        }
    });
}

export function PowerOff(callback) //CPU卡下电
{
    sendMsg({
        'bizcode': '1103',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, callback);
}

export function CardApplication(apdu, callback) // 发送指令
{
    const len = (apdu.length) / 2;
    sendMsg({
        'bizcode': '1105',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
            'len': '' + len,
            'apdu': '' + apdu
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        let APDU_Info;
        if (recode == 0) {
            APDU_Info = reinfomsg['body']['pOutInfo'];
            if (APDU_Info.substring(APDU_Info.length - 4) == '9000') {
                callback(APDU_Info.substring(0, APDU_Info.length - 4));
            } else {
                callback()
            }
        } else {
            callback();
        }
    });
}

export function CardApplicationPsam(apdu, card_slot, callback) // 发送指令
{
    const len = (apdu.length) / 2;
    sendMsg({
        'bizcode': '1105',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
            'len': '' + len,
            'apdu': '' + apdu
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        let APDU_Info;
        if (recode == 0) {
            APDU_Info = reinfomsg['body']['pOutInfo'];
            if (APDU_Info.substring(APDU_Info.length - 4) == '9000') {
                callback(APDU_Info.length == 4 ? true : APDU_Info.substring(0, APDU_Info.length - 4));
            } else {
                callback()
            }
        } else {
            callback();
        }
    });
}

export function CardApplication1(apdu, callback) // 发送指令
{
    const len = (apdu.length) / 2;
    sendMsg({
        'bizcode': '1105',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
            'len': '' + len,
            'apdu': '' + apdu
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        let APDU_Info;
        if (recode == 0) {
            APDU_Info = reinfomsg['body']['pOutInfo'];
        }
        callback(APDU_Info);
    });

}

export function iGetSSCardNo(callback) //读社保卡号或PSAM卡终端机编号
{
    formInline.mscardno = '';
    sendMsg({
        'bizcode': '1107',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            formInline.mscardno = reinfomsg['body']['pOutInfo'];
        }
        callback(formInline.mscardno != '');
    });
}

export function iGetBankCardNo(callback) //读金融卡号
{
    sendMsg({
        'bizcode': '1106',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            callback(reinfomsg['body']['pOutInfo']);
        } else {
            callback();
        }
    });
}
export function iGetYktJTCardNo(callback) //读一卡通卡号或PSAM卡终端机编号
{
    formInline.cardno = '';
    sendMsg({
        'bizcode': '1108',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            formInline.cardno = reinfomsg['body']['pOutInfo'];
        }
        callback(formInline.cardno != '');
    });
}

export function iPsamTCardNo(card_slot, callback) //读PSAM卡终端机编号
{
    psamNo = '';
    sendMsg({
        'bizcode': '1108',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            psamNo = reinfomsg['body']['pOutInfo'];
        }
        console.log("psam卡号：" + psamNo + ":" + (psamNo != ''));
        callback((psamNo != ''));
    });
}

export function iGetYktJTCardBas(callback) // 读一卡通交通的卡状态、启用日期、有效期
{
    sendMsg({
        'bizcode': '1110',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            const info = reinfomsg['body']['pOutInfo'];
            if (info) {
                const infos = info.split("|");
                if (infos.length >= 3) {
                    callback(infos);
                    return;
                }
            }
        }
        callback();
    });
}

export function getCSN(callback) //非接CPU卡上电（激活）
{
    formInline.cardcsn = '';
    var delaytime = 10;
    sendMsg({
        'bizcode': '1104',
        'body': {
            'readerhandle': '' + readerhandle,
            'delaytime': '' + delaytime,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            const info = reinfomsg['body']['pOutInfo'];
            if (info) {
                const infos = info.split("|");
                if (infos.length >= 2) {
                    formInline.cardcsn = infos[1];
                }
            }
        }
        callback(formInline.cardcsn != '');
    });
}

// 获取交通卡类型
export function iGetYktJTCardType(callback) {
    formInline.cardtype = '';
    sendMsg({
        'bizcode': '1112',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
        }
    }, (data) => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        if (recode == 0) {
            const type = reinfomsg['body']['pOutInfo'];
            formInline.cardtype = type.length === 1 ? 0 + type : type;
        }
        callback(formInline.cardtype != '');
    });
}

export function iWriteYktJTCardPhotoData(PhotoData, callback) {
    sendMsg({
        'bizcode': '1114',
        'body': {
            'readerhandle': '' + readerhandle,
            'card_slot': '' + card_slot,
            'card_slot_psam': '' + psamSlot,
            'PhotoData': '' + PhotoData
        }
    }, data => {
        const reinfomsg = eval('(' + data + ')');
        console.log("读写器返回：" + JSON.stringify(reinfomsg));
        let recode = reinfomsg['recode']; //是否成功标识
        callback(recode);
    });
}

// 交通卡前置
export function sendOutJTCardPre(fun, func) {
    OpenDevice(ret => {
        if (ret) {
            PowerOn(card_slot, retP => {
                if (retP) {
                    CardApplication("00A4040008A000000632010105", retC => {
                        if (retC) {
                            func();
                        } else {
                            MessageBox("一卡通发卡: 选择交通卡环境失败！");
                            fun();
                        }
                    })
                } else {
                    MessageBox("一卡通发卡: 复位失败！");
                    fun();
                }
            });
        } else {
            MessageBox("一卡通发卡: 打开读卡器失败！");
            fun();
        }
    });
}

function signOutT(form, readerhandle, cardNo, randomNum, retOut, functionT) {

    signOut(form).then(function (ret) {
        console.log("signOut ===================" + JSON.stringify(ret))
        signInT(ret, readerhandle, cardNo, randomNum, retOut, functionT);
    }).catch(e => {
        console.log(e);
        functionT(0);
    });
}

function signInT(ret, readerhandle, cardNo, randomNum, retOut, functionT) {

    if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
        console.log("签退成功！！！");
        const form = {
            "msghead": {
                "messagetype": "8001",
                "samid": cardNo
            },
            "msgbody": {
                "psamrandom": randomNum
            }
        };
        signIn(form).then((retIn) => {
            console.log("signInR ===================" + JSON.stringify(retIn));
            if (retIn.code == 200 && retIn.data && retIn.data.msghead.responsecode == '0000') {
                const centerseq = retIn.data.msgbody.centerseq;
                const syssettdate = retIn.data.msgbody.syssettdate;
                // checkCard
                var apdu = "0082000108" + retIn.data.msgbody.randomenc;
                console.log("apdu:" + apdu);
                CardApplicationPsam(apdu, psamSlot, checkRet => {
                    console.log("外部认证结果：" + checkRet);
                    if (checkRet) {
                        const data = {
                            "msghead": {
                                "messagetype": "8000",
                                "samid": form.msghead.samid
                            },
                            "msgbody": {
                                "centerseq": centerseq,
                                "syssettdate": syssettdate,
                                "loginrspcode": retIn.data.msghead.responsecode,
                                "loginrspdsp": retIn.data.msghead.responsedesp
                            }
                        };
                        console.log("confirmSignInP ===================" + JSON.stringify(data))
                        confirmSignInT(data, functionT)
                    } else {
                        functionT(0);
                    }
                });
            } else {
                functionT(0);
            }
        }).catch(e => {
            console.log(e);
            functionT(0);
        });
    } else {
        functionT(0);
    }
}

function confirmSignInT(data, functionT) {
    console.log("functionT======" + JSON.stringify(functionT));
    confirmSignIn(data).then(function (ret) {
        console.log("confirmSignInT ===================" + JSON.stringify(ret))
        if (ret.code == 200) {
            console.log("一卡通Psam签到成功！");
            functionT(1);
        } else {
            functionT(0);
        }
    }).catch(e => {
        console.log(e);
        functionT(0);
    });
}

function writeImageT(imageData, functionT) {
    console.log("functionT======" + JSON.stringify(functionT));
    PowerOn(card_slot, ret => {
        if (ret) {
            iWriteYktJTCardPhotoData(imageData, retS => {
                if (retS < 0) {
                    console.log("错误码(" + retS + ").写一卡通交通照片失败！");
                    if (retS == -4 || retS == -27010) {
                        writeImageAndSign(imageData, functionT);
                        return;
                    }
                    functionT(0);
                } else {
                    console.log("写一卡通交通照片成功！");
                    functionT(1);
                }
            });
        } else {
            functionT(0);
        }
    });
}

function writeImageAndSign(imageData, functionT) {
    PowerOn(card_slot, (ret) => {
        if (ret) {
            PowerOn(psamSlot, retP => {
                if (retP) {
                    CardApplicationPsam("00B0960006", psamSlot, cardNo => {
                        if (cardNo) {
                            CardApplicationPsam("0084000008", psamSlot, randomNum => {
                                if (randomNum) {
                                    const formOut = {
                                        "msghead": {
                                            "messagetype": "8003",
                                            "samid": cardNo
                                        }
                                    };
                                    const retOut = {
                                        code: -1
                                    };
                                    signOutT(formOut, readerhandle, cardNo, randomNum, retOut, ret => {
                                        if (ret == 1) {
                                            iWriteYktJTCardPhotoData(imageData, retS => {
                                                if (retS < 0) {
                                                    console.log("错误码(" + retS + ").写一卡通交通照片失败！");
                                                    if (retS == -4 || retS == -27010) {
                                                        // writeImageAndSign(imageData, functionT);
                                                        // return;
                                                    }
                                                    functionT(0);
                                                } else {
                                                    console.log("写一卡通交通照片成功！");
                                                    functionT(1);
                                                }
                                            });
                                        } else {
                                            functionT(0);
                                        }
                                    });
                                } else {
                                    console.log("获取随机数失败")
                                    functionT(0);
                                }
                            })
                        } else {
                            console.log("获取Psam卡号失败")
                            functionT(0);
                        }
                    })
                } else {
                    functionT(0);
                }
            });
        } else {
            functionT(0);
        }
    });
}

export function ecardMake(huiPanform, fun, func, transType, transStatus) {

    OpenDevice(ret => {
        if (ret) {
            iPsamTCardNo(psamSlot, retP => {
                if (retP) {
                    eCardRequest.post("/traffic/eCardHolderInquiryByIdt", {
                        name: huiPanform.personalInformation.aac003,
                        identifyid: huiPanform.personalInformation.aac002
                    }).then(ret => {
                        if (ret.code == 200) {
                            if (ret.data.change) {
                                formInline.banknumber = ret.data.bankaccno;
                                formInline.origcardtype = ret.data.cardtype;
                                formInline.origmscardno = ret.data.mscardno;
                                formInline.origcardno = ret.data.cardno;


                                //这里分为好卡补换卡，坏卡补换卡以及挂失补换卡，如果为好卡补换卡走重新发卡的流程，否则改变changeType走换卡流程
                                if (transStatus && transType) {
                                    if (transType == '31' && transStatus == '00') {
                                        getCardInfo(huiPanform, fun, func, '1');
                                    } else if (transType == '10' && transStatus == '31') {
                                        //坏卡补换卡
                                        getCardInfoChange(huiPanform, '0', fun, func);
                                    } else if (transType == '10' && transStatus == '30') {
                                        //挂失补换卡
                                        getCardInfoChange(huiPanform, '1', fun, func);
                                    }
                                } else {
                                    MessageBox('检测到transStatus或者transType为空,出现异常，开始退卡');
                                }
                            } else {
                                getCardInfo(huiPanform, fun, func, '0');
                            }
                        } else {
                            getCardInfo(huiPanform, fun, func, '0');
                            return;
                        }
                    }).catch(e => {
                        MessageBox("一卡通发卡: 查询信息失败！");
                        fun();
                    })
                } else {
                    MessageBox("一卡通发卡: 获取Psam卡号失败！");
                    fun();
                }
            })
        } else {
            MessageBox("一卡通发卡: 打开读卡器失败！");
            fun();
        }
    })
}

function getCardInfoChange(row, changeType, fun, func) {
    OpenDevice(ret => {
        if (ret) {
            getCSN(isCsn => {
                if (isCsn) {
                    iGetYktJTCardType(isCardType => {
                        if (isCardType) {
                            iGetSSCardNo(isMS => {
                                if (isMS) {
                                    iGetYktJTCardNo(isJt => {
                                        if (isJt) {
                                            iGetBankCardNo(isBank => {
                                                if (isBank) {
                                                    formInline.newbanknumber = isBank;
                                                    iGetYktJTCardBas(infos => {
                                                        if (infos) {
                                                            formInline.name = row.personalInformation.aac003;
                                                            formInline.idtype = idTypesMap[row.personalInformation.aac058];
                                                            formInline.identifyid = row.personalInformation.aac002;
                                                            formInline.image = row.imageInformation.photoSmall;
                                                            formInline.cardst = infos[0];
                                                            // formInline.cardst = '00';
                                                            formInline.cardenabledate = infos[1];
                                                            formInline.cardexpdate = infos[2];
                                                            reissueECard(fun, func, changeType);
                                                        } else {
                                                            MessageBox("一卡通发卡: 获取一卡通卡号失败！");
                                                            fun();
                                                        }
                                                    })
                                                } else {
                                                    MessageBox("一卡通发卡: 获取银行卡号失败！");
                                                    fun();
                                                }
                                            })
                                        } else {
                                            MessageBox("一卡通发卡: 获取一卡通卡号失败！");
                                            fun();
                                        }
                                    })
                                } else {
                                    MessageBox("一卡通发卡: 获取民生卡号失败！");
                                    fun();
                                }
                            })
                        } else {
                            MessageBox("一卡通发卡: 获取一卡通卡类型失败！");
                            fun();
                        }
                    })
                } else {
                    MessageBox("一卡通发卡: 获取CSN失败！");
                    fun();
                }
            });
        } else {
            MessageBox("一卡通发卡: 打开读卡器失败！");
            fun();
        }
    })
}

function getFormInfo(fun, func) {

    eCardRequest.get("/traffic/eCardHolderInquiry?bankaccno=" + formInline.banknumber)
        .then(ret => {
            if (ret.code == 200) {
                formInline.origcardtype = ret.data.cardtype;
                formInline.origmscardno = ret.data.mscardno;
                formInline.origcardno = ret.data.cardno;
                reissueECard(fun, func);
            } else {
                MessageBox("查询原卡信息失败：" + ret.msg);
                fun();
            }
        }).catch(e => {
            MessageBox("查询原卡信息失败：" + ret.msg);
            fun();
        });
}

function getCardInfo(row, fun, func, issueType) {

    OpenDevice(ret => {
        if (ret) {
            getCSN(isCsn => {
                if (isCsn) {
                    iGetYktJTCardType(isCardType => {
                        if (isCardType) {
                            iGetSSCardNo(isMS => {
                                if (isMS) {
                                    iGetYktJTCardNo(isJt => {
                                        if (isJt) {
                                            iGetBankCardNo(isBank => {
                                                if (isBank) {
                                                    formInline.banknumber = isBank;
                                                    iGetYktJTCardBas(infos => {
                                                        if (infos) {
                                                            formInline.name = row.personalInformation.aac003;
                                                            formInline.idtype = idTypesMap[row.personalInformation.aac058];
                                                            formInline.identifyid = row.personalInformation.aac002;
                                                            formInline.mobileno = row.personalInformation.aae005;
                                                            formInline.image = row.imageInformation.photoSmall;
                                                            formInline.cardst = infos[0];
                                                            // formInline.cardst = '00';
                                                            formInline.cardenabledate = infos[1];
                                                            formInline.cardexpdate = infos[2];
                                                            eCardSendOut(fun, func, issueType);
                                                        } else {
                                                            MessageBox("一卡通发卡: 获取一卡通卡号失败！");
                                                            fun();
                                                        }
                                                    })
                                                } else {
                                                    MessageBox("一卡通发卡: 获取银行卡号失败！");
                                                    fun();
                                                }
                                            })
                                        } else {
                                            MessageBox("一卡通发卡: 获取一卡通卡号失败！");
                                            fun();
                                        }
                                    })
                                } else {
                                    MessageBox("一卡通发卡: 获取民生卡号失败！");
                                    fun();
                                }
                            })
                        } else {
                            MessageBox("一卡通发卡: 获取一卡通卡类型失败！");
                            fun();
                        }
                    })
                } else {
                    MessageBox("一卡通发卡: 获取CSN失败！");
                    fun();
                }
            });
        } else {
            MessageBox("一卡通发卡: 打开读卡器失败！");
            fun();
        }
    })
}

function eCardSendOut(fun, func, issueType) {

    eCardRequest
        .post('/traffic/issue/v1', {
            msghead: {
                samid: psamNo,
            },
            issueType: issueType,
            msgbody: formInline
        }).then((ret) => {
            if (ret.code == 600 || (ret.data && ret.data.msghead.responsecode == '0014')) {
                eCardSendOutAndSign(fun, func);
                return;
            }
            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                lockEcard("/traffic/cardLock", formInline, msg => {
                    MessageBox("此卡为黑名单卡，" + msg);
                    fun();
                });
                return;
            }

            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                const data = ret.data;
                if (!data.msgbody.image || data.msgbody.image.length == 0) {
                    MessageBox("发卡失败！");
                    fun();
                } else {
                    // MessageBox("可以发卡！");
                    // fun();
                    writeImageT(data.msgbody.image, function (ret) {
                        console.log("===================图片写入完成：" + ret);
                        if (ret != 1) {
                            console.log("图片写入失败");
                            MessageBox(" 图片写入失败！", "发卡失败");
                            fun();
                            return;
                        } else {
                            console.log("=========> 写照片成功")
                            sendOutJTCardPre(fun, () => {
                                sendOutAppend(data, fun, func);
                            });
                        }
                    })
                }
            } else {
                MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                fun();
            }
        }).catch(e => {
            MessageBox("一卡通发卡失败！");
            fun();
        })
}

function eCardSendOutAndSign(fun, func) {

    OpenDevice(ret => {
        if (ret) {
            PowerOn(psamSlot, retP => {
                if (retP) {
                    CardApplicationPsam("0084000008", psamSlot, randomNum => {
                        if (randomNum) {
                            const formOut = {
                                "msghead": {
                                    "messagetype": "8003",
                                    "samid": psamNo
                                }
                            };
                            const retOut = {
                                code: -1
                            };
                            signOutT(formOut, readerhandle, psamNo, randomNum, retOut, isSign => {
                                if (isSign == 0) {
                                    console.log("签到失败");
                                    MessageBox(" 签到失败！", "发卡失败");
                                    fun();
                                    return;
                                }
                                eCardRequest
                                    .post('/traffic/issue/v1', {
                                        msghead: {
                                            samid: psamNo,
                                        },
                                        msgbody: formInline
                                    }).then((ret) => {
                                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                                            lockEcard("/traffic/cardLock", formInline, msg => {
                                                MessageBox("此卡为黑名单卡，" + msg);
                                                fun();
                                            });
                                            return;
                                        }
                                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                                            const data = ret.data;
                                            if (!data.msgbody.image || data.msgbody.image.length == 0) {
                                                MessageBox("发卡失败！");
                                                fun();
                                            } else {
                                                writeImageT(data.msgbody.image, function (ret) {
                                                    console.log("===================图片写入完成：" + ret);
                                                    if (ret != 1) {
                                                        console.log("图片写入失败");
                                                        MessageBox(" 图片写入失败！", "发卡失败");
                                                        fun();
                                                        return;
                                                    } else {
                                                        console.log("=========> 写照片成功")
                                                        sendOutJTCardPre(fun, () => {
                                                            sendOutAppend(data, fun, func);
                                                        });
                                                    }
                                                })
                                            }
                                        } else {
                                            MessageBox((ret.data && ret.data.msghead.responsedesp) ? ret.data.msghead.responsedesp : ret.msg);
                                            fun();
                                        }
                                    })
                            });
                        } else {
                            MessageBox("一卡通发卡失败：PSAM卡随机数获取失败！");
                            fun();
                        }

                    })
                } else {
                    MessageBox("一卡通发卡失败：PSAM卡复位失败！");
                    fun();
                }
            });
        } else {
            MessageBox("一卡通发卡失败：打开读卡器失败！");
            fun();
        }
    })
}

function eCardChangeAndSign(fun, func) {
    OpenDevice(ret => {
        if (ret) {
            PowerOn(psamSlot, retP => {
                if (retP) {
                    CardApplicationPsam("0084000008", psamSlot, randomNum => {
                        if (randomNum) {
                            const formOut = {
                                "msghead": {
                                    "messagetype": "8003",
                                    "samid": psamNo
                                }
                            };
                            const retOut = {
                                code: -1
                            };
                            signOutT(formOut, readerhandle, psamNo, randomNum, retOut, isSign => {
                                if (isSign == 0) {
                                    console.log("签到失败");
                                    MessageBox(" 签到失败！", "发卡失败");
                                    fun();
                                    return;
                                }
                                eCardRequest
                                    .post("/traffic/change/v1", {
                                        msghead: {
                                            samid: psamNo,
                                        },
                                        msgbody: formInline
                                    })
                                    .then((ret) => {
                                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                                            lockEcard("/traffic/cardLock", formInline, msg => {
                                                MessageBox("此卡为黑名单卡，" + msg);
                                                fun();
                                            });
                                            return;
                                        }
                                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                                            const data = ret.data;
                                            if (!data.msgbody.image || data.msgbody.image.length == 0) {
                                                MessageBox("补换卡失败！")
                                                fun();
                                            } else {
                                                writeImageT(data.msgbody.image, function (ret) {
                                                    console.log("===================图片写入完成：" + ret);
                                                    if (ret != 1) {
                                                        console.log("图片写入失败");
                                                        MessageBox("补换卡失败: 图片写入失败！");
                                                        fun();
                                                        return;
                                                    } else {
                                                        console.log("=========> 写照片成功");
                                                        sendOutJTCardPre(fun, () => {
                                                            eCardChangeAppend(data, fun, func);
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                                            fun();
                                        }
                                    }).catch(e => {
                                        MessageBox("一卡通发卡: 补换卡失败！");
                                        fun();
                                    });
                            });
                        } else {
                            MessageBox("一卡通发卡失败：PSAM卡随机数获取失败！");
                            fun();
                        }

                    })
                } else {
                    MessageBox("一卡通发卡失败：PSAM卡复位失败！");
                    fun();
                }
            })
        } else {
            MessageBox("一卡通发卡失败：打开读卡器失败！");
            fun();
        }
    })
}

function runApdu(apdu, retAdpu, isRet, fun, funC) {
    if (apdu == '') {
        funC(retAdpu, isRet);
        return;
    }
    const len = parseInt(apdu.substring(4, 6), 16);
    console.log("len 长度：" + len);
    const isRe = parseInt(apdu.substring(0, 2), 16);
    console.log("isRe 长度：" + isRe);
    CardApplication1(apdu.substring(6, 6 + len * 2), info => {
        if (info) {
            const r = info.substring(info.length - 4, info.length);
            if (r != '9000' && isRet == true) {
                isRet = true;
            }
            if (isRe == 0) {
                let l = (r.length / 2).toString(16);
                if (l.length == 1) {
                    l = '0' + l;
                }
                retAdpu += l + r;
            } else {
                let l = (info.length / 2).toString(16);
                if (l.length == 1) {
                    l = '0' + l;
                }
                retAdpu += l + info;
            }
        } else {
            MessageBox("发卡失败！！！");
            fun();
            return;
        }
        apdu = apdu.length > (6 + len * 2) ? apdu.substring(6 + len * 2, apdu.length) : "";
        runApdu(apdu, retAdpu, isRet, fun, funC);
    });
}

function sendOutAppend(data, fun, func) {
    try {
        var num = "";
        num = parseInt(data.msgbody.totalpacnum, 16);
        const no = parseInt(data.msgbody.apdupacno, 16);
        console.log("apdu 长度：" + data.msgbody.apduseq);

        let adpu = data.msgbody.apduseq;
        let retAdpu = '';
        let isRet = false;
        runApdu(adpu, retAdpu, isRet, fun, (retAdpu, isRet) => {
            console.log("一共" + num + "步，现在进行到" + no + "步！:" + retAdpu);
            data.msgbody.apduseq = retAdpu;
            data.msgbody.name = formInline.name;
            data.msgbody.idtype = formInline.idtype;
            data.msgbody.identifyid = formInline.identifyid;
            data.msgbody.cardenabledate = formInline.cardenabledate;
            data.msgbody.cardexpdate = formInline.cardexpdate;
            data.msgbody.cardst = formInline.cardst;
            data.msgbody.apdupaclen = (retAdpu.length / 2).toString(16);
            data.msgbody.mscardno = formInline.mscardno; // A00012900
            data.msgbody.cardno = formInline.cardno; //   03105170000000000216
            data.msgbody.banknumber = formInline.banknumber;
            data.msgbody.cardcsn = formInline.cardcsn; //   59B1BA83 59B1865B
            data.msgbody.cardtype = formInline.cardtype;
            data.msgbody.image = "";
            if (num == no) {
                iGetYktJTCardType(isCardType => {
                    if (isCardType) {
                        data.msgbody.cardtype = formInline.cardtype;
                        eCardRequest
                            .post('/traffic/issue/v1', {
                                msghead: {
                                    samid: psamNo,
                                    commseq: data.msghead.commseq
                                },
                                msgbody: data.msgbody
                            })
                            .then(ret => {
                                if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                                    lockEcard("/traffic/cardLock", formInline, msg => {
                                        MessageBox(msg, "此卡为黑名单卡");
                                        fun();
                                    });
                                    return;
                                }
                                if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {

                                    console.log("一卡通发卡成功！！！");
                                    // Message.success("一卡通发卡成功！！！");
                                    //卡面打印
                                    func(formInline);
                                    //一卡通打印
                                    // printData("交易类型: 发卡\n民生卡号: " + formInline.mscardno + "\n交通卡号: "
                                    //     + formInline.cardno + "\n客户姓名: " + formInline.name + "\n网点编号: "
                                    //     + store.state.user.deptcode + "\n网点名称: " + store.state.user.deptname,
                                    //     300, "市政一卡通发卡", "交易日期: " + dateFormate("YYYY年MM月dd日 hh:mm:ss", new Date())
                                    //     + "            操作员: " + store.state.user.name);
                                    return;
                                } else {
                                    MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                                    fun();
                                }
                            }).catch(e => {
                                MessageBox("一卡通发卡失败！");
                                fun();
                            })
                    } else {
                        MessageBox("一卡通发卡: 获取卡类型失败！");
                        fun();
                    }
                });
            } else {
                eCardRequest
                    .post('/traffic/issue/v1', {
                        msghead: {
                            samid: psamNo,
                            commseq: data.msghead.commseq
                        },
                        msgbody: data.msgbody
                    })
                    .then(ret => {
                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                            lockEcard("/traffic/cardLock", formInline, msg => {
                                MessageBox(msg, "此卡为黑名单卡");
                                fun();
                            });
                            return;
                        }
                        if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                            if (isRet) {
                                console.log("发卡失败！！！");
                                MessageBox("发卡失败！！！");
                                fun();
                            } else {
                                const data = ret.data;
                                sendOutAppend(data, fun, func);
                            }
                        } else {
                            MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                            fun();
                        }
                    }).catch(e => {
                        MessageBox("一卡通发卡失败！");
                        fun();
                    })
            }
        });
    } catch (e) {
        console.log("异常：" + e.message);
        MessageBox("一卡通发卡失败！")
        fun();
    }
}

function reissueECard(fun, func, changeType) {

    eCardRequest
        .post("/traffic/change/v1", {
            msghead: {
                samid: psamNo,
            },
            changeType: changeType,
            msgbody: formInline
        })
        .then((ret) => {
            if (ret.code == 600 || (ret.data && ret.data.msghead.responsecode == '0014')) {
                eCardChangeAndSign(fun, func);
                return;
            }
            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                lockEcard("/traffic/cardLock", formInline, msg => {
                    MessageBox("此卡为黑名单卡，" + msg);
                    fun();
                });
                return;
            }
            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                const data = ret.data;
                if (!data.msgbody.image || data.msgbody.image.length == 0) {
                    MessageBox("补换卡失败！")
                    fun();
                } else {
                    writeImageT(data.msgbody.image, function (ret) {
                        console.log("===================图片写入完成：" + ret);
                        if (ret != 1) {
                            console.log("图片写入失败");
                            MessageBox("补换卡失败: 图片写入失败！");
                            fun();
                            return;
                        } else {
                            console.log("=========> 写照片成功");
                            sendOutJTCardPre(fun, () => {
                                eCardChangeAppend(data, fun, func);
                            });
                        }
                    });
                }
            } else {
                MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                fun();
            }
        }).catch(e => {
            MessageBox("一卡通发卡: 补换卡失败！");
            fun();
        });
}

function eCardChangeAppend(data, fun, func) {
    let num;
    num = parseInt(data.msgbody.totalpacnum, 16);
    const no = parseInt(data.msgbody.apdupacno, 16);
    console.log("apdu 长度：" + data.msgbody.apduseq);
    let adpu = data.msgbody.apduseq;
    let retAdpu = '';
    let isRet = false;
    runApdu(adpu, retAdpu, isRet, fun, (retAdpu, isRet) => {
        console.log("一共" + num + "步，现在进行到" + no + "步！:" + retAdpu);

        data.msgbody.apduseq = retAdpu;
        data.msgbody.name = formInline.name;
        data.msgbody.idtype = formInline.idtype;
        data.msgbody.identifyid = formInline.identifyid;
        data.msgbody.cardenabledate = formInline.cardenabledate;
        data.msgbody.cardexpdate = formInline.cardexpdate;
        data.msgbody.cardst = formInline.cardst;
        data.msgbody.apdupaclen = (retAdpu.length / 2).toString(16);
        data.msgbody.txnamt = formInline.txnamt;
        data.msgbody.mscardno = formInline.mscardno, // A00012900
            data.msgbody.cardno = formInline.cardno; //   03105170000000000216
        data.msgbody.banknumber = formInline.banknumber;
        data.msgbody.cardcsn = formInline.cardcsn; //   59B1BA83 59B1865B
        data.msgbody.cardtype = formInline.cardtype;

        data.msgbody.origcardno = formInline.origcardno;
        data.msgbody.origmscardno = formInline.origmscardno;
        data.msgbody.image = "";
        if (num == no) {
            iGetYktJTCardType(isCardType => {
                if (isCardType) {
                    data.msgbody.cardtype = formInline.cardtype;
                    eCardRequest
                        .post("/traffic/change/v1", {
                            msghead: {
                                samid: psamNo,
                                commseq: data.msghead.commseq
                            },
                            msgbody: data.msgbody
                        })
                        .then(ret => {
                            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                                lockEcard("/traffic/cardLock", formInline, msg => {
                                    msgEcardError("此卡为黑名单卡，" + msg);
                                });
                                return;
                            }
                            if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                                console.log("补换卡成功！！！");
                                func(formInline);
                            } else {
                                MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                                fun();
                            }
                        }).catch(e => {
                            MessageBox("一卡通发卡失败！");
                            fun();
                        });
                } else {
                    MessageBox("一卡通发卡: 获取卡类型失败");
                    fun();
                }
            });
        } else {
            eCardRequest
                .post("/traffic/change/v1", {
                    msghead: {
                        samid: psamNo,
                        commseq: data.msghead.commseq
                    },
                    msgbody: data.msgbody
                })
                .then(ret => {
                    if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '002F') {
                        lockEcard("/traffic/cardLock", formInline, msg => {
                            msgEcardError("此卡为黑名单卡，" + msg);
                        });
                        return;
                    }
                    if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                        if (isRet) {
                            console.log("补换卡失败！！！");
                            MessageBox("补换卡失败！！！");
                            fun();
                        } else {
                            const data = ret.data;
                            eCardChangeAppend(data, fun, func);
                        }
                    } else {
                        MessageBox(ret.data && ret.data.msghead.responsedesp ? ret.data.msghead.responsedesp : ret.msg);
                        fun();
                    }
                }).catch(e => {
                    MessageBox("一卡通发卡失败！");
                    fun();
                })
        }
    });
}



// 锁卡
function lockEcard(url, formInline, funct) {

    const formdData = {
        mscardno: formInline.mscardno, // A00012900
        cardno: formInline.cardno, //   03105170000000000216
        banknumber: formInline.banknumber,
        cardcsn: formInline.cardcsn //   59B1BA83 59B1865B
    };

    eCardRequest
        .post(url, {
            msghead: {
                samid: psamNo,
            },
            msgbody: formdData
        })
        .then((ret) => {
            if (ret.code == 200) {
                if (ret.data && ret.data.msghead.responsecode == '0000') {
                    const data = ret.data;
                    sendOutJTCardPre(funct, () => {
                        lockEcardAppend(url, data, formdData, psamNo, funct);
                    });
                } else {
                    console.log(ret.data.msghead.responsedesp);
                    funct(ret.data.msghead.responsedesp);
                }
            } else {
                funct(ret.msg);
                console.log(ret.msg);
            }
        }).catch(e => {
            funct("一卡通发卡: 锁卡异常！");
        });
}

function lockEcardAppend(url, data, formInline, psamNo, funct) {
    const num = parseInt(data.msgbody.totalpacnum, 16);
    const no = parseInt(data.msgbody.apdupacno, 16);
    console.log("apdu 长度：" + data.msgbody.apduseq);

    let adpu = data.msgbody.apduseq;
    let retAdpu = '';
    let isRet = false;
    runApdu(adpu, retAdpu, isRet, funct, (retAdpu, isRet) => {
        console.log("一共" + num + "步，现在进行到" + no + "步！:" + retAdpu);

        data.msgbody.apduseq = retAdpu;
        data.msgbody.apdupaclen = (retAdpu.length / 2).toString(16);
        data.msgbody.mscardno = formInline.mscardno, // A00012900
            data.msgbody.cardno = formInline.cardno, //   03105170000000000216
            data.msgbody.banknumber = formInline.banknumber,
            data.msgbody.cardcsn = formInline.cardcsn, //   59B1BA83 59B1865B

            eCardRequest
                .post(url, {
                    msghead: {
                        samid: psamNo,
                        commseq: data.msghead.commseq
                    },
                    msgbody: data.msgbody
                })
                .then(ret => {

                    if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
                        if (num == no) {
                            console.log("锁卡成功！！！");
                            funct("已锁卡！");
                            return;
                        }
                        if (isRet) {
                            console.log("锁卡失败！！！");
                            funct("锁卡失败！！！");
                        } else {
                            const data1 = ret.data;
                            lockEcardAppend(url, data1, formInline, psamNo, funct);
                        }
                    } else {
                        funct("锁卡失败：" + (ret.data ? ret.data.msghead.responsedesp : ''));
                    }
                }).catch(e => {
                    funct("一卡通发卡: 锁卡异常！");
                });
    });
}