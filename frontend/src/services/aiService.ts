import apiClient from './api'
import type { TripPlanRequestPayload, TripPlanResponse } from '../types/tripai'

export const aiService = {
  generateTripPlan: async (payload: TripPlanRequestPayload) => {
    const response = await apiClient.post<TripPlanResponse>('/ai/trip-plan', payload)
    return response.data
  },
  checkBudget: async (payload: TripPlanRequestPayload) => {
    const response = await apiClient.post('/ai/budget-check', payload)
    return response.data
  },
  refineTrip: async (tripId: string, payload: Record<string, unknown>) => {
    const response = await apiClient.post(`/ai/refine-trip/${tripId}`, payload)
    return response.data
  },
  chat: async (tripId: string, message: string) => {
    const response = await apiClient.post(`/ai/chat/${tripId}`, { message })
    return response.data
  },
}
