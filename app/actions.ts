'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface SubmitResult {
  success: boolean
  error?: string
  memberId?: string
}

// 1. Server Action: Submit Volunteer Registration Form
export async function submitRegistration(formData: FormData): Promise<SubmitResult> {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const photoFile = formData.get('photo') as File
    const idProofFile = formData.get('idProof') as File

    // Backend Input Validation
    if (!fullName || !phone || !dateOfBirth || !photoFile || !idProofFile) {
      return { success: false, error: 'All fields are required.' }
    }

    if (photoFile.size === 0 || idProofFile.size === 0) {
      return { success: false, error: 'Uploaded files are invalid.' }
    }

    const adminClient = getSupabaseAdmin()

    // Upload Photo to Public Bucket: 'member-photos'
    const photoExt = photoFile.name.split('.').pop() || 'jpg'
    const photoName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${photoExt}`
    const photoBuffer = await photoFile.arrayBuffer()
    const { data: photoUpload, error: photoError } = await adminClient.storage
      .from('member-photos')
      .upload(photoName, Buffer.from(photoBuffer), {
        contentType: photoFile.type,
      })

    if (photoError) {
      return { success: false, error: `Failed to upload photo: ${photoError.message}` }
    }

    // Upload ID Proof to Private Bucket: 'id-proofs'
    const idExt = idProofFile.name.split('.').pop() || 'jpg'
    const idName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${idExt}`
    const idBuffer = await idProofFile.arrayBuffer()
    const { data: idUpload, error: idError } = await adminClient.storage
      .from('id-proofs')
      .upload(idName, Buffer.from(idBuffer), {
        contentType: idProofFile.type,
      })

    if (idError) {
      // Cleanup uploaded photo if ID upload fails
      await adminClient.storage.from('member-photos').remove([photoName])
      return { success: false, error: `Failed to upload ID proof: ${idError.message}` }
    }

    // Insert Volunteer Metadata Record into PostgreSQL Table 'members'
    const { error: dbError } = await adminClient.from('members').insert({
      full_name: fullName,
      phone: phone,
      date_of_birth: dateOfBirth,
      photo_path: photoUpload.path,
      id_proof_path: idUpload.path,
      status: 'Pending',
    })

    if (dbError) {
      // Cleanup files if DB save fails
      await adminClient.storage.from('member-photos').remove([photoName])
      await adminClient.storage.from('id-proofs').remove([idName])
      return { success: false, error: `Database save failed: ${dbError.message}` }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

// Helper: Generate a random 16-digit card number in the format XXXX XXXX XXXX XXXX
function generateMembershipNo(): string {
  const segment = () => Math.floor(1000 + Math.random() * 9000).toString()
  return `${segment()} ${segment()} ${segment()} ${segment()}`
}

// 2. Server Action: Approve Member
export async function approveMemberAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const membershipNo = generateMembershipNo()

    const { error } = await adminClient
      .from('members')
      .update({
        status: 'Approved',
        membership_no: membershipNo,
      })
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Approval failed.' }
  }
}

// 3. Server Action: Reject Member
export async function rejectMemberAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()

    const { error } = await adminClient
      .from('members')
      .update({ status: 'Rejected' })
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Rejection failed.' }
  }
}

// 4. Server Action: Member Login (Phone + DOB validation)
export async function loginMemberAction(phone: string, dob: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()

    // Query members table
    const { data: records, error } = await adminClient
      .from('members')
      .select('id, status')
      .eq('phone', phone)
      .eq('date_of_birth', dob)

    if (error) {
      return { success: false, error: error.message }
    }

    if (!records || records.length === 0) {
      return { success: false, error: 'Registration records not found for this Phone and DOB combination.' }
    }

    const member = records[0]

    if (member.status === 'Pending') {
      return { success: false, error: 'Your registration is still pending approval by the Admin.' }
    }

    if (member.status === 'Rejected') {
      return { success: false, error: 'Your registration was rejected. Please contact the administrator.' }
    }

    return { success: true, memberId: member.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' }
  }
}
// 5. Server Action: Admin Login Action (Username + Password)
export async function adminLoginAction(formData: FormData): Promise<SubmitResult> {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const expectedUser = process.env.ADMIN_USERNAME || 'admin'
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin123'

    if (username !== expectedUser || password !== expectedPass) {
      return { success: false, error: 'Invalid username or password.' }
    }

    // Set secure admin session cookie (HTTP-only for security)
    cookies().set('admin_session', 'active', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    })

    // Set client-readable flag cookie so Header component can dynamically toggle admin tabs
    cookies().set('is_admin_logged_in', 'true', {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Admin login failed.' }
  }
}

