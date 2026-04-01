<template>
  <div class="page-stack">
    <el-card shadow="never" class="hero-card">
      <div class="hero-copy">
        <div>
          <div class="hero-title">站点装修台</div>
          <div class="hero-subtitle">
            品牌信息、页面骨架和账户区文案统一放在这里维护；前台内容里的
            Banner、快捷入口和分类规则已经拆成结构化模块。
          </div>
        </div>
        <div class="hero-tags">
          <el-tag type="primary">品牌</el-tag>
          <el-tag type="success">页面骨架</el-tag>
          <el-tag type="warning">账户区</el-tag>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="page-card">
      <div class="section-head">
        <div class="section-copy">
          集中维护品牌名、品牌素材和少量全局骨架文案；首页入口、活动卡、客服入口和账户内容已经统一迁到结构化模块。
        </div>
        <div class="section-tools">
          <el-button v-if="canManage" @click="applyRecommendedSiteTemplates">
            回填推荐品牌模板
          </el-button>
          <el-button
            v-if="canManage"
            type="primary"
            :loading="savingSiteConfig"
            @click="submitSiteConfig"
          >
            保存装修配置
          </el-button>
        </div>
      </div>

      <el-alert
        type="info"
        :closable="false"
        class="mb-4"
        title="品牌与通用装修支持扩展字段：badge、accent、image_url、action_url。首页 Banner、大厅快捷入口、厂商展示、分类规则请到“前台内容”维护。"
      />

      <div class="asset-toolbox">
        <div>
          <div class="asset-toolbox__title">装修素材工具箱</div>
          <div class="asset-toolbox__subtitle">
            上传后的地址可直接填到任意 JSON 项的
            <code>image_url</code>
            字段里，活动卡、客服项、下载页和“我的”页面会立即吃到。
          </div>
        </div>
        <div class="asset-toolbox__row">
          <el-select v-model="assetUploadScope" class="asset-toolbox__scope">
            <el-option label="活动卡片" value="site-activity" />
            <el-option label="客服/下载" value="site-support" />
            <el-option label="我的页面" value="site-mine" />
            <el-option label="通用装修" value="site-config" />
          </el-select>
          <label class="asset-picker">
            <input
              ref="siteAssetInput"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              @change="handleSiteAssetChange"
            />
            <span>{{ selectedSiteAsset?.name || '选择图片文件' }}</span>
          </label>
          <el-button
            :loading="uploadingSiteAsset"
            :disabled="!selectedSiteAsset"
            type="primary"
            @click="uploadSiteAsset"
          >
            上传图片
          </el-button>
        </div>
        <div v-if="uploadedSiteAssetUrl" class="asset-toolbox__result">
          <div v-if="uploadedSiteAssetUrl" class="asset-toolbox__preview">
            <img :src="uploadedSiteAssetUrl" alt="已上传素材预览" />
          </div>
          <div class="asset-toolbox__meta">
            <div class="asset-toolbox__url">{{ uploadedSiteAssetUrl }}</div>
            <div class="asset-toolbox__hint"
              >把这段地址填进对应 JSON 的 <code>image_url</code> 即可生效。</div
            >
          </div>
          <el-select v-model="selectedAssetTargetField" class="asset-toolbox__target">
            <el-option label="品牌 Logo" value="brand_logo_url" />
            <el-option label="默认头像" value="default_avatar_url" />
            <el-option label="VIP 图标" value="vip_icon_url" />
          </el-select>
          <el-button type="primary" plain @click="applyUploadedSiteAssetToField">
            应用到字段
          </el-button>
          <el-button @click="copyUploadedSiteAssetUrl">复制地址</el-button>
        </div>
      </div>

      <div class="site-summary-grid">
        <article
          v-for="card in siteSummaryCards"
          :key="card.key"
          class="site-summary-card"
          @click="activePanel = card.key"
        >
          <div class="site-summary-card__value">{{ card.value }}</div>
          <div class="site-summary-card__title">{{ card.title }}</div>
          <div class="site-summary-card__desc">{{ card.description }}</div>
        </article>
      </div>

      <el-form label-position="top" class="site-config-form" v-loading="siteConfigLoading">
        <el-tabs v-model="activePanel" class="site-tabs">
          <el-tab-pane label="品牌设置" name="branding">
            <div class="site-panel">
              <div class="site-panel__head">
                <div>
                  <div class="site-panel__title">品牌与基础文案</div>
                  <div class="site-panel__subtitle">
                    管理品牌名、基础介绍和三张核心资产，前台 Header、登录和账户页都会共用。
                  </div>
                </div>
              </div>

              <div class="dialog-grid">
                <el-form-item label="品牌名称">
                  <el-input v-model.trim="siteConfigForm.brand_name" />
                </el-form-item>
                <el-form-item label="品牌副标题">
                  <el-input v-model.trim="siteConfigForm.brand_subtitle" />
                </el-form-item>
                <el-form-item label="品牌角标文字">
                  <el-input v-model.trim="siteConfigForm.brand_mark_text" />
                </el-form-item>
              </div>

              <div class="dialog-grid">
                <el-form-item label="品牌 Logo 地址">
                  <el-input
                    v-model.trim="siteConfigForm.brand_logo_url"
                    placeholder="https://..."
                  />
                </el-form-item>
                <el-form-item label="默认头像地址">
                  <el-input
                    v-model.trim="siteConfigForm.default_avatar_url"
                    placeholder="https://..."
                  />
                </el-form-item>
                <el-form-item label="VIP 图标地址">
                  <el-input v-model.trim="siteConfigForm.vip_icon_url" placeholder="https://..." />
                </el-form-item>
              </div>

              <div class="site-assets-grid">
                <article v-for="card in brandAssetCards" :key="card.field" class="site-assets-card">
                  <div class="site-assets-card__media">
                    <img v-if="card.url" :src="card.url" :alt="card.title" />
                    <div v-else class="site-assets-card__empty">未配置素材</div>
                  </div>
                  <div class="site-assets-card__title">{{ card.title }}</div>
                  <div class="site-assets-card__desc">{{ card.description }}</div>
                </article>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="首页骨架" name="home">
            <div class="site-panel">
              <div class="site-panel__head">
                <div>
                  <div class="site-panel__title">首页入口与版块</div>
                  <div class="site-panel__subtitle">
                    首页入口和版块现在统一在“前台内容”里按结构化数据维护，这里只保留实时预览和跳转入口。
                  </div>
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title"
                    >顶部分类、头部动作、首页分区与活动卡已支持结构化维护</div
                  >
                  <div class="site-migrated-panel__subtitle">
                    这几组配置现在统一在“前台内容”里按表格维护、排序和开关。站点装修页只保留效果核对，避免和结构化模块双向覆盖。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>顶部分类</el-tag>
                    <el-tag type="warning">头部动作</el-tag>
                    <el-tag type="success">首页分区</el-tag>
                    <el-tag type="warning">活动卡</el-tag>
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">顶部分类已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    首页顶部导航现在走结构化表格维护。这里仅保留实时预览，编辑、排序和开关请前往“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>顶部分类</el-tag>
                    <el-tag type="success">{{ getJsonFieldCount('home_top_tabs_json') }} 项</el-tag>
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewPillRow :items="previewHomeTopTabs" icon-fallback="•" />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">首页头部动作已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    刷新、充值、更多等头部按钮现在走结构化表格维护。这里保留实时预览，实际编辑请去“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>首页头部动作</el-tag>
                    <el-tag type="success"
                      >{{ getJsonFieldCount('home_header_actions_json') }} 项</el-tag
                    >
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewPillRow
                    :items="previewHomeHeaderActions"
                    icon-fallback="按"
                    label-fallback="动作"
                  />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">首页分区已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    热门、电子、真人、捕鱼等首页分区已经改成结构化模块维护。这里继续保留当前预览，实际编辑请前往“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>首页分区</el-tag>
                    <el-tag type="success">{{ getJsonFieldCount('home_sections_json') }} 项</el-tag>
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewPillRow
                    :items="previewHomeSections"
                    icon-fallback="分"
                    label-fallback="分区"
                  />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">活动卡已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    活动页运营卡片现在支持表格维护、排序和开关。这里保留预览，实际编辑请前往“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>活动卡</el-tag>
                    <el-tag type="success"
                      >{{ getJsonFieldCount('activity_cards_json') }} 项</el-tag
                    >
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewCardGrid :items="previewActivityCards" variant="activity" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="客服与下载" name="support">
            <div class="site-panel">
              <div class="site-panel__head">
                <div>
                  <div class="site-panel__title">客服、下载与底部导航</div>
                  <div class="site-panel__subtitle">
                    统一维护客服入口、下载引导和底部导航，让支持页与下载页少写死文案。
                  </div>
                </div>
              </div>

              <div class="dialog-grid">
                <el-form-item label="客服标题">
                  <el-input v-model.trim="siteConfigForm.support_title" />
                </el-form-item>
                <el-form-item label="客服副标题">
                  <el-input v-model.trim="siteConfigForm.support_subtitle" />
                </el-form-item>
              </div>

              <div class="dialog-grid">
                <el-form-item label="下载页标题">
                  <el-input v-model.trim="siteConfigForm.download_title" />
                </el-form-item>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">客服入口已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    客服页入口卡片现在统一支持表格维护、排序和开关。这里保留实时预览，实际编辑请去“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>客服入口</el-tag>
                    <el-tag type="success">{{ getJsonFieldCount('support_items_json') }} 项</el-tag>
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview site-migrated-panel__preview--stack">
                  <SitePreviewStack :items="previewSupportItems" variant="support" />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">下载步骤已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    下载页的步骤引导、说明和配图现在改成结构化模块维护，这里继续显示当前效果用于核对。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>下载步骤</el-tag>
                    <el-tag type="success"
                      >{{ getJsonFieldCount('download_steps_json') }} 项</el-tag
                    >
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview site-migrated-panel__preview--stack">
                  <SitePreviewStack :items="previewDownloadSteps" variant="step" />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">底部导航已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    底部导航的图标、跳转和排序已经改成结构化模块维护，这里继续展示当前导航效果。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>底部导航</el-tag>
                    <el-tag type="success"
                      >{{ getJsonFieldCount('bottom_nav_items_json') }} 项</el-tag
                    >
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewPillRow
                    :items="previewBottomNavItems"
                    icon-fallback="导"
                    label-fallback="导航"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="账户区" name="account">
            <div class="site-panel">
              <div class="site-panel__head">
                <div>
                  <div class="site-panel__title">登录与我的页面</div>
                  <div class="site-panel__subtitle">
                    收口登录页辅助文案、我的页菜单和快捷入口，前端通过统一状态管理直接消费。
                  </div>
                </div>
              </div>

              <div class="dialog-grid">
                <el-form-item label="登录页提示">
                  <el-input v-model.trim="siteConfigForm.login_notice_text" />
                </el-form-item>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">登录卡片已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    登录页辅助卡片现在也走结构化模块维护。这里保留当前预览，编辑、排序和开关请前往“前台内容”。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>登录卡片</el-tag>
                    <el-tag type="success">{{ getJsonFieldCount('login_cards_json') }} 项</el-tag>
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview">
                  <SitePreviewCardGrid :items="previewLoginCards" variant="login" />
                </div>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">前台内容已迁移到独立模块</div>
                  <div class="site-migrated-panel__subtitle">
                    首页
                    Banner、活动卡、客服入口、下载步骤、底部导航、登录卡片、大厅快捷入口、我的页快捷入口、我的页菜单、厂商展示和分类规则现在都是结构化数据，统一放到“前台内容”里维护，避免这里和新模块双向覆盖。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>首页 Banner</el-tag>
                    <el-tag type="warning">活动卡</el-tag>
                    <el-tag type="warning">客服入口</el-tag>
                    <el-tag type="warning">下载步骤</el-tag>
                    <el-tag type="warning">底部导航</el-tag>
                    <el-tag type="warning">登录卡片</el-tag>
                    <el-tag type="success">大厅快捷入口</el-tag>
                    <el-tag type="success">我的页快捷入口</el-tag>
                    <el-tag type="success">我的页菜单</el-tag>
                    <el-tag type="warning">厂商展示</el-tag>
                    <el-tag type="info">分类规则</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
              </div>

              <div class="site-migrated-panel">
                <div class="site-migrated-panel__copy">
                  <div class="site-migrated-panel__title">我的页菜单与快捷入口已迁移到前台内容</div>
                  <div class="site-migrated-panel__subtitle">
                    账户区的菜单和快捷入口现在也统一从结构化模块维护。这里继续展示当前效果，方便你核对前台呈现。
                  </div>
                  <div class="site-migrated-panel__tags">
                    <el-tag>{{ getJsonFieldCount('mine_menu_items_json') }} 个菜单项</el-tag>
                    <el-tag type="success"
                      >{{ getJsonFieldCount('mine_shortcuts_json') }} 个快捷入口</el-tag
                    >
                    <el-tag type="warning">结构化排序</el-tag>
                  </div>
                </div>
                <el-button type="primary" plain @click="openFrontendContentCenter">
                  前往前台内容
                </el-button>
                <div class="site-migrated-panel__preview site-migrated-panel__preview--stack">
                  <SitePreviewMenu :items="previewMineMenuItems" />
                  <SitePreviewCardGrid :items="previewMineShortcuts" variant="shortcut" />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus/es/components/message/index'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import SitePreviewCardGrid from '@/components/site-preview/SitePreviewCardGrid.vue'
