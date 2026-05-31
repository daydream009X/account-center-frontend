<template>
  <div class="home-view custom-card">
    <h1>{{ pageTitle }}</h1>
    <p>当前路由：{{ route.path }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitleMap: Record<string, string> = {
  '/': '主页',
  '/user/login': '用户登录',
  '/user/register': '用户注册',
  '/admin/userManage': '用户管理',
}

const pageTitle = computed(() => pageTitleMap[route.path] || '主页')
</script>

<style scoped>
.home-view {
  text-align: center;
  padding: 60px 24px;
}

.home-view h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}

.home-view p {
  color: var(--custom-text-secondary);
}
</style>
