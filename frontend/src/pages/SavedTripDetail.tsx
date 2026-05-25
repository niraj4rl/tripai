import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tripService } from '../services/tripService'
import { SurfaceCard, SectionHeader } from '../components/TripUI'

export default function SavedTripDetail() {
  const { tripId } = useParams()
  const { data, isLoading, isError } = useQuery({ queryKey: ['trip', tripId], queryFn: () => tripService.getTripById(String(tripId)) })

  if (isLoading) return <div className="text-sm text-[var(--muted)]">Loading trip…</div>
  if (isError) return <div className="text-sm text-[var(--muted)]">Failed to load trip.</div>

  const trip = data

  // Compute displayed price: prefer total_estimated_cost, else sum itinerary day estimates, else budget_total
  const computeActual = (t: any) => {
    if (!t) return null
    if (t.total_estimated_cost) return Number(t.total_estimated_cost)
    if (t.itinerary_data && Array.isArray(t.itinerary_data.days)) {
      const sum = t.itinerary_data.days.reduce((acc: number, d: any) => acc + (Number(d.estimated_cost ?? 0) || 0), 0)
      if (sum > 0) return sum
    }
    return null
  }

  const actual = computeActual(trip)

  return (
    <div className="space-y-4">
      <SurfaceCard className="p-4">
        <SectionHeader title={trip.title ?? 'Saved trip'} subtitle={`${trip.source_city ?? ''} → ${trip.destination ?? ''}`} />
        <div className="mt-4 space-y-3">
          {trip.ai_summary ? <div className="text-sm text-[var(--muted)]">{trip.ai_summary}</div> : null}
          <div className="grid gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="text-sm font-semibold">Dates</div>
              <div className="text-xs text-[var(--muted)]">{trip.start_date} → {trip.end_date}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="text-sm font-semibold">Price</div>
              <div className="text-xs text-[var(--muted)]">
                {actual && Number(actual) > Number(trip.budget_total || 0) ? (
                  <>
                    Estimated: ₹{actual} (Budget: ₹{trip.budget_total})
                  </>
                ) : (
                  <>Budget: ₹{trip.budget_total ?? actual ?? '—'}</>
                )}
              </div>
            </div>
          </div>

          {trip.itinerary_data?.days ? (
            <div className="space-y-3">
              {trip.itinerary_data.days.map((day: any) => (
                <div key={day.day} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="text-sm font-semibold">Day {day.day} — {day.title}</div>
                  <div className="mt-2 text-xs text-[var(--muted)]">Morning: {day.morning?.join(', ')}</div>
                  <div className="text-xs text-[var(--muted)]">Afternoon: {day.afternoon?.join(', ')}</div>
                  <div className="text-xs text-[var(--muted)]">Evening: {day.evening?.join(', ')}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </SurfaceCard>
    </div>
  )
}
