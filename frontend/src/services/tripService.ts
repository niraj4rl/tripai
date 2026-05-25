import apiClient from './api'
import type { TripRecord } from '../types/tripai'

export const tripService = {
  listTrips: async () => {
    const response = await apiClient.get<{ trips?: TripRecord[] } | TripRecord[]>('/trips')
    return response.data
  },
  getTripById: async (tripId: string) => {
    const response = await apiClient.get(`/trips/${tripId}`)
    return response.data
  },
  saveTrip: async (tripId: string) => {
    const response = await apiClient.post(`/trips/${tripId}/save`)
    return response.data
  },
  createTrip: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post('/trips/create', payload)
    return response.data
  },
}
