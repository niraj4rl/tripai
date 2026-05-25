import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Bath, BedDouble, Heart, MapPin, Share2, ShieldCheck, Users } from 'lucide-react'
import { previewHotels } from '../data/demoPreviewData'
import { PrimaryButton, SurfaceCard } from '../components/TripUI'
import OSMMap from '../components/OSMMap'
import type { StayResult } from '../types/tripai'

const HOTEL_RESULTS_CACHE_KEY = 'tripai_hotel_results'

function readCachedHotels() {
  if (typeof sessionStorage === 'undefined') return [] as StayResult[]

  try {
    const raw = sessionStorage.getItem(HOTEL_RESULTS_CACHE_KEY)
    if (!raw) return [] as StayResult[]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StayResult[]) : []
  } catch {
    return [] as StayResult[]
  }
}

export default function HotelDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { hotelId } = useParams()
  
  const locationState = location.state as { hotel?: StayResult } | null
  const useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true'

  const cachedHotel = readCachedHotels().find((item) => item.id === hotelId)
  const hotel = locationState?.hotel ?? cachedHotel ?? (useDemo ? (previewHotels.find((item) => item.id === hotelId) ?? previewHotels[0]) : null)

  if (!hotel) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[30px] border border-dashed border-[var(--border)] bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-[var(--text)]">Hotel details unavailable</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Please go back to search results and open the hotel from there.</p>
        <PrimaryButton className="mt-4" onClick={() => navigate(-1)}>Go Back</PrimaryButton>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-white shadow-soft">
        <img src={hotel.imageUrl} alt={hotel.name} className="h-72 w-full object-cover" />

        <button type="button" onClick={() => navigate(-1)} className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute right-4 top-4 flex gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/90"><Share2 className="h-4 w-4" /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/90"><Heart className="h-4 w-4" /></button>
        </div>

        <div className="absolute inset-x-3 bottom-3 rounded-3xl border border-[var(--border)] bg-white/95 p-4 backdrop-blur">
          <h1 className="text-xl font-semibold text-[var(--text)]">{hotel.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-[var(--muted)]"><MapPin className="h-4 w-4" />{hotel.location}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-[var(--surface)] px-3 py-2"><BedDouble className="mb-1 h-4 w-4" />2 Bedrooms</div>
            <div className="rounded-2xl bg-[var(--surface)] px-3 py-2"><Bath className="mb-1 h-4 w-4" />2 Bathrooms</div>
            <div className="rounded-2xl bg-[var(--surface)] px-3 py-2"><Users className="mb-1 h-4 w-4" />2 Guests</div>
            <div className="rounded-2xl bg-[var(--surface)] px-3 py-2"><ShieldCheck className="mb-1 h-4 w-4" />Verified Host</div>
          </div>
        </div>
      </section>

      {/* Host information intentionally removed */}

      <SurfaceCard className="p-5">
        <h2 className="text-lg font-semibold">What this place offers</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(hotel.amenities ?? []).map((amenity) => (
            <span key={amenity} className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs">
              {amenity}
            </span>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <h2 className="text-lg font-semibold">Map preview</h2>
        <div className="mt-3">
          <OSMMap title={hotel.name} query={hotel.address || hotel.location} />
        </div>
      </SurfaceCard>

      <PrimaryButton className="w-full" onClick={() => window.open('https://example.com/hotel', '_blank', 'noopener,noreferrer')}>
        Book on external partner
      </PrimaryButton>
    </div>
  )
}
