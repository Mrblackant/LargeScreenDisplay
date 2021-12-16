<template>
  <div class="box bg">
    <!-- 横幅背景条 -->
    <!-- <div class="banner">
      <img class="img1" src="../assets/banner.png" alt="" />
      <div class="float">
        <img class="img2" src="../assets/民生卡管理系统 2.png" alt="" />
      </div>
    </div> -->

    <div class="column">
      <!-- 表单 -->
      <div class="column-top-img">
        <img src="../assets/three-card-info1.png" alt="" />
      </div>
      <div class="left">
        <!-- <div class="sqbox">
          <div class="square"></div>
          <span>身份信息</span>
          <div class="text">没带身份证也可以直接填写个人信息</div>
        </div> -->

        <div class="msg">
          <el-form ref="form" :model="form">
            <div class="first">
              <div class="fl">
                <el-form-item prop="name">
                  <div class="name-style">姓名</div>
                  <el-input
                    class="name-input"
                    v-model="form.name"
                    style="width: 38vw"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="f2">
                <el-form-item prop="sex">
                  <div style="color: #fff" class="sex-style">性别</div>
                  <el-select
                    class="sex-input"
                    v-model="form.sex"
                    placeholder="请选择性别"
                    style="width: 21vw"
                  >
                    <el-option label="男" value="男">男</el-option>
                    <el-option label="女" value="女">女</el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>
            <div class="second">
              <div class="f3">
                <el-form-item prop="date">
                  <div class="date-style">出生日期</div>
                  <el-input class="date-input" v-model="form.date"></el-input>
                </el-form-item>
              </div>
              <div class="f4">
                <el-form-item prop="num">
                  <div class="num-style">身份证号</div>
                  <el-input class="num-input" v-model="form.num"></el-input>
                </el-form-item>
              </div>
            </div>
            <div class="f5">
              <el-form-item>
                <div class="place-style">户口所在地</div>
                <el-input class="place-input" v-model="form.place"></el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <img
          id="userPic"
          v-show="isShowCartoon"
          src="../assets/卡通图.png"
          alt=""
        />
      </div>
      <!-- 图片和按钮 -->
    </div>
    <div class="right">
      <!-- <div class="sqbox">
          <div class="square"></div>
          <span>刷身份证</span>
          <div class="text">刷身份证直接读取个人信息</div>
        </div> -->
      <div class="picbox">
        <div class="imgbox">
          <!-- 读到的身份证照片显示在页面
                              手动输入就显示卡通图
            -->
          <!-- s -->
          <!-- <img
                            src="../assets/身份证.png"
                            v-show="!this.showPhoto"
                            alt
                        /> -->
          <!-- <img src="../assets/身份证.png" alt=""> -->
        </div>
      </div>
      <div class="button">
        <img
          src="../assets/读取身份.png"
          alt=""
          class="read"
          @click="getIdCard()"
        />
        <!-- <div type="primary" class="read" @click="getIdCard()"></div> -->
        <img
          src="../assets/开始制卡.png"
          @click="makeCard()"
          alt=""
          class="begin"
        />
      </div>
    </div>
    <div @click="returnToPageOne" class="return">
      <img src="../assets/return.png" alt="" />
    </div>

    <!-- 背景轮播图 -->
    <div class="carousel" v-if="showCarousel">
      <!-- <Carousel></Carousel> -->
      <!-- <div>
        已完成
        <span>{{ nuw }}</span>
      </div> -->
      <div class="bar">
        <el-progress
          :text-inside="true"
          :stroke-width="26"
          :percentage="nuw"
        ></el-progress>
      </div>
    </div>
  </div>
</template>
<script>
import Carousel from "../components/Carousel.vue";
import banner from "../components/banner.vue";
import { ImagetoBase64png, isEmpty } from "../utils/utils.js";
import * as zkjapp from "../utils/zkjapp.js";
import * as dkqapp from "../utils/dkqapp.js";

