'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginMemberAction } from '../actions'
import { KeyRound, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react'

export default function MemberLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string
    const dob = formData.get('dob') as string

    const result = await loginMemberAction(phone, dob)

    if (result.success && result.memberId) {
      // Redirect to the dynamic member ID card page
      router.push(`/member/${result.memberId}`)
    } else {
      setError(result.error || 'Invalid credentials or registration not approved.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gold-dark/10 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-maroon text-white py-6 px-6 font-heading text-center relative">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-gold mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Member Portal Login</h1>
          <p className="text-xs text-white/70 mt-1">
            Access your virtual identity card and download it as PDF.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3.5 flex gap-2.5 items-center">
              <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <p className="text-xs font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Registered Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="e.g. 9876543210"
              pattern="[0-9]{10,15}"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-maroon focus:outline-none transition text-sm"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-maroon focus:outline-none transition text-sm text-gray-800"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white font-bold py-3 px-6 rounded-lg hover:bg-maroon-dark transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5" />
                <span>Access My ID Card</span>
              </>
            )}
          </button>

          <div className="text-center text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
            Note: You can only log in once your volunteer registration request has been **Approved** by the administrator.
          </div>
        </form>
      </div>
    </div>
  )
}
