'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ta'

export const dictionaries = {
  en: {
    // Navigation & General
    trustName: 'ALL HINDU TEMPLES PROTECTION FEDERATION',
    trustSubtitle: 'Regd. Trust - Founded 2013 | Protecting Shrines, Preserving Traditional Heritage',
    navHome: 'Home',
    navAbout: 'About Us',
    navCommittee: 'Committees',
    navNews: 'News & Announcements',
    navGallery: 'Photo Gallery',
    navContact: 'Contact Us',
    navLogin: 'Member Login',
    navAdmin: 'Admin Dashboard',
    navJoin: 'Join as Volunteer',

    // Home Page Specific
    homeWelcome: 'Founder’s Welcome Address',
    homeTreasurer: 'Mr. V.J. Lakshmi Dasan, Treasurer',
    homePresident: 'Mr. S.Senthilkumar, President and Mr. V.J. Lakshmi Dasan, Treasurer',
    homePillars: 'Core Objectives of the Federation',
    homeAnnouncements: 'Latest Announcements',
    homeStats: 'Federation Operations In Numbers',
    homeDownloads: 'Document Download Center',

    // Form Page
    formTitle: 'Volunteer Registration Form',
    formSubtitle: 'Join the federation to safeguard historical temple heritage and coordinate restoration programs.',
    formName: 'Full Name (As in ID proof) *',
    formPhone: 'Mobile Phone Number *',
    formDob: 'Date of Birth (DOB) *',
    formPhoto: 'Passport Size Photo (Public Card) *',
    formIdProof: 'Government Identity Proof (Private Document) *',
    formSubmit: 'Submit Application & Request ID',

    // Member Card Page
    memberTitle: 'Federation Virtual Identity Card',
    memberSubtitle: 'Approved active member card. Scan the QR code to verify database records.',
    memberNameLabel: 'Name / பெயர்',
    memberDobLabel: 'DOB / தேதி',
    memberVerifyLabel: 'Scan to Verify / சரிபார்',
    memberSignLabel: 'Managing Trustee',
    memberDownloadPdf: 'Download Membership ID as PDF',

    // Admin Page
    adminTitle: 'Federation Admin Command Center',
    adminSubtitle: 'Secured administrative portal to approve registrations and edit public website contents.',
    adminApprovedBadge: 'Approved',
    adminPendingBadge: 'Pending Review',
    adminRejectedBadge: 'Rejected',
  },
  ta: {
    // Navigation & General
    trustName: 'அனைத்து இந்து திருக்கோயில்கள் பாதுகாப்பு கூட்டமைப்பு',
    trustSubtitle: 'பதிவுசெய்யப்பட்ட அறக்கட்டளை - 2013 | பாரம்பரியம் மற்றும் கலாச்சாரத்தை பாதுகாப்போம்',
    navHome: 'முகப்பு',
    navAbout: 'எங்களை பற்றி',
    navCommittee: 'அறங்காவலர்கள்',
    navNews: 'செய்திகள் & அறிவிப்புகள்',
    navGallery: 'படத்தொகுப்பு',
    navContact: 'தொடர்பு கொள்ள',
    navLogin: 'உறுப்பினர் உள்நுழைவு',
    navAdmin: 'நிர்வாகி பகுதி',
    navJoin: 'உறுப்பினர் சேர்க்கை',

    // Home Page Specific
    homeWelcome: 'நிர்வாக அறங்காவலரின் வரவேற்புரை',
    homeTreasurer: 'திரு. வி.ஜே. லக்ஷ்மி தாசன், பொருளாளர்',
    homePresident: 'திரு. எஸ். செந்தில்குமார், நிர்வாக அறங்காவலர் மற்றும் திரு. வி.ஜே. லக்ஷ்மி தாசன், பொருளாளர்',
    homePillars: 'அறக்கட்டளையின் முதன்மை நோக்கங்கள்',
    homeAnnouncements: 'சமீபத்திய அறிவிப்புகள்',
    homeStats: 'கூட்டமைப்பின் செயல்பாடுகள்',
    homeDownloads: 'பதிவிறக்க மையம்',

    // Form Page
    formTitle: 'தன்னார்வலர் சேர்க்கை படிவம்',
    formSubtitle: 'பழமையான திருக்கோயில்களைப் பாதுகாக்கும் மற்றும் புனரமைக்கும் பணிகளில் எங்களோடு இணையுங்கள்.',
    formName: 'முழு பெயர் (சான்றிதழில் உள்ளபடி) *',
    formPhone: 'கைபேசி எண் *',
    formDob: 'பிறந்த தேதி *',
    formPhoto: 'சுயவிவரப் புகைப்படம் (அடையாள அட்டைக்காக) *',
    formIdProof: 'அடையாள சான்று ஆவணம் (பாதுகாப்பானது) *',
    formSubmit: 'பதிவை சமர்ப்பிக்கவும்',

    // Member Card Page
    memberTitle: 'கூட்டமைப்பின் டிஜிட்டல் அடையாள அட்டை',
    memberSubtitle: 'அங்கீகரிக்கப்பட்ட உறுப்பினர் அட்டை. விபரங்களைச் சரிபார்க்க QR குறியீட்டை ஸ்கேன் செய்யவும்.',
    memberNameLabel: 'Name / பெயர்',
    memberDobLabel: 'DOB / தேதி',
    memberVerifyLabel: 'Scan to Verify / சரிபார்',
    memberSignLabel: 'நிர்வாக அறங்காவலர்',
    memberDownloadPdf: 'அடையாள அட்டையை PDF ஆக பதிவிறக்குக',

    // Admin Page
    adminTitle: 'கூட்டமைப்பு நிர்வாக பகுதி',
    adminSubtitle: 'புதிய பதிவுகளை அங்கீகரிக்கவும், செய்திகள் மற்றும் இதர தகவல்களைப் புதுப்பிக்கவும்.',
    adminApprovedBadge: 'அங்கீகரிக்கப்பட்டது',
    adminPendingBadge: 'மதிப்பாய்வில் உள்ளது',
    adminRejectedBadge: 'நிராகரிக்கப்பட்டது',
  },
}

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof dictionaries.en) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language
    if (savedLang === 'ta' || savedLang === 'en') {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const t = (key: keyof typeof dictionaries.en): string => {
    return dictionaries[language][key] || dictionaries.en[key] || String(key)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
