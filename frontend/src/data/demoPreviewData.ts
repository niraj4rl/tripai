// Temporary UI preview data. Replace with API data before production.

import type { FlightResult, PlaceResult, StayResult, TripRecord } from '../types/tripai'

export const previewHotels: StayResult[] = [
  {
    id: 'preview-hotel-1',
    name: 'Sharayu Pawana Lake Retreat',
    location: 'Pune, Maharashtra',
    address: 'Pawna, near Lonavala',
    rating: 4.7,
    reviews: '126',
    pricePerNight: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Wifi', 'Lake view', 'Breakfast'],
    tags: ['2 beds', '1 bathroom', 'Family friendly', 'BBQ'],
  },
  {
    id: 'preview-hotel-2',
    name: 'Hotel WooW Suites',
    location: 'Pune, Maharashtra',
    address: 'Koregaon Park',
    rating: 4.5,
    reviews: '212',
    pricePerNight: 3199,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Parking', 'Air conditioning', 'Pool'],
    tags: ['2 bedrooms', '2 baths', 'Check-in 1:00 PM', '2 guests'],
  },
]

export const previewPlaces: PlaceResult[] = [
  {
    id: 'preview-place-1',
    name: 'Sharayu Pawana Lake',
    address: 'Pawna, Lonavala',
    category: 'Nature',
    rating: 4.6,
    distance: '40 min',
    photoUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preview-place-2',
    name: 'Old Fort Walk',
    address: 'Lohagad Fort',
    category: 'Heritage',
    rating: 4.4,
    distance: '1h 10m',
    photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  },
]

export const previewFlights: FlightResult[] = [
  {
    id: 'preview-flight-1',
    airline: 'IndiGo',
    origin: 'BOM',
    destination: 'GOI',
    departure_time: '09:10',
    arrival_time: '10:20',
    duration: '1h 10m',
    stops: 0,
    price: 4300,
    currency: 'INR',
    external_url: 'https://example.com/flights',
  },
]

export const previewTrips: TripRecord[] = [
  {
    id: 'preview-trip-1',
    title: 'Goa Weekend Escape',
    destination: 'Goa',
    source_city: 'Mumbai',
    start_date: '2026-06-12',
    end_date: '2026-06-15',
    travellers_count: 2,
    budget_total: 32000,
    currency: 'INR',
    status: 'planned',
    ai_summary: 'Beach-heavy itinerary with nightlife and cafe stops.',
    total_estimated_cost: 29850,
  },
]
