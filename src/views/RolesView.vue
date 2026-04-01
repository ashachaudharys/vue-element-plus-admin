<template>
  <div class="page-stack">
    <el-alert
      title="系统内置角色会在启动时自动校正，当前页面仅支持新建和编辑自定义角色。"
      type="info"
      :closable="false"
      class="page-alert"
    />

    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <span>角色权限</span>
          <div class="header-actions">
            <el-button v-if="canManageAdmins" type="primary" @click="openCreateDialog"
              >新建角色</el-button
            >
            <el-button type="primary" plain @click="loadData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="rows" stripe v-loading="loading">
        <el-table-column prop="name" label="角色名" min-width="160" />
        <el-table-column prop="code" label="编码" min-width="180" />
        <el-table-column label="类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.is_system ? 'warning' : 'success'">
              {{ row.is_system ? '系统内置' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" min-width="90" />
        <el-table-column label="权限数" min-width="100">
          <template #default="{ row }">
            {{ row.permissions.length }}
          </template>
        </el-table-column>
        <el-table-column label="数据范围" min-width="180">
          <template #default="{ row }">
            <el-tag v-if="row.vendor_scopes.length === 0" type="success">全平台</el-tag>
            <span v-else>{{ row.vendor_scopes.length }} 个供应商</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="更新时间" min-width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openPreviewDialog(row)">查看</el-button>
            <el-button
              v-if="canManageAdmins && !row.is_system"
              type="warning"
              link
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <span v-else-if="!canManageAdmins" class="text-muted">只读</span>
            <span v-else class="text-muted">系统内置</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <el-dialog v-model="previewVisible" title="角色详情" width="860px">
    <div v-if="previewRole" class="preview-stack">
      <div class="meta-grid">
        <div><strong>角色名：</strong>{{ previewRole.name }}</div>
        <div><strong>编码：</strong>{{ previewRole.code }}</div>
        <div><strong>类型：</strong>{{ previewRole.is_system ? '系统内置' : '自定义' }}</div>
        <div><strong>状态：</strong>{{ previewRole.status === 1 ? '启用' : '停用' }}</div>
        <div><strong>排序：</strong>{{ previewRole.sort_order }}</div>
        <div><strong>说明：</strong>{{ previewRole.description || '-' }}</div>
        <div>
          <strong>数据范围：</strong>
          {{
            previewRole.vendor_scopes.length === 0 ? '全平台' : previewRole.vendor_scopes.join('、')
          }}
        </div>
      </div>

      <div class="permission-groups">
        <section v-for="group in permissionGroups" :key="group.group" class="permission-panel">
          <h3>{{ permissionGroupLabelMap[group.group] || group.group }}</h3>
          <div class="permission-tags">
            <el-tag
              v-for="permission in group.items"
              :key="permission.code"
              :type="previewRole.permissions.includes(permission.code) ? 'success' : 'info'"
              effect="plain"
            >
              {{ permission.name }}
            </el-tag>
          </div>
        </section>
      </div>
    </div>
  </el-dialog>

  <el-dialog v-model="createVisible" title="新建角色" width="860px">
    <el-form label-position="top" class="role-form">
      <div class="form-grid">
        <el-form-item label="角色名">
          <el-input v-model.trim="createForm.name" placeholder="例如：财务审核员" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model.trim="createForm.code" placeholder="例如：finance_auditor" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="createForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="createForm.sort_order" :min="-999" :max="999" />
        </el-form-item>
      </div>
      <el-form-item label="说明">
        <el-input
          v-model.trim="createForm.description"
          type="textarea"
          :rows="2"
          placeholder="简要说明这个角色面向谁、能做什么"
        />
      </el-form-item>
      <el-form-item label="供应商数据范围">
        <el-select
          v-model="createForm.vendor_scopes"
          multiple
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
          placeholder="留空表示全平台可见"
        >
          <el-option
            v-for="vendor in scopeVendorOptions"
            :key="vendor.code"
            :label="`${vendor.name} (${vendor.code})`"
            :value="vendor.code"
          />
        </el-select>
        <div class="scope-hint"
          >选择后，用户、钱包、游戏、供应商、审计日志都会自动收敛到这些供应商。</div
        >
      </el-form-item>
      <div class="permission-groups">
        <section v-for="group in permissionGroups" :key="group.group" class="permission-panel">
          <div class="permission-panel-header">
            <h3>{{ permissionGroupLabelMap[group.group] || group.group }}</h3>
            <el-button
              link
              type="primary"
              @click="toggleGroupPermissions(createForm.permissions, group.codes)"
            >
              快速切换
            </el-button>
          </div>
          <el-checkbox-group v-model="createForm.permissions" class="permission-checkboxes">
            <el-checkbox
              v-for="permission in group.items"
              :key="permission.code"
              :label="permission.code"
            >
              <div class="permission-copy">
                <span>{{ permission.name }}</span>
                <small>{{ permission.description }}</small>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </section>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建角色</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="editVisible" title="编辑角色" width="860px">
    <el-form label-position="top" class="role-form">
      <div class="form-grid">
        <el-form-item label="角色名">
          <el-input v-model.trim="editForm.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input :model-value="editingRole?.code || ''" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort_order" :min="-999" :max="999" />
        </el-form-item>
      </div>
      <el-form-item label="说明">
        <el-input
          v-model.trim="editForm.description"
          type="textarea"
          :rows="2"
          placeholder="请输入角色说明"
        />
      </el-form-item>
      <el-form-item label="供应商数据范围">
        <el-select
          v-model="editForm.vendor_scopes"
          multiple
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
          placeholder="留空表示全平台可见"
        >
          <el-option
            v-for="vendor in scopeVendorOptions"
            :key="vendor.code"
            :label="`${vendor.name} (${vendor.code})`"
            :value="vendor.code"
          />
        </el-select>
        <div class="scope-hint">留空时角色不受供应商范围限制。</div>
      </el-form-item>
      <div class="permission-groups">
        <section v-for="group in permissionGroups" :key="group.group" class="permission-panel">
          <div class="permission-panel-header">
            <h3>{{ permissionGroupLabelMap[group.group] || group.group }}</h3>
            <el-button
              link
              type="primary"
              @click="toggleGroupPermissions(editForm.permissions, group.codes)"
            >
              快速切换
            </el-button>
          </div>
          <el-checkbox-group v-model="editForm.permissions" class="permission-checkboxes">
            <el-checkbox
              v-for="permission in group.items"
              :key="permission.code"
              :label="permission.code"
            >
              <div class="permission-copy">
                <span>{{ permission.name }}</span>
                <small>{{ permission.description }}</small>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </section>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="submitEdit">保存角色</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, ref } from 'vue'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface RoleRow {
  id: number
  name: string
  code: string
  description: string
  status: number
  is_system: boolean
  sort_order: number
  permissions: string[]
  vendor_scopes: string[]
  created_at: string
  updated_at: string
}

interface PermissionRow {
  code: string
  name: string
  group: string
  description: string
}

interface ScopeVendorOption {
  code: string
  name: string
  status: number
}

type RoleFormState = {
  name: string
  code: string
  description: string
  status: number
  sort_order: number
  permissions: string[]
  vendor_scopes: string[]
}

const session = useAdminSessionStore()
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const createVisible = ref(false)
const editVisible = ref(false)
const previewVisible = ref(false)
const rows = ref<RoleRow[]>([])
const permissionCatalog = ref<PermissionRow[]>([])
const scopeVendorOptions = ref<ScopeVendorOption[]>([])
const editingRole = ref<RoleRow | null>(null)
const previewRole = ref<RoleRow | null>(null)

const createForm = ref<RoleFormState>(createEmptyRoleForm())
const editForm = ref<RoleFormState>(createEmptyRoleForm())
const canManageAdmins = computed(() => session.hasPermission('admins.manage'))

const permissionGroups = computed(() => {
  const grouped = new Map<string, PermissionRow[]>()

  for (const item of permissionCatalog.value) {
    const items = grouped.get(item.group) || []
    items.push(item)
    grouped.set(item.group, items)
  }

  return Array.from(grouped.entries()).map(([group, items]) => ({
    group,
    items,
    codes: items.map((item) => item.code)
  }))
})

const permissionGroupLabelMap: Record<string, string> = {
  dashboard: '概览',
  admins: '管理员',
  users: '用户',
  games: '游戏',
  operations: '运营编排',
  wallet_logs: '钱包日志',
  providers: '供应商',
  audit_logs: '审计',
  observability: '可观测性'
}

onMounted(() => {
  void loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [rolesResponse, permissionResponse, scopeVendorResponse] = await Promise.all([
      http.get<{ data: RoleRow[] }>('/admin/admin-roles', { params: { include_disabled: true } }),
      http.get<{ data: PermissionRow[] }>('/admin/admin-permissions'),
      http.get<{ data: ScopeVendorOption[] }>('/admin/scope-vendors')
    ])

    rows.value = rolesResponse.data.data
    permissionCatalog.value = permissionResponse.data.data
    scopeVendorOptions.value = scopeVendorResponse.data.data
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  createForm.value = createEmptyRoleForm()
  createVisible.value = true
}

function openEditDialog(row: RoleRow) {
  editingRole.value = row
  editForm.value = {
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
    sort_order: row.sort_order,
    permissions: [...row.permissions],
    vendor_scopes: [...row.vendor_scopes]
  }
  editVisible.value = true
}

function openPreviewDialog(row: RoleRow) {
  previewRole.value = row
  previewVisible.value = true
}

async function submitCreate() {
  if (!validateRoleForm(createForm.value, true)) {
    return
  }

  creating.value = true
  try {
    await http.post('/admin/admin-roles', {
      name: createForm.value.name,
      code: createForm.value.code,
      description: createForm.value.description,
      status: createForm.value.status,
      sort_order: createForm.value.sort_order,
      permissions: createForm.value.permissions,
      vendor_scopes: createForm.value.vendor_scopes
    })
    ElMessage.success('角色已创建')
    createVisible.value = false
    await loadData()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

async function submitEdit() {
  if (!editingRole.value) {
    return
  }
  if (!validateRoleForm(editForm.value, false)) {
    return
  }

  updating.value = true
  try {
    await http.put(`/admin/admin-roles/${editingRole.value.id}`, {
      name: editForm.value.name,
      description: editForm.value.description,
      status: editForm.value.status,
      sort_order: editForm.value.sort_order,
      permissions: editForm.value.permissions,
      vendor_scopes: editForm.value.vendor_scopes
    })
    ElMessage.success('角色已更新')
    editVisible.value = false
    await loadData()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

function validateRoleForm(form: RoleFormState, validateCode: boolean) {
  if (form.name.trim().length < 2) {
    ElMessage.error('角色名至少需要 2 个字符')
    return false
  }
  if (validateCode && !/^[a-z][a-z0-9_]{2,63}$/.test(form.code.trim())) {
    ElMessage.error('角色编码只支持小写字母、数字和下划线，且至少 3 位')
    return false
  }
  if (form.permissions.length === 0) {
    ElMessage.error('请至少选择一个权限')
    return false
  }

  return true
}

function toggleGroupPermissions(target: string[], groupCodes: string[]) {
  const everySelected = groupCodes.every((code) => target.includes(code))
  if (everySelected) {
    const nextCodes = target.filter((code) => !groupCodes.includes(code))
    target.splice(0, target.length, ...nextCodes)
    return
  }

  const nextCodes = new Set([...target, ...groupCodes])
  target.splice(0, target.length, ...Array.from(nextCodes).sort())
}

function createEmptyRoleForm(): RoleFormState {
  return {
    name: '',
    code: '',
    description: '',
    status: 1,
    sort_order: 0,
    permissions: [],
    vendor_scopes: []
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
  gap: 18px;
}

.page-alert,
.page-card {
  border-radius: 24px;
}

.card-header,
.header-actions,
.dialog-actions,
.permission-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-stack,
.permission-groups {
  display: grid;
  gap: 18px;
}

.meta-grid,
.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.role-form {
  display: grid;
  gap: 18px;
}

.permission-panel {
  padding: 18px;
  background: #f8fbff;
  border: 1px solid #dbe7f3;
  border-radius: 18px;
}

.permission-panel h3 {
  margin: 0;
  font-size: 16px;
}

.permission-checkboxes {
  display: grid;
  gap: 12px;
}

.permission-copy {
  display: grid;
  gap: 4px;
}

.permission-copy small {
  color: #64748b;
}

.scope-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.text-muted {
  color: #94a3b8;
}

@media (width <= 900px) {
  .meta-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
