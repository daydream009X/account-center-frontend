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
          <a href="https://www.mydaydream.top" target="_blank"> 白日做梦 </a>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="header-right">
      <div v-if="loginUserStore.loginUser.id">
        {{ loginUserStore.loginUser.username ? loginUserStore.loginUser.username : `${userName}` }}
      </div>
      <div v-else>
        <el-button type="primary" class="header-login-btn" @click="router.push('/user/login')">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

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

const userName: string = `用户` + Math.floor(Math.random() * 10000)

const handleSelect = (key: string) => {
  if (indexRouteMap[key]) {
    router.push(indexRouteMap[key])
  }
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

/* 三、顶部导航栏右侧部分 */
.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-login-btn {
  height: 44px;
  padding: 0 28px;
  font-size: 17px;
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
</style>
