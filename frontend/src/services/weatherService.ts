import apiClient from './api'

export interface WeatherForecastParams {
  destination: string
  start_date: string
  end_date: string
}

export interface WeatherForecastItem {
  date: string
  temperature_max: number
  temperature_min: number
  condition: string
  rain_probability: number
  humidity?: number
  wind_speed?: number
  warning?: string
}

export interface WeatherForecastResponse {
  status: string
  destination: string
  period: string
  forecast: WeatherForecastItem[]
}

export const weatherService = {
  getForecast: async (params: WeatherForecastParams) => {
    const response = await apiClient.get<WeatherForecastResponse>('/weather/forecast', { params })
    return response.data
  },
  getCurrent: async (destination: string) => {
    const response = await apiClient.get<any>('/weather/current', { params: { destination } })
    return response.data
  },
}
