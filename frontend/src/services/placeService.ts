import apiClient from './api'
import type { PlaceSearchParams, PlaceSearchResponse } from '../types/tripai'

export const placeService = {
  searchPlaces: async (params: PlaceSearchParams) => {
    const response = await apiClient.get<PlaceSearchResponse>('/places/search', { params })
    return response.data
  },
}
