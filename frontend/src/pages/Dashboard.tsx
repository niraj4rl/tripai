import { DealCard, SectionHeader, StatCard } from '../components/TravelUI'
import { dealCards, tripMetrics } from '../lib/travel-demo'

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-white/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Overview</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">Perfect for your plan</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          A focused dashboard with the deal cards and planning metrics users need to decide quickly.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {tripMetrics.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Deal cards" subtitle="The reference app language translated into a cleaner production layout." actionLabel="See all" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dealCards.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>
    </div>
  )
}
