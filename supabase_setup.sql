-- ==========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Run this in the Supabase SQL Editor.
-- ==========================================

-- 1. Create the 'members' table
create table if not exists public.members (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    phone text not null,
    photo_path text not null,       -- File path in the 'member-photos' bucket
    id_proof_path text,             -- File path in the 'id-proofs' bucket (nullable for committee members)
    status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Inactive')),
    membership_no text unique,      -- Generated 16-digit ID card number
    date_of_birth text,             -- Member's date of birth
    email text,                     -- Member's email address
    role text,                      -- Designation / role (e.g. member, State Secretary)
    member_type text not null default 'volunteer' check (member_type in ('volunteer', 'committee')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration for existing databases: add new columns if they do not exist
alter table public.members add column if not exists date_of_birth text;
alter table public.members add column if not exists email text;
alter table public.members add column if not exists role text;
alter table public.members add column if not exists member_type text not null default 'volunteer';
alter table public.members alter column id_proof_path drop not null;

-- Enable Row-Level Security (RLS) on members table
alter table public.members enable row level security;

-- Create policies for members table
create policy "Allow public inserts to members" 
on public.members for insert 
with check (true);

create policy "Allow public selects for verifications"
on public.members for select
using (status = 'Approved');

-- Note: The admin functions will use the Supabase Service Role Key 
-- which bypasses RLS, allowing them to read and update all registrations.


-- 2. Configure Storage Buckets
-- Note: Insert records into storage.buckets table to create them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('member-photos', 'member-photos', true, 5242880, '{image/*}')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('id-proofs', 'id-proofs', false, 5242880, '{image/*,application/pdf}')
on conflict (id) do nothing;


-- 3. Configure Storage Security Policies
-- Allow anyone to upload a member photo
create policy "Allow anyone to upload member photos"
on storage.objects for insert
to public
with check (bucket_id = 'member-photos');

-- Allow anyone to upload an ID proof
create policy "Allow anyone to upload ID proofs"
on storage.objects for insert
to public
with check (bucket_id = 'id-proofs');

-- Allow public to read member photos
create policy "Allow public to view member photos"
on storage.objects for select
to public
using (bucket_id = 'member-photos');

-- NOTE: No SELECT policy is created for 'id-proofs'. 
-- This keeps the bucket strictly private. Only the backend using the 
-- Service Role Key can access files in 'id-proofs' to generate signed URLs.
