import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Compass,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import type { DestinationSpot, PlaceResult, StayResult, TripRecord } from '../types/tripai'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useNavigate } from 'react-router-dom'

export function cx(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

// Normalize incoming price values to avoid obviously inflated demo numbers.
// If a backend returns extremely large placeholder values, scale them
// down for display only so the UI looks realistic during development.
export function normalizePrice(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  if (value <= 0) return 0
  if (value > 100000) {
    return Math.round(value / 10)
  }
  return Math.round(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
}

type SurfaceCardProps = {
  children: ReactNode
  className?: string
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cx('rounded-[28px] border border-[var(--border)] bg-white shadow-sm', className)}
    >
      {children}
    </motion.section>
  )
}

type SectionHeaderProps = {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  icon?: LucideIcon
  min?: string
  max?: string
  step?: string
}

export function Field({ label, value, onChange, placeholder, type = 'text', icon: Icon = Search, min, max, step }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-sm transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-slate-400 focus:ring-0"
        />
      </span>
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  icon?: LucideIcon
}

export function SelectField({ label, value, onChange, options, icon: Icon = Compass }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-sm transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[var(--text)] focus:ring-0"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export function PrimaryButton({ children, className, loading, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:border-slate-300 hover:bg-[var(--surface)]',
        className,
      )}
    >
      {children}
    </button>
  )
}

type ChipRailProps = {
  items: string[]
  activeIndex?: number
  onSelect?: (item: string, index: number) => void
}

export function ChipRail({ items, activeIndex = 0, onSelect }: ChipRailProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item, index) => {
        const active = index === activeIndex
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect?.(item, index)}
            className={cx(
              'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition',
              active
                ? 'border-[var(--text)] bg-[var(--text)] text-white shadow-sm'
                : 'border-[var(--border)] bg-white text-slate-600 hover:border-slate-300 hover:text-[var(--text)]',
            )}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string
  detail?: string
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm flex flex-col justify-between">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)] truncate break-words max-w-full">{value}</div>
      {detail ? <div className="mt-2 text-sm text-[var(--muted)]">{detail}</div> : null}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cx('animate-pulse rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-sm', className)}>
      <div className="h-44 rounded-[22px] bg-slate-100" />
      <div className="mt-4 space-y-3">
        <div className="h-3 w-24 rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 rounded-full bg-slate-100" />
        <div className="h-4 w-1/2 rounded-full bg-slate-100" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 rounded-full bg-slate-100" />
          <div className="h-8 w-24 rounded-full bg-slate-100" />
          <div className="h-8 w-16 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonRail({ count = 3, horizontal = false }: { count?: number; horizontal?: boolean }) {
  return (
    <div className={cx(horizontal ? 'flex gap-4 overflow-x-auto pb-2' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3')}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} className={horizontal ? 'min-w-[280px] max-w-[320px]' : ''} />
      ))}
    </div>
  )
}

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon = Compass, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[var(--accent)] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      {actionLabel ? (
        <div className="mt-5">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      ) : null}
    </div>
  )
}

type ErrorStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function ErrorState({ title, description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-rose-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-rose-800/85">{description}</p>
          {actionLabel ? (
            <button type="button" onClick={onAction} className="mt-4 text-sm font-semibold text-rose-700 hover:text-rose-900">
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function InfoPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)] shadow-sm">{children}</span>
}

type DestinationCardProps = {
  destination?: DestinationSpot
  loading?: boolean
}

export function DestinationCard({ destination, loading }: DestinationCardProps) {
  if (loading || !destination) {
    return <SkeletonCard className="min-w-[280px] max-w-[320px]" />
  }

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.18 }} className="min-w-[280px] max-w-[320px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-[var(--surface)]">
        {destination.imageUrl ? <img src={destination.imageUrl} alt={destination.name} className="h-full w-full object-cover" loading="lazy" /> : null}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--text)] shadow-sm backdrop-blur">
          {destination.tripLength ?? 'Trip idea'}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{destination.location}</p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{destination.name}</h3>
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>{destination.rating ? `${destination.rating.toFixed(1)} rating` : 'Live ranking'}</span>
          <span>{destination.averagePrice ? formatMoney(destination.averagePrice) : 'Live price'}</span>
        </div>
      </div>
    </motion.article>
  )
}

