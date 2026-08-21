'use client'

import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'

interface IdCardDownloaderProps {
  memberName: string
}

export default function IdCardDownloader({ memberName }: IdCardDownloaderProps) {
  const [downloading, setDownloading] = useState(false)

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const { generateIdCardPdf } = await import('@/lib/generateIdCardPdf')
      await generateIdCardPdf('membership-card', memberName)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF. You can also print the page (Ctrl+P) to save as PDF.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={downloadPDF}
      disabled={downloading}
      className="inline-flex items-center justify-center gap-2 bg-gold text-maroon-dark font-bold py-2.5 px-6 rounded-lg hover:bg-gold-dark hover:text-white transition shadow-md w-full sm:w-auto cursor-pointer disabled:opacity-50"
    >
      {downloading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-maroon-dark" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Creating PDF Document...</span>
        </>
      ) : (
        <>
          <FileText className="h-5 w-5" />
          <span>Download ID Card as PDF</span>
        </>
      )}
    </button>
  )
}
