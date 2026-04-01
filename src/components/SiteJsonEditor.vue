<template>
  <el-form-item :label="label">
    <template #label>
      <div class="site-json-editor__label">
        <div class="site-json-editor__copy">
          <span>{{ label }}</span>
          <el-tag size="small" effect="plain" :type="tagType">{{ count }} 项</el-tag>
        </div>
        <div class="site-json-editor__actions">
          <el-button link @click="emit('format')">格式化</el-button>
          <el-button link @click="emit('validate')">校验</el-button>
          <el-button v-if="canManage" link type="primary" @click="emit('apply-template')">
            回填
          </el-button>
        </div>
      </div>
    </template>
    <el-input
      :model-value="modelValue"
      type="textarea"
      :rows="rows"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </el-form-item>
  <slot name="preview"></slot>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    modelValue: string
    rows?: number
    count: number
    tagType?: '' | 'success' | 'info' | 'warning' | 'danger' | 'primary'
    canManage?: boolean
  }>(),
  {
    rows: 6,
    tagType: 'success',
    canManage: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'format'): void
  (e: 'validate'): void
  (e: 'apply-template'): void
}>()
</script>

<style scoped>
.site-json-editor__label {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.site-json-editor__copy,
.site-json-editor__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