import SitePreviewMenu from '@/components/site-preview/SitePreviewMenu.vue'
import SitePreviewPillRow from '@/components/site-preview/SitePreviewPillRow.vue'
import SitePreviewStack from '@/components/site-preview/SitePreviewStack.vue'
import { http } from '@/lib/http'
import { useAdminSessionStore } from '@/stores/session'

interface FrontendSiteConfigRow {
  brand_name: string
  brand_subtitle: string
  brand_mark_text: string
  brand_logo_url: string
  default_avatar_url: string
  vip_icon_url: string
  support_title: string
  support_subtitle: string
  download_title: string
  login_notice_text: string
  home_top_tabs_json: string
  home_header_actions_json: string
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

interface SiteAssetUploadPayload {
  url: string
  relative_path: string
  file_name: string
  scope: string
}

type SiteSettingsPanel = 'branding' | 'home' | 'support' | 'account'

type SiteConfigJsonField =
  | 'home_top_tabs_json'
  | 'home_header_actions_json'
  | 'home_sections_json'
  | 'activity_cards_json'
  | 'support_items_json'
  | 'download_steps_json'
  | 'bottom_nav_items_json'
  | 'login_cards_json'
  | 'mine_shortcuts_json'
  | 'mine_menu_items_json'

type SiteAssetField = 'brand_logo_url' | 'default_avatar_url' | 'vip_icon_url'

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

const session = useAdminSessionStore()
const router = useRouter()
const canManage = computed(() => session.hasPermission('operations.manage'))
const activePanel = ref<SiteSettingsPanel>('branding')

const siteConfigLoading = ref(false)
const savingSiteConfig = ref(false)
const uploadingSiteAsset = ref(false)

const siteAssetInput = ref<HTMLInputElement | null>(null)
const assetUploadScope = ref('site-config')
const selectedAssetTargetField = ref<SiteAssetField>('brand_logo_url')
const selectedSiteAsset = ref<File | null>(null)
const uploadedSiteAssetUrl = ref('')

const siteConfigForm = reactive({
  brand_name: '',
  brand_subtitle: '',
  brand_mark_text: '',
  brand_logo_url: '',
  default_avatar_url: '',
  vip_icon_url: '',
  support_title: '',
  support_subtitle: '',
  download_title: '',
  login_notice_text: '',
  home_top_tabs_json: '[]',
  home_header_actions_json: '[]',
  home_sections_json: '[]',
  activity_cards_json: '[]',
  support_items_json: '[]',
  download_steps_json: '[]',
  bottom_nav_items_json: '[]',
  login_cards_json: '[]',
  mine_shortcuts_json: '[]',
  mine_menu_items_json: '[]'
})

const brandAssetCards = computed(() => [
  {
    field: 'brand_logo_url' as const,
    title: '品牌 Logo',
    description: '顶部品牌主视觉和登录页识别图。',
    url: siteConfigForm.brand_logo_url
  },
  {
    field: 'default_avatar_url' as const,
    title: '默认头像',
    description: '游客或未上传头像时的兜底图。',
    url: siteConfigForm.default_avatar_url
  },
  {
    field: 'vip_icon_url' as const,
    title: 'VIP 图标',
    description: '会员权益、等级标识与入口点缀。',
    url: siteConfigForm.vip_icon_url
  }
])

const siteSummaryCards = computed<
  {
    key: SiteSettingsPanel
    title: string
    value: string
    description: string
  }[]
>(() => [
  {
    key: 'branding',
    title: '品牌资产',
    value: `${brandAssetCards.value.filter((item) => item.url).length}/3`,
    description: 'Logo、默认头像、VIP 图标已配置数量'
  },
  {
    key: 'home',
    title: '首页骨架',
    value: String(
      getJsonFieldCount('home_top_tabs_json') +
        getJsonFieldCount('home_header_actions_json') +
        getJsonFieldCount('home_sections_json') +
        getJsonFieldCount('activity_cards_json')
    ),
    description: '顶部分类、头部动作、首页分区与活动卡总项数'
  },
  {
    key: 'support',
    title: '客服与下载',
    value: String(
      getJsonFieldCount('support_items_json') +
        getJsonFieldCount('download_steps_json') +
        getJsonFieldCount('bottom_nav_items_json')
    ),
    description: '客服入口、下载步骤与底部导航总项数'
  },
  {
    key: 'account',
    title: '账户区配置',
    value: String(
      getJsonFieldCount('login_cards_json') +
        getJsonFieldCount('mine_menu_items_json') +
        getJsonFieldCount('mine_shortcuts_json')
    ),
    description: '登录卡片、我的页菜单和快捷入口总项数'
  }
])

const previewHomeTopTabs = computed(() =>
  parseSiteConfigPreview(siteConfigForm.home_top_tabs_json, recommendedSiteTemplates.home_top_tabs)
)
const previewHomeHeaderActions = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.home_header_actions_json,
    recommendedSiteTemplates.home_header_actions
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
const previewDownloadSteps = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.download_steps_json,
    recommendedSiteTemplates.download_steps
  )
)
const previewBottomNavItems = computed(() =>
  parseSiteConfigPreview(
    siteConfigForm.bottom_nav_items_json,
    recommendedSiteTemplates.bottom_nav_items
  )
)
const previewLoginCards = computed(() =>
  parseSiteConfigPreview(siteConfigForm.login_cards_json, recommendedSiteTemplates.login_cards)
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
  void loadSiteConfig()
})

