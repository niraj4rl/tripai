import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  full_name: string
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        })
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
  },
}))
