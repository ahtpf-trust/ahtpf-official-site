'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/context'
import { supabase } from '@/lib/supabase'
import { Camera, X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'

interface Album {
  id: string
  title: string
  titleTa: string
  date: string
  count: number
  cover: string
  images: string[]
}

export default function GalleryPage() {
  const { language } = useLanguage()
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null)
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlbums() {
      try {
        const { data: dbAlbums, error: albumErr } = await supabase
          .from('albums')
          .select('*, album_images(id, photo_path)')
          .order('created_at', { ascending: false })

        if (albumErr) throw albumErr

        if (dbAlbums && dbAlbums.length > 0) {
          const formatted: Album[] = dbAlbums.map((a: any) => {
            const rawImages = a.album_images || []
            const imageUrls = rawImages.map((img: any) => {
              if (!img.photo_path) return '/img1.jpeg'
              if (img.photo_path.startsWith('http') || img.photo_path.startsWith('/')) {
                return img.photo_path
              }
              return supabase.storage.from('gallery-photos').getPublicUrl(img.photo_path).data.publicUrl
            })

            let coverUrl = a.cover_image_path || (imageUrls.length > 0 ? imageUrls[0] : '/img1.jpeg')
            if (coverUrl && !coverUrl.startsWith('http') && !coverUrl.startsWith('/')) {
              coverUrl = supabase.storage.from('gallery-photos').getPublicUrl(coverUrl).data.publicUrl
            }

            return {
              id: a.id,
              title: a.title,
              titleTa: a.title_ta || a.title,
              date: a.date || (a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : ''),
              count: imageUrls.length,
              cover: coverUrl,
              images: imageUrls,
            }
          })
          setAlbums(formatted)
        } else {
          setAlbums([])
        }
      } catch (err) {
        console.error('Error loading gallery albums:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
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
          {language === 'en' ? 'Loading Photo Gallery...' : 'புகைப்படங்கள் ஏற்றப்படுகின்றன...'}
        </p>
      </div>
    )
  }

  const openLightbox = (idx: number) => {
    setPhotoIndex(idx)
  }

  const closeLightbox = () => {
    setPhotoIndex(null)
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeAlbum && photoIndex !== null) {
      setPhotoIndex((photoIndex + 1) % activeAlbum.images.length)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeAlbum && photoIndex !== null) {
      setPhotoIndex((photoIndex - 1 + activeAlbum.images.length) % activeAlbum.images.length)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative">
      
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-maroon-dark">
          {language === 'en' ? 'Photo Gallery' : 'படத்தொகுப்பு'}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          {language === 'en' 
            ? 'Browse snapshots of our temple restorations, poojas, and volunteer campaigns.' 
            : 'நமது கோவில் திருப்பணிகள், விளக்கு பூஜைகள் மற்றும் உழவாரப் பணிகளின் புகைப்படத் தொகுப்பு.'}
        </p>
      </div>

      {/* Main Albums Grid (All white cards, hover pop-up scale effects) */}
      {!activeAlbum ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in duration-250">
          {albums.map((album) => (
            <div 
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform cursor-pointer flex flex-col justify-between group"
            >
              {/* Cover Photo */}
              <div className="w-full aspect-[16/10] bg-slate-50 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={album.cover} 
                  alt={album.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Count Badge */}
                <div className="absolute top-3 right-3 bg-black/60 text-gold font-bold text-xs py-1 px-3 rounded-full flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> {album.count}
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-1 bg-white">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{album.date}</div>
                <h3 className="font-bold text-base text-maroon-dark font-heading leading-snug group-hover:text-maroon transition duration-150">
                  {language === 'en' ? album.title : album.titleTa}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EXPANDED ALBUM GRID VIEW */
        <div className="space-y-6 animate-in fade-in duration-250">
          {/* Back Button Header */}
          <div className="flex justify-between items-center border-b border-gray-150 pb-3">
            <button
              onClick={() => setActiveAlbum(null)}
              className="inline-flex items-center gap-1 text-xs font-bold bg-maroon-light text-white px-3 py-1.5 rounded hover:bg-maroon transition cursor-pointer"
            >
              ← {language === 'en' ? 'Back to Albums' : 'ஆல்பம்கள்'}
            </button>
            <span className="text-xs text-gray-500 font-bold tracking-wider uppercase flex items-center gap-1">
              <Grid className="h-4 w-4" /> {activeAlbum.images.length} Photos
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-heading text-maroon-dark border-l-4 border-gold pl-3">
            {language === 'en' ? activeAlbum.title : activeAlbum.titleTa}
          </h2>

          {/* Grid of Images with Hover raise-animations */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeAlbum.images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => openLightbox(idx)}
                className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-gray-150 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img} 
                  alt={`Album photo ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX VIEW */}
      {activeAlbum && photoIndex !== null && (
        <div 
          className="fixed inset-0 bg-white/95 z-[99999] flex flex-col justify-between p-6 select-none animate-in fade-in duration-150 border border-gray-150 shadow-2xl"
          onClick={closeLightbox}
        >
          {/* Lightbox Header */}
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span>
              {photoIndex + 1} / {activeAlbum.images.length}
            </span>
            <button 
              onClick={closeLightbox} 
              className="p-1 rounded-full hover:bg-slate-100 text-gray-600 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Body Image */}
          <div className="flex-grow flex items-center justify-center relative my-4">
            {/* Prev Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 md:left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-800 cursor-pointer z-50 shadow"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeAlbum.images[photoIndex]} 
              alt={`Photo view ${photoIndex + 1}`} 
              className="max-w-full max-h-[75vh] object-contain rounded shadow"
              onClick={(e) => e.stopPropagation()} 
            />

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 md:right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-800 cursor-pointer z-50 shadow"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Footer Caption */}
          <div className="text-center text-gray-700 font-heading text-xs font-bold leading-relaxed max-w-xl mx-auto border-t border-gray-100 pt-3">
            {language === 'en' ? activeAlbum.title : activeAlbum.titleTa}
          </div>
        </div>
      )}

    </div>
  )
}
