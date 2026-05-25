import { useEffect, useMemo, useState } from 'react'

type Marker = {
  latitude: number
  longitude: number
}

type Props = {
  title: string
  query?: string
  latitude?: number
  longitude?: number
  markers?: Marker[]
}

const mapId = import.meta.env.VITE_MAPTILER_MAP_ID || 'streets-v4'

function isUsableMapTilerKey(value: unknown) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (/^(your|replace|change|invalid|demo|test)/i.test(trimmed)) return false
  return trimmed.startsWith('pk.') && trimmed.length >= 20
}

export function MapTilerStaticMap({ title, query, latitude, longitude, markers = [] }: Props) {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY as string | undefined
  const hasKey = isUsableMapTilerKey(apiKey)
  const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(
    typeof latitude === 'number' && typeof longitude === 'number' ? { latitude, longitude } : null,
  )
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    typeof latitude === 'number' && typeof longitude === 'number' ? 'ready' : 'idle',
  )

  useEffect(() => {
    let cancelled = false

    const resolveCenter = async () => {
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        setCenter({ latitude, longitude })
        setStatus('ready')
        return
      }

      if (!hasKey || !query) {
        setStatus(hasKey ? 'error' : 'idle')
        return
      }

      setStatus('loading')
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&limit=1`,
        )
        if (!response.ok) {
          throw new Error('MapTiler geocoding failed')
        }

        const data = await response.json()
        const feature = data?.features?.[0]
        const coordinates = feature?.center
        if (!cancelled && Array.isArray(coordinates) && coordinates.length >= 2) {
          setCenter({ longitude: coordinates[0], latitude: coordinates[1] })
          setStatus('ready')
        } else if (!cancelled) {
          setStatus('error')
        }
      } catch {
        if (!cancelled) {
          setCenter(null)
          setStatus('error')
        }
      }
    }

    void resolveCenter()

    return () => {
      cancelled = true
    }
  }, [apiKey, hasKey, latitude, longitude, query])

  const src = useMemo(() => {
    if (!hasKey || !center) {
      return ''
    }

    const baseUrl = `https://api.maptiler.com/maps/${mapId}/static/${center.longitude},${center.latitude},12/1200x420.png`
    const params = new URLSearchParams()
    params.set('key', apiKey || '')
    params.set('attribution', 'bottomright')

    if (markers.length) {
      params.set(
        'markers',
        markers
          .slice(0, 6)
          .map((marker) => `${marker.longitude},${marker.latitude}`)
          .join('|'),
      )
    }

    return `${baseUrl}?${params.toString()}`
  }, [hasKey, apiKey, center, markers])

  if (!hasKey) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-soft">
        <div className="relative min-h-[240px] bg-[linear-gradient(135deg,rgba(15,23,42,0.06),rgba(16,185,129,0.08))] p-6">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative grid h-full min-h-[240px] place-items-center text-center">
            <div className="max-w-sm space-y-3 rounded-[24px] border border-white/70 bg-white/85 px-5 py-4 backdrop-blur">
              <div className="text-sm font-semibold text-[var(--text)]">Map preview</div>
              <div className="text-sm leading-6 text-[var(--muted)]">
                A visual preview will appear here when a map provider is configured.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'loading' || (!center && status !== 'error')) {
    return (
      <div className="grid min-h-[240px] place-items-center rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
        Loading {title} map...
      </div>
    )
  }

  if (status === 'error' || !center) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-soft">
        <div className="relative min-h-[240px] bg-[linear-gradient(135deg,rgba(15,23,42,0.06),rgba(16,185,129,0.08))] p-6">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative grid h-full min-h-[240px] place-items-center text-center">
            <div className="max-w-sm space-y-3 rounded-[24px] border border-white/70 bg-white/85 px-5 py-4 backdrop-blur">
              <div className="text-sm font-semibold text-[var(--text)]">Map preview</div>
              <div className="text-sm leading-6 text-[var(--muted)]">
                {title} is available, but a live map could not be loaded right now.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!src) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-soft">
        <div className="relative min-h-[240px] bg-[linear-gradient(135deg,rgba(15,23,42,0.06),rgba(16,185,129,0.08))] p-6">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative grid h-full min-h-[240px] place-items-center text-center">
            <div className="max-w-sm space-y-3 rounded-[24px] border border-white/70 bg-white/85 px-5 py-4 backdrop-blur">
              <div className="text-sm font-semibold text-[var(--text)]">Map preview</div>
              <div className="text-sm leading-6 text-[var(--muted)]">
                {title} map preview is loading.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-soft">
      <img src={src} alt={title} className="h-[320px] w-full object-cover" loading="lazy" />
      <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
        Powered by MapTiler
      </div>
    </div>
  )
}