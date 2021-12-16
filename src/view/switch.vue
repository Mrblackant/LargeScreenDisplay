<template>
  <div class="box">
    <div class="btn">
      <router-link to="/Home">
        <div class="btn1"></div>
      </router-link>
      <router-link to="/two">
        <div class="btn2"></div>
      </router-link>
    </div>
    <div class="left-text">
      <img src="../assets/left-text.png" alt="" />
    </div>
    <div class="left-img">
      <img src="../assets/left-img.png" alt="" />
    </div>
    <div @click="returnToPageOne" class="return">
      <img src="../assets/return.png" alt="" />
    </div>
  </div>
</template>

<script>
export default {
  name: "MskDemoSwitch",

  data() {
    return {};
  },

  mounted() {},

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
  background-image: url(../assets/switchbg.png);
  background-size: 100vw 100vh;
}
.btn {
  position: absolute;
  top: 59vh;
  left: 52vw;
  width: 40vw;
  height: 5vh;
  display: flex;
}
.btn1 {
  background-image: url(../assets/imgMakingCard.png);
  background-size: 100% 100%;
  width: 20vw;
  height: 5vh;
}
.btn2 {
  background-image: url(../assets/idCardMaking.png);
  background-size: 100% 100%;
  width: 20vw;
  height: 5vh;
}
.left-text {
  /* width: 2vw;
  height: 2vh; */
  position: absolute;
  top: 63vh;
}
.left-text img {
  width: 48vw;
  height: 20vh;
  /* z-index: 1000; */
}
.left-img {
  /* width: 2vw;
  height: 2vh; */
  position: absolute;
  top: 78vh;
}
.left-img img {
  margin-left: -19vw;
  width: 46vw;
  height: 21vh;
}
.return {
  position: absolute;
  top: 89%;
  left: 80%;
}
/* .return img {
  width: 100%;
  height: 100%;
} */
</style>