-- ============================================
-- VETERINARY REGISTRATIONS TABLE
-- Follows the same workflow as NKV and Dokter Hewan:
--   draft → submitted → document_verification → field_inspection → assessment → approved/rejected/revision_requested
-- ============================================

create table if not exists veterinary_registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade,
  pet_name text not null,
  pet_type text not null,
  pet_breed text,
  pet_age text,
  pet_gender text check (pet_gender in ('jantan', 'betina', 'lainnya')),
  owner_name text not null,
  owner_phone text,
  owner_address text,
  registration_number text unique not null,
  status text check (status in (
    'draft', 'submitted', 'document_verification',
    'field_inspection', 'assessment', 'approved',
    'rejected', 'revision_requested'
  )) default 'draft',
  verification_notes text,
  inspector_id uuid references profiles,
  inspection_date timestamp with time zone,
  inspection_notes text,
  assessment_score integer,
  assessment_notes text,
  recommendation_file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  approved_at timestamp with time zone
);

-- Enable RLS
alter table veterinary_registrations enable row level security;

-- Users can insert their own veterinary registrations
create policy if not exists "Users can insert veterinary_registrations"
on veterinary_registrations for insert
to authenticated
with check (true);

-- Users can view their own veterinary registrations
create policy if not exists "Users can view own veterinary_registrations"
on veterinary_registrations for select
to authenticated
using (user_id = auth.uid());

-- Users can update their own veterinary registrations
create policy if not exists "Users can update own veterinary_registrations"
on veterinary_registrations for update
to authenticated
using (user_id = auth.uid());

-- Admins can view all veterinary registrations
create policy if not exists "Admins can view all veterinary_registrations"
on veterinary_registrations for select
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admins can update any veterinary registrations
create policy if not exists "Admins can update any veterinary_registrations"
on veterinary_registrations for update
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Service role bypasses RLS (admin API routes)
alter table veterinary_registrations enable row level security;

-- Updated-at trigger
drop trigger if exists update_veterinary_registrations_updated_at on veterinary_registrations;
create trigger update_veterinary_registrations_updated_at before update
on veterinary_registrations for each row execute procedure update_updated_at_column();


-- ============================================
-- FIX registration_documents table
-- The existing schema only has 'verified boolean', but the application code uses
-- 'status' and 'admin_notes'. Add the missing columns.
-- ============================================

-- Add 'status' column if it does not already exist
alter table registration_documents add column if not exists status text;

-- Populate status from 'verified' for existing rows
update registration_documents
  set status = case when verified then 'approved' else 'pending' end
  where status is null;

-- Set a default so future inserts without explicit status still get 'pending'
alter table registration_documents alter column status set default 'pending';

-- Add 'admin_notes' column if it does not already exist
alter table registration_documents add column if not exists admin_notes text;

-- Restrict 'verified' column to optional if it exists (it's replaced by status)
alter table registration_documents alter column verified drop default if exists;


-- ============================================
-- EXTEND inspection_schedules to support veterinary registrations
-- ============================================

-- Add 'veterinary_registration_id' column (nullable, separate FK from DKH and NKV)
alter table inspection_schedules add column if not exists veterinary_registration_id uuid references veterinary_registrations on delete cascade;


-- ============================================
-- EXTEND tracking_logs to support veterinary registrations
-- ============================================

-- Add 'veterinary_registration_id' column (nullable, separate FK from DKH and NKV)
alter table tracking_logs add column if not exists veterinary_registration_id uuid references veterinary_registrations on delete cascade;

-- Update RLS policy on tracking_logs so users can also view logs for their own veterinary registrations
drop policy if exists "Users can view tracking logs for their registrations" on tracking_logs;
create policy "Users can view tracking logs for their registrations"
on tracking_logs for select
to authenticated
using (
  nkv_registration_id in (select id from nkv_registrations where user_id = auth.uid())
  or
  dokter_hewan_registration_id in (select id from dokter_hewan_registrations where user_id = auth.uid())
  or
  veterinary_registration_id in (select id from veterinary_registrations where user_id = auth.uid())
);

-- Also extend the admin tracking-log insert helper
drop policy if exists "Admins can insert tracking_logs" on tracking_logs;
create policy "Admins can insert tracking_logs"
on tracking_logs for insert
to authenticated
with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- ============================================
-- STORAGE BUCKETS
-- Ensure the registration-documents bucket exists (idempotent)
-- ============================================

insert into storage.buckets (id, name, public)
values ('registration-documents', 'registration-documents', true)
on conflict (id) do nothing;

-- Storage upload policy (authenticated users can upload)
drop policy if exists "Users can upload files" on storage.objects;
create policy "Users can upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'registration-documents');

-- Storage view policy (authenticated users can view files)
drop policy if exists "Users can view files" on storage.objects;
create policy "Users can view files"
on storage.objects for select
to authenticated
using (bucket_id = 'registration-documents');

-- Storage update policy (own files only)
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
on storage.objects for update
to authenticated
using (bucket_id = 'registration-documents' and auth.uid()::text = split_part(name, '/', 1));

-- Storage delete policy (own files only)
drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (bucket_id = 'registration-documents' and auth.uid()::text = split_part(name, '/', 1));
