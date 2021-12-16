<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <h3>制卡人员信息</h3>
        <el-table
          ref="multipleTable"
          :data="personData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange1"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="selection" width="55" :selectable="checkBoxT"></el-table-column>

          <el-table-column prop="personalInformation.aac003" label="姓名" min-width="60"></el-table-column>
          <el-table-column
            prop="personalInformation.aac002"
            label="身份证"
            min-width="120"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="18">
        <el-form label-width="100px" size="mini" :inline="true" :model="makingInfo">
          <!-- <el-form-item label="未制卡:">
            <el-input :disabled="true" style="width: 60px" v-model="process"></el-input>
          </el-form-item>
          <el-form-item label="选中制卡数:">
            <el-input :disabled="true" style="width: 60px" v-model="makingInfo.acz001"></el-input>
          </el-form-item>-->

          <el-form-item label>
            <!-- <el-input :disabled="true" style="width: 60px" v-model="makingInfo.acz001"></el-input> -->
            <!-- <el-button size="mini" type="warning" @click="getCardInfo">读银行卡</el-button> -->
            <el-button size="mini" type="primary" @click="singleMakingCard" :disabled="isAbled">单张制卡</el-button>
            <!--
            <el-button size="mini" type="wain" @click="cardPrinNew">卡面打印</el-button>
            -->
            <!-- <el-button size="mini" type="primary" @click="jinka">进卡</el-button> -->
            <!-- <el-button size="mini" type="primary" @click="singleMakingCardBySept" :disabled="isAbled">单张制卡</el-button> -->
            <!-- <el-button size="mini" type="primary" @click="cardPrint" :disabled="isAbled">打印卡面</el-button> -->
            <!-- <el-button size="mini" type="primary" @click="batchMakingCard">批量制卡</el-button> -->
            <el-button size="mini" type="danger" @click="f4005">退卡</el-button>
            <!-- <el-button size="mini" type="primary" @click="f4006">设备连接测试</el-button> -->
          </el-form-item>
          <!-- 北京通：<el-switch v-model="isbjt" ></el-switch>
          ca修改管理员pin和主控：<el-switch v-model="zkjcazk"></el-switch>
          卡面：<el-switch v-model="dykm"></el-switch> -->
        </el-form>
        <el-row>
          <el-col :span="6"  class="imgBox" >
            <img
              style="height: 210px;width: auto"
              :src="makingInfo.photo?'data:image/jpeg;base64,'+makingInfo.photo:''"
              v-show="this.showPhoto"
              alt
            />
            <img
              style="height: 210px;width: auto"
              src="../../../assets/image/grapPerson.png"
              v-show="!this.showPhoto"
              alt
            />
          </el-col>
          <el-col :span="2">&nbsp;</el-col>
          <el-col :span="10" style="margin-left: 25%;">
            <el-form label-width="120px" size="mini" :model="makingInfo">
              <!-- <el-form-item label="设备编号:">
                <el-input :disabled="true" v-model="makingInfo.acz00112"></el-input>
              </el-form-item>-->
              <el-form-item label="批次号:">
                <el-input :disabled="true" v-model="makingInfo.batchNo"></el-input>
              </el-form-item>
              <!--<el-form-item label="所属银行:">
                <el-input :disabled="true" v-model="makingInfo.aae008a"></el-input>
              </el-form-item>-->
              <el-form-item label="姓名:">
                <el-input :disabled="true" v-model="makingInfo.personalInformation.aac003"></el-input>
              </el-form-item>
              <el-form-item label="证件号:">
                <el-input :disabled="true" v-model="makingInfo.personalInformation.aac002"></el-input>
              </el-form-item>
              <el-form-item label="民生卡号:">
                <el-input :disabled="true" v-model="makingInfo.aaz500"></el-input>
              </el-form-item>

              <el-form-item label="有效期:">
                <el-input :disabled="true" v-model="makingInfo.cardValidity"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">&nbsp;</el-col>
      <el-col :span="18" style="margin-top:30px">
        <h4>制卡提示:</h4>
        <div class="tool-tip">
          &nbsp;&nbsp;
          <span>1.勾选上需要制卡的数据；</span>
          <!--，如需要全部制卡则选中批次编号即可 -->
        </div>
        <div class="tool-tip">
          &nbsp;&nbsp;
          <span>2.数据选中后点击单张制卡按钮即可；</span>
        </div>
        <div class="tool-tip">
          &nbsp;&nbsp;
          <span>3.如制卡机无响应，可以点击设备连接测试按钮，测试制卡机连接是否正常；</span>
        </div>
        <div class="tool-tip">
          &nbsp;&nbsp;
          <span>4.制卡过程中请勿关闭浏览器或当前页面；</span>
        </div>
      </el-col>
    </el-row>

    <el-dialog :title="'当前进度：'+steptitle"   :visible.sync="centerDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false"  width="50%">
        <el-progress :text-inside="true" :stroke-width="25" :percentage="percentage"></el-progress>
        <ul id="step" class="step">
        </ul>
        <!-- <span slot="footer" class="dialog-footer">
          可按下esc键关闭此进度弹框
        </span> -->
    </el-dialog>

    <el-dialog
      title="制卡回盘"
      width="30"
      :visible="dialogVisible2"
      :before-close="handleClose2"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <el-form :model="huiPanform" ref="huiPanform" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="huiPanform.name" :disabled="true" class="demo-ruleForm"></el-input>
        </el-form-item>
        <el-form-item label="证件号码">
          <el-input v-model="huiPanform.identifyNo" :disabled="true" class="demo-ruleForm"></el-input>
        </el-form-item>
        <el-form-item label="民生卡号">
          <el-input v-model="huiPanform.cardNo" :disabled="true" class="demo-ruleForm"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="huiPanform.bankCardNo" :disabled="true" class="demo-ruleForm"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="backToBank">回 盘</el-button>
        <el-button @click="resetCard">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { bankSysRequest } from "../../../utils/request";

