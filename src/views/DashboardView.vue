<template>
  <div class="dashboard-grid">
    <el-card v-for="item in cards" :key="item.label" shadow="hover" class="metric-card admin-panel">
      <div class="metric-label">{{ item.label }}</div>
      <div class="metric-value">{{ item.value }}</div>
      <div class="metric-hint">{{ item.hint }}</div>
    </el-card>

    <el-card shadow="never" class="wide-card admin-panel">
      <template #header>
        <div class="card-header">
          <span>管理员安全中心</span>
          <el-tag :type="session.user?.two_factor_enabled ? 'success' : 'warning'">
            {{ session.user?.two_factor_enabled ? '2FA 已开启' : '建议立即开启 2FA' }}
          </el-tag>
        </div>
      </template>

      <div class="security-card">
        <div>
          <div class="metric-value security-title">
            {{ session.user?.two_factor_enabled ? '动态验证码保护已生效' : '账号仍在单因子登录' }}
          </div>
          <div class="metric-hint">
            开启后，后台登录会在用户名密码之外要求输入身份验证器动态码，能明显降低密码泄露后的接管风险。
          </div>
          <div class="security-meta">
            当前账号：{{ session.user?.username || '-' }}
            <template v-if="session.user?.two_factor_enabled_at">
              · 启用时间 {{ formatTime(session.user?.two_factor_enabled_at) }}
            </template>
          </div>
        </div>
        <div class="security-actions">
          <el-button
            v-if="!session.user?.two_factor_enabled"
            type="primary"
            :loading="setupLoading"
            @click="openTwoFactorSetup"
          >
            配置 2FA
          </el-button>
          <el-button v-else type="danger" plain @click="disableVisible = true">关闭 2FA</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="wide-card admin-panel">
      <template #header>
        <div class="card-header">
          <span>架构方向</span>
          <el-tag type="success">扩展中</el-tag>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item timestamp="阶段 1" type="primary">
          Vue 3 用户端 / 后台壳 + Go Gin API + GM-Ag 钱包统一
        </el-timeline-item>
        <el-timeline-item timestamp="阶段 2" type="success">
          gRPC 服务拆分、ClickHouse 分析链路、日志统一采集
        </el-timeline-item>
        <el-timeline-item timestamp="阶段 3" type="warning">
          微信小程序 WebView、TG Mini App、活动系统与推广系统
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>

  <el-dialog v-model="setupVisible" title="配置管理员 2FA" width="520px">
    <div v-if="setupData" class="two-factor-panel">
      <div class="qr-wrap">
        <img :src="qrCodeDataUrl" alt="2FA QR Code" />
      </div>
      <el-alert
        title="请使用 Google Authenticator、Microsoft Authenticator 或 1Password 扫码后，再输入当前 6 位动态码完成绑定。"
        type="info"
        :closable="false"
      />
      <div class="manual-secret">
        <div class="secret-label">手动录入密钥</div>
        <code>{{ setupData.manual_entry }}</code>
      </div>
      <el-form label-position="top">
        <el-form-item label="动态验证码">
          <el-input v-model="setupCode" maxlength="6" placeholder="请输入 6 位动态码" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="closeSetupDialog">取消</el-button>
        <el-button type="primary" :loading="enabling" @click="enableTwoFactor">确认启用</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="disableVisible" title="关闭管理员 2FA" width="460px">
    <el-alert
      title="关闭后，该账号将恢复为用户名 + 密码登录。建议仅在设备丢失或更换验证器时临时操作。"
      type="warning"
      :closable="false"
      class="dialog-alert"
    />
    <el-form label-position="top">
      <el-form-item label="当前密码">
        <el-input
          v-model="disableForm.password"
          type="password"
          show-password
          placeholder="请输入当前密码"
        />
      </el-form-item>
      <el-form-item label="当前动态验证码">
        <el-input v-model="disableForm.code" maxlength="6" placeholder="请输入 6 位动态码" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="closeDisableDialog">取消</el-button>
        <el-button type="danger" :loading="disabling" @click="disableTwoFactor">确认关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus/es/components/message/index'
import QRCode from 'qrcode'
import { computed, onMounted, ref } from 'vue'

import { http } from '@/lib/http'
import type { AdminUser } from '@/stores/session'
import { useAdminSessionStore } from '@/stores/session'

interface Overview {
  users: number
  admin_users: number
  vendors: number
  games: number
  active_sessions: number
  wallet_logs: number
  audit_logs: number
}

interface TwoFactorSetupData {
  secret: string
  manual_entry: string
  otpauth_url: string
  account_name: string
  issuer: string
}