export default {
  components: {
    banner,
    Carousel,
  },
  name: "two",
  data() {
    return {
      nuw: 0,
      showPhoto: true,
      showCarousel: false,
      form: {
        name: "",
        sex: "男",
        num: "123456789012345678",
        date: "1987-03-07",
        place: "北京市海淀区西直门北大街60号",
        photo: "",
      },

      //读卡器
      readIdMsg: "",
      pOutInfo: "",
      cartoonimg: "",

      //制卡机相关
      message: "", //设备返回原始信息
      reinfomsg: "", //设备返回信息（json）
      zkj_iType: 1, //制卡机itype
      cardInfo: "", //选中的制卡数据
      bankCode: "", //银行首字母
      zkj_mskkh: "", //民生卡卡号
      zkj_zkapp: "0", //0-北京通，1-京医通（先写北京通，再写京医通）
      zkj_zkzp: "", //制卡照片
      zkj_fkrq: "", //发卡日期
      zkj_fkdd: "北银金科协同创新中心", //发卡地点
      ksbm: "", //卡识别码

      //设置配置
      zkjcazk: true, //false 跳过ca模块(主控和管理员pin)
      dykm: true, //是否打印卡面
      isbjt: true, //北京通开关
      isSendOutE: true, // 一卡通开关
      onlyPrint: false,

      centerDialogVisible: false,
      percentage: 0, //制卡进度
      steptitle: "准备阶段", //当前进度

      dialogVisible: false,
      isShowCartoon: false,
    };
  },
  created() {
    console.log(this.$route.query.name);
    // this.$route.params.imgUrl
    this.form.name = this.$route.query.name;
    //后台获取照片
    this.$axios({
      url: "/api/leadInfo/getInfo",
      method: "post",
      data: {
        name: this.form.name,
      },

      headers: {
        "Content-Type": "application/json", //普通表单提交的Content-Type
        // 'Content-Type': 'multipart/form-data'//含有附件的表单提交的Content-Type
      },
    })
      .then((res) => {
        // console.log(this.form.name);
        if (res.data == "") {
          this.change();
          // this.isShowCartoon = true;
          this.isShowCartoon = false;
        }
        console.log(res.data);

        // console.log("22");
        this.form.photo = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
    this.start();
  },
  methods: {
    //关于callback函数
    resolvData: function (data) {
      this.message = ""; //数据清空
      this.reinfomsg = "";

      this.message = data; //数据赋值
      this.reinfomsg = eval("(" + data + ")");
      console.log("读写器返回：" + JSON.stringify(this.reinfomsg));
      let bizcode = this.reinfomsg["bizcode"]; //编号
      let recode = this.reinfomsg["recode"]; //是否成功标识
      let reinfo = "";

      // console.log(this.reinfomsg.body.pOutInfo);
      let arr = this.reinfomsg.body.pOutInfo.split("|");
      console.log(arr);
      this.form.name = arr[0];
      this.form.sex = arr[1];
      this.form.num = arr[5];
      this.form.date = arr[3];
      this.form.place = arr[4];
      this.form.photo = arr[10];
      //console.log(this.form.photo);
      //后台获取照片
      // this.$axios({
      //   url: "/leadInfo/getInfo",
      //   method: "post",
      //   data: {
      //     name: this.form.name,
      //   },
      //   headers: {
      //     "Content-Type": "application/json", //普通表单提交的Content-Type
      //     // 'Content-Type': 'multipart/form-data'//含有附件的表单提交的Content-Type
      //   },
      // })
      //   .then((res) => {
      //     console.log(res.data);
      //     if (res.data.code == "1000") {
      //       // console.log("11");
      //       this.form.photo = arr[10];
      //     } else {
      //       // console.log("22");
      //       this.form.photo = res.data;
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });

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
          // reinfo = this.reinfomsg["body"]["pOutInfo"]; //成功后赋值
          //this.$notify.success("获取设备号成功");
          this.deviceId = reinfo.substr(0, 20) + "000000000000";

          if (isEmpty(this.deviceId)) {
            this.$notify.error("获取设备号为空");
            return;
          }
          this.huiPanform.machineNo = reinfo.substr(0, 20) + "000000000000";
          if (isEmpty(this.huiPanform.machineNo)) {
            this.huiPanform.machineNo = "00000001";
          }
          if (this.isjk) {
            this.$alert("请勿重复进卡", "请勿重复进卡");
            return;
          }
          this.addstep(15, "获取终端设备号", "设备进卡");

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

      // reinfo = this.reinfomsg["body"]["pOutInfo"]; //成功后赋值

      if (bizcode == "4001") {
        this.isjk = true;
        //this.$notify.success("进卡成功");
        this.addstep(20, "设备进卡", "获银行卡号");
        setTimeout(() => {
          if (this.onlyPrint) {
            this.onlyPrint = false;
            this.cardPrint();
          } else {
            dkqapp.dyhkh(this.resolvData); //为防止进卡不到位，读“无卡”，做延时
          }
        }, 1000);
      }
      return;
    },

    resolvDatazk: function (data) {
      this.message = ""; //数据清空
      this.reinfomsg = "";

      this.message = data; //数据赋值
      this.reinfomsg = eval("(" + data + ")");
      console.log("读写器返回：" + JSON.stringify(this.reinfomsg));
      let bizcode = this.reinfomsg["bizcode"]; //编号
      let recode = this.reinfomsg["recode"]; //是否成功标识
      let reinfo = "";
      // console.log(this.form.photo);
      return;
      // if (bizcode == "4001") {
      //     zkjapp.f4001(this.resolvDatazk);
      // }
    },

    //读卡器 读取身份证信息
    getIdCard() {
      dkqapp.dqsfz(this.resolvData);
    },

    //制卡机相关 获取设备信息
    f4006() {
      zkjapp.f4006(this.resolvDatazk);
    },
    f4005() {
      //退卡
      zkjapp.f4005(this.resolvDatazk);
    },

    start() {
      // this.centerDialogVisible = true;//进度显示
      // this.addstep(0,"准备阶段","数据校验");
      //ws://172.16.66.48:18881
      //this.ws = new WebSocket("ws://127.0.0.1:18884/");
      this.ws = new WebSocket("ws://172.16.66.48:9006/");
      this.ws.onopen = function () {
        console.log("连接已打开");
      };
      this.ws.onmessage = function (evt) {
        console.log(evt);
      };
      this.ws.onclose = function () {
        console.log("连接已关闭");
      };
    },
    //进卡
    MoveToIC() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4001",
            body: {
              Slot_Number: "0",
            },
          })
        );
        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);

          // JSON.parse(received_msg);
          // var _received_msg = received_msg;
          // if (_received_msg.bizcode=="4001") {
          //     this.centerDialogVisible = true;//进度显示
          //     this.addstep(10,"制卡阶段","设备进卡");
          // }

          // document.getElementById("moveIC").value = received_msg;
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
    },
    //打印图片
    PrintPicture() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4002",
            body: {
              Image: this.form.photo,
              Left: "4",
              Top: "11",
              Width: "20",
              Height: "25",
            },
          })
        );
        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(30,"制卡阶段","打印照片");
      // },500);
    },
    //打印文字
    PrintText1() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4003",
            body: {
              Text: "姓名" + ":" + this.form.name,
              Left: "28",
              Top: "14",
              Font: "宋体",
              Font_Size: "6",
              bBold: "false",
            },
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(40,"制卡阶段","打印姓名");
      // },500);
    },

    PrintText2() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4003",
            body: {
              // Text: "社会保障号码 123456789012345678",
              Text: "社会保障号码" + ":" + this.form.num,
              Left: "28",
              Top: "19",
              Font: "宋体",
              Font_Size: "6",
              bBold: "false",
            },
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(50,"制卡阶段","打印社会保障卡号码");
      // },500);
    },
    PrintText3() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4003",
            body: {
              // Text: "社会保障卡号 A12345678",
              Text: "卡号" + ":" + "A12345678",
              Left: "28",
              Top: "24",
              Font: "宋体",
              Font_Size: "6",
              bBold: "false",
            },
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(60,"制卡阶段","打印卡号");
      // },500);
    },
    PrintText4() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4003",
            body: {
              Text: "发卡日期" + ":" + this.zkj_fkrq,
              Left: "28",
              Top: "29",
              Font: "宋体",
              Font_Size: "6",
              bBold: "false",
            },
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(70,"制卡阶段","打印日期");
      // },500);
    },
    PrintText5() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4003",
            body: {
              Text: "发卡地点" + ":" + this.zkj_fkdd,
              Left: "28",
              Top: "34",
              Font: "宋体",
              Font_Size: "6",
              bBold: "false",
            },
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
      // setTimeout(() =>  {
      //     this.addstep(70,"制卡阶段","打印日期");
      // },500);
    },
    //执行打印
    StartPrint() {
      if ("WebSocket" in window) {
        this.ws.send(
          JSON.stringify({
            bizcode: "4004",
            body: null,
          })
        );

        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }

      this.showCarousel = true; //轮播图显示

      //定义定时器开始时间为0
      var progressnuw = 0;
      //顶一个定时器
      var timer = setInterval(() => {
        //变量一直++
        progressnuw++;
        //清楚定时器
        if (progressnuw > 100) {
          clearInterval(timer);
          this.$router.push({
            path: "/four",
          });
        }
        //获取重新赋值
        this.nuw = progressnuw;
      }, 440);
    },
    //退废卡
    RejectCard() {
      if ("WebSocket" in window) {
        this.ws.send({
          bizcode: "4005",
          body: null,
        });
        this.ws.onmessage = function (evt) {
          var received_msg = evt.data;
          console.log(received_msg);
        };
        this.ws.onclose = function () {
          alert("连接已关闭...");
        };
      } else {
        // 浏览器不支持 WebSocket
        alert("您的浏览器不支持 WebSocket!");
      }
    },

    //制卡
    makeCard() {
      console.log(this.form);
      this.cardInfo = this.form;
      //console.log(this.cardInfo);
      this.chenkData(); //数据校验及流程起步
      // this.centerDialogVisible = true;//进度显示
      // this.addstep(0,"准备阶段","数据校验");
    },
    returnToPageOne() {
      this.$router.push("/one");
    },

    //数据校验及流程起步
    chenkData() {
      this.addstep(0, "准备阶段", "数据校验");
      if (isEmpty(this.form.name)) {
        this.$alert("姓名为空，不可制卡");
        return;
      } else {
        this.checkname();
      }
      if (isEmpty(this.form.sex)) {
        this.$alert("性别为空，不可制卡");
        return;
      }
      if (isEmpty(this.form.num)) {
        this.$alert("身份证号为空，不可制卡");
        return;
      } else {
        // this.checknum();
      }
      if (isEmpty(this.form.date)) {
        this.$alert("出生日期为空，不可制卡");
        return;
      }
      // if (isEmpty(this.makingInfo.imageInformation) || isEmpty(this.makingInfo.imageInformation.photo)) {
      //     this.$notify.error("制卡照片为空，不可制卡");
      //     return;
      // }
      if (isEmpty(this.form.photo)) {
        this.change();
      }

      //数据传到后台
      // this.$axios({
      //         url: '/person/addPerson',
      //         method: 'post',
      //         data: {
      //             msc_person_name: this.form.name,
      //             msc_person_sex:this.form.sex,
      //             msc_person_idcard:this.form.num,
      //             msc_person_birth:this.form.date,
      //             pregistered_residencelace:this.form.place,
      //         },
      //         headers: {
      //             'Content-Type': 'application/json'//普通表单提交的Content-Type
      //             // 'Content-Type': 'multipart/form-data'//含有附件的表单提交的Content-Type
      //         },
      //     }).then(res => {
      //         console.log(res);
      //     }).catch(err => {console.log(err)})

      this.cardPrint();
    },
    //卡通图转base64码
    change() {
      var imgnode = document.getElementById("userPic");
      var imgbase64 = ImagetoBase64png(imgnode);
      //this.cartoonimg = imgbase64;
      this.form.photo = imgbase64;
      //console.log(this.cartoonimg);
    },
    //打印
    cardPrint() {
      // //进卡
      // zkjapp.f4001("0",this.resolvDatazk);
      // //卡面打印
      // this.cardInfo = this.form; //待打印的数据
      // // 打印照片(Image,Left,Top,Width,Height,callback)
      // zkjapp.f4002(this.cardInfo.photo,"4","11","20.3", "25",  this.resolvDatazk ); //正面
      // //打印文字-单行打印（Text,Left,Top,Font,FontSize,bBold,callback）
      // zkjapp.f4003("姓名 "+this.cardInfo.name,"28","14.5","宋体","8","false",this.resolvDatazk);
      // zkjapp.f4003("社会保障号码 "+this.cardInfo.num,"28","19","宋体","8","false",this.resolvDatazk);
      // zkjapp.f4003("卡号 "+"6214888888888888","28","23.5","宋体","8","false",this.resolvDatazk);
      // zkjapp.f4003("发卡日期 "+"2021年9月","28","28","宋体","8","false",this.resolvDatazk);
      // zkjapp.f4004(this.resolvDatazk); //执行打印

      // 获取当前时间
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      this.zkj_fkrq = year + "." + month + "." + day;

      this.MoveToIC();
      this.PrintPicture();
      this.PrintText1();
      this.PrintText2();
      this.PrintText3();
      this.PrintText4();
      this.PrintText5();
      this.StartPrint();
      this.RejectCard();
    },

    //校验姓名
    checkname() {
      var reg = /^[\u4e00-\u9fa5]{0,9}$/;
      var a = reg.test(this.form.name);
      if (!a) {
        this.$alert("姓名不合法，请重新输入", "提示", {
          confirmButtonText: "确定",
        });
      }
      // this.$axios({
      //   url: "/leadInfo/getInfo",
      //   method: "post",
      //   data: {
      //     name: this.form.name,
      //   },
      //   headers: {
      //     "Content-Type": "application/json", //普通表单提交的Content-Type
      //     // 'Content-Type': 'multipart/form-data'//含有附件的表单提交的Content-Type
      //   },
      // })
      //   .then((res) => {
      //     console.log(res.data);
      //     this.form.photo = res.data;
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    },
    //校验身份证号
    checknum() {
      var patron = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/; //长度或格式校验
      //地区校验
      var aCity = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外",
      };
      // 出生日期验证
      var sBirthday = (
          this.form.num.substr(6, 4) +
          "-" +
          Number(this.form.num.substr(10, 2)) +
          "-" +
          Number(this.form.num.substr(12, 2))
        ).replace(/-/g, "/"),
        d = new Date(sBirthday);
      // 身份证号码校验 最后4位  包括最后一位的数字/字母X
      var sum = 0,
        weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
        codes = "10X98765432";
      for (var i = 0; i < this.form.num.length - 1; i++) {
        sum += this.form.num[i] * weights[i];
      }
      var last = codes[sum % 11]; //计算出来的最后一位身份证号码
      var errorMsg = "";
      if (!patron.exec(this.form.num)) {
        this.$alert("你输入的身份证长度或格式错误", "提示", {
          confirmButtonText: "确定",
        });
      } else if (!aCity[parseInt(this.form.num.substr(0, 2))]) {
        this.$alert("你的身份证地区非法", "提示", {
          confirmButtonText: "确定",
        });
      } else if (
        sBirthday !=
        d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()
      ) {
        errorMsg = "身份证上的出生日期非法";
      } else if (this.form.num[this.form.num.length - 1] != last) {
        this.$alert("你输入的身份证号非法", "提示", {
          confirmButtonText: "确定",
        });
      }
      //出生日期根据身份证号自动填入
      // var date = "";

      // if (this.form.num != null && this.form.num != "") {
      //   if (this.form.num.length == 15) {
      //     date = "19" + this.form.num.slice(6, 12);
      //   } else if (this.form.num.length == 18) {
      //     date = this.form.num.slice(6, 14);
      //   }
      //   this.form.date = date.replace(/(.{4})(.{2})/, "$1-$2-");
      //   //通过正则表达式来指定输出格式为:1990-01-01
      // }
    },

    //跳转第三页
    goToPage4() {
      this.dialogVisible = false;
      this.$router.push({
        path: "/four",
      });
    },

    addstep(num, text, steptitle) {
      //进度百分比，已完成操作，下一步操作
      this.percentage = num;
      this.steptitle = steptitle;

      let objE = document.createElement("div");
      objE.innerHTML =
        '<li class="el-icon-circle-check stepli" style="padding: 0px 10px;line-height: 35px;">' +
        text +
        "</li>";
      let stepdom = document.getElementById("step");
      //stepdom.appendChild(objE.childNodes[0])
    },
  },
};
</script>
<style>
.first {
  display: flex;
  width: 100%;
  /* background-color: red; */
}
.fl {
  flex: 2;
  /* background-color: red; */
  width: 18vw;
}
.f2 {
  flex: 1;
  /* background-color: black; */
  width: 18vw;
  float: left;
  margin-left: 0vw;
}
.second {
  display: flex;
}
.f4 {
  flex: 2.7;
  /* background-color: red; */
}
.f3 {
  flex: 2;
  /* background-color: black; */
  /* margin-left: -5vw; */
}
.f5 {
  width: 100%;
  /* background-color: black; */
}
/* .bar {
  position: absolute;
  bottom: 10px;
  z-index: 3;
  width: 100vw;
  opacity: 0.9;
} */
.bar {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%);
  /* bottom: 10px; */
  z-index: 3;
  width: 80vw;
  opacity: 0.9;
}
.carousel {
  background: url("../assets/four-bgimg.png");
  background-size: 100% 100%;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}
