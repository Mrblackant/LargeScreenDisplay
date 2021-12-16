import {signIn, signOut, confirmSignIn} from "@/api/eCard/eCardSignInAndOut";
import {eCardRequest} from "../../utils/request";
import store from '../../store';

export function OpenDevice(F4_MDS) //打开读写器
{
  var DeviceName;
  var F4_MDS = F4_MDS ? F4_MDS : document.getElementById("F4_MDS_OCX");
  DeviceName = "AUTO";
  var readerhandle = F4_MDS.ICC_Reader_Open(DeviceName);
  if (readerhandle < 0) {
    return;
  }
  return readerhandle;
}
export function CloseDevice(readerhandle) //关闭读写器
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.ICC_Reader_Close(readerhandle);
}
export function PowerOn(readerhandle, card_slot) //CPU卡上电
{
  var ret;
  var ATR_Info;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.ICC_Reader_PowerOn(readerhandle, card_slot);
  if (ret >= 0) {
    ATR_Info = F4_MDS.ATR;
    console.log("复位:" + ret+ ATR_Info);
    return ATR_Info;
  }
  console.log(ret+ ATR_Info);
  return;
}
export function PowerOff(readerhandle, card_slot) //CPU卡下电
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.ICC_Reader_PowerOff(readerhandle, card_slot);
  if (ret != 0) {
    return;
  }
  return true;
}
export function CardApplication(readerhandle, apdu, card_slot) // 发送指令
{
  var ret;
  var APDU_Info; // 0084000004  00A4040007A0000003330101  00A404000F7378312E73682EC9E7BBE1B1A3D5CF  00A40000023F00  0084000008  00B0960006
  var len;
  console.log("apdu指令:" + apdu);
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  len=(apdu.length)/2;
  ret = F4_MDS.ICC_Reader_Application(readerhandle, card_slot, len, apdu);
  if (ret >= 0) {

    APDU_Info = F4_MDS.R_APDU;
    console.log("结果:" + ret+ APDU_Info);
    if(APDU_Info.substring(APDU_Info.length - 4) == '9000') {
      return APDU_Info.substring(0, APDU_Info.length - 4);
    }
  }
  console.log("结果:" + ret+ APDU_Info);
  return;
}

export function CardApplication1(readerhandle, apdu, card_slot) // 发送指令
{
  var ret;
  var APDU_Info; // 0084000004  00A4040007A0000003330101  00A404000F7378312E73682EC9E7BBE1B1A3D5CF  00A40000023F00  0084000008  00B0960006
  var len;
  console.log("apdu指令:" + apdu);
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  len=(apdu.length)/2;
  ret = F4_MDS.ICC_Reader_Application(readerhandle, card_slot, len, apdu);
  if (ret >= 0) {

    APDU_Info = F4_MDS.R_APDU;
    console.log("结果:" + ret+ APDU_Info);
    if(APDU_Info.substring(APDU_Info.length - 4) == '9000') {
      return APDU_Info;
    }
  }
  console.log("结果:" + ret+ APDU_Info);
  return F4_MDS.R_APDU;
}

export function iGetSSCardNo(card_slot) //读社保卡号或PSAM卡终端机编号
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetSSCardNo(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    return  F4_MDS.pOutInfo;
  }
}

export function iGetBankCardNo(card_slot) //读金融卡号
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetBankCardNo(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    return  F4_MDS.pOutInfo;
  }
}
export function iGetYktJTCardNo(card_slot) //读一卡通卡号或PSAM卡终端机编号
{
  try{
    var ret;
    var F4_MDS = document.getElementById("F4_MDS_OCX");
    ret = F4_MDS.iGetYktJTCardNo(card_slot);
    if (ret < 0) {
      return;
    }
    else {
      return  F4_MDS.pOutInfo;
    }
  } catch (e) {
    console.log(e);
    return ;
  }

}

export function iGetBJTCardNo(card_slot) //读北京通卡号或PSAM卡终端机编号
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetBJTCardNo(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    return  F4_MDS.pOutInfo;
  }
}

export function iGetYktJTCardBas(card_slot) // 读一卡通交通的卡状态、启用日期、有效期
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetYktJTCardBas(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    return  F4_MDS.pOutInfo;
  }
}

export function getCSN(readerhandle, i) //非接CPU卡上电（激活）
{
  i =  i ? i : 0;
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  var delaytime = 10;
  ret = F4_MDS.RFC_Activate_CPUCard(readerhandle, delaytime);
  if (ret < 0) {
    if(i > 3) {
      return ;
    }
    return getCSN(readerhandle, i + 1);
  }
  else {
    if(F4_MDS.RFC_CARDUID && F4_MDS.RFC_CARDUID.length > 0) {
      if(i > 3) {
        return ;
      }
      return F4_MDS.RFC_CARDUID;
    } else {
      return getCSN(readerhandle, i + 1);
    }
  }
}

export function getATR(readerhandle) //非接CPU卡上电（激活）
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  var delaytime = 10;
  ret = F4_MDS.RFC_Activate_CPUCard(readerhandle, delaytime);
  if (ret < 0) {
    return;
  }
  else {
    return F4_MDS.ATR;
  }
}

