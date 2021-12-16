import { Message,MessageBox  } from 'element-ui';
import {isEmpty} from "@/utils/hardware/utils.js";

//用卡app
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>websocket工具开始<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var ws;
var m_isConnectWS =false;
let timeOut1 = null;
let timeOut2 = null;
let getMessage = false;
let FUNC = null;
let url = "ws://127.0.0.1:18885";

export function connect() {
    console.log("读写器：进入connect");
    if ('WebSocket' in window) {
        ws = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(url);
    } else {
      MessageBox("浏览器版本过低，请升级您的浏览器。\r\n浏览器要求：IE10+/Chrome14+/FireFox7+/Opera11+");
    }
    ws.onopen = function() {
        m_isConnectWS = true;
        console.log('读写器：websocket服务已经连接上 ');
        //openwshandle();
        Message.success("读写器websocket服务已连接")
    };
    ws.onmessage = (evt) => {
        getMessage = true;//接受到消息
        if (typeof (evt.data) == "string") {
            let str = evt.data;
            if (str.length <= 0) {
                return;
            }
            //var sss = onResiveServerMsg(JSON.parse(str));
            if(!isEmpty(FUNC)){
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
    };
}

export function disconnect() {
    if (ws !== null) {
         ws.close()
    }
}

function send(body, callback, time) {
  ws.send(JSON.stringify(body));
  console.log("用卡读写器发送指令："+JSON.stringify(body));

  timeOut2 = setTimeout(() => {
    if (!getMessage) {
      console.log("服务端响应超时");
      FUNC=null;
      callback("{'bizcode': '-9999','recode':'-9999', 'reinfo':'服务端响应超时','body': {'pOutInfo':'服务端响应超时'}}")
     // typeof FUNC === "function" ? FUNC() : callback();
    }
  }, time);
}

function sendMsg(body,callback,time) {
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
    if(isEmpty(time)){
      time = 1000*60;//1分钟
    }

    if(m_isConnectWS){ //有连接直接发送
      send(body,callback,time);
    }else{
      connect();//先连接websocket
      timeOut1 =  setTimeout(function () {    //等2秒后在执行     
          if(ws.readyState==0 || ws.readyState==3){//判断是否有启动本地服务
            MessageBox("本地服务疑似未启动，请启动后重试");
            return;
          }
          if(!m_isConnectWS){
            MessageBox("本地服务疑似未连接，已为您重新连接，请重试") ;
            return;
          }
          send(body,callback,time);
       },2000)      
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
      // setTimeout(function(){ readerhandle: this.communicationHandle,
        sendMsg({'bizcode': '1055', 'body': {
          'iType':"1",'pPhotoPath':''
        }},callback);
      // },(i + 1) *3000)
  // }
}

//读取电子社保卡二维码
export function dzsbk(callback) {
  sendMsg({'bizcode': '1056', 'body': {}},callback);
}

//读银行卡号（1106）
export function dyhkh(callback) {
  sendMsg({'bizcode': '1057', 'body': { 'card_slot': '0x01'}},callback);
}

//读残联卡片的芯片号
export function readXp(callback){
  console.log('读取芯片序列号')
  sendMsg({'bizcode': '1204', 'body': {
    'iType':'1'
    }
  },callback);
}


export function sbk_djhash(hash,callback){
  console.log('读取芯片序列号')
  sendMsg({'bizcode': '1203', 'body': {
    'iType':'1',
    'Hash':hash
    }
  },callback);
}

//预制卡写残联
export function sbk_djxclxx(body,callback){
  console.log('开始写残联信息')
  sendMsg({'bizcode': '1200', 'body':body
  },callback);
}

//成品卡卡写残联
export function sbk_djxcpk(body,callback){
  console.log('开始写残联信息')
  sendMsg({'bizcode': '1205', 'body':body
  },callback);
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  开始

//获取终端唯一标识
export function getDeviceId(callback) {
  sendMsg({'bizcode': '1056', 'body': {}},callback);
}

//开机认证
export function sbk_kjrz(pDevInfo,callback) {
  if(isEmpty(pDevInfo)){ MessageBox("开机认证，机构编码不可为空");return;}

  sendMsg({'bizcode': '1001', 'body': {
      'pDevInfo':''+pDevInfo
      }
    },callback);
}

// 终端注册
export function sbk_zdzc(pDevInfo,callback) {
  if(isEmpty(pDevInfo)){ MessageBox("终端注册，机构编码不可为空");return;}

  sendMsg({'bizcode': '1052', 'body': {
      'pDevInfo':''+pDevInfo
      }
    },callback);
}
// 终端注销
export function sbk_zdzx(iCancelType,pDevInfo,callback) {
  if(isEmpty(iCancelType)){ MessageBox("终端注销，注销类型不可为空");return;}
  if(isEmpty(pDevInfo)){ MessageBox("终端注销，机构编码不可为空");return;}

  sendMsg({'bizcode': '1053', 'body': {
      'iCancelType':''+iCancelType,
      'pDevInfo':''+pDevInfo
      }
    },callback);
}

//读基本信息
export function sbk_djbxx(iType,pDevInfo,callback) {
  if(isEmpty(iType)){ MessageBox("社保读基本信息，卡类型不可为空");return;}
  if(isEmpty(pDevInfo)){ MessageBox("社保读基本信息，机构编码不可为空");return;}

  sendMsg({'bizcode': '1002', 'body': {
      'iType':''+iType,
      'pDevInfo':''+pDevInfo,
      }
    },callback);
}

//通用读卡
export function sbk_tydk(iType,iAuthType,pCardInfo,pFileAddr,pin,callback) {
  if(isEmpty(iType)){ MessageBox("社保读通用读卡，卡类型不可为空");return;}
  if(isEmpty(pCardInfo)){ MessageBox("社保读通用读卡，卡基本信息不可为空");return;}
  if(isEmpty(pFileAddr)){ MessageBox("社保读通用读卡，数据项不可为空");return;}
  if(isEmpty(pin)){ MessageBox("社保读通用读卡，社保卡密码不可为空");return;}
 
  sendMsg({'bizcode': '1005', 'body': {
      'iType':''+iType,
      'pPin':''+pin,
      'iAuthType':''+iAuthType,
      'pCardInfo':''+pCardInfo,//卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割， 且最后一个数据项以“|”  结尾
      'pFileAddr':''+pFileAddr//文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如读取持卡人姓名表示为： SSSEEF06|09|$
      }
    },callback);
}


// 通用写卡 
export function sbk_tyxk(iType,pCardInfo,pFileAddr,pWriteData,callback) {
  if(isEmpty(iType)){ MessageBox("社保通用写卡，iType（卡类型）不可为空");return;}
  if(isEmpty(pCardInfo)){ MessageBox("社保通用写卡，pCardInfo（卡基本信息）不可为空");return;}
  if(isEmpty(pFileAddr)){ MessageBox("社保通用写卡，pFileAddr（数据项）不可为空");return;}
  if(isEmpty(pWriteData)){ MessageBox("社保通用写卡，pWriteData（写卡信息）不可为空");return;}
  
  sendMsg({'bizcode': '1008', 'body': {
      'iType':''+iType,
      'pCardInfo':''+pCardInfo,//卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割，且最后一个数据项以“|”  结尾
      'pFileAddr':''+pFileAddr,//文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如写入持卡人姓名表示为： SSSEEF06|09|$。本函数只允许对一个文件进行操作。若传入多个文件则只对第一个文件进行操作，后续内容将被忽略
      'pWriteData':''+pWriteData 
      }
    },callback);
}


//PIN校验
export function sbk_pinjy(iType,pPIN,callback) {
    if(isEmpty(iType)){ MessageBox("参数不可为空");return;}
    sendMsg({'bizcode': '1011', 'body': {
      'iType':""+iType,
      'pPIN':''+pPIN
    }},callback);
}

//PIN修改
export function sbk_pinxg(iType,pOldPIN,pNewPIN,callback) {
    if(isEmpty(iType)){ MessageBox("pin修改，iType（卡类型）不可为空");return;}
    if(isEmpty(pOldPIN)){ MessageBox("社保通用写卡，pOldPIN（旧密码）不可为空");return;}
    if(isEmpty(pNewPIN)){ MessageBox("社保通用写卡，pNewPIN（新密码）不可为空");return;}


    sendMsg({'bizcode': '1012', 'body': {
      'iType':""+iType,
      'pOldPIN':''+pOldPIN,
      'pNewPIN':''+pNewPIN
    }},callback);
}

//PIN重置
export function sbk_pincz(iType,pCardInfo,callback) {
    if(isEmpty(iType)){ MessageBox("pin重置，iType（卡类型）不可为空");return;}
    if(isEmpty(pCardInfo)){ MessageBox("pin重置，pCardInfo（卡信息）不可为空");return;}

    sendMsg({'bizcode': '1013', 'body': {'iType':""+iType,"pCardInfo":pCardInfo}},callback);
}

//PIN解锁
export function sbk_pinjs(iType,pCardInfo,callback) {
    if(isEmpty(iType)){ MessageBox("pin解锁，iType（卡类型）不可为空");return;}
    if(isEmpty(pCardInfo)){ MessageBox("pin解锁，pCardInfo（卡信息）不可为空");return;}

    sendMsg({'bizcode': '1017', 'body': {'iType':""+iType,"pCardInfo":pCardInfo}},callback);
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  结束


//>>>>>>>>>>>>>>>>>>>>>>>>>>CA应用操作  开始
//获取公钥
export function ca_hqgy(iType,iPublicKeyType,pin,callback) {
  if(isEmpty(iType)){ MessageBox("获取公钥，iType（卡类型）不可为空");return;}
  if(isEmpty(iPublicKeyType)){ MessageBox("获取公钥，iPublicKeyType（公钥类型）不可为空");return;}
  if(isEmpty(pin)){ MessageBox("获取公钥，pPIN（用户pin）不可为空");return;}

  sendMsg({'bizcode': '1021', 'body': {
    'iType':''+iType,
    'iPublicKeyType':''+iPublicKeyType,
    'pPIN':''+pin
  }},callback);
}

//获取CA证书信息
export function ca_hqcazs(pPublicKey,pPersonInfo,callback) {
  if(isEmpty(pPublicKey)){ MessageBox("获取ca证书信息，pPublicKey（签名公钥）不可为空");return;}
  if(isEmpty(pPersonInfo)){ MessageBox("获取ca证书信息，pPersonInfo（卡信息）不可为空");return;}

  sendMsg({'bizcode': '1023', 'body': {
      'pPublicKey':''+pPublicKey,
      'pPersonInfo':''+pPersonInfo
      }
    },callback);
}


//写入证书
export function ca_xrzs(iType,pPIN,pSCertificate,pECertificate,pEKey,callback) {
  if(isEmpty(iType)){ MessageBox("写入证书，iType（卡类型）不可为空");return;}
  if(isEmpty(pPIN)){ MessageBox("写入证书，pPIN（用户pin）不可为空");return;}
  if(isEmpty(pSCertificate)){ MessageBox("写入证书，pSCertificate（签名证书）不可为空");return;}
  if(isEmpty(pECertificate)){ MessageBox("写入证书，pECertificate（加密证书）不可为空");return;}
  if(isEmpty(pEKey)){ MessageBox("写入证书，pEKey（加密密钥）不可为空");return;}

  sendMsg({'bizcode': '1022', 'body': {
      'iType':''+iType,
      'pUserPIN':''+pPIN,
      'pSCertificate':''+pSCertificate,
      'pECertificate':''+pECertificate,
      'pEKey':''+pEKey//用户PIN
      }
    },callback);
}

//修改PIN 
export function ca_xgpin(iType,iPinType,pOldPIN,pNewPIN,callback) {
  if(isEmpty(iType)){ MessageBox("修改PIN ，iType（卡类型）不可为空");return;}
  if(isEmpty(iPinType)){ MessageBox("修改PIN， iPinType（密钥类型）不可为空");return;}
  if(isEmpty(pOldPIN)){ MessageBox("修改PIN ，pOldPIN（旧密码）不可为空");return;}
  if(isEmpty(pNewPIN)){ MessageBox("修改PIN ，pNewPIN（新密码）不可为空");return;}

  sendMsg({'bizcode': '1024', 'body': {
      'iType':''+iType,
      'iPinType':''+iPinType,
      'pOldPIN':''+pOldPIN, 
      'pNewPIN':''+pNewPIN
      }
    },callback);
}

//修改主控密钥
export function ca_xgzkmy(iType,pOldDF01,pOldPKI,pPrimaryKey,callback) {
  if(isEmpty(iType)){ MessageBox("修改主控密钥 ，iType（卡类型）不可为空");return;}
  if(isEmpty(pOldDF01)){ MessageBox("修改主控密钥， pOldDF01（原始DF01主控密钥）不可为空");return;}
  if(isEmpty(pOldPKI)){ MessageBox("修改主控密钥 ，pOldPKI（原始PKI主控密钥）不可为空");return;}
  if(isEmpty(pPrimaryKey)){ MessageBox("修改主控密钥 ，pPrimaryKey（新主控密钥）不可为空");return;}

  sendMsg({'bizcode': '1025', 'body': {
      'iType':''+iType,
      'pOldDF01':''+pOldDF01,
      'pOldPKI':''+pOldPKI,
      'pPrimaryKey':''+pPrimaryKey
      }
    },callback);
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>CA应用操作  结束


//>>>>>>>>>>>>>>>>>>>>>>>>>>北京通操作定义  开始
//读基本信息
export function bjt_djbxx(iType,iAppType,pDevInfo,callback) {
  if(isEmpty(iType)){ MessageBox("北京通读基本信息 ，iType（卡类型）不可为空");return;}
  if(isEmpty(iAppType)){ MessageBox("北京通读基本信息， iAppType（应用标识）不可为空");return;}
  if(isEmpty(pDevInfo)){ MessageBox("北京通读基本信息 ，pDevInfo（终端信息）不可为空");return;}

  sendMsg({'bizcode': '1027', 'body': {
      'iType':''+iType,
      'iAppType':''+iAppType,
      'pDevInfo':''+pDevInfo
      }
    },callback);
}

//通用读卡
export function bjt_tydk(iType,pin,iAuthType,iAppType,pCardInfo,pFileAddr,callback) {
  if(isEmpty(iType)){ MessageBox("北京通读通用读卡，卡类型不可为空");return;}
  if(isEmpty(iAppType)){ MessageBox("北京通读通用读卡，iAppType（应用标识）不可为空");return;}
  if(isEmpty(iAuthType)){ MessageBox("北京通读通用读卡，iAuthType（认证方式）不可为空");return;}
  if(isEmpty(pCardInfo)){ MessageBox("北京通读通用读卡，pCardInfo（卡基本信息）不可为空");return;}
  if(isEmpty(pFileAddr)){ MessageBox("北京通读通用读卡，pFileAddr（数据项）不可为空");return;}
  if(isEmpty(pin)){ MessageBox("北京通读通用读卡，pPIN（应用密码）不可为空");return;}

  sendMsg({'bizcode': '1030', 'body': {
      'iType':''+iType,
      'pPIN':''+pin,
      'iAuthType':''+iAuthType,
      'iAppType':''+iAppType,
      'pCardInfo':''+pCardInfo,
      'pFileAddr':''+pFileAddr
      }
    },callback);
}


//通用写卡
export function bjt_tyxk(iType,iAppType,pCardInfo,pFileAddr,pWriteData,callback) {
  if(isEmpty(iType)){ MessageBox("北京通读通用写卡，卡类型不可为空");return;}
  if(isEmpty(iAppType)){ MessageBox("北京通读通用写卡，iAppType（应用标识）不可为空");return;}
  if(isEmpty(pWriteData)){ MessageBox("北京通读通用写卡，pWriteData（写卡信息）不可为空");return;}
  if(isEmpty(pCardInfo)){ MessageBox("北京通读通用写卡，pCardInfo（卡基本信息）不可为空");return;}
  if(isEmpty(pFileAddr)){ MessageBox("北京通读通用写卡，pFileAddr（数据项）不可为空");return;}

  sendMsg({'bizcode': '1033', 'body': {
      'iType':''+iType,
      'iAppType':''+iAppType,
      'pCardInfo':''+pCardInfo,//卡基本信息，依次为：卡识别码、卡号。各数据项之间以“|”分割，且最后一个数据项以“|”  结尾
      'pFileAddr':''+pFileAddr,//文件名及数据项 文件名由 ADF 的文件标识符和 AEF 的文件标识符组成，如 SSSEEF05、SSSEEF06。 文件名及各数据项之间以“|”分隔，最后一个数据项以“|”结尾，且最后应以 “$”结束。数据项以记录标识符表示，例如写入持卡人姓名表示为： SSSEEF06|09|$。本函数只允许对一个文件进行操作。若传入多个文件则只对第一个文件进行操作，后续内容将被忽略
      'pWriteData':''+pWriteData
    }
    },callback);
}

//写北京通号
export function bjt_xbjth(iType,pCardInfo,pDevInfo,callback) {
  if(isEmpty(iType)){ MessageBox("写北京通号，卡类型不可为空");return;}
  if(isEmpty(pCardInfo)){ MessageBox("写北京通号，pCardInfo（北京通号）不可为空");return;}
  if(isEmpty(pDevInfo)){ MessageBox("写北京通号，pDevInfo（终端信息）不可为空");return;}

  sendMsg({'bizcode': '1054', 'body': {
      'iType':''+iType,
      'pCardInfo':''+pCardInfo,//北京通号
      'pDevInfo':''+pDevInfo//网点编号|渠道编码|
     }
    },callback);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>基于加密机社保卡操作定义  结束
export function openwshandle(){

}
