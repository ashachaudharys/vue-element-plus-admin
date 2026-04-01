<template>
  <div class="site-preview-row">
    <span
      v-for="item in items"
      :key="item.code || item.label || item.title"
      class="site-preview-pill"
      :style="buildAccentStyle(item.accent)"
    >
      <span>{{ item.icon || iconFallback }}</span>
      {{ item.label || item.title || labelFallback }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface PreviewItem {
  code?: string
  label?: string
  title?: string
  icon?: string
  accent?: string
}

withDefaults(
  defineProps<{
    items: PreviewItem[]
    iconFallback?: string
    labelFallback?: string
  }>(),
  {
    iconFallback: '•',
    labelFallback: '未命名'
  }
)

function buildAccentStyle(accent?: string) {
  if (!accent) {
    return {}
  }
  return {
    backgroundColor: `${accent}${Math.round(0.18 * 255)
      .toString(16)
      .padStart(2, '0')}`
  }
}
</script>

<style scoped>
.site-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.site-preview-pill {
  display: inline-flex;
  padding: 10px 14px;
  font-size: 12px;
  color: #e2e8f0;
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 999px;
  align-items: center;
  gap: 8px;
}
</style>
