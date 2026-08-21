import type { Metadata } from 'next'
import { Cinzel, Lora } from 'next/font/google'
import { LanguageProvider } from '@/lib/context'
import Header from '@/components/Header'
import './globals.css'
import { Phone, Mail, MapPin } from 'lucide-react'
import { Suspense } from 'react'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'All Hindu Temples Protection Federation - Regd Trust',
  description: 'Official portal coordinates temple restorations, protecting spiritual heritage and managing volunteer registration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${lora.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen bg-white text-neutral-800 transition-colors duration-200">
        <LanguageProvider>
          
          {/* Suspense wrapper around Header to allow client-side search parameter extraction */}
          <Suspense fallback={<div className="h-20 bg-maroon animate-pulse" />}>
            <Header />
          </Suspense>

          {/* Centered Body Container - Restored from full-width fluid layouts */}
          <div className="flex-grow max-w-7xl w-full mx-auto p-4 md:py-8 md:px-6 flex flex-col gap-6">
            
            {/* Main Content Viewport (Centered, taking full 1-column layout) */}
            <main className="flex-grow w-full overflow-hidden animate-in fade-in duration-300">
              {children}
            </main>

          </div>

          {/* Global Footer (Centered directories) */}
          <footer className="bg-maroon-dark text-white/90 py-8 px-4 md:px-8 border-t border-maroon-light transition-colors duration-200 w-full text-xs">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 border-b border-white/10 pb-6 text-left">
              
              {/* Address column */}
              <div className="space-y-2">
                <h4 className="font-heading text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Office Address / முகவரி
                </h4>
                <p className="text-white/70 leading-relaxed">
                  No:15, 2nd Street, Chandrasekar Nagar, Manali Salai, Kodungaiyur, Chennai - 600 118, Tamil Nadu, India.
                </p>
              </div>

              {/* Telephone column */}
              <div className="space-y-2">
                <h4 className="font-heading text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> Contact Phone / தொலைபேசி
                </h4>
                <p className="text-white/70">
                  Primary: <strong>+91 90030 45141</strong>
                </p>
              </div>

              {/* Email column */}
              <div className="space-y-2">
                <h4 className="font-heading text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> Email Address / மின்னஞ்சல்
                </h4>
                <p className="text-white/70">
                  General: <strong>namathuthirukovilseithigal@gmail.com</strong>
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-white/50">
              <p>© 2026 All Hindu Temples Protection Federation (Regd. Trust 2013). Chennai.</p>
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Official Portal Active
              </p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  )
}
