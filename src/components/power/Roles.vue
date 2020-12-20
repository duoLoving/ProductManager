<template>
  <div>
    <!-- 列表内容头部面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮的行 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据:角色列表 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!-- 展开列,需要显示该角色的所有权限 -->
        <el-table-column type="expand">
          <!-- 渲染当前角色的所有权限,点击扩展按钮才会显示 -->
          <template slot-scope="scope">
            <!-- 使用栅格系统去显示 -->
            <el-row
              :class="['bdbottom', index1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 显示一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <!-- 图标> -->
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 显示后面的(二和三级的列),里面再循环 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 == 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- for循环渲染二级权限 -->
                  <!-- 左边列显示2级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <!-- 图标> -->
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 右边列显示3级权限 -->
                  <el-col :span="18">
                    <!-- 循环渲染最后一层的3级权限 -->
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      type="warning"
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 表格的索引列,在列组件上使用type="index"指定索引列即可 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-search" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配角色权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="resetDefaultKeys()"
    >
      <el-tree
        :data="rightsList"
        show-checkbox
        :props="treeProps"
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightsDialogVisible: false,
      rightsList: [],
      // 属性控件的绑定对象
      treeProps: {
        children: 'children', // 指定需要展示树形的属性
        label: 'authName' // 指定children节点下使用哪个属性来展示名称
      },
      // 默认选中的树节点的id
      defaultKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的请求
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取角色列表数据成功,将数据保存到rolesList
      this.rolesList = res.data
      //   console.log(this.rolesList)
    },
    // 根据id删除对应的3级权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除该权限
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      // 根据返回值判断是否是confirm确定要删除
      if (confirmResult === 'confirm') {
        // 删除操作
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色对应的权限失败')
        }
        // 删除成功,提示信息并且刷新数据
        this.$message.success('删除角色对应的权限成功')
        // this.getRolesList()
        //  注意点:刷新权限列表数据,整个table会刷新重新渲染,导致整个table会关闭刷新
        //  不需要这样,只需要刷新对应role的第二层数据即可不会关闭整个table
        role.children = res.data
        //  提升用户体验
      }
    },
    //  展示角色权限的对话框
    async showSetRightsDialog(role) {
      // 将role的id保存到data,在更新id操作的时候进行更新添加操作
      this.roleId = role.id
      //  获取该角色的所有角色权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有角色权限的树形图失败')
      }
      //  将获取的权限列表数据保存到rightsList数组中
      this.rightsList = res.data
      // 获取三级节点的id
      this.getLiveKeys(role, this.defaultKeys)
      this.setRightsDialogVisible = true
    },
    //  写一个递归函数,获取当前用户所有的角色权限保存到数组defaultKeys中
    getLiveKeys(node, arr) {
      // 说明是最后一层
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLiveKeys(item, arr)
      })
    },
    // 重置默认选中的keys
    resetDefaultKeys() {
      this.defaultKeys = []
    },
    // 添加角色的选中的角色权限
    async allotRights() {
      //  获取全选和半选的keys
      const checkedKeys = this.$refs.treeRef
        .getCheckedKeys()
        .concat(this.$refs.treeRef.getHalfCheckedKeys())
      // console.log(checkedKeys)
      // 将数组进行拼接成字符串,使用','拼接
      const keys = checkedKeys.join(',')
      //  最后发送请求去添加更新角色权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: keys
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加角色权限失败')
      }
      // 显示添加角色权限成功并且刷新角色权限列表
      this.$message.success('添加角色权限成功')
      this.getRolesList()
      // 关闭对话框
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 10px;
}
.el-tag {
  margin: 7px;
}
// 定义展开角色的时候,权限列表展示需要边框的样式
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  // 垂直居中对齐
  display: flex;
  align-items: center;
}
</style>
