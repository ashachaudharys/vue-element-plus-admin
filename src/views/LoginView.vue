<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-copy">
        <p class="caption">TKZC668后台</p>
        <h1>统一后台管理系统</h1>
        <p>
          已切到 `Vue 3 + TypeScript + Vite + Element
          Plus`，后续继续接用户管理、风控、财务、审计与数据看板。
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-label">安全能力</div>
            <div class="feature-value">2FA / 锁定 / IP 策略</div>
          </div>
          <div class="feature-card">
            <div class="feature-label">数据能力</div>
            <div class="feature-value">MySQL + ClickHouse</div>
          </div>
          <div class="feature-card">
            <div class="feature-label">运营能力</div>
            <div class="feature-value">活动 / 优惠 / 推荐位</div>
          </div>
        </div>
      </div>

      <el-card shadow="never" class="form-card admin-panel">
        <template #header>
          <div class="card-header">
            <span>管理员登录</span>
            <el-tag type="info">demo / 123456</el-tag>
          </div>
        </template>

        <el-form label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名">
            <el-input v-model="username" :disabled="session.loading" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              type="password"
              show-password
              :disabled="session.loading"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item v-if="requiresTwoFactor" label="动态验证码">
            <el-input
              v-model="otpCode"
              maxlength="6"
              :disabled="session.loading"
              placeholder="请输入 6 位动态码"
            />
            <div class="otp-hint">已验证用户名密码，请输入身份验证器中的 6 位动态码。</div>
          </el-form-item>
          <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" />
          <el-button
            type="primary"
            size="large"
            class="submit-button"
            :loading="session.loading"
            @click="submit"
          >
            进入后台
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus/es/components/notification/index'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAdminSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useAdminSessionStore()

const username = ref('demo')
const password = ref('123456')
const otpCode = ref('')
const errorMessage = ref('')
const requiresTwoFactor = ref(false)

onMounted(async () => {
  try {
    await session.fetchMe()
    if (session.isAuthenticated && session.isAdmin) {
      router.replace(resolveRedirect())
    }
  } catch {
    await session.logout()
  }
})

async function submit() {
  errorMessage.value = ''
  try {
    const result = await session.login(username.value, password.value, otpCode.value)
    if (result.securityAlerts.length > 0) {
      ElNotification({
        title: '登录安全提醒',
        type: 'warning',
        duration: 6000,
        message: result.securityAlerts.join('；')
      })
    }
    router.replace(resolveRedirect())
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 428 && error.response?.data?.code === 'two_factor_required') {
        requiresTwoFactor.value = true
        errorMessage.value = '该账号已开启 2FA，请输入动态验证码后继续登录。'
        return
      }
      errorMessage.value = error.response?.data?.error || error.message || '登录失败'
      return
    }
    errorMessage.value = '登录失败'
  }
}

function resolveRedirect() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 32px;
  background: radial-gradient(circle at top left, rgb(242 214 141 / 16%), transparent 22%),
    radial-gradient(circle at bottom right, rgb(126 170 112 / 18%), transparent 26%),
    linear-gradient(135deg, #1b2f21 0%, #264030 46%, #ecf0e3 100%);
  place-items: center;
}

.login-card {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  width: min(1080px, 100%);
  align-items: center;
}

.login-copy {
  color: #fff;
}

.caption {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.32em;
  color: rgb(255 255 255 / 66%);
  text-transform: uppercase;
}

.login-copy h1 {
  margin: 16px 0 14px;
  font-size: 54px;
  line-height: 1.1;
}

.login-copy p:last-child {
  max-width: 560px;
  font-size: 17px;
  line-height: 1.8;
  color: rgb(255 255 255 / 74%);
}

.form-card {
  border: none;
  border-radius: 28px;
}

.feature-grid {
  display: grid;
  max-width: 640px;
  margin-top: 28px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.feature-card {
  padding: 18px;
  background: rgb(255 255 255 / 8%);
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 22px;
}

.feature-label {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgb(255 255 255 / 56%);
  text-transform: uppercase;
}

.feature-value {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submit-button {
  width: 100%;
  margin-top: 20px;
}

.otp-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
