<template>
  <div class="page-stack">
    <el-alert
      title="管理员密码重置后会立即使该账号的后台会话失效，下一次操作需要重新登录。"
      type="warning"
      :closable="false"
      class="page-alert"
    />

    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">后台账号</div>
            <div class="card-subtitle">
              展示后台用户名、所属角色、MFA 状态和最后登录时间，支持一键禁用或启用。
            </div>
          </div>
          <div class="header-actions">
            <el-button v-if="canManageAdmins" type="primary" @click="openCreateDialog"
              >新增管理账号</el-button
            >
            <el-button type="primary" plain @click="applyFilters">查询</el-button>
            <el-button plain @click="resetFilters">重置</el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model.trim="filters.keyword"
          placeholder="搜索管理员用户名或 UID"
          clearable
          @keyup.enter="applyFilters"
        />
        <el-select v-model="filters.status" clearable placeholder="状态">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
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
        <el-table-column prop="username" label="后台用户名" min-width="160" />
        <el-table-column prop="role_name" label="所属角色" min-width="160" />
        <el-table-column prop="uid" label="操作员 ID" min-width="220" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="MFA 状态" min-width="180">
          <template #default="{ row }">
            <el-tag :type="row.two_factor_enabled ? 'success' : 'warning'">
              {{ row.two_factor_enabled ? '已绑定' : '未绑定' }}
            </el-tag>
            <div class="security-copy" v-if="row.two_factor_enabled_at">
              启用时间 {{ formatTime(row.two_factor_enabled_at) }}
            </div>
            <div class="security-copy" v-if="row.locked_until">
              当前锁定至 {{ formatTime(row.locked_until) }}
            </div>
            <div class="security-copy">登录失败 {{ row.failed_login_attempts }} 次</div>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" min-width="180">
          <template #default="{ row }">
            {{ formatTime(row.last_login_at) }}
            <div class="security-copy">{{ row.last_login_ip || 'IP 未记录' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="canManageAdmins">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="warning" link @click="openPasswordDialog(row)">重置密码</el-button>
              <el-button
                :type="row.status === 1 ? 'danger' : 'success'"
                link
                @click="quickToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                v-if="row.two_factor_enabled"
                type="danger"
                link
                @click="resetTwoFactor(row)"
              >
                重置 2FA
              </el-button>
            </template>
            <span v-else class="text-muted">只读</span>
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
  </div>

  <el-dialog v-model="createVisible" title="新建管理员" width="480px">
    <el-form label-position="top">
      <el-form-item label="操作员 ID">
        <el-input v-model.trim="createForm.username" placeholder="请输入后台登录账号" />
      </el-form-item>
      <el-form-item label="初始密码">
        <el-input
          v-model="createForm.password"
          type="password"
          show-password
          placeholder="至少 6 位"
        />
      </el-form-item>
      <el-form-item label="功能权限组">
        <el-select v-model="createForm.role_id" placeholder="请选择角色">
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="createForm.status">
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="停用" />
        </el-select>
      </el-form-item>
      <el-form-item label="IP 白名单">
        <el-input
          v-model="createForm.allowed_ip_list"
          type="textarea"
          :rows="3"
          placeholder="单个 IP 或 CIDR，支持逗号或换行分隔；留空表示不限制"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="editVisible" title="编辑管理员" width="420px">
    <el-form label-position="top">
      <el-form-item label="后台用户名">
        <el-input :model-value="editingAdmin?.username || ''" disabled />
      </el-form-item>
      <el-form-item label="操作员 ID">
        <el-input :model-value="editingAdmin?.uid || ''" disabled />
      </el-form-item>
      <el-form-item label="功能权限组">
        <el-select v-model="editForm.role_id">
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status">
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="停用" />
        </el-select>
      </el-form-item>
      <el-form-item label="IP 白名单">
        <el-input
          v-model="editForm.allowed_ip_list"
          type="textarea"
          :rows="3"
          placeholder="单个 IP 或 CIDR，支持逗号或换行分隔；留空表示不限制"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="submitEdit">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="passwordVisible" title="重置管理员密码" width="480px">
    <el-form label-position="top">
      <el-form-item label="用户名">
        <el-input :model-value="passwordTarget?.username || ''" disabled />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input
          v-model="passwordForm.password"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="passwordForm.confirm_password"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="resettingPassword" @click="submitPasswordReset">
          重置密码
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface AdminRow {
  id: number
  username: string
  uid: string
  role_id: number
  role_name: string
  status: number
  failed_login_attempts: number
  locked_until: string | null
  two_factor_enabled: boolean
  two_factor_enabled_at: string | null
  allowed_ip_list: string
  last_login_ip: string
  last_login_at: string | null
  created_at: string
}

interface AdminRoleOption {
  id: number
  name: string
  code: string
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

const loading = ref(false)
const createVisible = ref(false)
const editVisible = ref(false)
const passwordVisible = ref(false)
const creating = ref(false)
const updating = ref(false)
const resettingPassword = ref(false)
const editingAdmin = ref<AdminRow | null>(null)
const passwordTarget = ref<AdminRow | null>(null)
const rows = ref<AdminRow[]>([])
const roleOptions = ref<AdminRoleOption[]>([])
const session = useAdminSessionStore()
const filters = reactive({
  keyword: '',
  status: undefined as number | undefined
})
const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})
const createForm = reactive({
  username: '',
  password: '',
  role_id: undefined as number | undefined,
  status: 1,
  allowed_ip_list: ''
})
const editForm = reactive({
  role_id: undefined as number | undefined,
  status: 1,
  allowed_ip_list: ''
})
const passwordForm = reactive({
  password: '',
  confirm_password: ''
})
const canManageAdmins = computed(() => session.hasPermission('admins.manage'))

onMounted(() => {
  void Promise.all([loadRoles(), loadAdmins()])
})

async function loadAdmins() {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (filters.keyword) {
      params.keyword = filters.keyword
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }

    const { data } = await http.get<{ data: AdminRow[]; pagination: Pagination }>(
      '/admin/admin-users',
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

async function loadRoles() {
  const { data } = await http.get<{ data: AdminRoleOption[] }>('/admin/admin-roles')
  roleOptions.value = data.data
}

function applyFilters() {
  pagination.page = 1
  void loadAdmins()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = undefined
  pagination.page = 1
  pagination.page_size = 20
  void loadAdmins()
}

function handlePageChange(page: number) {
  pagination.page = page
  void loadAdmins()
}

function handlePageSizeChange() {
  pagination.page = 1
  void loadAdmins()
}

function openCreateDialog() {
  createForm.username = ''
  createForm.password = ''
  createForm.role_id = roleOptions.value[0]?.id
  createForm.status = 1
  createForm.allowed_ip_list = ''
  createVisible.value = true
}

function openEditDialog(row: AdminRow) {
  editingAdmin.value = row
  editForm.role_id = row.role_id
  editForm.status = row.status
  editForm.allowed_ip_list = row.allowed_ip_list || ''
  editVisible.value = true
}

function openPasswordDialog(row: AdminRow) {
  passwordTarget.value = row
  passwordForm.password = ''
  passwordForm.confirm_password = ''
  passwordVisible.value = true
}

async function submitCreate() {
  creating.value = true
  try {
    await http.post('/admin/admin-users', {
      username: createForm.username,
      password: createForm.password,
      role_id: createForm.role_id,
      status: createForm.status,
      allowed_ip_list: createForm.allowed_ip_list
    })
    ElMessage.success('管理员账号已创建')
    createVisible.value = false
    pagination.page = 1
    await loadAdmins()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

async function submitEdit() {
  if (!editingAdmin.value) {
    return
  }

  updating.value = true
  try {
    await http.put(`/admin/admin-users/${editingAdmin.value.id}`, {
      role_id: editForm.role_id,
      status: editForm.status,
      allowed_ip_list: editForm.allowed_ip_list
    })
    ElMessage.success('管理员状态已更新')
    editVisible.value = false
    await loadAdmins()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

async function quickToggleStatus(row: AdminRow) {
  await updateAdminStatus(row, row.status === 1 ? 0 : 1)
}

async function submitPasswordReset() {
  if (!passwordTarget.value) {
    return
  }

  if (passwordForm.password.length < 6) {
    ElMessage.error('新密码至少需要 6 位')
    return
  }

  if (passwordForm.password !== passwordForm.confirm_password) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }

  resettingPassword.value = true
  try {
    await http.put(`/admin/admin-users/${passwordTarget.value.id}/password`, {
      password: passwordForm.password
    })
    ElMessage.success('管理员密码已重置')
    passwordVisible.value = false
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '重置失败')
  } finally {
    resettingPassword.value = false
  }
}

async function resetTwoFactor(row: AdminRow) {
  if (!canManageAdmins.value) {
    return
  }

  loading.value = true
  try {
    await http.put(`/admin/admin-users/${row.id}/2fa/reset`)
    ElMessage.success(`已重置 ${row.username} 的 2FA，并使其后台会话失效`)
    await loadAdmins()
  } finally {
    loading.value = false
  }
}

async function updateAdminStatus(row: AdminRow, status: number) {
  loading.value = true
  try {
    await http.put(`/admin/admin-users/${row.id}`, {
      role_id: row.role_id,
      status,
      allowed_ip_list: row.allowed_ip_list || ''
    })
    ElMessage.success(status === 1 ? '后台账号已启用' : '后台账号已禁用')
    await loadAdmins()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    loading.value = false
  }
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
    minute: '2-digit'
  }).format(new Date(value))
}
</script>

<style scoped>
.page-stack {
  display: grid;
  gap: 16px;
}

.page-alert {
  border-radius: 20px;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) repeat(2, minmax(140px, 180px));
  gap: 12px;
  margin-bottom: 18px;
}

.table-footer {
  display: flex;
  margin-top: 18px;
  align-items: center;
  justify-content: space-between;
}

.table-summary {
  font-size: 13px;
  color: #64748b;
}

.security-copy {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (width <= 900px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }
}
</style>