.box {
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-color: #fcfcfd;
  background: url("../assets/three-bgimg.png");
  background-size: 100% 100%;
}

.banner .img1 {
  width: 100vw;
  height: 26vh;
}
.banner .float {
  position: absolute;
  top: 8%;
  left: 6%;
}
.column {
  width: 92vw;
  height: 26vh;
  /* background-color: rgb(119, 205, 240); */
  background-image: linear-gradient(to right, #40c9b5, #00a8d7);
  margin-top: 26vh;
  margin-left: 4vw;
  position: relative;
  border-radius: 4px;
  /* position: absolute;
  top: 25vh;
  left: 2vw; */
}
/* .column-top-img{

} */

/* .column {
  background: url("../assets/three-info-bgimg.png");
  background-size: 130% 130%;
  border: 1px soild #2845c2;
  border-radius: 20px;
  position: absolute;
  top: 25vh;
  left: 2vw;
  width: 92vw;
  height: 26vh;
} */
.column .column-top-img {
  width: 35%;
  height: 30%;
  /* background-color: red; */
  position: absolute;
  top: 0vh;
  left: 50%;
  transform: translate(-50%);
}
.column .column-top-img img {
  width: 100%;
  height: 65%;
}
.left {
  /* background-color: royalblue; */
  /* width: 95vw;
  height: 20vh; */
  position: absolute;
  top: 6vh;
  left: 2vw;
  float: left;
  width: 89vw;
  height: 17vh;
}

/* .left .msg {
  position: absolute;
  top: 4vh;
  left: 3vw;
} */
.name-style {
  color: #fff;
  width: 16vw;
  text-align: center;
  background-color: #00a8c1;
  border-radius: 4px 0 0 4px;
  width: 38vw;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.sex-style {
  color: #fff;
  text-align: center;
  width: 13vw;
  background-color: #00a8c1;
  /* margin-right: 10vw; */
  margin-left: -5vw;
  border-radius: 4px 0 0 4px;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.num-style {
  color: #fff;
  width: 16vw;
  text-align: center;
  background-color: #00a8c1;
  /* margin-left: 4vw; */
  border-radius: 4px 0 0 4px;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.date-style {
  color: #fff;
  width: 16vw;
  text-align: center;
  background-color: #00a8c1;
  border-radius: 4px 0 0 4px;
  margin-left: 0vw;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.name-style {
  color: #fff;
  width: 16vw;
  text-align: center;
  background-color: #00a8c1;
  border-radius: 4px 0 0 4px;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.place-style {
  color: #fff;
  width: 20vw;
  background-color: #00a8c1;
  text-align: center;
  /* margin-left:vw; */
  border-radius: 4px 0 0 4px;
  height: 5vh;
  line-height: 5vh;
  font-size: 36px;
}
.left .msg .fl div {
  /* font-size: 0.35rem; */
  font-weight: 400;
  /* margin-top: 2.5px; */
}
.name-input {
  position: absolute;
  left: 16vw;
  top: 1px;
  font-size: 14px;
  display: inline-block;
  width: 100%;
  border-radius: 0px;
  /* background-color: blue; */
  height: 5vh;
  font-size: 36px;
}
.sex-input {
  position: absolute;
  left: 8vw;
  top: 1px;
  font-size: 14px;
  display: inline-block;
  width: 100%;
  border-radius: 0px;
  font-size: 10px;
  font-size: 36px;
}
.date-input {
  position: absolute;
  left: 16vw;
  top: 1px;
  font-size: 14px;
  display: inline-block;
  width: 100%;
  border-radius: 0px;
  /* background-color: blue; */
  width: 21vw;
  font-size: 10px;
  font-size: 36px;
}
.num-input {
  position: absolute;
  left: 16vw;
  top: 1px;
  font-size: 14px;
  display: inline-block;
  /* width: 100%; */
  border-radius: 0px;
  /* background-color: blue; */
  font-size: 10px;
  width: 67%;
  padding: 0;
  font-size: 36px;
}
.place-input {
  position: absolute;
  left: 20vw;
  top: 1px;
  font-size: 14px;
  display: inline-block;
  /* width: 100%; */
  border-radius: 0px;
  /* background-color: blue; */
  font-size: 10px;
  width: 77%;
  font-size: 36px;
}
.el-form-item {
  margin-bottom: 0.3vh;
}

.el-input__inner {
  border-radius: 0 4px 4px 0;
  padding: 0 2px;
  text-align: center;
  height: 5vh;
  line-height: 5vh;
  /* margin-top: -10vh; */
  /* font-size: 13px; */
  font-size: 100%;
}
.el-select .el-input__inner {
  text-align: center;
  font-size: 36px;
}
.right {
  /* background-image: url("../assets/背景图.png"); */
  /* background-size: 100% 100%; */
  /* background-color: blue; */
  /* width: 40vw; */
  height: 16vh;
  /* margin-top: 50vh; */
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translate(-50%);
  /* margin-bottom: 5vh; */
  /* float: right; */
  /* background-color: red; */
}

.right .picbox {
  /* text-align: center; */
  /* margin-top: 18vh; */
}
.right .picbox .imgbox {
  width: 53.6vw;
  height: 32vh;
  margin: 0 auto;
}
.right .imgbox img {
  width: 100%;
  height: 50%;
}
.right .button {
  position: absolute;
  border-radius: 30px;
  top: 15vh;
  left: 50%;
  transform: translate(-50%);
  font-weight: 500;
}
.read {
  width: 73vw;
  height: 12vh;
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%);
  margin-right: 1.4vw;
}
.right .button .begin {
  width: 50vw;
  height: 6vh;
  position: absolute;
  top: 11vh;
  left: 50%;
  transform: translate(-50%);
  margin-right: 1.4vw;
}
.fl {
  float: left;
}
.return {
  position: absolute;
  top: 85%;
  left: 75%;
}
</style>