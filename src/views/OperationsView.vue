<template>
  <div class="page-stack">
    <el-card shadow="never" class="hero-card">
      <div class="hero-copy">
        <div>
          <div class="hero-title">运营编排台</div>
          <div class="hero-subtitle">
            把大厅内容、推广代理、活动和优惠收进同一套后台，后面接 H5、TG Mini
            App、小程序都能共用这批配置。
          </div>
        </div>
        <div class="hero-tags">
          <el-tag type="primary">公告</el-tag>
          <el-tag type="success">推荐位</el-tag>
          <el-tag type="warning">推广代理</el-tag>
          <el-tag>活动</el-tag>
          <el-tag type="danger">优惠</el-tag>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="page-card">
      <el-tabs v-model="activeTab" class="ops-tabs">
        <el-tab-pane label="大厅公告" name="announcements">
          <div class="section-head">
            <div class="section-copy">统一管理首页通知、站内广播和跨端公告文案。</div>
            <el-button v-if="canManage" type="primary" @click="openAnnouncementDialog()"
              >新建公告</el-button
            >
          </div>
          <el-table :data="announcements" stripe v-loading="announcementsLoading">
            <el-table-column prop="title" label="标题" min-width="180" />
            <el-table-column prop="content" label="内容" min-width="280" show-overflow-tooltip />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" min-width="90" />
            <el-table-column label="生效时间" min-width="220">
              <template #default="{ row }">{{ formatWindow(row.start_at, row.end_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :disabled="!canManage"
                  @click="openAnnouncementDialog(row)"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="推荐位" name="slots">
          <div class="section-head">
            <div class="section-copy">维护大厅主推位、专题位和活动位，直接绑定具体游戏。</div>
            <el-button v-if="canManage" type="primary" @click="openSlotDialog()"
              >新建推荐位</el-button
            >
          </div>
          <el-table :data="featuredSlots" stripe v-loading="slotsLoading">
            <el-table-column prop="slot_code" label="位置编码" min-width="120" />
            <el-table-column prop="title" label="标题" min-width="140" />
            <el-table-column label="绑定游戏" min-width="220">
              <template #default="{ row }">
                <div class="game-cell">
                  <span class="game-name">{{ row.game_name }}</span>
                  <span class="game-meta">{{ row.game_code }} · {{ row.vendor_code }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="subtitle" label="副标题" min-width="220" show-overflow-tooltip />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_order" label="排序" min-width="90" />
            <el-table-column label="投放时间" min-width="220">
              <template #default="{ row }">{{ formatWindow(row.start_at, row.end_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :disabled="!canManage" @click="openSlotDialog(row)"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="推广代理" name="agents">
          <div class="section-head">
            <div class="section-copy"
              >管理代理编号、邀请码、跳转页和分佣比例，给后续推广域打底。</div
            >
            <el-button v-if="canManage" type="primary" @click="openAgentDialog()"
              >新建代理</el-button
            >
          </div>
          <el-table :data="promotionAgents" stripe v-loading="agentsLoading">
            <el-table-column prop="name" label="代理名称" min-width="150" />
            <el-table-column prop="agent_code" label="代理编号" min-width="130" />
            <el-table-column prop="invite_code" label="邀请码" min-width="130" />
            <el-table-column
              prop="landing_page_url"
              label="落地页"
              min-width="220"
              show-overflow-tooltip
            />
            <el-table-column label="分佣 / 返点" min-width="150">
              <template #default="{ row }">
                {{ formatRate(row.commission_rate) }} / {{ formatRate(row.rebate_rate) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :disabled="!canManage" @click="openAgentDialog(row)"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="活动配置" name="campaigns">
          <div class="section-head">
            <div class="section-copy"
              >配置首充、返利、签到等活动展示内容，支持按供应商或全平台投放。</div
            >
            <el-button v-if="canManage" type="primary" @click="openCampaignDialog()"
              >新建活动</el-button
            >
          </div>
          <el-table :data="campaigns" stripe v-loading="campaignsLoading">
            <el-table-column prop="title" label="活动标题" min-width="160" />
            <el-table-column prop="vendor_code" label="供应商" min-width="110">
              <template #default="{ row }">{{ row.vendor_code || '全平台' }}</template>
            </el-table-column>
            <el-table-column prop="reward_type" label="奖励类型" min-width="120" />
            <el-table-column label="奖励值" min-width="140">
              <template #default="{ row }">
                {{ formatMoney(row.reward_value) }}
                <span v-if="row.reward_limit > 0" class="muted-inline">
                  / 上限 {{ formatMoney(row.reward_limit) }}</span
                >
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
            <el-table-column label="投放时间" min-width="220">
              <template #default="{ row }">{{ formatWindow(row.start_at, row.end_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :disabled="!canManage"
                  @click="openCampaignDialog(row)"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="优惠配置" name="bonuses">
          <div class="section-head">
            <div class="section-copy"
              >统一维护送彩金、充值返利、签到奖励等规则元数据，后面可以继续接自动发放引擎。</div
            >
            <el-button v-if="canManage" type="primary" @click="openBonusDialog()"
              >新建优惠</el-button
            >
          </div>
          <el-table :data="bonusConfigs" stripe v-loading="bonusesLoading">
            <el-table-column prop="name" label="优惠名称" min-width="160" />
            <el-table-column prop="code" label="配置编码" min-width="130" />
            <el-table-column prop="vendor_code" label="供应商" min-width="110">
              <template #default="{ row }">{{ row.vendor_code || '全平台' }}</template>
            </el-table-column>
            <el-table-column prop="bonus_type" label="优惠类型" min-width="120" />
            <el-table-column prop="trigger_type" label="触发条件" min-width="120" />
            <el-table-column label="规则值" min-width="220">
              <template #default="{ row }">
                比例 {{ formatRate(row.percent_value) }}
                <span class="muted-inline">· 固定 {{ formatMoney(row.fixed_amount) }}</span>
                <span class="muted-inline">· 门槛 {{ formatMoney(row.min_amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :disabled="!canManage" @click="openBonusDialog(row)"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="前台装修入口" name="site">
          <div class="section-head">
            <div class="section-copy">
              这页不再直接编辑前台装修，避免和“站点装修”“前台内容”双向覆盖。当前这里只保留入口汇总和效果核对。
            </div>
            <div class="section-tools">
              <el-button type="primary" plain @click="openFrontendContentCenter">
                前往前台内容
              </el-button>
              <el-button plain @click="openSiteSettingsCenter">前往站点装修</el-button>
            </div>
          </div>
          <el-alert
            type="warning"
            :closable="false"
            class="mb-4"
            title="Banner、活动卡、客服入口、下载步骤、底部导航、登录卡片、快捷入口、我的页菜单等内容已迁移到结构化模块；品牌和通用骨架请到“站点装修”维护。"
          />
          <div class="site-handoff-grid" v-loading="siteConfigLoading">
            <article class="site-handoff-card">
              <div class="site-handoff-card__eyebrow">结构化内容</div>
              <div class="site-handoff-card__title">前台内容中心</div>
              <div class="site-handoff-card__desc">
                顶部分类、头部动作、首页横幅、分区、活动卡、客服入口、下载步骤、底部导航、登录卡片、我的页入口都已经迁到结构化
                CRUD。
              </div>
              <div class="site-handoff-card__tags">
                <el-tag type="success">{{ previewHomeTopTabs.length }} 个顶部分类</el-tag>
                <el-tag type="warning">{{ previewHomeHeroCards.length }} 张首页横幅</el-tag>
                <el-tag>{{ previewActivityCards.length }} 张活动卡</el-tag>
                <el-tag type="info">{{ previewMineMenuItems.length }} 个我的菜单</el-tag>
              </div>
              <el-button type="primary" plain @click="openFrontendContentCenter">
                打开前台内容
              </el-button>
            </article>

            <article class="site-handoff-card">
              <div class="site-handoff-card__eyebrow">品牌与骨架</div>
              <div class="site-handoff-card__title">站点装修台</div>
              <div class="site-handoff-card__desc">
                品牌名、品牌素材、客服文案、下载页标题和登录提示等全局骨架信息，统一在站点装修台维护。
              </div>
              <div class="site-handoff-card__meta">
                <div class="site-handoff-card__meta-label">当前品牌</div>
                <div class="site-handoff-card__meta-value">
                  {{ siteConfigForm.brand_name || '未配置品牌名称' }}
                </div>
                <div class="site-handoff-card__meta-subtitle">
                  {{ siteConfigForm.brand_subtitle || '未配置品牌副标题' }}
                </div>
              </div>
              <div class="site-handoff-card__tags">
                <el-tag>{{ siteConfigForm.support_title || '未配置客服标题' }}</el-tag>
                <el-tag type="success">{{
                  siteConfigForm.download_title || '未配置下载标题'
                }}</el-tag>
                <el-tag type="info">{{
                  siteConfigForm.login_notice_text || '未配置登录提示'
                }}</el-tag>
              </div>
              <el-button plain @click="openSiteSettingsCenter">打开站点装修</el-button>
            </article>
          </div>

          <div class="site-handoff-panels" v-loading="siteConfigLoading">
            <section class="site-handoff-panel">
              <div class="site-handoff-panel__title">首页快照</div>
              <div class="site-handoff-panel__subtitle">
                这里展示当前大厅入口和首页骨架效果，用于运营核对，不再在本页直接修改。
              </div>
              <div class="site-preview-row">
                <span
                  v-for="item in previewHomeTopTabs"
                  :key="item.code || item.label"
                  class="site-preview-pill"
                  :style="buildAccentStyle(item.accent, 0.18)"
                >
                  <span>{{ item.icon || '•' }}</span>
                  {{ item.label || '未命名' }}
                </span>
              </div>
              <div class="site-preview-row">
                <span
                  v-for="item in previewHomeHeaderActions"
                  :key="item.code || item.label"
                  class="site-preview-pill"
                  :style="buildAccentStyle(item.accent, 0.18)"
                >
                  <span>{{ item.icon || '按' }}</span>
                  {{ item.label || '动作' }}
                </span>
              </div>
              <div class="site-preview-grid">
                <article
                  v-for="item in previewHomeHeroCards"
                  :key="item.code || item.title"
                  class="site-preview-card hero"
                  :style="buildPreviewCardStyle(item)"
                >
                  <div class="site-preview-badge">{{ item.badge || item.code || 'hero' }}</div>
                  <div class="site-preview-title">{{ item.title || '首页横幅' }}</div>
                  <div class="site-preview-subtitle">{{ item.subtitle || '副标题' }}</div>
                  <div class="site-preview-meta">{{ item.label || '按钮文案' }}</div>
                </article>
              </div>
              <div class="site-preview-row">
                <span
                  v-for="item in previewHomeSections"
                  :key="item.code || item.label"
                  class="site-preview-pill"
                  :style="buildAccentStyle(item.accent, 0.18)"
                >
                  <span>{{ item.icon || '分' }}</span>
                  {{ item.label || item.title || '分区' }}
                </span>
              </div>
            </section>

            <section class="site-handoff-panel">
              <div class="site-handoff-panel__title">页面与账户快照</div>
              <div class="site-handoff-panel__subtitle">
                活动页、客服页、下载页与我的页面内容都已经迁移到结构化入口，这里只保留当前效果快照。
              </div>
              <div class="site-preview-grid">
                <article
                  v-for="item in previewActivityCards"
                  :key="item.code || item.title"
                  class="site-preview-card activity"
                  :style="buildPreviewCardStyle(item)"
                >
                  <div class="site-preview-badge">{{ item.badge || item.code || 'campaign' }}</div>
                  <div class="site-preview-title">{{ item.title || '活动卡' }}</div>
                  <div class="site-preview-subtitle">{{ item.subtitle || '活动副标题' }}</div>
                  <div class="site-preview-desc">{{ item.description || '活动说明' }}</div>
                </article>
              </div>
              <div class="site-preview-stack">
                <div
                  v-for="item in previewSupportItems"
                  :key="item.code || item.title"
                  class="site-preview-support"
                >
                  <div class="site-preview-icon" :style="buildAccentStyle(item.accent, 1)">{{
                    item.icon || '?'
                  }}</div>
                  <div class="site-preview-copy">
                    <div class="site-preview-title">{{ item.title || '客服入口' }}</div>
                    <div class="site-preview-desc">{{ item.description || '客服说明' }}</div>
                  </div>
                  <span class="site-preview-action">{{ item.label || '点击咨询' }}</span>
                </div>
              </div>
              <div class="site-preview-row">
                <span
                  v-for="item in previewBottomNavItems"
                  :key="item.code || item.label"
                  class="site-preview-pill"
                  :style="buildAccentStyle(item.accent, 0.18)"
                >
                  <span>{{ item.icon || '导' }}</span>
                  {{ item.label || '导航' }}
                </span>
              </div>
              <div class="site-preview-grid">
                <article
                  v-for="item in previewMineShortcuts"
                  :key="item.code || item.label"
                  class="site-preview-card"
                  :style="buildAccentStyle(item.accent, 0.22)"
                >
                  <div class="site-preview-badge">{{ item.icon || '捷' }}</div>
                  <div class="site-preview-title">{{ item.label || '快捷入口' }}</div>
                  <div class="site-preview-desc">{{ item.description || '入口说明' }}</div>
                </article>
              </div>
              <div class="site-preview-menu">
                <div
                  v-for="item in previewMineMenuItems"
                  :key="item.code || item.label"
                  class="site-preview-menu-item"
                >
                  <span>{{ item.label || '菜单项' }}</span>
                  <span>›</span>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>

  <el-dialog
    v-model="announcementDialogVisible"
    :title="editingAnnouncement ? '编辑公告' : '新建公告'"
    width="620px"
  >
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input v-model.trim="announcementForm.title" maxlength="120" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input
          v-model.trim="announcementForm.content"
          type="textarea"
          :rows="4"
          maxlength="1000"
        />
      </el-form-item>
      <div class="dialog-grid">
        <el-form-item label="状态">
          <el-select v-model="announcementForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="announcementForm.sort_order" :min="0" class="full-width" />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="announcementForm.start_at"
            type="datetime"
            placeholder="可选"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="announcementForm.end_at"
            type="datetime"
            placeholder="可选"
            class="full-width"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-actions">
        <el-button @click="announcementDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingAnnouncement" @click="submitAnnouncement"
          >保存</el-button
        >
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="slotDialogVisible"
    :title="editingSlot ? '编辑推荐位' : '新建推荐位'"
    width="640px"
  >
    <el-form label-position="top">
      <div class="dialog-grid">
        <el-form-item label="位置编码">
          <el-input v-model.trim="slotForm.slot_code" placeholder="例如：首页首屏" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="slotForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="主标题">
          <el-input v-model.trim="slotForm.title" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="slotForm.sort_order" :min="0" class="full-width" />
        </el-form-item>
      </div>
      <el-form-item label="副标题">
        <el-input v-model.trim="slotForm.subtitle" maxlength="255" />
      </el-form-item>
      <el-form-item label="绑定游戏">
        <el-select v-model="slotForm.game_id" filterable placeholder="请选择游戏">
          <el-option
            v-for="game in gameOptions"
            :key="game.id"
            :label="`${game.game_name} · ${game.game_code} · ${game.vendor_code}`"
            :value="game.id"
          />
        </el-select>
      </el-form-item>
      <div class="dialog-grid">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="slotForm.start_at"
            type="datetime"
            placeholder="可选"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="slotForm.end_at"
            type="datetime"
            placeholder="可选"
            class="full-width"
          />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-actions">
        <el-button @click="slotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingSlot" @click="submitSlot">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="agentDialogVisible"
    :title="editingAgent ? '编辑推广代理' : '新建推广代理'"
    width="620px"
  >
    <el-form label-position="top">
      <div class="dialog-grid">
        <el-form-item label="代理名称">
          <el-input v-model.trim="agentForm.name" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="agentForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="代理编号">
          <el-input v-model.trim="agentForm.agent_code" />
        </el-form-item>
        <el-form-item label="邀请码">
          <el-input v-model.trim="agentForm.invite_code" />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="分佣比例">
          <el-input-number
            v-model="agentForm.commission_rate"
            :min="0"
            :step="0.1"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="返点比例">
          <el-input-number
            v-model="agentForm.rebate_rate"
            :min="0"
            :step="0.1"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
      </div>
      <el-form-item label="落地页">
        <el-input v-model.trim="agentForm.landing_page_url" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.trim="agentForm.remark" type="textarea" :rows="3" maxlength="255" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-actions">
        <el-button @click="agentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingAgent" @click="submitAgent">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="campaignDialogVisible"
    :title="editingCampaign ? '编辑活动' : '新建活动'"
    width="960px"
  >
    <div style="display: flex; gap: 24px">
      <div style="flex: 1; min-width: 0">
        <el-form label-position="top">
          <div class="dialog-grid">
            <el-form-item label="活动标题">
              <el-input v-model.trim="campaignForm.title" />
            </el-form-item>
            <el-form-item label="供应商">
              <el-select v-model="campaignForm.vendor_code" clearable placeholder="全平台">
                <el-option
                  v-for="vendor in vendorOptions"
                  :key="vendor.code"
                  :label="vendor.name"
                  :value="vendor.code"
                />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="副标题">
            <el-input v-model.trim="campaignForm.subtitle" />
          </el-form-item>
          <div class="dialog-grid">
            <el-form-item label="奖励类型">
              <el-input v-model.trim="campaignForm.reward_type" placeholder="例如：deposit_bonus" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="campaignForm.status">
                <el-option :value="1" label="启用" />
                <el-option :value="0" label="停用" />
              </el-select>
            </el-form-item>
          </div>
          <div class="dialog-grid">
            <el-form-item label="奖励值">
              <el-input-number
                v-model="campaignForm.reward_value"
                :min="0"
                :precision="4"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="奖励上限">
              <el-input-number
                v-model="campaignForm.reward_limit"
                :min="0"
                :precision="4"
                class="full-width"
              />
            </el-form-item>
          </div>
          <div class="dialog-grid">
            <el-form-item label="排序">
              <el-input-number v-model="campaignForm.sort_order" :min="0" class="full-width" />
            </el-form-item>
            <el-form-item label="Banner URL">
              <el-input
                v-model.trim="campaignForm.banner_url"
                placeholder="填入图片链接或相对路径"
              />
            </el-form-item>
          </div>
          <el-form-item label="活动说明">
            <el-input v-model.trim="campaignForm.content" type="textarea" :rows="4" />
          </el-form-item>
          <div class="dialog-grid">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="campaignForm.start_at"
                type="datetime"
                placeholder="可选"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="campaignForm.end_at"
                type="datetime"
                placeholder="可选"
                class="full-width"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div style="width: 320px; flex-shrink: 0">
        <div style="margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #606266"
          >前台效果预览</div
        >
        <div
          style="
            padding: 16px;
            background: #1c1b20;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
          "
        >
          <div
            style="
              overflow: hidden;
              background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
              border-radius: 12px;
            "
          >
            <div
              style="
                display: flex;
                height: 120px;
                font-size: 12px;
                color: #666;
                background: #333;
                align-items: center;
                justify-content: center;
              "
            >
              <img
                v-if="campaignForm.banner_url"
                :src="campaignForm.banner_url"
                style="width: 100%; height: 100%; object-fit: cover"
                @error="onImageError"
              />
              <span v-else>暂无 Banner 图片</span>
            </div>
            <div style="padding: 12px">
              <div
                style="
                  margin-bottom: 4px;
                  overflow: hidden;
                  font-size: 16px;
                  font-weight: bold;
                  color: #d4a350;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ campaignForm.title || '活动主标题' }}
              </div>
              <div
                style="
                  margin-bottom: 12px;
                  overflow: hidden;
                  font-size: 12px;
                  color: #999;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                {{ campaignForm.subtitle || '活动副标题文案' }}
              </div>
              <div
                style="
                  padding: 8px;
                  font-size: 13px;
                  font-weight: bold;
                  color: #d4a350;
                  text-align: center;
                  background: rgb(212 163 80 / 10%);
                  border: 1px solid rgb(212 163 80 / 20%);
                  border-radius: 6px;
                "
              >
                查看详情
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-actions">
        <el-button @click="campaignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingCampaign" @click="submitCampaign">保存</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="bonusDialogVisible"
    :title="editingBonus ? '编辑优惠' : '新建优惠'"
    width="720px"
  >
    <el-form label-position="top">
      <div class="dialog-grid">
        <el-form-item label="优惠名称">
          <el-input v-model.trim="bonusForm.name" />
        </el-form-item>
        <el-form-item label="配置编码">
          <el-input v-model.trim="bonusForm.code" placeholder="例如：first_deposit_88" />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="供应商">
          <el-select v-model="bonusForm.vendor_code" clearable placeholder="全平台">
            <el-option
              v-for="vendor in vendorOptions"
              :key="vendor.code"
              :label="vendor.name"
              :value="vendor.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="bonusForm.status">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="停用" />
          </el-select>
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="优惠类型">
          <el-input v-model.trim="bonusForm.bonus_type" placeholder="例如：deposit_bonus" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model.trim="bonusForm.trigger_type" placeholder="例如：first_deposit" />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="比例值">
          <el-input-number
            v-model="bonusForm.percent_value"
            :min="0"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="固定金额">
          <el-input-number
            v-model="bonusForm.fixed_amount"
            :min="0"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="最低门槛">
          <el-input-number
            v-model="bonusForm.min_amount"
            :min="0"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="最高赠送">
          <el-input-number
            v-model="bonusForm.max_bonus"
            :min="0"
            :precision="4"
            class="full-width"
          />
        </el-form-item>
      </div>
      <div class="dialog-grid">
        <el-form-item label="排序">
          <el-input-number v-model="bonusForm.sort_order" :min="0" class="full-width" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="bonusForm.remark" maxlength="255" />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-actions">
        <el-button @click="bonusDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingBonus" @click="submitBonus">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface VendorOption {
  code: string
  name: string
}

interface GameOption {
  id: number
  game_name: string
  game_code: string
  vendor_code: string
}

interface AnnouncementRow {
  id: number
  title: string
  content: string
  status: number
  sort_order: number
  start_at: string | null
  end_at: string | null
  created_at: string
  updated_at: string
}

interface FeaturedSlotRow {
  id: number
  slot_code: string
  title: string
  subtitle: string
  game_id: number
  game_name: string
  game_code: string
  vendor_code: string
  thumbnail: string
  status: number
  sort_order: number
  start_at: string | null
  end_at: string | null
}

interface PromotionAgentRow {
  id: number
  name: string
  agent_code: string
  invite_code: string
  landing_page_url: string
  commission_rate: number
  rebate_rate: number
  status: number
  remark: string
}

interface ActivityCampaignRow {
  id: number
  title: string
  subtitle: string
  banner_url: string
  content: string
  vendor_code: string
  reward_type: string
  reward_value: number
  reward_limit: number
  status: number
  sort_order: number
  start_at: string | null
  end_at: string | null
}

interface BonusConfigRow {
  id: number
  name: string
  code: string
  vendor_code: string
  bonus_type: string
  trigger_type: string
  percent_value: number
  fixed_amount: number
  min_amount: number
  max_bonus: number
  status: number
  sort_order: number
  remark: string
}

interface FrontendSiteConfigRow {
  id: number
  config_key: string
  brand_name: string
  brand_subtitle: string
  brand_mark_text: string
  support_title: string
  support_subtitle: string
  download_title: string
  login_notice_text: string
  home_top_tabs_json: string
  home_header_actions_json: string
  home_hero_cards_json: string
  home_sections_json: string
  activity_cards_json: string
  support_items_json: string
  download_steps_json: string
  bottom_nav_items_json: string
  login_cards_json: string
  mine_shortcuts_json: string
  mine_menu_items_json: string
}

interface SiteConfigPreviewItem {
  code?: string
  label?: string
  icon?: string
  title?: string
  subtitle?: string
  description?: string
  badge?: string
  accent?: string
  image_url?: string
  action_url?: string
}

const recommendedSiteTemplates = {
  home_top_tabs: [
    { code: 'home', label: '首页', icon: '🏠', accent: '#b42dff' },
    { code: 'hot', label: '热门', icon: '🔥', accent: '#864dff' },
    { code: 'recent', label: '最近浏览', icon: '🕘', accent: '#3a365f' },
    { code: 'slot', label: '电子游戏', icon: '🎰', accent: '#240bfd' },
    { code: 'live', label: '真人视讯', icon: '🎥', accent: '#00b7ff' }
  ],
  home_header_actions: [
    { code: 'refresh', label: '刷新', icon: '↻' },
    { code: 'deposit', label: '充值', icon: '充', action_url: '/wallet' },
    { code: 'more', label: '更多', icon: '◎' }
  ],
  home_hero_cards: [
    {
      code: 'vip',
      title: 'TKZC668 尊享好礼',
      subtitle: 'VIP 荣耀回馈',
      badge: 'VIP',
      accent: '#864dff',
      label: '立即进入'
    },
    {
      code: 'daily',
      title: '每日首充',
      subtitle: '首充奖励与充值回馈',
      badge: 'HOT',
      accent: '#ea625b',
      label: '查看详情'
    },
    {
      code: 'reload',
      title: '每日充值大回馈',
      subtitle: '充值达标即可领取奖励',
      badge: 'BONUS',
      accent: '#240bfd',
      label: '立即领取'
    }
  ],
  home_sections: [
    { code: 'hot', label: '热门', icon: '🔥', badge: 'HOT', description: '热门专区' },
    { code: 'slot', label: '电子游戏', icon: '🎰', badge: 'HOT', description: '电子游艺专区' },
    { code: 'live', label: '真人视讯', icon: '🎥', badge: 'LIVE', description: '真人娱乐' },
    {
      code: 'fish',
      label: '捕鱼游戏',
      icon: '🐟',
      badge: 'HOT',
      description: '捕鱼专区与热门捕鱼位'
    },
    {
      code: 'sports',
      label: '体育竞猜',
      icon: '⚽',
      badge: 'LIVE',
      description: 'FB、PA 与其他体育线路'
    },
    {
      code: 'board',
      label: '棋牌游戏',
      icon: '🃏',
      badge: 'FUN',
      description: '牌类、休闲与大众娱乐'
    }
  ],
  activity_cards: [
    {
      code: 'vip',
      title: 'TKZC668 尊享好礼',
      subtitle: 'VIP 荣耀回馈',
      description: '成长任务、充值回馈、会员晋级奖励会集中在活动页展示。',
      badge: 'VIP',
      accent: '#b42dff',
      label: '查看活动'
    },
    {
      code: 'first',
      title: '每日首充',
      subtitle: '首充最高赠送 588U',
      description: '新手礼包、连续签到和首充奖励支持统一编排。',
      badge: 'FIRST',
      accent: '#ea625b',
      label: '立即参与'
    },
    {
      code: 'reload',
      title: '每日充值大回馈',
      subtitle: '充值达标即可领取奖励',
      description: '活动卡片可直接在后台替换文案和顺序。',
      badge: 'BONUS',
      accent: '#240bfd',
      label: '领取回馈'
    },
    {
      code: 'turnover',
      title: '每日翻盘金',
      subtitle: '翻盘奖励与亏损返还',
      description: '返水、翻盘金、闯关活动可以按这组卡片继续扩展。',
      badge: 'DAILY',
      accent: '#00b7ff',
      label: '查看规则'
    }
  ],
  support_items: [
    {
      code: 'tg',
      title: 'TG客服',
      description: '处理普通咨询和进线问题',
      label: '点击咨询',
      icon: 'TG',
      accent: '#b42dff',
      action_url: 'https://t.me/'
    },
    {
      code: 'web',
      title: '网页客服',
      description: '网页在线接待与工单处理',
      label: '点击咨询',
      icon: 'WEB',
      accent: '#240bfd'
    },
    {
      code: 'vip',
      title: 'TG VIP客服',
      description: '高价值用户专属服务入口',
      label: '点击咨询',
      icon: 'VIP',
      accent: '#00b7ff',
      action_url: 'https://t.me/'
    },
    {
      code: 'channel',
      title: '官方频道',
      description: '公告、维护通知与频道入口',
      label: '点击咨询',
      icon: 'CH',
      accent: '#864dff',
      action_url: 'https://t.me/'
    }
  ],
  download_steps: [
    {
      code: 'step1',
      title: '使用 Safari 浏览器打开网站',
      description: 'iPhone 建议使用 Safari 打开，方便添加到主屏幕。',
      label: 'Safari 打开站点',
      accent: '#b42dff'
    },
    {
      code: 'step2',
      title: '点击底部工具栏中的分享按钮',
      description: '打开分享面板后可以看到“添加到主屏幕”选项。',
      label: '点击分享按钮',
      accent: '#864dff'
    },
    {
      code: 'step3',
      title: '选择“添加到主屏幕”',
      description: '添加后可以像原生应用一样从桌面进入平台。',
      label: '添加到主屏幕',
      accent: '#240bfd'
    }
  ],
  bottom_nav_items: [
    { code: 'home', label: '首页', icon: '⌂', action_url: '/home' },
    { code: 'activity', label: '活动', icon: '✦', action_url: '/activity' },
    { code: 'support', label: '客服', icon: '◉', action_url: '/support' },
    { code: 'download', label: '下载', icon: '↓', action_url: '/download' },
    { code: 'mine', label: '我的', icon: '◎', action_url: '/mine' }
  ],
  login_cards: [
    {
      code: 'load',
      title: '轻入口加载',
      subtitle: '首屏策略',
      description: '更轻的手机入口，更快进入大厅。'
    },
    {
      code: 'host',
      title: 'H5 / 微信 / TG',
      subtitle: '接入方式',
      description: '统一支持多宿主入口识别。'
    },
    {
      code: 'wallet',
      title: '建单 + 回调',
      subtitle: '钱包链路',
      description: '充值与宿主支付统一收口。'
    }
  ],
  mine_menu_items: [
    { code: 'security', label: '安全中心', action_url: '/wallet' },
    { code: 'agent', label: '代理合作', action_url: '/activity' },
    { code: 'vpn', label: '推荐VPN', action_url: '/download' },
    { code: 'red_packet', label: '红包', action_url: '/activity' },
    { code: 'command_red_packet', label: '口令红包', action_url: '/activity' },
    { code: 'language', label: '语言', action_url: '/mine' }
  ],
  mine_shortcuts: [
    {
      code: 'deposit_logs',
      label: '充提记录',
      icon: '充',
      action_url: '/wallet',
      description: '资金流转与订单记录'
    },
    {
      code: 'win_loss',
      label: '输赢报表',
      icon: '输',
      action_url: '/activity',
      description: '平台输赢和活动汇总'
    },
    {
      code: 'transactions',
      label: '交易记录',
      icon: '交',
      action_url: '/wallet',
      description: '交易流水与账单详情'
    },
    {
      code: 'missions',
      label: '任务中心',
      icon: '任',
      action_url: '/activity',
      description: '成长任务与奖励入口'
    },
    {
      code: 'bet_logs',
      label: '投注记录',
      icon: '投',
      action_url: '/activity',
      description: '体育投注与游戏投注'
    },
    {
      code: 'buy_coins',
      label: '购买货币',
      icon: '购',
      action_url: '/wallet',
      description: '宿主支付与钱包充值'
    },
    {
      code: 'lottery',
      label: '抽奖明细',
      icon: '抽',
      action_url: '/activity',
      description: '抽奖、礼金和活动派奖'
    },
    {
      code: 'host',
      label: '宿主桥接',
      icon: '桥',
      action_url: '/wallet',
      description: 'H5、TG、小程序宿主入口'
    }
  ]
} satisfies Record<string, SiteConfigPreviewItem[]>

const router = useRouter()
const session = useAdminSessionStore()
const activeTab = ref('announcements')
const canManage = computed(() => session.hasPermission('operations.manage'))

function onImageError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

const vendorOptions = ref<VendorOption[]>([])
const gameOptions = ref<GameOption[]>([])
const announcements = ref<AnnouncementRow[]>([])
const featuredSlots = ref<FeaturedSlotRow[]>([])
const promotionAgents = ref<PromotionAgentRow[]>([])
const campaigns = ref<ActivityCampaignRow[]>([])
const bonusConfigs = ref<BonusConfigRow[]>([])

const announcementsLoading = ref(false)
const slotsLoading = ref(false)
const agentsLoading = ref(false)
const campaignsLoading = ref(false)
const bonusesLoading = ref(false)
const siteConfigLoading = ref(false)

const savingAnnouncement = ref(false)
const savingSlot = ref(false)
const savingAgent = ref(false)
const savingCampaign = ref(false)
const savingBonus = ref(false)

const announcementDialogVisible = ref(false)
const slotDialogVisible = ref(false)
const agentDialogVisible = ref(false)
const campaignDialogVisible = ref(false)
const bonusDialogVisible = ref(false)

const editingAnnouncement = ref<AnnouncementRow | null>(null)
const editingSlot = ref<FeaturedSlotRow | null>(null)
const editingAgent = ref<PromotionAgentRow | null>(null)
const editingCampaign = ref<ActivityCampaignRow | null>(null)
const editingBonus = ref<BonusConfigRow | null>(null)

const announcementForm = reactive({
  title: '',
  content: '',
  status: 1,
  sort_order: 0,
  start_at: null as Date | null,
  end_at: null as Date | null
})

const slotForm = reactive({
  slot_code: '',
  title: '',
  subtitle: '',
  game_id: undefined as number | undefined,
  status: 1,
  sort_order: 0,
  start_at: null as Date | null,
  end_at: null as Date | null
})

const agentForm = reactive({
  name: '',
  agent_code: '',
  invite_code: '',
  landing_page_url: '',
  commission_rate: 0,
  rebate_rate: 0,
  status: 1,
  remark: ''
})

const campaignForm = reactive({
  title: '',
  subtitle: '',
  banner_url: '',
  content: '',
  vendor_code: '',
  reward_type: '',
  reward_value: 0,
  reward_limit: 0,
  status: 1,
  sort_order: 0,
  start_at: null as Date | null,
  end_at: null as Date | null
})

const bonusForm = reactive({
  name: '',
  code: '',
  vendor_code: '',
  bonus_type: '',
  trigger_type: '',
  percent_value: 0,
  fixed_amount: 0,
  min_amount: 0,
  max_bonus: 0,
  status: 1,
  sort_order: 0,
  remark: ''
})

const siteConfigForm = reactive({
  brand_name: '',
  brand_subtitle: '',
  brand_mark_text: '',
  support_title: '',
  support_subtitle: '',
  download_title: '',
  login_notice_text: '',
  home_top_tabs_json: '[]',
  home_header_actions_json: '[]',
  home_hero_cards_json: '[]',
  home_sections_json: '[]',
  activity_cards_json: '[]',
  support_items_json: '[]',
  download_steps_json: '[]',
  bottom_nav_items_json: '[]',
  login_cards_json: '[]',
  mine_shortcuts_json: '[]',
  mine_menu_items_json: '[]'
})

const previewHomeTopTabs = computed(() =>
  parseSiteConfigPreview(siteConfigForm.home_top_tabs_json, recommendedSiteTemplates.home_top_tabs)
)
const previewHomeHeaderActions = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.home_header_actions_json,
    recommendedSiteTemplates.home_header_actions
  )
)
const previewHomeHeroCards = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.home_hero_cards_json,
    recommendedSiteTemplates.home_hero_cards
  )
)
const previewHomeSections = computed(() =>
  parseSiteConfigPreview(siteConfigForm.home_sections_json, recommendedSiteTemplates.home_sections)
)
const previewActivityCards = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.activity_cards_json,
    recommendedSiteTemplates.activity_cards
  )
)
const previewSupportItems = computed(() =>
  parseSiteConfigPreview(siteConfigForm.support_items_json, recommendedSiteTemplates.support_items)
)
const previewBottomNavItems = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.bottom_nav_items_json,
    recommendedSiteTemplates.bottom_nav_items
  )
)
const previewMineShortcuts = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.mine_shortcuts_json,
    recommendedSiteTemplates.mine_shortcuts
  )
)
const previewMineMenuItems = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.mine_menu_items_json,
    recommendedSiteTemplates.mine_menu_items
  )
)

