<template>
  <div id="bg">
    <!-- <div class="text1">
            <img src="../assets/民生卡管理系统1.png" alt="">
        </div> -->
    <!-- <div class="text2">
            <span>集公交卡、医保卡、储蓄卡于一身的便民卡片</span>
        </div> -->
    <!-- <router-link to = "/two">
            <button class="button" type="primary" round>
                <img src="../assets/one-arrow.png" alt="">
            </button>
        </router-link> -->
    <div class="button">
      <img src="../assets/one-arrow.png" alt="" @click="goToPageSwitch" />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      property: "value",
    };
  },
  methods: {
    goToPageSwitch() {
      this.$router.push("/MskDemoSwitch");
    },
  },
};
</script>
<style scoped>
a {
  text-decoration-line: none;
}
#bg {
  width: 100%;
  height: 100%;
  background: url("../assets/one-bgimg.png");
  background-size: 100% 100%;
  position: fixed; /* 让图片脱离文档流 而不是文字撑开图片 */
}
.text1 {
  text-align: center;
  align-content: center;
  margin: 0 auto;
  margin-top: 14vw;
  margin-bottom: 6px;
}
.text1 img {
  width: 37vw;
  height: 16vh;
}
.text2 {
  font-size: 26px;
  line-height: 37px;
  font-weight: 300;
  font-family: PingFangSC-Light, PingFang SC;
  opacity: 0.8;
  text-shadow: 0px 2px 14px rgba(0, 16, 92, 0.79);
  color: #ffffff;
  text-align: center;
  align-content: center;
}
/* .button{
        background-color: #FFFFFF;
        border: none;
        width: 140px;
        height: 55px;
        border-radius: 37px;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        margin-top: 23vh;
    }
    .button:hover{
        cursor: pointer;
    }
    .button img{
        width: 70%;
        height: 37%;
    } */
#bg button {
  background-color: blue;
}
.button {
  /* border: 0px 0px;
        padding: 0; */
  width: 15vw;
  height: 5.5vh;
  /* display: flex;
        text-align: center;
        justify-content: center;
        align-items: center; */
  margin: 0 auto;
  margin-top: 94vh;
}
.button:hover {
  cursor: pointer;
}
.button img {
  width: 100%;
  height: 100%;
}
</style>