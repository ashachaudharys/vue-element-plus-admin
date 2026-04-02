<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <div>
          <div class="card-title">玩家管理</div>
          <div class="card-subtitle">支持按用户名或用户 ID 检索，默认加载最近 10 条玩家记录。</div>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">搜索玩家</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="输入用户名或用户 ID 进行模糊检索"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.status" clearable placeholder="用户状态">
        <el-option label="正常" :value="1" />
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
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column prop="id" label="用户 ID" min-width="100" />
      <el-table-column prop="telegram_id" label="TGID" min-width="120">
        <template #default="{ row }">{{ row.telegram_id || '-' }}</template>
      </el-table-column>
      <el-table-column label="游戏余额" min-width="140">
        <template #default="{ row }">{{ formatCurrency(row.balance) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="最后登录时间" min-width="170">
        <template #default="{ row }">{{ formatTime(row.last_login_at) }}</template>
      </el-table-column>
      <el-table-column prop="last_login_ip" label="登录 IP" min-width="140">
        <template #default="{ row }">{{ row.last_login_ip || '-' }}</template>
      </el-table-column>
      <el-table-column label="用户状态" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="管理操作" min-width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="canManageUsers"
            :type="row.status === 1 ? 'danger' : 'primary'"
            link
            :loading="updatingId === row.id"
            @click="toggleUserStatus(row)"
          >
            {{ row.status === 1 ? '停用用户' : '启用用户' }}
          </el-button>
          <span v-else class="text-muted">只读</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="table-summary">
        当前展示 {{ rows.length }} 条数据，共 {{ pagination.total }} 条记录
      </div>
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
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface UserRow {
  id: number
  username: string
  uid: string
  balance: number
  status: number
  telegram_id: number
  last_login_ip: string
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
const updatingId = ref<number | null>(null)
const rows = ref<UserRow[]>([])
const session = useAdminSessionStore()
const filters = reactive({
  keyword: '',
  status: undefined as number | undefined
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0
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
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status !== undefined) params.status = filters.status

    const { data } = await http.get<{ data: UserRow[]; pagination: Pagination }>('/admin/users', {
      params
    })
    rows.value = data.data
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
  pagination.page_size = 10
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

async function toggleUserStatus(row: UserRow) {
  updatingId.value = row.id
  try {
    const nextStatus = row.status === 1 ? 0 : 1
    await http.put(`/admin/users/${row.id}`, { status: nextStatus })
    ElMessage.success(
      nextStatus === 1
        ? '玩家已启用，登录与游戏权限已恢复'
        : '玩家已停用，并将在下次校验时无法继续访问'
    )
    await loadUsers()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    updatingId.value = null
  }
}

function formatCurrency(value: number) {
  return `¥ ${new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`
}

function formatTime(value?: string | null) {
  if (!value) return '-'
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

.card-header,
.header-actions {
  display: flex;
  align-items: center;
}

.card-header {
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  margin-top: 6px;
  color: #64748b;
}

.header-actions {
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

@media (width <= 1080px) {
  .filter-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 720px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .card-header,
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
