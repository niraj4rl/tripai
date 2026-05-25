import apiClient from './api'
import type { FlightSearchParams, FlightSearchResponse } from '../types/tripai'

export const flightService = {
  searchFlights: async (params: FlightSearchParams) => {
    const response = await apiClient.get<FlightSearchResponse>('/flights/search', { params })
    return response.data
  },
  getExternalPrice: async (externalUrl: string) => {
    const response = await apiClient.get('/flights/preview_price', { params: { url: externalUrl } })
    return response.data
  }
}
