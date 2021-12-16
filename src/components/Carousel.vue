<template>
    <div class="banner" id="bg">
        <!-- <el-carousel trigger="click" height="100vh" :interval="1200" arrow="always" style="width:100vm">
            <el-carousel-item v-for="item in imgList" :key="item.name">
                <img :src="item.url" style="height:100%;width:100%;" alt="图片丢失了" />
            </el-carousel-item>
        </el-carousel> -->
        <img src="" alt="">

        
  </div> 
  
</template>
<script>
export default {
    components: {},
    name:'Carousel',
    data() {
        return {
            imgList:[
                {
                    name: "bg1",
                    url: require("@/assets/bgimg.jpg")
                },
                {
                    name: "bg2",
                    url: require("@/assets/bgimg.jpg")
                },
                {
                    name: "bg3",
                    url: require("@/assets/bgimg.jpg")
                },
            ]
        };
    },
}
</script>
<style>
    #bg{
        width: 100%;
        height: 100%;
        background:url('../assets/four-bgimg.png');
        background-size: 100% 100%;
        position: fixed;/* 让图片脱离文档流 而不是文字撑开图片 */
    }
</style>