import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