onMounted(() => {
  void bootstrap()
})

async function bootstrap() {
  await Promise.all([
    loadVendorOptions(),
    loadGameOptions(),
    loadAnnouncements(),
    loadFeaturedSlots(),
    loadPromotionAgents(),
    loadCampaigns(),
    loadBonusConfigs(),
    loadSiteConfig()
  ])
}

async function loadVendorOptions() {
  const { data } = await http.get<{ data: Array<{ code: string; name: string }> }>(
    '/admin/scope-vendors'
  )
  vendorOptions.value = data.data
}

async function loadGameOptions() {
  const { data } = await http.get<{ data: GameOption[] }>('/admin/games', {
    params: {
      page: 1,
      page_size: 100,
      status: 1
    }
  })
  gameOptions.value = data.data
}

async function loadAnnouncements() {
  announcementsLoading.value = true
  try {
    const { data } = await http.get<{ data: AnnouncementRow[] }>('/admin/announcements')
    announcements.value = data.data
  } finally {
    announcementsLoading.value = false
  }
}

async function loadFeaturedSlots() {
  slotsLoading.value = true
  try {
    const { data } = await http.get<{ data: FeaturedSlotRow[] }>('/admin/featured-slots')
    featuredSlots.value = data.data
  } finally {
    slotsLoading.value = false
  }
}

