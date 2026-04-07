'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { siteConfig } from '@/site.config'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      if (res.ok) {
        window.location.href = '/'
      } else {
        setError('Wrong password')
        setLoading(false)
      }
    } catch {
      setError('Network error, try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#0a66c2] rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 16 16" className="w-7 h-7" aria-hidden="true">
              <path d="M4 5.5a1 1 0 100-2 1 1 0 000 2zM3.25 6.5h1.5V12h-1.5V6.5zM6.5 6.5h1.44v.75h.02c.2-.38.7-.77 1.44-.77 1.54 0 1.82.96 1.82 2.2V12H9.74V9c0-.57-.01-1.3-.84-1.3-.85 0-.97.63-.97 1.26V12H6.5V6.5z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1d2226]">{siteConfig.loginTitle}</h1>
          <p className="text-sm text-[rgba(0,0,0,0.6)] mt-1">Enter your name and password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.2)] rounded text-sm focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.2)] rounded text-sm focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] mt-3"
          />

          {error && (
            <p className="text-red-600 text-xs mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !password}
            className="w-full mt-4 py-2 bg-[#0a66c2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
