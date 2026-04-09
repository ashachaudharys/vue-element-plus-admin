<template>
  <div class="promotions-view">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div>
            <div class="page-title">活动管理</div>
            <div class="page-subtitle">配置前端活动列表及活动详情</div>
          </div>
          <el-button type="primary" @click="openDialog()">新增活动</el-button>
        </div>
      </template>

      <el-table :data="promotions" stripe v-loading="loading">
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="title" label="活动标题" min-width="150" />
        <el-table-column prop="code" label="活动编码" min-width="120" />
        <el-table-column label="列表图" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.banner_url"
              :src="row.banner_url"
              :preview-src-list="[row.banner_url]"
              fit="contain"
              class="thumb"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="详情图" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.detail_banner_url"
              :src="row.detail_banner_url"
              :preview-src-list="[row.detail_banner_url]"
              fit="contain"
              class="thumb"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑活动' : '新增活动'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="如：每日首充" />
        </el-form-item>
        <el-form-item label="活动编码" prop="code">
          <el-input v-model="form.code" placeholder="如：actDayFirstSupple" />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="选填" />
        </el-form-item>
        <el-form-item label="列表图URL" prop="banner_url">
          <el-input v-model="form.banner_url" placeholder="如：/imageConfig/activity/xxx.webp" />
        </el-form-item>
        <el-form-item label="详情图URL" prop="detail_banner_url">
          <el-input v-model="form.detail_banner_url" placeholder="如：/imageConfig/activity/xxx_detail.webp" />
        </el-form-item>
        <el-form-item label="详情标题" prop="detail_title">
          <el-input v-model="form.detail_title" placeholder="选填" />
        </el-form-item>
        <el-form-item label="活动时间" prop="activity_time">
          <el-input v-model="form.activity_time" placeholder="如：长期有效" />
        </el-form-item>
        <el-form-item label="活动简介" prop="intro">
          <el-input type="textarea" v-model="form.intro" placeholder="选填" :rows="3" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { http } from '@/utils/http'

interface Promotion {
  id: number
  code: string
  title: string
  subtitle: string
  banner_url: string
  detail_banner_url: string
  detail_title: string
  activity_time: string
  intro: string
  table_config: string
  rules: string
  buttons: string
  status: number
  sort_order: number
}

const loading = ref(false)
const promotions = ref<Promotion[]>([])

const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = ref<Partial<Promotion>>({
  title: '',
  code: '',
  subtitle: '',
  banner_url: '',
  detail_banner_url: '',
  detail_title: '',
  activity_time: '',
  intro: '',
  table_config: '{}',
  rules: '[]',
  buttons: '[]',
  status: 1,
  sort_order: 0
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  code: [{ required: true, message: '请输入活动编码', trigger: 'blur' }]
}

const fetchPromotions = async () => {
  loading.value = true
  try {
    const { data } = await http.get('/admin/promotions')
    promotions.value = data.data || []
  } catch (error) {
    console.error('Failed to fetch promotions:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = (row?: Promotion) => {
  if (row) {
    editingId.value = row.id
    form.value = { ...row }
  } else {
    editingId.value = null
    form.value = {
      title: '',
      code: '',
      subtitle: '',
      banner_url: '',
      detail_banner_url: '',
      detail_title: '',
      activity_time: '',
      intro: '',
      table_config: '{}',
      rules: '[]',
      buttons: '[]',
      status: 1,
      sort_order: 0
    }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await http.put(`/admin/promotions/${editingId.value}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await http.post('/admin/promotions', form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchPromotions()
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (row: Promotion) => {
  try {
    await ElMessageBox.confirm(`确定要删除活动 "${row.title}" 吗？`, '警告', {
      type: 'warning'
    })
    await http.delete(`/admin/promotions/${row.id}`)
    ElMessage.success('删除成功')
    fetchPromotions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
    }
  }
}

onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
.promotions-view {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.page-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
.thumb {
  width: 80px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}
</style>
