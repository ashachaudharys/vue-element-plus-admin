<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <div>
          <div class="card-title">账变明细</div>
          <div class="card-subtitle">
            默认展示最近 20 条账变，包含流水号、关联游戏或操作、账变前后金额对比。
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">立即搜索</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索流水号 / 关联游戏 / 操作 / 用户ID"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-input
        v-model.trim="filters.user_id"
        placeholder="用户 ID"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-input
        v-model.trim="filters.vendor_code"
        placeholder="API 供应商"
        clearable
        @keyup.enter="applyFilters"
      />
      <el-select v-model="filters.type" clearable placeholder="账变类型">
        <el-option :value="1" label="充值" />
        <el-option :value="2" label="提现" />
        <el-option :value="3" label="下注" />
        <el-option :value="4" label="派奖" />
        <el-option :value="5" label="退款" />
      </el-select>
    </div>

    <el-table :data="logs" stripe v-loading="loading">
      <el-table-column label="流水号" min-width="190" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="serial-cell">
            <span class="serial-main">{{ row.order_no }}</span>
            <span class="serial-sub">#{{ row.id }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="关联用户" min-width="170">
        <template #default="{ row }">
          <div class="user-cell">
            <span class="user-name">{{ row.username || '-' }}</span>
            <span class="user-uid">UID {{ row.uid || '-' }} / ID {{ row.user_id }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="关联游戏 / 操作" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="related-cell">
            <span class="related-main">{{ row.related_action || '-' }}</span>
            <span class="related-sub">
              {{ walletTypeMap[row.type]?.label || `类型 ${row.type}` }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="账变前后对比" min-width="240">
        <template #default="{ row }">
          <div class="balance-compare">
            <div>账变前：{{ formatCurrency(row.balance_before) }}</div>
            <div
              :class="
                row.type === 4 || row.type === 1 || row.type === 5
                  ? 'delta-positive'
                  : 'delta-negative'
              "
            >
              账变额：{{ formatSigned(row.amount, row.type) }}
            </div>
            <div>账变后：{{ formatCurrency(row.balance_after) }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="变动时间" min-width="180">
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
  related_action: string
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

const walletTypeMap: Record<number, { label: string }> = {
  1: { label: '系统充值' },
  2: { label: '人工提现' },
  3: { label: '游戏投注' },
  4: { label: '游戏派奖' },
  5: { label: '退款回滚' }
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
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.user_id) params.user_id = filters.user_id
    if (filters.vendor_code) params.vendor_code = filters.vendor_code
    if (filters.type !== undefined) params.type = filters.type

    const { data } = await http.get<{ data: WalletLogRow[]; pagination: Pagination }>(
      '/admin/wallet/logs',
      { params }
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

function formatCurrency(value: number) {
  return `¥ ${new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`
}

function formatSigned(value: number, type: number) {
  const positiveTypes = new Set([1, 4, 5])
  const prefix = positiveTypes.has(type) ? '+' : '-'
  return `${prefix}${formatCurrency(value)}`
}

function formatTime(value: string) {
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
  grid-template-columns: minmax(0, 1.7fr) repeat(3, minmax(160px, 220px));
  gap: 14px;
  margin-bottom: 18px;
}

.serial-cell,
.user-cell,
.related-cell,
.balance-compare {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.serial-main,
.user-name,
.related-main {
  font-weight: 700;
  color: #0f172a;
}

.serial-sub,
.user-uid,
.related-sub {
  font-size: 12px;
  color: #64748b;
}

.delta-positive {
  font-weight: 700;
  color: #16a34a;
}

.delta-negative {
  font-weight: 700;
  color: #ef4444;
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
