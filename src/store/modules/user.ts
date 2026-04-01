import { defineStore } from 'pinia'
import { ElMessageBox } from 'element-plus'
import type { UserLoginType } from '@/api/login/types'
import { useI18n } from '@/hooks/web/useI18n'
import { store } from '../index'
import { resetRouter } from '@/router'
import router from '@/router'
import { http } from '@/lib/http'
import { buildAccessibleAdminRoutes } from '@/router/adminRoutes'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'

interface UserState {
  userInfo?: AdminUser
  tokenKey: string
  accessToken: string
  roleRouters?: AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  loading: boolean
}

export interface AdminUser {
  id: number
  username: string
  uid: string
  balance: number
  role: string
  role_id?: number
  role_code?: string
  role_name?: string
  permissions?: string[]
  two_factor_enabled?: boolean
  two_factor_enabled_at?: string | null
  allowed_ip_list?: string
  status: number
}

export interface AdminLoginResult {
  user: AdminUser
  securityAlerts: string[]
}

const ACCESS_TOKEN_STORAGE_KEY = 'admin_access_token'
const ADMIN_USER_STORAGE_KEY = 'admin_user_profile'
const ADMIN_LOGIN_INFO_STORAGE_KEY = 'admin_login_info'

const readAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() || ''
}

const writeAccessToken = (token: string) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
    return
  }
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

const readStoredUser = (): AdminUser | undefined => {
  const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY)
  if (!raw) {
    return undefined
  }

  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY)
    return undefined
  }
}

const writeStoredUser = (userInfo?: AdminUser) => {
  if (userInfo) {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(userInfo))
    return
  }
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY)
}

const readStoredLoginInfo = (): UserLoginType | undefined => {
  const raw = localStorage.getItem(ADMIN_LOGIN_INFO_STORAGE_KEY)
  if (!raw) {
    return undefined
  }

  try {
    return JSON.parse(raw) as UserLoginType
  } catch {
    localStorage.removeItem(ADMIN_LOGIN_INFO_STORAGE_KEY)
    return undefined
  }
}

const writeStoredLoginInfo = (loginInfo?: UserLoginType) => {
  if (loginInfo) {
    localStorage.setItem(ADMIN_LOGIN_INFO_STORAGE_KEY, JSON.stringify(loginInfo))
    return
  }
  localStorage.removeItem(ADMIN_LOGIN_INFO_STORAGE_KEY)
}

const hasPermission = (userInfo: AdminUser | undefined, permission?: string) => {
  if (!permission) {
    return true
  }

  if (!userInfo || userInfo.role !== 'admin') {
    return false
  }

  const permissions = Array.isArray(userInfo.permissions) ? userInfo.permissions : []
  if (!permissions.length) {
    return userInfo.role_code === 'super_admin'
  }

  return permissions.includes(permission)
}

const initialUser = readStoredUser()

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: initialUser,
    tokenKey: 'Authorization',
    accessToken: readAccessToken(),
    roleRouters: buildAccessibleAdminRoutes(initialUser),
    rememberMe: true,
    loginInfo: readStoredLoginInfo(),
    loading: false
  }),
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.accessToken ? `Bearer ${this.accessToken}` : ''
    },
    getUserInfo(): AdminUser | undefined {
      return this.userInfo
    },
    getRoleRouters(): AppCustomRouteRecordRaw[] {
      if (this.roleRouters?.length) {
        return this.roleRouters
      }
      return buildAccessibleAdminRoutes(this.userInfo)
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getLoading(): boolean {
      return this.loading
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setAccessToken(token: string) {
      this.accessToken = token.trim()
      writeAccessToken(this.accessToken)
    },
    setUserInfo(userInfo?: AdminUser) {
      this.userInfo = userInfo
      this.roleRouters = buildAccessibleAdminRoutes(userInfo)
      writeStoredUser(userInfo)
    },
    setRoleRouters(roleRouters: AppCustomRouteRecordRaw[]) {
      this.roleRouters = roleRouters
    },
    hasPermission(permission: string) {
      return hasPermission(this.userInfo, permission)
    },
    async login(username: string, password: string, otpCode = '') {
      this.loading = true
      try {
        const { data } = await http.post<{
          access_token: string
          user: AdminUser
          security_alerts?: string[]
        }>('/admin/auth/login', { username, password, otp_code: otpCode })

        if (this.rememberMe) {
          this.setLoginInfo({ username, password })
        } else {
          this.setLoginInfo(undefined)
        }

        this.setAccessToken(data.access_token)
        this.setUserInfo(data.user)

        return {
          user: data.user,
          securityAlerts: data.security_alerts || []
        } satisfies AdminLoginResult
      } finally {
        this.loading = false
      }
    },
    async fetchMe() {
      if (!this.accessToken) {
        this.setUserInfo(undefined)
        return undefined
      }

      const { data } = await http.get<{ data: AdminUser }>('/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      })

      this.setUserInfo(data.data)
      return data.data
    },
    async ensureSession() {
      if (!this.accessToken) {
        return undefined
      }

      if (this.userInfo) {
        this.roleRouters = buildAccessibleAdminRoutes(this.userInfo)
        return this.userInfo
      }

      return await this.fetchMe()
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          await this.logout()
        })
        .catch(() => {})
    },
    reset(redirect = true) {
      const tagsViewStore = useTagsViewStore()
      const permissionStore = usePermissionStore()
      tagsViewStore.delAllViews()
      permissionStore.reset()
      resetRouter()
      this.loading = false
      this.setAccessToken('')
      this.setUserInfo(undefined)
      this.setRoleRouters([])
      if (redirect) {
        router.replace('/login')
      }
    },
    async logout() {
      if (this.accessToken) {
        try {
          await http.post('/admin/auth/logout')
        } catch {
          // 本地会话仍然需要被清理
        }
      }
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
      writeStoredLoginInfo(loginInfo)
    }
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
