<template>
  <div class="page-stack">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">统计报表</div>
            <div class="card-subtitle">默认展示本月数据，核心指标按全平台投注与派奖口径汇总。</div>
          </div>
          <div class="header-actions">
            <el-button type="primary" plain @click="applyFilters">更新报表数据</el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-segmented v-model="filters.period" :options="periodOptions" block />
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </div>

      <div class="metric-grid" v-loading="loading">
        <article class="metric-card">
          <div class="metric-label">总收入</div>
          <div class="metric-value">{{ formatCurrency(report.summary.total_income) }}</div>
          <div class="metric-hint">平台所有游戏投注总额</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">总支出</div>
          <div class="metric-value metric-value--danger">
            {{ formatCurrency(report.summary.total_payout) }}
          </div>
          <div class="metric-hint">平台派奖总额</div>
        </article>
        <article class="metric-card metric-card--accent">
          <div class="metric-label">盈亏比</div>
          <div class="metric-value metric-value--primary">
            {{ formatPercent(report.summary.win_loss_ratio) }}
          </div>
          <div class="metric-hint">用户盈利局数 / 总局数</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">平台盈亏</div>
          <div class="metric-value">
            {{ formatSignedCurrency(report.summary.platform_profit) }}
          </div>
          <div class="metric-hint">{{ report.summary.date_range_label || '-' }}</div>
        </article>
      </div>

      <el-table :data="report.games" stripe v-loading="loading">
        <el-table-column label="游戏名称" min-width="220">
          <template #default="{ row }">
            <div class="game-cell">
              <span class="game-name">{{ row.game_name }}</span>
              <span class="game-meta">{{ row.vendor_code }} / {{ row.game_code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收入" min-width="140">
          <template #default="{ row }">{{ formatCurrency(row.total_income) }}</template>
        </el-table-column>
        <el-table-column label="支出" min-width="140">
          <template #default="{ row }">{{ formatCurrency(row.total_payout) }}</template>
        </el-table-column>
        <el-table-column label="总局数" min-width="120">
          <template #default="{ row }">{{ formatInteger(row.total_rounds) }}</template>
        </el-table-column>
        <el-table-column label="用户赢局" min-width="120">
          <template #default="{ row }">{{ formatInteger(row.user_win_rounds) }}</template>
        </el-table-column>
        <el-table-column label="输赢比" min-width="120">
          <template #default="{ row }">{{ formatPercent(row.win_loss_ratio) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'

interface ReportSummary {
  total_income: number
  total_payout: number
  total_rounds: number
  user_win_rounds: number
  win_loss_ratio: number
  platform_profit: number
  selected_period: string
  date_range_label: string
}

interface ReportGameRow {
  game_code: string
  game_name: string
  vendor_code: string
  total_income: number
  total_payout: number
  total_rounds: number
  user_win_rounds: number
  win_loss_ratio: number
  platform_profit: number
}

interface ReportResponse {
  summary: ReportSummary
  games: ReportGameRow[]
}

const loading = ref(false)
const filters = reactive({
  period: 'month',
  dateRange: [] as string[]
})
const periodOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]
const report = ref<ReportResponse>({
  summary: {
    total_income: 0,
    total_payout: 0,
    total_rounds: 0,
    user_win_rounds: 0,
    win_loss_ratio: 0,
    platform_profit: 0,
    selected_period: 'month',
    date_range_label: ''
  },
  games: []
})

onMounted(() => {
  void loadReport()
})

async function loadReport() {
  loading.value = true
  try {
    const params: Record<string, string> = {
      period: filters.period
    }
    if (filters.dateRange.length === 2) {
      params.date_from = filters.dateRange[0]
      params.date_to = filters.dateRange[1]
    }
    const { data } = await http.get<{ data: ReportResponse }>('/admin/reports/summary', { params })
    report.value = data.data
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  void loadReport()
}

function formatCurrency(value: number) {
  return `¥ ${new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`
}

function formatSignedCurrency(value: number) {
  const normalized = value || 0
  return `${normalized >= 0 ? '+' : '-'}${formatCurrency(Math.abs(normalized))}`
}

function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0)
}
</script>

<style scoped>
.page-stack {
  display: grid;
  gap: 16px;
}

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

.filter-bar {
  display: grid;
  grid-template-columns: minmax(180px, 320px) minmax(280px, 440px);
  gap: 14px;
  margin-bottom: 18px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.metric-card {
  padding: 18px 20px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
}

.metric-card--accent {
  border-color: #93c5fd;
  box-shadow: inset 0 0 0 1px rgb(59 130 246 / 10%);
}

.metric-label {
  font-size: 13px;
  color: #64748b;
}

.metric-value {
  margin-top: 10px;
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
}

.metric-value--danger {
  color: #ef4444;
}

.metric-value--primary {
  color: #2563eb;
}

.metric-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.game-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-name {
  font-weight: 700;
  color: #0f172a;
}

.game-meta {
  font-size: 12px;
  color: #64748b;
}

@media (width <= 1080px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-bar {
    grid-template-columns: 1fr;
  }
}

@media (width <= 720px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
