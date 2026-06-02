<template>
  <div id="globalHeader" class="layout-header">
    <div class="header-left">
      <img style="width: 50px" src="@/assets/logo.png" alt="logo" />
      <span class="header-logo-text">小梦用户中心</span>
    </div>
    <div class="header-center">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="true"
        @select="handleSelect"
      >
        <el-menu-item index="1">
          <svg class="icon" aria-hidden="true">
            <use href="#icon-zhuye"></use>
          </svg>
          <span>主页</span>
        </el-menu-item>
        <el-menu-item index="2">
          <svg class="icon" aria-hidden="true">
            <use href="#icon-Sam"></use>
          </svg>
          <span>用户登录</span>
        </el-menu-item>
        <el-menu-item index="3">
          <svg class="icon" aria-hidden="true">
            <use href="#icon-yonghuzhuce"></use>
          </svg>
          <span>用户注册</span>
        </el-menu-item>
        <el-menu-item index="4">
          <svg class="icon" aria-hidden="true">
            <use href="#icon-huiyuanhuangguan"></use>
          </svg>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="5" class="footer-text-dreamscape">
          <svg class="icon" aria-hidden="true">
            <use href="#icon-xiaolian"></use>
          </svg>
          <a href="https://www.mydaydream.top" target="_blank" @click.stop> 白日做梦 </a>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="header-right">
      <button class="theme-toggle-btn" @click="toggleTheme">
        <svg v-if="isDark" class="icon" aria-hidden="true">
          <use href="#icon-taiyang"></use>
        </svg>
        <svg v-else class="icon" aria-hidden="true">
          <use href="#icon-yueliang"></use>
        </svg>
      </button>
      <div v-if="loginUserStore.loginUser.id" class="header-user-info">
        <el-dropdown trigger="click" @command="doLogout">
          <div class="header-user-trigger">
            <img
              v-if="loginUserStore.loginUser.avatarUrl"
              :src="String(loginUserStore.loginUser.avatarUrl)"
              class="header-avatar"
              alt="头像"
            />
            <span>{{
              loginUserStore.loginUser.username ? loginUserStore.loginUser.username : `${userName}`
            }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-else>
        <el-button type="primary" class="header-login-btn" @click="router.push('/user/login')"
          >登录</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogout } from '@/api/user'

const router = useRouter()
const route = useRoute()

const loginUserStore = useLoginUserStore()

const routeIndexMap: Record<string, string> = {
  '/': '1',
  '/user/login': '2',
  '/user/register': '3',
  '/admin/userManage': '4',
}

const indexRouteMap: Record<string, string> = {
  '1': '/',
  '2': '/user/login',
  '3': '/user/register',
  '4': '/admin/userManage',
}

const activeIndex = ref(routeIndexMap[route.path] || '1')

watch(
  () => route.path,
  (path) => {
    activeIndex.value = routeIndexMap[path] || '1'
  },
)

const isDark = ref(false)

const applyTheme = () => {
  document.documentElement.classList.toggle('theme-dark', isDark.value)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
    applyTheme()
  }
})

const userName: string = `用户` + Math.floor(Math.random() * 10000)

const handleSelect = (key: string) => {
  if (indexRouteMap[key]) {
    router.push(indexRouteMap[key])
  } else {
    activeIndex.value = routeIndexMap[route.path] || '1'
  }
}

const doLogout = async () => {
  await userLogout({})
  loginUserStore.setLoginUser({ username: '未登录' })
  router.push('/user/login')
}
</script>

<style scoped>
#globalHeader {
  height: 100%;
}

/* 一、顶部导航栏左侧部分 */
.header-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .header-logo-text {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--custom-text-main);
}

/* 二、顶部导航栏中间部分 */
.header-center {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  display: flex;
  align-items: center;
  margin-left: 30px;
  margin-right: 30px;
}

.header-center .el-menu-demo {
  width: 100%;
}

.el-menu-item.footer-text-dreamscape,
.el-menu-item.footer-text-dreamscape a {
  color: #97b462 !important;
  font-weight: 500;
  border: none !important;
  outline: none !important;
  transition: color 0.3s;
}

.el-menu-item.footer-text-dreamscape:hover,
.el-menu-item.footer-text-dreamscape:hover a {
  color: #7c5ce0 !important;
  background-color: transparent !important;
}

/* 三、顶部导航栏右侧部分 */
.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--custom-border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--custom-text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;
  flex-shrink: 0;
}

.theme-toggle-btn:hover {
  background-color: var(--custom-bg-page);
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.header-user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--custom-border-color);
}

.header-login-btn {
  height: 44px;
  padding: 0 28px;
  font-size: 17px;
}
</style>
