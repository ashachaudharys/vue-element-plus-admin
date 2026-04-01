<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <span>钱包日志</span>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">查询</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索订单号 / 供应商 / 游戏 / 用户ID"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-input
        v-model.trim="filters.user_id"
        placeholder="用户ID"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-input
        v-model.trim="filters.vendor_code"
        placeholder="供应商编码"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.type" clearable placeholder="流水类型">
        <el-option :value="1" label="充值" />
        <el-option :value="2" label="提现" />
        <el-option :value="3" label="下注" />
        <el-option :value="4" label="派奖" />
        <el-option :value="5" label="退款" />
      </el-select>
    </div>

    <el-table :data="logs" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="user_id" label="用户ID" min-width="90" />
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="user-cell">
            <span class="user-name">{{ row.username || '-' }}</span>
            <span class="user-uid">{{ row.uid || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="订单号" min-width="180" show-overflow-tooltip />
      <el-table-column label="类型" min-width="100">
        <template #default="{ row }">
          <el-tag :type="walletTypeMap[row.type]?.type || 'info'">
            {{ walletTypeMap[row.type]?.label || `类型 ${row.type}` }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" min-width="120" />
      <el-table-column prop="balance_before" label="变更前余额" min-width="140" />
      <el-table-column prop="balance_after" label="变更后余额" min-width="140" />
      <el-table-column prop="vendor_code" label="供应商" min-width="120" />
      <el-table-column prop="game_code" label="游戏" min-width="150" />
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
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

interface WalletLogRow {
  id: number
  user_id: number
  username: string
  uid: string
  order_no: string
  type: number
  amount: number
  balance_before: number
  balance_after: number
  remark: string
  vendor_code: string
  game_code: string
  created_at: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const logs = ref<WalletLogRow[]>([])
const filters = reactive({
  keyword: '',
  user_id: '',
  vendor_code: '',
  type: undefined as number | undefined
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})

const walletTypeMap: Record<
  number,
  { label: string; type: 'success' | 'danger' | 'warning' | 'info' }
> = {
  1: { label: '充值', type: 'success' },
  2: { label: '提现', type: 'danger' },
  3: { label: '下注', type: 'warning' },
  4: { label: '派奖', type: 'success' },
  5: { label: '退款', type: 'info' }
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
    if (filters.user_id) {
      params.user_id = filters.user_id
    }
    if (filters.vendor_code) {
      params.vendor_code = filters.vendor_code
    }
    if (filters.type !== undefined) {
      params.type = filters.type
    }

    const { data } = await http.get<{ data: WalletLogRow[]; pagination: Pagination }>(
      '/admin/wallet/logs',
      {
        params
      }
    )
    logs.value = data.data
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
  filters.user_id = ''
  filters.vendor_code = ''
  filters.type = undefined
  pagination.page = 1
  pagination.page_size = 20
  void loadLogs()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadLogs()
}

function formatTime(value: string) {
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
  grid-template-columns: minmax(0, 1.7fr) repeat(3, minmax(160px, 220px));
  gap: 14px;
  margin-bottom: 18px;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
}

.user-uid {
  font-size: 12px;
  color: #64748b;
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

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