async function loadSiteConfig() {
  siteConfigLoading.value = true
  try {
    const { data } = await http.get<{ data: FrontendSiteConfigRow }>('/admin/site-config')
    siteConfigForm.brand_name = data.data.brand_name || ''
    siteConfigForm.brand_subtitle = data.data.brand_subtitle || ''
    siteConfigForm.brand_mark_text = data.data.brand_mark_text || ''
    siteConfigForm.brand_logo_url = data.data.brand_logo_url || ''
    siteConfigForm.default_avatar_url = data.data.default_avatar_url || ''
    siteConfigForm.vip_icon_url = data.data.vip_icon_url || ''
    siteConfigForm.support_title = data.data.support_title || ''
    siteConfigForm.support_subtitle = data.data.support_subtitle || ''
    siteConfigForm.download_title = data.data.download_title || ''
    siteConfigForm.login_notice_text = data.data.login_notice_text || ''
    siteConfigForm.home_top_tabs_json = data.data.home_top_tabs_json || '[]'
    siteConfigForm.home_header_actions_json = data.data.home_header_actions_json || '[]'
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

function handleSiteAssetChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  selectedSiteAsset.value = input?.files?.[0] || null
}

async function uploadSiteAsset() {
  if (!selectedSiteAsset.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  uploadingSiteAsset.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedSiteAsset.value)
    formData.append('scope', assetUploadScope.value)
    const { data } = await http.post<{ data: SiteAssetUploadPayload }>(
      '/admin/site-assets/upload',
      formData
    )
    uploadedSiteAssetUrl.value = data.data.url
    await copyText(data.data.url)
    ElMessage.success('素材上传成功，地址已复制')
    selectedSiteAsset.value = null
    if (siteAssetInput.value) {
      siteAssetInput.value.value = ''
    }
  } finally {
    uploadingSiteAsset.value = false
  }
}