async function loadPromotionAgents() {
  agentsLoading.value = true
  try {
    const { data } = await http.get<{ data: PromotionAgentRow[] }>('/admin/promotion-agents')
    promotionAgents.value = data.data
  } finally {
    agentsLoading.value = false
  }
}

async function loadCampaigns() {
  campaignsLoading.value = true
  try {
    const { data } = await http.get<{ data: ActivityCampaignRow[] }>('/admin/activity-campaigns')
    campaigns.value = data.data
  } finally {
    campaignsLoading.value = false
  }
}

async function loadBonusConfigs() {
  bonusesLoading.value = true
  try {
    const { data } = await http.get<{ data: BonusConfigRow[] }>('/admin/bonus-configs')
    bonusConfigs.value = data.data
  } finally {
    bonusesLoading.value = false
  }
}

async function loadSiteConfig() {
  siteConfigLoading.value = true
  try {
    const { data } = await http.get<{ data: FrontendSiteConfigRow }>('/admin/site-config')
    siteConfigForm.brand_name = data.data.brand_name || ''
    siteConfigForm.brand_subtitle = data.data.brand_subtitle || ''
    siteConfigForm.brand_mark_text = data.data.brand_mark_text || ''
    siteConfigForm.support_title = data.data.support_title || ''
    siteConfigForm.support_subtitle = data.data.support_subtitle || ''
    siteConfigForm.download_title = data.data.download_title || ''
    siteConfigForm.login_notice_text = data.data.login_notice_text || ''
    siteConfigForm.home_top_tabs_json = data.data.home_top_tabs_json || '[]'
    siteConfigForm.home_header_actions_json = data.data.home_header_actions_json || '[]'
    siteConfigForm.home_hero_cards_json = data.data.home_hero_cards_json || '[]'
    siteConfigForm.home_sections_json = data.data.home_sections_json || '[]'
    siteConfigForm.activity_cards_json = data.data.activity_cards_json || '[]'
    siteConfigForm.support_items_json = data.data.support_items_json || '[]'
    siteConfigForm.download_steps_json = data.data.download_steps_json || '[]'
    siteConfigForm.bottom_nav_items_json = data.data.bottom_nav_items_json || '[]'
    siteConfigForm.login_cards_json = data.data.login_cards_json || '[]'
    siteConfigForm.mine_shortcuts_json = data.data.mine_shortcuts_json || '[]'
    siteConfigForm.mine_menu_items_json = data.data.mine_menu_items_json || '[]'
  } finally {
    siteConfigLoading.value = false
  }
}

