<template>
  <div id="userManageView" class="custom-card">
    <h1>用户管理</h1>

    <div style="max-width: 400px; margin-bottom: 16px">
      <el-input
        v-model="searchValue"
        placeholder="输入用户名搜索"
        clearable
        size="large"
        @keyup.enter="onSearch"
      >
        <template #append>
          <el-button @click="onSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="data" style="width: 100%">
      <el-table-column label="id" prop="id" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="账号" prop="userAccount" />
      <el-table-column label="头像" prop="avatarUrl">
        <template #default="{ row }">
          <el-image v-if="row.avatarUrl" :src="row.avatarUrl" style="width: 120px" fit="cover" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" prop="gender">
        <template #default="{ row }">
          <el-tag v-if="row.gender === 1" type="primary">男</el-tag>
          <el-tag v-else-if="row.gender === 0" type="success">女</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="用户角色" prop="userRole">
        <template #default="{ row }">
          <el-tag v-if="row.userRole === 1" type="success">管理员</el-tag>
          <el-tag v-else>普通用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" key="action">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="doDelete(row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { searchUsers, deleteUser } from '@/api/user'
import { ElMessage } from 'element-plus'

const data = ref<Record<string, unknown>[]>([])

const searchValue = ref('')

const fetchData = async (username = '') => {
  const res = await searchUsers(username)
  if (res.data.data) {
    data.value = res.data.data || []
  } else {
    ElMessage.error('获取数据失败')
  }
}

const onSearch = () => {
  fetchData(searchValue.value)
}

const formatDate = (dateStr: unknown) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr as string)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

fetchData()

const doDelete = async (id: unknown) => {
  if (!id) return
  const res = await deleteUser(String(id))
  if (res.data.code === 0) {
    ElMessage.success('删除成功')
    fetchData(searchValue.value)
  } else {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
#userManageView {
  width: 100%;
}

.custom-card h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}
</style>
