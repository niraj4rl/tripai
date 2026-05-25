import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

type Suggestion = {
  place_id: string
  display_name: string
  lat: string
  lon: string
}

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function LocationAutocomplete({ label, value, onChange, placeholder = '' }: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    setLoading(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.map((d: any) => ({ place_id: String(d.place_id), display_name: d.display_name, lat: d.lat, lon: d.lon })) : [])
        setOpen(true)
      } catch (err) {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const handleSelect = (s: Suggestion) => {
    onChange(s.display_name)
    setQuery(s.display_name)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
        <span className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-sm transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-blue-100">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value) }}
            onFocus={() => { if (suggestions.length) setOpen(true) }}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-slate-400 focus:ring-0"
          />
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-[var(--muted)]" /> : null}
        </span>
      </label>

      {open && suggestions.length ? (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-[var(--border)] bg-white shadow-lg">
          <ul>
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--surface)]"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
