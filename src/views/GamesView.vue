<template>
  <div class="page-stack">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">运营开关</div>
            <div class="card-subtitle"
              >统一控制注册、大厅、游戏启动和钱包调账，后续接 TG / 小程序也可以沿用同一套开关。</div
            >
          </div>
        </div>
      </template>

      <div class="ops-grid">
        <div v-for="item in platformSwitches" :key="item.key" class="ops-item">
          <div class="ops-copy">
            <div class="ops-name">{{ item.name }}</div>
            <div class="ops-desc">{{ item.description }}</div>
          </div>
          <el-switch
            :model-value="item.enabled"
            :loading="switchSavingKey === item.key"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="togglePlatformSwitch(item, $event)"
          />
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">游戏管理</div>
            <div class="card-subtitle">统一维护游戏上架状态、维护开关、排序与标签归类。</div>
          </div>
          <div class="header-actions">
            <el-button type="primary" plain @click="applyGameFilters">查询</el-button>
            <el-button plain @click="resetGameFilters">重置</el-button>
          </div>
        </div>
      </template>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">当前页游戏</div>
          <div class="summary-value">{{ rows.length }}</div>
          <div class="summary-hint">按当前筛选条件返回</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">已上架</div>
          <div class="summary-value">{{ gameStats.online }}</div>
          <div class="summary-hint">当前页可展示游戏</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">维护中</div>
          <div class="summary-value">{{ gameStats.maintenance }}</div>
          <div class="summary-hint">需要重点关注</div>
        </div>
        <div class="summary-card" v-if="gameStats.providerCount > 0">
          <div class="summary-label">线路数</div>
          <div class="summary-value">{{ gameStats.providerCount }}</div>
          <div class="summary-hint">JDB / FG / CQ9 等</div>
        </div>
      </div>

      <div class="filter-bar">
        <el-input
          v-model.trim="gameFilters.keyword"
          placeholder="搜索游戏名 / 游戏代码 / 厂商 / 捕鱼线路"
          clearable
          @keyup.enter="applyGameFilters"
        />
        <el-select v-model="gameFilters.vendor_code" clearable placeholder="供应商">
          <el-option
            v-for="vendor in vendors"
            :key="vendor.id"
            :label="vendor.name"
            :value="vendor.vendor_code"
          />
        </el-select>
        <el-input
          v-model.trim="gameFilters.provider_code"
          placeholder="线路代码 / Provider"
          clearable
          @keyup.enter="applyGameFilters"
        />
        <el-select v-model="gameFilters.status" clearable placeholder="上架状态">
          <el-option label="已上架" :value="1" />
          <el-option label="已下架" :value="0" />
        </el-select>
        <el-select v-model="gameFilters.under_maintenance" clearable placeholder="维护状态">
          <el-option label="维护中" :value="true" />
          <el-option label="可进入" :value="false" />
        </el-select>
        <el-select v-model="gameFilters.tag_id" clearable placeholder="标签">
          <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
        <el-select
          v-model="pagination.page_size"
          placeholder="每页条数"
          @change="handleGamePageSizeChange"
        >
          <el-option :value="10" label="10 / 页" />
          <el-option :value="20" label="20 / 页" />
          <el-option :value="50" label="50 / 页" />
        </el-select>
      </div>

      <div v-if="selectedGameIds.length" class="bulk-bar">
        <div class="bulk-summary">已选中 {{ selectedGameIds.length }} 款游戏</div>
        <div class="bulk-actions">
          <el-button
            type="success"
            plain
            :loading="batchUpdating"
            @click="submitBatchUpdate({ status: 1 }, '已批量上架')"
            >批量上架</el-button
          >
          <el-button
            type="warning"
            plain
            :loading="batchUpdating"
            @click="submitBatchUpdate({ status: 0 }, '已批量下架')"
            >批量下架</el-button
          >
          <el-button
            type="warning"
            plain
            :loading="batchUpdating"
            @click="submitBatchUpdate({ under_maintenance: true }, '已批量设为维护')"
            >批量维护</el-button
          >
          <el-button
            type="success"
            plain
            :loading="batchUpdating"
            @click="submitBatchUpdate({ under_maintenance: false }, '已批量取消维护')"
            >取消维护</el-button
          >
          <el-button type="primary" plain :loading="batchUpdating" @click="openBatchTagDialog"
            >批量标签</el-button
          >
          <el-button plain @click="clearGameSelection">清空选择</el-button>
        </div>
      </div>

      <el-table
        ref="gameTableRef"
        :data="rows"
        stripe
        v-loading="gameLoading"
        @selection-change="handleGameSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="id" label="ID" min-width="80" />
        <el-table-column label="游戏" min-width="240">
          <template #default="{ row }">
            <div class="game-cell">
              <span class="game-name">{{ row.game_name }}</span>
              <span class="game-meta"
                >{{ row.game_code }} · {{ row.provider || row.vendor_code }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vendor_code" label="供应商" min-width="120" />
        <el-table-column label="厂商线路" min-width="190">
          <template #default="{ row }">
            <div class="game-cell">
              <span class="game-name">{{ row.upstream_vendor_name || row.provider || '-' }}</span>
              <span class="game-meta">{{
                row.provider_code || row.upstream_vendor_code || '-'
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="220">
          <template #default="{ row }">
            <div class="tag-list">
              <span
                v-for="tag in row.tags"
                :key="tag.id"
                class="color-chip"
                :style="{ '--chip-color': tag.color }"
              >
                {{ tag.name }}
              </span>
              <span v-if="!row.tags.length" class="muted-text">未设置</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" min-width="100">
          <template #default="{ row }">
            {{ row.sort_order }}
          </template>
        </el-table-column>
        <el-table-column label="上架状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="维护状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.under_maintenance ? 'warning' : 'success'">
              {{ row.under_maintenance ? '维护中' : '可进入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at || row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openGameDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              :loading="actionLoadingId === row.id && actionLoadingType === 'status'"
              @click="toggleGameStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button
              :type="row.under_maintenance ? 'success' : 'warning'"
              link
              :loading="actionLoadingId === row.id && actionLoadingType === 'maintenance'"
              @click="toggleGameMaintenance(row)"
            >
              {{ row.under_maintenance ? '取消维护' : '设为维护' }}
            </el-button>
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
          @current-change="handleGamePageChange"
        />
      </div>
    </el-card>

    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <div>
            <div class="card-title">标签维护</div>
            <div class="card-subtitle">给运营保留独立标签表，后面接活动页和小程序时可复用。</div>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="openTagDialog()">新建标签</el-button>
            <el-button type="primary" plain @click="applyTagFilters">查询</el-button>
            <el-button plain @click="resetTagFilters">重置</el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar tag-filter-bar">
        <el-input
          v-model.trim="tagFilters.keyword"
          placeholder="搜索标签名称或编码"
          clearable
          @keyup.enter="applyTagFilters"
        />
        <el-select v-model="tagFilters.status" clearable placeholder="状态">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </div>

      <el-table :data="tagRows" stripe v-loading="tagLoading">
        <el-table-column prop="id" label="ID" min-width="80" />
        <el-table-column label="标签" min-width="220">
          <template #default="{ row }">
            <div class="game-cell">
              <span class="game-name">{{ row.name }}</span>
              <span class="game-meta">{{ row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="颜色" min-width="140">
          <template #default="{ row }">
            <div class="color-preview">
              <span class="color-dot" :style="{ background: row.color }"></span>
              <span>{{ row.color }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" min-width="100">
          <template #default="{ row }">
            {{ row.sort_order }}
          </template>
        </el-table-column>
        <el-table-column label="使用游戏数" min-width="120">
          <template #default="{ row }">
            {{ row.game_count }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openTagDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              :loading="tagActionLoadingId === row.id"
              @click="toggleTagStatus(row)"
            >
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link :disabled="row.game_count > 0" @click="deleteTag(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <el-dialog v-model="gameDialogVisible" title="编辑游戏" width="640px">
    <el-form label-position="top">
      <div class="dialog-grid">
        <el-form-item label="游戏名称">
          <el-input v-model.trim="gameForm.game_name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="游戏代码">
          <el-input :model-value="editingGame?.game_code || ''" disabled />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input :model-value="editingGame?.vendor_code || ''" disabled />
        </el-form-item>
        <el-form-item label="厂商线路">
          <el-input :model-value="editingGameLineLabel" disabled />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="gameForm.sort_order" :min="0" :step="10" class="full-width" />
        </el-form-item>
      </div>

      <div class="dialog-grid">
        <el-form-item label="上架状态">
          <el-select v-model="gameForm.status">
            <el-option :value="1" label="已上架" />
            <el-option :value="0" label="已下架" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护状态">
          <el-select v-model="gameForm.under_maintenance">
            <el-option :value="false" label="可进入" />
            <el-option :value="true" label="维护中" />
          </el-select>
        </el-form-item>
        <el-form-item label="新游戏标记">
          <el-select v-model="gameForm.is_new">
            <el-option :value="true" label="显示 NEW" />
            <el-option :value="false" label="关闭 NEW" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="标签">
        <el-select v-model="gameForm.tag_ids" multiple clearable placeholder="请选择标签">
          <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
        <div class="field-hint"
          >标签来自统一标签表，后续 H5 / 小程序 / TG Mini App 都可以复用。</div
        >
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="gameDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingGame" @click="submitGameEdit">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="tagDialogVisible" :title="editingTag ? '编辑标签' : '新建标签'" width="520px">
    <el-form label-position="top">
      <el-form-item label="标签名称">
        <el-input v-model.trim="tagForm.name" placeholder="例如：热门推荐" />
      </el-form-item>
      <div class="dialog-grid">
        <el-form-item label="标签编码">
          <el-input v-model.trim="tagForm.code" placeholder="例如：featured" />
        </el-form-item>
        <el-form-item label="颜色值">
          <el-input v-model.trim="tagForm.color" placeholder="#f97316" />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="排序值">
          <el-input-number v-model="tagForm.sort_order" :min="0" class="full-width" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="tagForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
      </div>
      <div class="color-preview">
        <span class="color-dot" :style="{ background: normalizedTagColor }"></span>
        <span>预览颜色：{{ normalizedTagColor }}</span>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingTag" @click="submitTagForm">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="batchTagDialogVisible" title="批量设置标签" width="520px">
    <el-form label-position="top">
      <div class="dialog-note">
        会覆盖当前选中 {{ selectedGameIds.length }} 款游戏已有的标签配置。
      </div>
      <el-form-item label="标签">
        <el-select v-model="batchTagForm.tag_ids" multiple clearable placeholder="请选择标签">
          <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="batchTagDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchUpdating" @click="submitBatchTagUpdate"
          >保存</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElLoadingDirective as vLoading } from 'element-plus/es/components/loading/index'
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'

interface VendorOption {
  id: number
  name: string
  vendor_code: string
}

interface GameTagRow {
  id: number
  name: string
  code: string
  color: string
  sort_order: number
  status: number
  game_count: number
}

interface GameRow {
  id: number
  vendor_id: number
  provider: string
  provider_code: string
  vendor_code: string
  upstream_vendor_code: string
  upstream_vendor_name: string
  game_code: string
  game_name: string
  thumbnail: string
  type: number
  is_new: boolean
  under_maintenance: boolean
  sort_order: number
  status: number
  tags: GameTagRow[]
  created_at: string
  updated_at: string | null
}

interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

interface PlatformSwitchRow {
  key: string
  name: string
  description: string
  enabled: boolean
  sort_order: number
  updated_by: number
}

const gameLoading = ref(false)
const tagLoading = ref(false)
const savingGame = ref(false)
const savingTag = ref(false)
const batchUpdating = ref(false)
const gameDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const batchTagDialogVisible = ref(false)
const editingGame = ref<GameRow | null>(null)
const editingTag = ref<GameTagRow | null>(null)
const actionLoadingId = ref<number | null>(null)
const actionLoadingType = ref<'status' | 'maintenance' | ''>('')
const tagActionLoadingId = ref<number | null>(null)
const switchSavingKey = ref('')
const gameTableRef = ref<any>()
const rows = ref<GameRow[]>([])
const tagRows = ref<GameTagRow[]>([])
const allTags = ref<GameTagRow[]>([])
const vendors = ref<VendorOption[]>([])
const platformSwitches = ref<PlatformSwitchRow[]>([])
const selectedGameIds = ref<number[]>([])

const gameFilters = reactive({
  keyword: '',
  vendor_code: '',
  provider_code: '',
  status: undefined as number | undefined,
  under_maintenance: undefined as boolean | undefined,
  tag_id: undefined as number | undefined
})

const tagFilters = reactive({
  keyword: '',
  status: undefined as number | undefined
})

const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0
})

const gameForm = reactive({
  game_name: '',
  status: 1,
  under_maintenance: false,
  is_new: false,
  sort_order: 0,
  tag_ids: [] as number[]
})

const tagForm = reactive({
  name: '',
  code: '',
  color: '#0f172a',
  sort_order: 0,
  status: 1
})

const batchTagForm = reactive({
  tag_ids: [] as number[]
})

const normalizedTagColor = computed(() =>
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(tagForm.color)
    ? tagForm.color.toLowerCase()
    : '#0f172a'
)

const gameStats = computed(() => {
  const providerSet = new Set<string>()
  let online = 0
  let maintenance = 0
  for (const row of rows.value) {
    if (row.status === 1) {
      online += 1
    }
    if (row.under_maintenance) {
      maintenance += 1
    }
    const code = (row.provider_code || row.upstream_vendor_code || '').trim().toLowerCase()
    if (code) {
      providerSet.add(code)
    }
  }
  return {
    online,
    maintenance,
    providerCount: providerSet.size
  }
})

const editingGameLineLabel = computed(() => {
  if (!editingGame.value) {
    return ''
  }
  return [
    editingGame.value.upstream_vendor_name || editingGame.value.provider || '-',
    editingGame.value.provider_code || editingGame.value.upstream_vendor_code || '-'
  ].join(' · ')
})

onMounted(() => {
  void bootstrap()
})

async function bootstrap() {
  await Promise.all([loadVendors(), loadAllTags(), loadPlatformSwitches()])
  await Promise.all([loadGames(), loadTagRows()])
}

async function loadVendors() {
  const { data } = await http.get<{ data: VendorOption[] }>('/admin/vendors', {
    params: {
      page: 1,
      page_size: 100
    }
  })
  vendors.value = data.data
}

async function loadAllTags() {
  const { data } = await http.get<{ data: GameTagRow[] }>('/admin/game-tags')
  allTags.value = data.data
}

async function loadPlatformSwitches() {
  const { data } = await http.get<{ data: PlatformSwitchRow[] }>('/admin/ops-switches')
  platformSwitches.value = data.data
}

async function loadGames() {
  gameLoading.value = true
  try {
    const params: Record<string, string | number | boolean> = {
      page: pagination.page,
      page_size: pagination.page_size
    }

    if (gameFilters.keyword) {
      params.keyword = gameFilters.keyword
    }
    if (gameFilters.vendor_code) {
      params.vendor_code = gameFilters.vendor_code
    }
    if (gameFilters.provider_code) {
      params.provider_code = gameFilters.provider_code
    }
    if (gameFilters.status !== undefined) {
      params.status = gameFilters.status
    }
    if (gameFilters.under_maintenance !== undefined) {
      params.under_maintenance = gameFilters.under_maintenance
    }
    if (gameFilters.tag_id !== undefined) {
      params.tag_id = gameFilters.tag_id
    }

    const { data } = await http.get<{ data: GameRow[]; pagination: Pagination }>('/admin/games', {
      params
    })
    rows.value = data.data
    Object.assign(pagination, data.pagination)
    clearGameSelection()
  } finally {
    gameLoading.value = false
  }
}

async function loadTagRows() {
  tagLoading.value = true
  try {
    const params: Record<string, string | number> = {}
    if (tagFilters.keyword) {
      params.keyword = tagFilters.keyword
    }
    if (tagFilters.status !== undefined) {
      params.status = tagFilters.status
    }

    const { data } = await http.get<{ data: GameTagRow[] }>('/admin/game-tags', { params })
    tagRows.value = data.data
  } finally {
    tagLoading.value = false
  }
}

function applyGameFilters() {
  pagination.page = 1
  void loadGames()
}

function resetGameFilters() {
  gameFilters.keyword = ''
  gameFilters.vendor_code = ''
  gameFilters.provider_code = ''
  gameFilters.status = undefined
  gameFilters.under_maintenance = undefined
  gameFilters.tag_id = undefined
  pagination.page = 1
  pagination.page_size = 20
  void loadGames()
}

function handleGamePageChange(page: number) {
  pagination.page = page
  void loadGames()
}

function handleGamePageSizeChange() {
  pagination.page = 1
  void loadGames()
}

function handleGameSelectionChange(selection: GameRow[]) {
  selectedGameIds.value = selection.map((item) => item.id)
}

function clearGameSelection() {
  gameTableRef.value?.clearSelection?.()
  selectedGameIds.value = []
}

function applyTagFilters() {
  void loadTagRows()
}

function resetTagFilters() {
  tagFilters.keyword = ''
  tagFilters.status = undefined
  void loadTagRows()
}

function openGameDialog(row: GameRow) {
  editingGame.value = row
  gameForm.game_name = row.game_name
  gameForm.status = row.status
  gameForm.under_maintenance = row.under_maintenance
  gameForm.is_new = row.is_new
  gameForm.sort_order = row.sort_order
  gameForm.tag_ids = row.tags.map((tag) => tag.id)
  gameDialogVisible.value = true
}

function openTagDialog(row?: GameTagRow) {
  editingTag.value = row || null
  tagForm.name = row?.name || ''
  tagForm.code = row?.code || ''
  tagForm.color = row?.color || '#0f172a'
  tagForm.sort_order = row?.sort_order || 0
  tagForm.status = row?.status ?? 1
  tagDialogVisible.value = true
}

async function submitGameEdit() {
  if (!editingGame.value) {
    return
  }

  savingGame.value = true
  try {
    await http.put(`/admin/games/${editingGame.value.id}`, {
      game_name: gameForm.game_name,
      status: gameForm.status,
      under_maintenance: gameForm.under_maintenance,
      is_new: gameForm.is_new,
      sort_order: gameForm.sort_order,
      tag_ids: gameForm.tag_ids
    })
    ElMessage.success('游戏配置已更新')
    gameDialogVisible.value = false
    await Promise.all([loadGames(), loadTagRows()])
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '更新失败')
  } finally {
    savingGame.value = false
  }
}

async function submitTagForm() {
  savingTag.value = true
  try {
    const payload = {
      name: tagForm.name,
      code: tagForm.code,
      color: tagForm.color,
      sort_order: tagForm.sort_order,
      status: tagForm.status
    }

    if (editingTag.value) {
      await http.put(`/admin/game-tags/${editingTag.value.id}`, payload)
      ElMessage.success('标签已更新')
    } else {
      await http.post('/admin/game-tags', payload)
      ElMessage.success('标签已创建')
    }

    tagDialogVisible.value = false
    await Promise.all([loadAllTags(), loadTagRows(), loadGames()])
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '保存失败')
  } finally {
    savingTag.value = false
  }
}

async function toggleGameStatus(row: GameRow) {
  actionLoadingId.value = row.id
  actionLoadingType.value = 'status'
  try {
    await http.put(`/admin/games/${row.id}`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success(row.status === 1 ? '游戏已下架' : '游戏已上架')
    await loadGames()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '操作失败')
  } finally {
    actionLoadingId.value = null
    actionLoadingType.value = ''
  }
}

async function toggleGameMaintenance(row: GameRow) {
  actionLoadingId.value = row.id
  actionLoadingType.value = 'maintenance'
  try {
    await http.put(`/admin/games/${row.id}`, {
      under_maintenance: !row.under_maintenance
    })
    ElMessage.success(row.under_maintenance ? '已取消维护' : '已设为维护中')
    await loadGames()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '操作失败')
  } finally {
    actionLoadingId.value = null
    actionLoadingType.value = ''
  }
}

async function toggleTagStatus(row: GameTagRow) {
  tagActionLoadingId.value = row.id
  try {
    await http.put(`/admin/game-tags/${row.id}`, {
      status: row.status === 1 ? 0 : 1
    })
    ElMessage.success(row.status === 1 ? '标签已停用' : '标签已启用')
    await Promise.all([loadAllTags(), loadTagRows(), loadGames()])
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '操作失败')
  } finally {
    tagActionLoadingId.value = null
  }
}

function openBatchTagDialog() {
  if (!selectedGameIds.value.length) {
    ElMessage.warning('请先选择游戏')
    return
  }
  batchTagForm.tag_ids = []
  batchTagDialogVisible.value = true
}

async function submitBatchUpdate(payload: Record<string, unknown>, successMessage: string) {
  if (!selectedGameIds.value.length) {
    ElMessage.warning('请先选择游戏')
    return
  }

  batchUpdating.value = true
  try {
    await http.post('/admin/games/batch', {
      ids: selectedGameIds.value,
      ...payload
    })
    ElMessage.success(successMessage)
    batchTagDialogVisible.value = false
    await Promise.all([loadGames(), loadTagRows()])
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '批量操作失败')
  } finally {
    batchUpdating.value = false
  }
}

async function submitBatchTagUpdate() {
  await submitBatchUpdate({ tag_ids: batchTagForm.tag_ids }, '标签已批量更新')
}

async function togglePlatformSwitch(row: PlatformSwitchRow, enabled: string | number | boolean) {
  const previousEnabled = row.enabled
  const nextEnabled = Boolean(enabled)
  row.enabled = nextEnabled
  switchSavingKey.value = row.key

  try {
    const { data } = await http.put<{ data: PlatformSwitchRow }>(`/admin/ops-switches/${row.key}`, {
      enabled: nextEnabled
    })
    row.enabled = data.data.enabled
    ElMessage.success(`${row.name}${data.data.enabled ? '已开启' : '已关闭'}`)
  } catch (error: any) {
    row.enabled = previousEnabled
    ElMessage.error(error?.response?.data?.error || error?.message || '开关更新失败')
  } finally {
    switchSavingKey.value = ''
  }
}

async function deleteTag(row: GameTagRow) {
  if (row.game_count > 0) {
    ElMessage.warning('请先解除标签与游戏的关联')
    return
  }

  if (!window.confirm(`确认删除标签「${row.name}」吗？`)) {
    return
  }

  try {
    await http.delete(`/admin/game-tags/${row.id}`)
    ElMessage.success('标签已删除')
    await Promise.all([loadAllTags(), loadTagRows(), loadGames()])
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || error?.message || '删除失败')
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
  gap: 20px;
}

.page-card {
  border-radius: 28px;
}

.ops-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ops-item {
  display: flex;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ops-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ops-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.ops-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(6, minmax(140px, 200px));
  gap: 14px;
  margin-bottom: 18px;
}

.tag-filter-bar {
  grid-template-columns: minmax(0, 1.4fr) minmax(160px, 220px);
}

.bulk-bar {
  display: flex;
  padding: 14px 16px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
  border: 1px solid #dbeafe;
  border-radius: 20px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  padding: 16px 18px;
  background: linear-gradient(180deg, #fffdf7 0%, #f5f0e2 100%);
  border: 1px solid rgb(44 61 42 / 8%);
  border-radius: 22px;
}

.summary-label {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #8a7f61;
  text-transform: uppercase;
}

.summary-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #1d2b21;
}

.summary-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7569;
}

.bulk-summary {
  font-size: 14px;
  font-weight: 700;
  color: #1d4ed8;
}

.bulk-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.game-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-name {
  font-weight: 600;
  color: #0f172a;
}

.game-meta {
  font-size: 12px;
  color: #64748b;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-chip {
  --chip-color: #0f172a;

  display: inline-flex;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 10%, white);
  border: 1px solid color-mix(in srgb, var(--chip-color) 28%, white);
  border-radius: 999px;
  align-items: center;
}

.muted-text {
  font-size: 12px;
  color: #94a3b8;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  box-shadow: 0 0 0 3px rgb(15 23 42 / 6%);
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

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-note {
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
  background: #f8fafc;
  border-radius: 16px;
}

.field-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.full-width {
  width: 100%;
}

@media (width <= 1280px) {
  .ops-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width <= 900px) {
  .summary-grid,
  .filter-bar,
  .tag-filter-bar,
  .dialog-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .bulk-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