function openAnnouncementDialog(row?: AnnouncementRow) {
  editingAnnouncement.value = row || null
  announcementForm.title = row?.title || ''
  announcementForm.content = row?.content || ''
  announcementForm.status = row?.status ?? 1
  announcementForm.sort_order = row?.sort_order ?? 0
  announcementForm.start_at = row?.start_at ? new Date(row.start_at) : null
  announcementForm.end_at = row?.end_at ? new Date(row.end_at) : null
  announcementDialogVisible.value = true
}

function openSlotDialog(row?: FeaturedSlotRow) {
  editingSlot.value = row || null
  slotForm.slot_code = row?.slot_code || ''
  slotForm.title = row?.title || ''
  slotForm.subtitle = row?.subtitle || ''
  slotForm.game_id = row?.game_id
  slotForm.status = row?.status ?? 1
  slotForm.sort_order = row?.sort_order ?? 0
  slotForm.start_at = row?.start_at ? new Date(row.start_at) : null
  slotForm.end_at = row?.end_at ? new Date(row.end_at) : null
  slotDialogVisible.value = true
}

function openAgentDialog(row?: PromotionAgentRow) {
  editingAgent.value = row || null
  agentForm.name = row?.name || ''
  agentForm.agent_code = row?.agent_code || ''
  agentForm.invite_code = row?.invite_code || ''
  agentForm.landing_page_url = row?.landing_page_url || ''
  agentForm.commission_rate = row?.commission_rate ?? 0
  agentForm.rebate_rate = row?.rebate_rate ?? 0
  agentForm.status = row?.status ?? 1
  agentForm.remark = row?.remark || ''
  agentDialogVisible.value = true
}

