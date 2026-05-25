import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data: { full_name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  me: () => apiClient.get('/auth/me'),
}

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: any) => apiClient.put('/users/profile', data),
  updatePreferences: (data: any) => apiClient.put('/users/preferences', data),
}

// Trip APIs
export const tripAPI = {
  create: (data: any) => apiClient.post('/trips/create', data),
  list: () => apiClient.get('/trips'),
  get: (tripId: string) => apiClient.get(`/trips/${tripId}`),
  update: (tripId: string, data: any) => apiClient.put(`/trips/${tripId}`, data),
  delete: (tripId: string) => apiClient.delete(`/trips/${tripId}`),
  save: (tripId: string) => apiClient.post(`/trips/${tripId}/save`),
  export: (tripId: string) => apiClient.post(`/trips/${tripId}/export`),
}

// AI APIs
export const aiAPI = {
  generateTripPlan: (data: any) => apiClient.post('/ai/trip-plan', data),
  refineTip: (tripId: string, data: any) => apiClient.post(`/ai/refine-trip/${tripId}`, data),
  chat: (tripId: string, data: any) => apiClient.post(`/ai/chat/${tripId}`, data),
  checkBudget: (data: any) => apiClient.post('/ai/budget-check', data),
}

// Flight APIs
export const flightAPI = {
  search: (params: any) => apiClient.get('/flights/search', { params }),
}

// Hotel APIs
export const hotelAPI = {
  search: (params: any) => apiClient.get('/hotels/search', { params }),
}

// Places APIs
export const placesAPI = {
  search: (params: any) => apiClient.get('/places/search', { params }),
  getDetails: (placeId: string) => apiClient.get(`/places/details/${placeId}`),
  getNearby: (params: any) => apiClient.get('/places/nearby', { params }),
}

// Weather APIs
export const weatherAPI = {
  getForecast: (params: any) => apiClient.get('/weather/forecast', { params }),
  getCurrent: (params: any) => apiClient.get('/weather/current', { params }),
}

export default apiClient
