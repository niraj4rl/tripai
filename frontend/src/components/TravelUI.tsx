import { ArrowRight, Bath, Car, ChevronRight, Heart, MapPin, Search, ShieldCheck, Snowflake, Star, UtensilsCrossed, Wifi, BedDouble } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatPrice, type DealCardData, type HotelCardData } from '../lib/travel-demo'

type SearchBarProps = {
  placeholder: string
  actionLabel?: string
}

export function SearchBar({ placeholder, actionLabel = 'Filter' }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-[28px] border border-neutral-200 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <Search className="h-5 w-5 shrink-0 text-neutral-400" />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:ring-0"
      />
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
      >
        <ShieldCheck className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
  )
}

type PillsProps = {
  items: string[]
  activeIndex?: number
}

export function Pills({ items, activeIndex = 0 }: PillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
            index === activeIndex
              ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)]'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

type SectionHeaderProps = {
  title: string
  subtitle?: string
  actionLabel?: string
}

export function SectionHeader({ title, subtitle, actionLabel }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 transition hover:text-neutral-950">
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

type FeaturePillProps = {
  children: ReactNode
}

export function FeaturePill({ children }: FeaturePillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
      {children}
    </span>
  )
}

type HotelCardProps = {
  hotel: HotelCardData
  compact?: boolean
}

export function HotelCard({ hotel, compact = false }: HotelCardProps) {
  return (
    <article className={`overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] ${compact ? '' : 'sm:flex'}`}>
      <div className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-[16/11] sm:w-[48%] sm:shrink-0 sm:aspect-auto'}`}>
        <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-neutral-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
          {hotel.rating}
        </div>
        <button
          type="button"
          aria-label={hotel.saved ? 'Saved hotel' : 'Save hotel'}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-neutral-950 shadow-lg backdrop-blur"
        >
          <Heart className={`h-5 w-5 ${hotel.saved ? 'fill-neutral-950' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{hotel.tag}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">{hotel.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-neutral-950">₹{formatPrice(hotel.pricePerNight)}</p>
            <p className="text-xs text-neutral-500">per night</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{hotel.address}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((item) => (
            <FeaturePill key={item}>{item}</FeaturePill>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-auto">
          {hotel.highlights.map((item) => (
            <div key={item} className="rounded-2xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm">
          <div className="text-neutral-500">
            <span className="font-semibold text-neutral-950">{hotel.reviews}</span> reviews
          </div>
          <button type="button" className="inline-flex items-center gap-2 font-semibold text-neutral-950 transition hover:translate-x-0.5">
            View stay
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

type DealCardProps = {
  deal: DealCardData
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[4/3]">
        <img src={deal.image} alt={deal.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-white/90 px-3 py-2 backdrop-blur">
          <span className="text-sm font-semibold text-neutral-950">{deal.cta}</span>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-neutral-950 text-white">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{deal.subtitle}</p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-neutral-950">{deal.title}</h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-neutral-950">₹{formatPrice(deal.price)}</p>
            <div className="text-xs text-neutral-500 line-through">₹{formatPrice(deal.originalPrice)}</div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{deal.discount}</span>
        </div>
      </div>
    </article>
  )
}

type StatCardProps = {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">{value}</div>
    </div>
  )
}

type AmenityBadgeProps = {
  label: string
  icon: 'wifi' | 'car' | 'snow' | 'food' | 'bed' | 'bath'
}

export function AmenityBadge({ label, icon }: AmenityBadgeProps) {
  const iconClass = 'h-4 w-4 text-neutral-700'

  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100">
        {icon === 'wifi' && <Wifi className={iconClass} />}
        {icon === 'car' && <Car className={iconClass} />}
        {icon === 'snow' && <Snowflake className={iconClass} />}
        {icon === 'food' && <UtensilsCrossed className={iconClass} />}
        {icon === 'bed' && <BedDouble className={iconClass} />}
        {icon === 'bath' && <Bath className={iconClass} />}
      </div>
      <div>
        <div className="text-sm font-semibold text-neutral-950">{label}</div>
        <div className="text-xs text-neutral-500">Included in the stay</div>
      </div>
    </div>
  )
}

type AppShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{title}</p>
        {subtitle ? <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">{subtitle}</h1> : null}
      </div>
      {children}
    </div>
  )
}