<template>
  <div class="home">
    <div class="form">
      <div class="box-all-wapper">
        <div
          class="imgBox"
          ref="imgBoxRef"
        >
          <!--video用于显示媒体设备的视频流，自动播放-->
          <video
            v-show="!this.img"
            id="video"
            ref="videoRef"
            :style="{ width: targetBoxSize.wid, height:targetBoxSize.hei}"
            autoplay
          />
          <!--描绘video截图-->
          <img
            v-show="this.img"
            class="showImg"
            :src="img"
            :style="{ width: targetBoxSize.wid, height:targetBoxSize.hei}"
          />

        </div>
      </div>
      <!--  -->
      <div class="btn_wapper">
        <div
          class="inputBox"
          @click="takePic"
        ></div>
        <span
          class="reTalePic"
          @click="clearImg"
        ></span>
      </div>
      <!--  -->
      <div class="form-item">
        <div class="name">
          <label
            for="name"
            class="label"
          >姓名</label>
          <input
            class="nameinput"
            type="text"
            name="name"
            id="name"
            v-model="name"
            aria-labelledby="billing name"
            placeholder="请输入姓名"
          />
        </div>
      </div>
      <div
        type="submit"
        class="btn"
        @click="submit"
      ></div>
    </div>
    <div
      @click="returnToPageOne"
      class="return"
    >
      <img
        src="../assets/return.png"
        alt=""
      />
    </div>
  </div>
</template>
<script>
import axios from "axios";
import html2canvas from "html2canvas";
export default {
  name: "Home",
  data() {
    return {
      targetBoxSize: {
        wid: '',
        hei: ''
      },
      imgBase64: "",
      img: "",
      file: "",
      name: "",
      img1: "",
      flag: true,
    };
  },
  mounted() {
    this.getDomWid()
    this.getCompetence();
  },

  methods: {
    clearImg() {
      this.img = ''
    },
    takePic() {//视频截取拍照
      let { videoRef, contextRef } = this.$refs
      let { targetBoxSize: { wid, hei } } = this
      // 
      var canvas = document.createElement("canvas");
      canvas.width = wid;
      canvas.height = hei;
      var ctx = canvas.getContext("2d");
      // 
      // let context = contextRef.getContext("2d");
      // console.log(wid, hei)
      // 画布转base64
      ctx.drawImage(videoRef, 0, 0, wid, hei);
      var dataURL = canvas.toDataURL("image/jpeg");
      this.img = dataURL || ''

    },
    getDomWid() {
      let { imgBoxRef: { offsetWidth, offsetHeight } } = this.$refs
      console.log('offsetWidth', offsetWidth, 'offsetHeight', offsetHeight)
      this.targetBoxSize = {
        wid: offsetWidth * 0.9,
        hei: offsetHeight * 0.9,
      }
      console.log(this.targetBoxSize)
    },
    inputNameBtn() {
      this.flag = false;
    },
    updateFace(e) {
      this.file = e.target.files[0] || e.dataTransfer.files[0];
      console.log(this.file);
      let reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onloadend = () => {
        this.$router.push({
          path: '/imgcut',
          query: {
            imgUrl: reader.result
          }
        })
        // this.img = reader.result;
        // this.$nextTick(()=>{
        // this.handleClick();
        // })

      };
    },
    //获取/展示制卡照片
    changeImg() {
      if (!this.img) {
        this.$alert("请先上传照片", "提示", {
          confirmButtonText: "确定",
        });
        return;
      }
      let data = new FormData();
      let time = new Date();
      this.fileName = time.getTime();
      data.append("file", this.file);
      data.append("fileName", this.fileName);
      console.log(data);
      this.$axios({
        url: "/img/users",
        method: "post",
        // headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
        data: data,

      }).then((res) => {
        console.log(res.data);
        let blob = new Blob([res.data], { type: "image/jpg" });
        this.file = new File([blob], this.fileName, {
          type: "image/jpg",
          lastModified: Date.now(),
        });
        // console.log(data)
        console.log(this.file);
        let fr = new FileReader();
        fr.readAsDataURL(blob);
        fr.onload = (e) => {
          this.img1 = e.target.result;
          console.log(e.target.result);
        };
      });
    },
    //上送数据
    submit() {
      if (this.img == "" || this.name == "") {
        this.$alert("请上传照片和姓名", "提示", {
          confirmButtonText: "确定",
        });
        return;
      } else {
        console.log("信息完整");
      }
      console.log("上送数据");
      var formData = new FormData();
      formData.append("file", this.file);
      formData.append("name", this.name);
      this.$axios({
        url: "/api/leadInfo/uploadBase64",
        method: "post",
        // headers: { "Content-Type": "multipart/form-data" },
        data: {
          name: this.name,
          file64: this.imgBase64
        }
      }).then((res) => {
        console.log(res);
        if (res.data.code == 200) {
          this.$message({
            message: "上传成功 ！",
            type: "success",
          });
          // (this.img = ""), (this.file = ""), (this.name = "");
          this.flag = true;
          this.img1 = "";
          console.log(this.name);
          this.$router.push({ path: "/two", query: { name: this.name } });
        }
      }).catch(err => { })
    },
    // 调用权限（打开摄像头功能）
    getCompetence() {
      var _this = this;
      var video = document.getElementById("video");
      let navigator = window.navigator
      console.log(navigator)
      //访问用户媒体设备的兼容方法
      function getUserMedia(constrains, success, error) {
        if (navigator.mediaDevices.getUserMedia) {
          //最新标准API
          navigator.mediaDevices
            .getUserMedia(constrains)
            .then(success)
            .catch(error);
        } else if (navigator.webkitGetUserMedia) {
          //webkit内核浏览器
          navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.mozGetUserMedia) {
          //Firefox浏览器
          navagator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.getUserMedia) {
          //旧版API
          navigator.getUserMedia(constrains).then(success).catch(error);
        }
      }


      //成功的回调函数
      function success(stream) {
        //兼容webkit内核浏览器
        var CompatibleURL = window.URL || window.webkitURL;
        //将视频流设置为video元素的源
        try {
          video.srcObject = stream;
        } catch (error) {
          video.src = window.URL.createObjectURL(stream);
        }
        // video.src = CompatibleURL.createObjectURL(stream); // 此处的代码将会报错  解决的办法是将video的srcObject属性指向stream即可
        //播放视频
        video.play();
      }

      //异常的回调函数
      function error(error) {
        console.log("访问用户媒体设备失败：", error.name, error.message);
      }
      if (
        navigator.mediaDevices.getUserMedia ||
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia
      ) {
        //调用用户媒体设备，访问摄像头
        let { wid, hei } = _this.targetBoxSize
        getUserMedia(
          {
            video: { width: wid, height: hei },
          },
          success,
          error
        );
      } else {
        alert("你的浏览器不支持访问用户媒体设备");
      }
    },

    returnToPageOne() {
      this.$router.push("/one");
    },
  },
};
</script>
<style scoped>
/* #image {
  display: block;
  width: 100%;
  height: 100%;
  transform: rotate(90deg);
} */
.name {
  width: 53vw;
  height: 6vh;
  margin: -2vh auto;
  background-color: white;
  display: flex;
}
.label {
  width: 30%;
  height: 100%;
  font-size: 3vh;
  color: white;
  line-height: 6vh;
  background-color: #00b1d8;
}
.nameinput {
  width: 70%;
  height: 100%;
  display: block;
  font-size: 3vh;
  line-height: 6vh;
  background-color: white;
  color: rgb(61, 60, 60);
  outline: none;
  border: none;
  padding-left: 2vw;
}

