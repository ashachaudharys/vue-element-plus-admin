<template>
  <div class="site-preview-menu">
    <div v-for="item in items" :key="item.code || item.label" class="site-preview-menu-item">
      <span>{{ item.label || '菜单项' }}</span>
      <span>›</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PreviewItem {
  code?: string
  label?: string
}

defineProps<{
  items: PreviewItem[]
}>()
</script>

<style scoped>
.site-preview-menu {
  display: grid;
  gap: 10px;
}

.site-preview-menu-item {
  display: flex;
  padding: 16px;
  font-size: 13px;
  color: #e2e8f0;
  background: rgb(15 23 42 / 44%);
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 18px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
</style>
