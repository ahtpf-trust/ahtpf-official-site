-- ==========================================
-- SUPABASE MIGRATION: COMMITTEE CONFIG SUPPORT
-- Run this in the Supabase SQL Editor.
-- Adds committee member support to the existing 'members' table.
-- ==========================================

-- 1. Add new columns required for committee members
alter table public.members add column if not exists date_of_birth text;
alter table public.members add column if not exists email text;
alter table public.members add column if not exists role text;
alter table public.members add column if not exists member_type text not null default 'volunteer';

-- 2. Make id_proof_path nullable (proof is optional for committee members)
alter table public.members alter column id_proof_path drop not null;

-- 3. Drop the old status check constraint so we can add 'Inactive' to it
alter table public.members drop constraint if exists members_status_check;

-- 4. Recreate the status check constraint with 'Inactive' included
alter table public.members
  add constraint members_status_check
  check (status in ('Pending', 'Approved', 'Rejected', 'Inactive'));

-- 5. Add a check constraint for member_type (volunteer / committee)
alter table public.members
  add constraint members_member_type_check
  check (member_type in ('volunteer', 'committee'));

-- ==========================================
-- VERIFICATION QUERIES (optional - run after migration)
-- ==========================================
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'members'
-- order by ordinal_position;