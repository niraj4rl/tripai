import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '../stores/authStore'
import {
  Bookmark,
  Compass,
  MessageCircle,
  Home,
  Landmark,
  PlaneTakeoff,
  Sparkles,
  User,
} from 'lucide-react'
import { BottomNavButton, InstallBanner, NavButton } from './TripUI'

interface LayoutProps {
  children: ReactNode
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const desktopNav = [
  { label: 'Landing', path: '/', icon: Compass },
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Hotels', path: '/hotels', icon: Landmark },
  { label: 'Flights', path: '/flights', icon: PlaneTakeoff },
  { label: 'AI Planner', path: '/ai', icon: Sparkles },
]

const mobileNav = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Hotels', path: '/hotels', icon: Landmark },
  { label: 'Flights', path: '/flights', icon: PlaneTakeoff },
  { label: 'Saved', path: '/saved', icon: Bookmark },
  { label: 'Profile', path: '/profile', icon: User },
]

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loadFromStorage, logout } = useAuthStore()
  const pathname = location.pathname
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    // Ensure auth store is hydrated from localStorage on app load
    loadFromStorage()

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [loadFromStorage])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  const isActive = (path: string) => pathname === path || (path === '/hotels' && pathname.startsWith('/hotels/'))

  return (
    <div className="min-h-screen bg-transparent px-0 py-0 md:px-6 md:py-6 text-[var(--text)]">
      <div className="phone-shell relative">
      {!isAuthRoute ? (
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--text)] text-white shadow-sm">
              <div className="text-lg font-bold">Tz</div>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-[var(--text)]">Tripperz</div>
              <div className="text-xs text-[var(--muted)]">Plan your entire journey</div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {desktopNav.map((item) => (
              <NavButton key={item.path} label={item.label} icon={item.icon} active={isActive(item.path)} onClick={() => navigate(item.path)} />
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {installPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--surface)]"
              >
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Install app
              </button>
            ) : null}
            {!isAuthenticated ? (
              <>
                <button type="button" onClick={() => navigate('/login')} className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]">
                  Login
                </button>
                <button type="button" onClick={() => navigate('/register')} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => navigate('/profile')} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--surface)]">
                  Profile
                </button>
                <button type="button" onClick={() => { logout(); navigate('/'); }} className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]">
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] bg-white text-[var(--text)] shadow-sm"
              aria-label={isAuthenticated ? 'Open profile' : 'Open login'}
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      ) : null}

      <main className="mx-auto w-full px-4 py-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <div className="min-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </main>

      {!isAuthRoute ? <button
        type="button"
        onClick={() => navigate('/ai')}
        className="fixed bottom-24 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent-alt)] text-white shadow-app transition hover:scale-105 lg:hidden"
        aria-label="Open AI planner"
      >
        <MessageCircle className="h-6 w-6" />
      </button> : null}

      {!isAuthRoute ? <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--border)] bg-white/95 px-3 pb-3 pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex items-center gap-1 rounded-[24px] border border-[var(--border)] bg-white px-2 py-2 shadow-sm">
          {mobileNav.map((item) => (
            <BottomNavButton key={item.path} label={item.label} icon={item.icon} active={isActive(item.path)} onClick={() => navigate(item.path)} />
          ))}
        </div>
      </nav> : null}

      {!isAuthRoute ? <InstallBanner visible={Boolean(installPrompt && showInstallBanner)} onInstall={handleInstall} onDismiss={() => setShowInstallBanner(false)} /> : null}
      </div>
    </div>
  )
}
