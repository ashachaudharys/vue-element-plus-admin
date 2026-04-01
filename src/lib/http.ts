import axios from 'axios'

export const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_PATH?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    '/api',
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_user_profile')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
