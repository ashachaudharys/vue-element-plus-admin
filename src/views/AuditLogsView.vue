<template>
  <el-card shadow="never" class="page-card">
    <template #header>
      <div class="card-header">
        <span>审计日志</span>
        <div class="header-actions">
          <el-button type="primary" plain @click="applyFilters">查询</el-button>
          <el-button plain @click="resetFilters">重置</el-button>
        </div>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model.trim="filters.keyword"
        placeholder="搜索管理员、动作、对象、详情"
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
        <el-option label="管理员创建" value="admin_user.create" />
        <el-option label="管理员重置密码" value="admin_user.password_reset" />
        <el-option label="管理员开启 2FA" value="admin_user.2fa_enable" />
        <el-option label="管理员关闭 2FA" value="admin_user.2fa_disable" />
        <el-option label="管理员重置 2FA" value="admin_user.2fa_reset" />
        <el-option label="角色创建" value="admin_role.create" />
        <el-option label="角色更新" value="admin_role.update" />
        <el-option label="用户更新" value="user.update" />
        <el-option label="游戏更新" value="game.update" />
        <el-option label="标签创建" value="game_tag.create" />
        <el-option label="标签更新" value="game_tag.update" />
        <el-option label="标签删除" value="game_tag.delete" />
        <el-option label="供应商更新" value="vendor.update" />
        <el-option label="运营开关更新" value="platform_switch.update" />
      </el-select>
      <el-select v-model="filters.target_type" clearable placeholder="对象类型">
        <el-option label="管理员" value="admin_user" />
        <el-option label="角色" value="admin_role" />
        <el-option label="用户" value="user" />
        <el-option label="游戏" value="game" />
        <el-option label="游戏标签" value="game_tag" />
        <el-option label="供应商" value="vendor" />
        <el-option label="运营开关" value="platform_switch" />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="结果">
        <el-option label="成功" value="success" />
        <el-option label="拒绝" value="denied" />
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
      <el-table-column label="动作" min-width="140">
        <template #default="{ row }">
          <el-tag type="primary">{{ actionLabelMap[row.action] || row.action }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="对象" min-width="120">
        <template #default="{ row }">
          {{ targetTypeLabelMap[row.target_type] || row.target_type }} #{{ row.target_id }}
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
      <el-table-column label="时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="详情" min-width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openPreview(row)">查看</el-button>
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

  <el-dialog v-model="previewVisible" title="审计详情" width="760px">
    <div v-if="previewRow" class="preview-grid">
      <div class="preview-meta">
        <div
          ><strong>动作：</strong>{{ actionLabelMap[previewRow.action] || previewRow.action }}</div
        >
        <div
          ><strong>对象：</strong
          >{{ targetTypeLabelMap[previewRow.target_type] || previewRow.target_type }} #{{
            previewRow.target_id
          }}</div
        >
        <div><strong>结果：</strong>{{ previewRow.status }}</div>
        <div><strong>说明：</strong>{{ previewRow.detail || '-' }}</div>
        <div><strong>IP：</strong>{{ previewRow.ip_address || '-' }}</div>
        <div><strong>UA：</strong>{{ previewRow.user_agent || '-' }}</div>
      </div>

      <div class="preview-columns">
        <section class="preview-panel">
          <h3>变更前</h3>
          <pre>{{ formatJSON(previewRow.before_data) }}</pre>
        </section>
        <section class="preview-panel">
          <h3>变更后</h3>
          <pre>{{ formatJSON(previewRow.after_data) }}</pre>
        </section>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'

interface AuditLogRow {
  id: number
  admin_user_id: number
  admin_username: string
  action: string
  target_type: string
  target_id: number
  status: string
  detail: string
  ip_address: string
  user_agent: string
  before_data: string
  after_data: string
  created_at: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const previewVisible = ref(false)
const previewRow = ref<AuditLogRow | null>(null)
const rows = ref<AuditLogRow[]>([])
const filters = reactive({
  keyword: '',
  action: '',
  target_type: '',
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
  'admin_user.login_ip_blocked': 'IP 白名单拦截',
  'admin_user.create': '管理员创建',
  'admin_user.password_reset': '管理员重置密码',
  'admin_user.2fa_setup': '管理员发起 2FA 配置',
  'admin_user.2fa_enable': '管理员开启 2FA',
  'admin_user.2fa_disable': '管理员关闭 2FA',
  'admin_user.2fa_reset': '管理员重置 2FA',
  'admin_role.create': '角色创建',
  'admin_role.update': '角色更新',
  'user.update': '用户更新',
  'game.update': '游戏更新',
  'game_tag.create': '标签创建',
  'game_tag.update': '标签更新',
  'game_tag.delete': '标签删除',
  'vendor.update': '供应商更新',
  'platform_switch.update': '运营开关更新'
}

const targetTypeLabelMap: Record<string, string> = {
  admin_user: '管理员',
  admin_role: '角色',
  user: '用户',
  game: '游戏',
  game_tag: '游戏标签',
  vendor: '供应商',
  platform_switch: '运营开关'
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
    if (filters.target_type) {
      params.target_type = filters.target_type
    }
    if (filters.status) {
      params.status = filters.status
    }

    const { data } = await http.get<{ data: AuditLogRow[]; pagination: Pagination }>(
      '/admin/audit/logs',
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
  filters.target_type = ''
  filters.status = ''
  pagination.page = 1
  pagination.page_size = 20
  void loadLogs()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadLogs()
}

function openPreview(row: AuditLogRow) {
  previewRow.value = row
  previewVisible.value = true
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

function formatJSON(value: string) {
  if (!value) {
    return '-'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
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
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(160px, 200px));
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

.preview-grid {
  display: grid;
  gap: 18px;
}

.preview-meta {
  display: grid;
  line-height: 1.6;
  color: #334155;
  gap: 8px;
}

.preview-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.preview-panel {
  padding: 16px;
  background: #f8fafc;
  border-radius: 18px;
}

.preview-panel h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #0f172a;
}

.preview-panel pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
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

  .preview-columns {
    grid-template-columns: 1fr;
  }
}
</style>
