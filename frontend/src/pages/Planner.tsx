import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Landmark, MapPin, PlaneTakeoff, Save, Sparkles, Users, Wallet } from 'lucide-react'
import { aiService } from '../services/aiService'
import { tripService } from '../services/tripService'
import { AppPanel, ChipRail, EmptyState, ErrorState, Field, LoadingText, PrimaryButton, ResultItem, SecondaryButton, SelectField, SectionHeader, SurfaceCard, formatMoney } from '../components/TripUI'
import LocationAutocomplete from '../components/LocationAutocomplete'
import type { TripPlanResponse } from '../types/tripai'

export default function Planner() {
  const today = useMemo(() => new Date().toLocaleDateString('en-CA'), [])
  const [searchParams] = useSearchParams()
  const [sourceCity, setSourceCity] = useState(searchParams.get('source_city') ?? searchParams.get('from') ?? '')
  const [destination, setDestination] = useState(searchParams.get('destination') ?? '')
  const [startDate, setStartDate] = useState(searchParams.get('start_date') ?? '')
  const [endDate, setEndDate] = useState(searchParams.get('end_date') ?? '')
  const [travellers, setTravellers] = useState(searchParams.get('travellers') ?? '2')
  const [budget, setBudget] = useState(searchParams.get('budget') ?? '')
  const [tripType, setTripType] = useState('leisure')
  const [hotelPreference, setHotelPreference] = useState('mid-range')
  const [transportPreference, setTransportPreference] = useState('flight')
  const [pace, setPace] = useState('balanced')
  const [travelStyle, setTravelStyle] = useState('comfort')
  const [interests, setInterests] = useState('beaches, cafes')

  const planMutation = useMutation({
    mutationFn: (payload: Parameters<typeof aiService.generateTripPlan>[0]) => aiService.generateTripPlan(payload),
  })

  const plan = planMutation.data as TripPlanResponse | undefined

  const prompts = ['₹15000 Goa', 'Family Dubai plan', 'Weekend lake escape']

  const handlePrompt = (prompt: string) => {
    setDestination(prompt.includes('Goa') ? 'Goa' : prompt.includes('Manali') ? 'Manali' : prompt.includes('Dubai') ? 'Dubai' : 'Lonavala')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      source_city: sourceCity,
      destination,
      start_date: startDate,
      end_date: endDate,
      travellers_count: Number(travellers),
      budget_total: Number(budget),
      currency: 'INR',
      trip_type: tripType,
      hotel_preference: hotelPreference,
      transport_preference: transportPreference,
      pace,
      interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
      hotel_rating_min: 3,
      safety_preference: 'safe',
      accessibility_needs: '',
      local_transport_preference: 'public',
    }

    await planMutation.mutateAsync(payload)
  }

  const dayCount = plan?.days?.length ?? 0

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => tripService.createTrip(payload),
  })
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <AppPanel
        title="AI Planner"
        subtitle="Turn a budget, date range and destination into a real backend trip plan."
        action={<Sparkles className="h-5 w-5 text-[var(--accent)]" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <LocationAutocomplete label="From" value={sourceCity} onChange={setSourceCity} placeholder="Mumbai" />
            <LocationAutocomplete label="Destination" value={destination} onChange={setDestination} placeholder="Goa" />
            <Field label="Budget" value={budget} onChange={setBudget} placeholder="15000" type="number" icon={Wallet} min="0" />
            <Field label="Start date" value={startDate} onChange={setStartDate} placeholder="2026-06-01" type="date" icon={CalendarDays} min={today} />
            <Field label="End date" value={endDate} onChange={setEndDate} placeholder="2026-06-04" type="date" icon={CalendarDays} min={startDate || today} />
            <Field label="Travellers" value={travellers} onChange={setTravellers} placeholder="2" type="number" icon={Users} min="1" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SelectField label="Trip type" value={tripType} onChange={setTripType} options={['leisure', 'family', 'romantic', 'business', 'adventure']} icon={Sparkles} />
            <SelectField label="Hotel preference" value={hotelPreference} onChange={setHotelPreference} options={['budget', 'mid-range', 'premium', 'luxury']} icon={Landmark} />
            <SelectField label="Transport preference" value={transportPreference} onChange={setTransportPreference} options={['flight', 'train', 'self-drive']} icon={PlaneTakeoff} />
            <SelectField label="Travel style" value={travelStyle} onChange={setTravelStyle} options={['comfort', 'luxury', 'backpacking', 'food-led']} icon={Sparkles} />
            <Field label="Interests" value={interests} onChange={setInterests} placeholder="beaches, nightlife, museums" icon={MapPin} />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_0.6fr_0.6fr_auto]">
            <SelectField label="Pace" value={pace} onChange={setPace} options={['relaxed', 'balanced', 'packed']} icon={Sparkles} />
            <SecondaryButton type="button" onClick={() => setBudget('')}>
              Clear budget
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => setDestination('')}>Reset destination</SecondaryButton>
            <PrimaryButton loading={planMutation.isPending} type="submit">
              Create trip
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-4">
          <ChipRail items={prompts} onSelect={handlePrompt} />
        </div>
      </AppPanel>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="p-5 sm:p-6">
          <SectionHeader title="Preview" />
          <div className="mt-4 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="max-w-[92%] rounded-[22px] bg-white px-4 py-3 text-sm text-[var(--text)] shadow-sm">
                {planMutation.isPending ? 'Planning your trip now…' : plan?.summary ?? 'Enter a destination and budget to generate a live itinerary.'}
              </div>
              {plan?.budget_status ? (
                <div className="ml-auto mt-3 max-w-[92%] rounded-[22px] bg-[var(--accent)] px-4 py-3 text-sm text-white shadow-sm">
                  {`Budget status: ${plan.budget_status}`}
                </div>
              ) : null}
            </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => handlePrompt(prompt)} className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-slate-300 hover:bg-[var(--surface)]">
                {prompt}
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <SectionHeader title="Trip result" subtitle="Cost breakdown, warnings, and day-by-day details from the backend." />
          {planMutation.isPending ? (
            <LoadingText lines={5} />
          ) : planMutation.isError ? (
            <ErrorState
              title="Trip planning failed"
              description={
                ((planMutation.error as any)?.response?.data?.detail) ||
                ((planMutation.error as any)?.message) ||
                "The AI trip endpoint returned an error or you are not authenticated. Sign in and try again."
              }
              actionLabel="Retry"
              onAction={() => planMutation.reset()}
            />
          ) : plan ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultItem title={plan.trip_title} subtitle={`Estimated total: ${formatMoney(plan.estimated_total_cost)}`} />
                <ResultItem title={`Budget status: ${plan.budget_status}`} subtitle={`Days planned: ${dayCount}`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultItem title={`Hotel range`} subtitle={plan.recommended_hotels?.length ? `${plan.recommended_hotels.length} recommendations` : 'No hotel suggestions yet'} />
                <ResultItem title={`Flight range`} subtitle={plan.recommended_flights?.length ? `${plan.recommended_flights.length} recommendations` : 'No flight suggestions yet'} />
              </div>
              {plan.warnings?.length ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="font-semibold">Warnings</div>
                  <ul className="mt-2 space-y-2">
                    {plan.warnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.recommended_hotels?.length ? (
                <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">Recommended hotels</div>
                    <div className="text-sm text-[var(--muted)]">Live options the planner selected for this trip.</div>
                  </div>
                  <div className="space-y-2">
                    {plan.recommended_hotels.slice(0, 3).map((hotel) => (
                      <div key={`${hotel.name}-${hotel.address}`} className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm">
                        <div className="font-semibold text-[var(--text)]">{hotel.name}</div>
                        <div className="mt-1 text-[var(--muted)]">{hotel.address}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                          <span>Rating: {hotel.rating}</span>
                          <span>Price: {formatMoney(hotel.price_per_night)}</span>
                          {hotel.external_url ? (
                            <a href={hotel.external_url} target="_blank" rel="noreferrer" className="font-semibold text-[var(--accent)]">
                              Book link
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {plan.recommended_places?.length ? (
                <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">Recommended places</div>
                    <div className="text-sm text-[var(--muted)]">Attractions the itinerary is built around.</div>
                  </div>
                  <div className="space-y-2">
                    {plan.recommended_places.slice(0, 5).map((place, index) => (
                      <div key={`${String(place.name ?? index)}-${index}`} className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--muted)]">
                        <div className="font-semibold text-[var(--text)]">{String(place.name ?? 'Place')}</div>
                        {place.address ? <div className="mt-1">{String(place.address)}</div> : null}
                        {place.map_url ? (
                          <a href={String(place.map_url)} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-[var(--accent)]">
                            Open map
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {plan.external_links?.length ? (
                <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="text-sm font-semibold text-[var(--text)]">External links</div>
                  <div className="space-y-2">
                    {plan.external_links.slice(0, 4).map((link, index) => (
                      <a
                        key={`${String(link.title ?? 'link')}-${index}`}
                        href={String(link.url ?? '#')}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-slate-300"
                      >
                        {String(link.title ?? 'Open link')}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {plan.days?.length ? (
                <div className="space-y-3">
                  {plan.days.map((day) => (
                    <div key={day.day} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Day {day.day}</div>
                          <div className="mt-1 text-base font-semibold text-[var(--text)]">{day.title}</div>
                        </div>
                        <div className="text-sm font-semibold text-[var(--text)]">{typeof day.estimated_cost === 'number' ? formatMoney(day.estimated_cost) : ''}</div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <ResultItem title="Morning" subtitle={day.morning?.join(' · ') || 'Pending'} />
                        <ResultItem title="Afternoon" subtitle={day.afternoon?.join(' · ') || 'Pending'} />
                        <ResultItem title="Evening" subtitle={day.evening?.join(' · ') || 'Pending'} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <PrimaryButton
                className="w-full"
                loading={saveMutation.status === 'pending'}
                onClick={async () => {
                  // Validate required fields per backend TripCreate schema
                  if (!sourceCity || !destination) {
                    alert('Please provide both source and destination before saving.')
                    return
                  }
                  if (!startDate || !endDate) {
                    alert('Please provide start and end dates before saving.')
                    return
                  }
                  const travellersNum = Number(travellers) || 1
                  const budgetNum = Number(budget) || Number(plan?.estimated_total_cost) || 0

                  const payload = {
                    source_city: sourceCity,
                    destination,
                    start_date: startDate,
                    end_date: endDate,
                    travellers_count: travellersNum,
                    budget_total: budgetNum,
                    currency: 'INR',
                    trip_type: tripType,
                    hotel_preference: hotelPreference,
                    transport_preference: transportPreference,
                    food_preference: undefined,
                    pace,
                    interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
                    hotel_rating_min: 3,
                    safety_preference: 'safe',
                    accessibility_needs: undefined,
                    local_transport_preference: 'public',
                    // include AI plan and computed estimated cost when present so backend can store them
                    total_estimated_cost: plan?.estimated_total_cost ?? undefined,
                    itinerary_data: plan ?? undefined,
                  }

                  try {
                    await saveMutation.mutateAsync(payload)
                    alert('Trip saved successfully')
                    navigate('/saved')
                  } catch (err: any) {
                    const detail = err?.response?.data || err?.message || 'unknown'
                    alert('Failed to save trip: ' + JSON.stringify(detail))
                  }
                }}
              >
                <Save className="h-4 w-4" />
                Save trip
              </PrimaryButton>
            </div>
          ) : (
            <EmptyState
              title="Create a plan to see results"
              description="The planner is empty until you create a trip."
            />
          )}
        </SurfaceCard>
      </section>
    </div>
  )
}
