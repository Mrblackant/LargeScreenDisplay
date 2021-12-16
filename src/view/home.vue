<template>
  <div class="home">
    <div class="form">
      <div class="imgBox">
        <div class="innerBoxCut">
          <img-cut
            :imgUrl="img"
            v-show="img"
          />
        </div>
        <!-- <img
          :src="img"
          alt=""
          class="img"
          v-if="img && !img1"
          ref="content"
        /> -->
        <!-- <h3>生成图</h3> -->
        <!-- <img  class="demoImg" :src="imgSrc" alt=""> -->
        <!-- <div class="btn" @click="handleClick">click me</div> -->
      </div>
      <label
        for="file"
        class="inputlabelBox"
      >
        <div class="inputBox"></div>
      </label>
      <input
        type="file"
        name="file"
        id="file"
        @change="updateFace"
        accept="image/*"
        capture="camera"
        style="display: none"
      />
      <!-- <div class="changeImg" @click="changeImg"></div>
      <img :src="img1" alt="" class="img" v-if="img1" /> -->
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
import imgCut from '@/view/imgCut'
export default {
  name: "Home",
  components: { imgCut },
  data() {
    return {
      imgBase64: "",
      img: "",
      file: "",
      name: "",
      img1: "",
      flag: true,
    };
  },
  mounted() {
    // this.getCompetence();
  },
  created() {
    let { query: { imgUrl } } = this.$route
    // console.log('ffff', imgUrl)
    this.img = imgUrl
  },
  methods: {
    handleClick() {
      const self = this;
      console.log(this.$refs.content);
      html2canvas(this.$refs.content, {
        useCORS: true,
      }).then(function(canvas) {
        self.imgBase64 = canvas.toDataURL();
        console.log(self.imgBase64);
      });


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
        // this.$router.push({
        //   path: '/imgcut',
        //   query: {
        //     imgUrl: reader.result
        //   }
        // })
        this.img = reader.result;
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
      this.thisCancas = document.getElementById("canvasCamera");
      this.thisContext = this.thisCancas.getContext("2d");
      this.thisVideo = document.getElementById("videoCamera");
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.getUserMedia;
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(
              new Error("getUserMedia is not implemented in this browser")
            );
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          transform: "scaleX(-1)",
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
          // 旧的浏览器可能没有srcObject
          if ("srcObject" in _this.thisVideo) {
            _this.thisVideo.srcObject = stream;
          } else {
            // 避免在新的浏览器中使用它，因为它正在被弃用。
            _this.thisVideo.src = window.URL.createObjectURL(stream);
          }
          _this.thisVideo.onloadedmetadata = function(e) {
            _this.thisVideo.play();
          };
        })
        .catch((err) => {
          console.log(err);
        });
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
  padding: 15px;
  box-sizing: border-box;
}
.img {
  display: block;
  width: 90%;
  height: 90%;
}
.innerBoxCut {
  width: 100%;
  height: 100%;
  border: 1px solid red;
}
</style>


