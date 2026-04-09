import { cloneDeep } from 'lodash-es'
import type { AdminUser } from '@/store/modules/user'

type AdminLeafRoute = {
  path: string
  routeName: string
  viewName: string
  title: string
  icon: string
  permission: string
  affix?: boolean
}

const createLeafRoute = (item: AdminLeafRoute): AppCustomRouteRecordRaw => ({
  path: item.path,
  component: '#',
  name: `${item.routeName}Root`,
  meta: {
    title: item.title
  },
  children: [
    {
      path: '',
      name: item.routeName,
      component: `views/${item.viewName}`,
      meta: {
        title: item.title,
        icon: item.icon,
        affix: item.affix,
        permission: [item.permission]
      }
    }
  ]
})

const standaloneAdminRoutes: AppCustomRouteRecordRaw[] = [
  createLeafRoute({
    path: '/dashboard',
    routeName: 'Dashboard',
    viewName: 'DashboardView',
    title: '概览面板',
    icon: 'ep:data-analysis',
    permission: 'dashboard.view',
    affix: true
  }),
  createLeafRoute({
    path: '/reports',
    routeName: 'Reports',
    viewName: 'ReportsView',
    title: '统计报表',
    icon: 'ep:histogram',
    permission: 'dashboard.view'
  }),
  createLeafRoute({
    path: '/admins',
    routeName: 'Admins',
    viewName: 'AdminsView',
    title: '后台账号',
    icon: 'ep:user-filled',
    permission: 'admins.view'
  }),
  createLeafRoute({
    path: '/roles',
    routeName: 'Roles',
    viewName: 'RolesView',
    title: '角色权限',
    icon: 'ep:key',
    permission: 'admins.view'
  }),
  createLeafRoute({
    path: '/users',
    routeName: 'Users',
    viewName: 'UsersView',
    title: '玩家管理',
    icon: 'ep:user',
    permission: 'users.view'
  }),
  createLeafRoute({
    path: '/games',
    routeName: 'Games',
    viewName: 'GamesView',
    title: '游戏管理',
    icon: 'ep:monitor',
    permission: 'games.view'
  }),
  createLeafRoute({
    path: '/wallet-logs',
    routeName: 'WalletLogs',
    viewName: 'WalletLogsView',
    title: '账变明细',
    icon: 'ep:wallet',
    permission: 'wallet_logs.view'
  }),
  createLeafRoute({
    path: '/providers',
    routeName: 'Providers',
    viewName: 'ProvidersView',
    title: '供应商管理',
    icon: 'ep:connection',
    permission: 'providers.view'
  }),
  createLeafRoute({
    path: '/login-logs',
    routeName: 'LoginLogs',
    viewName: 'LoginLogsView',
    title: '登录日志',
    icon: 'ep:histogram',
    permission: 'audit_logs.view'
  }),
  createLeafRoute({
    path: '/audit-logs',
    routeName: 'AuditLogs',
    viewName: 'AuditLogsView',
    title: '审计日志',
    icon: 'ep:document-checked',
    permission: 'audit_logs.view'
  }),
  createLeafRoute({
    path: '/win-loss',
    routeName: 'WinLoss',
    viewName: 'WinLossView',
    title: '胜负统计',
    icon: 'ep:trend-charts',
    permission: 'observability.view'
  }),
  createLeafRoute({
    path: '/observability',
    routeName: 'Observability',
    viewName: 'ObservabilityView',
    title: '可观测性',
    icon: 'ep:trend-charts',
    permission: 'observability.view'
  })
]

