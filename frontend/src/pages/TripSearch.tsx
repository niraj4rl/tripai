import { HotelCard, Pills, SearchBar, SectionHeader } from '../components/TravelUI'
import { destinationFilters, featuredHotels, hotelFilters } from '../lib/travel-demo'

export default function TripSearch() {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-[32px] border border-white/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
        <SearchBar placeholder="Search Hotels" actionLabel="Filter" />
        <Pills items={destinationFilters} />
        <Pills items={hotelFilters} activeIndex={1} />
      </section>

      <section className="space-y-3">
        <SectionHeader title="Hotels" subtitle="A clean search list styled for mobile-first scanning." actionLabel="Map" />
        <div className="space-y-4">
          {featuredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>
    </div>
  )
}