type StayCardProps = {
  stay?: StayResult
  loading?: boolean
}

export function StayCard({ stay, loading }: StayCardProps) {
  if (loading || !stay) {
    return <SkeletonCard />
  }

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.18 }} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative aspect-[4/3] bg-[var(--surface)] lg:aspect-auto">
          {stay.imageUrl ? <img src={stay.imageUrl} alt={stay.name} className="h-full w-full object-cover" loading="lazy" /> : null}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--text)] shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {stay.rating ? stay.rating.toFixed(1) : 'New'}
          </div>
        </div>
        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{stay.location}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">{stay.name}</h3>
            </div>
            {stay.pricePerNight ? (
              <div className="text-right">
                <div className="text-lg font-semibold text-[var(--text)]">{formatMoney(stay.pricePerNight)}</div>
                <div className="text-xs text-[var(--muted)]">per night</div>
              </div>
            ) : null}
          </div>
          {stay.address ? (
            <div className="mt-3 flex items-start gap-2 text-sm text-[var(--muted)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{stay.address}</span>
            </div>
          ) : null}
          {stay.amenities?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {stay.amenities.slice(0, 4).map((amenity) => (
                <InfoPill key={amenity}>{amenity}</InfoPill>
              ))}
            </div>
          ) : null}
          {stay.tags?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stay.tags.slice(0, 4).map((tag) => (
                <div key={tag} className="rounded-2xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
            <div className="text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">{stay.reviews ?? '0'}</span> reviews
            </div>
            <button type="button" className="inline-flex items-center gap-2 font-semibold text-[var(--text)] transition hover:translate-x-0.5">
              View stay
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

type PlaceCardProps = {
  place?: PlaceResult
  loading?: boolean
}

export function PlaceCard({ place, loading }: PlaceCardProps) {
  if (loading || !place) {
    return <SkeletonCard />
  }

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.18 }} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-[var(--surface)]">
        {place.photoUrl ? <img src={place.photoUrl} alt={place.name} className="h-full w-full object-cover" loading="lazy" /> : null}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--text)] shadow-sm backdrop-blur">
          {place.category ?? 'Place'}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{place.address}</p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-[var(--text)]">{place.name}</h3>
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>{place.rating ? `${place.rating.toFixed(1)} rating` : 'Live result'}</span>
          <span>{place.distance ?? 'Nearby'}</span>
        </div>
      </div>
    </motion.article>
  )
}

