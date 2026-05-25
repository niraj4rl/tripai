import { Bell, Globe2, Heart, Lock, LogOut, Settings, User, Users } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { AppPanel, MetricCard, PrimaryButton, SurfaceCard, Field, formatMoney } from '../components/TripUI'
import { useEffect, useMemo, useState } from 'react'
import { tripService } from '../services/tripService'

export default function Profile() {
  const { user, logout, setAuth } = useAuthStore()
  const [name, setName] = useState(user?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currency, setCurrency] = useState(() => localStorage.getItem('pref_currency') ?? 'INR')
  const [language, setLanguage] = useState(() => localStorage.getItem('pref_language') ?? 'en')
  const [trips, setTrips] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    tripService.listTrips().then((res: any) => {
      if (!mounted) return
      if (Array.isArray(res)) setTrips(res as any[])
      else if (res && Array.isArray((res as any).trips)) setTrips((res as any).trips)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const saveProfile = () => {
    // update local store only (no server endpoint in demo)
    const token = localStorage.getItem('auth_token') ?? ''
    setAuth({ id: user?.id ?? 'local', email, full_name: name }, token)
    localStorage.setItem('pref_currency', currency)
    localStorage.setItem('pref_language', language)
  }

  const recentTrips = useMemo(() => trips.slice(0, 3), [trips])

  return (
    <div className="space-y-5">
      <AppPanel title="Profile" subtitle="Account details, preferences and app settings in one calm surface.">
        <div className="mb-4 flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--text)] text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-semibold">{name || 'Traveler'}</div>
            <div className="text-sm text-[var(--muted)]">{email || 'No account linked'}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Name" value={name || '—'} detail="Editable" />
          <MetricCard label="Email" value={email || '—'} detail="Editable" />
          <MetricCard label="Currency" value={currency} detail="Displayed in the app" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />
          <Field label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" />
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-sm">
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <PrimaryButton onClick={saveProfile}>Save profile</PrimaryButton>
          <PrimaryButton onClick={logout} className="bg-rose-600">Logout</PrimaryButton>
        </div>
      </AppPanel>

      <SurfaceCard className="p-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Travel preferences</h2>
        <div className="mt-3">
          <p className="text-sm text-[var(--muted)]">Set your preferred currency and language to personalise recommendations.</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <div className="text-xs text-[var(--muted)]">Language</div>
            <div className="mt-1 font-semibold">{language}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <div className="text-xs text-[var(--muted)]">Default currency</div>
            <div className="mt-1 font-semibold">{currency}</div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Recent trips</h2>
        <div className="mt-3 space-y-2">
          {recentTrips.length ? (
            recentTrips.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div>
                  <div className="font-semibold">{t.title ?? (t.destination ?? 'Untitled trip')}</div>
                  <div className="text-sm text-[var(--muted)]">{t.start_date ? `${t.start_date} → ${t.end_date ?? ''}` : 'Dates not set'}</div>
                </div>
                <div className="text-sm font-semibold">{t.total_estimated_cost ? formatMoney(t.total_estimated_cost, currency) : (t.budget_total ? formatMoney(t.budget_total, currency) : '—')}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--muted)]">No recent trips found. Create a trip from the Planner.</div>
          )}
        </div>
      </SurfaceCard>
    </div>
  )
}
