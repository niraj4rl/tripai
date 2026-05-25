import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MapPinned, Search } from 'lucide-react'
import { placeService } from '../services/placeService'
import { AppPanel, ChipRail, EmptyState, ErrorState, PlaceCard, PrimaryButton, SectionHeader, SkeletonRail, SelectField } from '../components/TripUI'
import OSMMap from '../components/OSMMap'
import type { PlaceResult, PlaceSearchResponse } from '../types/tripai'

export default function Places() {
  const [query, setQuery] = useState('Beaches')
  const [location, setLocation] = useState('Pune')
  const [customLocation, setCustomLocation] = useState('')
  const [radius, setRadius] = useState('5000')
  const [activeCategory, setActiveCategory] = useState(0)
  const [isMapView, setIsMapView] = useState(false)

  const categories = ['Beaches', 'Forts', 'Cafes', 'Nightlife', 'Nature', 'Heritage']

  const searchMutation = useMutation({
    mutationFn: (searchParams: { query: string; location: string; radius: number }) => 
      placeService.searchPlaces(searchParams),
  })

  // Trigger search on mount and whenever the selected category or location changes
  useEffect(() => {
    const activeQuery = categories[activeCategory]
    // prefer customLocation when provided
    const loc = location === 'Other (type below)' && customLocation ? customLocation : location
    setQuery(activeQuery)
    searchMutation.mutate({ query: activeQuery, location: loc, radius: Number(radius) })
  }, [activeCategory, location, customLocation])

  const results = useMemo<PlaceResult[]>(() => {
    const data = searchMutation.data as PlaceSearchResponse | undefined
    return data?.places ?? []
  }, [searchMutation.data])

  return (
    <div className="space-y-5">
      <AppPanel title="Places" subtitle="Find beaches, forts, cafes and local experiences.">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-[var(--muted)]" />
            <input className="flex-1 bg-transparent text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places" />
            <button type="button" className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              Filters
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SelectField
                label="Location"
                value={location}
                onChange={(val) => setLocation(val)}
                options={["Pune", "Mumbai", "Goa", "Bengaluru", "Hyderabad", "Delhi", "Kolkata", "Chennai", 'Other (type below)']}
              />
              {location === 'Other (type below)' ? (
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Type a city or area"
                />
              ) : null}
            </div>
            <div className="flex gap-2">
              <input className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm" value={radius} onChange={(event) => setRadius(event.target.value)} placeholder="Radius" />
              <PrimaryButton className="px-4" onClick={() => {
                const loc = location === 'Other (type below)' && customLocation ? customLocation : location
                searchMutation.mutate({ query, location: loc, radius: Number(radius) })
              }}>
                Go
              </PrimaryButton>
            </div>
          </div>
        </div>
      </AppPanel>

      <ChipRail items={categories} activeIndex={activeCategory} onSelect={(_, index) => setActiveCategory(index)} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader title="Nearby places" subtitle="Switch between list and map preview." />
          <button
            type="button"
            onClick={() => setIsMapView((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold"
          >
            <MapPinned className="h-4 w-4" />
            {isMapView ? 'List' : 'Map'}
          </button>
        </div>

        {searchMutation.isPending ? (
          <SkeletonRail count={2} />
        ) : searchMutation.isError ? (
          <ErrorState title="Could not fetch places" description="Try a different query or location." actionLabel="Retry" onAction={() => {
            const loc = location === 'Other (type below)' && customLocation ? customLocation : location
            searchMutation.mutate({ query, location: loc, radius: Number(radius) })
          }} />
        ) : isMapView ? (
          <OSMMap
            title="Places map"
            query={results[0]?.name || location}
            lat={results[0]?.lat}
            lon={results[0]?.lng}
          />
        ) : results.length ? (
          <div className="space-y-4">
            {results.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState title="No places found" description="Try another category or location." />
        )}
      </section>
    </div>
  )
}