function openCampaignDialog(row?: ActivityCampaignRow) {
  editingCampaign.value = row || null
  campaignForm.title = row?.title || ''
  campaignForm.subtitle = row?.subtitle || ''
  campaignForm.banner_url = row?.banner_url || ''
  campaignForm.content = row?.content || ''
  campaignForm.vendor_code = row?.vendor_code || ''
  campaignForm.reward_type = row?.reward_type || ''
  campaignForm.reward_value = row?.reward_value ?? 0
  campaignForm.reward_limit = row?.reward_limit ?? 0
  campaignForm.status = row?.status ?? 1
  campaignForm.sort_order = row?.sort_order ?? 0
  campaignForm.start_at = row?.start_at ? new Date(row.start_at) : null
  campaignForm.end_at = row?.end_at ? new Date(row.end_at) : null
  campaignDialogVisible.value = true
}

function openBonusDialog(row?: BonusConfigRow) {
  editingBonus.value = row || null
  bonusForm.name = row?.name || ''
  bonusForm.code = row?.code || ''
  bonusForm.vendor_code = row?.vendor_code || ''
  bonusForm.bonus_type = row?.bonus_type || ''
  bonusForm.trigger_type = row?.trigger_type || ''
  bonusForm.percent_value = row?.percent_value ?? 0
  bonusForm.fixed_amount = row?.fixed_amount ?? 0
  bonusForm.min_amount = row?.min_amount ?? 0
  bonusForm.max_bonus = row?.max_bonus ?? 0
  bonusForm.status = row?.status ?? 1
  bonusForm.sort_order = row?.sort_order ?? 0
  bonusForm.remark = row?.remark || ''
  bonusDialogVisible.value = true
}