.inputBox {
  width: 73vw;
  height: 14vh;
  display: block;
  margin: 0 auto;
  /* margin-top: 2vh; */
  background-image: url(../assets/upPhoto1.png);
  background-size: 100% 100%;
}
.home {
  text-align: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url(../assets/upPhotobg.png);
  background-size: 100vw 100vh;
}
.form {
  margin-top: 27vh;
  width: 100%;
  text-align: center;
}
.changeImg {
  width: 45vw;
  height: 10vh;
  display: block;
  margin: 3vh auto;
  background-image: url(../assets/changeImg.png);
  background-size: 45vw 10vh;
}
.changeImg:active {
  background-image: url(../assets/changeImg_action.png);
}
.box {
  width: 100%;
  height: 60vh;
  text-align: center;
}
.form-item {
  width: 100%;
  margin: 2vh auto;
}

.btn {
  width: 53vw;
  height: 6vh;
  display: block;
  margin: 4vh auto;
  background-image: url(../assets/submit1.png);
  background-size: 53vw 6vh;
}
.return {
  position: absolute;
  top: 85%;
  left: 78%;
}
.imgBox {
  width: 40vw;
  height: 49.6vw;
  margin: 0 auto;
  background-image: url(../assets/head.png);
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.img {
  display: block;
  width: 90%;
  height: 90%;
}
.box-all-wapper {
  position: relative;
}
.showImg {
  /* width: 100%;
  height: 100%; */
}
/* .get-video-wapper {
  width: 150px;
  height: 185px;
} */
.temp-canvas {
  border: 1px solid red;
}
.reTalePic {
  position: absolute;
  right: 13%;
  top: 50%;
  transform: translate(-50%);
  display: inline-block;
  background-image: url(../assets/reTakeP.png);
  background-position: center;
  background-size: cover;
  width: 20px;
  height: 20px;
}
.btn_wapper {
  position: relative;
}
</style>


