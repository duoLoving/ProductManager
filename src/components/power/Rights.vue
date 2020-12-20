<template>
  <div>
    <!-- 权限列表内容头部面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- rightsList渲染列表数据 -->
        <el-table :data="rightsList" style="width: 100%" border stripe>
            <!-- 表格的索引列,在列组件上使用type="index"指定索引列即可 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="authName" label="权限名称"></el-table-column>
            <el-table-column prop="path" label="路径"></el-table-column>
            <el-table-column prop="level" label="权限等级">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level == 0">一级</el-tag>
                    <el-tag v-if="scope.row.level == 1" type="success">二级</el-tag>
                    <el-tag v-if="scope.row.level == 2" type="warning">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的权限列表数据集合
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      // 判断获取权限列表数据
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败')
      }
      // 获取权限列表数据成功,需要将数据保存到rightsList中去渲染页面
      this.rightsList = res.data
      //   console.log(this.rightsList)
    }
  }
}
</script>

<style lang="less" scoped></style>