async function submitAnnouncement() {
  savingAnnouncement.value = true
  try {
    const payload = {
      title: announcementForm.title,
      content: announcementForm.content,
      status: announcementForm.status,
      sort_order: announcementForm.sort_order,
      start_at: announcementForm.start_at?.toISOString() || '',
      end_at: announcementForm.end_at?.toISOString() || ''
    }
    if (editingAnnouncement.value) {
      await http.put(`/admin/announcements/${editingAnnouncement.value.id}`, payload)
      ElMessage.success('公告已更新')
    } else {
      await http.post('/admin/announcements', payload)
      ElMessage.success('公告已创建')
    }
    announcementDialogVisible.value = false
    await loadAnnouncements()
  } finally {
    savingAnnouncement.value = false
  }
}

async function submitSlot() {
  savingSlot.value = true
  try {
    const payload = {
      slot_code: slotForm.slot_code,
      title: slotForm.title,
      subtitle: slotForm.subtitle,
      game_id: slotForm.game_id,
      status: slotForm.status,
      sort_order: slotForm.sort_order,
      start_at: slotForm.start_at?.toISOString() || '',
      end_at: slotForm.end_at?.toISOString() || ''
    }
    if (editingSlot.value) {
      await http.put(`/admin/featured-slots/${editingSlot.value.id}`, payload)
      ElMessage.success('推荐位已更新')
    } else {
      await http.post('/admin/featured-slots', payload)
      ElMessage.success('推荐位已创建')
    }
    slotDialogVisible.value = false
    await loadFeaturedSlots()
  } finally {
    savingSlot.value = false
  }
}

