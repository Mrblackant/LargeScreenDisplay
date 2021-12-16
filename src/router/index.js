import Vue from 'vue'
import Router from 'vue-router'


// import first from '@/components/first'
import HelloWorld from '@/components/HelloWorld'
// import second from '@/components/second'
import one from '@/view/one'
import two from '@/view/two'
import three from '@/view/three'
import four from '@/view/four'
import Home from '@/view/home'
import MskDemoSwitch from '@/view/switch'
import banner from '@/components/banner'

Vue.use(Router)

export default new Router({
    routes: [
        //默认路径下显示该路由
        {
            path: '/',
            name: 'default',
            component: one
        },
        {
            path: '/one',
            name: 'one',
            component: one
        },
        {
            path: '/two',
            name: 'two',
            component: two
        },
        {
            path: '/three',
            name: 'three',
            component: three
        },
        {
            path: '/four',
            name: 'four',
            component: four
        },
        {
            path: '/HelloWorld',
            name: 'HelloWorld',
            component: HelloWorld
        },
        {
            path: '/Home',
            name: 'Home',
            component: Home
        },
        {
            path: '/MskDemoSwitch',
            name: 'MskDemoSwitch',
            component: MskDemoSwitch
        },
    ]
})