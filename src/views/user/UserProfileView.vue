<template>
  <div id="userProfileView" class="custom-card">
    <h1>个人资料</h1>

    <!-- 基本信息 -->
    <h2 class="section-title">基本信息</h2>
    <el-form
      ref="profileFormRef"
      :model="profileForm"
      :rules="profileRules"
      label-width="90px"
      style="max-width: 480px"
      class="profile-form"
    >
      <el-form-item label="头像">
        <AvatarSelect v-model="profileForm.avatarUrl" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="profileForm.username"
          maxlength="256"
          show-word-limit
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="profileForm.gender">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="0">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="profileForm.phone" maxlength="128" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="profileForm.email" maxlength="512" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="savingProfile" @click="onSubmitProfile">保存</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <!-- 修改密码 -->
    <h2 class="section-title">修改密码</h2>
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="90px"
      style="max-width: 480px"
      class="profile-form"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请输入新密码（不少于 8 位）"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="checkPassword">
        <el-input
          v-model="passwordForm.checkPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请再次输入新密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="savingPassword" @click="onSubmitPassword">
          修改密码
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
import { updatePassword, updateProfile, userLogout } from '@/api/user'
import AvatarSelect from '@/components/AvatarSelect.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({
  username: '',
  avatarUrl: '',
  gender: undefined as number | undefined,
  phone: '',
  email: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

type ValidatorFn = NonNullable<FormItemRule['validator']>

const emailValidator: ValidatorFn = (rule, value, callback) => {
  if (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback()
    return
  }
  callback(new Error('请输入正确的邮箱地址'))
}

const profileRules: FormRules<typeof profileForm> = {
  username: [{ max: 256, message: '用户名不能超过 256 个字符', trigger: 'blur' }],
  phone: [{ max: 128, message: '手机号不能超过 128 个字符', trigger: 'blur' }],
  email: [
    { max: 512, message: '邮箱不能超过 512 个字符', trigger: 'blur' },
    { validator: emailValidator, trigger: 'blur' },
  ],
}

const validateOldPassword: ValidatorFn = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入原密码'))
  } else {
    callback()
  }
}

const validateNewPassword: ValidatorFn = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 8) {
    callback(new Error('新密码不能少于 8 位'))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与原密码相同'))
  } else {
    callback()
  }
}

const validateCheckPassword: ValidatorFn = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules<typeof passwordForm> = {
  oldPassword: [{ validator: validateOldPassword, trigger: 'blur' }],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  checkPassword: [{ validator: validateCheckPassword, trigger: 'blur' }],
}

const fillProfileFromStore = () => {
  const loginUser = loginUserStore.loginUser
  profileForm.username = typeof loginUser.username === 'string' ? loginUser.username : ''
  profileForm.avatarUrl = typeof loginUser.avatarUrl === 'string' ? loginUser.avatarUrl : ''
  profileForm.gender = typeof loginUser.gender === 'number' ? loginUser.gender : undefined
  profileForm.phone = typeof loginUser.phone === 'string' ? loginUser.phone : ''
  profileForm.email = typeof loginUser.email === 'string' ? loginUser.email : ''
}

onMounted(async () => {
  if (!loginUserStore.loginUser.id) {
    ElMessage.error('请先登录')
    router.push('/user/login')
    return
  }
  try {
    await loginUserStore.fetchLoginUser()
  } catch {
    // 拉取失败时沿用 store 中已有数据
  }
  fillProfileFromStore()
})

const onSubmitProfile = async () => {
  if (savingProfile.value || !profileFormRef.value) return
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return
  savingProfile.value = true
  try {
    const res = await updateProfile({ ...profileForm })
    if (res.data.code === 0 && res.data.data === true) {
      await loginUserStore.fetchLoginUser()
      ElMessage.success('资料已保存')
    } else {
      ElMessage.error(res.data.description || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    savingProfile.value = false
  }
}

const onSubmitPassword = async () => {
  if (savingPassword.value || !passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return
  savingPassword.value = true
  try {
    const res = await updatePassword({ ...passwordForm })
    if (res.data.code === 0 && res.data.data === true) {
      ElMessage.success('密码已修改，请重新登录')
      try {
        await userLogout({})
      } catch {
        // 注销失败不影响本地退出
      }
      loginUserStore.setLoginUser({ username: '未登录' })
      router.push('/user/login')
    } else {
      ElMessage.error(res.data.description || '修改密码失败')
    }
  } catch {
    ElMessage.error('修改密码失败，请稍后重试')
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
#userProfileView {
  width: 100%;
}

#userProfileView h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}

.section-title {
  font-size: 18px;
  margin: 8px 0 16px;
  color: var(--custom-text-main);
}

.profile-form {
  margin-bottom: 8px;
}
</style>
