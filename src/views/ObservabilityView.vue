<template>
  <div class="observability-page">
    <div class="toolbar">
      <div>
        <h2 class="page-title">ClickHouse 钱包分析</h2>
        <p class="page-copy"
          >把钱包流水写入分析库后，后台可以直接查看近 24 小时、7 天、30 天的趋势与供应商表现。</p
        >
      </div>

      <div class="toolbar-actions">
        <el-radio-group v-model="selectedRange" @change="loadReport">
          <el-radio-button label="24h">24 小时</el-radio-button>
          <el-radio-button label="7d">7 天</el-radio-button>
          <el-radio-button label="30d">30 天</el-radio-button>
        </el-radio-group>
        <el-button :loading="loading" @click="loadReport">刷新</el-button>
      </div>
    </div>

    <el-alert
      v-if="!report.status.enabled"
      type="info"
      :closable="false"
      title="ClickHouse 当前未启用"
      description="设置 CLICKHOUSE_ENABLED=true 并配置 CLICKHOUSE_DSN 后，这里会显示真钱包分析报表。"
    />

    <el-alert
      v-else-if="!report.status.connected"
      type="warning"
      :closable="false"
      :title="`ClickHouse 已启用，但当前不可用`"
      :description="statusDescription"
    />

    <div class="status-bar">
      <el-tag
        :type="report.status.connected ? 'success' : report.status.enabled ? 'warning' : 'info'"
      >
        {{ report.status.connected ? '已连接' : report.status.enabled ? '连接失败' : '未启用' }}
      </el-tag>
      <span>Host: {{ report.status.host || '-' }}</span>
      <span>Database: {{ report.status.database || '-' }}</span>
      <span>Table: {{ report.status.table || '-' }}</span>
    </div>

    <div class="metrics-grid">
      <el-card v-for="item in metricCards" :key="item.label" shadow="hover" class="metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}</div>
        <div class="metric-hint">{{ item.hint }}</div>
      </el-card>
    </div>

    <div class="panel-grid">
      <el-card shadow="never" class="panel wide">
        <template #header>
          <div class="card-header">
            <span>时间趋势</span>
            <el-tag type="primary">{{ selectedRange }}</el-tag>
          </div>
        </template>

        <el-table :data="report.trend" size="small" empty-text="当前范围内暂无分析数据">
          <el-table-column prop="bucket" label="时间桶" min-width="160" />
          <el-table-column prop="event_count" label="事件数" min-width="90" />
          <el-table-column prop="active_users" label="活跃用户" min-width="100" />
          <el-table-column label="充值" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.deposit_amount) }}</template>
          </el-table-column>
          <el-table-column label="提现" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.withdraw_amount) }}</template>
          </el-table-column>
          <el-table-column label="下注" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.bet_amount) }}</template>
          </el-table-column>
          <el-table-column label="派彩" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.win_amount) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="panel">
        <template #header>
          <div class="card-header">
            <span>供应商表现</span>
            <el-tag type="success">Top 12</el-tag>
          </div>
        </template>

        <el-table :data="report.vendors" size="small" empty-text="暂无供应商分析数据">
          <el-table-column prop="vendor_code" label="供应商" min-width="120" />
          <el-table-column prop="event_count" label="事件数" min-width="90" />
          <el-table-column prop="active_users" label="活跃用户" min-width="100" />
          <el-table-column label="下注" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.bet_amount) }}</template>
          </el-table-column>
          <el-table-column label="毛利" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.gross_revenue) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="panel">
        <template #header>
          <div class="card-header">
            <span>最近事件</span>
            <el-tag type="warning">20 条</el-tag>
          </div>
        </template>

        <el-table :data="report.recent_events" size="small" empty-text="暂无最近事件">
          <el-table-column label="时间" min-width="160">
            <template #default="{ row }">{{ formatTime(row.event_time) }}</template>
          </el-table-column>
          <el-table-column prop="wallet_type_name" label="类型" min-width="100" />
          <el-table-column prop="username" label="用户" min-width="120" />
          <el-table-column prop="vendor_code" label="供应商" min-width="100" />
          <el-table-column label="变动" min-width="110">
            <template #default="{ row }">
              <span :class="row.signed_delta >= 0 ? 'delta-positive' : 'delta-negative'">
                {{ formatSigned(row.signed_delta) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="余额" min-width="110">
            <template #default="{ row }">{{ formatCurrency(row.balance_after) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { http } from '@/lib/http'

type RangeKey = '24h' | '7d' | '30d'

interface ClickHouseStatus {
  enabled: boolean
  connected: boolean
  host: string
  database: string
  table: string
  last_error?: string
}

interface WalletSummary {
  total_events: number
  active_users: number
  deposit_amount: number
  withdraw_amount: number
  bet_amount: number
  win_amount: number
  refund_amount: number
  platform_gross_revenue: number
  net_transfer_amount: number
}

interface WalletTrendPoint {
  bucket: string
  event_count: number
  active_users: number
  deposit_amount: number
  withdraw_amount: number
  bet_amount: number
  win_amount: number
}

interface WalletVendorMetric {
  vendor_code: string
  event_count: number
  active_users: number
  deposit_amount: number
  withdraw_amount: number
  bet_amount: number
  win_amount: number
  gross_revenue: number
}

interface RecentWalletEvent {
  event_time: string
  order_no: string
  source: string
  wallet_type_name: string
  user_id: number
  username: string
  uid: string
  vendor_code: string
  game_code: string
  amount: number
  signed_delta: number
  balance_after: number
  remark: string
}

interface WalletReport {
  range: RangeKey
  status: ClickHouseStatus
  summary: WalletSummary
  trend: WalletTrendPoint[]
  vendors: WalletVendorMetric[]
  recent_events: RecentWalletEvent[]
}

const selectedRange = ref<RangeKey>('7d')
const loading = ref(false)
const report = ref<WalletReport>({
  range: '7d',
  status: {
    enabled: false,
    connected: false,
    host: '',
    database: '',
    table: 'wallet_events'
  },
  summary: {
    total_events: 0,
    active_users: 0,
    deposit_amount: 0,
    withdraw_amount: 0,
    bet_amount: 0,
    win_amount: 0,
    refund_amount: 0,
    platform_gross_revenue: 0,
    net_transfer_amount: 0
  },
  trend: [],
  vendors: [],
  recent_events: []
})

const metricCards = computed(() => [
  {
    label: '钱包事件',
    value: formatInteger(report.value.summary.total_events),
    hint: '当前时间范围内的流水事件数'
  },
  {
    label: '活跃用户',
    value: formatInteger(report.value.summary.active_users),
    hint: '在分析链路里出现过的独立用户'
  },
  {
    label: '充值总额',
    value: formatCurrency(report.value.summary.deposit_amount),
    hint: 'wallet_type=deposit'
  },
  {
    label: '提现总额',
    value: formatCurrency(report.value.summary.withdraw_amount),
    hint: 'wallet_type=withdraw'
  },
  {
    label: '下注总额',
    value: formatCurrency(report.value.summary.bet_amount),
    hint: 'wallet_type=bet'
  },
  {
    label: '平台毛利',
    value: formatCurrency(report.value.summary.platform_gross_revenue),
    hint: '下注 - 派彩 - 退款'
  }
])

const statusDescription = computed(() => {
  const base = `目标 ${report.value.status.host || '-'} / ${report.value.status.database || '-'}`
  if (report.value.status.last_error) {
    return `${base}，最近错误：${report.value.status.last_error}`
  }
  return `${base}，暂时还没有可用连接。`
})

onMounted(() => {
  void loadReport()
})

async function loadReport() {
  loading.value = true
  try {
    const { data } = await http.get<{ data: WalletReport }>('/admin/observability/wallet', {
      params: {
        range: selectedRange.value
      }
    })
    report.value = data.data
  } finally {
    loading.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 0
  }).format(value || 0)
}

function formatSigned(value: number) {
  const normalized = value || 0
  const prefix = normalized >= 0 ? '+' : ''
  return `${prefix}${formatCurrency(normalized)}`
}

function formatTime(value: string) {
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
.observability-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

.page-copy {
  max-width: 720px;
  margin: 8px 0 0;
  line-height: 1.8;
  color: #64748b;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-bar {
  display: flex;
  font-size: 13px;
  color: #475569;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.panel {
  border-radius: 24px;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
}

.metric-value {
  margin-top: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.metric-hint {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.wide {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.delta-positive {
  font-weight: 600;
  color: #15803d;
}

.delta-negative {
  font-weight: 600;
  color: #b91c1c;
}

@media (width <= 960px) {
  .toolbar {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .metrics-grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
