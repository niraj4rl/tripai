import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  title?: string
  query?: string
  lat?: number
  lon?: number
  zoom?: number
}

export default function OSMMap({ title = 'Map preview', query, lat, lon, zoom = 13 }: Props) {
  const [center, setCenter] = useState<[number, number] | null>(lat && lon ? [lat, lon] : null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (center) return
    if (!query) return

    const controller = new AbortController()

    const tryGeocode = async (qstring: string) => {
      const q = encodeURIComponent(qstring)
      const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=3&addressdetails=1`
      try {
        const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Tripperz/1.0 (contact@example.com)' } })
        if (!res.ok) return null
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return null
        // pick first item with valid lat/lon
        for (const item of data) {
          const latn = parseFloat(item.lat)
          const lonn = parseFloat(item.lon)
          if (!Number.isNaN(latn) && !Number.isNaN(lonn)) return [latn, lonn] as [number, number]
        }
        return null
      } catch {
        return null
      }
    }

    ;(async () => {
      try {
        // Try original query, then with country, then a relaxed query
        const candidates = [query]
        if (!/india/i.test(query)) candidates.push(`${query}, India`)

        let found: [number, number] | null = null
        for (const q of candidates) {
          // stop if already have center
          if (found) break
          const res = await tryGeocode(q)
          if (res) found = res
        }

        // As a last-ditch attempt, try replacing commas or adding nearby city tokens
        if (!found && query.includes(',')) {
          const short = query.split(',')[0]
          found = await tryGeocode(short)
        }

        if (found) setCenter(found)
      } catch {
        // ignore
      }
    })()

    return () => controller.abort()
  }, [query, center])

  if (!mounted) return <div className="h-64 w-full rounded-lg bg-[var(--surface)]" />

  if (!center) {
    return (
      <div className="h-64 w-full rounded-lg border border-dashed border-[var(--border)] bg-white p-4 text-center">
        <div className="text-sm text-[var(--muted)]">Map preview unavailable</div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={center} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#2563eb' }}>
          <Popup>{title}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
