<template>
  <div class="box">
    <!-- 背景轮播图 -->
    <!-- <Carousel></Carousel> -->
    <!-- 提示窗口 -->
    <!-- <div class="success"> -->
    <!-- <div class="img1box">
                    <img class="img1" src="../assets/对勾.png" alt="">
                </div>
                <div class="img2box">
                    <img class="img2" src="../assets/制卡成功.png" alt="">
                </div>
                <div class="text">已成功制卡，感谢体验</div> -->
    <!-- <div class = "button"> -->
    <router-link to="/one">
      <div class="back"></div>
    </router-link>
    <!-- </div>
            </div> -->
    <!-- 进度条 -->
    <!-- <div class="finish">
                <p>制卡成功!</p>
                <el-progress :text-inside="true" :stroke-width="26" :percentage="100"></el-progress>
            </div> -->
    <div @click="returnToPageOne" class="return">
      <img src="../assets/return.png" alt="" />
    </div>
  </div>
</template>

<script>
import Carousel from "../components/Carousel.vue";
export default {
  name: "three",
  components: {
    Carousel,
  },
  data() {
    return {};
  },
  methods: {
    returnToPageOne() {
      this.$router.push("/one");
    },
  },
};
</script>

<style scoped>
.box {
  width: 100vw;
  height: 100vh;
  background-image: url(../assets/fourbg.png);
  background-size: 100% 100%;
  position: relative;
}
.back {
  width: 53vw;
  height: 6vh;
  position: absolute;
  top: 85vh;
  left: 24vw;
  background-image: url(../assets/backone.png);
  background-size: 100% 100%;
}
.success {
  width: 300px;
  height: 193px;
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(74, 74, 74, 0.26);
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}
.success .img1box {
  position: absolute;
  left: 50%;
  margin-top: -38px;
  margin-left: -31px;
}
.success .img2box {
  position: absolute;
  top: 8vh;
  left: 50%;
  margin-left: -35.5px;
}
.success .text {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 300;
  color: #444444;
  position: absolute;
  top: 13vh;
  left: 50%;
  margin-left: -70px;
}
.success .button {
  position: absolute;
  top: 20vh;
  left: 50%;
  margin-left: -52px;
}
.success .el-button--primary {
  background-color: #2a47c6;
}
.finish {
  position: absolute;
  bottom: 12px;
  z-index: 3;
  width: 100vw;
}
p {
  text-align: center;
}
.return {
  position: absolute;
  top: 85%;
  left: 78%;
}
</style>