const overview = ref<Overview>({
  users: 0,
  admin_users: 0,
  vendors: 0,
  games: 0,
  active_sessions: 0,
  wallet_logs: 0,
  audit_logs: 0
})
const session = useAdminSessionStore()
const setupLoading = ref(false)
const setupVisible = ref(false)
const setupCode = ref('')
const enabling = ref(false)
const disableVisible = ref(false)
const disabling = ref(false)
const setupData = ref<TwoFactorSetupData | null>(null)
const qrCodeDataUrl = ref('')
const disableForm = ref({
  password: '',
  code: ''
})

const cards = computed(() => [
  { label: '用户数', value: String(overview.value.users), hint: '平台账户总量' },
  { label: '管理员', value: String(overview.value.admin_users), hint: '拥有后台权限的账号' },
  { label: '供应商', value: String(overview.value.vendors), hint: '当前启用的接入方' },
  { label: '游戏数', value: String(overview.value.games), hint: '已同步到大厅的游戏' },
  {
    label: '活跃会话',
    value: String(overview.value.active_sessions),
    hint: '正在进行中的游戏会话'
  },
  { label: '审计日志', value: String(overview.value.audit_logs), hint: '后台敏感操作留痕记录' }
])

onMounted(async () => {
  const { data } = await http.get<{ data: Overview }>('/admin/overview')
  overview.value = data.data
})

async function openTwoFactorSetup() {
  setupLoading.value = true
  try {
    const { data } = await http.post<{ data: TwoFactorSetupData }>('/admin/auth/2fa/setup')
    setupData.value = data.data
    qrCodeDataUrl.value = await QRCode.toDataURL(data.data.otpauth_url, {
      width: 220,
      margin: 1
    })
    setupCode.value = ''
    setupVisible.value = true
  } finally {
    setupLoading.value = false
  }
}

async function enableTwoFactor() {
  if (!setupData.value) {
    return
  }

  enabling.value = true
  try {
    const { data } = await http.post<{ data: AdminUser }>('/admin/auth/2fa/enable', {
      code: setupCode.value
    })
    session.setUser(data.data || null)
    setupVisible.value = false
    setupData.value = null
    qrCodeDataUrl.value = ''
    setupCode.value = ''
    ElMessage.success('管理员 2FA 已开启，下次登录需要输入动态验证码')
  } finally {
    enabling.value = false
  }
}

async function disableTwoFactor() {
  disabling.value = true
  try {
    const { data } = await http.post<{ data: AdminUser }>('/admin/auth/2fa/disable', {
      password: disableForm.value.password,
      code: disableForm.value.code
    })
    session.setUser(data.data || null)
    closeDisableDialog()
    ElMessage.success('管理员 2FA 已关闭')
  } finally {
    disabling.value = false
  }
}

function closeSetupDialog() {
  setupVisible.value = false
  setupCode.value = ''
  setupData.value = null
  qrCodeDataUrl.value = ''
}

function closeDisableDialog() {
  disableVisible.value = false
  disableForm.value.password = ''
  disableForm.value.code = ''
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
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  border-radius: 24px;
}

.metric-label {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #7b8778;
  text-transform: uppercase;
}

.metric-value {
  margin-top: 14px;
  font-size: 34px;
  font-weight: 700;
  color: #1c2b1f;
}

.metric-hint {
  margin-top: 10px;
  line-height: 1.7;
  color: #677465;
}

.wide-card {
  grid-column: span 3;
  border-radius: 26px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.security-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 6px 0 2px;
}

.security-title {
  font-size: 28px;
}

.security-meta {
  margin-top: 16px;
  font-size: 13px;
  color: #6e7a6d;
}

.security-actions {
  display: flex;
  align-items: center;
}

.two-factor-panel {
  display: grid;
  gap: 18px;
}

.qr-wrap {
  display: flex;
  justify-content: center;
}

.qr-wrap img {
  width: 220px;
  height: 220px;
  padding: 12px;
  background: #fff;
  border-radius: 24px;
}

.manual-secret {
  padding: 14px 16px;
  background: #f7f3e6;
  border-radius: 18px;
}

.secret-label {
  margin-bottom: 8px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #8a7c55;
  text-transform: uppercase;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-alert {
  margin-bottom: 16px;
}
</style>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.metric-card {
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
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.wide-card {
  grid-column: 1 / -1;
  border-radius: 28px;
}

.security-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.security-title {
  margin-top: 0;
}

.security-meta {
  margin-top: 12px;
  font-size: 13px;
  color: #475569;
}

.security-actions {
  display: flex;
  align-items: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.two-factor-panel {
  display: grid;
  gap: 16px;
}

.qr-wrap {
  display: flex;
  justify-content: center;
}

.qr-wrap img {
  width: 220px;
  height: 220px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.manual-secret {
  display: grid;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 16px;
  gap: 8px;
}

.secret-label {
  font-size: 12px;
  color: #64748b;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-alert {
  margin-bottom: 16px;
}

@media (width <= 900px) {
  .security-card {
    display: grid;
  }
}
</style>