function applyUploadedSiteAssetToField() {
  if (!uploadedSiteAssetUrl.value) {
    ElMessage.warning('请先上传素材')
    return
  }
  siteConfigForm[selectedAssetTargetField.value] = uploadedSiteAssetUrl.value
  ElMessage.success('已把素材地址写入对应字段')
}

async function copyUploadedSiteAssetUrl() {
  if (!uploadedSiteAssetUrl.value) {
    return
  }
  await copyText(uploadedSiteAssetUrl.value)
  ElMessage.success('素材地址已复制')
}

async function submitSiteConfig() {
  savingSiteConfig.value = true
  try {
    await http.put('/admin/site-config', {
      brand_name: siteConfigForm.brand_name,
      brand_subtitle: siteConfigForm.brand_subtitle,
      brand_mark_text: siteConfigForm.brand_mark_text,
      brand_logo_url: siteConfigForm.brand_logo_url,
      default_avatar_url: siteConfigForm.default_avatar_url,
      vip_icon_url: siteConfigForm.vip_icon_url,
      support_title: siteConfigForm.support_title,
      support_subtitle: siteConfigForm.support_subtitle,
      download_title: siteConfigForm.download_title,
      login_notice_text: siteConfigForm.login_notice_text
    })
    ElMessage.success('站点装修配置已更新')
    await loadSiteConfig()
  } finally {
    savingSiteConfig.value = false
  }
}

