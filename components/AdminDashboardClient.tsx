'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  approveMemberAction, rejectMemberAction,
  inactiveMemberAction, reapproveMemberAction,
  adminAddVolunteerAction, adminUpdateVolunteerAction,
  adminDeleteVolunteerPermanentlyAction,
  addCommitteeMemberAction, updateCommitteeMemberAction,
  deleteCommitteeMemberAction,
  saveNewsAction, deleteNewsAction,
  saveAlbumAction, deleteAlbumAction, deleteAlbumPhotoAction,
  saveAnnouncementAction, deleteAnnouncementAction,
  updateCommitteeOrderAction, updateCommitteeBatchOrderAction, saveGlobalSettingsAction
} from '@/app/actions'
import {
  Users, Newspaper, Image as ImageIcon, Settings, Plus,
  Trash2, Edit, Eye, UserPlus, CheckSquare, X, Download,
  Search, ArrowUpDown, Landmark, FileText, ShieldCheck, Bell,
  ArrowUp, ArrowDown, CheckCircle
} from 'lucide-react'

interface MemberRecord {
  id: string
  full_name: string
  phone: string
  photo_path: string
  id_proof_path: string | null
  status: string
  membership_no: string | null
  created_at: string
  photoUrl: string
  idProofUrl: string
  dob?: string
  role?: string
  role_ta?: string
  email?: string
  member_type?: string
  bio?: string
  bio_ta?: string
  display_order?: number
}

interface NewsRecord {
  id: string
  title: string
  title_ta?: string
  tag?: string
  tag_ta?: string
  summary: string
  summary_ta?: string
  date: string
  image?: string
  photo_path?: string
}

interface AlbumImage {
  id: string
  photo_path: string
  url: string
}

interface AlbumRecord {
  id: string
  title: string
  title_ta?: string
  date: string
  desc?: string
  desc_ta?: string
  cover_image_path?: string
  images: AlbumImage[]
}

interface AnnouncementRecord {
  id: string
  text: string
  text_ta?: string
  badge?: string
  badge_ta?: string
  link?: string
  is_marquee?: boolean
  is_active?: boolean
  image_path?: string
  imageUrl?: string
  created_at?: string
}

interface AdminDashboardClientProps {
  initialMembers: MemberRecord[]
  initialCommitteeMembers?: MemberRecord[]
  initialNews?: NewsRecord[]
  initialAlbums?: AlbumRecord[]
  initialAnnouncements?: AnnouncementRecord[]
}

