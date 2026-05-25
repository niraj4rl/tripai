import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tripService } from '../services/tripService'
import { previewTrips } from '../data/demoPreviewData'
import { AppPanel, EmptyState, ErrorState, MetricCard, PrimaryButton, SectionHeader, SkeletonRail, TripCard } from '../components/TripUI'
import type { TripRecord } from '../types/tripai'
import { useMemo } from 'react'

export default function Trips() {
  const navigate = useNavigate()
  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: async () => tripService.listTrips(),
    staleTime: 30_000,
  })

  const trips = useMemo<TripRecord[]>(() => {
    const data = tripsQuery.data as any
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.trips)) return data.trips
    const useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true'
    return useDemo ? previewTrips : []
  }, [tripsQuery.data])

  return (
    <div className="space-y-6">
      <AppPanel
        title="Trips"
        subtitle="Explore your active journeys, saved plans, and past travels."
        action={<PrimaryButton onClick={() => navigate('/ai')}>Create trip</PrimaryButton>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Trips" value={String(trips.length)} detail="Created from AI plans" />
          <MetricCard label="Status" value={trips.length ? 'Active' : 'Ready'} detail="Connected to your account" />
          <MetricCard label="Access" value="PWA" detail="Installable on mobile" />
        </div>
      </AppPanel>

      <section className="space-y-3">
        <SectionHeader title="Your trips" />
        {tripsQuery.isLoading ? (
          <SkeletonRail count={2} />
        ) : tripsQuery.isError ? (
          <ErrorState
            title="Could not load trips"
            description="The trips endpoint is currently unavailable or requires login. Refresh after signing in."
            actionLabel="Retry"
            onAction={() => tripsQuery.refetch()}
          />
        ) : trips.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No trips yet"
            description="Create your first itinerary to populate this view with live travel plans."
            actionLabel="Plan a trip"
            onAction={() => navigate('/ai')}
          />
        )}
      </section>
    </div>
  )
}
