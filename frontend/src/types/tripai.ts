export interface DestinationSpot {
  id: string
  name: string
  location: string
  averagePrice?: number
  rating?: number
  tripLength?: string
  imageUrl?: string
}

export interface StayResult {
  id: string
  name: string
  location: string
  address?: string
  rating?: number
  reviews?: string
  pricePerNight?: number
  imageUrl?: string
  images?: string[]
  amenities?: string[]
  tags?: string[]
  lat?: number
  lng?: number
}

export interface PlaceResult {
  id: string
  name: string
  address: string
  category?: string
  rating?: number
  distance?: string
  photoUrl?: string
  lat?: number
  lng?: number
  map_url?: string
}

export interface FlightResult {
  id: string
  airline: string
  origin: string
  destination: string
  departure_time?: string
  arrival_time?: string
  duration?: string
  stops?: number
  price?: number
  currency?: string
  external_url?: string
}

export interface TripPlanRequestPayload {
  source_city: string
  destination: string
  start_date: string
  end_date: string
  travellers_count: number
  budget_total: number
  currency: string
  trip_type: string
  hotel_preference: string
  transport_preference: string
  food_preference?: string
  pace: string
  interests: string[]
  hotel_rating_min: number
  safety_preference: string
  accessibility_needs?: string
  local_transport_preference: string
}

export interface TripPlanResponse {
  trip_title: string
  summary: string
  budget_status: 'realistic' | 'tight' | 'unrealistic' | string
  estimated_total_cost: number
  warnings?: string[]
  days?: Array<{
    day: number
    title: string
    morning?: string[]
    afternoon?: string[]
    evening?: string[]
    food_suggestions?: string[]
    transport_notes?: string
    estimated_cost?: number
  }>
  recommended_hotels?: Array<{
    name: string
    address: string
    rating: number
    price_per_night: number
    currency: string
    external_url?: string
  }>
  recommended_flights?: Array<{
    airline: string
    departure_time: string
    arrival_time: string
    duration: string
    stops: number
    price: number
    currency: string
    external_url?: string
  }>
  recommended_places?: Array<Record<string, unknown>>
  external_links?: Array<Record<string, unknown>>
}

export interface FlightSearchParams {
  origin: string
  destination: string
  departure_date: string
  return_date?: string
  travellers: number
}

export interface FlightSearchResponse {
  status?: string
  origin?: string
  destination?: string
  departure_date?: string
  flights?: FlightResult[]
  count?: number
}

export interface HotelSearchParams {
  destination: string
  check_in: string
  check_out: string
  guests: number
  min_rating: number
}

export interface HotelSearchResponse {
  status?: string
  destination?: string
  check_in?: string
  check_out?: string
  hotels?: StayResult[]
  count?: number
}

export interface PlaceSearchParams {
  query: string
  location: string
  radius: number
}

export interface PlaceSearchResponse {
  status?: string
  query?: string
  location?: string
  places?: PlaceResult[]
  count?: number
}

export interface TripRecord {
  id: string
  title?: string
  destination?: string
  source_city?: string
  start_date?: string
  end_date?: string
  travellers_count?: number
  budget_total?: number
  currency?: string
  status?: string
  created_at?: string
  ai_summary?: string
  total_estimated_cost?: number
  itinerary_data?: unknown
}
