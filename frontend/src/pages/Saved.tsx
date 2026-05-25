import { Bookmark, PlaneTakeoff } from 'lucide-react'
import { AppPanel, EmptyState, SectionHeader, SurfaceCard, PrimaryButton } from '../components/TripUI'
import { useQuery } from '@tanstack/react-query'
import { tripService } from '../services/tripService'
import { useNavigate } from 'react-router-dom'

function computeActual(t: any) {
  if (!t) return null
  if (t.total_estimated_cost) return Number(t.total_estimated_cost)
  if (t.itinerary_data && Array.isArray(t.itinerary_data.days)) {
    const sum = t.itinerary_data.days.reduce((acc: number, d: any) => acc + (Number(d.estimated_cost ?? 0) || 0), 0)
    if (sum > 0) return sum
  }
  return null
}

function TripCard({ trip }: { trip: any }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{trip.title}</div>
          <div className="text-xs text-[var(--muted)]">{trip.source_city} → {trip.destination}</div>
        </div>
        <div className="text-sm font-semibold">₹{(computeActual(trip) && computeActual(trip) > Number(trip.budget_total || 0)) ? computeActual(trip) : trip.budget_total}</div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <PrimaryButton onClick={() => navigate(`/saved/${trip.id}`)}>Open</PrimaryButton>
      </div>
    </div>
  )
}

export default function Saved() {
  return (
    <div className="space-y-6">
      <AppPanel title="Saved" subtitle="Saved itineraries, hotels, and places in one mobile collection." action={<Bookmark className="h-5 w-5 text-[var(--accent)]" />}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">Saved itineraries</div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">Saved hotels</div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">Saved places</div>
        </div>
      </AppPanel>

      <section className="space-y-4">
        <SectionHeader title="Saved trips" subtitle="Your saved trip drafts and itineraries." />
        <SurfaceCard className="p-4">
          <SavedTrips />
        </SurfaceCard>
      </section>
    </div>
  )
}

function SavedTrips() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['trips'], queryFn: () => tripService.listTrips() })

  if (isLoading) return <div className="text-sm text-[var(--muted)]">Loading saved trips…</div>
  if (isError) return <EmptyState title="Could not load trips" description="Please sign in and try again." icon={PlaneTakeoff} />

  const trips = (Array.isArray(data) ? data : (data?.trips ?? [])) as any[]

  

  if (!trips.length) return <EmptyState title="No saved trips" description="Save a trip from the Planner to see it here." icon={PlaneTakeoff} />

  return (
    <div className="space-y-3">
      {trips.map((t) => (
        <TripCard key={t.id} trip={t} />
      ))}
    </div>
  )
}
