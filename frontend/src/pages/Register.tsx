import { useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail, Lock, UserPlus } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { AppPanel, Field, PrimaryButton, SecondaryButton } from '../components/TripUI'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.register({ full_name: fullName, email, password })
      setAuth({ id: email, email, full_name: fullName }, response.data.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center py-8">
      <div className="w-full">
        <AppPanel title="Create your account" subtitle="Save searches, compare stays and build trips without visual clutter." action={<UserPlus className="h-5 w-5 text-[var(--accent)]" />}>
          {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Your full name" icon={UserPlus} />
            <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Minimum 8 characters" type="password" icon={Lock} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton loading={loading} type="submit" className="sm:flex-1">
                Create account
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => navigate('/login')} className="sm:flex-1">
                Sign in
              </SecondaryButton>
            </div>
          </form>
        </AppPanel>
      </div>
    </div>
  )
}
