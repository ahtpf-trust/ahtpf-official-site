import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 py-12">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-[#8b0000]/20 border-t-[#d4af37] animate-spin"></div>
        {/* Center Emblem Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.jpeg" 
            alt="Loading..." 
            className="w-8 h-8 rounded-full object-cover shadow-sm animate-pulse" 
          />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-maroon uppercase tracking-widest font-heading">
          All Hindu Temples Protection Federation
        </p>
        <p className="text-[11px] text-gray-500 font-medium">
          ஏற்றப்படுகிறது... / Loading...
        </p>
      </div>
    </div>
  )
}
