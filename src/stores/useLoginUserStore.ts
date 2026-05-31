import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCurrentUser } from '@/api/user'

export const useLoginUserStore = defineStore('loginUser', () => {
  //定义登录用户状态
  const loginUser = ref<Record<string, unknown>>({
    username: '未登录',
  })

  //定义获取登录用户信息
  async function fetchLoginUser() {
    const res = await getCurrentUser()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
  }

  //定义设置登录用户信息
  function setLoginUser(newLoginUser: Record<string, unknown>) {
    loginUser.value = newLoginUser
  }

  //暴露登录用户状态、设置登录用户信息、获取登录用户信息
  return { loginUser, setLoginUser, fetchLoginUser }
})
