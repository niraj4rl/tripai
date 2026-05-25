import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Heart, Landmark, MapPin, SlidersHorizontal, Star, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { hotelService } from '../services/hotelService'
import { previewHotels } from '../data/demoPreviewData'
import { AppPanel, ChipRail, ErrorState, EmptyState, Field, PrimaryButton, SectionHeader, SkeletonRail } from '../components/TripUI'
import LocationAutocomplete from '../components/LocationAutocomplete'
import type { HotelSearchResponse, StayResult } from '../types/tripai'

const HOTEL_RESULTS_CACHE_KEY = 'tripai_hotel_results'

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Hotels() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [rating, setRating] = useState('4')
  const [selectedFilter, setSelectedFilter] = useState(0)

  const filters = ['Price Low to High', 'Price High to Low', 'Rating', 'Popular']
  const today = toLocalDateInputValue(new Date())
  const checkOutMin = checkIn && checkIn > today ? checkIn : today

  const searchMutation = useMutation({
    mutationFn: (params: { destination: string; check_in: string; check_out: string; guests: number; min_rating: number }) => hotelService.searchHotels(params),
  })

  const results = useMemo<StayResult[]>(() => {
    const data = searchMutation.data as HotelSearchResponse | undefined
    if (data?.hotels?.length) return data.hotels
    const useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true'
    return (useDemo && !destination) ? previewHotels : []
  }, [searchMutation.data, destination])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!destination || !checkIn || !checkOut) {
      // Basic client-side validation to avoid 422 from the API
      window.alert('Please enter destination, check-in and check-out dates before searching.')
      return
    }

    const data = await searchMutation.mutateAsync({
      destination,
      check_in: checkIn,
      check_out: checkOut,
      guests: Number(guests),
      min_rating: Number(rating),
    })

    if (data?.hotels?.length) {
      sessionStorage.setItem(HOTEL_RESULTS_CACHE_KEY, JSON.stringify(data.hotels))
    }
  }

  return (
    <div className="space-y-5">
      <AppPanel title="Hotels" subtitle="Search and compare curated stays." action={<Landmark className="h-5 w-5 text-[var(--accent)]" />}>
        <form onSubmit={handleSearch} className="space-y-3">
          <LocationAutocomplete label="Destination" value={destination} onChange={setDestination} placeholder="Mumbai" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Check in" value={checkIn} onChange={setCheckIn} placeholder="2026-06-01" type="date" icon={Landmark} min={today} />
            <Field label="Check out" value={checkOut} onChange={setCheckOut} placeholder="2026-06-04" type="date" icon={Landmark} min={checkOutMin} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Field label="Guests" value={guests} onChange={setGuests} placeholder="2" type="number" icon={Users} min="1" />
            <Field label="Min rating" value={rating} onChange={setRating} placeholder="4" type="number" icon={Landmark} min="1" max="5" step="0.1" />
            <div className="flex items-end md:items-stretch">
              <PrimaryButton loading={searchMutation.isPending} className="w-full px-4 md:w-auto" disabled={!destination || !checkIn || !checkOut}>Search</PrimaryButton>
            </div>
          </div>
        </form>
      </AppPanel>

      <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
        <SlidersHorizontal className="h-4 w-4 text-[var(--muted)]" />
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Filters</div>
      </div>
      <ChipRail items={filters} activeIndex={selectedFilter} onSelect={(_, index) => setSelectedFilter(index)} />

      <section className="space-y-3">
        <SectionHeader title="Live results" />
        {searchMutation.isPending ? (
          <SkeletonRail count={2} />
        ) : searchMutation.isError ? (
          <ErrorState
            title="Hotel search failed"
            description="The hotel endpoint returned an error or is waiting for authentication. Sign in and search again."
            actionLabel="Search again"
            onAction={() => searchMutation.reset()}
          />
        ) : results.length ? (
          <div className="space-y-4">
            {results.map((stay) => (
              <article key={stay.id} className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-white shadow-soft">
                <div className="relative">
                  <img src={stay.imageUrl} alt={stay.name} className="h-48 w-full object-cover" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {stay.rating?.toFixed(1) ?? '4.3'}
                  </div>
                  <button type="button" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90">
                    <Heart className="h-5 w-5 text-[var(--text)]" />
                  </button>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{stay.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-[var(--muted)]"><MapPin className="h-4 w-4" />{stay.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{stay.pricePerNight ?? 0}</div>
                      <div className="text-xs text-[var(--muted)]">Per night</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(stay.tags ?? []).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)]">{tag}</span>
                    ))}
                  </div>
                  <PrimaryButton className="w-full" onClick={() => navigate(`/hotels/${stay.id}`, { state: { hotel: stay } })}>View details</PrimaryButton>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Search to load hotel inventory"
            actionLabel="Show loading preview"
            onAction={() => searchMutation.reset()}
          />
        )}
      </section>
    </div>
  )
}