import * as zkjapp from "@/utils/hardware/zkjapp.js";
import * as dkqapp from "@/utils/hardware/dkqapp.js";
import { base64ToHex, hexToBase64 } from "@/utils/base64utils.js";
import {
  isEmpty,
  base64ToBlob,
} from "@/utils/hardware/utils.js";
import {ecardMake} from "../../../utils/hardware/dkqapp";
import {formateDate, formateDateT} from "../../../utils/dateUtil";
import {dateFormate} from "../../../utils/dateUtils";

export default {
  name: "instantBusinessCardPrinting",
  data() {
    return {
      multipleSelection1: [],
      personData: [],
      isAbled: false,
      dialogVisible: false,
      dialogVisible2: false,
      dialogVisible3: false,
      goBackFalg: false,
      selectedNum: 0,
      process: null,
      complete: null,
      batchNo: "",

      makingInfo: {
        acz001: "",
        aaz500: "",
        batchNo: "",
        personalInformation: {
          aac003: "",
          aac002: "",
          acc010: ""
        },
        imageInformation: {},
        photo: ""
      },
      printerObj: {
        model: "",
        seriaNum: "",
        outInfo: "",
        ref: 1
      },

      huiPanform: {
        batchNo: "",
        cardNo: "",
        bankCardNo: "",
        machineNo: "",
        name: "",
        identifyNo: "",
        isSuccess: false,
        flag: false,
        bjtNo: '',
        yktNo: '',
        atrNo: '',
        makeCardRet: false
      },
      name: "",
      phone: "",
      showPhoto: false,
      liveAddress: "",
      ruleForm: {},

      //
      globalLoading: false,
      personData: [],
      makingInfo: {
        acz001: "",
        personalInformation: {}
      },
      selectedNum: 0,
      process: null,
      complete: null,
      batchNo: null,
      bankNo: "", //银行卡号
      deviceId: "", //终端设备号
      zkj_pin: "123456", //默认pin

      isjk: false, //是否进卡，已进卡不可再进卡

      //制卡机相关
      message: "", //设备返回原始信息
      reinfomsg: "", //设备返回信息（json）
      zkj_iType: 1, //制卡机itype
      signListValid: {}, //权益信息合集
      cardInfo: "", //选中的制卡数据
      zkj_branchCode: "", //网点编码
      zkj_bjtqdbm: "", //北京通渠道编码
      bankCode: "", //银行首字母
      zkj_mskkh: "", //民生卡卡号
      zkj_zkapp: "0", //0-北京通，1-京医通（先写北京通，再写京医通）
      zkj_zkzp: "", //制卡照片
      zkj_bjth: "", //北京通号
      zkj_fkrq: "", //发卡日期
      zkj_glpin: "", //ca_管理员pin，新
      zkj_cazk: "", //ca_主控，新
      ksbm:"",//卡识别码
      castr:"",//ca返回传

      ca_zk:"00112233445566778899AABBCCDDEEFF",//ca主控，旧
      ca_glpin:"12345678",//ca管理员pin，旧

      //设置配置
      zkjcazk: true, //false 跳过ca模块(主控和管理员pin)
      dykm: true, //是否打印卡面
      isbjt: true, //北京通开关
      isSendOutE: true, // 一卡通开关
      onlyPrint: false,

      centerDialogVisible:false,
      percentage:0,//制卡进度
      steptitle:'准备阶段',//当前进度
    };
  },
  methods: {
    tableRowClassName(row, index) {
      if (row.aac018 != "17"||row.aac018 != "AA") {
        return "cannotMake-row";
      }
    },
    checkBoxT(row, index) {
      let goBackSum = 0;
      if (row.aac018 == "17"||row.aac018 == "AA") {
        goBackSum++;
        console.log(goBackSum);
        if (goBackSum == this.personData.length) {
          this.goBackFalg = true;
        }
        return 1;
      } else {
        return 0;
      }
    },
    handleSelectionChange1(val) {
      if (val.length > 0) {
        // if (val.length > 1) {
        //   this.$refs.multipleSelection.toggleRowSelection(val[0], false);
        //   val.splice(0, 1);
        //   this.multipleSelection = val;
        // }
        this.multipleSelection1 = val;
        this.makingInfo = val[0];
        this.makingInfo.photo =
          val[0].imageInformation && val[0].imageInformation.photo
            ? val[0].imageInformation.photo
            : "";
        this.showPhoto = this.makingInfo.photo ? true : false;
      } else {
        this.showPhoto = false;
        this.makingInfo = {
            acz001: "",
            aaz500: "",
            batchNo: "",
            personalInformation: {
                aac003: "",
                aac002: "",
                acc010: ""
            },
            photo: "",
            imageInformation: {},
        };
      }
    },
    //
     //制卡机相关 获取设备信息
    f4006() {
      zkjapp.f4006(this.resolvData);
    },
    dkj4005() {
        //退卡
        this.singleMakeCardLockOrUnlock(this.makingInfo, '2', '2', () => {
            console.log("退卡，解锁!")
            dkqapp.f4005(this.resolvData);
        });
    },
    f4005() {
      //退卡
     this.singleMakeCardLockOrUnlock(this.makingInfo, '2', '2', () => {
         console.log("退卡，解锁!")
         zkjapp.f4005(this.resolvData);
     });
    },
    jinka(){//进卡
      zkjapp.f4001("0",this.jkresolv);
    },
    jkresolv:function(data){
       this.$alert(data, "测试进卡返回");
    },
    cardPrinNew() {
      this.onlyPrint = true;
      this.singleMakingCard();
    },
    clearCard() {
      //清空制卡信息
      this.message = ""; //设备返回原始信息
      this.reinfomsg = ""; //设备返回信息（json）
      this.cardInfo = ""; //选中的制卡数据
      this.zkj_mskkh = ""; //民生卡卡号
      this.zkj_zkzp = ""; //制卡照片
      this.zkj_bjth = ""; //北京通号
      this.zkj_fkrq = ""; //发卡日期
      this.bankNo = ""; //银行卡号
      this.deviceId = ""; //终端设备号
      this.zkj_glpin = ""; //管理员pin
      this.zkj_cazk = ""; //ca主控
      this.castr=""; //ca串
      this.ksbm=""; //卡识别码
      this.percentage=0;//制卡进度
      this.isjk = false;

      document.getElementById("step").innerHTML = "";
      this.centerDialogVisible=false;//关闭进度
    },
    //
    handleClose() {
      this.dialogVisible = false;
    },
    handleClose2() {
      this.dialogVisible2 = false;
    },
    opendislog2() {
      this.dialogVisible2 = true;
    },
    //制卡
    singleMakingCard() {
      if (this.multipleSelection1.length != 1) {
        this.$notify.error("请选中一条数据！");
        return;
      }
      if (!this.multipleSelection1[0].personalInformation) {
        this.$notify.error("获取用户信息失败");
        return;
      }
      if(this.makingInfo.aac018 == 'AA') {
          this.$notify.error("制卡流程中，请勿重复制卡");
          return;
      }
      this.cardInfo = this.makingInfo;
      this.isSendOutE = this.makingInfo.trafficStatus === 1;
      console.log(this.cardInfo);
      if(this.makingInfo.isBraille === 1) {
          const _this = this;
          _this.$alert('此客户为视力残疾，请使用盲文预制卡', "通知", {
              confirmButtonText: "确认",
              type: "warning",
              callback: () => {
                  _this.$confirm('请确认已放置盲文预制卡，如已确认请确认', "通知", {
                      confirmButtonText: "确认",
                      cancelButtonText: "取消",
                      type: "warning"
                  }).then(function() {
                      setTimeout(() =>  {
                          _this.chenkData(); //数据校验及流程起步
                      },500);
                  });
              }
          });
      } else {
          // Object.assign(this.cardInfo, this.makingInfo); //待打印的数据
          setTimeout(() =>  {
              this.chenkData(); //数据校验及流程起步
          },500);
      }

    },
    unlock() {
        this.singleMakeCardLockOrUnlock(this.makingInfo, '2', '2', () => {
            // this.huiPanform =MakeCard(this.multipleSelection1);
            // this.msgSuccess("解锁成功");
            console.log("解锁成功, websocket 报错解锁");
            setTimeout(() =>  {
                this.clearCard();
            }, 200);
        })
    },
    singleMakeCardLockOrUnlock(info, type, isSuccess, func) {
        const postParam = {
            type: type,
            batchNo: this.batchNo,
            identifyNo: info.personalInformation.aac002,
            cardNo: info.aaz500,
            isSuccess: isSuccess
        }
        bankSysRequest.post("/InstantBusinessCard/singleMakeCardLockOrUnlock", postParam).then(ret => {
            if (ret.data.code == 200) {
                func();
            } else {
                setTimeout(() =>  {
                    this.clearCard();
                }, 200);
                this.$notify.error("加解锁失败" + ret.data.msg);
            }
        })
    },
    //数据校验及流程起步
    chenkData() {
      // this.addstep(0,"准备阶段","数据校验");
      if (isEmpty(this.makingInfo.personalInformation.aac002)) {
        this.$notify.error("证件号码为空，不可制卡");
        return;
      }
      if (isEmpty(this.makingInfo.personalInformation.aac003)) {
        this.$notify.error("姓名为空，不可制卡");
        return;
      }
      if (isEmpty(this.cardInfo.personalInformation.socialCardNo)) {
          this.$notify.error("社会保障号为空，不可制卡");
          return;
      }
      if (isEmpty(this.makingInfo.imageInformation) || isEmpty(this.makingInfo.imageInformation.photo)) {
        this.$notify.error("制卡照片为空，不可制卡");
        return;
      }
      if (isEmpty(this.makingInfo.cardValidity)) {
          this.$notify.error("社保有效期为空，不可制卡");
          return;
      }
      if (isEmpty(this.cardInfo.personalInformation.aac006)) {
          this.$notify.error("出生日期为空，不可制卡");
          return;
      }
      if (isEmpty(this.makingInfo.sendCardTime)) {
          this.$notify.error("发卡日期为空，不可制卡");
          return;
      }
      if (isEmpty(this.makingInfo.aaz500)) {
        this.$notify.error("民生卡号为空，不可制卡");
        return;
      }
      if (isEmpty(this.makingInfo.bjtCode)) {
        this.$notify.error("北京通号为空，不可制卡");
        return;
      }
      this.centerDialogVisible = true;//进度显示
      setTimeout(() =>  {
          this.addstep(5,"数据校验","获取北京通号");
          this.singleMakeCardLockOrUnlock(this.makingInfo, '1', '1', () => {
              this.zkj_bjth =this.makingInfo.bjtCode;
              this.huiPanform.bjtNo = this.makingInfo.bjtCode;
              this.addstep(10,"获取北京通号","获取终端设备号");
              this.zkj_fkrq = this.makingInfo.sendCardTime;
              console.log("发卡日期：" + this.zkj_fkrq);
              dkqapp.getDeviceId(this.resolvData, this.unlock); //获取唯一标识（终端设备号）
          })
      },500);

        // this.zkj_bjth =this.makingInfo.bjtCode;
        // this.huiPanform.bjtNo = this.makingInfo.bjtCode;
        // this.addstep(10,"获取北京通号","获取终端设备号");
        // dkqapp.getDeviceId(this.resolvData); //获取唯一标识（终端设备号）
        // this.zkj_fkrq = this.makingInfo.sendCardTime;
        // console.log("发卡日期：" + this.zkj_fkrq);
      //获取当前时间
      // let date = new Date();
      // let year = date.getFullYear();
      // let month = date.getMonth() + 1;
      // let day = date.getDate();
      // if (month < 10) {
      //   month = "0" + month;
      // }
      // if (day < 10) {
      //   day = "0" + day;
      // }
        //
      // this.zkj_fkrq = year + "-" + month + "-" + day;
    },
    resolvData:function(data){
      this.message="";//数据清空
      this.reinfomsg= "";

      this.message=data;//数据赋值
      this.reinfomsg= eval('(' + data + ')');
      console.log("读写器返回："+JSON.stringify(this.reinfomsg));
      let bizcode =this.reinfomsg['bizcode'];//编号
      let recode =this.reinfomsg['recode'];//是否成功标识
      let reinfo="";

      if (bizcode == "4006" || bizcode == "4005" || bizcode == "1056") {
        //过滤非制卡流程命令,发生错误不退卡
        if (recode != 0) {
          this.clearCard();
          if (bizcode == "1056") {
              this.$alert(this.reinfomsg["reinfo"], "读卡器错误");
          } else {
            this.$alert(this.reinfomsg["body"]["errinfo"], "制卡机错误");
          }
          return;
        }

        if (bizcode == "4006") {
          this.$alert(this.message, "获取设备信息成功");
        }

        if (bizcode == "4005") {
          this.isjk = false;
          this.clearCard();
          this.$alert(this.message, "已成功退卡");
        }

        if (bizcode == "1056") {
          reinfo = this.reinfomsg["body"]["pOutInfo"]; //成功后赋值
          //this.$notify.success("获取设备号成功");
          this.deviceId = reinfo.substr(0, 20) + '000000000000';

          if (isEmpty(this.deviceId)) {
            this.$notify.error("获取设备号为空");
            return;
          }
          this.huiPanform.machineNo = reinfo.substr(0, 20) + '000000000000';
          if(isEmpty(this.huiPanform.machineNo))
          {
            this.huiPanform.machineNo = "00000001";
          }
          if (this.isjk) {
            this.$alert("请勿重复进卡", "请勿重复进卡");
            return;
          }
          this.addstep(15,"获取终端设备号","设备进卡");

          zkjapp.f4001("0", this.resolvData, this.unlock); //设备进卡

        }
        return;
      }
      //以下属于制卡流程，发生错误退卡
      if (recode != 0) {
        if (bizcode != "4001") {
          this.f4005(this.resolvData); //进卡错误不退卡
        } else {
            this.unlock();
        }
        this.$alert(this.reinfomsg["reinfo"], "制卡流程过程错误");
        return;
      }

      reinfo = this.reinfomsg["body"]["pOutInfo"]; //成功后赋值

      if (bizcode == "4001") {
        this.isjk = true;
        //this.$notify.success("进卡成功");
        this.addstep(20,"设备进卡","获银行卡号");
        setTimeout(() =>  {
            if(this.onlyPrint) {
                this.onlyPrint = false;
                this.cardPrint();
            } else {
                dkqapp.dyhkh(this.resolvData); //为防止进卡不到位，读“无卡”，做延时
            }
        },1000);
      }
      //开机认证
      if (bizcode == "1057") {
        this.bankNo = reinfo;
        this.huiPanform.batchNo = this.cardInfo.batchNo;
        this.huiPanform.name = this.makingInfo.personalInformation.aac003;
        this.huiPanform.identifyNo = this.makingInfo.personalInformation.aac002;
        this.huiPanform.cardNo = this.makingInfo.aaz500;
        this.huiPanform.bankCardNo = reinfo;
        console.log(this.huiPanform.bankCardNo);
        //this.huiPanform.makeCardRet = true;
        console.log("银行卡号：" + this.bankNo);
        this.addstep(25,"获银行卡号","开机认证");
        //   dkqapp.sbk_kjrz(this.zkj_branchCode, this.resolvData);

        dkqapp.sbk_djbxx(this.zkj_iType, this.bankCode, this.resolvData);
      }

      if (bizcode == "1001") {
        this.addstep(30,"开机认证","读取社保基本信息");
        //this.$notify.success("开机认证成功");
        dkqapp.sbk_djbxx(this.zkj_iType, this.bankCode, this.resolvData);
      }

      if (bizcode == "1002") {
        this.addstep(40,"读社保基本信息","社保写卡");
        //this.$notify.success("写社保信息流程:读基本信息成功，进行写卡");
          console.log("=========" + reinfo);
        //0发卡地区行政区划代码（卡识别码前6位）|1社会保障号码|2卡号|3卡识别码|4姓名|5卡复位信息（仅取历史字节）|6规范版本|7发卡日期|8卡有效期|9终端机编号|10终端设备号|
        let strs = reinfo.split("|");
        this.huiPanform.atrNo = strs[3];
        console.log("IC卡的ATR值： ================== " + this.huiPanform.atrNo);
        this.ksbm=strs[3];
        //调用后台接口获取CA
        bankSysRequest
        .post("cardApplication/selectBySBM", { aaz045:strs[3] } )
        .then(res => {
          if (res.data.code == 200) {
            if(!isEmpty(res.data.data.aaz046) && !isEmpty(res.data.data.aaz047)) {
              this.ca_zk=res.data.data.aaz047;
              this.ca_glpin=res.data.data.aaz046;
            }
          } else {
            this.$notify.error("后台获取ca失败：" + res.data.msg);
            this.f4005();
          }
        }).catch(e => {
            this.$notify.error("后台获取ca失败");
            this.f4005();
        });
        console.log(this.cardInfo.imageInformation);
        this.zkj_mskkh = this.cardInfo.aaz500;
        //写卡数据-key：
        //SSSEEF05|发卡日期|卡有效期|卡号|$SSSEEF06|社会保障号码|姓名|姓名扩展|性别|民族|出生日期|$SSSEEF08|照片|$DF01EF06|通讯地址|联系电话|国籍|
        let pFileAddr =
          "SSSEEF05|05|06|07|$SSSEEF06|08|09|4E|0A|0B|0D|$SSSEEF08|$DF01EF06|23|28|$DF01EF0A|37|$";
        this.zkj_zkzp = base64ToHex(this.cardInfo.imageInformation.photoSmall); //制卡照片
        //写卡数据-value：
        let pWriteData =
          "SSSEEF05|" +
          this.zkj_fkrq +
          "|" +
          this.cardInfo.cardValidity.split("-").join("") +
          "|" +
          this.zkj_mskkh +
          "|$SSSEEF06|" +
          this.cardInfo.personalInformation.socialCardNo +
          "|" +
          this.cardInfo.personalInformation.aac003 +
          "||" +
          this.cardInfo.personalInformation.aac004 +
          "|" +
          this.cardInfo.personalInformation.aac005 +
          "|" +
          this.cardInfo.personalInformation.aac006.split("-").join("") +
          "|$SSSEEF08|" +
          this.zkj_zkzp +
          "|$DF01EF06|" +
          this.cardInfo.personalInformation.addreesPer +
          "|" +
          this.cardInfo.personalInformation.aae005 +
          "|$DF01EF0A|" +
          this.cardInfo.personalInformation.aac161 +
          "|$";

        let strpWriteData = pWriteData
          .replace(/null/g, "")
          .replace(/undefined/g, "");

        dkqapp.sbk_tyxk(
          this.zkj_iType,
          strs[3].replace(/null/g, "").replace(/undefined/g, "") +
            "|" +
            strs[2].replace(/null/g, "").replace(/undefined/g, "") +
            "|",
          pFileAddr,
          strpWriteData,
          this.resolvData
        );
      }

      if (bizcode == "1008") {
        //this.$notify.success("社保信息写入完成");
        this.addstep(50,"社保写卡","写北京通号");
        if (this.isbjt) {
          dkqapp.bjt_xbjth(
            this.zkj_iType,
            this.zkj_bjth,
            "313-" + this.cardInfo.aae009 + "|" + this.zkj_bjtqdbm + "|",
            this.resolvData
          );
        } else {
          dkqapp.ca_hqgy(this.zkj_iType, 1, this.zkj_pin, this.resolvData); //CA开始
        }
      }

      if (bizcode == "1054") {
        //this.$notify.success("写入北京通号成功");
        this.addstep(55,"写北京通号","北京通读取基本信息");
        dkqapp.bjt_djbxx(
          this.zkj_iType,
          this.zkj_zkapp,
          "313-" + this.cardInfo.aae009 + "|" + this.zkj_bjtqdbm + "|",
          this.resolvData
        );
      }

      if (bizcode == "1027") {
        this.addstep(60,"北京通读取基本信息","写北京通");
        //this.$notify.success("北京通读基本信息成功");
        //北京通号、姓名、性别、北京通卡类别、权益属性、发卡机构、制卡时间。
        // let strs = reinfo.split("|");

        //BJT6010005|姓名|性别|权益属性|发卡机构|制卡时间|$BJT6010006|民族|出生日期|公民证件类别|证件号码|固定电话/移动电话|居住地|$BJT6010007|照片|
        let pFileAddr =
          "BJT6010005|01|02|05|07|$BJT6010006|0A|0B|0C|0D|0E|0F|$BJT6010007|$";
        let pWriteData =
          "BJT6010005|" +
          this.cardInfo.personalInformation.aac003 +
          "|" +
          this.cardInfo.personalInformation.aac004 +
          "|" +
          this.cardInfo.bJTRight +
          "|" +
          this.zkj_fkrq +
          "|$BJT6010006|" +
          this.cardInfo.personalInformation.aac005 +
          "|" +
          this.cardInfo.personalInformation.aac006.replace(/-/g, "") +
          "|" +
          this.cardInfo.personalInformation.aac058 +
          "|" +
          this.cardInfo.personalInformation.aac002 +
          "|" +
          this.cardInfo.personalInformation.aae005 +
          "|" +
          this.cardInfo.personalInformation.addreesPer +
          "|$BJT6010007|" +
          this.zkj_zkzp +
          "|$";

        let strpWriteData = pWriteData
          .replace(/null/g, "")
          .replace(/undefined/g, "");

        dkqapp.bjt_tyxk(
          this.zkj_iType,
          this.zkj_zkapp,
          this.zkj_bjth,
          pFileAddr,
          strpWriteData,
          this.resolvData
        );
      }

      if (bizcode == "1033") {
        this.addstep(65,"写北京通","获取ca公钥");
        //this.$notify.success("北京通写卡成功");
        dkqapp.ca_hqgy(this.zkj_iType, 1, this.zkj_pin, this.resolvData); //CA开始
      }

      if (bizcode == "1021") {
        this.addstep(70,"获取ca公钥","获取ca证书");
        //this.$notify.success("获取公钥成功");
        // 数字签名|公钥值|
        let strs = reinfo.split("|");
        dkqapp.ca_hqcazs(
          strs[1],
          this.bankCode +
            "|" +
            this.cardInfo.personalInformation.aac003 +
            "|" +
            this.cardInfo.personalInformation.aac002 +
            "|" +
            this.zkj_mskkh +
            "|",
          this.resolvData
        );
      }
      if (bizcode == "1023") {
        this.addstep(75,"获取ca证书","写ca证书");
        //this.$notify.success("CA证书获取成功");
        // 签名证书|加密证书|加密密钥|主控|管理员PIN|
        this.castr=reinfo;
        let strs = reinfo.split("|");
        this.zkj_glpin = strs[4];
        this.zkj_cazk = strs[3];
        dkqapp.ca_xrzs(
          this.zkj_iType,
          this.zkj_pin,
          strs[0],
          strs[1],
          strs[2],
          this.resolvData
        );
      }

      if (bizcode == "1022") {

        //this.$notify.success("写入证书成功");
        if (this.zkjcazk) {
          this.addstep(80,"写ca证书","修改管理员pin");
          dkqapp.ca_xgpin(
            this.zkj_iType,
            "0",
            this.ca_glpin,
            this.zkj_glpin,
            this.resolvData
          );
        } else {
            if(this.isSendOutE) {
                this.addstep(80,"写ca证书","一卡通发卡");
                this.makeEcard();
            } else {
                if (this.dykm) {
                    this.addstep(80,"写ca证书","打印卡面");
                    this.cardPrint();
                } else {
                    this.f4005(this.resolvData);
                }
            }
        }
      }

      if (bizcode == "1024") {
        this.addstep(85,"修改管理员pin","修改ca主控");
        //this.$notify.success("修改管理员PIN成功");
        //调用后台接口保存ca信息
        bankSysRequest
            .post("cardApplication/UpdateAz05", {
                batchNo:this.cardInfo.batchNo,
                ac01Id:this.cardInfo.ac01Id,
                cc02Id:this.cardInfo.id,
                aaz044:this.castr,
                aaz045:this.ksbm,
                aaz046:this.zkj_glpin
            } )
            .then(res => {
                if (res.data.code == 200) {
                    //this.$notify.success("ca信息保存成功");
                    dkqapp.ca_xgzkmy(
                        this.zkj_iType,
                        this.ca_zk,
                        this.ca_zk,
                        this.zkj_cazk,
                        this.resolvData
                    );
                } else {
                    this.$notify.error("ca信息管理员pin保存失败" + res.data.msg);
                    this.f4005(this.resolvData);
                }
            }).catch(e => {
            this.$notify.error("ca信息管理员pin保存失败!");
            this.f4005(this.resolvData);
        });
      }

      if (bizcode == "1025") {

        //this.$notify.success("修改主控密钥成功");

        //调用后台接口保存ca信息
        bankSysRequest
        .post("cardApplication/UpdateAz05", {
          batchNo:this.cardInfo.batchNo,
          ac01Id:this.cardInfo.ac01Id,
          cc02Id:this.cardInfo.id,
          aaz044:this.castr,
          aaz045:this.ksbm,
          aaz046:this.zkj_glpin,
          aaz047:this.zkj_cazk
        } )
        .then(res => {
          if (res.data.code == 200) {
            //this.$notify.success("ca信息保存成功");
            if(this.isSendOutE) {
                this.addstep(90,"修改ca主控","一卡通发卡");
                this.makeEcard();
            } else {
                if (this.dykm) {
                    this.addstep(90,"写ca证书","打印卡面");
                    this.cardPrint();
                } else {
                    this.f4005(this.resolvData);
                }
            }
          } else {
            this.$notify.error("ca信息保存失败" + res.data.msg);
            this.f4005(this.resolvData);
          }
        }).catch(e => {
            this.$notify.error("ca信息保存失败");
            this.f4005(this.resolvData);
        });
      }

      if (bizcode == "4004") {
        this.isjk = false;
        //this.$notify.success("卡面打印成功,通知卡管");
        this.addstep(100,"打印卡面","请确认卡面打印是否正常,并进行卡管回盘");
        this.singleMakeCardLockOrUnlock(this.makingInfo, '2', '1', () => {
            setTimeout(() =>  {
                this.clearCard(); //为显示进度条100作延时
            },1000);
            //console.log(this.huiPanform);;
            this.getInitData(this.huiPanform.batchNo);
            setTimeout(() =>  {
                this.opendislog2(); //为显示进度条100作延时
            },500);
        })
        // setTimeout(() =>  {
        //     this.clearCard(); //为显示进度条100作延时
        // },1000);
        // //console.log(this.huiPanform);;
        // this.getInitData(this.huiPanform.batchNo);
        // setTimeout(() =>  {
        //     this.opendislog2(); //为显示进度条100作延时
        // },500);

      }
      return;
    },
    makeEcard() {
        ecardMake(this.makingInfo, this.f4005, cardInfo => {
            this.huiPanform.yktNo = cardInfo.cardno;
            if (this.dykm) {
                this.addstep(95,"一卡通发卡","打印卡面");
                this.cardPrint();
            } else {
                this.f4005(this.resolvData);
            }
        });
    },
    cardPrint() {
      //卡面打印
      if (!this.multipleSelection1[0]) {
        this.$notify.error("请勾选上需要制卡的数据");
        return;
      }

      this.cardInfo = this.makingInfo; //待打印的数据
      // 打印照片(Image,Left,Top,Width,Height,callback)
      if(this.cardInfo.hasOwnProperty("bankCskRightImg")){
        let signListValid=this.cardInfo.bankCskRightImg;
        let rightIndex = 65.2;

        if( signListValid.length > 0 ){
        // 权益图标
          for(let i=3;i>-1;i--){
            if(signListValid.hasOwnProperty(i)){
              let imga =signListValid[i].imgBase64;
              const jg = (i == (signListValid.length - 1) ? 0 : 1);
              if(signListValid[i].rightLevel == 3) {
                  rightIndex = rightIndex - 4.736 - jg;
                  zkjapp.f4002(imga,rightIndex,"3.7","4.736","4.3",this.resolvData);
              } else if (signListValid[i].rightLevel == 2) {
                  rightIndex = rightIndex - 4.5 - jg;
                  zkjapp.f4002(imga,rightIndex,"3.5","4.5","4.5",this.resolvData);
              } else if (signListValid[i].rightLevel == 1) {
                  rightIndex = rightIndex - 4.5 - jg;
                  zkjapp.f4002(imga,rightIndex,"4","4.5","4",this.resolvData);
              }
            }
          }
        }
      }

      zkjapp.f4002(this.cardInfo.imageInformation.photo,"4","11","20.3", "25",  this.resolvData ); //正面

      //打印文字-单行打印（Text,Left,Top,Font,FontSize,bBold,callback）
      zkjapp.f4003("姓名 "+this.cardInfo.personalInformation.aac003,"28","14.5","宋体","8","false",this.resolvData);
      zkjapp.f4003("社会保障号码 "+this.cardInfo.personalInformation.socialCardNo,"28","19","宋体","8","false",this.resolvData);
      zkjapp.f4003("卡号 "+ this.zkj_mskkh,"28","23.5","宋体","8","false",this.resolvData);
      zkjapp.f4003("发卡日期 "+ formateDateT(this.zkj_fkrq),"28","28","宋体","8","false",this.resolvData);

      zkjapp.f4004(this.resolvData); //执行打印
    },
    // 回盘
    backToBank() {
      const self = this;
      //  self.isAbled = true;
      let formdata = new FormData();
      console.log(this.makingInfo.id);

      formdata.append("id", this.makingInfo.id);
      console.log("this.huiPanform");
      let postParams = {};
      postParams.batchNo = this.huiPanform.batchNo;
      postParams.cardNo = this.huiPanform.cardNo;
      postParams.bankCardNo = this.huiPanform.bankCardNo;
      postParams.machineNo = this.huiPanform.machineNo;
      postParams.name = this.huiPanform.name;
      postParams.identifyNo = this.huiPanform.identifyNo;
      postParams.isSuccess = true;
      postParams.flag = false;
      postParams.yktNo = this.huiPanform.yktNo;
      postParams.atrNo = this.huiPanform.atrNo;
      postParams.bjtNo = this.huiPanform.bjtNo;
      console.log("postParams=======》");
      console.log(postParams);
      bankSysRequest
        .post("/InstantBusinessCard/cardDataReturnNew", postParams)
        .then(res => {
          if (res.data.code == 200) {
            this.$notify.success(res.data.msg);
          } else {
            this.$notify.error(res.data.msg);
          }
        })
        .finally(() => {
          self.isAbled = false;
          this.dialogVisible2 = false;
          if (this.goBackFalg) {
            this.$router.push({
              path: "/bankSys/prefabricatedCardManage/bankSysInstantCardManage"
            });
          }
        });
    },
    //废卡
    resetCard() {
      console.log("废卡 this.huiPanform");
      let postParams = {};
      postParams.batchNo = this.huiPanform.batchNo;
      postParams.cardNo = this.huiPanform.cardNo;
      postParams.bankCardNo = this.huiPanform.bankCardNo;
      postParams.machineNo = this.huiPanform.machineNo;
      postParams.name = this.huiPanform.name;
      postParams.identifyNo = this.huiPanform.identifyNo;
      postParams.isSuccess = false;
      postParams.flag = false;
      postParams.yktNo = this.huiPanform.yktNo;
      postParams.atrNo = this.huiPanform.atrNo;
      postParams.bjtNo = this.huiPanform.bjtNo;
      console.log("postParams ======>");
      console.log(postParams);
      bankSysRequest
        .post("/InstantBusinessCard/cardDataReturnFail", postParams)
        .then(res => {
          if (res.data.code == 200) {
            this.$notify.success(res.data.msg);
          } else {
            this.$notify.error(res.data.msg);
          }
        })
        .finally(() => {
          self.isAbled = false;
          this.dialogVisible2 = false;
          if (this.goBackFalg) {
            this.$router.push({
              path: "/bankSys/prefabricatedCardManage/bankSysInstantCardManage"
            });
          }
        });
    },

    batchMakingCard() {
      let a = [];
      this.multipleSelection1.forEach(item => {
        const info = {
          batchNo: item.batchNo,
          cardNo: item.aaz500,
          bankCardNo: item.aae010,
          machineNo: "00000001",
          name: item.personalInformation.aac003,
          identifyNo: item.personalInformation.aac002,
          isSuccess: false
        };
        bankSysRequest
          .post("/InstantBusinessCard/cardDataReturn", {
            batchNo: this.makingInfo.batchNo,
            cardNo: this.makingInfo.aaz500,
            bankCardNo: this.makingInfo.aae010,
            machineNo: "00000001",
            name: this.makingInfo.personalInformation.aac003,
            identifyNo: this.makingInfo.personalInformation.aac002
          })
          .then(res => {
            if (res.data.code == 200) {
              this.$notify.success(res.data.msg);
            } else {
              this.$notify.error(res.data.msg);
            }
          });
        const ret = 0;
        if (ret == 0) {
          info.isSuccess = true;
        }
        a.push(info);
      });
      // bankSysRequest
      //   .post("/InstantBusinessCard/batchCardDataReturn", {
      //       list: a,
      //   })
      //   .then((res) => {
      //     if (res.data.code == 200) {
      //       this.$notify.success(res.data.msg);
      //     } else {
      //       this.$notify.error(res.data.msg);
      //     }
      //   });
    },

    sort() {
      if (this.personData.length > 1) {
        let arr = new Array(this.personData.length);
        this.personData.map(perArr => {
          if (perArr.aac018 == "17"||perArr.aac018 == "AA") {
            arr.push(perArr);
          }
        });
        let set = new Set(arr.concat(...this.personData));
        console.log(set);
        this.personData = [...set];
      }
    },
    getInitData(batchNo) {
      bankSysRequest
        .post("/InstantBusinessCard/batchInstantCardMaking", {
          batchNo: batchNo
        })
        .then(res => {
          if (res.data.code == 200) {
            let a = [];
            a = res.data.data;
            this.personData = a;

            this.zkj_branchCode ="313-00301";// res.data.data.branchCode; //如建设银行 105-110653600
            let strs = this.zkj_branchCode.split("-");
            // if(strs.length != 2 || isEmpty(strs[0]) || isEmpty(strs[1]) ){
            //      this.$notify.error("银行编码格式错误");
            // }
            this.zkj_bjtqdbm = strs[0];
            this.bankCode ="BJYH"// res.data.data.bankCode; // 银行首字母缩写如 JSYH
            console.log( "接口获取>>>网点编码：" + this.zkj_branchCode + ",渠道编码：" + this.zkj_bjtqdbm +",银行编码：" + this.bankCode

          );
          } else {
            this.$notify.error(res.data.msg);
            this.personData = [];
          }
        })
        .finally(() => {
          this.sort();
        });
    },
    addstep(num,text,steptitle){
      //进度百分比，已完成操作，下一步操作
      this.percentage=num;
      this.steptitle=steptitle;

      let objE = document.createElement("div");
　　   objE.innerHTML ='<li class="el-icon-circle-check stepli" style="padding: 0px 10px;line-height: 35px;">'+text+'</li>';
      let stepdom=document.getElementById("step");
      stepdom.appendChild(objE.childNodes[0])
   },

  },
  mounted() {
    this.batchNo = this.$route.query.batchNoId;
    this.getInitData(this.batchNo);
  }
};
</script>



<style lang="scss" scoped>
.tool-tip {
  padding: 10px;
}
.tool-tip > span {
  color: red;
}
.demo-ruleForm {
  width: 200px;
}
.el-table .cannotMake-row {
  background: darkgrey;
}
.imgBox{
  height: 100%; position: absolute;left: 50px
}
.step{
  width: 100%;
  list-style: none;
  color: #67c23a;
}
.stepli{
  float: left;
  //display: inline;
}
</style>
