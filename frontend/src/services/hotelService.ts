import apiClient from './api'
import type { HotelSearchParams, HotelSearchResponse } from '../types/tripai'

export const hotelService = {
  searchHotels: async (params: HotelSearchParams) => {
    // Log the outgoing request for debugging in the browser console
    console.debug('[hotelService] searchHotels params:', params)
    const response = await apiClient.get<HotelSearchResponse>('/hotels/search', { params })
    return response.data
  },
}
