<template>
  <div>
    <!-- 列表内容头部面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户列表主体内容区域 -->
    <el-card>
      <!-- 分栏布局 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible = true">
            添加按钮
          </el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <!-- 表格的索引列,在列组件上使用type="index"指定索引列即可 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="create_time" label="日期"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽拿到每一行中的数据,主要是要拿到my_state ;scope.row能拿到这一行需要渲染的对象数据-->
          <!-- 使用了作用域插槽就覆盖点之前的插槽了,prop属性就不起作用了 -->
          <template slot-scope="scope">
            <!-- 使用开关组件 -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页页码条 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框(添加,修改,删除等等对话框) -->
    <!-- 1.添加用户信息的对话框 *需要在(添加用户按钮)上添加触发事件弹出对话框*-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addFormClosed"
    >
      <!-- 对话框的主体内容 -->
      <el-form
        :model="addForm"
        :rules="addRules"
        label-width="70px"
        ref="addFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 2.修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editFormClosed"
    >
      <!-- 对话框的主体内容 -->
      <el-form
        :model="editForm"
        :rules="editRules"
        label-width="70px"
        ref="editFormRef"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //  自定义校验添加用户表单(手机)的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 如果是true,表示验证成功
        return callback()
      }
      // 验证不通过
      callback(new Error('手机验证不通过'))
    }
    return {
      // 用户列表数据请求的参数
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页码
        pagesize: 2 // 每页显示用户信息条数
      },
      userList: [], // 当前页所有的用户列表
      total: 0, // 列表用户的总数量
      addDialogVisible: false, // 控制是否隐藏添加用户的对话框,默认隐藏掉
      // 添加表单的用户数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的数据验证
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //  修改用户信息的数据
      editForm: {},
      //  修改用户对话框的表单验证规则
      editRules: {
        mobile: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  // 在用户列表组件创建之后就需要请求数据,后续渲染页面显示
  created() {
    this.getUserList()
  },
  methods: {
    //  发送请求获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      //   console.log(res)
      // 判断获取用户列表数据是否成功
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 下面就是获取到当前页的用户列表数据,需要进行保存
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 页码监听事件处理函数(当前页码和条数发送改变时候触发,就可以拿到最新的码数和当前页数)
    handleSizeChange(newPageSize) {
      // 当码数发生变化的时候,需要重新发送请求
      this.queryInfo.pagesize = newPageSize
      this.getUserList()
    },
    handleCurrentChange(currentPage) {
      // 当页码发生改变的时候,就会触发,这样就需要重新发送请求用户列表显示数据
      this.queryInfo.pagenum = currentPage
      this.getUserList()
    },
    // 开关按钮发生变化的时候,自动将数据发送请求保存数据到后台数据库
    async userStateChanged(userInfo) {
      //   console.log(userInfo)
      //    发送put请求修改用户状态
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        //  更新用户状态失败,需要将页面的显示效果设置回去最初的状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      // 更新用户状态成功
      this.$message.success('更新用户状态成功')
    },
    // 关闭添加用户的对话框时候触发,需要重置表单中的数据this.addForm
    addFormClosed() {
      this.$refs.addFormRef.resetFields() //  element-ui的Form组件提供的重置表单数据的方法
    },
    //  点击添加用户对话框的确定按钮,需要拿到数据进行提交
    addUser() {
      //  [1]需要先判断表单是否校验通过
      this.$refs.addFormRef.validate(async valid => {
        //  valid是一个布尔值,如果所有的输入框表单都验证通过就是true
        if (!valid) {
          return this.$message.error('校验失败,请重新输入')
        }
        //  验证成功,需要提交表单数据,添加到数据库中
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //  关闭对话框
        this.addDialogVisible = false
        //  重新发起请求,刷新用户列表数据
        this.getUserList()
      })
    },
    //  点击用户列表的操作:修改按钮点击事件,需要根据id发送请求查询,拿到数据显示在对话框
    async showEditDialog(id) {
      //  调用接口获取该id对应的user信息
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('根据id查询用户信息失败')
      }
      //  拿到数据之后将数据赋值给aditForm
      this.editForm = res.data
      //  拿到数据之后才去显示修改对话框
      this.editDialogVisible = true
    },
    //  在修改用户信息的对话框关闭的时候,需要重置表单数据
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //  修改用户信息的对话框的(确定按钮),需要先验证表单数据是否验证通过,提交表单进行修改操作
    editUser(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('校验失败,请重新输入')
        }
        // 验证通过,需要发送请求修改
        const { data: res } = await this.$http.put(`users/${id}`, this.editForm)
        // 判断修改用户是否成功
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        this.$message.success('修改用户信息成功')
        //  关闭对话框
        this.editDialogVisible = false
        //  刷新数据列表
        this.getUserList()
      })
    },
    // 点击删除按钮,弹出删除对话框 根据id删除对应的用户信息
    async removeUserById(id) {
      const makesure = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning'
        }
      ).catch(() => {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      //  用户取消就会返回 cancel字符串
      //  如果确认就会返回 confirm字符串
      //  那么就可以根据返回字符串判断用户是否确认
      if (makesure === 'confirm') {
        // 需要发送请求删除用户操作
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户信息成功')
        }
        // 提示删除用户成功信息
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        // 刷新用户数据列表
        this.getUserList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 设置主体内部区域的盒子阴影
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1) !important;
  .el-table {
    margin: 10px 0;
    font-size: 12px;
  }
}
</style>
