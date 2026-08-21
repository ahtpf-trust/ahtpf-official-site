'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLoginAction } from '../../actions'
import { ShieldCheck, ShieldAlert, Lock, User } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await adminLoginAction(formData)

    if (result.success) {
      // Re-route to admin dashboard
      router.push('/admin')
      router.refresh() // Refresh layout to update nav bar / session cookies context
    } else {
      setError(result.error || 'Incorrect Admin credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gold-dark/10 overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-dark text-white py-6 px-6 font-heading text-center relative border-b-4 border-gold">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-gold mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal Login</h1>
          <p className="text-xs text-gold-light mt-1">
            Access strictly restricted to trust administrators.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3.5 flex gap-2.5 items-center">
              <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <p className="text-xs font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="h-4 w-4 text-gray-400" /> Username
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="e.g. admin"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-maroon focus:outline-none transition text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-gray-400" /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-maroon focus:outline-none transition text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon-dark text-gold font-bold py-3 px-6 rounded-lg border border-gold/45 hover:bg-maroon hover:text-white transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                <span>Authorized Login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
