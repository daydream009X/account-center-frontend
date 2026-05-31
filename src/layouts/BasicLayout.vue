<template>
  <div id="basicLayout">
    <el-container class="layout-container">
      <el-header height="100px">
        <GlobalHeader></GlobalHeader>
      </el-header>
      <el-main class="layout-main"><router-view></router-view></el-main>
      <el-footer class="layout-footer footer-text-dreamscape">
        <a href="https://www.mydaydream.top" target="_blank"> 小梦用户中心 by 白日做梦 </a>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout {
  height: 100%;
}

/* 底部样式 */
.footer-text-dreamscape {
  cursor: pointer;
  color: #97b462;
  font-size: 20px;
  font-weight: 500;
  transition: color 0.3s;
}

.footer-text-dreamscape:hover {
  color: #7c5ce0;
}
</style>
