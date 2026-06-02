import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { ElMessage } from 'element-plus'

/**
 * 全局权限校验
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()

  // 确保用户信息已从后端拉取
  if (!loginUserStore.loginUser.id) {
    await loginUserStore.fetchLoginUser()
  }

  const loginUser = loginUserStore.loginUser
  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 1) {
      ElMessage.error('没有权限')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
