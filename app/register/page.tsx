'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitRegistration } from '../actions'
import { ShieldCheck, ShieldAlert, Camera, Trash2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Webcam states
  const [useWebcam, setUseWebcam] = useState(false)
  const [webcamPhoto, setWebcamPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start webcam stream
  const startWebcam = async () => {
    setError(null)
    setUseWebcam(true)
    setWebcamPhoto(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      setUseWebcam(false)
      setError('Webcam access was denied or is unavailable. Please upload a local file.')
    }
  }

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setUseWebcam(false)
  }

  // Capture frame from video feed
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const photoData = canvas.toDataURL('image/jpeg')
        setWebcamPhoto(photoData)
        stopWebcam()
      }
    }
  }

  // Convert Data URL photo to standard File object
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',')
    const mimeMatch = arr[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      // Handle webcam photo if captured
      if (webcamPhoto) {
        const photoFile = dataURLtoFile(webcamPhoto, 'webcam_photo.jpg')
        formData.set('photo', photoFile)
      } else {
        const photoInput = form.elements.namedItem('photo') as HTMLInputElement
        if (!photoInput || !photoInput.files || photoInput.files.length === 0) {
          throw new Error('Please select or capture a profile photo.')
        }
      }

      const result = await submitRegistration(formData)

      if (result.success) {
        setSuccess(true)
        setToastMessage('Registration submitted successfully! / பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!')
        form.reset()
        setWebcamPhoto(null)
        setTimeout(() => setToastMessage(null), 5000)
      } else {
        setError(result.error || 'Registration failed.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-maroon-dark">
          Volunteer Registration Portal
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Become a member of All Hindu Temples Protection Federation. Submit details and photos to request an ID card.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex gap-3 items-center">
          <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      {/* Main Registration Card Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-150 overflow-hidden">
        <div className="bg-maroon text-gold font-heading font-semibold text-sm py-4 px-6 border-b border-gold-dark flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" /> Personal Information & Verification Details
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 bg-white">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Full Name * <span className="text-[9px] text-gray-400 font-normal normal-case">(As shown in ID proof)</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Senthil Kumar S"
              className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-lg focus:border-maroon focus:outline-none transition text-sm text-neutral-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Mobile Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. 9876543210"
                pattern="[0-9]{10,15}"
                className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-lg focus:border-maroon focus:outline-none transition text-sm text-neutral-800"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-lg focus:border-maroon focus:outline-none transition text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Profile Photo - Webcam & File Selector dual system */}
          <div className="p-4 border border-gold-dark/10 bg-white rounded-lg space-y-4 shadow-inner">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Profile Photo * <span className="text-[10px] text-emerald-600 font-normal lowercase">(Will appear on membership card)</span>
            </label>

            {/* Webcam Live Capture Viewport */}
            {useWebcam && (
              <div className="flex flex-col items-center gap-3 bg-slate-100 p-4 rounded-lg relative">
                <video ref={videoRef} autoPlay playsInline className="w-[280px] h-[210px] object-cover rounded border border-gray-300" />
                <div className="flex gap-2">
                  <button type="button" onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-4 rounded cursor-pointer">
                    Capture Photo
                  </button>
                  <button type="button" onClick={stopWebcam} className="text-xs border border-gray-400 text-gray-600 hover:text-gray-900 py-1.5 px-4 rounded cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Render captured webcam preview */}
            {webcamPhoto && (
              <div className="flex items-center gap-4 bg-emerald-50/25 p-3 rounded-lg border border-emerald-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={webcamPhoto} alt="Webcam capture" className="w-16 h-20 object-cover rounded border border-emerald-600 shadow" />
                <div className="space-y-1">
                  <span className="text-xs text-emerald-800 font-bold block">Photo Captured from Webcam</span>
                  <button type="button" onClick={() => setWebcamPhoto(null)} className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                    <Trash2 className="h-3.5 w-3.5" /> Remove & Retake
                  </button>
                </div>
              </div>
            )}

            {/* Display static file input if webcam not active / photo not captured */}
            {!useWebcam && !webcamPhoto && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-xs file:font-semibold
                    file:bg-maroon-light file:text-white
                    hover:file:bg-maroon transition cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-bold">or</span>
                <button
                  type="button"
                  onClick={startWebcam}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#f0ece2] text-[#4d0708] py-2 px-4 rounded hover:bg-gold hover:text-maroon-dark transition cursor-pointer border border-gold-dark/15 shadow-sm"
                >
                  <Camera className="h-4 w-4" /> Use Webcam Capture
                </button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* ID Proof (Private Bucket) */}
          <div className="p-4 border border-gold-dark/10 bg-white rounded-lg space-y-2 shadow-inner">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Identity Proof Document * <span className="text-[9px] text-rose-600 font-normal lowercase">(Aadhaar / Voter ID / PAN)</span>
            </label>
            <p className="text-[10px] text-gray-400">This document is stored securely in private storage and is only visible to the reviewing administrator.</p>
            <input
              type="file"
              name="idProof"
              required
              accept="image/*,.pdf"
              className="block w-full text-xs text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-xs file:font-semibold
                file:bg-maroon-light file:text-white
                hover:file:bg-maroon transition cursor-pointer"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white font-bold py-3.5 px-6 rounded-lg hover:bg-maroon-dark transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Registration...</span>
              </>
            ) : (
              <span>Submit Volunteer Registration</span>
            )}
          </button>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-5 flex gap-3.5 items-center" role="status">
              <ShieldCheck className="h-8 w-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Registration Submitted Successfully! / பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!</h3>
                <p className="text-xs text-emerald-700/80 mt-1">
                  Your details have been saved. An administrator will review your documents and generate your membership card soon.
                  <br />
                  உங்கள் விவரங்கள் சேமிக்கப்பட்டுள்ளன. நிர்வாகி உங்கள் ஆவணங்களைச் சரிபார்த்து விரைவில் உறுப்பினர் அட்டையை உருவாக்குவார்.
                </p>
              </div>
            </div>
          )}

        </form>
      </div>

      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-xl"
          role="alert"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}

    </div>
  )
}
