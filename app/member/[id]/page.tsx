import React from 'react'
import { getSupabaseAdmin } from '@/lib/supabase'
import IdCardDownloader from '@/components/IdCardDownloader'
import { CheckCircle2, User, Phone, Calendar, Bookmark, Landmark } from 'lucide-react'

// Force dynamic page fetch so updates to database display instantly
export const revalidate = 0
export const dynamic = 'force-dynamic'

interface MemberCardPageProps {
  params: {
    id: string
  }
}

export default async function MemberCardPage({ params }: MemberCardPageProps) {
  const memberId = params.id
  let member: any = null
  let photoUrl = ''
  let qrCodeUrl = ''
  let errorMsg: string | null = null

  try {
    const adminClient = getSupabaseAdmin()

    // 1. Fetch member details from Supabase
    const { data: dbMember, error: fetchError } = await adminClient
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (fetchError || !dbMember) {
      throw new Error('Membership record not found or invalid link.')
    }

    if (dbMember.status !== 'Approved') {
      errorMsg = 'This volunteer registration is currently pending administrator approval.'
    } else {
      member = dbMember

      // 2. Resolve Public Profile Photo URL
      photoUrl = adminClient.storage
        .from('member-photos')
        .getPublicUrl(member.photo_path).data.publicUrl

      // 3. Construct Dynamic QR Code (linking to this verification page itself)
      const vercelUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
      const targetUrl = `${vercelUrl}/member/${member.id}`

      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(targetUrl)}`
    }
  } catch (err: any) {
    errorMsg = err.message || 'Failed to retrieve card data.'
  }

  // 1. Error / Pending State Render
  if (errorMsg || !member) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-white rounded-xl shadow-md border border-amber-200 p-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 text-amber-600 mb-4">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-maroon-dark mb-2">Access Denied / Pending</h2>
          <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
          <a
            href="/"
            className="inline-block bg-maroon text-white font-bold py-2 px-6 rounded hover:bg-maroon-dark transition text-sm shadow"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-4 space-y-8 flex flex-col items-center">

      {/* Informative Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" /> Verified Active Card
        </div>
        <h1 className="text-3xl font-bold font-heading text-maroon-dark">Your Digital Identity Card</h1>
        <p className="text-xs text-gray-500 max-w-sm">
          Keep this card on your phone or print it. The QR code links to this secure verification page.
        </p>
      </div>

      {/*
        =====================================================================
        THE IDENTITY CARD
        Approach: Template JPG as background-image on a fixed-ratio container.
        Dynamic content (photo, name, role, QR) overlaid with position:absolute.
        The template image is 630×900px (roughly 0.7 aspect ratio).
        We render the card at 310px wide → height = 310 / 0.7 = ~443px.
        All overlay positions are expressed as % of the card dimensions so they
        scale perfectly whether the card is small (modal) or large (public page).
        =====================================================================
      */}
      <div
        id="membership-card"
        className="relative select-none shadow-2xl overflow-hidden"
        style={{
          width: '310px',
          height: '443px',
          backgroundImage: 'url(/id-card-template.jpg)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* ── PROFILE PHOTO ────────────────────────────────────────────── */}
        <div
          className="absolute overflow-hidden rounded-2xl"
          style={{ left: '78px', top: '146px', width: '158px', height: '177px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={member.full_name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* ── MEMBER NAME ──────────────────────────────────────────────── */}
        <div
          className="absolute w-full px-3 text-center"
          style={{ top: '327px' }}
        >
          <span className="font-bold text-[#8b0000] leading-none uppercase inline-block font-heading tracking-wide"
            style={{ fontSize: "11px" }}
          >
            {member.full_name}
          </span>
        </div>

        {/* ── ROLE / DESIGNATION ───────────────────────────────────────── */}
        <div
          className="absolute w-full px-4 text-center"
          style={{ top: '344px' }}
        >
          <span
            className="text-gray-700 font-bold uppercase tracking-wider inline-block leading-none"
            style={{ fontSize: '8.5px' }}
          >
            {member.role || 'Member'}
          </span>
        </div>

        {/* ── UNIQUE MEMBER ID BADGE ──────────────────────────────────── */}
        {member.membership_no && (
          <div
            className="absolute w-full px-4 text-center"
            style={{ top: '359px' }}
          >
            <span
              className="inline-block text-[#7a0000] font-mono font-bold px-2 py-0.5 tracking-wider shadow-xs"
              style={{ fontSize: '7.5px' }}
            >
              ID: {member.membership_no}
            </span>
          </div>
        )}

        {/* ── QR CODE ──────────────────────────────────────────────────── */}
        <div
          className="absolute overflow-hidden"
          style={{ right: '21px', bottom: '36px', width: '33px', height: '33px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Client-Side Download PDF Button */}
      <div className="w-full text-center">
        <IdCardDownloader memberName={member.full_name} />
      </div>

    </div>
  )
}