// 6. Server Action: Admin Logout Action
export async function adminLogoutAction(): Promise<void> {
  cookies().delete('admin_session')
  cookies().delete('is_admin_logged_in')
}

// 7. Server Action: Toggle Member to Inactive Status
export async function inactiveMemberAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const { error } = await adminClient
      .from('members')
      .update({ status: 'Inactive' })
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to make member inactive.' }
  }
}

// 8. Server Action: Re-approve Inactive or Rejected Member
export async function reapproveMemberAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    
    // Check if they already have a membership_no
    const { data: memberData } = await adminClient
      .from('members')
      .select('membership_no')
      .eq('id', memberId)
      .single()

    const updates: any = { status: 'Approved' }
    if (!memberData?.membership_no) {
      updates.membership_no = generateMembershipNo()
    }

    const { error } = await adminClient
      .from('members')
      .update(updates)
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Re-approval failed.' }
  }
}

// ============================================================
// COMMITTEE MEMBER SERVER ACTIONS
// ============================================================

// 9. Server Action: Add Committee Member (auto-approved, generates UI ID)
export async function addCommitteeMemberAction(formData: FormData): Promise<SubmitResult> {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const roleTa = formData.get('roleTa') as string
    const bio = formData.get('bio') as string
    const bioTa = formData.get('bioTa') as string
    const photoFile = formData.get('photo') as File
    const idProofFile = formData.get('idProof') as File | null

    // Backend Input Validation
    if (!fullName || !phone || !dateOfBirth || !role) {
      return { success: false, error: 'Name, Phone, DOB, and Role are required.' }
    }

    if (!photoFile || photoFile.size === 0) {
      return { success: false, error: 'Profile photo is required.' }
    }

    const adminClient = getSupabaseAdmin()

    // 1. Upload Profile Photo to Public Bucket 'member-photos'
    const photoExt = photoFile.name.split('.').pop() || 'jpg'
    const photoName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${photoExt}`
    const photoBuffer = await photoFile.arrayBuffer()
    const { data: photoUpload, error: photoError } = await adminClient.storage
      .from('member-photos')
      .upload(photoName, Buffer.from(photoBuffer), {
        contentType: photoFile.type,
      })

    if (photoError) {
      return { success: false, error: `Failed to upload profile photo: ${photoError.message}` }
    }

    // 2. Upload ID Proof if provided
    let idProofPath: string | null = null
    if (idProofFile && idProofFile.size > 0) {
      const idExt = idProofFile.name.split('.').pop() || 'jpg'
      const idName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${idExt}`
      const idBuffer = await idProofFile.arrayBuffer()
      const { data: idUpload, error: idError } = await adminClient.storage
        .from('id-proofs')
        .upload(idName, Buffer.from(idBuffer), {
          contentType: idProofFile.type,
        })

      if (idError) {
        await adminClient.storage.from('member-photos').remove([photoName])
        return { success: false, error: `Failed to upload ID proof: ${idError.message}` }
      }

      idProofPath = idUpload.path
    }

    // Determine next display_order (Append to the end of the committee list)
    let nextDisplayOrder = 0
    const { data: lastMember } = await adminClient
      .from('members')
      .select('display_order')
      .eq('member_type', 'committee')
      .order('display_order', { ascending: false, nullsFirst: false })
      .limit(1)

    if (lastMember && lastMember.length > 0 && typeof lastMember[0].display_order === 'number') {
      nextDisplayOrder = lastMember[0].display_order + 1
    } else {
      // Fallback: count total committee members
      const { count } = await adminClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('member_type', 'committee')
      if (count && count > 0) {
        nextDisplayOrder = count
      }
    }

    // Insert into 'members'
    const insertData: any = {
      full_name: fullName,
      phone: phone,
      photo_path: photoUpload.path,
      id_proof_path: idProofPath,
      status: 'Approved',
      membership_no: generateMembershipNo(),
      date_of_birth: dateOfBirth,
      email: email || null,
      role: role,
      role_ta: roleTa || null,
      bio: bio || null,
      bio_ta: bioTa || null,
      member_type: 'committee',
      display_order: nextDisplayOrder,
    }

    let { data: inserted, error: dbError } = await adminClient
      .from('members')
      .insert(insertData)
      .select('id, membership_no')
      .single()

    if (dbError && dbError.message.includes('role_ta')) {
      delete insertData.role_ta
      const retry = await adminClient.from('members').insert(insertData).select('id, membership_no').single()
      inserted = retry.data
      dbError = retry.error
    }

    if (dbError && dbError.message.includes('display_order')) {
      delete insertData.display_order
      const retry = await adminClient.from('members').insert(insertData).select('id, membership_no').single()
      inserted = retry.data
      dbError = retry.error
    }

    if (dbError) {
      await adminClient.storage.from('member-photos').remove([photoName])
      if (idProofPath) {
        await adminClient.storage.from('id-proofs').remove([idProofPath])
      }
      return { success: false, error: `Database save failed: ${dbError.message}` }
    }

    revalidatePath('/committee')
    revalidatePath('/admin')
    return { success: true, memberId: inserted?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

// 10. Server Action: Update Committee Member
export async function updateCommitteeMemberAction(memberId: string, formData: FormData): Promise<SubmitResult> {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const roleTa = formData.get('roleTa') as string
    const bio = formData.get('bio') as string
    const bioTa = formData.get('bioTa') as string
    const photoFile = formData.get('photo') as File | null
    const idProofFile = formData.get('idProof') as File | null

    if (!fullName || !phone || !dateOfBirth || !role) {
      return { success: false, error: 'Name, Phone, DOB, and Role are required.' }
    }

    const adminClient = getSupabaseAdmin()

    const { data: existing, error: fetchError } = await adminClient
      .from('members')
      .select('photo_path, id_proof_path')
      .eq('id', memberId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: 'Committee member not found.' }
    }

    const updates: any = {
      full_name: fullName,
      phone: phone,
      date_of_birth: dateOfBirth,
      email: email || null,
      role: role,
      role_ta: roleTa || null,
      bio: bio || null,
      bio_ta: bioTa || null,
    }

    // Optionally replace profile photo
    if (photoFile && photoFile.size > 0) {
      const photoExt = photoFile.name.split('.').pop() || 'jpg'
      const photoName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${photoExt}`
      const photoBuffer = await photoFile.arrayBuffer()
      const { data: photoUpload, error: photoError } = await adminClient.storage
        .from('member-photos')
        .upload(photoName, Buffer.from(photoBuffer), {
          contentType: photoFile.type,
        })

      if (photoError) {
        return { success: false, error: `Failed to upload photo: ${photoError.message}` }
      }

      // Delete old photo from storage
      if (existing.photo_path) {
        await adminClient.storage.from('member-photos').remove([existing.photo_path])
      }

      updates.photo_path = photoUpload.path
    }

    // Optionally replace ID proof
    if (idProofFile && idProofFile.size > 0) {
      const idExt = idProofFile.name.split('.').pop() || 'jpg'
      const idName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${idExt}`
      const idBuffer = await idProofFile.arrayBuffer()
      const { data: idUpload, error: idError } = await adminClient.storage
        .from('id-proofs')
        .upload(idName, Buffer.from(idBuffer), {
          contentType: idProofFile.type,
        })

      if (idError) {
        return { success: false, error: `Failed to upload ID proof: ${idError.message}` }
      }

      // Delete old ID proof from storage
      if (existing.id_proof_path) {
        await adminClient.storage.from('id-proofs').remove([existing.id_proof_path])
      }

      updates.id_proof_path = idUpload.path
    }

    const { error: dbError } = await adminClient
      .from('members')
      .update(updates)
      .eq('id', memberId)

    if (dbError) {
      return { success: false, error: `Database update failed: ${dbError.message}` }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

// 11. Server Action: Delete Committee Member (soft delete → Inactive)
export async function deleteCommitteeMemberAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const { error } = await adminClient
      .from('members')
      .update({ status: 'Inactive' })
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/committee')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete committee member.' }
  }
}