// 获取余额
export function iGetYktJTCardBalance(card_slot)
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetYktJTCardBalance(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    return parseFloat(parseInt(F4_MDS.pOutInfo, 16)) / 100;
  }

}

// 获取交通卡类型
export function iGetYktJTCardType(card_slot)
{
  var ret;
  var F4_MDS = document.getElementById("F4_MDS_OCX");
  ret = F4_MDS.iGetYktJTCardType(card_slot);
  if (ret < 0) {
    return;
  }
  else {
    const type = F4_MDS.pOutInfo;
    return type.length === 1 ? 0 + type : type;
  }
}

// 交通卡前置
export function sendOutJTCardPre(card_slot, flag)
{
  const readerhandle = OpenDevice();
  if(!readerhandle) {
    return;
  }
  if(!PowerOn(readerhandle, card_slot)) {
    return;
  }
  if(!CardApplication(readerhandle, "00A4040008A000000632010105", card_slot)) {
    if(flag) {
      return readerhandle;
    }
    return;
  }
  return readerhandle;
}

function signOutT(form, readerhandle, card_slot, cardNo, random, imageData, retOut, functionT) {
  new Promise((resolve, reject) => {
    signOut(form).then(function (ret) {
      resolve(ret);
    })
  }).then(ret => {
    console.log("signOut ===================" + JSON.stringify(ret))
    signInT(ret, readerhandle, card_slot, cardNo, random, imageData, retOut, functionT);
  })
}

function signInT(ret, readerhandle, card_slot, cardNo, randomNum, imageData, retOut, functionT) {
  new Promise((resolve, reject) => {
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
          var checkRet = CardApplication(readerhandle, apdu, store.getters.deviceConfig.formDKQ.psamSlot);
          console.log("外部认证结果：" + checkRet);
          if(checkRet == '') {
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
            resolve(data);
          } else {
            resolve(0);
          }
        } else {
          resolve(0);
        }
      });
    } else {
       resolve(0);
    }
  }).then(data => {
    if(data == 0) {
      functionT(ret);
      return;
    }
    console.log("confirmSignInP ===================" + JSON.stringify(data))
    confirmSignInT(data, card_slot, imageData, retOut, readerhandle, functionT)
  });
}

export function confirmSignInT(data, card_slot, imageData, retOut, readerhandle, functionT) {
  new Promise((resolve, reject) => {
    confirmSignIn(data).then(function (ret) {
      console.log("confirmSignInT ===================" + JSON.stringify(ret))
      if (ret.code == 200) {
        console.log("签到确认成功，开始写图片！！！")
        var F4_MDS = document.getElementById("F4_MDS_OCX");
        const retS = F4_MDS.iWriteYktJTCardPhotoData(readerhandle, card_slot, store.getters.deviceConfig.formDKQ.psamSlot, imageData);
        if (retS < 0) {
          console.log("错误码(" + ret + ").写一卡通交通照片失败！错误信息：" + F4_MDS.pOutInfo)
          resolve(0);
        } else {
          console.log("写一卡通交通照片成功！" + F4_MDS.pOutInfo);
          resolve(1);
        }
      } else {
        resolve(0);
      }
    }).catch(e => {
      console.log(e);
      resolve(0);
    });
  }).then(functionT);
}

export function writeImageT(card_slot, imageData, functionT) {
  new Promise((resolve, reject) => {
    const readerhandle = OpenDevice();
    if (!readerhandle) {
      console.log("打开读卡器失败")
      resolve(0);
    }
    if (PowerOn(readerhandle, card_slot)) {
      var F4_MDS = document.getElementById("F4_MDS_OCX");
      const retS = F4_MDS.iWriteYktJTCardPhotoData(readerhandle, card_slot, store.getters.deviceConfig.formDKQ.psamSlot, imageData);
      if (retS < 0) {
        console.log("错误码(" + retS + ").写一卡通交通照片失败！错误信息：" + F4_MDS.pOutInfo);
        if(retS == -4) {
          resolve(-4);
        }
        resolve(0);
      } else {
        console.log("写一卡通交通照片成功！" + F4_MDS.pOutInfo);
        resolve(1);
      }
    } else {
      console.log("写一卡通照片非接上电失败！");
      resolve(0);
    }
  }).then(ret => {
    if(ret == -4) {
      writeImageAndSign(card_slot, imageData, functionT);
      return;
    }
    functionT(ret);
  });
}