function applyRecommendedSiteTemplates() {
  if (!siteConfigForm.brand_name) {
    siteConfigForm.brand_name = 'TKZC668'
  }
  if (!siteConfigForm.brand_subtitle) {
    siteConfigForm.brand_subtitle = 'TKZC Entertainment'
  }
  if (!siteConfigForm.brand_mark_text) {
    siteConfigForm.brand_mark_text = 'TKZC'
  }
  if (!siteConfigForm.brand_logo_url) {
    siteConfigForm.brand_logo_url = 'https://tkzc668.com/static/img/logo.png'
  }
  if (!siteConfigForm.default_avatar_url) {
    siteConfigForm.default_avatar_url = 'https://tkzc668.com/static/img/avatar_default.png'
  }
  if (!siteConfigForm.vip_icon_url) {
    siteConfigForm.vip_icon_url = 'https://tkzc668.com/static/img/vip_icon.png'
  }
  if (!siteConfigForm.support_title) {
    siteConfigForm.support_title = '24小时在线客服'
  }
  if (!siteConfigForm.support_subtitle) {
    siteConfigForm.support_subtitle = '竭诚为您服务'
  }
  if (!siteConfigForm.download_title) {
    siteConfigForm.download_title = '如何下载'
  }
  if (!siteConfigForm.login_notice_text) {
    siteConfigForm.login_notice_text = '本地演示账号：player_demo / 123456'
  }
}