async function submitAgent() {
  savingAgent.value = true
  try {
    const payload = {
      name: agentForm.name,
      agent_code: agentForm.agent_code,
      invite_code: agentForm.invite_code,
      landing_page_url: agentForm.landing_page_url,
      commission_rate: agentForm.commission_rate,
      rebate_rate: agentForm.rebate_rate,
      status: agentForm.status,
      remark: agentForm.remark
    }
    if (editingAgent.value) {
      await http.put(`/admin/promotion-agents/${editingAgent.value.id}`, payload)
      ElMessage.success('推广代理已更新')
    } else {
      await http.post('/admin/promotion-agents', payload)
      ElMessage.success('推广代理已创建')
    }
    agentDialogVisible.value = false
    await loadPromotionAgents()
  } finally {
    savingAgent.value = false
  }
}

async function submitCampaign() {
  savingCampaign.value = true
  try {
    const payload = {
      title: campaignForm.title,
      subtitle: campaignForm.subtitle,
      banner_url: campaignForm.banner_url,
      content: campaignForm.content,
      vendor_code: campaignForm.vendor_code,
      reward_type: campaignForm.reward_type,
      reward_value: campaignForm.reward_value,
      reward_limit: campaignForm.reward_limit,
      status: campaignForm.status,
      sort_order: campaignForm.sort_order,
      start_at: campaignForm.start_at?.toISOString() || '',
      end_at: campaignForm.end_at?.toISOString() || ''
    }
    if (editingCampaign.value) {
      await http.put(`/admin/activity-campaigns/${editingCampaign.value.id}`, payload)
      ElMessage.success('活动已更新')
    } else {
      await http.post('/admin/activity-campaigns', payload)
      ElMessage.success('活动已创建')
    }
    campaignDialogVisible.value = false
    await loadCampaigns()
  } finally {
    savingCampaign.value = false
  }
}