export function writeImageAndSign(card_slot, imageData, functionT) {
  new Promise((resolve, reject) => {
    const readerhandle = OpenDevice();
    if (!readerhandle) {
      console.log("打开读卡器失败")
      resolve(0);
    }
    if (PowerOn(readerhandle, card_slot) && PowerOn(readerhandle, store.getters.deviceConfig.formDKQ.psamSlot)) {
      var cardNo = CardApplication(readerhandle, "00B0960006", store.getters.deviceConfig.formDKQ.psamSlot);
      var randomNum = CardApplication(readerhandle, "0084000008", store.getters.deviceConfig.formDKQ.psamSlot);
      console.log("randomNum============================" + randomNum);
      if (!cardNo) {
        console.log("获取Psam卡号失败")
        resolve(0);
      }
      if (!randomNum) {
        console.log("获取随机数失败")
        resolve(0);
      }
      const formOut = {
        "msghead": {
          "messagetype": "8003",
          "samid": cardNo
        }
      };
      const retOut = {
        code: -1
      };
      resolve({
        formOut: formOut,
        readerhandle: readerhandle,
        cardNo: cardNo,
        randomNum: randomNum,
        retOut: retOut
      });
    } else {
      resolve(0);
    }
  }).then(ret => {
    if(ret == 0) {
      functionT(ret);
      return;
    }
    signOutT(ret.formOut, ret.readerhandle, card_slot, ret.cardNo, ret.randomNum, imageData, ret.retOut, functionT)
  });
}

// 锁卡
export function lockEcard(url, formInline, funct) {

  const formdData = {
    mscardno: formInline.mscardno, // A00012900
    cardno: formInline.cardno, //   03105170000000000216
    banknumber: formInline.banknumber,
    cardcsn: formInline.cardcsn //   59B1BA83 59B1865B
  };
  const psamNo = iGetYktJTCardNo(store.getters.deviceConfig.formDKQ.psamSlot);
  eCardRequest
    .post(url, {
      msghead: {
        samid: psamNo,
      }, msgbody: formdData})
    .then((ret) => {
      if (ret.code == 200) {
        if (ret.data && ret.data.msghead.responsecode == '0000') {
          const data = ret.data;
          const readerhandle = sendOutJTCardPre(0x31, true);
          if(readerhandle) {
            lockEcardAppend(url, data, readerhandle, formdData, psamNo, funct);
          } else {
            funct("锁卡失败！");
          }
        } else {
          console.log(ret.data.msghead.responsedesp);
          funct(ret.data.msghead.responsedesp);
        }
      } else {
        funct(ret.msg);
        console.log(ret.msg);
      }
    });
}
function lockEcardAppend(url, data, readerhandle, formInline, psamNo, funct) {
  const num = parseInt(data.msgbody.totalpacnum, 16);
  const no = parseInt(data.msgbody.apdupacno, 16);
  console.log("apdu 长度：" + data.msgbody.apduseq);

  let adpu = data.msgbody.apduseq;
  let retAdpu = '';
  let isRet = false;
  while(adpu != '') {
    const len = parseInt(adpu.substring(4, 6), 16);
    console.log("len 长度：" + len);
    const isRe = parseInt(adpu.substring(0, 2), 16);
    console.log("isRe 长度：" + isRe);
    const info = CardApplication1(readerhandle, adpu.substring(6, 6 + len * 2), 0x31);
    if(info) {
      const r = info.substring(info.length - 4, info.length);
      if(r != '9000') {
        isRet = true;
      }
      if (isRe == 0) {
        let l = (r.length / 2).toString(16);
        if(l.length == 1) {
          l = '0' + l;
        }
        retAdpu += l + r;
      } else {
        let l = (info.length / 2).toString(16);
        if(l.length == 1) {
          l = '0' + l;
        }
        retAdpu += l + info;
      }
    } else {
      funct("锁卡指令执行失败！");
      return;
    }

    adpu = adpu.length > (6 + len * 2) ? adpu.substring(6 + len * 2, adpu.length) : "";
  }
  console.log("一共" + num + "步，现在进行到" + no + "步！:" + retAdpu);

  data.msgbody.apduseq = retAdpu;
  data.msgbody.apdupaclen = (retAdpu.length / 2).toString(16);
  data.msgbody.mscardno = formInline.mscardno, // A00012900
  data.msgbody.cardno = formInline.cardno, //   03105170000000000216
  data.msgbody.banknumber = formInline.banknumber,
  data.msgbody.cardcsn = formInline.cardcsn, //   59B1BA83 59B1865B

  eCardRequest
    .post(url, {msghead: {
        samid: psamNo,
        commseq: data.msghead.commseq
      }, msgbody: data.msgbody})
    .then(ret => {

      if (ret.code == 200 && ret.data && ret.data.msghead.responsecode == '0000') {
        if(num == no) {
          console.log("锁卡成功！！！");
          funct("已锁卡！");
          return;
        }
        if(isRet){
          console.log("锁卡失败！！！");
          funct("锁卡失败！！！");
        } else {
          const data1 = ret.data;
          lockEcardAppend(url, data1, readerhandle, formInline, psamNo, funct);
        }
      } else {
        funct("锁卡失败：" + (ret.data ? ret.data.msghead.responsedesp : ''));
      }
    });
}



//获取终端唯一识别码
export function iGetDevId(slotNum){
    var ret;
    var F4_MDS = document.getElementById("BJ_Bank_GETNOcx");
    console.log(F4_MDS);
    console.log(JSON.stringify(F4_MDS))
    ret = F4_MDS.iGetDevID(slotNum);
    if(ret<0){
      console.log('错误信息'+F4_MDS.pOutInfo)
    }else{
      console.log('唯一标识'+F4_MDS.pOutInfo)
      return F4_MDS.pOutInfo
    }
} 1
