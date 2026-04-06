import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: newRefresh } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', newRefresh)
          
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`
          
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// API functions
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout')
}

export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),
  getCreditProfile: () => api.get('/api/users/me/credit-profile'),
  getDashboard: () => api.get('/api/users/me/dashboard')
}

export const loanAPI = {
  create: (data) => api.post('/api/loans', data),
  getAll: () => api.get('/api/loans'),
  getOne: (id) => api.get(`/api/loans/${id}`),
  submit: (id) => api.post(`/api/loans/${id}/submit`),
  getAssessment: (id) => api.get(`/api/loans/${id}/assessment`)
}

export const scoringAPI = {
  quickAssess: (data) => api.post('/api/scoring/assess', data),
  getGRR: () => api.get('/api/scoring/grr'),
  getRiskPremiums: () => api.get('/api/scoring/risk-premiums'),
  getCreditCoach: (data) => api.post('/api/scoring/credit-coach', data)
}

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getApplications: (params) => api.get('/api/admin/applications', { params }),
  getApplicationDetail: (id) => api.get(`/api/admin/applications/${id}`),
  decideApplication: (id, data) => api.post(`/api/admin/applications/${id}/decide`, data),
  getAnalytics: (days) => api.get('/api/admin/analytics', { params: { days } }),
  getUsers: (params) => api.get('/api/admin/users', { params })
}
