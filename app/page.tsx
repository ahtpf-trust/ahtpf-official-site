'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/context'
import { supabase } from '@/lib/supabase'
import { 
  Landmark, Sparkles, ShieldCheck, Heart, 
  ChevronLeft, ChevronRight, Award, Bell 
} from 'lucide-react'

interface AnnouncementItem {
  id: string
  text: string
  text_ta?: string
  badge?: string
  badge_ta?: string
}

interface CarouselSlide {
  img: string
  category: string
  categoryTa: string
  title: string
  titleTa: string
  subtitle?: string
  subtitleTa?: string
  link?: string
}

export default function HomePage() {
  const { language, t } = useLanguage()

  // 1. Dynamic Image Slider Carousel logic
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<CarouselSlide[]>([
    {
      img: '/img1.jpeg',
      category: 'Temple Preservation',
      categoryTa: 'திருக்கோயில் பாதுகாப்பு',
      title: 'Preserving Sacred Hindu Temple Structures',
      titleTa: 'பண்டைய திருக்கோவில்களின் புனரமைப்பு',
      subtitle: 'Restoration across all districts of Tamil Nadu',
      subtitleTa: 'தமிழ்நாட்டின் அனைத்து மாவட்டங்களிலும் புனரமைப்பு பணிகள்'
    },
    {
      img: '/img2.jpeg',
      category: 'Annadanam & Seva',
      categoryTa: 'அன்னதானம் & அறப்பணி',
      title: 'Conducting Annadanam Drives & Festivals',
      titleTa: 'தொடர் அன்னதானம் மற்றும் திருவிழாக்கள்',
      subtitle: 'Serving the devotee community wholeheartedly',
      subtitleTa: 'பக்தர்களுக்கு மனமார்ந்த அன்னதான சேவை'
    }
  ])

  useEffect(() => {
    async function loadCarouselSlides() {
      try {
        const dynamicSlides: CarouselSlide[] = []

        // 1. Fetch top active announcement
        const { data: topAnn } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(2)

        if (topAnn && topAnn.length > 0) {
          topAnn.forEach((an: any) => {
            let imgUrl = '/img1.jpeg'
            if (an.image_path) {
              if (an.image_path.startsWith('http') || an.image_path.startsWith('/')) {
                imgUrl = an.image_path
              } else {
                imgUrl = supabase.storage.from('news-photos').getPublicUrl(an.image_path).data.publicUrl
              }
            }
            dynamicSlides.push({
              img: imgUrl,
              category: an.badge ? `Announcement • ${an.badge}` : 'Official Announcement',
              categoryTa: an.badge_ta ? `அறிவிப்பு • ${an.badge_ta}` : 'முக்கிய அறிவிப்பு',
              title: an.text,
              titleTa: an.text_ta || an.text,
              subtitle: 'Click to view full announcement details',
              subtitleTa: 'முழு அறிவிப்பு விவரங்களை காண கிளிக் செய்யவும்',
              link: `/news?id=${an.id}`
            })
          })
        }

        // 2. Fetch top recent news article
        const { data: topNews } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2)

        if (topNews && topNews.length > 0) {
          topNews.forEach((nw: any) => {
            let imgUrl = '/img2.jpeg'
            if (nw.photo_path) {
              if (nw.photo_path.startsWith('http') || nw.photo_path.startsWith('/')) {
                imgUrl = nw.photo_path
              } else {
                imgUrl = supabase.storage.from('news-photos').getPublicUrl(nw.photo_path).data.publicUrl
              }
            }
            dynamicSlides.push({
              img: imgUrl,
              category: nw.tag ? `News • ${nw.tag}` : 'Latest News',
              categoryTa: nw.tag_ta ? `செய்தி • ${nw.tag_ta}` : 'சமீபத்திய செய்தி',
              title: nw.title,
              titleTa: nw.title_ta || nw.title,
              subtitle: nw.summary?.slice(0, 100) + '...',
              subtitleTa: (nw.summary_ta || nw.summary)?.slice(0, 100) + '...',
              link: `/news?id=${nw.id}`
            })
          })
        }

        if (dynamicSlides.length > 0) {
          setSlides(dynamicSlides)
        }
      } catch (err) {
        console.error('Error loading carousel slides:', err)
      }
    }

    loadCarouselSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  // 2. Dynamic Announcements List from Supabase
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          setAnnouncements(data)
        } else {
          setAnnouncements([
          ])
        }
      } catch (err) {
        console.error('Error fetching announcements:', err)
      }
    }
    loadAnnouncements()
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
      
      {/* ========================================================
          CENTER COLUMN: Slider, Greetings, Pillars (70% Width)
          ======================================================== */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Dynamic Image Slider Carousel */}
        <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-gold-dark/10 group">
          {slides.map((slide, idx) => (
            <a
              key={idx}
              href={slide.link || '/news'}
              className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer block ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={slide.img} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
              />
              {/* Image dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              {/* Carousel Text overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5 text-left">
                <span className="text-[10px] text-gold font-bold uppercase tracking-widest bg-maroon-dark px-2.5 py-1 rounded inline-block">
                  {language === 'en' ? slide.category : slide.categoryTa}
                </span>
                <h2 className="text-lg md:text-2xl font-bold font-heading text-white tracking-wide drop-shadow-md line-clamp-2">
                  {language === 'en' ? slide.title : slide.titleTa}
                </h2>
                {slide.subtitle && (
                  <p className="text-xs text-gray-200 line-clamp-1 opacity-90 hidden sm:block">
                    {language === 'en' ? slide.subtitle : slide.subtitleTa}
                  </p>
                )}
              </div>
            </a>
          ))}

          {/* Slider controls */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentSlide((currentSlide + 1) % slides.length)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Welcome Message Card (aligned to deed details) with Hover Animation */}
        <div className="bg-white rounded-xl border border-gray-150 p-6 shadow-md flex flex-col md:flex-row gap-6 items-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform">
          {/* President Avatar placeholder */}
          <div className="w-24 h-24 rounded-full border-2 border-gold overflow-hidden bg-slate-50 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpeg" alt="Managing Trustee" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2 text-center md:text-left flex-grow">
            <h2 className="text-xl font-bold font-heading text-maroon-dark border-b border-gray-100 pb-1">
              {t('homeWelcome')}
            </h2>
            <h3 className="text-xs text-gold-dark font-bold uppercase tracking-wider">{t('homePresident')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              {language === 'en'
                ? 'Welcome to the official portal of the All Hindu Temples Protection Federation. Since 2013, we are committed to safeguarding neglected ancient shrines, restoring structure ruins, ensuring poojas are lit, and protecting temple lands from encroachment across all 38 districts of Tamil Nadu.'
                : 'அனைத்து இந்து திருக்கோயில்கள் பாதுகாப்பு கூட்டமைப்புக்கு தங்களை அன்போடு வரவேற்கிறோம். கடந்த 2013 ஆம் ஆண்டு முதல் தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ள புறக்கணிக்கப்பட்ட திருக்கோயில்களைப் புனரமைத்தல், ஆக்கிரமிப்புகளைத் தடுத்தல், வேதங்களைப் பாதுகாத்தல் போன்ற அறப்பணிகளில் எங்களை அர்ப்பணித்து வருகிறோம்.'}
            </p>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading text-maroon border-b-2 border-gold/30 pb-1.5 flex items-center gap-1">
            <Award className="h-5 w-5 text-gold-dark" /> {t('homePillars')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1: Renovation */}
            <div className="p-4 bg-white rounded-xl border border-gray-150 shadow-sm flex gap-3 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 transform">
              <Landmark className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-maroon-dark font-heading">
                  {language === 'en' ? 'Temple Preservation' : 'கோவில் சீரமைப்பு'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'en' 
                    ? 'Restoration of ancient dilapidated temples and conducting Consecration (Jeernodharanam).' 
                    : 'பழமையான மற்றும் இடிந்து விழும் நிலையில் உள்ள கோவில்களைப் புதுப்பித்து கும்பாபிஷேகம் நடத்துதல்.'}
                </p>
              </div>
            </div>

            {/* Pillar 2: Pooja Support */}
            <div className="p-4 bg-white rounded-xl border border-gray-150 shadow-sm flex gap-3 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 transform">
              <Sparkles className="h-5 w-5 text-saffron flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-maroon-dark font-heading">
                  {language === 'en' ? 'Daily Ritual Consecration' : 'நித்திய பூஜை ஆதரவு'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'en' 
                    ? 'Assisting needy rural temples to perform uninterrupted daily prayers (Oru Kaala Pooja).' 
                    : 'வசதியற்ற கிராமப்புற கோயில்களில் ஒருகால பூஜை தடையின்றி நடைபெற தேவையான உதவிகள் வழங்குதல்.'}
                </p>
              </div>
            </div>

            {/* Pillar 3: Land Protection */}
            <div className="p-4 bg-white rounded-xl border border-gray-150 shadow-sm flex gap-3 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 transform">
              <ShieldCheck className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-maroon-dark font-heading">
                  {language === 'en' ? 'Property Safeguards' : 'கோவில் சொத்து பாதுகாப்பு'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'en' 
                    ? 'Advocating to protect temple lands, structural layouts, and artifacts from illegal encroachment.' 
                    : 'கோவில் நிலங்கள் மற்றும் சொத்துக்கள் ஆக்கிரமிப்பு செய்யப்படுவதை சட்டரீதியாக தடுத்துப் பாதுகாத்தல்.'}
                </p>
              </div>
            </div>

            {/* Pillar 4: Staff Welfare */}
            <div className="p-4 bg-white rounded-xl border border-gray-150 shadow-sm flex gap-3 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 transform">
              <Heart className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-maroon-dark font-heading">
                  {language === 'en' ? 'Temple Staff Support' : 'அர்ச்சகர்கள் நலன்'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'en' 
                    ? 'Supporting livelihoods and medical assistance for rural Archakas, Odhuvars, and musicians.' 
                    : 'கிராமப்புற அர்ச்சகர்கள், ஓதுவார்கள் மற்றும் கோவில் இசைக் கலைஞர்களின் மருத்துவ தேவைகளுக்கு உதவுதல்.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          RIGHT COLUMN: Announcements (30% Width)
          ======================================================== */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Live Announcements Ticker Widget */}
        <div className="bg-white rounded-xl border border-gold-dark/15 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform">
          <div className="bg-maroon text-gold font-heading text-xs font-bold uppercase tracking-wider py-3 px-4 border-b border-gold-dark flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" /> {t('homeAnnouncements')}
            </span>
            <a href="/news" className="text-[10px] text-gold hover:text-white underline">
              {language === 'en' ? 'View All' : 'அனைத்தும்'}
            </a>
          </div>
          <div className="p-4 space-y-3">
            {announcements.map((item) => (
              <a 
                key={item.id} 
                href={`/news?id=${item.id}`}
                className="block pb-3.5 border-b border-gray-100 last:border-0 last:pb-0 group/item hover:bg-slate-50 p-2 rounded-lg transition"
              >
                <span className="inline-block bg-[#f0ece2] text-[#4d0708] text-[9px] font-bold px-2 py-0.5 rounded-sm mb-1.5 uppercase group-hover/item:bg-maroon group-hover/item:text-gold transition">
                  {language === 'en' ? (item.badge || 'New') : (item.badge_ta || item.badge || 'புதியது')}
                </span>
                <p className="text-xs text-gray-700 group-hover/item:text-maroon leading-snug font-medium transition">
                  {language === 'en' ? item.text : (item.text_ta || item.text)}
                </p>
              </a>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
