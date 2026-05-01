import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async type => {
    setError('')
    setMessage('')
    setLoading(true)

    const authAction =
      type === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error: authError } = await authAction

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (type === 'signup') {
      setMessage('Signup successful. Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 text-center">LeadSync</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Sign in to continue</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleAuth('signin')}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleAuth('signup')}
              disabled={loading}
              className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
