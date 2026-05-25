import { useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail, Lock, Sparkles } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { AppPanel, Field, PrimaryButton, SecondaryButton } from '../components/TripUI'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      setAuth(
        { id: email, email, full_name: '' },
        response.data.access_token
      )
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center py-8">
      <div className="w-full">
        <AppPanel title="Sign in" subtitle="Access saved trips, hotel searches and your AI planning history." action={<Sparkles className="h-5 w-5 text-[var(--accent)]" />}>
          {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Your password" type="password" icon={Lock} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton loading={loading} type="submit" className="sm:flex-1">
                Login
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => navigate('/register')} className="sm:flex-1">
                Create account
              </SecondaryButton>
            </div>
          </form>
        </AppPanel>
      </div>
    </div>
  )
}
