'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/context'
import { submitContactInquiryAction } from '@/app/actions'
import { Phone, Mail, MapPin, Clock, Send, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function ContactPage() {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await submitContactInquiryAction(formData)
      if (res.success) {
        setSubmitted(true)
        e.currentTarget.reset()
        setTimeout(() => setSubmitted(false), 8000)
      } else {
        setError(res.error || 'Failed to send message.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-maroon-dark">
          {language === 'en' ? 'Contact Us' : 'தொடர்பு கொள்ள'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          {language === 'en' 
            ? 'Get in touch with the Trust office coordinators or submit an inquiry.' 
            : 'கூட்டமைப்பின் பொறுப்பாளர்களுடன் தொடர்பு கொள்ளவும் அல்லது உங்கள் தகவலை அனுப்பவும்.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Directories Card with hover raise animation */}
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-150 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform">
          <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-100 pb-2">
            {language === 'en' ? 'Office Directory' : 'தொடர்பு முகவரி'}
          </h2>

          <div className="space-y-4">
            
            {/* Phone */}
            <div className="flex gap-3 items-start">
              <Phone className="h-5 w-5 text-gold-dark mt-1 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-400 block tracking-wider">Phone / தொலைபேசி</span>
                <p className="text-sm font-semibold text-gray-900">+91 90030 45141</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-3 items-start">
              <Mail className="h-5 w-5 text-gold-dark mt-1 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-400 block tracking-wider">Email / மின்னஞ்சல்</span>
                <p className="text-sm font-semibold text-gray-900">namathuthirukovilseithigal@gmail.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-3 items-start">
              <MapPin className="h-5 w-5 text-gold-dark mt-1 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-400 block tracking-wider">Office Address / முகவரி</span>
                <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                  No:15, 2nd Street, Chandrasekar Nagar, Manali Salai, Kodungaiyur, Chennai - 600 118, Tamil Nadu, India.
                </p>
              </div>
            </div>

            {/* Office Hours */}
            <div className="flex gap-3 items-start">
              <Clock className="h-5 w-5 text-gold-dark mt-1 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-400 block tracking-wider">Working Hours / நேரங்கள்</span>
                <p className="text-xs text-gray-700 font-semibold">
                  Monday - Saturday: 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form Card with hover raise animation */}
        <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform">
          <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-100 pb-2 mb-4">
            {language === 'en' ? 'Send a Message' : 'செய்தி அனுப்புங்கள்'}
          </h2>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center space-y-2">
              <ShieldCheck className="h-10 w-10 mx-auto text-emerald-600" />
              <h3 className="font-bold text-sm">Message Sent Successfully!</h3>
              <p className="text-xs text-emerald-700/80">We will respond to your query within 24 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name / பெயர் *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg text-xs focus:border-maroon focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email / மின்னஞ்சல் *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg text-xs focus:border-maroon focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone / தொலைபேசி (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg text-xs focus:border-maroon focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message / கருத்து *
                </label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  placeholder="Type message here..."
                  className="w-full px-3 py-2 border-2 border-gray-200 bg-white rounded-lg text-xs focus:border-maroon focus:outline-none transition font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-maroon text-white font-bold py-2.5 rounded-lg hover:bg-maroon-dark transition text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
