import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表global.css
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入axios模块,可以发送请求,挂载到Vue构造函数的原型上,那么就可以this.$http去发送请求
import axios from 'axios'
// 请求的根路径地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
