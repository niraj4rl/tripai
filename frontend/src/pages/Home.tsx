import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { ChipRail, PrimaryButton, SectionHeader, SurfaceCard } from '../components/TripUI'
import { previewHotels, previewPlaces } from '../data/demoPreviewData'

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const categories = useMemo(() => ['Hotels', 'Flights', 'Places', 'Saved'], [])
  
  const trendingDestinations = useMemo(() => [
    {
      title: 'Goa Getaway',
      description: 'Sun, sand, and beautiful beaches.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      destination: 'Goa',
      from: 'Mumbai',
      budget: '15000'
    },
    {
      title: 'Manali Retreat',
      description: 'Serene valleys and snowy peaks.',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
      destination: 'Manali',
      from: 'Delhi',
      budget: '12000'
    },
    {
      title: 'Dubai Oasis',
      description: 'Futuristic skylines and desert thrills.',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      destination: 'Dubai',
      from: 'Mumbai',
      budget: '85000'
    }
  ], [])

  const handleTrendingClick = (dest: typeof trendingDestinations[0]) => {
    const today = new Date()
    const dep = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const ret = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    navigate(`/ai?destination=${dest.destination}&source_city=${dest.from}&budget=${dest.budget}&start_date=${dep}&end_date=${ret}`)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-soft">
        <div className="text-sm text-[var(--muted)]">Good morning</div>
        <h1 className="text-2xl font-semibold tracking-tight">Where do you want to go today?</h1>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destinations, hotels, flights"
            className="w-full bg-transparent text-sm"
          />
        </div>
      </section>
 
      <section className="rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-alt)]" />
          AI planner
        </div>
        <h2 className="mt-3 text-xl font-semibold">Build a full itinerary in seconds</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Tell TripAI your budget, destination, and dates.</p>
        <PrimaryButton className="mt-4 w-full" onClick={() => navigate('/ai')}>
          Ask AI
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </section>
 
      <ChipRail
        items={categories}
        onSelect={(item) => {
          navigate(`/${item.toLowerCase()}`)
        }}
      />
 
      <section className="space-y-3">
        <SectionHeader title="Trending destinations" />
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trendingDestinations.map((dest) => (
            <button
              key={dest.title}
              type="button"
              onClick={() => handleTrendingClick(dest)}
              className="min-w-[220px] text-left overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-sm transition hover:scale-[1.02] hover:shadow-soft"
            >
              <img src={dest.image} alt={dest.title} className="h-32 w-full object-cover" />
              <div className="p-3">
                <div className="text-sm font-semibold text-[var(--text)]">{dest.title}</div>
                <div className="text-xs text-[var(--muted)]">{dest.description}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
 
      {import.meta.env.VITE_USE_DEMO_DATA === 'true' && (
        <section className="space-y-3">
          <SectionHeader title="Recommended trips" />
          <div className="grid gap-3">
            {previewHotels.slice(0, 1).map((hotel) => (
              <SurfaceCard key={hotel.id} className="overflow-hidden">
                <img src={hotel.imageUrl} alt={hotel.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Stay pick</div>
                  <h3 className="mt-2 text-lg font-semibold">{hotel.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{hotel.location}</p>
                </div>
              </SurfaceCard>
            ))}
            {previewPlaces.slice(0, 1).map((place) => (
              <SurfaceCard key={place.id} className="overflow-hidden">
                <img src={place.photoUrl} alt={place.name} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Place pick</div>
                  <h3 className="mt-2 text-lg font-semibold">{place.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{place.address}</p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </section>
      )}

      {query ? (
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          Search preview for: <span className="font-semibold text-[var(--text)]">{query}</span>
        </section>
      ) : null}
    </div>
  )
}
