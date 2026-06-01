<template>
  <div id="homeView" class="custom-card">
    <h1 v-html="msg"></h1>
  </div>
</template>

<script setup lang="ts">
const msg = `<svg class="icon" aria-hidden="true">
                <use href="#icon-xiaolian"></use>
            </svg>
            欢迎来到小梦用户中心!
            <svg class="icon" aria-hidden="true">
              <use href="#icon-xiaolian"></use>
            </svg>`
</script>

<style scoped>
.custom-card {
  text-align: center;
  padding: 60px 24px;
}

.custom-card h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--custom-text-main);
}

.custom-card p {
  font-size: 16px;
  color: var(--custom-text-secondary);
}
</style>
