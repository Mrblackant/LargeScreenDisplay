<template>
    <div class="banner">
        <el-carousel trigger="click" height="300px" :interval="3000" arrow="always" style="width:100vm">
            <el-carousel-item v-for="item in imgList" :key="item.name">
                <img :src="item.url" style="height:100%;width:100%;" alt="图片丢失了" />
            </el-carousel-item>
        </el-carousel>
  </div> 
</template>
<script>
export default {
    components: {},
    name:'banner',
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
    
</style>