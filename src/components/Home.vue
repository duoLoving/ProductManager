<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo_duo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="asideWidth + 'px'">
        <!-- 折叠区域,点击可以将菜单栏折叠起来 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 基本左侧菜单栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          :router="true"
          :default-active="activeItemPath"
        >
          <!-- 一级菜单,index只接受字符,不是数字 -->
          <el-submenu
            :index="subItem.id + ''"
            v-for="subItem in menuList"
            :key="subItem.id"
          >
            <!-- 一级菜单的模板 -->
            <template slot="title">
              <i :class="iconsObj[subItem.id]"></i>
              <span>{{ subItem.authName }}</span>
            </template>
            <!-- 二级菜单项 -->
            <el-menu-item
              :index="'/' + item.path"
              v-for="item in subItem.children"
              :key="item.id"
              @click="saveActiveItemPath('/' + item.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单标题数据
      menuList: [],
      // 左侧列表一级菜单对应的字体图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 折叠菜单列表的数据
      isCollapse: false,
      asideWidth: '200',
      //  菜单项默认高亮的index值
      activeItemPath: ''
    }
  },
  // 在创建组件的之后就需要发送请求拿到左侧列表的菜单文字数据去设置
  created() {
    this.getMenuList()
    //  每次创建组件的时候,需要设置保存在本地的默认菜单项的高亮的菜单项
    this.activeItemPath = window.sessionStorage.getItem('activeItemPath')
  },
  methods: {
    //  点击按钮,退出登录
    logout() {
      //  清除sessionStorage中的token,并且跳转到/login登录页面
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 发送axios请求获取到菜单列表的标题数据去设置
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg) //  获取数据失败显示错误信息
      //  获取到数据之后,将数据保存到menuList中
      this.menuList = res.data
    },
    // 点击切换折叠菜单栏
    toggleCollapse() {
      // 将isCollapse取反即可实现折叠菜单效果
      this.isCollapse = !this.isCollapse
      // 判断折叠状态true,那么asideWidth=64px;不是的话就是200px宽度
      this.isCollapse ? (this.asideWidth = 64) : (this.asideWidth = 200)
    },
    //  点击菜单项就将菜单项的index属性值保存到sessionStorage中,实现刷新显示上次保存的菜单项高亮效果
    saveActiveItemPath(activePath) {
      window.sessionStorage.setItem('activeItemPath', activePath)
      //  同时需要设置默认菜单项高亮效果
      this.activeItemPath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
// element-ui的每一个组件名称内部应用了class="组件名称"的类名,只需要设置同组件名的类样式名样式即可
.el-header {
  background-color: #373d41;
  // flex布局,左右对齐,居中对齐
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  div {
    // 文字居中
    display: flex;
    align-items: center;
    img {
      width: 61px;
      height: 56px;
      border-radius: 50%;
      margin-right: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 24px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
//  全屏显示
.home_container {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
</style>
