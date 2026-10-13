<template>
  <div class="avatar-select">
    <el-avatar :size="80" :src="modelValue" class="avatar-preview" />
    <el-button class="avatar-select-btn" @click="openDialog">选择头像</el-button>

    <el-dialog v-model="dialogVisible" title="选择头像" width="420px" append-to-body>
      <div class="avatar-grid">
        <div
          v-for="url in AVATARS"
          :key="url"
          class="avatar-item"
          :class="{ active: url === tempSelected }"
          @click="tempSelected = url"
        >
          <el-avatar :size="56" :src="url" />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVATARS from '@/assets/avatars'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const dialogVisible = ref(false)
const tempSelected = ref('')

const openDialog = () => {
  tempSelected.value = props.modelValue ?? ''
  dialogVisible.value = true
}

const confirm = () => {
  if (tempSelected.value) {
    emit('update:modelValue', tempSelected.value)
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.avatar-select {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.avatar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.avatar-item:hover {
  transform: scale(1.06);
}

.avatar-item.active {
  border-color: var(--el-color-primary);
}
</style>
