'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/context'
import { Landmark, Sparkles, BookOpen, ShieldCheck, Heart } from 'lucide-react'

export default function AboutPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'who' | 'what'>('who')

  const content = {
    en: {
      title: 'About The Federation',
      subtitle: 'Learn about our purpose and mission to protect Hindu temples and preserve spiritual heritage.',
      tabWho: 'Who We Are',
      tabWhat: 'What We Do',
      
      // Who We Are content
      whoTitle: 'Protecting Temples, Preserving Heritage',
      whoText1: 'All Hindu Temples Protection Federation is a charitable trust established for the welfare of the community without discrimination based on caste, creed, gender, or social status.',
      whoText2: 'We work to protect, preserve, maintain, and renovate ancient, neglected, and dilapidated Hindu temples and traditional places of worship. We support daily rituals, traditional festivals, and religious ceremonies, especially in temples serving underprivileged communities.',
      missionTitle: 'Our Sacred Mission',
      missionText: 'To protect Hindu temples and their heritage, preserve traditional worship and spiritual education, safeguard temple lands and cultural artifacts, support temple staff and communities, and serve society with fairness, dedication, and compassion.',
      
      // What We Do content
      whatTitle: 'Our Key Activities',
      whatText: 'We run practical, direct initiatives to safeguard temple infrastructures and local communities.',
      activities: [
        {
          title: 'Temple Restoration',
          desc: 'We rebuild ancient, crumbling stone walls, repair roofs, and organize sacred consecration (Kumbhabhishekam) ceremonies.',
          icon: Landmark,
          color: 'text-amber-600 bg-amber-50'
        },
        {
          title: 'Ritual Consecration',
          desc: 'We support local priests (archakas) with materials and stipends to guarantee that daily prayers (poojas) are performed without disruption.',
          icon: Sparkles,
          color: 'text-saffron bg-orange-50'
        },
        {
          title: 'Physical Security',
          desc: 'We install iron gates, doors, locks, and electrical grids to protect remote and vulnerable shrines from theft and vandalism.',
          icon: ShieldCheck,
          color: 'text-maroon bg-rose-50'
        },
        {
          title: 'Social & Priest Welfare',
          desc: 'We distribute medical aids, education funds, and livelihood support to temple workers and financially backward families regardless of backgrounds.',
          icon: Heart,
          color: 'text-emerald-600 bg-emerald-50'
        }
      ]
    },
    ta: {
      title: 'கூட்டமைப்பு பற்றி',
      subtitle: 'இந்து கோயில்கள் மற்றும் ஆன்மீகப் பாரம்பரியத்தைப் பாதுகாப்பதற்கான எங்கள் நோக்கம் மற்றும் பணியைப் பற்றி அறியவும்.',
      tabWho: 'நாம் யார்?',
      tabWhat: 'நாம் என்ன செய்கிறோம்!',
      
      // Who We Are content
      whoTitle: 'கோவில்களைப் பாதுகாப்போம், மரபை வளர்ப்போம்',
      whoText1: 'அனைத்து இந்து திருக்கோயில்கள் பாதுகாப்பு கூட்டமைப்பு, சாதி, மதம், பாலினம் அல்லது சமூக அந்தஸ்து ஆகியவற்றின் அடிப்படையில் எந்தவித பாகுபாடும் இன்றி, பொதுமக்களின் நலனுக்காக நிறுவப்பட்ட ஒரு அறக்கட்டளையாகும்.',
      whoText2: 'பழமையான, புறக்கணிக்கப்பட்ட மற்றும் சிதிலமடைந்த இந்து கோயில்கள் மற்றும் பாரம்பரிய வழிபாட்டுத் தலங்களைப் பாதுகாத்தல், பராமரித்தல், புதுப்பித்தல் ஆகிய பணிகளில் நாங்கள் செயல்படுகிறோம். குறிப்பாக வசதி குறைவான கோயில்களில் தினசரி பூஜைகள், பாரம்பரிய திருவிழாக்கள் மற்றும் சமயச் சடங்குகள் தடையின்றி நடைபெற தேவையான உதவிகளை வழங்குகிறோம்.',
      missionTitle: 'எங்கள் புனித நோக்கம்',
      missionText: 'இந்து கோயில்கள் மற்றும் அவற்றின் பாரம்பரியத்தைப் பாதுகாத்தல், வழிபாட்டு முறைகள் மற்றும் ஆன்மீகக் கல்வியை நிலைநிறுத்தல், கோயில் நிலங்கள் மற்றும் கலாச்சாரப் பொருட்களைப் பாதுகாத்தல், கோயில் பணியாளர்கள் மற்றும் சமூகங்களுக்கு ஆதரவளித்தல், மேலும் நேர்மை, அர்ப்பணிப்பு மற்றும் கருணையுடன் சமூகத்திற்கு சேவை செய்தல்.',
      
      // What We Do content
      whatTitle: 'எங்கள் முக்கிய செயல்பாடுகள்',
      whatText: 'கோவில் கட்டமைப்பு மற்றும் உள்ளூர் சமூகங்களைப் பாதுகாப்பதற்காக நாங்கள் நேரடி திட்டங்களைச் செயல்படுத்துகிறோம்.',
      activities: [
        {
          title: 'கோவில் சீரமைப்பு',
          desc: 'சிதிலமடைந்த கல் சுவர்களைச் சீரமைத்தல், கோபுரங்களை பழுதுபார்த்தல், கும்பாபிஷேக விழாக்கள் நடத்துதல்.',
          icon: Landmark,
          color: 'text-amber-600 bg-amber-50'
        },
        {
          title: 'பூஜை மறுமலர்ச்சி',
          desc: 'பூஜைகள் தடையின்றி நடைபெற அர்ச்சகர்களுக்கு தேவையான பொருட்கள் மற்றும் ஊக்கத்தொகை வழங்கி உதவுதல்.',
          icon: Sparkles,
          color: 'text-saffron bg-orange-50'
        },
        {
          title: 'கோவில் பாதுகாப்பு',
          desc: 'கோவில் சிலைகள் மற்றும் நகைகளைப் பாதுகாக்க கதவுகள், இரும்பு கேட்டுகள் மற்றும் மின் விளக்கு வசதிகளை அமைத்தல்.',
          icon: ShieldCheck,
          color: 'text-maroon bg-rose-50'
        },
        {
          title: 'சமூக & அர்ச்சகர் நலன்',
          desc: 'கோவில் பணியாளர்கள் மற்றும் ஏழை எளிய குடும்பங்களுக்கு கல்வி உதவி, வாழ்வாதார உதவிகள் வழங்குதல்.',
          icon: Heart,
          color: 'text-emerald-600 bg-emerald-50'
        }
      ]
    }
  }

  const current = content[language]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-maroon-dark">
          {current.title}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          {current.subtitle}
        </p>
      </div>

      {/* Modern Animated Toggle Tab */}
      <div className="flex justify-center border-b border-gray-200">
        <div className="flex gap-4 -mb-px">
          <button
            onClick={() => setActiveTab('who')}
            className={`py-3 px-6 text-sm md:text-base font-bold font-heading border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'who'
                ? 'border-maroon text-maroon'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {current.tabWho}
          </button>
          <button
            onClick={() => setActiveTab('what')}
            className={`py-3 px-6 text-sm md:text-base font-bold font-heading border-b-2 transition duration-200 cursor-pointer ${
              activeTab === 'what'
                ? 'border-maroon text-maroon'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {current.tabWhat}
          </button>
        </div>
      </div>

      {/* Tab Contents (Forced White Backgrounds with Pop-up hover animation) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-150 p-6 md:p-10 transition duration-300 hover:shadow-xl hover:-translate-y-1 transform">
        {activeTab === 'who' ? (
          /* Who We Are View */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-maroon-dark border-l-4 border-gold pl-3">
                {current.whoTitle}
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {current.whoText1}
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {current.whoText2}
              </p>
            </div>

            {/* Mission Box with Hover Pop-up effect */}
            <div className="p-6 bg-white rounded-xl border border-gold/25 flex gap-4 items-start shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 transform">
              <BookOpen className="h-6 w-6 text-maroon flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-maroon-dark text-lg font-heading mb-1.5">
                  {current.missionTitle}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {current.missionText}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* What We Do View */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold font-heading text-maroon-dark">
                {current.whatTitle}
              </h2>
              <p className="text-sm text-gray-500">
                {current.whatText}
              </p>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {current.activities.map((act) => {
                const IconComponent = act.icon
                return (
                  <div 
                    key={act.title} 
                    className="p-5 border border-gray-150 rounded-xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform flex gap-4"
                  >
                    <div className={`p-3 rounded-lg flex-shrink-0 ${act.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold font-heading text-base text-maroon-dark">
                        {act.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
