<template>
  <div id="userRegisterView" class="custom-card">
    <h1>用户注册</h1>

    <el-form
      ref="ruleFormRef"
      style="max-width: 480px; margin: 0 auto"
      :model="form"
      status-icon
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      @submit.prevent
    >
      <el-form-item label="账号" prop="userAccount">
        <el-input v-model.trim="form.userAccount" autocomplete="off" placeholder="请输入账号" />
      </el-form-item>

      <el-form-item label="密码" prop="userPassword">
        <el-input
          v-model="form.userPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请输入密码"
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="checkPassword">
        <el-input
          v-model="form.checkPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请再次输入密码"
        />
      </el-form-item>

      <el-form-item class="item-button">
        <el-button type="primary" @click="handleSubmit(ruleFormRef)"> 注册 </el-button>
        <el-button @click="handleReset(ruleFormRef)"> 重置 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/user'
import type { FormInstance, FormRules, FormItemRule } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()

const ruleFormRef = ref<FormInstance>()

const form = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

type ValidatorFn = NonNullable<FormItemRule['validator']>

const validateUserAccount: ValidatorFn = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入账号'))
  } else {
    callback()
  }
}

const validateUserPassword: ValidatorFn = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码不能少于 8 位'))
  } else {
    callback()
  }
}

const validateCheckPassword: ValidatorFn = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入确认密码'))
  } else if (value !== form.userPassword) {
    callback(new Error('二次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<typeof form>>({
  userAccount: [{ validator: validateUserAccount, trigger: 'blur' }],
  userPassword: [{ validator: validateUserPassword, trigger: 'blur' }],
  checkPassword: [{ validator: validateCheckPassword, trigger: 'blur' }],
})

const handleSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      // 注册时生成默认用户名，随请求保存到后端（用户之后可在「个人资料」中修改）
      const res = await userRegister({
        ...form,
        username: `用户${Math.floor(Math.random() * 10000)}`,
      })
      // 注册成功时 data 为新用户 id（正整数）；失败时后端可能返回 -1，不能被当作成功
      if (res.data.code === 0 && Number(res.data.data) > 0) {
        ElMessage.success('注册成功')
        router.push({
          path: '/user/login',
          replace: true,
        })
      } else {
        ElMessage.error('注册失败，' + (res.data.description || res.data.message || ''))
      }
    } catch {
      ElMessage.error('网络请求失败，请检查后端服务是否启动')
    }
  })
}

const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style scoped>
#userRegisterView {
  width: 100%;
  text-align: center;
}

.custom-card h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}

.item-button {
  margin-top: 20px;
}

.item-button :deep(.el-form-item__content) {
  display: flex;
  justify-content: flex-end;
}
</style>
