import Vue from 'vue'
import VueRouter from 'vue-router'
//  导入登录组件
import Login from '../components/Login.vue'
// Home主页组件
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/Home', component: Home }
]

const router = new VueRouter({
  routes
})

//  设置路由导航守卫,没有登录不能访问其他的路由,需要跳转到/login去登录
//  to表示访问哪个路径,from表示从哪个路径过来,next表示放行函数
router.beforeEach((to, from, next) => {
  //  如果是登录页,直接放行
  if (to.path === '/login') return next()
  //  如果是需要访问其他的路由,需要判断sessionStorage是否有token,没有就是没有登录,需要跳转到/login去登录
  const tokenMessage = window.sessionStorage.getItem('token')
  if (!tokenMessage) return next('/login')
  //  最后就是登录状态,就直接放行,想访问哪就访问哪
  next()
})

export default router
