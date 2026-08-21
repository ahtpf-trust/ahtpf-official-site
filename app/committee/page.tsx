'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/context'
import { supabase } from '@/lib/supabase'
import { Grid, List } from 'lucide-react'

interface Trustee {
  id: string
  name: string
  nameTa: string
  role: string
  roleTa: string
  photo: string
  bio: string
  bioTa: string
}

export default function CommitteePage() {
  const { language } = useLanguage()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [trustees, setTrustees] = useState<Trustee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCommittee() {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('member_type', 'committee')
          .eq('status', 'Approved')
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const formatted: Trustee[] = data.map((m: any) => {
            let photoUrl = '/logo.jpeg'
            if (m.photo_path) {
              if (m.photo_path.startsWith('http') || m.photo_path.startsWith('/')) {
                photoUrl = m.photo_path
              } else {
                photoUrl = supabase.storage.from('member-photos').getPublicUrl(m.photo_path).data.publicUrl
              }
            }

            return {
              id: m.id,
              name: m.full_name,
              nameTa: m.full_name,
              role: m.role || 'Trustee',
              roleTa: m.role_ta || m.role || 'அறங்காவலர்',
              photo: photoUrl,
              bio: m.bio || 'Managing and coordinating temple protection initiatives across India.',
              bioTa: m.bio_ta || 'இந்தியா முழுவதும் திருக்கோயில் பாதுகாப்பு பணிகளை ஒருங்கிணைத்து வழிநடத்துகிறார்.',
            }
          })
          setTrustees(formatted)
        } else {
          setTrustees([])
        }
      } catch (err) {
        console.error('Error fetching committee members:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCommittee()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 py-12">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#8b0000]/20 border-t-[#d4af37] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpeg" alt="Loading..." className="w-8 h-8 rounded-full object-cover shadow-sm animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-bold text-maroon uppercase tracking-widest font-heading">
          {language === 'en' ? 'Loading Trustees...' : 'பொறுப்பாளர்கள் விபரம் ஏற்றப்படுகிறது...'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-gold/30 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-maroon-dark">
            {language === 'en' ? 'Board of Trustees' : 'அறங்காவலர் குழு விபரம்'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en' 
              ? 'The official board of trustees appointed under the declaration of the Trust Deed.' 
              : 'அறக்கட்டளை பத்திர விதிமுறைகளின் கீழ் நியமிக்கப்பட்ட அதிகாரப்பூர்வ அறங்காவலர் குழு பொறுப்பாளர்கள்.'}
          </p>
        </div>

        {/* Layout Toggle Buttons (Grid vs List) */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg shadow-sm flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-maroon text-gold shadow-inner' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-maroon text-gold shadow-inner' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Mode View with elegant compact cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-in fade-in duration-200">
          {trustees.map((member) => (
            <div 
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform flex flex-col group max-w-xs mx-auto w-full"
            >
              {/* Photo Area - Full top content part of card with portrait aspect ratio */}
              <div className="w-full aspect-[4/4.5] sm:aspect-[3/3.8] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />
              </div>

              {/* Bio & Details */}
              <div className="p-4 space-y-2 flex-grow flex flex-col justify-between bg-white border-t border-gray-100">
                <div className="space-y-1.5 text-center">
                  <h3 className="font-bold text-gray-900 text-sm font-heading leading-tight">
                    {language === 'en' ? member.name : member.nameTa}
                  </h3>
                  <span className="inline-block bg-[#f0ece2] text-[#4d0708] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    {language === 'en' ? member.role : member.roleTa}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed text-center pt-2 border-t border-gray-100 line-clamp-3">
                  {language === 'en' ? member.bio : member.bioTa}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode View (Row table layout) with hover highlight shadow */
        <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-md animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sand-dark text-maroon-dark font-heading font-bold border-b border-gold-dark/10">
                  <th className="p-4 w-12">No.</th>
                  <th className="p-4">Name / பெயர்</th>
                  <th className="p-4">Designation / பொறுப்பு</th>
                  <th className="p-4">Legal Biography / விவரக்குறிப்பு</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {trustees.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition duration-200">
                    <td className="p-4 font-mono font-bold">{idx + 1}</td>
                    <td className="p-4 font-bold text-gray-900 font-heading">
                      {language === 'en' ? member.name : member.nameTa}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-maroon">
                        {language === 'en' ? member.role : member.roleTa}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] leading-relaxed max-w-sm">
                      {language === 'en' ? member.bio : member.bioTa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
