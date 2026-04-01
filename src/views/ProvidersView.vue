<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <span>供应商管理</span>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">查询</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索供应商名称 / 编码 / 地址"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.status" clearable placeholder="同步状态">
        <el-option label="已同步" :value="1" />
        <el-option label="已停用" :value="0" />
      </el-select>
      <el-select v-model="filters.operational_status" clearable placeholder="前台开关">
        <el-option label="已启用" :value="1" />
        <el-option label="已关闭" :value="0" />
      </el-select>
      <el-select v-model="filters.manual_config_enabled" clearable placeholder="配置模式">
        <el-option label="手工配置" :value="true" />
        <el-option label="同步配置" :value="false" />
      </el-select>
      <el-select
        v-model="pagination.page_size"
        placeholder="每页条数"
        @change="handlePageSizeChange"
      >
        <el-option :value="10" label="10 / 页" />
        <el-option :value="20" label="20 / 页" />
        <el-option :value="50" label="50 / 页" />
      </el-select>
    </div>

    <el-table :data="providers" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="vendor_code" label="编码" min-width="140" />
      <el-table-column label="同步状态" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '已同步' : '已停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="前台开关" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.operational_status === 1 ? 'success' : 'warning'">
            {{ row.operational_status === 1 ? '已启用' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="配置模式" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.manual_config_enabled ? 'warning' : 'info'">
            {{ row.manual_config_enabled ? '手工配置' : '同步配置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="client_id" label="Client ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="api_base_url" label="启动地址" min-width="240" show-overflow-tooltip />
      <el-table-column label="更新时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEditDialog(row)">编辑配置</el-button>
          <el-button
            :type="row.operational_status === 1 ? 'warning' : 'success'"
            link
            :loading="updatingId === row.id"
            @click="toggleVendor(row)"
          >
            {{ row.operational_status === 1 ? '关闭前台' : '启用前台' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="table-summary">共 {{ pagination.total }} 条记录</div>
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.page_size"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>
  </el-card>

  <el-dialog v-model="dialogVisible" title="编辑供应商配置" width="720px">
    <el-form label-position="top">
      <div class="dialog-grid">
        <el-form-item label="供应商名称">
          <el-input v-model.trim="editForm.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="供应商编码">
          <el-input :model-value="editingVendor?.vendor_code || ''" disabled />
        </el-form-item>
        <el-form-item label="接入地址">
          <el-input v-model.trim="editForm.api_base_url" placeholder="请输入接入地址" />
        </el-form-item>
        <el-form-item label="Client ID">
          <el-input v-model.trim="editForm.client_id" placeholder="请输入 Client ID" />
        </el-form-item>
      </div>

      <el-form-item label="Client Secret">
        <el-input
          v-model.trim="editForm.client_secret"
          type="password"
          show-password
          placeholder="留空则保持现有密钥不变"
        />
        <div class="field-hint">
          当前密钥状态：{{ editingVendor?.has_client_secret ? '已设置' : '未设置' }}
        </div>
      </el-form-item>

      <div class="dialog-grid">
        <el-form-item label="前台开关">
          <el-select v-model="editForm.operational_status">
            <el-option :value="1" label="已启用" />
            <el-option :value="0" label="已关闭" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置模式">
          <el-select v-model="editForm.manual_config_enabled">
            <el-option :value="true" label="手工配置" />
            <el-option :value="false" label="同步配置" />
          </el-select>
        </el-form-item>
      </div>

      <div class="dialog-note">
        开启“手工配置”后，同步任务不会再覆盖该供应商的名称、接入地址、Client ID 与 Client Secret。
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEdit">保存配置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'

import { http } from '@/lib/http'

interface ProviderRow {
  id: number
  name: string
  vendor_code: string
  api_base_url: string
  client_id: string
  has_client_secret: boolean
  type: number
  status: number
  operational_status: number
  manual_config_enabled: boolean
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const editingVendor = ref<ProviderRow | null>(null)
const providers = ref<ProviderRow[]>([])
const updatingId = ref<number | null>(null)
const filters = reactive({
  keyword: '',
  status: undefined as number | undefined,
  operational_status: undefined as number | undefined,
  manual_config_enabled: undefined as boolean | undefined
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})
const editForm = reactive({
  name: '',
  api_base_url: '',
  client_id: '',
  client_secret: '',
  operational_status: 1,
  manual_config_enabled: false
})

onMounted(() => {
  void loadProviders()
})

async function loadProviders() {
  loading.value = true
  try {
    const params: Record<string, string | number | boolean> = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }
    if (filters.operational_status !== undefined) {
      params.operational_status = filters.operational_status
    }
    if (filters.manual_config_enabled !== undefined) {
      params.manual_config_enabled = filters.manual_config_enabled
    }

    const { data } = await http.get<{ data: ProviderRow[]; pagination: Pagination }>(
      '/admin/vendors',
      {
        params
      }
    )
    providers.value = data.data
    Object.assign(pagination, data.pagination)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.page = 1
  void loadProviders()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = undefined
  filters.operational_status = undefined
  filters.manual_config_enabled = undefined
  pagination.page = 1
  pagination.page_size = 20
  void loadProviders()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadProviders()
}

function handlePageSizeChange() {
  pagination.page = 1
  void loadProviders()
}

async function toggleVendor(row: ProviderRow) {
  updatingId.value = row.id
  try {
    const nextStatus = row.operational_status === 1 ? 0 : 1
    await http.put(`/admin/vendors/${row.id}`, {
      operational_status: nextStatus
    })
    ElMessage.success(nextStatus === 1 ? '供应商前台入口已启用' : '供应商前台入口已关闭')
    await loadProviders()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    updatingId.value = null
  }
}

function openEditDialog(row: ProviderRow) {
  editingVendor.value = row
  editForm.name = row.name
  editForm.api_base_url = row.api_base_url
  editForm.client_id = row.client_id
  editForm.client_secret = ''
  editForm.operational_status = row.operational_status
  editForm.manual_config_enabled = row.manual_config_enabled
  dialogVisible.value = true
}

async function submitEdit() {
  if (!editingVendor.value) {
    return
  }

  submitting.value = true
  try {
    await http.put(`/admin/vendors/${editingVendor.value.id}`, {
      name: editForm.name,
      api_base_url: editForm.api_base_url,
      client_id: editForm.client_id,
      client_secret: editForm.client_secret,
      operational_status: editForm.operational_status,
      manual_config_enabled: editForm.manual_config_enabled
    })
    ElMessage.success('供应商配置已更新')
    dialogVisible.value = false
    await loadProviders()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

function formatTime(value?: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
</script>

<style scoped>
.page-card {
  border-radius: 28px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(4, minmax(150px, 200px));
  gap: 14px;
  margin-bottom: 18px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.table-summary {
  font-size: 13px;
  color: #64748b;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.dialog-note {
  padding: 12px 14px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #9a3412;
  background: #fff7ed;
  border-radius: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (width <= 1080px) {
  .filter-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 720px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
