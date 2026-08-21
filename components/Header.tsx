'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/context'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Mail, Phone, HeartHandshake, LogOut } from 'lucide-react'
import { adminLogoutAction } from '@/app/actions'

const Marquee = 'marquee' as any

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Detect admin session from client-side cookies
  useEffect(() => {
    const checkAdminSession = () => {
      const hasCookie = document.cookie.includes('is_admin_logged_in=true')
      const isOnAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login'
      setIsAdmin(hasCookie || isOnAdminPath)
    }
    checkAdminSession()
    
    const interval = setInterval(checkAdminSession, 1000)
    return () => clearInterval(interval)
  }, [pathname])

  const publicLinks = [
    { href: '/', label: t('navHome') },
    { href: '/about', label: t('navAbout') },
    { href: '/committee', label: t('navCommittee') },
    { href: '/news', label: t('navNews') },
    { href: '/gallery', label: t('navGallery') },
    { href: '/contact', label: t('navContact') },
  ]

  // Conditionally append Admin tab link if logged in
  const navLinks = [
    ...publicLinks,
    ...(isAdmin ? [{ href: '/admin', label: language === 'en' ? 'Admin' : 'நிர்வாகம்' }] : [])
  ]

  const [marqueeText, setMarqueeText] = useState(
    language === 'en'
      ? 'Announcements Comming Soon!!'
      : 'அறிவிப்புகள் விரைவில் வெளியாகும்!!'
  )

  useEffect(() => {
    async function loadMarquee() {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .eq('is_marquee', true)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          const items = data.map((an: any) => (language === 'en' ? an.text : (an.text_ta || an.text)))
          setMarqueeText(items.join('   |   '))
        }
      } catch (err) {
        // Fallback to default
      }
    }
    loadMarquee()
  }, [language])

  const handleAdminLogout = async () => {
    await adminLogoutAction()
    document.cookie = 'is_admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    setIsAdmin(false)
    router.push('/admin/login')
  }

  return (
    <div className="w-full flex flex-col z-50 bg-white">
      
      {/* 1. TOP INFORMATION BAR (Contacts & Socials) */}
      <div className="bg-[#4d0708] text-gold-light text-[11px] font-bold py-2 px-4 md:px-8 flex justify-between items-center border-b border-gold/10 w-full">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-gold" /> +91 90030 45141
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Mail className="h-3 w-3 text-gold" /> namathuthirukovilseithigal@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="hover:text-white transition cursor-pointer font-heading"
          >
            {language === 'en' ? 'தமிழ்' : 'English'}
          </button>
        </div>
      </div>

      {/* 2. BILINGUAL BRAND HEADER (Main Banner with Logo & Session Controls) */}
      <header className="bg-maroon text-white border-b-2 border-gold py-4 px-4 md:px-8 w-full">
        <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
          
          {/* Logo and Titles */}
          <a href="/" className="flex items-center gap-3.5 cursor-pointer text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpeg" 
              alt="Logo" 
              className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gold shadow-sm bg-white"
            />
            <div className="flex flex-col text-left">
              <h1 className="text-base md:text-xl font-bold font-heading text-gold leading-tight tracking-wide">
                {language === 'en' ? 'ALL HINDU TEMPLES PROTECTION FEDERATION' : 'அனைத்து இந்து திருக்கோயில்கள் பாதுகாப்பு கூட்டமைப்பு'}
              </h1>
              <p className="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-widest leading-none mt-1">
                {language === 'en' ? 'Regd. Trust - Founded 2013 | Chennai' : 'பதிவுசெய்யப்பட்ட அறக்கட்டளை - சென்னை | நிறுவப்பட்டது 2013'}
              </p>
            </div>
          </a>

          {/* Dynamic Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAdmin ? (
              <button
                onClick={handleAdminLogout}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-md flex items-center gap-1.5 border border-rose-600 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout Admin
              </button>
            ) : (
              <>
                <a
                  href="/register"
                  className="bg-gold hover:bg-gold-dark text-maroon-dark font-bold text-xs px-4 py-2 rounded-lg transition shadow-md flex items-center gap-1 border border-gold/20 cursor-pointer"
                >
                  <HeartHandshake className="h-3.5 w-3.5" /> {t('navJoin')}
                </a>
                <a 
                  href="/login" 
                  className="text-xs hover:text-gold transition font-bold"
                >
                  {t('navLogin')}
                </a>
              </>
            )}
          </div>

          {/* Mobile Navigation Burger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded text-gold hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* 3. CENTERED TOP HORIZONTAL NAVIGATION BAR (Renders public links + conditional Admin link) */}
      <div className="border-b border-gray-200 bg-white w-full hidden lg:block shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center items-center h-11 text-[11px] xl:text-xs font-bold">
          
          <nav className="flex items-center gap-1.5 h-full">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-2 md:px-2.5 h-full flex items-center border-b-2 transition whitespace-nowrap ${
                    active 
                      ? 'border-maroon text-maroon' 
                      : 'border-transparent text-gray-600 hover:text-maroon hover:border-maroon/30'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

        </div>
      </div>

      {/* 4. SCROLLING NOTICE MARQUEE TICKER */}
      <div className="bg-[#f0ece2] border-b border-gray-200 text-[#4d0708] py-2 px-4 md:px-8 overflow-hidden flex items-center relative h-9 w-full">
        <div className="bg-[#4d0708] text-gold text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded absolute left-0 z-10 shadow-md">
          {language === 'en' ? 'Notices' : 'அறிவிப்பு'}
        </div>
        <div className="w-full pl-20">
          <Marquee className="text-xs font-semibold select-none cursor-default" scrollamount="4">
            {marqueeText}
          </Marquee>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[138px] left-0 right-0 bg-maroon border-t border-maroon-light p-6 lg:hidden flex flex-col gap-4 shadow-lg z-[999]">
          <nav className="flex flex-col gap-4 font-semibold text-base text-white">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-gold pb-2 border-b border-white/5 transition"
              >
                {link.label}
              </a>
            ))}
            
            {isAdmin ? (
              <button
                onClick={() => { setMobileMenuOpen(false); handleAdminLogout(); }}
                className="w-full bg-rose-700 text-white font-bold py-2.5 rounded hover:bg-rose-800 transition text-center flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <LogOut className="h-4 w-4" /> Logout Admin
              </button>
            ) : (
              <>
                <a 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gold text-maroon-dark font-bold text-center py-2.5 rounded hover:bg-gold-dark transition shadow"
                >
                  {t('navJoin')}
                </a>
                <a 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-gold pb-2 border-b border-white/5 transition flex items-center justify-center gap-1.5"
                >
                  {t('navLogin')}
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
