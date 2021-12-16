import store from '../../store';
import {dateFormate} from "../dateUtils";

export function LoadLib() {
  NtPrxOcxCall.LoadLib();
}

export function FreeLib() {
  NtPrxOcxCall.FreeLib();
}

export function Open(pcAccessMode, bpAccessMode) {
  var lDestEmulation = 0;
  var lBaudrate=9600;
  return NtPrxOcxCall.Open(pcAccessMode, lDestEmulation, lBaudrate, bpAccessMode);
}

export function Close(g_hComm) {
  if(g_hComm>0)
  {
    NtPrxOcxCall.Close(g_hComm);
  }
}

export function InsertMedia(g_hComm) {

  var lInPosV=0;
  var lTimeout =1000*60;
  if(g_hComm>0)
  {
    NtPrxOcxCall.InsertMedia(g_hComm,lInPosV,lTimeout);
  }
}

export function EjectMedia(g_hComm) {
  var iDirection=0;
  if(g_hComm>0)
  {
    NtPrxOcxCall.EjectMedia(g_hComm,iDirection);
  }
}

export function printNt(g_hComm, data, x, y) {
  if(g_hComm>0)
  {
    const ret = NtPrxOcxCall.Print(g_hComm,data, x, y);
    console.log("打印结果：" + ret);
    return ret;
  }
  console.log("打印结果：" + -1);
  return -1;
}

export function printData(data, y, name, ret) {
    let re = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    try{
      LoadLib();
      var g_hComm = Open('COM1', 'C');
      if(g_hComm <= 0) {
        re[0] = -1;
      }
      InsertMedia(g_hComm);
      re[1] = printNt(g_hComm, name, 800, 100);

      const header = "网点编号: " + store.getters.userInfo.deptcode + "      网点名称: " + store.getters.userInfo.deptname + "      交易日期: " + dateFormate("YYYY年MM月dd日 hh:mm:ss", new Date()) + "     操作员: " + store.getters.userInfo.name;
      re[2] = printNt(g_hComm, header, 210, 180);
      re[3] = printNt(g_hComm, '------------------------------------------------------------------------------------------------------------', 150, 210);
      re[4] = printNt(g_hComm, data, 180, 240);
      if(!ret) {
        re[5] = printNt(g_hComm, '本人保证所提供的资料真实、准确、完整，对违反相关协议及业务规定造成的损失和后果，\n本人愿意承担一切风险和责任。', 180, 720);
        re[6] = printNt(g_hComm, '客户签字', 1600, 440);
      }
      re[7] = printNt(g_hComm, '银行签章', 1600, 640);
      EjectMedia(g_hComm);
      Close(g_hComm);
      FreeLib();
      return retFormate(re);
    } catch (e) {
      console.log("==============" + e);
      return -1;
    }

}

export function retFormate(rows) {
  let ret = 0;
  console.log(JSON.stringify(rows));
  for(var i in rows) {
    var row = rows[i];
    if(row != 0) {
      ret = row;
    }
  }
  console.log(ret);
  return ret;
}

export function testPrintNT(pcAccessMode, bpAccessMode) {
  try {
    LoadLib();
    var g_hComm = Open(pcAccessMode, bpAccessMode);
    if(g_hComm > 0) {
      const ret = printNt(g_hComm, '打印测试', 800, 100);
      if(ret == 0) {
        return true;
      }
      return false;
    }
  } catch (e) {
    return false;
  } finally {
    EjectMedia(g_hComm);
    Close(g_hComm);
  }
}
