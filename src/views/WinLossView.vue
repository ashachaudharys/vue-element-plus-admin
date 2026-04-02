<template>
  <div class="page-stack">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">游戏行为与胜负统计</div>
            <div class="card-subtitle">点击次数按前端进入动作口径，以游戏会话作为统计基础。</div>
          </div>
          <el-button type="primary" plain @click="applyFilters">提交查询</el-button>
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
          <div class="metric-label">总点击</div>
          <div class="metric-value">{{ formatInteger(report.overview.total_clicks) }}</div>
          <div class="metric-hint">H5 点击游戏图标 / 进入动作</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">总游玩</div>
          <div class="metric-value">{{ formatInteger(report.overview.total_plays) }}</div>
          <div class="metric-hint">服务端收到有效下注的局数</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">用户赢局</div>
          <div class="metric-value metric-value--success">
            {{ formatInteger(report.overview.total_wins) }}
          </div>
          <div class="metric-hint">{{ formatPercent(report.overview.round_win_rate) }}</div>
        </article>
        <article class="metric-card">
          <div class="metric-label">用户负局</div>
          <div class="metric-value metric-value--danger">
            {{ formatInteger(report.overview.total_losses) }}
          </div>
          <div class="metric-hint">
            点击转化 {{ formatPercent(report.overview.conversion_rate) }}
          </div>
        </article>
      </div>

      <el-table :data="report.rows" stripe v-loading="loading">
        <el-table-column label="游戏名称" min-width="220">
          <template #default="{ row }">
            <div class="game-cell">
              <span class="game-name">{{ row.game_name }}</span>
              <span class="game-meta">{{ row.vendor_code }} / {{ row.game_code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="点击次数" min-width="110">
          <template #default="{ row }">{{ formatInteger(row.click_count) }}</template>
        </el-table-column>
        <el-table-column label="游玩次数" min-width="110">
          <template #default="{ row }">{{ formatInteger(row.play_count) }}</template>
        </el-table-column>
        <el-table-column label="转化率" min-width="110">
          <template #default="{ row }">{{ formatPercent(row.conversion_rate) }}</template>
        </el-table-column>
        <el-table-column label="胜局" min-width="100">
          <template #default="{ row }">
            <span class="positive">{{ formatInteger(row.win_count) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负局" min-width="100">
          <template #default="{ row }">
            <span class="negative">{{ formatInteger(row.loss_count) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="局数胜率" min-width="110">
          <template #default="{ row }">{{ formatPercent(row.round_win_rate) }}</template>
        </el-table-column>
        <el-table-column label="盈亏" min-width="140">
          <template #default="{ row }">{{ formatSignedCurrency(row.platform_profit) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'

interface WinLossOverview {
  total_clicks: number
  total_plays: number
  total_wins: number
  total_losses: number
  conversion_rate: number
  round_win_rate: number
  selected_period: string
  date_range_label: string
}

interface WinLossRow {
  game_code: string
  game_name: string
  vendor_code: string
  click_count: number
  play_count: number
  win_count: number
  loss_count: number
  conversion_rate: number
  round_win_rate: number
  platform_profit: number
}

interface WinLossResponse {
  overview: WinLossOverview
  rows: WinLossRow[]
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
const report = ref<WinLossResponse>({
  overview: {
    total_clicks: 0,
    total_plays: 0,
    total_wins: 0,
    total_losses: 0,
    conversion_rate: 0,
    round_win_rate: 0,
    selected_period: 'month',
    date_range_label: ''
  },
  rows: []
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
    const { data } = await http.get<{ data: WinLossResponse }>('/admin/reports/win-loss', {
      params
    })
    report.value = data.data
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  void loadReport()
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value || 0)
}

function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`
}

function formatSignedCurrency(value: number) {
  const normalized = value || 0
  const prefix = normalized >= 0 ? '+' : '-'
  return `${prefix}¥ ${new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(normalized))}`
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

.card-header {
  display: flex;
  align-items: center;
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

.metric-value--success {
  color: #16a34a;
}

.metric-value--danger {
  color: #ef4444;
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

.positive {
  font-weight: 700;
  color: #16a34a;
}

.negative {
  font-weight: 700;
  color: #ef4444;
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
