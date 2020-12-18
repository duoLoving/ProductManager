<template>
  <div class="login_content">
    <div class="login_box">
      <!-- 1.图标区域 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 2.登录表单区域 -->
      <div class="form_box">
        <el-form
          class="login_form"
          :model="loginForm"
          :rules="loginFormRules"
          ref="loginFormRef"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              prefix-icon="iconfont icon-user"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              prefix-icon="iconfont icon-3702mima"
              v-model="loginForm.password"
              show-password
            ></el-input>
          </el-form-item>
          <!-- 按钮 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 默认是空对象,登录表单的绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置按钮,点击重置表单数据
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录验证
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // 判断是否验证成功
        if (!valid) return
        // 下面就是表示验证成功的,进行发送请求登录
        // 将data对象解构出来,起一个别名res是一个对象,该对象内部有一个meta对象数据,里面的{mes,status}表示返回的信息,判断是否登录成功
        const { data: res } = await this.$http.post('login', this.loginForm)
        // 判断meta.status==200就是登录成功
        if (res.meta.status !== 200) return this.$message.error('登录失败') // 表示登录失败
        // 登录成功的情况
        this.$message.success('登录成功')
        // 登录成功,需要将token保存到sessionStorage中,并且跳转到/home主页显示
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
// scoped会限制这些样式在本组件有效而已
.login_content {
  background-color: #2b4b6b;
  height: 100%;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avater_box {
      border: 1px solid #eee;
      border-radius: 50%;
      height: 130px;
      width: 130px;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      // 将盒子定位到上中间位置
      position: absolute;
      left: 50%;
      // top: -130px / 2;使用位移自身高度的50%即可
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        border-radius: 50%;
        width: 100%;
        height: 100%;
        background-color: #eee;
      }
    }
    .form_box {
      .login_form {
        // 整个登录表单放在底部
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
        .btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
