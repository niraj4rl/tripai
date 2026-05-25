import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { PlaneTakeoff, CalendarDays, ExternalLink, Users } from 'lucide-react'
import { flightService } from '../services/flightService'
import { AppPanel, EmptyState, ErrorState, Field, PrimaryButton, SectionHeader, SkeletonRail, ResultItem } from '../components/TripUI'
import type { FlightResult, FlightSearchResponse } from '../types/tripai'

export default function Flights() {
  const [origin, setOrigin] = useState('BOM')
  const [destination, setDestination] = useState('DEL')
  const [travellers, setTravellers] = useState('1')

  // Dynamically calculate realistic future dates on load (10 and 14 days out)
  const defaultDates = useMemo(() => {
    const today = new Date()
    const dep = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
    const ret = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    return {
      dep: dep.toISOString().split('T')[0],
      ret: ret.toISOString().split('T')[0]
    }
  }, [])

  const [departureDate, setDepartureDate] = useState(defaultDates.dep)
  const [returnDate, setReturnDate] = useState(defaultDates.ret)

  const searchMutation = useMutation({
    mutationFn: (params: { origin: string; destination: string; departure_date: string; return_date?: string; travellers: number }) => flightService.searchFlights(params),
  })

  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), [])

  // Trigger initial search automatically on mount
  useEffect(() => {
    searchMutation.mutate({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || undefined,
      travellers: Number(travellers),
    })
  }, [])

  const flights = useMemo<FlightResult[]>(() => {
    const data = searchMutation.data as FlightSearchResponse | undefined
    return data?.flights ?? []
  }, [searchMutation.data])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await searchMutation.mutateAsync({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || undefined,
      travellers: Number(travellers),
    })
  }

  return (
    <div className="space-y-6">
      <AppPanel title="Flights" subtitle="A compact flight search experience with a live results surface." action={<PlaneTakeoff className="h-5 w-5 text-[var(--accent)]" />}>
        <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_1fr_0.9fr_0.9fr_0.6fr_auto]">
          <Field label="From" value={origin} onChange={setOrigin} placeholder="BOM" icon={PlaneTakeoff} />
          <Field label="Destination" value={destination} onChange={setDestination} placeholder="DEL" icon={PlaneTakeoff} />
          <Field label="Departure" value={departureDate} onChange={setDepartureDate} placeholder="2026-06-01" type="date" icon={CalendarDays} min={today} />
          <Field label="Return" value={returnDate} onChange={setReturnDate} placeholder="2026-06-05" type="date" icon={CalendarDays} min={departureDate || today} />
          <Field label="Travellers" value={travellers} onChange={setTravellers} placeholder="1" type="number" icon={Users} min="1" />
          <div className="flex items-end">
            <PrimaryButton loading={searchMutation.isPending} className="w-full">
              Search flights
            </PrimaryButton>
          </div>
        </form>
      </AppPanel>

      <section className="space-y-3">
        <SectionHeader title="Search results" subtitle="Replace the placeholder cards with live inventory from the backend." />
        {searchMutation.isPending ? (
          <SkeletonRail count={2} />
        ) : searchMutation.isError ? (
          <ErrorState
            title="Flight search failed"
            description="The flight endpoint returned an error or is waiting for authentication. Sign in and search again."
            actionLabel="Search again"
            onAction={() => searchMutation.reset()}
          />
        ) : flights.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {flights.map((flight) => (
              <div key={flight.id} className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{flight.airline}</div>
                    <div className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">
                      {flight.origin} to {flight.destination}
                    </div>
                  </div>
                  <div className="rounded-2xl px-3 py-2 text-right">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Flight</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--text)]">{flight.airline || 'Airline info'}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ResultItem title={`Depart: ${flight.departure_time ?? 'TBD'}`} subtitle={flight.duration ? `Duration: ${flight.duration}` : undefined} />
                  <ResultItem title={`Arrive: ${flight.arrival_time ?? 'TBD'}`} subtitle={typeof flight.stops === 'number' ? `${flight.stops} stops` : undefined} />
                </div>
                <ExternalPriceButton externalUrl={flight.external_url} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Search to load flight inventory"
            description="Enter origin, destination and travel dates to reveal live flight results."
            actionLabel="Fill search"
            onAction={() => setOrigin('')}
          />
        )}
      </section>
    </div>
  )
}

function ExternalPriceButton({ externalUrl }: { externalUrl?: string | null }) {
  const [loading, setLoading] = useState(false)
  const [priceInfo, setPriceInfo] = useState<{ price: string | number | null; currency?: string | null; raw?: string | null } | null>(null)

  // Simplified: remove external price fetching — only provide a link to the airline/agent page

  const open = () => {
    if (!externalUrl) return
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  if (!externalUrl) return null

  return (
    <div>
      <button className="mt-4 w-full rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold" onClick={open} disabled={loading}>
        {loading ? 'Checking external price…' : 'View on airline site'}
        <ExternalLink className="h-4 w-4 inline-block ml-2" />
      </button>
      {/* No price shown per user request */}
    </div>
  )
}
