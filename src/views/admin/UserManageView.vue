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
          <el-button type="primary" size="small" @click="onEdit(row)">编辑</el-button>
          <el-button
            type="danger"
            size="small"
            :loading="deletingIds.has(row.id)"
            :disabled="deletingIds.has(row.id)"
            @click="doDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" title="编辑用户" width="560px" :close-on-click-modal="false">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" maxlength="256" show-word-limit />
        </el-form-item>
        <el-form-item label="头像地址" prop="avatarUrl">
          <el-input v-model="editForm.avatarUrl" maxlength="1024" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="editForm.gender" placeholder="未设置" style="width: 100%">
            <el-option label="女" :value="0" />
            <el-option label="男" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" maxlength="128" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" maxlength="512" />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="editForm.userStatus" :disabled="isEditingSelf" style="width: 100%">
            <el-option label="正常" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="editForm.userRole" :disabled="isEditingSelf" style="width: 100%">
            <el-option label="普通用户" :value="0" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="submitting" @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { deleteUser, searchUsers, updateUser, type UserType, type UserUpdateParams } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const data = ref<UserType[]>([])

const searchValue = ref('')
const editVisible = ref(false)
const submitting = ref(false)
const deletingIds = ref(new Set<number>())
const editFormRef = ref<FormInstance>()
const loginUserStore = useLoginUserStore()
const editForm = reactive<UserUpdateParams>({
  id: 0,
  username: '',
  avatarUrl: '',
  gender: undefined,
  phone: '',
  email: '',
  userStatus: 0,
  userRole: 0,
})

const isEditingSelf = computed(() => Number(loginUserStore.loginUser.id) === editForm.id)

const emailValidator = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback()
    return
  }
  callback(new Error('请输入正确的邮箱地址'))
}

const editRules: FormRules = {
  username: [{ max: 256, message: '用户名不能超过 256 个字符', trigger: 'blur' }],
  avatarUrl: [{ max: 1024, message: '头像地址不能超过 1024 个字符', trigger: 'blur' }],
  phone: [{ max: 128, message: '手机号不能超过 128 个字符', trigger: 'blur' }],
  email: [
    { max: 512, message: '邮箱不能超过 512 个字符', trigger: 'blur' },
    { validator: emailValidator, trigger: 'blur' },
  ],
}

const getErrorMessage = (
  responseData: { description?: string; message?: string },
  defaultMessage: string,
) => responseData.description || responseData.message || defaultMessage

const fetchData = async (username = '') => {
  try {
    const res = await searchUsers(username)
    if (res.data.code === 0 && res.data.data) {
      data.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取数据失败')
    }
  } catch {
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

const onEdit = async (user: UserType) => {
  editForm.id = user.id
  editForm.username = user.username ?? ''
  editForm.avatarUrl = user.avatarUrl ?? ''
  editForm.gender = user.gender
  editForm.phone = user.phone ?? ''
  editForm.email = user.email ?? ''
  editForm.userStatus = user.userStatus ?? 0
  editForm.userRole = user.userRole ?? 0
  editVisible.value = true
  await nextTick()
  editFormRef.value?.clearValidate()
}

const onSubmitEdit = async () => {
  if (submitting.value) return
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  let responseData: { code?: number; data?: boolean; description?: string; message?: string }
  try {
    const res = await updateUser({ ...editForm })
    responseData = res.data
  } catch {
    ElMessage.error('更新失败')
    submitting.value = false
    return
  }

  if (responseData.code !== 0 || responseData.data !== true) {
    ElMessage.error(getErrorMessage(responseData, '更新失败'))
    submitting.value = false
    return
  }

  ElMessage.success('更新成功')
  editVisible.value = false
  if (isEditingSelf.value) {
    try {
      await loginUserStore.fetchLoginUser()
    } catch {
      ElMessage.warning('用户信息已更新，但登录信息刷新失败，请刷新页面')
    }
  }
  await fetchData(searchValue.value)
  submitting.value = false
}

const doDelete = async (id: unknown) => {
  const userId = Number(id)
  if (!userId || deletingIds.value.has(userId)) return
  deletingIds.value = new Set(deletingIds.value).add(userId)
  try {
    const res = await deleteUser(String(userId))
    if (res.data.code === 0 && res.data.data === true) {
      ElMessage.success('删除成功')
      await fetchData(searchValue.value)
    } else {
      ElMessage.error(getErrorMessage(res.data, '删除失败'))
    }
  } catch {
    ElMessage.error('删除失败')
  } finally {
    const nextDeletingIds = new Set(deletingIds.value)
    nextDeletingIds.delete(userId)
    deletingIds.value = nextDeletingIds
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