export default function AdminDashboardClient({
  initialMembers,
  initialCommitteeMembers = [],
  initialNews = [],
  initialAlbums = [],
  initialAnnouncements = []
}: AdminDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 1. Admin Content Tab State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'volunteers')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t) {
      setActiveTab(t)
    }
  }, [searchParams])

  // 2. Volunteers sub-tabs
  const [volSubTab, setVolSubTab] = useState<'pending' | 'list'>('pending')
  const [volunteers, setVolunteers] = useState<MemberRecord[]>(() => {
    return initialMembers.map(m => ({
      ...m,
      dob: (m as any).date_of_birth || m.dob || '1995-08-15',
      role: m.role || 'Member',
      email: m.email || ''
    }))
  })

  // Sync when initialMembers update
  useEffect(() => {
    setVolunteers(initialMembers.map(m => ({
      ...m,
      dob: (m as any).date_of_birth || m.dob || '1995-08-15',
      role: m.role || 'Member',
      email: m.email || ''
    })))
  }, [initialMembers])

  // Search & Sort states for Volunteers List
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<'name' | 'date'>('name')

  // Toast and Loading Screen states
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Modal / Editor states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState<MemberRecord | null>(null)
  const [previewIdCard, setPreviewIdCard] = useState<MemberRecord | null>(null)
  const [previewIdProof, setPreviewIdProof] = useState<MemberRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forms states
  const [addForm, setAddForm] = useState({
    full_name: '',
    phone: '',
    dob: '1998-01-01',
    email: '',
    photo: null as File | null,
    idProof: null as File | null
  })

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    dob: '',
    email: '',
    role: '',
    photo: null as File | null,
    idProof: null as File | null
  })

  // 3. News CMS State
  const [news, setNews] = useState<NewsRecord[]>(initialNews)
  const [editingNews, setEditingNews] = useState<NewsRecord | null>(null)
  const [newsForm, setNewsForm] = useState({
    title: '',
    titleTa: '',
    date: '',
    tag: 'Festivals',
    tagTa: '',
    desc: '',
    descTa: '',
    photo: null as File | null
  })

  useEffect(() => {
    setNews(initialNews)
  }, [initialNews])

  // 4. Gallery CMS State
  const [albums, setAlbums] = useState<AlbumRecord[]>(initialAlbums)
  const [editingAlbum, setEditingAlbum] = useState<AlbumRecord | null>(null)
  const [albumForm, setAlbumForm] = useState<{ title: string; titleTa: string; date: string; desc: string; descTa: string; photos: File[] }>({
    title: '',
    titleTa: '',
    date: '',
    desc: '',
    descTa: '',
    photos: []
  })
  const [managingAlbum, setManagingAlbum] = useState<AlbumRecord | null>(null)

  useEffect(() => {
    setAlbums(initialAlbums)
    if (managingAlbum) {
      const refreshed = initialAlbums.find(a => a.id === managingAlbum.id)
      if (refreshed) setManagingAlbum(refreshed)
    }
  }, [initialAlbums])

  // 5. Announcements CMS State
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(initialAnnouncements)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementRecord | null>(null)
  const [announcementForm, setAnnouncementForm] = useState({
    text: '',
    textTa: '',
    badge: 'New',
    badgeTa: 'புதியது',
    link: '',
    isMarquee: true,
    isActive: true,
    photo: null as File | null
  })

  useEffect(() => {
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])

  // 5. Committee CMS State
  const [committee, setCommittee] = useState<MemberRecord[]>(() =>
    initialCommitteeMembers
      .filter(m => m.status !== 'Inactive' && m.status !== 'Rejected')
      .map(m => ({
        ...m,
        dob: (m as any).date_of_birth || m.dob || '',
        role: m.role || 'Committee Member',
        role_ta: m.role_ta || '',
        email: m.email || '',
        bio: m.bio || '',
        bio_ta: m.bio_ta || '',
        display_order: m.display_order ?? 999999
      }))
      .sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
  )

  useEffect(() => {
    setCommittee(
      initialCommitteeMembers
        .filter(m => m.status !== 'Inactive' && m.status !== 'Rejected')
        .map(m => ({
          ...m,
          dob: (m as any).date_of_birth || m.dob || '',
          role: m.role || 'Committee Member',
          role_ta: m.role_ta || '',
          email: m.email || '',
          bio: m.bio || '',
          bio_ta: m.bio_ta || '',
          display_order: m.display_order ?? 999999
        }))
        .sort((a, b) => (a.display_order ?? 999999) - (b.display_order ?? 999999))
    )
  }, [initialCommitteeMembers])

  const [committeeForm, setCommitteeForm] = useState({
    full_name: '',
    phone: '',
    dob: '',
    email: '',
    role: '',
    roleTa: '',
    bio: '',
    bioTa: '',
    photo: null as File | null,
    idProof: null as File | null
  })
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<MemberRecord | null>(null)
  const [committeeEditForm, setCommitteeEditForm] = useState({
    full_name: '',
    phone: '',
    dob: '',
    email: '',
    role: '',
    roleTa: '',
    bio: '',
    bioTa: '',
    photo: null as File | null,
    idProof: null as File | null
  })
  const [savingCommittee, setSavingCommittee] = useState(false)
  const [downloadingCard, setDownloadingCard] = useState(false)

  const handleDownloadPdf = async (memberName: string) => {
    setDownloadingCard(true)
    try {
      const { generateIdCardPdf } = await import('@/lib/generateIdCardPdf')
      await generateIdCardPdf('membership-card-preview', memberName)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF.')
    } finally {
      setDownloadingCard(false)
    }
  }

  // Member Approvals Handlers
  const handleApprove = async (id: string) => {
    const res = await approveMemberAction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert('Approval failed: ' + res.error)
    }
  }

  const handleReject = async (id: string) => {
    const res = await rejectMemberAction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert('Rejection failed: ' + res.error)
    }
  }

  const handleMakeInactive = async (id: string) => {
    const res = await inactiveMemberAction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert('Failed to update status: ' + res.error)
    }
  }

  const handleReapprove = async (id: string) => {
    const res = await reapproveMemberAction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert('Reapproval failed: ' + res.error)
    }
  }

  // Create Volunteer Form Submission
  const handleAddVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.full_name || !addForm.phone || !addForm.dob) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('fullName', addForm.full_name)
      formData.append('phone', addForm.phone)
      formData.append('dateOfBirth', addForm.dob)
      if (addForm.email) formData.append('email', addForm.email)
      if (addForm.photo) formData.append('photo', addForm.photo)
      if (addForm.idProof) formData.append('idProof', addForm.idProof)

      const res = await adminAddVolunteerAction(formData)
      if (res.success) {
        setShowAddModal(false)
        setAddForm({ full_name: '', phone: '', dob: '1998-01-01', email: '', photo: null, idProof: null })
        router.refresh()
      } else {
        alert('Failed to add volunteer: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update Volunteer Profile Submission
  const handleEditVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVolunteer) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('fullName', editForm.full_name)
      formData.append('phone', editForm.phone)
      formData.append('dateOfBirth', editForm.dob)
      if (editForm.email) formData.append('email', editForm.email)
      formData.append('role', editForm.role || 'Member')
      if (editForm.photo) formData.append('photo', editForm.photo)
      if (editForm.idProof) formData.append('idProof', editForm.idProof)

      const res = await adminUpdateVolunteerAction(editingVolunteer.id, formData)
      if (res.success) {
        setEditingVolunteer(null)
        router.refresh()
      } else {
        alert('Failed to update volunteer: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Volunteer completely
  const handleDeleteVolunteer = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this volunteer record? This will also remove their uploaded photo and ID proof.')) {
      setIsRefreshing(true)
      try {
        const res = await adminDeleteVolunteerPermanentlyAction(id)
        if (res.success) {
          // Immediately update local UI state
          setVolunteers(prev => prev.filter(v => v.id !== id))
          triggerToast('Volunteer record successfully deleted! / உறுப்பினர் வெற்றிகரமாக நீக்கப்பட்டார்.')
          router.refresh()
        } else {
          alert('Failed to delete volunteer: ' + res.error)
        }
      } catch (err: any) {
        alert('Error: ' + err.message)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  // News CMS Handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsForm.title || !newsForm.desc) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (editingNews?.id) formData.append('id', editingNews.id)
      formData.append('title', newsForm.title)
      formData.append('titleTa', newsForm.titleTa)
      formData.append('tag', newsForm.tag)
      formData.append('tagTa', newsForm.tagTa)
      formData.append('summary', newsForm.desc)
      formData.append('summaryTa', newsForm.descTa)
      if (newsForm.date) formData.append('date', newsForm.date)
      if (newsForm.photo) formData.append('photo', newsForm.photo)

      const res = await saveNewsAction(formData)
      if (res.success) {
        setEditingNews(null)
        setNewsForm({ title: '', titleTa: '', date: '', tag: 'Festivals', tagTa: '', desc: '', descTa: '', photo: null })
        router.refresh()
      } else {
        alert('Failed to save news: ' + res.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEditNews = (art: NewsRecord) => {
    setEditingNews(art)
    setNewsForm({
      title: art.title,
      titleTa: art.title_ta || '',
      date: art.date || '',
      tag: art.tag || 'Festivals',
      tagTa: art.tag_ta || '',
      desc: art.summary || '',
      descTa: art.summary_ta || '',
      photo: null
    })
  }

  const handleDeleteNews = async (id: string) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      const res = await deleteNewsAction(id)
      if (res.success) {
        router.refresh()
      } else {
        alert('Failed to delete news: ' + res.error)
      }
    }
  }

  // Album CMS Handlers
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!albumForm.title) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (editingAlbum?.id) formData.append('id', editingAlbum.id)
      formData.append('title', albumForm.title)
      formData.append('titleTa', albumForm.titleTa)
      formData.append('description', albumForm.desc)
      if (albumForm.date) formData.append('date', albumForm.date)

      albumForm.photos.forEach(p => {
        formData.append('photos', p)
      })

      const res = await saveAlbumAction(formData)
      if (res.success) {
        setEditingAlbum(null)
        setAlbumForm({ title: '', titleTa: '', date: '', desc: '', descTa: '', photos: [] })
        router.refresh()
      } else {
        alert('Failed to save album: ' + res.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEditAlbum = (album: AlbumRecord) => {
    setEditingAlbum(album)
    setAlbumForm({
      title: album.title,
      titleTa: album.title_ta || '',
      date: album.date || '',
      desc: album.desc || '',
      descTa: album.desc_ta || '',
      photos: []
    })
  }

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('Are you sure you want to delete this entire album and its photos?')) {
      const res = await deleteAlbumAction(id)
      if (res.success) {
        router.refresh()
      } else {
        alert('Failed to delete album: ' + res.error)
      }
    }
  }

  const handleDeleteAlbumPhoto = async (photo: AlbumImage) => {
    if (!managingAlbum) return
    if (confirm('Are you sure you want to delete this photo from the album?')) {
      const res = await deleteAlbumPhotoAction(photo.id, photo.photo_path, managingAlbum.id)
      if (res.success) {
        router.refresh()
      } else {
        alert('Failed to delete photo: ' + res.error)
      }
    }
  }

  const handleAddPhotoToManagingAlbum = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!managingAlbum || !e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id', managingAlbum.id)
      formData.append('title', managingAlbum.title)
      files.forEach(f => formData.append('photos', f))

      const res = await saveAlbumAction(formData)
      if (res.success) {
        router.refresh()
      } else {
        alert('Failed to upload photo: ' + res.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Committee CMS Handlers
  const handleAddCommitteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!committeeForm.full_name || !committeeForm.phone || !committeeForm.dob || !committeeForm.role || !committeeForm.photo) return

    setSavingCommittee(true)
    try {
      const formData = new FormData()
      formData.append('fullName', committeeForm.full_name)
      formData.append('phone', committeeForm.phone)
      formData.append('dateOfBirth', committeeForm.dob)
      formData.append('email', committeeForm.email)
      formData.append('role', committeeForm.role)
      formData.append('roleTa', committeeForm.roleTa)
      formData.append('bio', committeeForm.bio)
      formData.append('bioTa', committeeForm.bioTa)
      formData.append('photo', committeeForm.photo)
      if (committeeForm.idProof) {
        formData.append('idProof', committeeForm.idProof)
      }

      const res = await addCommitteeMemberAction(formData)
      if (res.success) {
        alert('Committee member added successfully! ID card generated.')
        setCommitteeFieldDefaults()
        router.refresh()
      } else {
        alert('Failed to add committee member: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Failed to add committee member: ' + err.message)
    } finally {
      setSavingCommittee(false)
    }
  }

  const setCommitteeFieldDefaults = () => {
    setCommitteeForm({ full_name: '', phone: '', dob: '', email: '', role: '', roleTa: '', bio: '', bioTa: '', photo: null, idProof: null })
  }

  const handleStartEditCommitteeMember = (comm: MemberRecord) => {
    setEditingCommitteeMember(comm)
    setCommitteeEditForm({
      full_name: comm.full_name,
      phone: comm.phone,
      dob: comm.dob || '',
      email: comm.email || '',
      role: comm.role || '',
      roleTa: comm.role_ta || '',
      bio: comm.bio || '',
      bioTa: comm.bio_ta || '',
      photo: null,
      idProof: null
    })
  }

  const handleEditCommitteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCommitteeMember) return
    if (!committeeEditForm.full_name || !committeeEditForm.phone || !committeeEditForm.dob || !committeeEditForm.role) return

    setSavingCommittee(true)
    try {
      const formData = new FormData()
      formData.append('fullName', committeeEditForm.full_name)
      formData.append('phone', committeeEditForm.phone)
      formData.append('dateOfBirth', committeeEditForm.dob)
      formData.append('email', committeeEditForm.email)
      formData.append('role', committeeEditForm.role)
      formData.append('roleTa', committeeEditForm.roleTa)
      formData.append('bio', committeeEditForm.bio)
      formData.append('bioTa', committeeEditForm.bioTa)
      if (committeeEditForm.photo) {
        formData.append('photo', committeeEditForm.photo)
      }
      if (committeeEditForm.idProof) {
        formData.append('idProof', committeeEditForm.idProof)
      }

      const res = await updateCommitteeMemberAction(editingCommitteeMember.id, formData)
      if (res.success) {
        alert('Committee member updated successfully!')
        setEditingCommitteeMember(null)
        setCommitteeEditForm({ full_name: '', phone: '', dob: '', email: '', role: '', roleTa: '', bio: '', bioTa: '', photo: null, idProof: null })
        router.refresh()
      } else {
        alert('Failed to update committee member: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Failed to update committee member: ' + err.message)
    } finally {
      setSavingCommittee(false)
    }
  }

  const handleDeleteCommitteeMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this committee member?')) {
      const res = await deleteCommitteeMemberAction(id)
      if (res.success) {
        setCommittee(committee.filter(c => c.id !== id))
        router.refresh()
      } else {
        alert('Failed to delete committee member: ' + (res.error || 'Unknown error'))
      }
    }
  }

  // Announcements CMS Handlers
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementForm.text) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (editingAnnouncement?.id) formData.append('id', editingAnnouncement.id)
      formData.append('text', announcementForm.text)
      formData.append('textTa', announcementForm.textTa)
      formData.append('badge', announcementForm.badge)
      formData.append('badgeTa', announcementForm.badgeTa)
      formData.append('link', announcementForm.link)
      formData.append('isMarquee', String(announcementForm.isMarquee))
      formData.append('isActive', String(announcementForm.isActive))
      if (announcementForm.photo) {
        formData.append('photo', announcementForm.photo)
      }

      const res = await saveAnnouncementAction(formData)
      if (res.success) {
        setEditingAnnouncement(null)
        setAnnouncementForm({ text: '', textTa: '', badge: 'New', badgeTa: 'புதியது', link: '', isMarquee: true, isActive: true, photo: null })
        router.refresh()
      } else {
        alert('Failed to save announcement: ' + res.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEditAnnouncement = (ann: AnnouncementRecord) => {
    setEditingAnnouncement(ann)
    setAnnouncementForm({
      text: ann.text,
      textTa: ann.text_ta || '',
      badge: ann.badge || 'New',
      badgeTa: ann.badge_ta || 'புதியது',
      link: ann.link || '',
      isMarquee: ann.is_marquee !== false,
      isActive: ann.is_active !== false,
      photo: null
    })
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const res = await deleteAnnouncementAction(id)
      if (res.success) {
        router.refresh()
      } else {
        alert('Failed to delete announcement: ' + res.error)
      }
    }
  }

  // Committee Member Re-ordering Handler
  const handleMoveCommitteeOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= committee.length) return

    const newCommittee = [...committee]
    const [movedItem] = newCommittee.splice(index, 1)
    newCommittee.splice(targetIndex, 0, movedItem)

    // Re-index display_order locally
    const reordered = newCommittee.map((item, idx) => ({
      ...item,
      display_order: idx
    }))

    setCommittee(reordered)

    try {
      const orderedIds = reordered.map(item => item.id)
      await updateCommitteeBatchOrderAction(orderedIds)
      router.refresh()
    } catch (err: any) {
      console.error('Error updating order:', err)
    }
  }

  // Global Settings State & Handler
  const [settingsForm, setSettingsForm] = useState({
    phone: '+91 90030 45141',
    email: 'namathuthirukovilseithigal@gmail.com',
    address: 'No:15, 2nd Street, Chandrasekar Nagar, Manali Salai, Kodungaiyur, Chennai - 600 118'
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const formData = new FormData()
      formData.append('phone', settingsForm.phone)
      formData.append('email', settingsForm.email)
      formData.append('address', settingsForm.address)

      const res = await saveGlobalSettingsAction(formData)
      if (res.success) {
        alert('Settings saved successfully and updated across portal!')
        router.refresh()
      } else {
        alert('Failed to save settings: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error saving settings: ' + err.message)
    } finally {
      setSavingSettings(false)
    }
  }

  // Search and Sort Filtering logic for Volunteers List (Only approved/active, NOT inactive)
  const filteredVolunteers = volunteers
    .filter(v => v.status === 'Approved')
    .filter(v => {
      const matchSearch = searchQuery.trim().toLowerCase()
      if (!matchSearch) return true
      return v.full_name.toLowerCase().includes(matchSearch) || v.phone.includes(matchSearch)
    })
    .sort((a, b) => {
      if (sortKey === 'name') {
        return a.full_name.localeCompare(b.full_name)
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Filter pending approvals
  const pendingApprovals = volunteers.filter(v => v.status === 'Pending')

  return (
    <div className="space-y-6 relative">

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Refresh / Action Loading Screen Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[99998] bg-black/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-3 max-w-xs text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#8b0000]/20 border-t-[#d4af37] animate-spin"></div>
            <p className="text-xs font-bold text-maroon uppercase tracking-wider font-heading">
              Updating Database...
            </p>
            <p className="text-[11px] text-gray-500">
              விவரங்கள் புதுப்பிக்கப்படுகின்றன...
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          ADMIN TAB NAVIGATION CONTROLS (Moved here from the Header)
          ======================================================== */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-center items-center h-12 text-[11px] xl:text-xs font-bold bg-[#fcfcfc] border-b border-gray-150">
          <nav className="flex items-center gap-1 sm:gap-2 h-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'volunteers'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <Users className="h-3.5 w-3.5 text-gold-dark" />
              <span>Volunteers / உறுப்பினர்கள்</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'news'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <Newspaper className="h-3.5 w-3.5 text-gold-dark" />
              <span>News Config / செய்திகள்</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'gallery'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-gold-dark" />
              <span>Gallery Config / படங்கள்</span>
            </button>
            <button
              onClick={() => setActiveTab('committee')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'committee'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <UserPlus className="h-3.5 w-3.5 text-gold-dark" />
              <span>Committee Config / பொறுப்பாளர்கள்</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'announcements'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <Bell className="h-3.5 w-3.5 text-gold-dark" />
              <span>Announcements / அறிவிப்புகள்</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-4 h-full flex items-center gap-1 border-b-2 transition whitespace-nowrap cursor-pointer ${activeTab === 'settings'
                ? 'border-maroon text-maroon bg-slate-50/50'
                : 'border-transparent text-gray-500 hover:text-maroon hover:border-gray-200'
                }`}
            >
              <Settings className="h-3.5 w-3.5 text-gold-dark" />
              <span>Settings / அமைப்புகள்</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Tab View Port */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">

        {/* ========================================================
            TAB 1: VOLUNTEERS INTERACTIVE WORKSPACE
            ======================================================== */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6">

            {/* Volunteers Sub-Tabs Header */}
            <div className="flex border-b border-gray-200 pb-px gap-4">
              <button
                onClick={() => setVolSubTab('pending')}
                className={`pb-2.5 px-4 font-heading text-xs font-bold transition border-b-2 cursor-pointer ${volSubTab === 'pending'
                  ? 'border-maroon text-maroon'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Pending Approvals ({pendingApprovals.length})
              </button>
              <button
                onClick={() => setVolSubTab('list')}
                className={`pb-2.5 px-4 font-heading text-xs font-bold transition border-b-2 cursor-pointer ${volSubTab === 'list'
                  ? 'border-maroon text-maroon'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                Volunteers List ({filteredVolunteers.length})
              </button>
            </div>

            {/* VOLUNTEER SUB-TAB A: PENDING APPROVALS */}
            {volSubTab === 'pending' && (
              <div className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No pending volunteer registrations found.</p>
                ) : (
                  <div className="grid gap-6">
                    {pendingApprovals.map((member) => (
                      <div key={member.id} className="border border-gray-150 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow bg-white transition duration-200">
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={member.photoUrl} alt="" className="w-12 h-16 object-cover rounded border border-gold" />
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-gray-900 text-sm">{member.full_name}</h3>
                            <p className="text-xs text-gray-500 font-bold">Phone: {member.phone} | DOB: {member.dob}</p>
                            <p className="text-[10px] text-gray-400 font-mono">DB ID: {member.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {member.idProofUrl && (
                            <button
                              onClick={() => setPreviewIdProof(member)}
                              className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-gray-700 px-3 py-1.5 rounded transition font-bold border border-gray-200 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-gold-dark" /> View ID Proof
                            </button>
                          )}
                          <button onClick={() => handleReject(member.id)} className="text-xs text-rose-700 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded font-semibold cursor-pointer">
                            Reject
                          </button>
                          <button onClick={() => handleApprove(member.id)} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold cursor-pointer shadow-sm">
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VOLUNTEER SUB-TAB B: VOLUNTEERS LIST */}
            {volSubTab === 'list' && (
              <div className="space-y-4">

                {/* Search, Sort and Add controls toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-gray-150">
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-grow sm:w-60">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-gray-250 bg-white rounded-lg text-xs focus:border-maroon focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                      <select
                        value={sortKey}
                        onChange={(e: any) => setSortKey(e.target.value)}
                        className="border border-gray-250 bg-white rounded-lg px-2 py-1.5 text-xs text-gray-700 font-bold focus:border-maroon focus:outline-none"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 bg-maroon text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-maroon-dark transition shadow cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4" /> Add Volunteer
                  </button>
                </div>

                {/* Volunteers list table */}
                {filteredVolunteers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No approved volunteers match criteria.</p>
                ) : (
                  <div className="overflow-x-auto border border-gray-150 rounded-xl shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                          <th className="p-3">Photo</th>
                          <th className="p-3">Member Details</th>
                          <th className="p-3">Designation / Role</th>
                          <th className="p-3 text-center">ID Card Actions</th>
                          <th className="p-3 text-right">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                        {filteredVolunteers.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/40 transition">
                            <td className="p-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.photoUrl} alt="" className="w-10 h-12 object-cover rounded border border-gold" />
                            </td>
                            <td className="p-3 space-y-0.5">
                              <div className="font-bold text-gray-900">{m.full_name}</div>
                              <div className="text-[10px] text-gray-400">DOB: {m.dob} | Phone: {m.phone}</div>
                              <div className="text-[10px] text-emerald-800 font-mono font-bold">ID: {m.membership_no}</div>
                            </td>
                            <td className="p-3">
                              <span className="inline-block bg-[#f0ece2] text-maroon text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                                {m.role}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="inline-flex gap-2 justify-center w-full">
                                <button
                                  onClick={() => setPreviewIdCard(m)}
                                  className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-300 py-1 px-2.5 rounded font-bold transition cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" /> Preview ID Card
                                </button>
                                <button
                                  onClick={() => setPreviewIdProof(m)}
                                  className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-300 py-1 px-2.5 rounded font-bold transition cursor-pointer"
                                >
                                  <FileText className="h-3 w-3 text-gold-dark" /> Preview ID Proof
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setEditingVolunteer(m)
                                    setEditForm({
                                      full_name: m.full_name,
                                      phone: m.phone,
                                      dob: m.dob || '',
                                      email: m.email || '',
                                      role: m.role || 'member',
                                      photo: null,
                                      idProof: null
                                    })
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-gold-dark transition cursor-pointer"
                                  title="Edit Volunteer"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                {/* Delete button now sets user to Inactive status directly */}
                                <button
                                  onClick={() => handleMakeInactive(m.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete Volunteer (Sets to Inactive)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 2: NEWS CMS CONFIGURATOR
            ======================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-150 pb-2 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-gold-dark" /> News Configurator
            </h2>

            <form onSubmit={handleSaveNews} className="space-y-4 p-4 border border-gold-dark/20 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5 uppercase tracking-wider">
                <Plus className="h-4 w-4" /> {editingNews ? 'Edit Article Details' : 'Add New Article'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Article Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="Enter article title in English"
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Article Title (Tamil) - விருப்பத்தேர்வு</label>
                  <input
                    type="text"
                    value={newsForm.titleTa}
                    onChange={(e) => setNewsForm({ ...newsForm, titleTa: e.target.value })}
                    placeholder="தமிழில் தலைப்பு"
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category Tag (e.g. Festivals, Social Service)</label>
                  <input
                    type="text"
                    value={newsForm.tag}
                    onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none text-gray-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Summary (English) *</label>
                  <textarea
                    rows={3}
                    required
                    value={newsForm.desc}
                    onChange={(e) => setNewsForm({ ...newsForm, desc: e.target.value })}
                    placeholder="Write summary in English..."
                    className="w-full px-3 py-2 border border-gray-255 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Summary (Tamil) - விருப்பத்தேர்வு</label>
                  <textarea
                    rows={3}
                    value={newsForm.descTa}
                    onChange={(e) => setNewsForm({ ...newsForm, descTa: e.target.value })}
                    placeholder="தமிழில் விவரம்..."
                    className="w-full px-3 py-2 border border-gray-255 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Photo Uploader */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cover Photo {editingNews ? '(Leave blank to keep existing)' : '(Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewsForm({ ...newsForm, photo: e.target.files?.[0] || null })}
                  className="text-xs text-slate-500 file:bg-maroon file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isSubmitting} className="bg-maroon text-white font-bold py-2.5 px-5 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (editingNews ? 'Update Article' : 'Save & Publish News')}
                </button>
                {editingNews && (
                  <button
                    type="button"
                    onClick={() => { setEditingNews(null); setNewsForm({ title: '', titleTa: '', date: '', tag: 'Festivals', tagTa: '', desc: '', descTa: '', photo: null }); }}
                    className="border border-gray-300 text-gray-600 font-bold py-2.5 px-5 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-700">Live Articles ({news.length})</h3>
              {news.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No news articles published yet.</p>
              ) : (
                news.map(art => (
                  <div key={art.id} className="p-4 border border-gray-150 rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow transition duration-200">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900">{art.title}</h4>
                      {art.title_ta && <p className="text-xs text-gray-600 font-medium">{art.title_ta}</p>}
                      <p className="text-[10px] text-gray-400">Date: {art.date} | Tag: <span className="font-semibold text-gray-600">{art.tag || 'General'}</span></p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleStartEditNews(art)} className="p-1.5 text-gray-500 hover:text-gold-dark transition cursor-pointer" title="Edit Article"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteNews(art.id)} className="p-1.5 text-gray-500 hover:text-rose-600 transition cursor-pointer" title="Delete Article"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: GALLERY CONFIGURATOR
            ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {managingAlbum ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-gray-250 pb-3">
                  <button
                    onClick={() => setManagingAlbum(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon hover:underline cursor-pointer"
                  >
                    ← Back to Albums list
                  </button>
                  <span className="text-xs text-gray-500 font-bold">Album: {managingAlbum.title}</span>
                </div>

                <div className="p-5 border border-gold/25 bg-white rounded-lg space-y-3">
                  <h3 className="font-heading font-bold text-xs text-maroon-dark uppercase">Add Photos to Album</h3>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddPhotoToManagingAlbum}
                    className="text-xs text-slate-500 file:bg-maroon file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded cursor-pointer"
                  />
                  <p className="text-[10px] text-gray-400 italic">Select one or multiple images to upload directly to Supabase Storage.</p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-700 mb-3">Album Photos ({managingAlbum.images.length})</h3>
                  {managingAlbum.images.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No photos inside this album. Add photos above.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {managingAlbum.images.map((imgObj: AlbumImage) => (
                        <div key={imgObj.id} className="aspect-square bg-slate-50 border border-gray-150 rounded-lg relative overflow-hidden group shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgObj.url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleDeleteAlbumPhoto(imgObj)}
                            className="absolute top-2 right-2 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-700 transition opacity-0 group-hover:opacity-100 shadow cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-150 pb-2 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gold-dark" /> Gallery Configurator
                </h2>

                <form onSubmit={handleSaveAlbum} className="space-y-4 p-4 border border-gold-dark/20 bg-white rounded-lg shadow-sm">
                  <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5 uppercase">
                    <Plus className="h-4 w-4" /> {editingAlbum ? 'Edit Album Details' : 'Create New Event Album'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Album Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={albumForm.title}
                        onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                        placeholder="e.g. Consecration Ceremony"
                        className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Album Title (Tamil) - விருப்பத்தேர்வு</label>
                      <input
                        type="text"
                        value={albumForm.titleTa}
                        onChange={(e) => setAlbumForm({ ...albumForm, titleTa: e.target.value })}
                        placeholder="தமிழில் தலைப்பு"
                        className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Event Date</label>
                      <input
                        type="date"
                        value={albumForm.date}
                        onChange={(e) => setAlbumForm({ ...albumForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none text-gray-700 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Event Description (English)</label>
                      <textarea
                        rows={3}
                        value={albumForm.desc}
                        onChange={(e) => setAlbumForm({ ...albumForm, desc: e.target.value })}
                        placeholder="Write description in English..."
                        className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Event Description (Tamil) - நிகழ்வு விவரம்</label>
                      <textarea
                        rows={3}
                        value={albumForm.descTa}
                        onChange={(e) => setAlbumForm({ ...albumForm, descTa: e.target.value })}
                        placeholder="நிகழ்வு விவரத்தை தமிழில் எழுதுங்கள்..."
                        className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Upload multiple images at once */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {editingAlbum ? 'Add More Photos to Album' : 'Select Photos for Album *'}
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || [])
                        setAlbumForm({ ...albumForm, photos: newFiles })
                      }}
                      className="text-xs text-slate-500 file:bg-maroon file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={isSubmitting} className="bg-maroon text-white font-bold py-2.5 px-5 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : (editingAlbum ? 'Update Album Details' : 'Create Album')}
                    </button>
                    {editingAlbum && (
                      <button
                        type="button"
                        onClick={() => { setEditingAlbum(null); setAlbumForm({ title: '', titleTa: '', date: '', desc: '', descTa: '', photos: [] }); }}
                        className="border border-gray-300 text-gray-600 font-bold py-2.5 px-5 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-700">Active Albums ({albums.length})</h3>
                  {albums.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No albums created yet.</p>
                  ) : (
                    albums.map(al => (
                      <div key={al.id} className="p-4 border border-gray-150 rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow transition duration-200">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{al.title}</h4>
                          {al.title_ta && <p className="text-xs text-gray-600 font-medium">{al.title_ta}</p>}
                          <p className="text-[10px] text-gray-400">Date: {al.date} | Photos: {al.images?.length || 0}</p>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <button
                            onClick={() => setManagingAlbum(al)}
                            className="text-xs bg-slate-100 text-gray-700 border border-gray-300 hover:bg-slate-200 px-3 py-1 rounded font-bold cursor-pointer transition"
                          >
                            Manage Photos ({al.images?.length || 0})
                          </button>
                          <button onClick={() => handleStartEditAlbum(al)} className="p-1.5 text-gray-500 hover:text-gold-dark transition cursor-pointer" title="Edit Album"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteAlbum(al.id)} className="p-1.5 text-gray-500 hover:text-rose-600 transition cursor-pointer" title="Delete Album"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: COMMITTEE CONFIGURATOR
            ======================================================== */}
        {activeTab === 'committee' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-150 pb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold-dark" /> Committee Configurator
            </h2>

            {/* ── ADD COMMITTEE MEMBER FORM ── */}
            {!editingCommitteeMember && (
              <form onSubmit={handleAddCommitteeSubmit} className="space-y-4 p-4 border border-gold-dark/20 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5 uppercase">
                  <Plus className="h-4 w-4" /> Add Committee Member
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={committeeForm.full_name}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, full_name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role / Designation (English) *</label>
                    <input
                      type="text"
                      required
                      value={committeeForm.role}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, role: e.target.value })}
                      placeholder="e.g. State Secretary"
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role / பொறுப்பு (Tamil)</label>
                    <input
                      type="text"
                      value={committeeForm.roleTa}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, roleTa: e.target.value })}
                      placeholder="உதாரணம்: மாநில செயலாளர்"
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={committeeForm.phone}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={committeeForm.dob}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none text-gray-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={committeeForm.email}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, email: e.target.value })}
                      placeholder="committee@htpf.org"
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Biography / விவரக்குறிப்பு (English)</label>
                    <textarea
                      rows={3}
                      value={committeeForm.bio}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, bio: e.target.value })}
                      placeholder="e.g. Managing and coordinating temple protection initiatives across Tamil Nadu."
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Biography / விவரக்குறிப்பு (Tamil)</label>
                    <textarea
                      rows={3}
                      value={committeeForm.bioTa}
                      onChange={(e) => setCommitteeForm({ ...committeeForm, bioTa: e.target.value })}
                      placeholder="உதாரணம்: தமிழ்நாடு முழுவதும் திருக்கோயில் பாதுகாப்பு பணிகளை ஒருங்கிணைத்து வழிநடத்துகிறார்."
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Profile Photo *</label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => setCommitteeForm({ ...committeeForm, photo: e.target.files?.[0] || null })}
                      className="text-[10px] text-slate-500 file:bg-slate-100 file:border-0 file:py-1 file:px-2 file:rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ID Proof (Optional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setCommitteeForm({ ...committeeForm, idProof: e.target.files?.[0] || null })}
                      className="text-[10px] text-slate-500 file:bg-slate-100 file:border-0 file:py-1 file:px-2 file:rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={savingCommittee} className="bg-maroon text-white font-bold py-2.5 px-5 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                    {savingCommittee ? 'Saving...' : 'Add Committee Member & Generate ID'}
                  </button>
                </div>
              </form>
            )}

            {/* ── EDIT COMMITTEE MEMBER FORM ── */}
            {editingCommitteeMember && (
              <form onSubmit={handleEditCommitteeSubmit} className="space-y-4 p-4 border border-gold-dark/20 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5 uppercase">
                  <Edit className="h-4 w-4" /> Edit Committee Member
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={committeeEditForm.full_name}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role / Designation (English) *</label>
                    <input
                      type="text"
                      required
                      value={committeeEditForm.role}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role / பொறுப்பு (Tamil)</label>
                    <input
                      type="text"
                      value={committeeEditForm.roleTa}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, roleTa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={committeeEditForm.phone}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={committeeEditForm.dob}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none text-gray-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={committeeEditForm.email}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Biography / விவரக்குறிப்பு (English)</label>
                    <textarea
                      rows={3}
                      value={committeeEditForm.bio}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, bio: e.target.value })}
                      placeholder="e.g. Managing and coordinating temple protection initiatives across Tamil Nadu."
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Biography / விவரக்குறிப்பு (Tamil)</label>
                    <textarea
                      rows={3}
                      value={committeeEditForm.bioTa}
                      onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, bioTa: e.target.value })}
                      placeholder="உதாரணம்: தமிழ்நாடு முழுவதும் திருக்கோயில் பாதுகாப்பு பணிகளை ஒருங்கிணைத்து வழிநடத்துகிறார்."
                      className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded space-y-3">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Update File Assets</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">New Profile Photo (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, photo: e.target.files?.[0] || null })}
                        className="text-[9px] text-slate-500 file:bg-white file:border file:py-1 file:px-1.5 file:rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">New ID Proof (Optional)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setCommitteeEditForm({ ...committeeEditForm, idProof: e.target.files?.[0] || null })}
                        className="text-[9px] text-slate-500 file:bg-white file:border file:py-1 file:px-1.5 file:rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">
                    Note: Uploading new assets deletes the old images inside Supabase Storage dynamically.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={savingCommittee} className="bg-maroon text-white font-bold py-2.5 px-5 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                    {savingCommittee ? 'Saving...' : 'Update Committee Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingCommitteeMember(null); setCommitteeEditForm({ full_name: '', phone: '', dob: '', email: '', role: '', roleTa: '', bio: '', bioTa: '', photo: null, idProof: null }); }}
                    className="border border-gray-300 text-gray-600 font-bold py-2.5 px-5 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* ── COMMITTEE MEMBERS LIST ── */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-700">Registered Committee Members ({committee.length})</h3>
              {committee.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  No committee members yet. Add the first committee member above.
                </p>
              ) : (
                <div className="overflow-x-auto border border-gray-150 rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                        <th className="p-3 text-center w-16">Order</th>
                        <th className="p-3">Photo</th>
                        <th className="p-3">Member Details</th>
                        <th className="p-3">Designation / Role</th>
                        <th className="p-3 text-center">ID Card Actions</th>
                        <th className="p-3 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                      {committee.map((comm, idx) => (
                        <tr key={comm.id} className="hover:bg-slate-50/40 transition">
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveCommitteeOrder(idx, 'up')}
                                className="p-1 rounded hover:bg-slate-200 text-gray-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
                              <button
                                type="button"
                                disabled={idx === committee.length - 1}
                                onClick={() => handleMoveCommitteeOrder(idx, 'down')}
                                className="p-1 rounded hover:bg-slate-200 text-gray-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={comm.photoUrl || '/logo.jpeg'} alt="" className="w-10 h-12 object-cover rounded border border-gold" />
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="font-bold text-gray-900">{comm.full_name}</div>
                            <div className="text-[10px] text-gray-400">DOB: {comm.dob} | Phone: {comm.phone}</div>
                            <div className="text-[10px] text-emerald-800 font-mono font-bold">ID: {comm.membership_no}</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-block bg-[#f0ece2] text-maroon text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                              {comm.role}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex gap-2 justify-center w-full">
                              <button
                                onClick={() => setPreviewIdCard(comm)}
                                className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-gray-700 hover:bg-slate-200 border border-gray-300 py-1 px-2.5 rounded font-bold transition cursor-pointer"
                              >
                                <Eye className="h-3 w-3" /> Preview ID Card
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(comm.full_name)}
                                disabled={downloadingCard}
                                className="inline-flex items-center gap-1 text-[11px] bg-maroon text-white hover:bg-maroon-dark border border-maroon py-1 px-2.5 rounded font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                <Download className="h-3 w-3" /> Download PDF
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-2 items-center">
                              <button
                                onClick={() => handleStartEditCommitteeMember(comm)}
                                className="p-1.5 text-gray-500 hover:text-gold-dark transition cursor-pointer"
                                title="Edit Committee Member"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCommitteeMember(comm.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                                title="Delete Committee Member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: ANNOUNCEMENTS CONFIGURATOR
            ======================================================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-150 pb-2 flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold-dark" /> Announcements Configurator
            </h2>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 p-4 border border-gold-dark/20 bg-white rounded-lg shadow-sm">
              <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5 uppercase tracking-wider">
                <Plus className="h-4 w-4" /> {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Announcement Text (English) *</label>
                  <textarea
                    rows={3}
                    required
                    value={announcementForm.text}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                    placeholder="Enter announcement text in English..."
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Announcement Text (Tamil) - அறிவிப்பு உரை</label>
                  <textarea
                    rows={3}
                    value={announcementForm.textTa}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, textTa: e.target.value })}
                    placeholder="அறிவிப்பு உரையை தமிழில் எழுதவும்..."
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag (English)</label>
                  <input
                    type="text"
                    value={announcementForm.badge}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, badge: e.target.value })}
                    placeholder="e.g. New, Event, Urgent"
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag (Tamil)</label>
                  <input
                    type="text"
                    value={announcementForm.badgeTa}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, badgeTa: e.target.value })}
                    placeholder="உதாரணம்: புதியது, நிகழ்வு"
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Link URL (Optional)</label>
                  <input
                    type="text"
                    value={announcementForm.link}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                    placeholder="e.g. /register or https://..."
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs focus:border-maroon focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Announcement Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, photo: e.target.files?.[0] || null })}
                    className="text-xs text-slate-500 file:bg-maroon file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.isMarquee}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, isMarquee: e.target.checked })}
                      className="rounded text-maroon focus:ring-maroon h-4 w-4"
                    />
                    <span>Show in Top Header Marquee</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.isActive}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
                      className="rounded text-maroon focus:ring-maroon h-4 w-4"
                    />
                    <span>Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isSubmitting} className="bg-maroon text-white font-bold py-2.5 px-5 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (editingAnnouncement ? 'Update Announcement' : 'Save & Publish Announcement')}
                </button>
                {editingAnnouncement && (
                  <button
                    type="button"
                    onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ text: '', textTa: '', badge: 'New', badgeTa: 'புதியது', link: '', isMarquee: true, isActive: true, photo: null }); }}
                    className="border border-gray-300 text-gray-600 font-bold py-2.5 px-5 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-700">Live Announcements ({announcements.length})</h3>
              {announcements.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No announcements created yet.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 border border-gray-150 rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow transition duration-200">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-[#f0ece2] text-maroon text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">
                          {ann.badge || 'New'}
                        </span>
                        {ann.badge_ta && (
                          <span className="inline-block bg-slate-100 text-gray-600 text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">
                            {ann.badge_ta}
                          </span>
                        )}
                        {ann.is_marquee && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Marquee
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug">{ann.text}</h4>
                      {ann.text_ta && <p className="text-xs text-gray-600 font-medium">{ann.text_ta}</p>}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button onClick={() => handleStartEditAnnouncement(ann)} className="p-1.5 text-gray-500 hover:text-gold-dark transition cursor-pointer" title="Edit Announcement"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-1.5 text-gray-500 hover:text-rose-600 transition cursor-pointer" title="Delete Announcement"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: GLOBAL SETTINGS CMS
            ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading text-maroon border-b border-gray-150 pb-2 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gold-dark" /> Global Site Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Telephone / தொலைபேசி</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs font-semibold text-gray-700 focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Primary Email Address / மின்னஞ்சல்</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs font-semibold text-gray-700 focus:border-maroon focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Office Address / அலுவலக முகவரி</label>
                <textarea
                  rows={3}
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-250 bg-white rounded text-xs font-semibold text-gray-700 focus:border-maroon focus:outline-none"
                />
              </div>

              <button type="submit" disabled={savingSettings} className="bg-maroon text-white font-bold py-2.5 px-6 rounded text-xs hover:bg-maroon-dark transition cursor-pointer shadow disabled:opacity-50">
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================
          MODAL 1: ADD VOLUNTEER FORM
          ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            <div className="bg-maroon text-gold font-heading font-bold text-sm py-4 px-6 border-b border-gold-dark flex justify-between items-center">
              <span>Add New Volunteer Member</span>
              <button onClick={() => setShowAddModal(false)} className="text-gold hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddVolunteerSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-250 rounded text-xs focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">DOB *</label>
                  <input
                    type="date"
                    required
                    value={addForm.dob}
                    onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs focus:border-maroon focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="volunteer@htpf.org"
                  className="w-full px-3 py-2 border border-gray-250 rounded text-xs focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Profile Photo *</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setAddForm({ ...addForm, photo: e.target.files?.[0] || null })}
                    className="text-[10px] text-slate-500 file:bg-slate-100 file:border-0 file:py-1 file:px-2 file:rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ID Proof *</label>
                  <input
                    type="file"
                    required
                    accept="image/*,application/pdf"
                    onChange={(e) => setAddForm({ ...addForm, idProof: e.target.files?.[0] || null })}
                    className="text-[10px] text-slate-500 file:bg-slate-100 file:border-0 file:py-1 file:px-2 file:rounded cursor-pointer"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-maroon text-white font-bold py-2.5 rounded hover:bg-maroon-dark transition text-xs shadow-md cursor-pointer">
                Create Approved Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT VOLUNTEER PROFILE
          ======================================================== */}
      {editingVolunteer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            <div className="bg-maroon text-gold font-heading font-bold text-sm py-4 px-6 border-b border-gold-dark flex justify-between items-center">
              <span>Edit Member: {editingVolunteer.full_name}</span>
              <button onClick={() => setEditingVolunteer(null)} className="text-gold hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditVolunteerSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-250 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">DOB *</label>
                  <input
                    type="date"
                    required
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Role Designation *</label>
                  <input
                    type="text"
                    required
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    placeholder="e.g. member, District Coordinator"
                    className="w-full px-3 py-2 border border-gray-250 rounded text-xs focus:border-maroon focus:outline-none text-maroon font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded space-y-3">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Update File Assets</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">New Profile Pic (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditForm({ ...editForm, photo: e.target.files?.[0] || null })}
                      className="text-[9px] text-slate-500 file:bg-white file:border file:py-1 file:px-1.5 file:rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">New ID Proof (Optional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setEditForm({ ...editForm, idProof: e.target.files?.[0] || null })}
                      className="text-[9px] text-slate-500 file:bg-white file:border file:py-1 file:px-1.5 file:rounded cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 italic">
                  Note: Uploading new assets deletes the old images inside Supabase Storage dynamically.
                </p>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="w-full bg-maroon text-white font-bold py-2.5 rounded hover:bg-maroon-dark transition text-xs shadow cursor-pointer">
                  Update Member Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVolunteer(null)}
                  className="w-1/3 border border-gray-300 text-gray-600 font-bold py-2.5 rounded text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ID CARD PREVIEW & SIMULATED PDF DOWNLOAD
          ======================================================== */}
      {previewIdCard && (() => {
        const vercelUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${vercelUrl}/member/${previewIdCard.id}`)}`

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full overflow-hidden p-6 relative">
              <button
                onClick={() => setPreviewIdCard(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-gray-500 cursor-pointer z-50"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Template-as-background ID Card */}
              <div
                id="membership-card-preview"
                className="relative select-none shadow-xl overflow-hidden mx-auto mt-4"
                style={{
                  width: '280px',
                  height: '400px',
                  backgroundImage: 'url(/id-card-template.jpg)',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                {/* ── PROFILE PHOTO ────────────────────────────────────── */}
                <div
                  className="absolute overflow-hidden rounded-2xl"
                  style={{ left: '70px', top: '132px', width: '143px', height: '160px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewIdCard.photoUrl || '/logo.jpeg'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* ── MEMBER NAME ──────────────────────────────────────── */}
                <div
                  className="absolute w-full px-3 text-center"
                  style={{ top: '296px' }}
                >
                  <span className="font-bold text-[#8b0000] leading-none uppercase inline-block font-heading tracking-wide"
                    style={{ fontSize: "10.5px" }}
                  >
                    {previewIdCard.full_name}
                  </span>
                </div>

                {/* ── ROLE / DESIGNATION ───────────────────────────────── */}
                <div
                  className="absolute w-full px-4 text-center"
                  style={{ top: '311px' }}
                >
                  <span
                    className="text-gray-700 font-bold uppercase tracking-wider inline-block leading-none"
                    style={{ fontSize: '8px' }}
                  >
                    {previewIdCard.role || 'Member'}
                  </span>
                </div>

                {/* ── UNIQUE MEMBER ID BADGE ──────────────────────────── */}
                {previewIdCard.membership_no && (
                  <div
                    className="absolute w-full px-4 text-center"
                    style={{ top: '325px' }}
                  >
                    <span
                      className="inline-block  text-[#7a0000] font-mono font-bold px-2 py-0.5 tracking-wider shadow-xs"
                      style={{ fontSize: '7px' }}
                    >
                      ID: {previewIdCard.membership_no}
                    </span>
                  </div>
                )}

                {/* ── QR CODE ──────────────────────────────────────────── */}
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

              {/* Real PDF downloader button */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleDownloadPdf(previewIdCard.full_name)}
                  disabled={downloadingCard}
                  className="w-full bg-maroon text-white font-bold py-2.5 rounded-lg hover:bg-maroon-dark transition text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloadingCard ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download PDF Card
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ========================================================
          MODAL 4: ID PROOF DOCUMENT PREVIEW MODAL
          ======================================================== */}
      {previewIdProof && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6 relative">
            <button
              onClick={() => setPreviewIdProof(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-gray-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading font-bold text-sm text-maroon border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">
              Preview Government ID Proof
            </h3>

            {/* High-Fidelity Verified ID Card Mockup */}
            <div className="border border-emerald-500/30 p-5 rounded-lg bg-emerald-50/15 flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-inner min-h-[260px]">

              {/* Saffron banner background */}
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />

              <ShieldCheck className="h-10 w-10 text-emerald-600 animate-pulse" />

              <div className="text-center space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                  Verified Government ID Document
                </span>
                <p className="text-xs text-slate-500 font-semibold mt-1">Status: Active Verification Success</p>
              </div>

              {/* Member details mock proof details */}
              <div className="w-full bg-white border border-gray-200 rounded p-3 text-left space-y-1.5 text-[11px] font-medium text-gray-700">
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Applicant Name</span>
                  <span className="font-bold text-gray-900">{previewIdProof.full_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase">Date of Birth</span>
                    <span className="font-bold text-gray-900">{previewIdProof.dob}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase">Contact Phone</span>
                    <span className="font-bold text-gray-900">{previewIdProof.phone}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Supabase File Storage Path</span>
                  <span className="font-mono text-[9px] text-slate-500 truncate block">{previewIdProof.id_proof_path}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <a
                href={previewIdProof.idProofUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#4d0708] hover:bg-[#3d0607] text-gold-light hover:text-white font-bold py-2.5 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer border border-gold/15"
              >
                <Eye className="h-4 w-4" /> Open Original Uploaded Document
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