// ============================================================
// VOLUNTEER ADMIN ACTIONS (WITH REAL STORAGE CLEANUP)
// ============================================================

// 12. Server Action: Admin Add Volunteer (Directly creates Approved volunteer)
export async function adminAddVolunteerAction(formData: FormData): Promise<SubmitResult> {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const email = formData.get('email') as string
    const photoFile = formData.get('photo') as File | null
    const idProofFile = formData.get('idProof') as File | null

    if (!fullName || !phone || !dateOfBirth) {
      return { success: false, error: 'Full name, Phone number, and DOB are required.' }
    }

    const adminClient = getSupabaseAdmin()
    let photoPath = '/logo.jpeg'

    if (photoFile && photoFile.size > 0) {
      const photoExt = photoFile.name.split('.').pop() || 'jpg'
      const photoName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${photoExt}`
      const photoBuffer = await photoFile.arrayBuffer()
      const { data: photoUpload, error: photoError } = await adminClient.storage
        .from('member-photos')
        .upload(photoName, Buffer.from(photoBuffer), {
          contentType: photoFile.type,
        })

      if (photoError) {
        return { success: false, error: `Failed to upload photo: ${photoError.message}` }
      }
      photoPath = photoUpload.path
    }

    let idProofPath: string | null = null
    if (idProofFile && idProofFile.size > 0) {
      const idExt = idProofFile.name.split('.').pop() || 'jpg'
      const idName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${idExt}`
      const idBuffer = await idProofFile.arrayBuffer()
      const { data: idUpload, error: idError } = await adminClient.storage
        .from('id-proofs')
        .upload(idName, Buffer.from(idBuffer), {
          contentType: idProofFile.type,
        })

      if (idError) {
        return { success: false, error: `Failed to upload ID proof: ${idError.message}` }
      }
      idProofPath = idUpload.path
    }

    const { data: inserted, error: dbError } = await adminClient
      .from('members')
      .insert({
        full_name: fullName,
        phone: phone,
        date_of_birth: dateOfBirth,
        email: email || null,
        role: 'Member',
        member_type: 'volunteer',
        status: 'Approved',
        membership_no: generateMembershipNo(),
        photo_path: photoPath,
        id_proof_path: idProofPath,
      })
      .select('id')
      .single()

    if (dbError) {
      return { success: false, error: `Database insert failed: ${dbError.message}` }
    }

    revalidatePath('/admin')
    return { success: true, memberId: inserted?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

// 13. Server Action: Admin Update Volunteer Profile & Files with Old File Cleanup
export async function adminUpdateVolunteerAction(memberId: string, formData: FormData): Promise<SubmitResult> {
  try {
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const photoFile = formData.get('photo') as File | null
    const idProofFile = formData.get('idProof') as File | null

    if (!fullName || !phone || !dateOfBirth) {
      return { success: false, error: 'Full name, Phone number, and DOB are required.' }
    }

    const adminClient = getSupabaseAdmin()

    // Fetch existing member to clean up old storage paths
    const { data: existing, error: fetchError } = await adminClient
      .from('members')
      .select('photo_path, id_proof_path')
      .eq('id', memberId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: 'Volunteer record not found.' }
    }

    const updates: any = {
      full_name: fullName,
      phone: phone,
      date_of_birth: dateOfBirth,
      email: email || null,
      role: role || 'Member',
      updated_at: new Date().toISOString(),
    }

    // Replace Profile Photo if provided
    if (photoFile && photoFile.size > 0) {
      const photoExt = photoFile.name.split('.').pop() || 'jpg'
      const photoName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${photoExt}`
      const photoBuffer = await photoFile.arrayBuffer()
      const { data: photoUpload, error: photoError } = await adminClient.storage
        .from('member-photos')
        .upload(photoName, Buffer.from(photoBuffer), {
          contentType: photoFile.type,
        })

      if (photoError) {
        return { success: false, error: `Failed to upload photo: ${photoError.message}` }
      }

      // Purge old photo from storage if it is not default /logo.jpeg
      if (existing.photo_path && existing.photo_path !== '/logo.jpeg' && !existing.photo_path.startsWith('http')) {
        await adminClient.storage.from('member-photos').remove([existing.photo_path])
      }

      updates.photo_path = photoUpload.path
    }

    // Replace ID Proof if provided
    if (idProofFile && idProofFile.size > 0) {
      const idExt = idProofFile.name.split('.').pop() || 'jpg'
      const idName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${idExt}`
      const idBuffer = await idProofFile.arrayBuffer()
      const { data: idUpload, error: idError } = await adminClient.storage
        .from('id-proofs')
        .upload(idName, Buffer.from(idBuffer), {
          contentType: idProofFile.type,
        })

      if (idError) {
        return { success: false, error: `Failed to upload ID proof: ${idError.message}` }
      }

      // Purge old ID proof
      if (existing.id_proof_path && !existing.id_proof_path.startsWith('http')) {
        await adminClient.storage.from('id-proofs').remove([existing.id_proof_path])
      }

      updates.id_proof_path = idUpload.path
    }

    const { error: dbError } = await adminClient
      .from('members')
      .update(updates)
      .eq('id', memberId)

    if (dbError) {
      return { success: false, error: `Database update failed: ${dbError.message}` }
    }

    revalidatePath('/admin')
    revalidatePath(`/member/${memberId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

// 14. Server Action: Permanent Delete Volunteer Record and Storage Files
export async function adminDeleteVolunteerPermanentlyAction(memberId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()

    const { data: existing } = await adminClient
      .from('members')
      .select('photo_path, id_proof_path')
      .eq('id', memberId)
      .single()

    if (existing) {
      if (existing.photo_path && existing.photo_path !== '/logo.jpeg' && !existing.photo_path.startsWith('http')) {
        await adminClient.storage.from('member-photos').remove([existing.photo_path])
      }
      if (existing.id_proof_path && !existing.id_proof_path.startsWith('http')) {
        await adminClient.storage.from('id-proofs').remove([existing.id_proof_path])
      }
    }

    const { error } = await adminClient
      .from('members')
      .delete()
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to permanently delete record.' }
  }
}

// ============================================================
// NEWS CMS SERVER ACTIONS
// ============================================================

// 15. Server Action: Save / Create News Article
export async function saveNewsAction(formData: FormData): Promise<SubmitResult> {
  try {
    const id = formData.get('id') as string | null
    const title = formData.get('title') as string
    const titleTa = formData.get('titleTa') as string
    const tag = formData.get('tag') as string
    const tagTa = formData.get('tagTa') as string
    const summary = formData.get('summary') as string
    const summaryTa = formData.get('summaryTa') as string
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0]
    const photoFile = formData.get('photo') as File | null

    if (!title || !summary) {
      return { success: false, error: 'Title and content summary are required.' }
    }

    const adminClient = getSupabaseAdmin()
    let photoPath: string | null = null

    if (photoFile && photoFile.size > 0) {
      const ext = photoFile.name.split('.').pop() || 'jpg'
      const filename = `news_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
      const buffer = await photoFile.arrayBuffer()
      const { data: upload, error: uploadErr } = await adminClient.storage
        .from('news-photos')
        .upload(filename, Buffer.from(buffer), { contentType: photoFile.type })

      if (uploadErr) {
        return { success: false, error: `Failed to upload news image: ${uploadErr.message}` }
      }
      photoPath = upload.path
    }

    if (id) {
      // Update existing
      const updates: any = {
        title,
        title_ta: titleTa || null,
        tag: tag || 'General',
        tag_ta: tagTa || null,
        summary,
        summary_ta: summaryTa || null,
        date,
        updated_at: new Date().toISOString(),
      }

      if (photoPath) {
        // Fetch old to delete
        const { data: old } = await adminClient.from('news').select('photo_path').eq('id', id).single()
        if (old?.photo_path && !old.photo_path.startsWith('http')) {
          await adminClient.storage.from('news-photos').remove([old.photo_path])
        }
        updates.photo_path = photoPath
      }

      const { error } = await adminClient.from('news').update(updates).eq('id', id)
      if (error) return { success: false, error: error.message }
    } else {
      // Insert new
      const { error } = await adminClient.from('news').insert({
        title,
        title_ta: titleTa || null,
        tag: tag || 'General',
        tag_ta: tagTa || null,
        summary,
        summary_ta: summaryTa || null,
        date,
        photo_path: photoPath,
        is_published: true,
      })
      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/news')
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save news article.' }
  }
}

// 16. Server Action: Delete News Article
export async function deleteNewsAction(id: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const { data: old } = await adminClient.from('news').select('photo_path').eq('id', id).single()
    if (old?.photo_path && !old.photo_path.startsWith('http')) {
      await adminClient.storage.from('news-photos').remove([old.photo_path])
    }

    const { error } = await adminClient.from('news').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/news')
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete news.' }
  }
}

// ============================================================
// GALLERY CMS SERVER ACTIONS
// ============================================================

// 17. Server Action: Save / Create Album
export async function saveAlbumAction(formData: FormData): Promise<SubmitResult> {
  try {
    const id = formData.get('id') as string | null
    const title = formData.get('title') as string
    const titleTa = formData.get('titleTa') as string
    const description = formData.get('description') as string
    const descriptionTa = formData.get('descriptionTa') as string
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0]
    const photos = formData.getAll('photos') as File[]

    if (!title) {
      return { success: false, error: 'Album title is required.' }
    }

    const adminClient = getSupabaseAdmin()

    let albumId = id
    if (albumId) {
      // Update metadata
      const { error: upErr } = await adminClient
        .from('albums')
        .update({
          title,
          title_ta: titleTa || null,
          description: description || null,
          description_ta: descriptionTa || null,
          date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', albumId)

      if (upErr) return { success: false, error: upErr.message }
    } else {
      // Create new album
      const { data: newAlb, error: insErr } = await adminClient
        .from('albums')
        .insert({
          title,
          title_ta: titleTa || null,
          description: description || null,
          description_ta: descriptionTa || null,
          date,
        })
        .select('id')
        .single()

      if (insErr || !newAlb) return { success: false, error: insErr?.message || 'Failed to create album.' }
      albumId = newAlb.id
    }

    // Upload any provided photos into album_images
    if (photos && photos.length > 0) {
      let firstUploadedPath: string | null = null

      for (const file of photos) {
        if (file && file.size > 0) {
          const ext = file.name.split('.').pop() || 'jpg'
          const filename = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
          const buffer = await file.arrayBuffer()
          const { data: upload, error: uploadErr } = await adminClient.storage
            .from('gallery-photos')
            .upload(filename, Buffer.from(buffer), { contentType: file.type })

          if (!uploadErr && upload) {
            if (!firstUploadedPath) firstUploadedPath = upload.path

            await adminClient.from('album_images').insert({
              album_id: albumId,
              photo_path: upload.path,
            })
          }
        }
      }

      // If album has no cover image yet, set first uploaded as cover
      if (firstUploadedPath) {
        const { data: alb } = await adminClient.from('albums').select('cover_image_path').eq('id', albumId).single()
        if (!alb?.cover_image_path) {
          await adminClient.from('albums').update({ cover_image_path: firstUploadedPath }).eq('id', albumId)
        }
      }
    }

    revalidatePath('/gallery')
    revalidatePath('/admin')
    return { success: true, memberId: albumId || undefined }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save album.' }
  }
}

// 18. Server Action: Delete Entire Album
export async function deleteAlbumAction(id: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()

    // Fetch all album images to purge from storage
    const { data: images } = await adminClient.from('album_images').select('photo_path').eq('album_id', id)
    if (images && images.length > 0) {
      const paths = images
        .map(i => i.photo_path)
        .filter(p => p && !p.startsWith('http'))
      if (paths.length > 0) {
        await adminClient.storage.from('gallery-photos').remove(paths)
      }
    }

    const { error } = await adminClient.from('albums').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/gallery')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete album.' }
  }
}

