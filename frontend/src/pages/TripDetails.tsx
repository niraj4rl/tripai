import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Heart, Pencil, Share2, Star } from 'lucide-react'
import { tripService } from '../services/tripService'
import { previewFlights, previewHotels, previewPlaces } from '../data/demoPreviewData'
import { AppPanel, EmptyState, ErrorState, InfoPill, LoadingText, PrimaryButton, SectionHeader, SurfaceCard, getTripImage } from '../components/TripUI'

export default function TripDetails() {
  const { tripId = '' } = useParams()
  const navigate = useNavigate()
  const tripQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => tripService.getTripById(tripId),
    enabled: Boolean(tripId),
  })

  const trip = (tripQuery.data as any)?.trip ?? tripQuery.data ?? null

  return (
    <div className="space-y-4">
      {tripQuery.isLoading ? (
        <SurfaceCard className="p-5 sm:p-6">
          <LoadingText lines={6} />
        </SurfaceCard>
      ) : tripQuery.isError ? (
        <ErrorState
          title="Trip details unavailable"
          description="The trip endpoint returned an error or you are not signed in. Try again after authenticating."
          actionLabel="Retry"
          onAction={() => tripQuery.refetch()}
        />
      ) : !trip ? (
        <EmptyState title="Trip not found" description="No saved itinerary exists for this trip id." />
      ) : (
        <>
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-white shadow-sm">
            <div className="aspect-[16/9] w-full relative overflow-hidden bg-[var(--surface)]">
              <img 
                src={getTripImage(trip.destination ?? '')} 
                alt={trip.destination ?? 'Trip'} 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="absolute left-4 top-4 flex gap-2">
              <button 
                type="button" 
                onClick={() => navigate('/trips')}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[var(--text)] backdrop-blur hover:bg-white active:scale-95 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[var(--text)] backdrop-blur hover:bg-white active:scale-95 transition">
                <Share2 className="h-5 w-5" />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[var(--text)] backdrop-blur hover:bg-white active:scale-95 transition">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-[var(--text)]/90 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              <Star className="h-4 w-4 fill-current text-amber-400" />
              Trip details
            </div>
          </div>

          <AppPanel title={trip.title ?? trip.destination ?? 'Trip details'} subtitle={trip.destination ? `${trip.source_city ?? 'Origin'} to ${trip.destination}` : 'Live itinerary data from the backend'}>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPill>{trip.status ?? 'planned'}</InfoPill>
              <InfoPill>{trip.start_date ?? 'Start date pending'}</InfoPill>
              <InfoPill>{trip.end_date ?? 'End date pending'}</InfoPill>
            </div>
          </AppPanel>

          <SurfaceCard className="p-5 sm:p-6">
            <SectionHeader title="Trip summary" subtitle="Total estimated cost, itinerary and recommendations." />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[var(--surface)] p-3">
                <div className="text-xs text-[var(--muted)]">Total estimated cost</div>
                <div className="mt-1 text-base font-semibold">₹{trip.total_estimated_cost ?? trip.budget_total ?? 'N/A'}</div>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] p-3">
                <div className="text-xs text-[var(--muted)]">Budget breakdown</div>
                <div className="mt-1 text-base font-semibold">Hotel 45% | Flight 30% | Places 25%</div>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p>{trip.ai_summary ?? 'This trip is connected to live backend data.'}</p>
              {trip.warnings && trip.warnings.length > 0 && (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <div className="font-semibold text-amber-900 mb-1">⚠️ Trip Planning Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {trip.warnings.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Live Day-wise Itinerary */}
            {trip.itinerary_data && (trip.itinerary_data as any).days && (trip.itinerary_data as any).days.length > 0 ? (
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold text-[var(--text)]">Day-wise itinerary</h3>
                {(trip.itinerary_data as any).days.map((d: any) => (
                  <div key={d.day} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs sm:text-sm">
                    <div className="font-semibold text-[var(--text)] mb-2">{d.title || `Day ${d.day}`}</div>
                    {d.morning && d.morning.length > 0 && (
                      <div className="mt-1 text-[var(--muted)]">🌅 <span className="font-medium text-[var(--text)]">Morning</span>: {d.morning.join(', ')}</div>
                    )}
                    {d.afternoon && d.afternoon.length > 0 && (
                      <div className="mt-1 text-[var(--muted)]">☀️ <span className="font-medium text-[var(--text)]">Afternoon</span>: {d.afternoon.join(', ')}</div>
                    )}
                    {d.evening && d.evening.length > 0 && (
                      <div className="mt-1 text-[var(--muted)]">🌇 <span className="font-medium text-[var(--text)]">Evening</span>: {d.evening.join(', ')}</div>
                    )}
                    {d.food_suggestions && d.food_suggestions.length > 0 && (
                      <div className="mt-2 text-xs text-emerald-600 font-medium">🍽️ Food: {d.food_suggestions.join(', ')}</div>
                    )}
                    {d.transport_notes && (
                      <div className="mt-2 text-xs text-[var(--muted)] italic">🚗 Transport: {d.transport_notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : import.meta.env.VITE_USE_DEMO_DATA === 'true' ? (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-[var(--text)]">Day-wise itinerary</h3>
                {['Day 1: Arrival and local walk', 'Day 2: Beach and cafes', 'Day 3: Nature and sunset spot'].map((item) => (
                  <div key={item} className="rounded-2xl border border-[var(--border)] p-3 text-sm text-[var(--muted)]">{item}</div>
                ))}
              </div>
            ) : null}

            {/* Live Bookings & Suggestions */}
            {trip.itinerary_data && ((trip.itinerary_data as any).recommended_hotels?.length > 0 || (trip.itinerary_data as any).recommended_flights?.length > 0 || (trip.itinerary_data as any).recommended_places?.length > 0) ? (
              <div className="mt-4 space-y-4">
                <h3 className="font-semibold text-[var(--text)]">Live Recommendations & Bookings</h3>
                
                {(trip.itinerary_data as any).recommended_flights && (trip.itinerary_data as any).recommended_flights.length > 0 && (
                  <div className="rounded-3xl border border-[var(--border)] p-4 text-xs sm:text-sm space-y-2 bg-white">
                    <div className="font-semibold text-[var(--text)]">✈️ Flight Options</div>
                    {(trip.itinerary_data as any).recommended_flights.map((f: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-[var(--muted)] bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)]">
                        <div>
                          <span className="font-semibold text-[var(--text)]">{f.airline}</span> - {f.departure_time} to {f.arrival_time} ({f.duration}, {f.stops} stops)
                        </div>
                        {f.price && f.price > 0 && (
                          <div className="font-semibold text-[var(--text)]">
                            {f.currency || 'INR'} {f.price}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(trip.itinerary_data as any).recommended_hotels && (trip.itinerary_data as any).recommended_hotels.length > 0 && (
                  <div className="rounded-3xl border border-[var(--border)] p-4 text-xs sm:text-sm space-y-2 bg-white">
                    <div className="font-semibold text-[var(--text)]">🏨 Hotel Recommendations</div>
                    {(trip.itinerary_data as any).recommended_hotels.map((h: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-[var(--muted)] bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)]">
                        <div>
                          <span className="font-semibold text-[var(--text)]">{h.name}</span> - {h.address} ({h.rating}⭐)
                        </div>
                        {h.price_per_night && h.price_per_night > 0 && (
                          <div className="font-semibold text-[var(--text)]">
                            {h.currency || 'INR'} {h.price_per_night}/night
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(trip.itinerary_data as any).recommended_places && (trip.itinerary_data as any).recommended_places.length > 0 && (
                  <div className="rounded-3xl border border-[var(--border)] p-4 text-xs sm:text-sm space-y-2 bg-white">
                    <div className="font-semibold text-[var(--text)]">📍 Nearby Spots & Attractions</div>
                    {(trip.itinerary_data as any).recommended_places.map((p: any, idx: number) => (
                      <div key={idx} className="text-xs text-[var(--muted)] bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)]">
                        <span className="font-semibold text-[var(--text)]">{p.name}</span> - {p.address} ({p.rating}⭐)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : import.meta.env.VITE_USE_DEMO_DATA === 'true' ? (
              <div className="mt-4 grid gap-3">
                <h3 className="font-semibold text-[var(--text)]">Suggestions</h3>
                <div className="rounded-2xl border border-[var(--border)] p-3 text-sm">Hotels: {previewHotels.map((hotel) => hotel.name).join(', ')}</div>
                <div className="rounded-2xl border border-[var(--border)] p-3 text-sm">Flights: {previewFlights.map((flight) => `${flight.airline} ${flight.origin}-${flight.destination}`).join(', ')}</div>
                <div className="rounded-2xl border border-[var(--border)] p-3 text-sm">Places: {previewPlaces.map((place) => place.name).join(', ')}</div>
              </div>
            ) : null}

            {/* External Links / Actions */}
            <div className="mt-6 grid gap-2">
              {trip.itinerary_data && (trip.itinerary_data as any).external_links && (trip.itinerary_data as any).external_links.length > 0 ? (
                (trip.itinerary_data as any).external_links.map((link: any, idx: number) => (
                  <PrimaryButton 
                    key={idx} 
                    className="w-full bg-[var(--accent)] text-white hover:bg-emerald-700" 
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    {link.title || 'Book Option'}
                  </PrimaryButton>
                ))
              ) : (
                <PrimaryButton className="w-full" onClick={() => window.open('https://example.com/trip-links', '_blank', 'noopener,noreferrer')}>
                  Open booking links
                </PrimaryButton>
              )}
              
              <PrimaryButton className="w-full bg-[var(--accent-alt)] hover:bg-blue-700">
                <Pencil className="h-4 w-4" />
                Edit trip
              </PrimaryButton>
            </div>
          </SurfaceCard>
        </>
      )}
    </div>
  )
}
