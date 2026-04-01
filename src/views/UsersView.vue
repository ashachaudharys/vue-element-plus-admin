<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <span>用户中心</span>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">查询</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索用户名或 UID"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.status" clearable placeholder="状态">
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
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

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column prop="uid" label="UID" min-width="220" />
      <el-table-column prop="balance" label="余额" min-width="120" />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后登录" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.last_login_at) }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="120" fixed="right">
        <template #default="{ row }">
          <el-button v-if="canManageUsers" type="primary" link @click="openEditDialog(row)"
            >编辑</el-button
          >
          <span v-else class="text-muted">只读</span>
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

  <el-dialog v-model="dialogVisible" title="编辑用户" width="420px">
    <el-form label-position="top">
      <el-form-item label="用户名">
        <el-input :model-value="editingUser?.username || ''" disabled />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status" placeholder="请选择状态">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEdit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es/components/message/index'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface UserRow {
  id: number
  username: string
  uid: string
  balance: number
  status: number
  last_login_at: string | null
  created_at: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const rows = ref<UserRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingUser = ref<UserRow | null>(null)
const session = useAdminSessionStore()
const filters = reactive({
  keyword: '',
  status: undefined as number | undefined
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})
const editForm = reactive({
  status: 1
})
const canManageUsers = computed(() => session.hasPermission('users.manage'))

onMounted(() => {
  void loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }

    const { data } = await http.get<{ data: UserRow[]; pagination: Pagination }>('/admin/users', {
      params
    })
    rows.value = data.data.map((row) => ({
      ...row,
      balance: Number(row.balance.toFixed(2))
    }))
    Object.assign(pagination, data.pagination)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.page = 1
  void loadUsers()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = undefined
  pagination.page = 1
  pagination.page_size = 20
  void loadUsers()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadUsers()
}

function handlePageSizeChange() {
  pagination.page = 1
  void loadUsers()
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

function openEditDialog(row: UserRow) {
  editingUser.value = row
  editForm.status = row.status
  dialogVisible.value = true
}

async function submitEdit() {
  if (!editingUser.value) {
    return
  }

  submitting.value = true
  try {
    await http.put(`/admin/users/${editingUser.value.id}`, {
      status: editForm.status
    })
    ElMessage.success('用户信息已更新')
    dialogVisible.value = false
    await loadUsers()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    submitting.value = false
  }
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
  grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(160px, 220px));
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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (width <= 1080px) {
  .filter-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
