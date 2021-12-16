<template>
    <div class="carousel">
            <Carousel></Carousel>
        <div class="bar">
            <el-progress :text-inside="true" :stroke-width="26" :percentage="nuw"></el-progress>
        </div>
    </div>
</template>

<script>
import Carousel from '../components/Carousel.vue'
export default {
    name: 'three',
    components: {
        Carousel
    },
    data() {
        return {
            nuw:0,
        };
    },
    created () {
        //定义定时器开始时间为0
        var progressnuw =0;
        //顶一个定时器
        var timer=setInterval(()=>{
        //变量一直++
        progressnuw++
        //清楚定时器
        if(progressnuw>100){
            clearInterval(timer);
            this.$router.push({
                path:'/four' 
            })
        }
      //获取重新赋值
      this.nuw=progressnuw
    },80)
}
};
</script>

<style scoped>
    .bar{
        position: absolute;
        bottom: 10px;
        z-index: 3;
        width: 100vw;
        opacity: 0.9;
    }
</style>