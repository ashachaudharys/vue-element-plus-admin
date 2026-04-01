<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <span>登录日志</span>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">查询</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索管理员用户名、IP 或说明"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.action" clearable placeholder="动作">
        <el-option label="管理员登录" value="admin_user.login" />
        <el-option label="管理员退出" value="admin_user.logout" />
        <el-option label="登录失败" value="admin_user.login_failed" />
        <el-option label="登录锁定" value="admin_user.login_locked" />
        <el-option label="等待 2FA" value="admin_user.login_2fa_required" />
        <el-option label="IP 白名单拦截" value="admin_user.login_ip_blocked" />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="结果">
        <el-option label="成功" value="success" />
        <el-option label="拒绝" value="denied" />
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
      <el-table-column label="管理员" min-width="160">
        <template #default="{ row }">
          <div class="user-cell">
            <span class="user-name">{{ row.admin_username }}</span>
            <span class="user-uid">ID {{ row.admin_user_id }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="动作" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.action === 'admin_user.login' ? 'success' : 'info'">
            {{ actionLabelMap[row.action] || row.action }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结果" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'warning'">
            {{ row.status === 'success' ? '成功' : '拒绝' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column prop="ip_address" label="IP" min-width="140" />
      <el-table-column label="UA" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.user_agent || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
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
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'

interface LoginLogRow {
  id: number
  admin_user_id: number
  admin_username: string
  action: string
  status: string
  detail: string
  ip_address: string
  user_agent: string
  created_at: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const rows = ref<LoginLogRow[]>([])
const filters = reactive({
  keyword: '',
  action: '',
  status: ''
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})

const actionLabelMap: Record<string, string> = {
  'admin_user.login': '管理员登录',
  'admin_user.logout': '管理员退出',
  'admin_user.login_failed': '登录失败',
  'admin_user.login_locked': '登录锁定',
  'admin_user.login_2fa_required': '等待 2FA',
  'admin_user.login_ip_blocked': 'IP 白名单拦截'
}

onMounted(() => {
  void loadLogs()
})

async function loadLogs() {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.action) {
      params.action = filters.action
    }
    if (filters.status) {
      params.status = filters.status
    }

    const { data } = await http.get<{ data: LoginLogRow[]; pagination: Pagination }>(
      '/admin/login/logs',
      {
        params
      }
    )
    rows.value = data.data
    Object.assign(pagination, data.pagination)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.page = 1
  void loadLogs()
}

function resetFilters() {
  filters.keyword = ''
  filters.action = ''
  filters.status = ''
  pagination.page = 1
  pagination.page_size = 20
  void loadLogs()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadLogs()
}

function handlePageSizeChange() {
  pagination.page = 1
  void loadLogs()
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
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(value))
}
</script>

<style scoped>
.page-card {
  border-radius: 24px;
}

.card-header,
.header-actions,
.filter-bar,
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-bar {
  margin-bottom: 18px;
  align-items: stretch;
}

.table-footer {
  margin-top: 18px;
}

.table-summary,
.user-uid {
  color: #64748b;
}

.user-cell {
  display: grid;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
}

@media (width <= 900px) {
  .filter-bar {
    display: grid;
  }
}
</style>