const operationsCenterRoute: AppCustomRouteRecordRaw = {
  path: '/operations',
  component: '#',
  name: 'OperationsCenterRoot',
  redirect: '/operations/orchestration',
  meta: {
    title: '运营中心',
    icon: 'ep:operation',
    alwaysShow: true
  },
  children: [
    {
      path: 'orchestration',
      name: 'Operations',
      component: 'views/OperationsView',
      meta: {
        title: '运营编排',
        icon: 'ep:operation',
        permission: ['operations.view']
      }
    },
    {
      path: 'frontend-content',
      name: 'FrontendContent',
      component: 'views/FrontendContentView',
      meta: {
        title: '前台内容',
        icon: 'ep:picture-filled',
        permission: ['operations.view']
      }
    },
    {
      path: 'site-settings',
      name: 'SiteSettings',
      component: 'views/SiteSettingsView',
      meta: {
        title: '站点装修',
        icon: 'ep:brush-filled',
        permission: ['operations.view']
      }
    },
    {
      path: 'tasks',
      name: 'Tasks',
      component: 'views/TasksView',
      meta: {
        title: '任务配置',
        icon: 'ep:list',
        permission: ['operations.view']
      }
    },
    {
      path: 'crypto-tutorials',
      name: 'CryptoTutorials',
      component: 'views/CryptoTutorialsView',
      meta: {
        title: '购买教程',
        icon: 'ep:reading',
        permission: ['operations.view']
      }
    },
    {
      path: 'lottery-records',
      name: 'LotteryRecords',
      component: 'views/LotteryRecordsView',
      meta: {
        title: '抽奖明细',
        icon: 'ep:present',
        permission: ['operations.view']
      }
    },
    {
      path: 'security-items',
      name: 'SecurityCenterItems',
      component: 'views/SecurityCenterItemsView',
      meta: {
        title: '安全中心菜单',
        icon: 'ep:lock',
        permission: ['operations.view']
      }
    },
    {
      path: 'withdraw-protocols',
      name: 'WithdrawProtocols',
      component: 'views/WithdrawProtocolsView',
      meta: {
        title: '提现协议配置',
        icon: 'ep:money',
        permission: ['operations.view']
      }
    }
  ]
}

const legacyOperationsChildRoutes: AppCustomRouteRecordRaw[] = [
  {
    path: '/frontend-content',
    component: '#',
    name: 'FrontendContentLegacyRoot',
    redirect: '/operations/frontend-content',
    meta: {
      hidden: true,
      permission: ['operations.view']
    }
  }
]

export const adminRouteDefinitions: AppCustomRouteRecordRaw[] = [
  ...standaloneAdminRoutes,
  operationsCenterRoute,
  ...legacyOperationsChildRoutes
]

export const hasAdminPermission = (user: AdminUser | undefined, permission?: string) => {
  if (!permission) {
    return true
  }

  if (!user || user.role !== 'admin') {
    return false
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : []
  if (!permissions.length) {
    return user.role_code === 'super_admin'
  }

  return permissions.includes(permission)
}

const filterRouteTreeByPermission = (
  routes: AppCustomRouteRecordRaw[],
  user: AdminUser | undefined
) => {
  return routes
    .map((route) => {
      const current = cloneDeep(route)
      if (current.children?.length) {
        current.children = filterRouteTreeByPermission(current.children, user)
        if (current.children.length) {
          return current
        }
      }

      const permission = current.meta?.permission?.[0]
      return hasAdminPermission(user, permission) ? current : null
    })
    .filter(Boolean) as AppCustomRouteRecordRaw[]
}

const joinRoutePath = (parentPath: string, childPath: string) => {
  if (!childPath) {
    return parentPath || '/'
  }
  if (childPath.startsWith('/')) {
    return childPath
  }
  return `${parentPath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`
}

const findFirstAccessiblePath = (
  routes: AppCustomRouteRecordRaw[],
  parentPath = ''
): string | undefined => {
  for (const route of routes) {
    const currentPath = parentPath ? joinRoutePath(parentPath, route.path) : route.path
    if (route.redirect) {
      return route.redirect
    }
    if (route.children?.length) {
      const nextPath = findFirstAccessiblePath(route.children, currentPath)
      if (nextPath) {
        return nextPath
      }
    } else if (currentPath) {
      return currentPath
    }
  }

  return undefined
}

export const buildAccessibleAdminRoutes = (user: AdminUser | undefined) => {
  if (!user) {
    return [] as AppCustomRouteRecordRaw[]
  }

  return filterRouteTreeByPermission(adminRouteDefinitions, user)
}

export const resolveFirstAccessiblePath = (user: AdminUser | undefined) => {
  const routes = buildAccessibleAdminRoutes(user)
  return findFirstAccessiblePath(routes) || '/404'
}
