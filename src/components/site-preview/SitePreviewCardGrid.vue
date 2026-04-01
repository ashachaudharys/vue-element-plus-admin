<template>
  <div class="site-preview-grid">
    <article
      v-for="item in items"
      :key="item.code || item.label || item.title"
      :class="['site-preview-card', { 'site-preview-card--activity': variant === 'activity' }]"
      :style="buildPreviewCardStyle(item)"
    >
      <div class="site-preview-badge">{{ resolveBadge(item) }}</div>
      <div class="site-preview-title">{{ resolveTitle(item) }}</div>
      <div v-if="variant === 'activity'" class="site-preview-subtitle">
        {{ item.subtitle || '活动副标题' }}
      </div>
      <div class="site-preview-desc">{{ resolveDescription(item) }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
type CardVariant = 'activity' | 'login' | 'shortcut'

interface PreviewItem {
  code?: string
  label?: string
  title?: string
  subtitle?: string
  description?: string
  badge?: string
  icon?: string
  accent?: string
  image_url?: string
}

const props = withDefaults(
  defineProps<{
    items: PreviewItem[]
    variant?: CardVariant
  }>(),
  {
    variant: 'login'
  }
)

function resolveBadge(item: PreviewItem) {
  switch (props.variant) {
    case 'activity':
      return item.badge || item.code || 'campaign'
    case 'shortcut':
      return item.icon || '捷'
    default:
      return item.subtitle || item.code || 'login'
  }
}

function resolveTitle(item: PreviewItem) {
  switch (props.variant) {
    case 'activity':
      return item.title || '活动卡'
    case 'shortcut':
      return item.label || '快捷入口'
    default:
      return item.title || '登录卡片'
  }
}

function resolveDescription(item: PreviewItem) {
  switch (props.variant) {
    case 'activity':
      return item.description || '活动说明'
    case 'shortcut':
      return item.description || '入口说明'
    default:
      return item.description || '登录入口说明'
  }
}

function buildPreviewCardStyle(item: PreviewItem) {
  const accent = item.accent || '#3b2676'
  const gradient = `linear-gradient(135deg, ${accent} 0%, rgba(15,23,42,0.88) 100%)`
  if (!item.image_url) {
    return {
      background: gradient
    }
  }
  return {
    backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.82) 100%), url(${item.image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: accent
  }
}
</script>

<style scoped>
.site-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.site-preview-card {
  min-height: 152px;
  padding: 18px;
  overflow: hidden;
  color: #fff;
  border: 1px solid rgb(148 163 184 / 14%);
  border-radius: 20px;
}

.site-preview-card--activity {
  min-height: 172px;
}

.site-preview-badge {
  display: inline-flex;
  min-width: 52px;
  padding: 4px 10px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgb(15 23 42 / 24%);
  border-radius: 999px;
  align-items: center;
  justify-content: center;
}

.site-preview-title {
  margin-top: 18px;
  font-size: 16px;
  font-weight: 600;
}

.site-preview-subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: rgb(255 255 255 / 76%);
}

.site-preview-desc {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.7;
  color: rgb(255 255 255 / 72%);
}
</style>
