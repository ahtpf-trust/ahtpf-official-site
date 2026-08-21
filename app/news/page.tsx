'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/context'
import { supabase } from '@/lib/supabase'
import { Calendar, Search, Tag, Eye, ChevronLeft, Bell, ExternalLink } from 'lucide-react'

interface News {
  id: string
  title: string
  titleTa: string
  date: string
  tag: string
  tagTa: string
  img: string
  summary: string
  summaryTa: string
  isAnnouncement?: boolean
  link?: string | null
}

export default function NewsPage() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const paramId = searchParams.get('id')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [articles, setArticles] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNewsAndAnnouncements() {
      try {
        // 1. Fetch News
        const { data: newsData } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })

        // 2. Fetch Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        const combined: News[] = []

        if (newsData && newsData.length > 0) {
          const published = newsData.filter((item: any) => item.is_published !== false)
          published.forEach((item: any) => {
            let imgUrl = item.photo_path || '/img1.jpeg'
            if (item.photo_path && !item.photo_path.startsWith('http') && !item.photo_path.startsWith('/')) {
              const { data: pubData } = supabase.storage.from('news-photos').getPublicUrl(item.photo_path)
              imgUrl = pubData.publicUrl
            }

            combined.push({
              id: item.id,
              title: item.title,
              titleTa: item.title_ta || item.title,
              date: item.date || new Date(item.created_at).toISOString().split('T')[0],
              tag: item.tag || 'News',
              tagTa: item.tag_ta || item.tag || 'செய்தி',
              img: imgUrl,
              summary: item.summary,
              summaryTa: item.summary_ta || item.summary,
              isAnnouncement: false
            })
          })
        }

        if (annData && annData.length > 0) {
          annData.forEach((item: any) => {
            let imgUrl = '/img2.jpeg'
            if (item.image_path) {
              if (item.image_path.startsWith('http') || item.image_path.startsWith('/')) {
                imgUrl = item.image_path
              } else {
                const { data: pubData } = supabase.storage.from('news-photos').getPublicUrl(item.image_path)
                imgUrl = pubData.publicUrl
              }
            }

            combined.push({
              id: item.id,
              title: item.badge ? `[${item.badge}] Announcement` : 'Official Announcement',
              titleTa: item.badge_ta ? `[${item.badge_ta}] முக்கிய அறிவிப்பு` : 'முக்கிய அறிவிப்பு',
              date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              tag: item.badge || 'Announcement',
              tagTa: item.badge_ta || 'அறிவிப்பு',
              img: imgUrl,
              summary: item.text,
              summaryTa: item.text_ta || item.text,
              isAnnouncement: true,
              link: item.link || null
            })
          })
        }

        // Sort descending by date
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setArticles(combined)

        // If direct paramId is present, auto-open that item
        if (paramId) {
          const match = combined.find(a => a.id === paramId)
          if (match) {
            setSelectedNews(match)
          }
        }
      } catch (err) {
        console.error('Error fetching news & announcements:', err)
      } finally {
        setLoading(false)
      }
    }

    loadNewsAndAnnouncements()
  }, [paramId])

  const filteredArticles = articles.filter(art => {
    const titleText = language === 'en' ? art.title.toLowerCase() : art.titleTa.toLowerCase()
    const summaryText = language === 'en' ? art.summary.toLowerCase() : art.summaryTa.toLowerCase()
    const query = searchQuery.toLowerCase()
    return titleText.includes(query) || summaryText.includes(query)
  })

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
          {language === 'en' ? 'Loading News & Announcements...' : 'செய்திகள் மற்றும் அறிவிப்புகள் ஏற்றப்படுகின்றன...'}
        </p>
      </div>
    )
  }

  // If a news article is selected, render it as a full-page content view (No Pop-ups!)
  if (selectedNews) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
        
        {/* Back navigation button */}
        <button
          onClick={() => {
            setSelectedNews(null)
            if (window.history.pushState) {
              window.history.pushState(null, '', '/news')
            }
          }}
          className="inline-flex items-center gap-1 text-sm font-bold text-maroon hover:text-maroon-dark transition cursor-pointer mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> {language === 'en' ? 'Back to News & Announcements' : 'செய்திகள் மற்றும் அறிவிப்புகளுக்குத் திரும்புக'}
        </button>

        {/* Full Article Page Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Main Cover Photo */}
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedNews.img} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400">
                <Calendar className="h-4 w-4" /> {selectedNews.date}
              </span>
              <span className="bg-gold/20 text-maroon-dark font-bold text-[10px] uppercase py-0.5 px-3 rounded border border-gold">
                {language === 'en' ? selectedNews.tag : selectedNews.tagTa}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-heading text-maroon-dark leading-snug">
              {language === 'en' ? selectedNews.title : selectedNews.titleTa}
            </h1>

            <div className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {language === 'en' ? selectedNews.summary : selectedNews.summaryTa}
            </div>

            {selectedNews.link && (
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-maroon text-white text-xs font-bold py-2.5 px-5 rounded-lg hover:bg-maroon-dark transition shadow"
                >
                  <ExternalLink className="h-4 w-4" />
                  {language === 'en' ? 'Visit Linked Website / Document' : 'இணைக்கப்பட்ட வலைத்தளத்தைப் பார்வையிட'}
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-maroon-dark">
          {language === 'en' ? 'News & Announcements' : 'செய்திகள் மற்றும் அறிவிப்புகள்'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          {language === 'en' 
            ? 'Read articles, reports, and events published by the Trust leadership.' 
            : 'கூட்டமைப்பின் திருப்பணிகள், செயல்பாடுகள் மற்றும் நிகழ்வுகள் குறித்த செய்திக் குறிப்புகள்.'}
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'en' ? 'Search articles...' : 'செய்திகளைத் தேடுங்கள்...'}
          className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm focus:border-maroon focus:outline-none transition font-medium"
        />
        <Search className="h-5 w-5 text-gray-400 absolute left-4 top-3" />
      </div>

      {/* News Grid with Hover Scale Card Animations */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <p className="font-semibold text-lg">No articles match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((art) => (
            <div 
              key={art.id}
              className="bg-white rounded-xl border border-gray-150 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform"
            >
              {/* Photo */}
              <div className="w-full aspect-[16/10] bg-slate-50 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={art.img} 
                  alt={art.title} 
                  className="w-full h-full object-cover"
                />
                {/* Tag Badge */}
                <div className="absolute bottom-3 left-3 bg-gold text-maroon-dark font-bold text-[10px] uppercase py-0.5 px-2.5 rounded-md flex items-center gap-1 shadow">
                  <Tag className="h-3 w-3" /> {language === 'en' ? art.tag : art.tagTa}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                    <Calendar className="h-3.5 w-3.5" /> {art.date}
                  </div>
                  <h3 className="font-bold text-base text-gray-900 font-heading leading-snug">
                    {language === 'en' ? art.title : art.titleTa}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1 line-clamp-3">
                    {language === 'en' ? art.summary : art.summaryTa}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-4 mt-2 text-right">
                  <button 
                    onClick={() => setSelectedNews(art)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-maroon hover:underline cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> {language === 'en' ? 'Read More' : 'மேலும் படிக்க'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
