import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export type { AdminUser, AdminLoginResult } from '@/store/modules/user'

export const useAdminSessionStore = defineStore('admin-session', () => {
  const userStore = useUserStore()

  const user = computed(() => userStore.getUserInfo || null)
  const loading = computed(() => userStore.getLoading)
  const isAuthenticated = computed(() => Boolean(userStore.accessToken) && Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

  const hasPermission = (permission: string) => {
    return userStore.hasPermission(permission)
  }

  const setUser = (profile: typeof user.value) => {
    userStore.setUserInfo(profile || undefined)
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    hasPermission,
    setUser,
    login: userStore.login,
    fetchMe: userStore.fetchMe,
    logout: userStore.logout
  }
})