function parseJsonArray(raw: string) {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getJsonFieldCount(field: SiteConfigJsonField) {
  return parseJsonArray(siteConfigForm[field])?.length || 0
}

function openFrontendContentCenter() {
  void router.push({ name: 'FrontendContent' })
}

function parseSiteConfigPreview(raw: string, fallbackItems: SiteConfigPreviewItem[]) {
  const parsed = parseJsonArray(raw)
  if (!parsed || parsed.length === 0) {
    return fallbackItems
  }
  return parsed.map((item, index) => ({
    ...(fallbackItems.find((candidate) => candidate.code && candidate.code === item?.code) ||
      fallbackItems[index] ||
      {}),
    ...(item || {})
  }))
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

.section-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.site-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.site-summary-card {
  padding: 16px 18px;
  cursor: pointer;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.site-summary-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgb(15 23 42 / 8%);
}

.site-summary-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.site-summary-card__title {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.site-summary-card__desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: #64748b;
}

.site-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.site-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.site-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.site-panel__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.site-panel__subtitle {
  margin-top: 8px;
  line-height: 1.8;
  color: #64748b;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.site-assets-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.site-assets-card {
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
}

.site-assets-card__media {
  display: flex;
  min-height: 132px;
  overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
  border-radius: 18px;
  align-items: center;
  justify-content: center;
}

.site-assets-card__media img {
  display: block;
  width: 100%;
  height: 132px;
  object-fit: contain;
}

.site-assets-card__empty {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.site-assets-card__title {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.site-assets-card__desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: #64748b;
}

.site-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: -4px 0 18px;
}

.asset-toolbox {
  display: flex;
  padding: 18px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  flex-direction: column;
  gap: 14px;
}

.asset-toolbox__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.asset-toolbox__subtitle {
  margin-top: 6px;
  line-height: 1.7;
  color: #64748b;
}

.asset-toolbox__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.asset-toolbox__scope {
  width: 156px;
}

.asset-toolbox__target {
  width: 156px;
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

.asset-picker input {
  position: absolute;
  cursor: pointer;
  opacity: 0;
  inset: 0;
}

.asset-toolbox__result {
  display: flex;
  padding: 12px;
  background: #fff;
  border-radius: 18px;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.asset-toolbox__preview {
  width: 92px;
  height: 68px;
  overflow: hidden;
  background: #e2e8f0;
  border-radius: 14px;
}

.asset-toolbox__preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-toolbox__meta {
  min-width: 0;
  flex: 1;
}

.asset-toolbox__url {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-all;
}

.asset-toolbox__hint {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.site-migrated-panel {
  display: flex;
  padding: 18px;
  margin: 4px 0 18px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #dbeafe;
  border-radius: 22px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
}

.site-migrated-panel__copy {
  min-width: 0;
}

.site-migrated-panel__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.site-migrated-panel__subtitle {
  margin-top: 8px;
  line-height: 1.75;
  color: #475569;
}

.site-migrated-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.site-migrated-panel__preview {
  width: 100%;
  margin-top: 4px;
}

.site-migrated-panel__preview--stack {
  display: grid;
  gap: 14px;
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

  .asset-toolbox__scope,
  .asset-toolbox__target,
  .asset-picker,
  .site-migrated-panel {
    width: 100%;
    min-width: 0;
  }

  .site-migrated-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-preview-grid {
    grid-template-columns: 1fr;
  }

  .site-summary-grid,
  .site-assets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