export function getTripImage(destination: string): string {
  const dest = destination.toLowerCase().trim()
  if (dest.includes('goa')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('manali') || dest.includes('himachal') || dest.includes('shimla') || dest.includes('kashmir') || dest.includes('leh') || dest.includes('ladakh')) {
    return 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('dubai') || dest.includes('uae') || dest.includes('abu dhabi')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('mumbai') || dest.includes('bombay')) {
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('delhi') || dest.includes('agra') || dest.includes('taj') || dest.includes('jaipur') || dest.includes('rajasthan')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('pune') || dest.includes('lonavala') || dest.includes('pawna') || dest.includes('mahabaleshwar')) {
    return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('kerala') || dest.includes('munnar') || dest.includes('alleppey') || dest.includes('kochi')) {
    return 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('paris') || dest.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('london') || dest.includes('uk') || dest.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('new york') || dest.includes('ny') || dest.includes('usa') || dest.includes('america')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('tokyo') || dest.includes('japan')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('singapore')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('bali') || dest.includes('indonesia')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
  }
  if (dest.includes('swiss') || dest.includes('switzerland') || dest.includes('alps')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
}

type TripCardProps = {
  trip?: TripRecord
  loading?: boolean
}

export function TripCard({ trip, loading }: TripCardProps) {
  const navigate = useNavigate()

  if (loading || !trip) {
    return <SkeletonCard />
  }

  const imageUrl = getTripImage(trip.destination ?? '')

  return (
    <motion.article 
      whileHover={{ y: -3 }} 
      transition={{ duration: 0.18 }} 
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm flex flex-col cursor-pointer transition hover:shadow-soft"
    >
      <div className="h-36 w-full relative overflow-hidden bg-[var(--surface)]">
        <img 
          src={imageUrl} 
          alt={trip.destination ?? 'Trip'} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
        />
        <div className="absolute top-3 left-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {trip.status ?? 'planned'}
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[var(--text)]">
              {trip.title ?? trip.destination ?? 'Untitled trip'}
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {trip.source_city ? `${trip.source_city} to ` : ''}{trip.destination ?? 'Destination pending'}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--surface)] px-2.5 py-1 text-right shrink-0">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Budget</div>
            <div className="mt-0.5 text-xs font-semibold text-[var(--text)]">
              {trip.budget_total ? formatMoney(trip.budget_total, trip.currency ?? 'INR') : 'Live plan'}
            </div>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-1.5 text-xs text-[var(--muted)]">
          {trip.start_date ? <InfoPill>{trip.start_date}</InfoPill> : null}
          {trip.end_date ? <InfoPill>{trip.end_date}</InfoPill> : null}
          {typeof trip.travellers_count === 'number' ? (
            <InfoPill>{trip.travellers_count} traveller{trip.travellers_count > 1 ? 's' : ''}</InfoPill>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

export function AssistantPreview({ prompts, onPromptSelect }: { prompts: string[]; onPromptSelect?: (prompt: string) => void }) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">AI assistant</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)]">Ask Tripperz anything</h3>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[var(--accent)] shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="max-w-[92%] rounded-[22px] bg-white px-4 py-3 text-sm text-[var(--text)] shadow-sm">
          I can plan flights, stays, places and a full itinerary from one request.
        </div>
        <div className="ml-auto max-w-[92%] rounded-[22px] bg-[var(--accent)] px-4 py-3 text-sm text-white shadow-sm">
          Start with budget, dates, or destination and I’ll shape the trip.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptSelect?.(prompt)}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-slate-300 hover:bg-[var(--surface)]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

type InstallBannerProps = {
  visible: boolean
  onInstall: () => void
  onDismiss: () => void
}

export function InstallBanner({ visible, onInstall, onDismiss }: InstallBannerProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-[1180px] sm:bottom-6"
        >
          <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--border)] bg-white px-4 py-3 shadow-lg">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text)]">Install Tripperz</div>
                <div className="text-sm text-[var(--muted)]">Add the app to your home screen.</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SecondaryButton onClick={onDismiss} className="px-3 py-2 text-xs">
                Later
              </SecondaryButton>
              <PrimaryButton onClick={onInstall} className="px-3 py-2 text-xs">
                Install
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

type AppPanelProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function AppPanel({ title, subtitle, action, children }: AppPanelProps) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">TripAI</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </SurfaceCard>
  )
}

export function LoadingText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={cx('h-4 rounded-full bg-slate-100', index === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function ResultItem({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl bg-[var(--surface)] p-4">
      <div className="font-semibold text-[var(--text)]">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-[var(--muted)]">{subtitle}</div> : null}
    </div>
  )
}

export function NavButton({ label, icon: Icon, active, onClick }: { label: string; icon: LucideIcon; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
        active ? 'bg-[var(--text)] text-white shadow-sm' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

export function BottomNavButton({ label, icon: Icon, active, onClick }: { label: string; icon: LucideIcon; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('flex flex-1 flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[11px] font-medium transition', active ? 'text-[var(--text)]' : 'text-slate-400')}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}

export function PromptPill({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-slate-300 hover:bg-[var(--surface)]">
      {children}
    </button>
  )
}
