<template>
  <div class="admin-frame">
    <div class="admin-shell frame-shell">
      <el-container style="min-height: calc(100vh - 24px)">
        <el-aside width="264px" class="admin-aside">
          <div class="brand-block">
            <p class="brand-caption">TKZC668后台</p>
            <h1>平台后台</h1>
            <p class="brand-subtitle">正式版控制台</p>
          </div>

          <div class="brand-summary">
            <div>
              <div class="summary-label">登录账号</div>
              <div class="summary-value">{{ session.user?.username || '管理员' }}</div>
            </div>
            <div>
              <div class="summary-label">角色</div>
              <div class="summary-value">{{
                session.user?.role_name || (session.user?.role === 'admin' ? 'Admin' : 'Guest')
              }}</div>
            </div>
          </div>

          <el-menu :default-active="route.path" router class="menu-panel">
            <el-menu-item v-for="item in visibleMenuItems" :key="item.path" :index="item.path">
              {{ item.label }}
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-container>
          <el-header class="admin-header">
            <div>
              <div class="header-title">{{ pageTitle }}</div>
              <div class="header-subtitle">统一日志、统一钱包、可扩展游戏平台后台</div>
            </div>

            <div class="header-actions">
              <span class="capsule-tag capsule-green">Gin + gRPC</span>
              <span class="capsule-tag capsule-blue">Vue 3 + TS</span>
              <span class="capsule-tag capsule-gold">{{
                session.user?.role_name || (session.user?.role === 'admin' ? 'Admin' : 'Guest')
              }}</span>
              <el-dropdown @command="handleCommand">
                <span class="admin-user">
                  {{ session.user?.username || '管理员' }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>

          <el-main class="admin-main">
            <RouterView />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'

import { useAdminSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useAdminSessionStore()

const menuItems = [
  { path: '/dashboard', label: '概览面板', permission: 'dashboard.view' },
  { path: '/admins', label: '管理员账号', permission: 'admins.view' },
  { path: '/roles', label: '角色权限', permission: 'admins.view' },
  { path: '/users', label: '用户中心', permission: 'users.view' },
  { path: '/games', label: '游戏管理', permission: 'games.view' },
  { path: '/operations', label: '运营编排', permission: 'operations.view' },
  { path: '/wallet-logs', label: '钱包日志', permission: 'wallet_logs.view' },
  { path: '/providers', label: '供应商管理', permission: 'providers.view' },
  { path: '/login-logs', label: '登录日志', permission: 'audit_logs.view' },
  { path: '/audit-logs', label: '审计日志', permission: 'audit_logs.view' },
  { path: '/observability', label: '可观测性', permission: 'observability.view' }
]

const titleMap: Record<string, string> = Object.fromEntries(
  menuItems.map((item) => [item.path, item.label])
)

const pageTitle = computed(() => titleMap[route.path] || '平台后台')
const visibleMenuItems = computed(() =>
  menuItems.filter((item) => session.hasPermission(item.permission))
)

onMounted(async () => {
  try {
    await session.fetchMe()
    if (!session.isAdmin) {
      await session.logout()
      router.replace('/login')
    }
  } catch {
    await session.logout()
    router.replace('/login')
  }
})

async function handleCommand(command: string) {
  if (command === 'logout') {
    await session.logout()
    router.replace('/login')
  }
}
</script>

<style scoped>
.admin-frame {
  min-height: 100vh;
  padding: 12px;
}

.frame-shell {
  overflow: hidden;
  border-radius: 34px;
}

.admin-aside {
  padding: 18px;
  background: linear-gradient(180deg, #203528 0%, #233c2c 44%, #2b4935 100%);
}

.brand-block {
  padding: 18px 18px 22px;
  color: #fff;
}

.brand-block h1 {
  margin: 8px 0 0;
  font-size: 24px;
}

.brand-caption {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.28em;
  color: rgb(255 255 255 / 65%);
  text-transform: uppercase;
}

.brand-subtitle {
  margin: 10px 0 0;
  font-size: 13px;
  color: rgb(255 255 255 / 68%);
}

.brand-summary {
  display: grid;
  padding: 16px;
  margin: 0 12px 16px;
  color: #fff;
  background: rgb(255 255 255 / 8%);
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 22px;
  gap: 12px;
}

.summary-label {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgb(255 255 255 / 50%);
  text-transform: uppercase;
}

.summary-value {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 600;
}

.menu-panel {
  overflow: hidden;
  background: rgb(255 252 246 / 92%);
  border: none;
  border-radius: 24px;
}

.admin-header {
  display: flex;
  padding: 20px 28px;
  background: rgb(248 245 236 / 88%);
  border-bottom: 1px solid rgb(44 61 42 / 8%);
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(12px);
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #1b2b1f;
}

.header-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #6f7b6d;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.capsule-tag {
  display: inline-flex;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  align-items: center;
}

.capsule-green {
  color: #1e6a47;
  background: #e8f3eb;
}

.capsule-blue {
  color: #29557f;
  background: #e6eef7;
}

.capsule-gold {
  color: #8a651c;
  background: #fff0c7;
}

.admin-user {
  display: inline-flex;
  padding: 10px 14px;
  color: #fff;
  cursor: pointer;
  background: #1f3326;
  border-radius: 999px;
  align-items: center;
}

.admin-main {
  background: radial-gradient(circle at top right, rgb(213 161 45 / 8%), transparent 18%),
    radial-gradient(circle at top left, rgb(120 163 112 / 8%), transparent 22%), #f4f1e8;
}

:deep(.el-menu-item) {
  height: 46px;
  margin: 6px 10px;
  font-weight: 600;
  color: #5e6c5e;
  border-radius: 16px;
}

:deep(.el-menu-item.is-active) {
  color: #7d5b18;
  background: linear-gradient(180deg, #fff0c7 0%, #efd488 100%);
}
</style>
