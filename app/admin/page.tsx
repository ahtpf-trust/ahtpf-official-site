import React, { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import AdminDashboardClient from '@/components/AdminDashboardClient'

// Force Next.js to not cache this page, so admin always sees latest registrations
export const revalidate = 0
export const dynamic = 'force-dynamic'

interface MemberRecord {
  id: string
  full_name: string
  phone: string
  photo_path: string
  id_proof_path: string | null
  status: string
  membership_no: string | null
  created_at: string
  member_type?: string
  date_of_birth?: string | null
  email?: string | null
  role?: string | null
}

export default async function AdminDashboard() {
  // 1. Session Authentication Check (Server-Side Redirect)
  const cookieStore = cookies()
  const hasSession = cookieStore.has('admin_session')
  if (!hasSession) {
    redirect('/admin/login')
  }

  let members: any[] = []
  let committeeMembers: any[] = []
  let newsList: any[] = []
  let albumList: any[] = []
  let announcementsList: any[] = []
  let errorMsg: string | null = null

  try {
    const adminClient = getSupabaseAdmin()

    // 2. Fetch all members from PostgreSQL sorted by newest
    const { data: dbMembers, error: fetchError } = await adminClient
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    if (dbMembers) {
      // 3. Loop through members and fetch their respective storage URLs
      for (const m of dbMembers as MemberRecord[]) {
        // Fetch Public Photo URL
        let photoUrl = '/logo.jpeg'
        if (m.photo_path) {
          if (m.photo_path.startsWith('http') || m.photo_path.startsWith('/')) {
            photoUrl = m.photo_path
          } else {
            photoUrl = adminClient.storage.from('member-photos').getPublicUrl(m.photo_path).data.publicUrl
          }
        }

        // Fetch Secure, Short-Lived Signed URL for private ID proof (valid for 5 minutes)
        let idProofUrl = ''
        if (m.id_proof_path) {
          const { data: signedData } = await adminClient.storage
            .from('id-proofs')
            .createSignedUrl(m.id_proof_path, 300) // 300 seconds = 5 minutes

          if (signedData) {
            idProofUrl = signedData.signedUrl
          }
        }

        const enriched = {
          ...m,
          photoUrl,
          idProofUrl,
        }

        // Separate committee members from regular volunteers (Filter disabled/inactive)
        if (m.member_type === 'committee') {
          if (m.status !== 'Inactive' && m.status !== 'Rejected') {
            committeeMembers.push(enriched)
          }
        } else {
          members.push(enriched)
        }
      }

      // Sort committee members by display_order ASC (fallback to created_at)
      committeeMembers.sort((a, b) => {
        const orderA = a.display_order ?? 999999
        const orderB = b.display_order ?? 999999
        if (orderA !== orderB) return orderA - orderB
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    }

    // 4. Fetch News from DB
    const { data: dbNews } = await adminClient
      .from('news')
      .select('*')
      .order('date', { ascending: false })

    if (dbNews) {
      newsList = dbNews.map((n: any) => {
        let photoUrl = '/img1.jpeg'
        if (n.photo_path) {
          if (n.photo_path.startsWith('http') || n.photo_path.startsWith('/')) {
            photoUrl = n.photo_path
          } else {
            photoUrl = adminClient.storage.from('news-photos').getPublicUrl(n.photo_path).data.publicUrl
          }
        }
        return {
          ...n,
          image: photoUrl,
        }
      })
    }

    // 5. Fetch Albums with images from DB
    const { data: dbAlbums } = await adminClient
      .from('albums')
      .select('*, album_images(id, photo_path)')
      .order('date', { ascending: false })

    if (dbAlbums) {
      albumList = dbAlbums.map((a: any) => {
        const rawImgs = a.album_images || []
        const imagesWithUrls = rawImgs.map((img: any) => {
          let url = '/img1.jpeg'
          if (img.photo_path) {
            if (img.photo_path.startsWith('http') || img.photo_path.startsWith('/')) {
              url = img.photo_path
            } else {
              url = adminClient.storage.from('gallery-photos').getPublicUrl(img.photo_path).data.publicUrl
            }
          }
          return {
            id: img.id,
            photo_path: img.photo_path,
            url,
          }
        })

        return {
          id: a.id,
          title: a.title,
          title_ta: a.title_ta,
          date: a.date || (a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : ''),
          desc: a.description || '',
          desc_ta: a.description_ta || '',
          cover_image_path: a.cover_image_path,
          images: imagesWithUrls,
        }
      })
    }

    // 6. Fetch Announcements from DB
    const { data: dbAnnouncements } = await adminClient
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbAnnouncements) {
      announcementsList = dbAnnouncements.map((an: any) => {
        let imageUrl = ''
        if (an.image_path) {
          if (an.image_path.startsWith('http') || an.image_path.startsWith('/')) {
            imageUrl = an.image_path
          } else {
            imageUrl = adminClient.storage.from('news-photos').getPublicUrl(an.image_path).data.publicUrl
          }
        }
        return {
          ...an,
          imageUrl,
        }
      })
    }

  } catch (err: any) {
    errorMsg = err.message || 'Failed to fetch admin dashboard records.'
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4">
          <p className="text-sm font-semibold font-body">Error: {errorMsg}</p>
        </div>
      )}

      {/* Interactive Admin Client Panel wrapped in Suspense for CSR safety */}
      <Suspense fallback={<div className="h-40 bg-white rounded-lg shadow animate-pulse" />}>
        <AdminDashboardClient
          initialMembers={members}
          initialCommitteeMembers={committeeMembers}
          initialNews={newsList}
          initialAlbums={albumList}
          initialAnnouncements={announcementsList}
        />
      </Suspense>
    </div>
  )
}