// 19. Server Action: Delete Single Photo from Album
export async function deleteAlbumPhotoAction(photoId: string, photoPath: string, albumId: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()

    if (photoPath && !photoPath.startsWith('http')) {
      await adminClient.storage.from('gallery-photos').remove([photoPath])
    }

    const { error } = await adminClient.from('album_images').delete().eq('id', photoId)
    if (error) return { success: false, error: error.message }

    // If this was cover photo, pick another photo as cover
    const { data: alb } = await adminClient.from('albums').select('cover_image_path').eq('id', albumId).single()
    if (alb?.cover_image_path === photoPath) {
      const { data: remaining } = await adminClient.from('album_images').select('photo_path').eq('album_id', albumId).limit(1)
      const nextCover = remaining && remaining.length > 0 ? remaining[0].photo_path : null
      await adminClient.from('albums').update({ cover_image_path: nextCover }).eq('id', albumId)
    }

    revalidatePath('/gallery')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete photo.' }
  }
}

// ============================================================
// INQUIRIES & CONTACT SERVER ACTIONS
// ============================================================

// 20. Server Action: Submit Public Contact Form
export async function submitContactInquiryAction(formData: FormData): Promise<SubmitResult> {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string

    if (!name || !email || !message) {
      return { success: false, error: 'Name, Email, and Message are required.' }
    }

    const adminClient = getSupabaseAdmin()
    const { error } = await adminClient.from('inquiries').insert({
      name,
      email,
      phone: phone || null,
      message,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit message.' }
  }
}

// ============================================================
// ANNOUNCEMENTS SERVER ACTIONS
// ============================================================

// 21. Server Action: Save Announcement (Create or Update)
export async function saveAnnouncementAction(formData: FormData): Promise<SubmitResult> {
  try {
    const id = formData.get('id') as string | null
    const text = formData.get('text') as string
    const textTa = formData.get('textTa') as string
    const badge = (formData.get('badge') as string) || 'New'
    const badgeTa = (formData.get('badgeTa') as string) || 'புதியது'
    const link = formData.get('link') as string
    const isMarquee = formData.get('isMarquee') === 'true'
    const isActive = formData.get('isActive') !== 'false'
    const photoFile = formData.get('photo') as File | null

    if (!text) {
      return { success: false, error: 'Announcement text is required.' }
    }

    const adminClient = getSupabaseAdmin()
    let imagePath: string | null = null

    if (photoFile && photoFile.size > 0) {
      const ext = photoFile.name.split('.').pop() || 'jpg'
      const filename = `announcement_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
      const buffer = await photoFile.arrayBuffer()
      const { data: upload, error: uploadErr } = await adminClient.storage
        .from('news-photos')
        .upload(filename, Buffer.from(buffer), { contentType: photoFile.type })

      if (uploadErr) {
        return { success: false, error: `Failed to upload announcement photo: ${uploadErr.message}` }
      }
      imagePath = upload.path
    }

    if (id) {
      const updates: any = {
        text,
        text_ta: textTa || null,
        badge,
        badge_ta: badgeTa || null,
        link: link || null,
        is_marquee: isMarquee,
        is_active: isActive,
      }
      if (imagePath) {
        updates.image_path = imagePath
      }

      let { error } = await adminClient.from('announcements').update(updates).eq('id', id)
      // If error is about missing image_path column, retry without image_path
      if (error && error.message.includes('image_path')) {
        delete updates.image_path
        const retry = await adminClient.from('announcements').update(updates).eq('id', id)
        error = retry.error
      }
      if (error) return { success: false, error: error.message }
    } else {
      const insertData: any = {
        text,
        text_ta: textTa || null,
        badge,
        badge_ta: badgeTa || null,
        link: link || null,
        is_marquee: isMarquee,
        is_active: isActive,
      }
      if (imagePath) {
        insertData.image_path = imagePath
      }

      let { error } = await adminClient.from('announcements').insert(insertData)
      // If error is about missing image_path column, retry without image_path
      if (error && error.message.includes('image_path')) {
        delete insertData.image_path
        const retry = await adminClient.from('announcements').insert(insertData)
        error = retry.error
      }
      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save announcement.' }
  }
}

// 22. Server Action: Delete Announcement
export async function deleteAnnouncementAction(id: string): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const { data: ann } = await adminClient.from('announcements').select('image_path').eq('id', id).single()
    if (ann?.image_path && !ann.image_path.startsWith('http')) {
      await adminClient.storage.from('news-photos').remove([ann.image_path])
    }

    const { error } = await adminClient.from('announcements').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete announcement.' }
  }
}

// ============================================================
// COMMITTEE ORDERING & SETTINGS ACTIONS
// ============================================================

// 23. Server Action: Update Committee Member Display Order (Single)
export async function updateCommitteeOrderAction(memberId: string, displayOrder: number): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    const { error } = await adminClient
      .from('members')
      .update({ display_order: displayOrder })
      .eq('id', memberId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/committee')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update order.' }
  }
}

// 23b. Server Action: Batch Update Committee Order
export async function updateCommitteeBatchOrderAction(orderedIds: string[]): Promise<SubmitResult> {
  try {
    const adminClient = getSupabaseAdmin()
    
    // Update each member with their new 0-indexed position
    const updates = orderedIds.map((id, index) => 
      adminClient.from('members').update({ display_order: index }).eq('id', id)
    )

    await Promise.all(updates)

    revalidatePath('/committee')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to batch update order.' }
  }
}

// 24. Server Action: Save Global Settings
export async function saveGlobalSettingsAction(formData: FormData): Promise<SubmitResult> {
  try {
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string

    const adminClient = getSupabaseAdmin()

    // Store settings in 'site_settings' or upsert
    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        id: 'global',
        phone,
        email,
        address,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      // If table does not exist, return gentle success for client-side state
      console.warn('site_settings table notice:', error.message)
    }

    revalidatePath('/')
    revalidatePath('/contact')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save settings.' }
  }
}