async function submitBonus() {
  savingBonus.value = true
  try {
    const payload = {
      name: bonusForm.name,
      code: bonusForm.code,
      vendor_code: bonusForm.vendor_code,
      bonus_type: bonusForm.bonus_type,
      trigger_type: bonusForm.trigger_type,
      percent_value: bonusForm.percent_value,
      fixed_amount: bonusForm.fixed_amount,
      min_amount: bonusForm.min_amount,
      max_bonus: bonusForm.max_bonus,
      status: bonusForm.status,
      sort_order: bonusForm.sort_order,
      remark: bonusForm.remark
    }
    if (editingBonus.value) {
      await http.put(`/admin/bonus-configs/${editingBonus.value.id}`, payload)
      ElMessage.success('优惠配置已更新')
    } else {
      await http.post('/admin/bonus-configs', payload)
      ElMessage.success('优惠配置已创建')
    }
    bonusDialogVisible.value = false
    await loadBonusConfigs()
  } finally {
    savingBonus.value = false
  }
}

function openFrontendContentCenter() {
  void router.push({ name: 'FrontendContent' })
}

function openSiteSettingsCenter() {
  void router.push({ name: 'SiteSettings' })
}

function parseSiteConfigPreview(raw: string, fallbackItems: SiteConfigPreviewItem[]) {
  try {
    const parsed = JSON.parse(raw || '[]')
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackItems
    }
    return parsed.map((item, index) => ({
      ...(fallbackItems.find((candidate) => candidate.code && candidate.code === item?.code) ||
        fallbackItems[index] ||
        {}),
      ...(item || {})
    }))
  } catch {
    return fallbackItems
  }
}

function buildAccentStyle(accent?: string, alpha = 1) {
  if (!accent) {
    return {}
  }
  if (alpha === 1) {
    return {
      background: `linear-gradient(135deg, ${accent} 0%, rgba(17,24,39,0.92) 100%)`
    }
  }
  return {
    backgroundColor: `${accent}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')}`
  }
}

function buildPreviewCardStyle(item: SiteConfigPreviewItem) {
  const accent = item.accent || '#3b2676'
  const gradient = `linear-gradient(135deg, ${accent} 0%, rgba(15,23,42,0.88) 100%)`
  if (!item.image_url) {
    return {
      background: gradient
    }
  }
  return {
    backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.82) 100%), url(${item.image_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: accent
  }
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

function formatRate(value: number) {
  return `${(value || 0).toFixed(2)}%`
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}
</script>

<style scoped>
.page-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-card,
.page-card {
  border-radius: 28px;
}

.hero-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.hero-subtitle,
.section-copy {
  margin-top: 8px;
  line-height: 1.8;
  color: #64748b;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-tools,
.site-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ops-tabs :deep(.el-tabs__header) {
  margin-bottom: 22px;
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

.game-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-name {
  font-weight: 600;
  color: #0f172a;
}

.game-meta,
.muted-inline {
  font-size: 12px;
  color: #64748b;
}

.full-width {
  width: 100%;
}

.site-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: -4px 0 18px;
}

.site-handoff-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.site-handoff-card,
.site-handoff-panel {
  padding: 18px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
}

.site-handoff-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.site-handoff-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #6366f1;
  text-transform: uppercase;
}

.site-handoff-card__title,
.site-handoff-panel__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.site-handoff-card__desc,
.site-handoff-panel__subtitle {
  line-height: 1.8;
  color: #64748b;
}

.site-handoff-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.site-handoff-card__meta {
  padding: 14px;
  background: rgb(255 255 255 / 72%);
  border-radius: 18px;
}

.site-handoff-card__meta-label {
  font-size: 12px;
  color: #64748b;
}

.site-handoff-card__meta-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.site-handoff-card__meta-subtitle {
  margin-top: 4px;
  line-height: 1.7;
  color: #475569;
}

.site-handoff-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.site-handoff-panel {
  min-width: 0;
}

.site-preview-pill {
  display: inline-flex;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  border-radius: 999px;
  align-items: center;
  gap: 8px;
}

.site-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: -4px 0 18px;
}

.site-preview-card {
  position: relative;
  min-height: 138px;
  padding: 16px;
  overflow: hidden;
  color: #fff;
  border-radius: 22px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 14%);
}

.site-preview-card.activity {
  min-height: 156px;
}

.site-preview-badge {
  display: inline-flex;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
  align-items: center;
}

.site-preview-title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.site-preview-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: rgb(255 255 255 / 82%);
}

.site-preview-desc {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: rgb(255 255 255 / 72%);
}

.site-preview-meta {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  background: rgb(255 255 255 / 12%);
  border-radius: 999px;
}

.site-preview-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: -4px 0 18px;
}

.site-preview-support,
.site-preview-step,
.site-preview-menu-item {
  display: flex;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  align-items: center;
  gap: 14px;
}

.site-preview-icon,
.site-preview-step-badge {
  display: flex;
  width: 40px;
  height: 40px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
}

.site-preview-copy {
  min-width: 0;
  flex: 1;
}

.site-preview-action {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #854d0e;
  background: #fde68a;
  border-radius: 999px;
}

.site-preview-menu {
  display: grid;
  gap: 10px;
  margin: -4px 0 4px;
}

.site-preview-menu-item {
  font-weight: 600;
  color: #0f172a;
  justify-content: space-between;
}

@media (width <= 960px) {
  .hero-copy,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .dialog-grid {
    grid-template-columns: 1fr;
  }

  .site-handoff-grid,
  .site-handoff-panels {
    grid-template-columns: 1fr;
  }

  .site-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
