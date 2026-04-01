<template>
  <div class="site-preview-stack">
    <div
      v-for="(item, index) in items"
      :key="item.code || item.label || item.title"
      :class="[
        'site-preview-item',
        {
          'site-preview-item--support': variant === 'support',
          'site-preview-item--step': variant === 'step'
        }
      ]"
    >
      <div class="site-preview-icon" :style="buildAccentStyle(item.accent)">
        {{ variant === 'step' ? index + 1 : item.icon || '?' }}
      </div>
      <div class="site-preview-copy">
        <div class="site-preview-title">
          {{ variant === 'step' ? item.title || '步骤标题' : item.title || '客服入口' }}
        </div>
        <div class="site-preview-desc">
          {{
            variant === 'step'
              ? item.label || item.description || '步骤说明'
              : item.description || '客服说明'
          }}
        </div>
      </div>
      <span v-if="variant === 'support'" class="site-preview-action">{{
        item.label || '点击咨询'
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PreviewItem {
  code?: string
  title?: string
  description?: string
  label?: string
  icon?: string
  accent?: string
}

withDefaults(
  defineProps<{
    items: PreviewItem[]
    variant?: 'support' | 'step'
  }>(),
  {
    variant: 'support'
  }
)

function buildAccentStyle(accent?: string) {
  if (!accent) {
    return {}
  }
  return {
    background: `linear-gradient(135deg, ${accent} 0%, rgba(17,24,39,0.92) 100%)`
  }
}
</script>

<style scoped>
.site-preview-stack {
  display: grid;
  gap: 12px;
}

.site-preview-item {
  display: flex;
  padding: 16px;
  background: rgb(15 23 42 / 44%);
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 18px;
  align-items: center;
  gap: 14px;
}

.site-preview-icon {
  display: grid;
  width: 42px;
  height: 42px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #64748b 0%, rgb(17 24 39 / 92%) 100%);
  border-radius: 14px;
  place-items: center;
  flex-shrink: 0;
}

.site-preview-copy {
  min-width: 0;
  flex: 1;
}

.site-preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.site-preview-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: #94a3b8;
}

.site-preview-action {
  flex-shrink: 0;
  font-size: 12px;
  color: #facc15;
}
</style>
