<template>
  <div class="frontend-content-view">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div>
            <div class="page-title">前台内容编排</div>
            <div class="page-subtitle">
              把首页骨架、活动内容、客服与下载、登录账户入口、Banner、快捷入口、厂商展示和分类规则拆成结构化配置，并补上顺序编排。
            </div>
          </div>
          <el-tag type="success">结构化 CRUD + 排序</el-tag>
        </div>
      </template>

      <el-alert
        type="success"
        :closable="false"
        class="top-alert"
        title="顶部分类、头部动作、首页分区、Banner、活动卡、客服入口、下载步骤、底部导航、登录卡片、快捷入口、我的页快捷入口、我的页菜单、厂商展示、分类规则都支持结构化维护；列表顺序调整后前端会直接读取新的动态配置。"
      />

      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="顶部分类" name="top-tabs">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制大厅顶部分类导航，前端会根据这组结构化配置决定首页切换入口。
            </div>
            <el-button v-if="canManage" type="primary" @click="openHomeTopTabDialog()">
              新增顶部分类
            </el-button>
          </div>

          <el-table
            :data="homeTopTabs"
            stripe
            v-loading="homeTopTabsLoading || isReordering('top-tabs')"
          >
            <el-table-column prop="tab_code" label="编码" min-width="120" />
            <el-table-column label="展示信息" min-width="220">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.tab_code }}</strong>
                  <span>{{ row.action_url || '未配置跳转' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '分' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="accent" label="主色" width="110">
              <template #default="{ row }">
                <div class="color-chip">
                  <span class="color-dot" :style="{ background: row.accent || '#8b5cf6' }"></span>
                  {{ row.accent || '-' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('top-tabs')"
                  @click="moveHomeTopTab($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage || $index === homeTopTabs.length - 1 || isReordering('top-tabs')
                  "
                  @click="moveHomeTopTab($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openHomeTopTabDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeHomeTopTab(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="首页分区" name="home-sections">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制大厅首页的业务分区卡，分类页标题、图标和文案都会从这里复用。
            </div>
            <el-button v-if="canManage" type="primary" @click="openHomeSectionDialog()">
              新增首页分区
            </el-button>
          </div>

          <el-table
            :data="homeSections"
            stripe
            v-loading="homeSectionsLoading || isReordering('home-sections')"
          >
            <el-table-column prop="section_code" label="编码" min-width="120" />
            <el-table-column label="分区信息" min-width="300">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.title || row.section_code }}</strong>
                  <span>{{ row.title || row.subtitle || '未填写标题' }}</span>
                  <span class="muted">{{ row.description || row.action_url || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '区' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('home-sections')"
                  @click="moveHomeSection($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === homeSections.length - 1 ||
                    isReordering('home-sections')
                  "
                  @click="moveHomeSection($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openHomeSectionDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeHomeSection(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="头部动作" name="header-actions">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制首页余额区右侧的刷新、充值、更多等头部动作，前端会直接读取这里的顺序和跳转。
            </div>
            <el-button v-if="canManage" type="primary" @click="openHomeHeaderActionDialog()">
              新增头部动作
            </el-button>
          </div>

          <el-table
            :data="homeHeaderActions"
            stripe
            v-loading="homeHeaderActionsLoading || isReordering('header-actions')"
          >
            <el-table-column prop="action_code" label="编码" min-width="120" />
            <el-table-column label="动作信息" min-width="260">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.action_code }}</strong>
                  <span>{{ row.description || row.action_url || '未填写说明' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '按' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="accent" label="主色" width="110">
              <template #default="{ row }">
                <div class="color-chip">
                  <span class="color-dot" :style="{ background: row.accent || '#d4a350' }"></span>
                  {{ row.accent || '-' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('header-actions')"
                  @click="moveHomeHeaderAction($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === homeHeaderActions.length - 1 ||
                    isReordering('header-actions')
                  "
                  @click="moveHomeHeaderAction($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openHomeHeaderActionDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeHomeHeaderAction(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="首页 Banner" name="banners">
          <div class="panel-toolbar">
            <div class="panel-copy">
              首页头图活动卡统一从这里维护，前端会自动读取有效期内且启用的内容。
            </div>
            <el-button v-if="canManage" type="primary" @click="openBannerDialog()"
              >新增 Banner</el-button
            >
          </div>

          <el-table :data="banners" stripe v-loading="bannersLoading || isReordering('banners')">
            <el-table-column prop="banner_code" label="编码" min-width="120" />
            <el-table-column label="内容" min-width="320">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.title }}</strong>
                  <span>{{ row.subtitle || '未填写副标题' }}</span>
                  <span class="muted">{{ row.description || row.action_url || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb" />
                <span v-else class="muted">未配置</span>
              </template>
            </el-table-column>
            <el-table-column label="投放时间" min-width="220">
              <template #default="{ row }">{{ formatWindow(row.start_at, row.end_at) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('banners')"
                  @click="moveBanner($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="!canManage || $index === banners.length - 1 || isReordering('banners')"
                  @click="moveBanner($index, 1)"
                >
                  下移
                </el-button>
                <el-button link type="primary" :disabled="!canManage" @click="openBannerDialog(row)"
                  >编辑</el-button
                >
                <el-button v-if="canManage" link type="danger" @click="removeBanner(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="活动卡" name="activity-cards">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制活动页的运营卡片，标题、副标题、主图和跳转统一从这里下发。
            </div>
            <el-button v-if="canManage" type="primary" @click="openActivityCardDialog()">
              新增活动卡
            </el-button>
          </div>

          <el-table
            :data="activityCards"
            stripe
            v-loading="activityCardsLoading || isReordering('activity-cards')"
          >
            <el-table-column prop="card_code" label="编码" min-width="130" />
            <el-table-column label="卡片内容" min-width="320">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.title || row.card_code }}</strong>
                  <span>{{ row.subtitle || '未填写副标题' }}</span>
                  <span class="muted">{{ row.description || row.action_url || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb" />
                <span v-else class="muted">未配置</span>
              </template>
            </el-table-column>
            <el-table-column prop="badge" label="角标" width="90">
              <template #default="{ row }">{{ row.badge || '-' }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('activity-cards')"
                  @click="moveActivityCard($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === activityCards.length - 1 ||
                    isReordering('activity-cards')
                  "
                  @click="moveActivityCard($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openActivityCardDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeActivityCard(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="客服入口" name="support-items">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制客服页和支持页的入口卡片，标题、按钮文案、图标和外链统一从这里下发。
            </div>
            <el-button v-if="canManage" type="primary" @click="openSupportItemDialog()">
              新增客服入口
            </el-button>
          </div>

          <el-table
            :data="supportItems"
            stripe
            v-loading="supportItemsLoading || isReordering('support-items')"
          >
            <el-table-column prop="support_code" label="编码" min-width="130" />
            <el-table-column label="入口信息" min-width="280">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.title || row.support_code }}</strong>
                  <span>{{ row.description || row.action_url || '未填写说明' }}</span>
                  <span class="muted">{{ row.label || '点击咨询' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '服' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="action_url" label="跳转" min-width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('support-items')"
                  @click="moveSupportItem($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === supportItems.length - 1 ||
                    isReordering('support-items')
                  "
                  @click="moveSupportItem($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openSupportItemDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeSupportItem(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="下载步骤" name="download-steps">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制下载页的步骤引导，标题、说明、配图和顺序都可以在这里维护。
            </div>
            <el-button v-if="canManage" type="primary" @click="openDownloadStepDialog()">
              新增步骤
            </el-button>
          </div>

          <el-table
            :data="downloadSteps"
            stripe
            v-loading="downloadStepsLoading || isReordering('download-steps')"
          >
            <el-table-column prop="step_code" label="编码" min-width="130" />
            <el-table-column label="步骤内容" min-width="320">
              <template #default="{ row, $index }">
                <div class="cell-stack">
                  <strong>步骤 {{ $index + 1 }} · {{ row.title || row.step_code }}</strong>
                  <span>{{ row.label || '未填写辅助文案' }}</span>
                  <span class="muted">{{ row.description || row.action_url || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb" />
                <span v-else class="muted">未配置</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('download-steps')"
                  @click="moveDownloadStep($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === downloadSteps.length - 1 ||
                    isReordering('download-steps')
                  "
                  @click="moveDownloadStep($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openDownloadStepDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeDownloadStep(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="底部导航" name="bottom-nav-items">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制全局底部导航的顺序、跳转和图标，占位图和路径都可以从这里动态调整。
            </div>
            <el-button v-if="canManage" type="primary" @click="openBottomNavItemDialog()">
              新增导航项
            </el-button>
          </div>

          <el-table
            :data="bottomNavItems"
            stripe
            v-loading="bottomNavItemsLoading || isReordering('bottom-nav-items')"
          >
            <el-table-column prop="nav_code" label="编码" min-width="130" />
            <el-table-column label="导航信息" min-width="240">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.nav_code }}</strong>
                  <span>{{ row.action_url || '/home' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '导' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('bottom-nav-items')"
                  @click="moveBottomNavItem($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === bottomNavItems.length - 1 ||
                    isReordering('bottom-nav-items')
                  "
                  @click="moveBottomNavItem($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openBottomNavItemDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeBottomNavItem(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="大厅快捷入口" name="quick-actions">
          <div class="panel-toolbar">
            <div class="panel-copy"> 控制大厅顶部的功能入口，不需要再手写 JSON 数组。 </div>
            <el-button v-if="canManage" type="primary" @click="openQuickActionDialog()"
              >新增入口</el-button
            >
          </div>

          <el-table
            :data="quickActions"
            stripe
            v-loading="quickActionsLoading || isReordering('quick-actions')"
          >
            <el-table-column prop="action_code" label="编码" min-width="120" />
            <el-table-column label="入口信息" min-width="220">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.action_code }}</strong>
                  <span>{{ row.description || '未填写说明' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '图' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="action_url" label="跳转" min-width="180" />
            <el-table-column prop="accent" label="主色" width="110">
              <template #default="{ row }">
                <div class="color-chip">
                  <span class="color-dot" :style="{ background: row.accent || '#d5a12d' }"></span>
                  {{ row.accent || '-' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('quick-actions')"
                  @click="moveQuickAction($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === quickActions.length - 1 ||
                    isReordering('quick-actions')
                  "
                  @click="moveQuickAction($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openQuickActionDialog(row)"
                  >编辑</el-button
                >
                <el-button v-if="canManage" link type="danger" @click="removeQuickAction(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="登录卡片" name="login-cards">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制登录页的辅助说明卡片，前端会直接读取标题、副标题和说明顺序。
            </div>
            <el-button v-if="canManage" type="primary" @click="openLoginCardDialog()">
              新增登录卡片
            </el-button>
          </div>

          <el-table
            :data="loginCards"
            stripe
            v-loading="loginCardsLoading || isReordering('login-cards')"
          >
            <el-table-column prop="card_code" label="编码" min-width="130" />
            <el-table-column label="卡片内容" min-width="300">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.title || row.card_code }}</strong>
                  <span>{{ row.subtitle || '未填写副标题' }}</span>
                  <span class="muted">{{ row.description || row.action_url || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="badge" label="角标" width="90">
              <template #default="{ row }">{{ row.badge || '-' }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('login-cards')"
                  @click="moveLoginCard($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage || $index === loginCards.length - 1 || isReordering('login-cards')
                  "
                  @click="moveLoginCard($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openLoginCardDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeLoginCard(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我的快捷入口" name="mine-shortcuts">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制“我的”页面的快捷入口卡片，文案、图标和跳转会直接同步到账户区。
            </div>
            <el-button v-if="canManage" type="primary" @click="openMineShortcutDialog()">
              新增快捷入口
            </el-button>
          </div>

          <el-table
            :data="mineShortcuts"
            stripe
            v-loading="mineShortcutsLoading || isReordering('mine-shortcuts')"
          >
            <el-table-column prop="shortcut_code" label="编码" min-width="140" />
            <el-table-column label="入口信息" min-width="260">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.shortcut_code }}</strong>
                  <span>{{ row.description || row.action_url || '未填写说明' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="图标 / 配图" width="120">
              <template #default="{ row }">
                <img v-if="row.image_url" :src="row.image_url" alt="" class="thumb thumb--square" />
                <div v-else class="icon-chip">{{ row.icon || '捷' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="action_url" label="跳转" min-width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('mine-shortcuts')"
                  @click="moveMineShortcut($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === mineShortcuts.length - 1 ||
                    isReordering('mine-shortcuts')
                  "
                  @click="moveMineShortcut($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openMineShortcutDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeMineShortcut(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我的菜单" name="mine-menu-items">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制“我的”页的菜单列表，后续扩展徽标、说明和视觉样式时也直接走这里。
            </div>
            <el-button v-if="canManage" type="primary" @click="openMineMenuItemDialog()">
              新增菜单项
            </el-button>
          </div>

          <el-table
            :data="mineMenuItems"
            stripe
            v-loading="mineMenuItemsLoading || isReordering('mine-menu-items')"
          >
            <el-table-column prop="menu_code" label="编码" min-width="140" />
            <el-table-column label="菜单信息" min-width="260">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.label || row.menu_code }}</strong>
                  <span>{{ row.description || row.action_url || '未填写说明' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="badge" label="角标" width="90">
              <template #default="{ row }">{{ row.badge || '-' }}</template>
            </el-table-column>
            <el-table-column prop="action_url" label="跳转" min-width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('mine-menu-items')"
                  @click="moveMineMenuItem($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === mineMenuItems.length - 1 ||
                    isReordering('mine-menu-items')
                  "
                  @click="moveMineMenuItem($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openMineMenuItemDialog(row)"
                >
                  编辑
                </el-button>
                <el-button v-if="canManage" link type="danger" @click="removeMineMenuItem(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="厂商展示" name="vendors">
          <div class="panel-toolbar">
            <div class="panel-copy">
              为不同厂商配置简称、分类文案和卡片背景，前端分类页会直接复用。
            </div>
            <el-button v-if="canManage" type="primary" @click="openVendorPresentationDialog()">
              新增厂商展示
            </el-button>
          </div>

          <el-table
            :data="vendorPresentations"
            stripe
            v-loading="vendorPresentationsLoading || isReordering('vendors')"
          >
            <el-table-column prop="vendor_code" label="厂商编码" min-width="140" />
            <el-table-column label="卡片预览" min-width="180">
              <template #default="{ row }">
                <div
                  class="vendor-table-card"
                  :style="buildVendorCardStyle(row.card_background, row.accent)"
                >
                  <div class="vendor-table-card__badge">{{ row.vendor_code }}</div>
                  <div class="vendor-table-card__title">{{ row.label || row.vendor_code }}</div>
                  <div class="vendor-table-card__desc">
                    {{ row.slot_label || row.live_label || row.sports_label || '未配置分类文案' }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="分类文案" min-width="280">
              <template #default="{ row }">
                <div class="cell-stack">
                  <span>电子：{{ row.slot_label || '-' }}</span>
                  <span>真人：{{ row.live_label || '-' }}</span>
                  <span>体育：{{ row.sports_label || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('vendors')"
                  @click="moveVendorPresentation($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === vendorPresentations.length - 1 ||
                    isReordering('vendors')
                  "
                  @click="moveVendorPresentation($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openVendorPresentationDialog(row)"
                  >编辑</el-button
                >
                <el-button
                  v-if="canManage"
                  link
                  type="danger"
                  @click="removeVendorPresentation(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="分类规则" name="categories">
          <div class="panel-toolbar">
            <div class="panel-copy">
              控制大厅分类到底展示哪些供应商和游戏类型，前端不再维护筛选逻辑。
            </div>
            <el-button v-if="canManage" type="primary" @click="openCategoryFilterDialog()"
              >新增规则</el-button
            >
          </div>

          <el-table
            :data="categoryFilters"
            stripe
            v-loading="categoryFiltersLoading || isReordering('categories')"
          >
            <el-table-column prop="category_key" label="分类键" min-width="120" />
            <el-table-column prop="kind" label="规则类型" width="110" />
            <el-table-column label="供应商" min-width="220">
              <template #default="{ row }">
                {{ row.vendor_codes.join(', ') || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="游戏类型" min-width="180">
              <template #default="{ row }">
                {{ formatTypeLabels(row.types) }}
              </template>
            </el-table-column>
            <el-table-column prop="shuffle_split_at" label="混排截断" width="110">
              <template #default="{ row }">{{ row.shuffle_split_at ?? '-' }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{
                  row.status === 1 ? '启用' : '停用'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" width="90" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  link
                  :disabled="!canManage || $index === 0 || isReordering('categories')"
                  @click="moveCategoryFilter($index, -1)"
                >
                  上移
                </el-button>
                <el-button
                  link
                  :disabled="
                    !canManage ||
                    $index === categoryFilters.length - 1 ||
                    isReordering('categories')
                  "
                  @click="moveCategoryFilter($index, 1)"
                >
                  下移
                </el-button>
                <el-button
                  link
                  type="primary"
                  :disabled="!canManage"
                  @click="openCategoryFilterDialog(row)"
                  >编辑</el-button
                >
                <el-button v-if="canManage" link type="danger" @click="removeCategoryFilter(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="homeTopTabDialogVisible"
      :title="editingHomeTopTab ? '编辑顶部分类' : '新增顶部分类'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="homeTopTabForm.tab_code" placeholder="例如：slot" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="homeTopTabForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="homeTopTabForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="homeTopTabForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="homeTopTabForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="主色">
            <el-input v-model.trim="homeTopTabForm.accent" placeholder="#864dff" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="homeTopTabForm.action_url" placeholder="/category/slot" />
          </el-form-item>
        </div>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="homeTopTabForm.image_url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="homeTopTabDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingHomeTopTab" @click="submitHomeTopTab">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="homeSectionDialogVisible"
      :title="editingHomeSection ? '编辑首页分区' : '新增首页分区'"
      width="820px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="homeSectionForm.section_code" placeholder="例如：sports" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="homeSectionForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="分区名称">
            <el-input v-model.trim="homeSectionForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="homeSectionForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="homeSectionForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="标题">
            <el-input v-model.trim="homeSectionForm.title" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model.trim="homeSectionForm.subtitle" />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input v-model.trim="homeSectionForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <div class="form-grid form-grid--3">
          <el-form-item label="角标">
            <el-input v-model.trim="homeSectionForm.badge" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="homeSectionForm.accent" placeholder="#10b981" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="homeSectionForm.action_url" placeholder="/category/sports" />
          </el-form-item>
        </div>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="homeSectionForm.image_url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="homeSectionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingHomeSection" @click="submitHomeSection">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="homeHeaderActionDialogVisible"
      :title="editingHomeHeaderAction ? '编辑头部动作' : '新增头部动作'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="homeHeaderActionForm.action_code" placeholder="例如：refresh" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="homeHeaderActionForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="homeHeaderActionForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="homeHeaderActionForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number
              v-model="homeHeaderActionForm.sort_order"
              :min="0"
              class="full-width"
            />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="主色">
            <el-input v-model.trim="homeHeaderActionForm.accent" placeholder="#d4a350" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="homeHeaderActionForm.action_url" placeholder="/wallet" />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="homeHeaderActionForm.description" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="homeHeaderActionForm.image_url" />
        </el-form-item>

        <div
          class="quick-preview-card"
          :style="buildQuickActionPreviewStyle(homeHeaderActionForm.accent)"
        >
          <div class="quick-preview-card__icon">
            <img
              v-if="homeHeaderActionForm.image_url"
              :src="homeHeaderActionForm.image_url"
              alt=""
            />
            <span v-else>{{ homeHeaderActionForm.icon || '按' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ homeHeaderActionForm.label || homeHeaderActionForm.action_code || '头部动作' }}
            </div>
            <div class="quick-preview-card__desc">
              {{ homeHeaderActionForm.description || '这里会预览头部动作的图标、名称和说明。' }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="homeHeaderActionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingHomeHeaderAction" @click="submitHomeHeaderAction">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="bannerDialogVisible"
      :title="editingBanner ? '编辑 Banner' : '新增 Banner'"
      width="820px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="bannerForm.banner_code" placeholder="例如：vip" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="bannerForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="标题">
            <el-input v-model.trim="bannerForm.title" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model.trim="bannerForm.subtitle" />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input v-model.trim="bannerForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <div class="form-grid form-grid--3">
          <el-form-item label="角标">
            <el-input v-model.trim="bannerForm.badge" />
          </el-form-item>
          <el-form-item label="按钮文案">
            <el-input v-model.trim="bannerForm.label" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="bannerForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="主色">
            <el-input v-model.trim="bannerForm.accent" placeholder="#864dff" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="bannerForm.action_url" placeholder="/activity" />
          </el-form-item>
        </div>
        <el-form-item label="配图 URL">
          <el-input v-model.trim="bannerForm.image_url" />
        </el-form-item>
        <div class="asset-upload-field">
          <label class="asset-picker asset-picker--compact">
            <input
              ref="bannerAssetInput"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              @change="handleAssetChange($event, 'banner')"
            />
            <span>{{ selectedBannerAsset?.name || '选择 Banner 图片' }}</span>
          </label>
          <el-button
            type="primary"
            plain
            :loading="uploadingBannerAsset"
            :disabled="!selectedBannerAsset"
            @click="uploadAsset('banner')"
          >
            上传并回填
          </el-button>
          <el-button
            v-if="bannerForm.image_url"
            link
            @click="copyTextWithMessage(bannerForm.image_url)"
            >复制地址</el-button
          >
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="开始时间">
            <el-date-picker v-model="bannerForm.start_at" type="datetime" class="full-width" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker v-model="bannerForm.end_at" type="datetime" class="full-width" />
          </el-form-item>
        </div>

        <div class="dialog-preview-card banner-preview-card" :style="buildBannerPreviewStyle()">
          <div class="dialog-preview-card__badge">{{
            bannerForm.badge || bannerForm.banner_code || 'banner'
          }}</div>
          <div class="dialog-preview-card__title">{{ bannerForm.title || 'Banner 标题' }}</div>
          <div class="dialog-preview-card__subtitle">{{
            bannerForm.subtitle || 'Banner 副标题'
          }}</div>
          <div class="dialog-preview-card__desc">
            {{ bannerForm.description || '这里会预览运营活动的主文案和素材效果。' }}
          </div>
          <div class="dialog-preview-card__action">{{ bannerForm.label || '查看活动' }}</div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingBanner" @click="submitBanner">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="supportItemDialogVisible"
      :title="editingSupportItem ? '编辑客服入口' : '新增客服入口'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="supportItemForm.support_code" placeholder="例如：tg" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="supportItemForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="标题">
            <el-input v-model.trim="supportItemForm.title" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="supportItemForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="supportItemForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="按钮文案">
            <el-input v-model.trim="supportItemForm.label" placeholder="点击咨询" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="supportItemForm.accent" placeholder="#b42dff" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input
              v-model.trim="supportItemForm.action_url"
              placeholder="https://t.me/example"
            />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="supportItemForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="supportItemForm.image_url" />
        </el-form-item>

        <div
          class="quick-preview-card"
          :style="buildQuickActionPreviewStyle(supportItemForm.accent)"
        >
          <div class="quick-preview-card__icon">
            <img v-if="supportItemForm.image_url" :src="supportItemForm.image_url" alt="" />
            <span v-else>{{ supportItemForm.icon || '服' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ supportItemForm.title || supportItemForm.support_code || '客服入口' }}
            </div>
            <div class="quick-preview-card__desc">
              {{ supportItemForm.description || '这里会预览客服入口的标题、说明和按钮文案。' }}
            </div>
            <div class="dialog-preview-card__action">
              {{ supportItemForm.label || '点击咨询' }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="supportItemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSupportItem" @click="submitSupportItem">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="activityCardDialogVisible"
      :title="editingActivityCard ? '编辑活动卡' : '新增活动卡'"
      width="760px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="activityCardForm.card_code" placeholder="例如：vip" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="activityCardForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="标题">
            <el-input v-model.trim="activityCardForm.title" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model.trim="activityCardForm.subtitle" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="activityCardForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--4">
          <el-form-item label="角标">
            <el-input v-model.trim="activityCardForm.badge" placeholder="HOT" />
          </el-form-item>
          <el-form-item label="按钮文案">
            <el-input v-model.trim="activityCardForm.label" placeholder="查看活动" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="activityCardForm.accent" placeholder="#864dff" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="activityCardForm.action_url" placeholder="/activity" />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input v-model.trim="activityCardForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="activityCardForm.image_url" />
        </el-form-item>

        <div
          class="dialog-preview-card"
          :style="buildMediaPreviewStyle(activityCardForm.accent, activityCardForm.image_url)"
        >
          <div class="dialog-preview-card__badge">
            {{ activityCardForm.badge || activityCardForm.card_code || 'activity' }}
          </div>
          <div class="dialog-preview-card__title">
            {{ activityCardForm.title || activityCardForm.card_code || '活动卡标题' }}
          </div>
          <div class="dialog-preview-card__subtitle">
            {{ activityCardForm.subtitle || '活动页副标题' }}
          </div>
          <div class="dialog-preview-card__desc">
            {{ activityCardForm.description || '这里会预览活动卡的标题、副标题和封面效果。' }}
          </div>
          <div class="dialog-preview-card__action">
            {{ activityCardForm.label || '查看活动' }}
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="activityCardDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingActivityCard" @click="submitActivityCard">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="bottomNavItemDialogVisible"
      :title="editingBottomNavItem ? '编辑底部导航' : '新增底部导航'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="bottomNavItemForm.nav_code" placeholder="例如：home" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="bottomNavItemForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="bottomNavItemForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="bottomNavItemForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="bottomNavItemForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="主色">
            <el-input v-model.trim="bottomNavItemForm.accent" placeholder="#64748b" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="bottomNavItemForm.action_url" placeholder="/home" />
          </el-form-item>
          <el-form-item label="图片 URL">
            <el-input v-model.trim="bottomNavItemForm.image_url" />
          </el-form-item>
        </div>

        <div
          class="quick-preview-card"
          :style="buildQuickActionPreviewStyle(bottomNavItemForm.accent)"
        >
          <div class="quick-preview-card__icon">
            <img v-if="bottomNavItemForm.image_url" :src="bottomNavItemForm.image_url" alt="" />
            <span v-else>{{ bottomNavItemForm.icon || '导' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ bottomNavItemForm.label || bottomNavItemForm.nav_code || '底部导航' }}
            </div>
            <div class="quick-preview-card__desc">
              {{ bottomNavItemForm.action_url || '/home' }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="bottomNavItemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingBottomNavItem" @click="submitBottomNavItem">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="downloadStepDialogVisible"
      :title="editingDownloadStep ? '编辑下载步骤' : '新增下载步骤'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="downloadStepForm.step_code" placeholder="例如：step1" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="downloadStepForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="标题">
            <el-input v-model.trim="downloadStepForm.title" />
          </el-form-item>
          <el-form-item label="辅助文案">
            <el-input v-model.trim="downloadStepForm.label" placeholder="点击分享按钮" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="downloadStepForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="主色">
            <el-input v-model.trim="downloadStepForm.accent" placeholder="#864dff" />
          </el-form-item>
          <el-form-item label="图片 URL">
            <el-input v-model.trim="downloadStepForm.image_url" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="downloadStepForm.action_url" placeholder="/download" />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="downloadStepForm.description" type="textarea" :rows="3" />
        </el-form-item>

        <div
          class="quick-preview-card"
          :style="buildMediaPreviewStyle(downloadStepForm.accent, downloadStepForm.image_url)"
        >
          <div class="quick-preview-card__icon">
            <img v-if="downloadStepForm.image_url" :src="downloadStepForm.image_url" alt="" />
            <span v-else>{{ downloadStepForm.step_code || '步' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ downloadStepForm.title || downloadStepForm.step_code || '下载步骤' }}
            </div>
            <div class="quick-preview-card__desc">
              {{
                downloadStepForm.label ||
                downloadStepForm.description ||
                '这里会预览下载步骤的标题和说明。'
              }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="downloadStepDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingDownloadStep" @click="submitDownloadStep">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="quickActionDialogVisible"
      :title="editingQuickAction ? '编辑快捷入口' : '新增快捷入口'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="quickActionForm.action_code" placeholder="例如：deposit" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="quickActionForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="quickActionForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="quickActionForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="quickActionForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="主色">
            <el-input v-model.trim="quickActionForm.accent" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="quickActionForm.action_url" />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="quickActionForm.description" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="quickActionForm.image_url" />
        </el-form-item>
        <div class="asset-upload-field">
          <label class="asset-picker asset-picker--compact">
            <input
              ref="quickActionAssetInput"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              @change="handleAssetChange($event, 'quickAction')"
            />
            <span>{{ selectedQuickActionAsset?.name || '选择快捷入口图片' }}</span>
          </label>
          <el-button
            type="primary"
            plain
            :loading="uploadingQuickActionAsset"
            :disabled="!selectedQuickActionAsset"
            @click="uploadAsset('quickAction')"
          >
            上传并回填
          </el-button>
          <el-button
            v-if="quickActionForm.image_url"
            link
            @click="copyTextWithMessage(quickActionForm.image_url)"
            >复制地址</el-button
          >
        </div>

        <div
          class="quick-preview-card"
          :style="buildQuickActionPreviewStyle(quickActionForm.accent)"
        >
          <div class="quick-preview-card__icon">
            <img v-if="quickActionForm.image_url" :src="quickActionForm.image_url" alt="" />
            <span v-else>{{ quickActionForm.icon || '图' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ quickActionForm.label || quickActionForm.action_code || '快捷入口' }}
            </div>
            <div class="quick-preview-card__desc">
              {{ quickActionForm.description || '这里会预览大厅入口的标题和说明。' }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="quickActionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingQuickAction" @click="submitQuickAction"
          >保存</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="loginCardDialogVisible"
      :title="editingLoginCard ? '编辑登录卡片' : '新增登录卡片'"
      width="760px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="loginCardForm.card_code" placeholder="例如：wallet" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="loginCardForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="标题">
            <el-input v-model.trim="loginCardForm.title" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model.trim="loginCardForm.subtitle" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="loginCardForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="角标">
            <el-input v-model.trim="loginCardForm.badge" placeholder="HOT" />
          </el-form-item>
          <el-form-item label="按钮文案">
            <el-input v-model.trim="loginCardForm.label" placeholder="查看详情" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="loginCardForm.accent" placeholder="#864dff" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="图片 URL">
            <el-input v-model.trim="loginCardForm.image_url" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="loginCardForm.action_url" placeholder="/activity" />
          </el-form-item>
        </div>
        <el-form-item label="描述">
          <el-input v-model.trim="loginCardForm.description" type="textarea" :rows="3" />
        </el-form-item>

        <div
          class="dialog-preview-card"
          :style="buildQuickActionPreviewStyle(loginCardForm.accent)"
        >
          <div class="dialog-preview-card__badge">
            {{ loginCardForm.badge || loginCardForm.card_code || 'card' }}
          </div>
          <div class="dialog-preview-card__title">
            {{ loginCardForm.title || loginCardForm.card_code || '登录卡片标题' }}
          </div>
          <div class="dialog-preview-card__subtitle">
            {{ loginCardForm.subtitle || '登录页辅助说明' }}
          </div>
          <div class="dialog-preview-card__desc">
            {{ loginCardForm.description || '这里会预览登录页卡片的主文案和副标题。' }}
          </div>
          <div v-if="loginCardForm.label" class="dialog-preview-card__action">
            {{ loginCardForm.label }}
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="loginCardDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingLoginCard" @click="submitLoginCard">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="mineShortcutDialogVisible"
      :title="editingMineShortcut ? '编辑我的页快捷入口' : '新增我的页快捷入口'"
      width="720px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input
              v-model.trim="mineShortcutForm.shortcut_code"
              placeholder="例如：deposit_logs"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="mineShortcutForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="mineShortcutForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="mineShortcutForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="mineShortcutForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="主色">
            <el-input v-model.trim="mineShortcutForm.accent" placeholder="#864dff" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="mineShortcutForm.action_url" placeholder="/wallet" />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="mineShortcutForm.description" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="mineShortcutForm.image_url" />
        </el-form-item>

        <div
          class="quick-preview-card"
          :style="buildQuickActionPreviewStyle(mineShortcutForm.accent)"
        >
          <div class="quick-preview-card__icon">
            <img v-if="mineShortcutForm.image_url" :src="mineShortcutForm.image_url" alt="" />
            <span v-else>{{ mineShortcutForm.icon || '捷' }}</span>
          </div>
          <div class="quick-preview-card__copy">
            <div class="quick-preview-card__title">
              {{ mineShortcutForm.label || mineShortcutForm.shortcut_code || '快捷入口' }}
            </div>
            <div class="quick-preview-card__desc">
              {{ mineShortcutForm.description || '这里会预览我的页快捷入口的标题和说明。' }}
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="mineShortcutDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingMineShortcut" @click="submitMineShortcut">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="mineMenuItemDialogVisible"
      :title="editingMineMenuItem ? '编辑我的页菜单' : '新增我的页菜单'"
      width="760px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="编码">
            <el-input v-model.trim="mineMenuItemForm.menu_code" placeholder="例如：security" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="mineMenuItemForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="名称">
            <el-input v-model.trim="mineMenuItemForm.label" />
          </el-form-item>
          <el-form-item label="图标文案">
            <el-input v-model.trim="mineMenuItemForm.icon" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="mineMenuItemForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="角标">
            <el-input v-model.trim="mineMenuItemForm.badge" placeholder="NEW" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="mineMenuItemForm.accent" placeholder="#64748b" />
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model.trim="mineMenuItemForm.action_url" placeholder="/mine" />
          </el-form-item>
        </div>
        <el-form-item label="说明">
          <el-input v-model.trim="mineMenuItemForm.description" />
        </el-form-item>
        <el-form-item label="图片 URL">
          <el-input v-model.trim="mineMenuItemForm.image_url" />
        </el-form-item>

        <div
          class="dialog-preview-card"
          :style="buildQuickActionPreviewStyle(mineMenuItemForm.accent)"
        >
          <div class="dialog-preview-card__badge">
            {{ mineMenuItemForm.badge || mineMenuItemForm.menu_code || 'menu' }}
          </div>
          <div class="dialog-preview-card__title">
            {{ mineMenuItemForm.label || mineMenuItemForm.menu_code || '菜单项名称' }}
          </div>
          <div class="dialog-preview-card__desc">
            {{
              mineMenuItemForm.description ||
              mineMenuItemForm.action_url ||
              '这里会预览菜单项名称和说明。'
            }}
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="mineMenuItemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingMineMenuItem" @click="submitMineMenuItem">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="vendorPresentationDialogVisible"
      :title="editingVendorPresentation ? '编辑厂商展示' : '新增厂商展示'"
      width="760px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="厂商编码">
            <el-select
              v-model="vendorPresentationForm.vendor_code"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in vendorOptions"
                :key="item.vendor_code"
                :label="`${item.vendor_code} · ${item.name}`"
                :value="item.vendor_code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="vendorPresentationForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="简称">
            <el-input v-model.trim="vendorPresentationForm.label" />
          </el-form-item>
          <el-form-item label="主色">
            <el-input v-model.trim="vendorPresentationForm.accent" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number
              v-model="vendorPresentationForm.sort_order"
              :min="0"
              class="full-width"
            />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="电子文案">
            <el-input v-model.trim="vendorPresentationForm.slot_label" />
          </el-form-item>
          <el-form-item label="真人文案">
            <el-input v-model.trim="vendorPresentationForm.live_label" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="捕鱼文案">
            <el-input v-model.trim="vendorPresentationForm.fish_label" />
          </el-form-item>
          <el-form-item label="体育文案">
            <el-input v-model.trim="vendorPresentationForm.sports_label" />
          </el-form-item>
        </div>
        <div class="form-grid form-grid--2">
          <el-form-item label="棋牌游戏文案">
            <el-input v-model.trim="vendorPresentationForm.board_label" />
          </el-form-item>
          <el-form-item label="彩票文案">
            <el-input v-model.trim="vendorPresentationForm.lottery_label" />
          </el-form-item>
        </div>
        <el-form-item label="卡片背景">
          <el-input
            v-model.trim="vendorPresentationForm.card_background"
            placeholder="linear-gradient(to bottom, #4a90e2, #50e3c2)"
          />
        </el-form-item>

        <div
          class="dialog-preview-card vendor-preview-card"
          :style="
            buildVendorCardStyle(
              vendorPresentationForm.card_background,
              vendorPresentationForm.accent
            )
          "
        >
          <div class="dialog-preview-card__badge">
            {{ vendorPresentationForm.vendor_code || 'vendor' }}
          </div>
          <div class="dialog-preview-card__title">
            {{ vendorPresentationForm.label || vendorPresentationForm.vendor_code || '厂商简称' }}
          </div>
          <div class="dialog-preview-card__desc">
            {{
              vendorPresentationForm.slot_label ||
              vendorPresentationForm.live_label ||
              vendorPresentationForm.sports_label ||
              '这里会预览分类页上展示的厂商文案。'
            }}
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="vendorPresentationDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="savingVendorPresentation"
          @click="submitVendorPresentation"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="categoryFilterDialogVisible"
      :title="editingCategoryFilter ? '编辑分类规则' : '新增分类规则'"
      width="760px"
    >
      <el-form label-position="top">
        <div class="form-grid form-grid--2">
          <el-form-item label="分类键">
            <el-select
              v-model="categoryFilterForm.category_key"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in categoryKeyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="categoryFilterForm.kind">
              <el-option value="or" label="or（厂商或类型，任一命中）" />
              <el-option value="and" label="and（厂商且类型，同时命中）" />
              <el-option value="board" label="board（棋牌）" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-grid form-grid--3">
          <el-form-item label="状态">
            <el-select v-model="categoryFilterForm.status">
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="停用" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="categoryFilterForm.sort_order" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="混排截断">
            <el-input-number
              v-model="categoryFilterForm.shuffle_split_at"
              :min="0"
              class="full-width"
              :controls="true"
            />
          </el-form-item>
        </div>
        <el-form-item label="厂商范围">
          <el-select
            v-model="categoryFilterForm.vendor_codes"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in vendorOptions"
              :key="item.vendor_code"
              :label="`${item.vendor_code} · ${item.name}`"
              :value="item.vendor_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏类型">
          <el-select
            v-model="categoryFilterForm.types"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in gameTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Type=5 排除厂商">
          <el-select
            v-model="categoryFilterForm.type5_exclude_vendors"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in vendorOptions"
              :key="item.vendor_code"
              :label="`${item.vendor_code} · ${item.name}`"
              :value="item.vendor_code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFilterDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingCategoryFilter" @click="submitCategoryFilter"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface VendorOption {
  vendor_code: string
  name: string
}

interface HomeTopTabRow {
  id: number
  tab_code: string
  label: string
  icon: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface HomeSectionRow {
  id: number
  section_code: string
  label: string
  icon: string
  title: string
  subtitle: string
  description: string
  badge: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface HomeHeaderActionRow {
  id: number
  action_code: string
  label: string
  icon: string
  description: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface FrontendBannerRow {
  id: number
  banner_code: string
  title: string
  subtitle: string
  description: string
  badge: string
  label: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
  start_at: string | null
  end_at: string | null
}

interface ActivityCardRow {
  id: number
  card_code: string
  title: string
  subtitle: string
  description: string
  badge: string
  label: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface SupportItemRow {
  id: number
  support_code: string
  title: string
  label: string
  icon: string
  description: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface DownloadStepRow {
  id: number
  step_code: string
  title: string
  label: string
  description: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface BottomNavItemRow {
  id: number
  nav_code: string
  label: string
  icon: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface QuickActionRow {
  id: number
  action_code: string
  label: string
  icon: string
  description: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface LoginCardRow {
  id: number
  card_code: string
  title: string
  subtitle: string
  description: string
  badge: string
  label: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface MineShortcutRow {
  id: number
  shortcut_code: string
  label: string
  icon: string
  description: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface MineMenuItemRow {
  id: number
  menu_code: string
  label: string
  icon: string
  description: string
  badge: string
  accent: string
  image_url: string
  action_url: string
  status: number
  sort_order: number
}

interface VendorPresentationRow {
  id: number
  vendor_code: string
  label: string
  slot_label: string
  live_label: string
  fish_label: string
  sports_label: string
  board_label: string
  lottery_label: string
  accent: string
  card_background: string
  status: number
  sort_order: number
}

interface CategoryFilterRow {
  id: number
  category_key: string
  kind: string
  vendor_codes: string[]
  types: number[]
  type5_exclude_vendors: string[]
  shuffle_split_at: number | null
  status: number
  sort_order: number
}

interface SiteAssetUploadPayload {
  url: string
  relative_path: string
  file_name: string
  scope: string
}

type ReorderSection =
  | ''
  | 'banners'
  | 'activity-cards'
  | 'support-items'
  | 'download-steps'
  | 'bottom-nav-items'
  | 'quick-actions'
  | 'login-cards'
  | 'header-actions'
  | 'mine-shortcuts'
  | 'mine-menu-items'
  | 'vendors'
  | 'categories'
  | 'top-tabs'
  | 'home-sections'
type AssetTarget = 'banner' | 'quickAction'

const session = useAdminSessionStore()
const canManage = computed(() => session.hasPermission('operations.manage'))

const activeTab = ref('top-tabs')
const vendorOptions = ref<VendorOption[]>([])
const reorderingSection = ref<ReorderSection>('')

const categoryKeyOptions = [
  { value: 'hot', label: 'hot 热门' },
  { value: 'slot', label: 'slot 电子' },
  { value: 'live', label: 'live 真人' },
  { value: 'fish', label: 'fish 捕鱼' },
  { value: 'sports', label: 'sports 体育' },
  { value: 'board', label: 'board 棋牌' },
  { value: 'lottery', label: 'lottery 彩票' }
]

const gameTypeOptions = [
  { value: 1, label: '1 电子' },
  { value: 2, label: '2 真人' },
  { value: 3, label: '3 体育' },
  { value: 4, label: '4 棋牌' },
  { value: 5, label: '5 综合扩展' },
  { value: 6, label: '6 捕鱼' },
  { value: 7, label: '7 彩票' }
]

const homeTopTabs = ref<HomeTopTabRow[]>([])
const homeSections = ref<HomeSectionRow[]>([])
const homeHeaderActions = ref<HomeHeaderActionRow[]>([])
const banners = ref<FrontendBannerRow[]>([])
const activityCards = ref<ActivityCardRow[]>([])
const supportItems = ref<SupportItemRow[]>([])
const downloadSteps = ref<DownloadStepRow[]>([])
const bottomNavItems = ref<BottomNavItemRow[]>([])
const quickActions = ref<QuickActionRow[]>([])
const loginCards = ref<LoginCardRow[]>([])
const mineShortcuts = ref<MineShortcutRow[]>([])
const mineMenuItems = ref<MineMenuItemRow[]>([])
const vendorPresentations = ref<VendorPresentationRow[]>([])
const categoryFilters = ref<CategoryFilterRow[]>([])

const homeTopTabsLoading = ref(false)
const homeSectionsLoading = ref(false)
const homeHeaderActionsLoading = ref(false)
const bannersLoading = ref(false)
const activityCardsLoading = ref(false)
const supportItemsLoading = ref(false)
const downloadStepsLoading = ref(false)
const bottomNavItemsLoading = ref(false)
const quickActionsLoading = ref(false)
const loginCardsLoading = ref(false)
const mineShortcutsLoading = ref(false)
const mineMenuItemsLoading = ref(false)
const vendorPresentationsLoading = ref(false)
const categoryFiltersLoading = ref(false)

const homeTopTabDialogVisible = ref(false)
const homeSectionDialogVisible = ref(false)
const homeHeaderActionDialogVisible = ref(false)
const bannerDialogVisible = ref(false)
const activityCardDialogVisible = ref(false)
const supportItemDialogVisible = ref(false)
const downloadStepDialogVisible = ref(false)
const bottomNavItemDialogVisible = ref(false)
const quickActionDialogVisible = ref(false)
const loginCardDialogVisible = ref(false)
const mineShortcutDialogVisible = ref(false)
const mineMenuItemDialogVisible = ref(false)
const vendorPresentationDialogVisible = ref(false)
const categoryFilterDialogVisible = ref(false)

const savingHomeTopTab = ref(false)
const savingHomeSection = ref(false)
const savingHomeHeaderAction = ref(false)
const savingBanner = ref(false)
const savingActivityCard = ref(false)
const savingSupportItem = ref(false)
const savingDownloadStep = ref(false)
const savingBottomNavItem = ref(false)
const savingQuickAction = ref(false)
const savingLoginCard = ref(false)
const savingMineShortcut = ref(false)
const savingMineMenuItem = ref(false)
const savingVendorPresentation = ref(false)
const savingCategoryFilter = ref(false)

const editingHomeTopTab = ref<HomeTopTabRow | null>(null)
const editingHomeSection = ref<HomeSectionRow | null>(null)
const editingHomeHeaderAction = ref<HomeHeaderActionRow | null>(null)
const editingBanner = ref<FrontendBannerRow | null>(null)
const editingActivityCard = ref<ActivityCardRow | null>(null)
const editingSupportItem = ref<SupportItemRow | null>(null)
const editingDownloadStep = ref<DownloadStepRow | null>(null)
const editingBottomNavItem = ref<BottomNavItemRow | null>(null)
const editingQuickAction = ref<QuickActionRow | null>(null)
const editingLoginCard = ref<LoginCardRow | null>(null)
const editingMineShortcut = ref<MineShortcutRow | null>(null)
const editingMineMenuItem = ref<MineMenuItemRow | null>(null)
const editingVendorPresentation = ref<VendorPresentationRow | null>(null)
const editingCategoryFilter = ref<CategoryFilterRow | null>(null)

const bannerAssetInput = ref<HTMLInputElement | null>(null)
const quickActionAssetInput = ref<HTMLInputElement | null>(null)
const selectedBannerAsset = ref<File | null>(null)
const selectedQuickActionAsset = ref<File | null>(null)
const uploadingBannerAsset = ref(false)
const uploadingQuickActionAsset = ref(false)

const homeTopTabForm = reactive({
  tab_code: '',
  label: '',
  icon: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const homeSectionForm = reactive({
  section_code: '',
  label: '',
  icon: '',
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const homeHeaderActionForm = reactive({
  action_code: '',
  label: '',
  icon: '',
  description: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const bannerForm = reactive({
  banner_code: '',
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  label: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0,
  start_at: null as Date | null,
  end_at: null as Date | null
})

const activityCardForm = reactive({
  card_code: '',
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  label: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const supportItemForm = reactive({
  support_code: '',
  title: '',
  label: '',
  icon: '',
  description: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const downloadStepForm = reactive({
  step_code: '',
  title: '',
  label: '',
  description: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const bottomNavItemForm = reactive({
  nav_code: '',
  label: '',
  icon: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const quickActionForm = reactive({
  action_code: '',
  label: '',
  icon: '',
  description: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const loginCardForm = reactive({
  card_code: '',
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  label: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const mineShortcutForm = reactive({
  shortcut_code: '',
  label: '',
  icon: '',
  description: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const mineMenuItemForm = reactive({
  menu_code: '',
  label: '',
  icon: '',
  description: '',
  badge: '',
  accent: '',
  image_url: '',
  action_url: '',
  status: 1,
  sort_order: 0
})

const vendorPresentationForm = reactive({
  vendor_code: '',
  label: '',
  slot_label: '',
  live_label: '',
  fish_label: '',
  sports_label: '',
  board_label: '',
  lottery_label: '',
  accent: '',
  card_background: '',
  status: 1,
  sort_order: 0
})

const categoryFilterForm = reactive({
  category_key: '',
  kind: 'or',
  vendor_codes: [] as string[],
  types: [] as number[],
  type5_exclude_vendors: [] as string[],
  shuffle_split_at: null as number | null,
  status: 1,
  sort_order: 0
})

onMounted(async () => {
  await Promise.all([
    loadVendorOptions(),
    loadHomeTopTabs(),
    loadHomeSections(),
    loadHomeHeaderActions(),
    loadBanners(),
    loadActivityCards(),
    loadSupportItems(),
    loadDownloadSteps(),
    loadBottomNavItems(),
    loadQuickActions(),
    loadLoginCards(),
    loadMineShortcuts(),
    loadMineMenuItems(),
    loadVendorPresentations(),
    loadCategoryFilters()
  ])
})

function isReordering(section: ReorderSection) {
  return reorderingSection.value === section
}

function formatTypeLabels(values: number[]) {
  if (!values.length) {
    return '-'
  }

  return values
    .map((value) => gameTypeOptions.find((item) => item.value === value)?.label || String(value))
    .join(', ')
}

function formatWindow(startAt?: string | null, endAt?: string | null) {
  if (!startAt && !endAt) {
    return '长期有效'
  }
  return `${formatTime(startAt)} ~ ${formatTime(endAt)}`
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

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

async function copyTextWithMessage(text: string) {
  if (!text) {
    return
  }
  await copyText(text)
  ElMessage.success('地址已复制')
}

async function loadVendorOptions() {
  const { data } = await http.get<{ data: Array<{ vendor_code: string; name: string }> }>(
    '/admin/frontend-content/vendors'
  )
  vendorOptions.value = (data.data || []).map((item) => ({
    vendor_code: item.vendor_code,
    name: item.name
  }))
}

async function loadHomeTopTabs() {
  homeTopTabsLoading.value = true
  try {
    const { data } = await http.get<{ data: HomeTopTabRow[] }>('/admin/home-top-tabs')
    homeTopTabs.value = data.data || []
  } finally {
    homeTopTabsLoading.value = false
  }
}

async function loadHomeSections() {
  homeSectionsLoading.value = true
  try {
    const { data } = await http.get<{ data: HomeSectionRow[] }>('/admin/home-sections')
    homeSections.value = data.data || []
  } finally {
    homeSectionsLoading.value = false
  }
}

async function loadHomeHeaderActions() {
  homeHeaderActionsLoading.value = true
  try {
    const { data } = await http.get<{ data: HomeHeaderActionRow[] }>('/admin/home-header-actions')
    homeHeaderActions.value = data.data || []
  } finally {
    homeHeaderActionsLoading.value = false
  }
}

async function loadBanners() {
  bannersLoading.value = true
  try {
    const { data } = await http.get<{ data: FrontendBannerRow[] }>('/admin/frontend-banners')
    banners.value = data.data || []
  } finally {
    bannersLoading.value = false
  }
}

async function loadActivityCards() {
  activityCardsLoading.value = true
  try {
    const { data } = await http.get<{ data: ActivityCardRow[] }>('/admin/activity-cards')
    activityCards.value = data.data || []
  } finally {
    activityCardsLoading.value = false
  }
}

async function loadSupportItems() {
  supportItemsLoading.value = true
  try {
    const { data } = await http.get<{ data: SupportItemRow[] }>('/admin/support-items')
    supportItems.value = data.data || []
  } finally {
    supportItemsLoading.value = false
  }
}

async function loadDownloadSteps() {
  downloadStepsLoading.value = true
  try {
    const { data } = await http.get<{ data: DownloadStepRow[] }>('/admin/download-steps')
    downloadSteps.value = data.data || []
  } finally {
    downloadStepsLoading.value = false
  }
}

async function loadBottomNavItems() {
  bottomNavItemsLoading.value = true
  try {
    const { data } = await http.get<{ data: BottomNavItemRow[] }>('/admin/bottom-nav-items')
    bottomNavItems.value = data.data || []
  } finally {
    bottomNavItemsLoading.value = false
  }
}

async function loadQuickActions() {
  quickActionsLoading.value = true
  try {
    const { data } = await http.get<{ data: QuickActionRow[] }>('/admin/lobby-quick-actions')
    quickActions.value = data.data || []
  } finally {
    quickActionsLoading.value = false
  }
}

async function loadLoginCards() {
  loginCardsLoading.value = true
  try {
    const { data } = await http.get<{ data: LoginCardRow[] }>('/admin/login-cards')
    loginCards.value = data.data || []
  } finally {
    loginCardsLoading.value = false
  }
}

async function loadMineShortcuts() {
  mineShortcutsLoading.value = true
  try {
    const { data } = await http.get<{ data: MineShortcutRow[] }>('/admin/mine-shortcuts')
    mineShortcuts.value = data.data || []
  } finally {
    mineShortcutsLoading.value = false
  }
}

async function loadMineMenuItems() {
  mineMenuItemsLoading.value = true
  try {
    const { data } = await http.get<{ data: MineMenuItemRow[] }>('/admin/mine-menu-items')
    mineMenuItems.value = data.data || []
  } finally {
    mineMenuItemsLoading.value = false
  }
}

async function loadVendorPresentations() {
  vendorPresentationsLoading.value = true
  try {
    const { data } = await http.get<{ data: VendorPresentationRow[] }>(
      '/admin/vendor-presentations'
    )
    vendorPresentations.value = data.data || []
  } finally {
    vendorPresentationsLoading.value = false
  }
}

async function loadCategoryFilters() {
  categoryFiltersLoading.value = true
  try {
    const { data } = await http.get<{ data: CategoryFilterRow[] }>('/admin/category-filters')
    categoryFilters.value = data.data || []
  } finally {
    categoryFiltersLoading.value = false
  }
}

function resetAssetSelection(target: AssetTarget) {
  if (target === 'banner') {
    selectedBannerAsset.value = null
    if (bannerAssetInput.value) {
      bannerAssetInput.value.value = ''
    }
    return
  }

  selectedQuickActionAsset.value = null
  if (quickActionAssetInput.value) {
    quickActionAssetInput.value.value = ''
  }
}

function handleAssetChange(event: Event, target: AssetTarget) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] || null
  if (target === 'banner') {
    selectedBannerAsset.value = file
    return
  }
  selectedQuickActionAsset.value = file
}

async function uploadAsset(target: AssetTarget) {
  const file = target === 'banner' ? selectedBannerAsset.value : selectedQuickActionAsset.value
  if (!file) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  if (target === 'banner') {
    uploadingBannerAsset.value = true
  } else {
    uploadingQuickActionAsset.value = true
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('scope', target === 'banner' ? 'frontend-banner' : 'frontend-quick-action')
    const { data } = await http.post<{ data: SiteAssetUploadPayload }>(
      '/admin/site-assets/upload',
      formData
    )
    const assetURL = data.data.url
    if (target === 'banner') {
      bannerForm.image_url = assetURL
    } else {
      quickActionForm.image_url = assetURL
    }
    await copyText(assetURL)
    ElMessage.success('素材上传成功，地址已回填并复制')
    resetAssetSelection(target)
  } finally {
    if (target === 'banner') {
      uploadingBannerAsset.value = false
    } else {
      uploadingQuickActionAsset.value = false
    }
  }
}

function openHomeTopTabDialog(row?: HomeTopTabRow) {
  editingHomeTopTab.value = row || null
  homeTopTabForm.tab_code = row?.tab_code || ''
  homeTopTabForm.label = row?.label || ''
  homeTopTabForm.icon = row?.icon || ''
  homeTopTabForm.accent = row?.accent || ''
  homeTopTabForm.image_url = row?.image_url || ''
  homeTopTabForm.action_url = row?.action_url || ''
  homeTopTabForm.status = row?.status ?? 1
  homeTopTabForm.sort_order = row?.sort_order ?? 0
  homeTopTabDialogVisible.value = true
}

function openHomeSectionDialog(row?: HomeSectionRow) {
  editingHomeSection.value = row || null
  homeSectionForm.section_code = row?.section_code || ''
  homeSectionForm.label = row?.label || ''
  homeSectionForm.icon = row?.icon || ''
  homeSectionForm.title = row?.title || ''
  homeSectionForm.subtitle = row?.subtitle || ''
  homeSectionForm.description = row?.description || ''
  homeSectionForm.badge = row?.badge || ''
  homeSectionForm.accent = row?.accent || ''
  homeSectionForm.image_url = row?.image_url || ''
  homeSectionForm.action_url = row?.action_url || ''
  homeSectionForm.status = row?.status ?? 1
  homeSectionForm.sort_order = row?.sort_order ?? 0
  homeSectionDialogVisible.value = true
}

function openHomeHeaderActionDialog(row?: HomeHeaderActionRow) {
  editingHomeHeaderAction.value = row || null
  homeHeaderActionForm.action_code = row?.action_code || ''
  homeHeaderActionForm.label = row?.label || ''
  homeHeaderActionForm.icon = row?.icon || ''
  homeHeaderActionForm.description = row?.description || ''
  homeHeaderActionForm.accent = row?.accent || ''
  homeHeaderActionForm.image_url = row?.image_url || ''
  homeHeaderActionForm.action_url = row?.action_url || ''
  homeHeaderActionForm.status = row?.status ?? 1
  homeHeaderActionForm.sort_order = row?.sort_order ?? 0
  homeHeaderActionDialogVisible.value = true
}

function openBannerDialog(row?: FrontendBannerRow) {
  editingBanner.value = row || null
  bannerForm.banner_code = row?.banner_code || ''
  bannerForm.title = row?.title || ''
  bannerForm.subtitle = row?.subtitle || ''
  bannerForm.description = row?.description || ''
  bannerForm.badge = row?.badge || ''
  bannerForm.label = row?.label || ''
  bannerForm.accent = row?.accent || ''
  bannerForm.image_url = row?.image_url || ''
  bannerForm.action_url = row?.action_url || ''
  bannerForm.status = row?.status ?? 1
  bannerForm.sort_order = row?.sort_order ?? 0
  bannerForm.start_at = row?.start_at ? new Date(row.start_at) : null
  bannerForm.end_at = row?.end_at ? new Date(row.end_at) : null
  resetAssetSelection('banner')
  bannerDialogVisible.value = true
}

function openActivityCardDialog(row?: ActivityCardRow) {
  editingActivityCard.value = row || null
  activityCardForm.card_code = row?.card_code || ''
  activityCardForm.title = row?.title || ''
  activityCardForm.subtitle = row?.subtitle || ''
  activityCardForm.description = row?.description || ''
  activityCardForm.badge = row?.badge || ''
  activityCardForm.label = row?.label || ''
  activityCardForm.accent = row?.accent || ''
  activityCardForm.image_url = row?.image_url || ''
  activityCardForm.action_url = row?.action_url || ''
  activityCardForm.status = row?.status ?? 1
  activityCardForm.sort_order = row?.sort_order ?? 0
  activityCardDialogVisible.value = true
}

function openSupportItemDialog(row?: SupportItemRow) {
  editingSupportItem.value = row || null
  supportItemForm.support_code = row?.support_code || ''
  supportItemForm.title = row?.title || ''
  supportItemForm.label = row?.label || ''
  supportItemForm.icon = row?.icon || ''
  supportItemForm.description = row?.description || ''
  supportItemForm.accent = row?.accent || ''
  supportItemForm.image_url = row?.image_url || ''
  supportItemForm.action_url = row?.action_url || ''
  supportItemForm.status = row?.status ?? 1
  supportItemForm.sort_order = row?.sort_order ?? 0
  supportItemDialogVisible.value = true
}

function openDownloadStepDialog(row?: DownloadStepRow) {
  editingDownloadStep.value = row || null
  downloadStepForm.step_code = row?.step_code || ''
  downloadStepForm.title = row?.title || ''
  downloadStepForm.label = row?.label || ''
  downloadStepForm.description = row?.description || ''
  downloadStepForm.accent = row?.accent || ''
  downloadStepForm.image_url = row?.image_url || ''
  downloadStepForm.action_url = row?.action_url || ''
  downloadStepForm.status = row?.status ?? 1
  downloadStepForm.sort_order = row?.sort_order ?? 0
  downloadStepDialogVisible.value = true
}

function openBottomNavItemDialog(row?: BottomNavItemRow) {
  editingBottomNavItem.value = row || null
  bottomNavItemForm.nav_code = row?.nav_code || ''
  bottomNavItemForm.label = row?.label || ''
  bottomNavItemForm.icon = row?.icon || ''
  bottomNavItemForm.accent = row?.accent || ''
  bottomNavItemForm.image_url = row?.image_url || ''
  bottomNavItemForm.action_url = row?.action_url || ''
  bottomNavItemForm.status = row?.status ?? 1
  bottomNavItemForm.sort_order = row?.sort_order ?? 0
  bottomNavItemDialogVisible.value = true
}

function openQuickActionDialog(row?: QuickActionRow) {
  editingQuickAction.value = row || null
  quickActionForm.action_code = row?.action_code || ''
  quickActionForm.label = row?.label || ''
  quickActionForm.icon = row?.icon || ''
  quickActionForm.description = row?.description || ''
  quickActionForm.accent = row?.accent || ''
  quickActionForm.image_url = row?.image_url || ''
  quickActionForm.action_url = row?.action_url || ''
  quickActionForm.status = row?.status ?? 1
  quickActionForm.sort_order = row?.sort_order ?? 0
  resetAssetSelection('quickAction')
  quickActionDialogVisible.value = true
}

function openLoginCardDialog(row?: LoginCardRow) {
  editingLoginCard.value = row || null
  loginCardForm.card_code = row?.card_code || ''
  loginCardForm.title = row?.title || ''
  loginCardForm.subtitle = row?.subtitle || ''
  loginCardForm.description = row?.description || ''
  loginCardForm.badge = row?.badge || ''
  loginCardForm.label = row?.label || ''
  loginCardForm.accent = row?.accent || ''
  loginCardForm.image_url = row?.image_url || ''
  loginCardForm.action_url = row?.action_url || ''
  loginCardForm.status = row?.status ?? 1
  loginCardForm.sort_order = row?.sort_order ?? 0
  loginCardDialogVisible.value = true
}

function openMineShortcutDialog(row?: MineShortcutRow) {
  editingMineShortcut.value = row || null
  mineShortcutForm.shortcut_code = row?.shortcut_code || ''
  mineShortcutForm.label = row?.label || ''
  mineShortcutForm.icon = row?.icon || ''
  mineShortcutForm.description = row?.description || ''
  mineShortcutForm.accent = row?.accent || ''
  mineShortcutForm.image_url = row?.image_url || ''
  mineShortcutForm.action_url = row?.action_url || ''
  mineShortcutForm.status = row?.status ?? 1
  mineShortcutForm.sort_order = row?.sort_order ?? 0
  mineShortcutDialogVisible.value = true
}

function openMineMenuItemDialog(row?: MineMenuItemRow) {
  editingMineMenuItem.value = row || null
  mineMenuItemForm.menu_code = row?.menu_code || ''
  mineMenuItemForm.label = row?.label || ''
  mineMenuItemForm.icon = row?.icon || ''
  mineMenuItemForm.description = row?.description || ''
  mineMenuItemForm.badge = row?.badge || ''
  mineMenuItemForm.accent = row?.accent || ''
  mineMenuItemForm.image_url = row?.image_url || ''
  mineMenuItemForm.action_url = row?.action_url || ''
  mineMenuItemForm.status = row?.status ?? 1
  mineMenuItemForm.sort_order = row?.sort_order ?? 0
  mineMenuItemDialogVisible.value = true
}

function openVendorPresentationDialog(row?: VendorPresentationRow) {
  editingVendorPresentation.value = row || null
  vendorPresentationForm.vendor_code = row?.vendor_code || ''
  vendorPresentationForm.label = row?.label || ''
  vendorPresentationForm.slot_label = row?.slot_label || ''
  vendorPresentationForm.live_label = row?.live_label || ''
  vendorPresentationForm.fish_label = row?.fish_label || ''
  vendorPresentationForm.sports_label = row?.sports_label || ''
  vendorPresentationForm.board_label = row?.board_label || ''
  vendorPresentationForm.lottery_label = row?.lottery_label || ''
  vendorPresentationForm.accent = row?.accent || ''
  vendorPresentationForm.card_background = row?.card_background || ''
  vendorPresentationForm.status = row?.status ?? 1
  vendorPresentationForm.sort_order = row?.sort_order ?? 0
  vendorPresentationDialogVisible.value = true
}

function openCategoryFilterDialog(row?: CategoryFilterRow) {
  editingCategoryFilter.value = row || null
  categoryFilterForm.category_key = row?.category_key || ''
  categoryFilterForm.kind = row?.kind || 'or'
  categoryFilterForm.vendor_codes = [...(row?.vendor_codes || [])]
  categoryFilterForm.types = [...(row?.types || [])]
  categoryFilterForm.type5_exclude_vendors = [...(row?.type5_exclude_vendors || [])]
  categoryFilterForm.shuffle_split_at = row?.shuffle_split_at ?? null
  categoryFilterForm.status = row?.status ?? 1
  categoryFilterForm.sort_order = row?.sort_order ?? 0
  categoryFilterDialogVisible.value = true
}

async function submitHomeTopTab() {
  savingHomeTopTab.value = true
  try {
    const payload = {
      tab_code: homeTopTabForm.tab_code,
      label: homeTopTabForm.label,
      icon: homeTopTabForm.icon,
      accent: homeTopTabForm.accent,
      image_url: homeTopTabForm.image_url,
      action_url: homeTopTabForm.action_url,
      status: homeTopTabForm.status,
      sort_order: homeTopTabForm.sort_order
    }
    if (editingHomeTopTab.value) {
      await http.put(`/admin/home-top-tabs/${editingHomeTopTab.value.id}`, payload)
    } else {
      await http.post('/admin/home-top-tabs', payload)
    }
    ElMessage.success('顶部分类已保存')
    homeTopTabDialogVisible.value = false
    await loadHomeTopTabs()
  } finally {
    savingHomeTopTab.value = false
  }
}

async function submitHomeSection() {
  savingHomeSection.value = true
  try {
    const payload = {
      section_code: homeSectionForm.section_code,
      label: homeSectionForm.label,
      icon: homeSectionForm.icon,
      title: homeSectionForm.title,
      subtitle: homeSectionForm.subtitle,
      description: homeSectionForm.description,
      badge: homeSectionForm.badge,
      accent: homeSectionForm.accent,
      image_url: homeSectionForm.image_url,
      action_url: homeSectionForm.action_url,
      status: homeSectionForm.status,
      sort_order: homeSectionForm.sort_order
    }
    if (editingHomeSection.value) {
      await http.put(`/admin/home-sections/${editingHomeSection.value.id}`, payload)
    } else {
      await http.post('/admin/home-sections', payload)
    }
    ElMessage.success('首页分区已保存')
    homeSectionDialogVisible.value = false
    await loadHomeSections()
  } finally {
    savingHomeSection.value = false
  }
}

async function submitHomeHeaderAction() {
  savingHomeHeaderAction.value = true
  try {
    const payload = {
      action_code: homeHeaderActionForm.action_code,
      label: homeHeaderActionForm.label,
      icon: homeHeaderActionForm.icon,
      description: homeHeaderActionForm.description,
      accent: homeHeaderActionForm.accent,
      image_url: homeHeaderActionForm.image_url,
      action_url: homeHeaderActionForm.action_url,
      status: homeHeaderActionForm.status,
      sort_order: homeHeaderActionForm.sort_order
    }
    if (editingHomeHeaderAction.value) {
      await http.put(`/admin/home-header-actions/${editingHomeHeaderAction.value.id}`, payload)
    } else {
      await http.post('/admin/home-header-actions', payload)
    }
    ElMessage.success('首页头部动作已保存')
    homeHeaderActionDialogVisible.value = false
    await loadHomeHeaderActions()
  } finally {
    savingHomeHeaderAction.value = false
  }
}

async function submitBanner() {
  savingBanner.value = true
  try {
    const payload = {
      banner_code: bannerForm.banner_code,
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      description: bannerForm.description,
      badge: bannerForm.badge,
      label: bannerForm.label,
      accent: bannerForm.accent,
      image_url: bannerForm.image_url,
      action_url: bannerForm.action_url,
      status: bannerForm.status,
      sort_order: bannerForm.sort_order,
      start_at: bannerForm.start_at?.toISOString() || '',
      end_at: bannerForm.end_at?.toISOString() || ''
    }
    if (editingBanner.value) {
      await http.put(`/admin/frontend-banners/${editingBanner.value.id}`, payload)
    } else {
      await http.post('/admin/frontend-banners', payload)
    }
    ElMessage.success('Banner 已保存')
    bannerDialogVisible.value = false
    await loadBanners()
  } finally {
    savingBanner.value = false
  }
}

async function submitActivityCard() {
  savingActivityCard.value = true
  try {
    const payload = {
      card_code: activityCardForm.card_code,
      title: activityCardForm.title,
      subtitle: activityCardForm.subtitle,
      description: activityCardForm.description,
      badge: activityCardForm.badge,
      label: activityCardForm.label,
      accent: activityCardForm.accent,
      image_url: activityCardForm.image_url,
      action_url: activityCardForm.action_url,
      status: activityCardForm.status,
      sort_order: activityCardForm.sort_order
    }
    if (editingActivityCard.value) {
      await http.put(`/admin/activity-cards/${editingActivityCard.value.id}`, payload)
    } else {
      await http.post('/admin/activity-cards', payload)
    }
    ElMessage.success('活动卡已保存')
    activityCardDialogVisible.value = false
    await loadActivityCards()
  } finally {
    savingActivityCard.value = false
  }
}

async function submitSupportItem() {
  savingSupportItem.value = true
  try {
    const payload = {
      support_code: supportItemForm.support_code,
      title: supportItemForm.title,
      label: supportItemForm.label,
      icon: supportItemForm.icon,
      description: supportItemForm.description,
      accent: supportItemForm.accent,
      image_url: supportItemForm.image_url,
      action_url: supportItemForm.action_url,
      status: supportItemForm.status,
      sort_order: supportItemForm.sort_order
    }
    if (editingSupportItem.value) {
      await http.put(`/admin/support-items/${editingSupportItem.value.id}`, payload)
    } else {
      await http.post('/admin/support-items', payload)
    }
    ElMessage.success('客服入口已保存')
    supportItemDialogVisible.value = false
    await loadSupportItems()
  } finally {
    savingSupportItem.value = false
  }
}

async function submitDownloadStep() {
  savingDownloadStep.value = true
  try {
    const payload = {
      step_code: downloadStepForm.step_code,
      title: downloadStepForm.title,
      label: downloadStepForm.label,
      description: downloadStepForm.description,
      accent: downloadStepForm.accent,
      image_url: downloadStepForm.image_url,
      action_url: downloadStepForm.action_url,
      status: downloadStepForm.status,
      sort_order: downloadStepForm.sort_order
    }
    if (editingDownloadStep.value) {
      await http.put(`/admin/download-steps/${editingDownloadStep.value.id}`, payload)
    } else {
      await http.post('/admin/download-steps', payload)
    }
    ElMessage.success('下载步骤已保存')
    downloadStepDialogVisible.value = false
    await loadDownloadSteps()
  } finally {
    savingDownloadStep.value = false
  }
}

async function submitBottomNavItem() {
  savingBottomNavItem.value = true
  try {
    const payload = {
      nav_code: bottomNavItemForm.nav_code,
      label: bottomNavItemForm.label,
      icon: bottomNavItemForm.icon,
      accent: bottomNavItemForm.accent,
      image_url: bottomNavItemForm.image_url,
      action_url: bottomNavItemForm.action_url,
      status: bottomNavItemForm.status,
      sort_order: bottomNavItemForm.sort_order
    }
    if (editingBottomNavItem.value) {
      await http.put(`/admin/bottom-nav-items/${editingBottomNavItem.value.id}`, payload)
    } else {
      await http.post('/admin/bottom-nav-items', payload)
    }
    ElMessage.success('底部导航已保存')
    bottomNavItemDialogVisible.value = false
    await loadBottomNavItems()
  } finally {
    savingBottomNavItem.value = false
  }
}

async function submitQuickAction() {
  savingQuickAction.value = true
  try {
    const payload = {
      action_code: quickActionForm.action_code,
      label: quickActionForm.label,
      icon: quickActionForm.icon,
      description: quickActionForm.description,
      accent: quickActionForm.accent,
      image_url: quickActionForm.image_url,
      action_url: quickActionForm.action_url,
      status: quickActionForm.status,
      sort_order: quickActionForm.sort_order
    }
    if (editingQuickAction.value) {
      await http.put(`/admin/lobby-quick-actions/${editingQuickAction.value.id}`, payload)
    } else {
      await http.post('/admin/lobby-quick-actions', payload)
    }
    ElMessage.success('快捷入口已保存')
    quickActionDialogVisible.value = false
    await loadQuickActions()
  } finally {
    savingQuickAction.value = false
  }
}

async function submitLoginCard() {
  savingLoginCard.value = true
  try {
    const payload = {
      card_code: loginCardForm.card_code,
      title: loginCardForm.title,
      subtitle: loginCardForm.subtitle,
      description: loginCardForm.description,
      badge: loginCardForm.badge,
      label: loginCardForm.label,
      accent: loginCardForm.accent,
      image_url: loginCardForm.image_url,
      action_url: loginCardForm.action_url,
      status: loginCardForm.status,
      sort_order: loginCardForm.sort_order
    }
    if (editingLoginCard.value) {
      await http.put(`/admin/login-cards/${editingLoginCard.value.id}`, payload)
    } else {
      await http.post('/admin/login-cards', payload)
    }
    ElMessage.success('登录卡片已保存')
    loginCardDialogVisible.value = false
    await loadLoginCards()
  } finally {
    savingLoginCard.value = false
  }
}

async function submitMineShortcut() {
  savingMineShortcut.value = true
  try {
    const payload = {
      shortcut_code: mineShortcutForm.shortcut_code,
      label: mineShortcutForm.label,
      icon: mineShortcutForm.icon,
      description: mineShortcutForm.description,
      accent: mineShortcutForm.accent,
      image_url: mineShortcutForm.image_url,
      action_url: mineShortcutForm.action_url,
      status: mineShortcutForm.status,
      sort_order: mineShortcutForm.sort_order
    }
    if (editingMineShortcut.value) {
      await http.put(`/admin/mine-shortcuts/${editingMineShortcut.value.id}`, payload)
    } else {
      await http.post('/admin/mine-shortcuts', payload)
    }
    ElMessage.success('我的页快捷入口已保存')
    mineShortcutDialogVisible.value = false
    await loadMineShortcuts()
  } finally {
    savingMineShortcut.value = false
  }
}

async function submitMineMenuItem() {
  savingMineMenuItem.value = true
  try {
    const payload = {
      menu_code: mineMenuItemForm.menu_code,
      label: mineMenuItemForm.label,
      icon: mineMenuItemForm.icon,
      description: mineMenuItemForm.description,
      badge: mineMenuItemForm.badge,
      accent: mineMenuItemForm.accent,
      image_url: mineMenuItemForm.image_url,
      action_url: mineMenuItemForm.action_url,
      status: mineMenuItemForm.status,
      sort_order: mineMenuItemForm.sort_order
    }
    if (editingMineMenuItem.value) {
      await http.put(`/admin/mine-menu-items/${editingMineMenuItem.value.id}`, payload)
    } else {
      await http.post('/admin/mine-menu-items', payload)
    }
    ElMessage.success('我的页菜单已保存')
    mineMenuItemDialogVisible.value = false
    await loadMineMenuItems()
  } finally {
    savingMineMenuItem.value = false
  }
}

async function submitVendorPresentation() {
  savingVendorPresentation.value = true
  try {
    const payload = {
      vendor_code: vendorPresentationForm.vendor_code,
      label: vendorPresentationForm.label,
      slot_label: vendorPresentationForm.slot_label,
      live_label: vendorPresentationForm.live_label,
      fish_label: vendorPresentationForm.fish_label,
      sports_label: vendorPresentationForm.sports_label,
      board_label: vendorPresentationForm.board_label,
      lottery_label: vendorPresentationForm.lottery_label,
      accent: vendorPresentationForm.accent,
      card_background: vendorPresentationForm.card_background,
      status: vendorPresentationForm.status,
      sort_order: vendorPresentationForm.sort_order
    }
    if (editingVendorPresentation.value) {
      await http.put(`/admin/vendor-presentations/${editingVendorPresentation.value.id}`, payload)
    } else {
      await http.post('/admin/vendor-presentations', payload)
    }
    ElMessage.success('厂商展示已保存')
    vendorPresentationDialogVisible.value = false
    await loadVendorPresentations()
  } finally {
    savingVendorPresentation.value = false
  }
}

async function submitCategoryFilter() {
  savingCategoryFilter.value = true
  try {
    const payload = {
      category_key: categoryFilterForm.category_key,
      kind: categoryFilterForm.kind,
      vendor_codes: categoryFilterForm.vendor_codes,
      types: categoryFilterForm.types,
      type5_exclude_vendors: categoryFilterForm.type5_exclude_vendors,
      shuffle_split_at: categoryFilterForm.shuffle_split_at,
      status: categoryFilterForm.status,
      sort_order: categoryFilterForm.sort_order
    }
    if (editingCategoryFilter.value) {
      await http.put(`/admin/category-filters/${editingCategoryFilter.value.id}`, payload)
    } else {
      await http.post('/admin/category-filters', payload)
    }
    ElMessage.success('分类规则已保存')
    categoryFilterDialogVisible.value = false
    await loadCategoryFilters()
  } finally {
    savingCategoryFilter.value = false
  }
}

async function removeHomeTopTab(row: HomeTopTabRow) {
  await ElMessageBox.confirm(`确定删除顶部分类「${row.label || row.tab_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/home-top-tabs/${row.id}`)
  ElMessage.success('顶部分类已删除')
  await loadHomeTopTabs()
}

async function removeHomeSection(row: HomeSectionRow) {
  await ElMessageBox.confirm(`确定删除首页分区「${row.label || row.section_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/home-sections/${row.id}`)
  ElMessage.success('首页分区已删除')
  await loadHomeSections()
}

async function removeHomeHeaderAction(row: HomeHeaderActionRow) {
  await ElMessageBox.confirm(`确定删除头部动作「${row.label || row.action_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/home-header-actions/${row.id}`)
  ElMessage.success('首页头部动作已删除')
  await loadHomeHeaderActions()
}

async function removeBanner(row: FrontendBannerRow) {
  await ElMessageBox.confirm(`确定删除 Banner「${row.title}」吗？`, '提示', { type: 'warning' })
  await http.delete(`/admin/frontend-banners/${row.id}`)
  ElMessage.success('Banner 已删除')
  await loadBanners()
}

async function removeActivityCard(row: ActivityCardRow) {
  await ElMessageBox.confirm(`确定删除活动卡「${row.title || row.card_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/activity-cards/${row.id}`)
  ElMessage.success('活动卡已删除')
  await loadActivityCards()
}

async function removeSupportItem(row: SupportItemRow) {
  await ElMessageBox.confirm(`确定删除客服入口「${row.title || row.support_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/support-items/${row.id}`)
  ElMessage.success('客服入口已删除')
  await loadSupportItems()
}

async function removeDownloadStep(row: DownloadStepRow) {
  await ElMessageBox.confirm(`确定删除下载步骤「${row.title || row.step_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/download-steps/${row.id}`)
  ElMessage.success('下载步骤已删除')
  await loadDownloadSteps()
}

async function removeBottomNavItem(row: BottomNavItemRow) {
  await ElMessageBox.confirm(`确定删除底部导航「${row.label || row.nav_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/bottom-nav-items/${row.id}`)
  ElMessage.success('底部导航已删除')
  await loadBottomNavItems()
}

async function removeQuickAction(row: QuickActionRow) {
  await ElMessageBox.confirm(`确定删除快捷入口「${row.label}」吗？`, '提示', { type: 'warning' })
  await http.delete(`/admin/lobby-quick-actions/${row.id}`)
  ElMessage.success('快捷入口已删除')
  await loadQuickActions()
}

async function removeLoginCard(row: LoginCardRow) {
  await ElMessageBox.confirm(`确定删除登录卡片「${row.title || row.card_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/login-cards/${row.id}`)
  ElMessage.success('登录卡片已删除')
  await loadLoginCards()
}

async function removeMineShortcut(row: MineShortcutRow) {
  await ElMessageBox.confirm(`确定删除快捷入口「${row.label || row.shortcut_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/mine-shortcuts/${row.id}`)
  ElMessage.success('我的页快捷入口已删除')
  await loadMineShortcuts()
}

async function removeMineMenuItem(row: MineMenuItemRow) {
  await ElMessageBox.confirm(`确定删除菜单项「${row.label || row.menu_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/mine-menu-items/${row.id}`)
  ElMessage.success('我的页菜单已删除')
  await loadMineMenuItems()
}

async function removeVendorPresentation(row: VendorPresentationRow) {
  await ElMessageBox.confirm(`确定删除厂商展示「${row.vendor_code}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/vendor-presentations/${row.id}`)
  ElMessage.success('厂商展示已删除')
  await loadVendorPresentations()
}

async function removeCategoryFilter(row: CategoryFilterRow) {
  await ElMessageBox.confirm(`确定删除分类规则「${row.category_key}」吗？`, '提示', {
    type: 'warning'
  })
  await http.delete(`/admin/category-filters/${row.id}`)
  ElMessage.success('分类规则已删除')
  await loadCategoryFilters()
}

function buildHomeTopTabRowPayload(row: HomeTopTabRow, sortOrder: number) {
  return {
    tab_code: row.tab_code,
    label: row.label,
    icon: row.icon,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildHomeSectionRowPayload(row: HomeSectionRow, sortOrder: number) {
  return {
    section_code: row.section_code,
    label: row.label,
    icon: row.icon,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    badge: row.badge,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildHomeHeaderActionRowPayload(row: HomeHeaderActionRow, sortOrder: number) {
  return {
    action_code: row.action_code,
    label: row.label,
    icon: row.icon,
    description: row.description,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildBannerRowPayload(row: FrontendBannerRow, sortOrder: number) {
  return {
    banner_code: row.banner_code,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    badge: row.badge,
    label: row.label,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder,
    start_at: row.start_at || '',
    end_at: row.end_at || ''
  }
}

function buildActivityCardRowPayload(row: ActivityCardRow, sortOrder: number) {
  return {
    card_code: row.card_code,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    badge: row.badge,
    label: row.label,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildSupportItemRowPayload(row: SupportItemRow, sortOrder: number) {
  return {
    support_code: row.support_code,
    title: row.title,
    label: row.label,
    icon: row.icon,
    description: row.description,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildDownloadStepRowPayload(row: DownloadStepRow, sortOrder: number) {
  return {
    step_code: row.step_code,
    title: row.title,
    label: row.label,
    description: row.description,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildBottomNavItemRowPayload(row: BottomNavItemRow, sortOrder: number) {
  return {
    nav_code: row.nav_code,
    label: row.label,
    icon: row.icon,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildQuickActionRowPayload(row: QuickActionRow, sortOrder: number) {
  return {
    action_code: row.action_code,
    label: row.label,
    icon: row.icon,
    description: row.description,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildLoginCardRowPayload(row: LoginCardRow, sortOrder: number) {
  return {
    card_code: row.card_code,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    badge: row.badge,
    label: row.label,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildMineShortcutRowPayload(row: MineShortcutRow, sortOrder: number) {
  return {
    shortcut_code: row.shortcut_code,
    label: row.label,
    icon: row.icon,
    description: row.description,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildMineMenuItemRowPayload(row: MineMenuItemRow, sortOrder: number) {
  return {
    menu_code: row.menu_code,
    label: row.label,
    icon: row.icon,
    description: row.description,
    badge: row.badge,
    accent: row.accent,
    image_url: row.image_url,
    action_url: row.action_url,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildVendorPresentationRowPayload(row: VendorPresentationRow, sortOrder: number) {
  return {
    vendor_code: row.vendor_code,
    label: row.label,
    slot_label: row.slot_label,
    live_label: row.live_label,
    fish_label: row.fish_label,
    sports_label: row.sports_label,
    board_label: row.board_label,
    lottery_label: row.lottery_label,
    accent: row.accent,
    card_background: row.card_background,
    status: row.status,
    sort_order: sortOrder
  }
}

function buildCategoryFilterRowPayload(row: CategoryFilterRow, sortOrder: number) {
  return {
    category_key: row.category_key,
    kind: row.kind,
    vendor_codes: row.vendor_codes,
    types: row.types,
    type5_exclude_vendors: row.type5_exclude_vendors,
    shuffle_split_at: row.shuffle_split_at,
    status: row.status,
    sort_order: sortOrder
  }
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items]
  const [current] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, current)
  return next
}

async function reorderContent<T extends { id: number }>(
  section: ReorderSection,
  items: T[],
  index: number,
  direction: -1 | 1,
  endpoint: string,
  buildPayload: (row: T, sortOrder: number) => Record<string, unknown>,
  reload: () => Promise<void>,
  successMessage: string
) {
  if (!canManage.value) {
    return
  }

  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= items.length) {
    return
  }

  const reordered = moveArrayItem(items, index, targetIndex)
  reorderingSection.value = section
  try {
    const total = reordered.length
    for (const [position, row] of reordered.entries()) {
      const sortOrder = (total - position) * 10
      await http.put(`${endpoint}/${row.id}`, buildPayload(row, sortOrder))
    }
    ElMessage.success(successMessage)
    await reload()
  } finally {
    reorderingSection.value = ''
  }
}

async function moveHomeTopTab(index: number, direction: -1 | 1) {
  await reorderContent(
    'top-tabs',
    homeTopTabs.value,
    index,
    direction,
    '/admin/home-top-tabs',
    buildHomeTopTabRowPayload,
    loadHomeTopTabs,
    '顶部分类顺序已更新'
  )
}

async function moveHomeSection(index: number, direction: -1 | 1) {
  await reorderContent(
    'home-sections',
    homeSections.value,
    index,
    direction,
    '/admin/home-sections',
    buildHomeSectionRowPayload,
    loadHomeSections,
    '首页分区顺序已更新'
  )
}

async function moveHomeHeaderAction(index: number, direction: -1 | 1) {
  await reorderContent(
    'header-actions',
    homeHeaderActions.value,
    index,
    direction,
    '/admin/home-header-actions',
    buildHomeHeaderActionRowPayload,
    loadHomeHeaderActions,
    '首页头部动作顺序已更新'
  )
}

async function moveBanner(index: number, direction: -1 | 1) {
  await reorderContent(
    'banners',
    banners.value,
    index,
    direction,
    '/admin/frontend-banners',
    buildBannerRowPayload,
    loadBanners,
    'Banner 顺序已更新'
  )
}

async function moveActivityCard(index: number, direction: -1 | 1) {
  await reorderContent(
    'activity-cards',
    activityCards.value,
    index,
    direction,
    '/admin/activity-cards',
    buildActivityCardRowPayload,
    loadActivityCards,
    '活动卡顺序已更新'
  )
}

async function moveSupportItem(index: number, direction: -1 | 1) {
  await reorderContent(
    'support-items',
    supportItems.value,
    index,
    direction,
    '/admin/support-items',
    buildSupportItemRowPayload,
    loadSupportItems,
    '客服入口顺序已更新'
  )
}

async function moveDownloadStep(index: number, direction: -1 | 1) {
  await reorderContent(
    'download-steps',
    downloadSteps.value,
    index,
    direction,
    '/admin/download-steps',
    buildDownloadStepRowPayload,
    loadDownloadSteps,
    '下载步骤顺序已更新'
  )
}

async function moveBottomNavItem(index: number, direction: -1 | 1) {
  await reorderContent(
    'bottom-nav-items',
    bottomNavItems.value,
    index,
    direction,
    '/admin/bottom-nav-items',
    buildBottomNavItemRowPayload,
    loadBottomNavItems,
    '底部导航顺序已更新'
  )
}

async function moveQuickAction(index: number, direction: -1 | 1) {
  await reorderContent(
    'quick-actions',
    quickActions.value,
    index,
    direction,
    '/admin/lobby-quick-actions',
    buildQuickActionRowPayload,
    loadQuickActions,
    '快捷入口顺序已更新'
  )
}

async function moveLoginCard(index: number, direction: -1 | 1) {
  await reorderContent(
    'login-cards',
    loginCards.value,
    index,
    direction,
    '/admin/login-cards',
    buildLoginCardRowPayload,
    loadLoginCards,
    '登录卡片顺序已更新'
  )
}

async function moveMineShortcut(index: number, direction: -1 | 1) {
  await reorderContent(
    'mine-shortcuts',
    mineShortcuts.value,
    index,
    direction,
    '/admin/mine-shortcuts',
    buildMineShortcutRowPayload,
    loadMineShortcuts,
    '我的页快捷入口顺序已更新'
  )
}

async function moveMineMenuItem(index: number, direction: -1 | 1) {
  await reorderContent(
    'mine-menu-items',
    mineMenuItems.value,
    index,
    direction,
    '/admin/mine-menu-items',
    buildMineMenuItemRowPayload,
    loadMineMenuItems,
    '我的页菜单顺序已更新'
  )
}

async function moveVendorPresentation(index: number, direction: -1 | 1) {
  await reorderContent(
    'vendors',
    vendorPresentations.value,
    index,
    direction,
    '/admin/vendor-presentations',
    buildVendorPresentationRowPayload,
    loadVendorPresentations,
    '厂商展示顺序已更新'
  )
}

async function moveCategoryFilter(index: number, direction: -1 | 1) {
  await reorderContent(
    'categories',
    categoryFilters.value,
    index,
    direction,
    '/admin/category-filters',
    buildCategoryFilterRowPayload,
    loadCategoryFilters,
    '分类规则顺序已更新'
  )
}

function buildBannerPreviewStyle() {
  const accent = bannerForm.accent || '#5b5bd6'
  const overlay = 'linear-gradient(135deg, rgba(15,23,42,0.26) 0%, rgba(15,23,42,0.9) 100%)'
  if (!bannerForm.image_url) {
    return {
      background: `linear-gradient(135deg, ${accent} 0%, rgba(15,23,42,0.92) 100%)`
    }
  }
  return {
    backgroundImage: `${overlay}, url(${bannerForm.image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: accent
  }
}

function buildMediaPreviewStyle(accent?: string, imageUrl?: string) {
  const resolved = accent || '#5b5bd6'
  const overlay = 'linear-gradient(135deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.9) 100%)'
  if (!imageUrl) {
    return {
      background: `linear-gradient(135deg, ${resolved} 0%, rgba(15,23,42,0.92) 100%)`
    }
  }
  return {
    backgroundImage: `${overlay}, url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: resolved
  }
}

function buildQuickActionPreviewStyle(accent?: string) {
  const resolved = accent || '#d5a12d'
  return {
    background: `linear-gradient(135deg, ${resolved} 0%, rgba(15,23,42,0.92) 100%)`
  }
}

function buildVendorCardStyle(background?: string, accent?: string) {
  if (background) {
    return { background }
  }
  const resolved = accent || '#1e6a47'
  return {
    background: `linear-gradient(135deg, ${resolved} 0%, rgba(15,23,42,0.92) 100%)`
  }
}
</script>

<style scoped>
.frontend-content-view {
  display: grid;
  gap: 16px;
}

.page-card {
  background: rgb(255 252 246 / 94%);
  border: 1px solid rgb(44 61 42 / 10%);
  border-radius: 28px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1b2b1f;
}

.page-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #6f7b6d;
}

.top-alert {
  margin-bottom: 16px;
}

.content-tabs {
  margin-top: 8px;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-copy {
  font-size: 13px;
  line-height: 1.7;
  color: #64706a;
}

.cell-stack {
  display: grid;
  gap: 4px;
}

.muted {
  font-size: 12px;
  color: #8a938d;
}

.thumb {
  width: 72px;
  height: 42px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 18px rgb(18 34 24 / 16%);
}

.thumb--square {
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.icon-chip {
  display: flex;
  width: 48px;
  height: 48px;
  font-size: 14px;
  font-weight: 700;
  color: #3b2f12;
  background: linear-gradient(135deg, #ead7a2 0%, #d39b2a 100%);
  border-radius: 14px;
  align-items: center;
  justify-content: center;
}

.color-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 8%);
}

.vendor-table-card {
  min-height: 92px;
  padding: 12px;
  color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgb(18 34 24 / 18%);
}

.vendor-table-card__badge {
  display: inline-flex;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
}

.vendor-table-card__title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
}

.vendor-table-card__desc {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: rgb(255 255 255 / 78%);
}

.form-grid {
  display: grid;
  gap: 14px;
}

.form-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-grid--4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.full-width {
  width: 100%;
}

.asset-upload-field {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: -2px 0 18px;
}

.asset-picker {
  position: relative;
  display: inline-flex;
  min-width: 240px;
  padding: 10px 14px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  align-items: center;
}

.asset-picker--compact {
  min-width: 260px;
}

.asset-picker input {
  position: absolute;
  cursor: pointer;
  opacity: 0;
  inset: 0;
}

.dialog-preview-card {
  position: relative;
  padding: 18px;
  overflow: hidden;
  color: #fff;
  border-radius: 24px;
  box-shadow: 0 14px 30px rgb(18 34 24 / 16%);
}

.banner-preview-card {
  min-height: 186px;
}

.vendor-preview-card {
  min-height: 150px;
}

.dialog-preview-card__badge {
  display: inline-flex;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
}

.dialog-preview-card__title {
  margin-top: 14px;
  font-size: 20px;
  font-weight: 700;
}

.dialog-preview-card__subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: rgb(255 255 255 / 82%);
}

.dialog-preview-card__desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: rgb(255 255 255 / 76%);
}

.dialog-preview-card__action {
  display: inline-flex;
  padding: 8px 12px;
  margin-top: 16px;
  font-size: 12px;
  font-weight: 700;
  background: rgb(255 255 255 / 14%);
  border-radius: 999px;
}

.quick-preview-card {
  display: flex;
  padding: 16px;
  color: #fff;
  border-radius: 22px;
  box-shadow: 0 14px 30px rgb(18 34 24 / 16%);
  align-items: center;
  gap: 16px;
}

.quick-preview-card__icon {
  display: flex;
  width: 64px;
  height: 64px;
  overflow: hidden;
  font-size: 18px;
  font-weight: 700;
  background: rgb(255 255 255 / 14%);
  border-radius: 18px;
  align-items: center;
  justify-content: center;
}

.quick-preview-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-preview-card__copy {
  min-width: 0;
  flex: 1;
}

.quick-preview-card__title {
  font-size: 18px;
  font-weight: 700;
}

.quick-preview-card__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: rgb(255 255 255 / 78%);
}

@media (width <= 900px) {
  .panel-toolbar,
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid--2,
  .form-grid--3,
  .form-grid--4 {
    grid-template-columns: 1fr;
  }

  .asset-picker--compact {
    width: 100%;
    min-width: 0;
  }

  .quick-preview-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
