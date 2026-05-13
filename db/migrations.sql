-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text check (role in ('admin', 'user')) default 'user',
  phone text,
  company_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS policies for profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
on profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
to authenticated
using (auth.uid() = id);

-- Allow service_role to bypass RLS for inserts/updates
-- This is needed for the admin setup API

-- Business units table
create table if not exists business_units (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  phone text,
  email text,
  business_type text,
  created_at timestamp with time zone default now()
);

-- Product types table
create table if not exists product_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  created_at timestamp with time zone default now()
);

-- NKV registrations table
create table if not exists nkv_registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade,
  business_unit_id uuid references business_units,
  product_type_id uuid references product_types,
  registration_number text unique not null,
  business_name text,
  business_address text,
  business_phone text,
  business_email text,
  business_type text,
  product_type text,
  product_description text,
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

-- Registration documents table
create table if not exists registration_documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references nkv_registrations on delete cascade,
  document_type text,
  file_url text,
  file_name text,
  uploaded_at timestamp with time zone default now(),
  verified boolean default false
);

-- Inspection schedules table
create table if not exists inspection_schedules (
  id uuid primary key default uuid_generate_v4(),
  nkv_registration_id uuid references nkv_registrations on delete cascade,
  dokter_hewan_registration_id uuid references dokter_hewan_registrations on delete cascade,
  inspector_id uuid references profiles,
  scheduled_date date,
  scheduled_time time,
  location text,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for inspection_schedules
alter table inspection_schedules enable row level security;

-- Inspection schedules policies
-- Admins can view all inspection schedules
create policy "Admins can view all inspection_schedules"
on inspection_schedules for select
to authenticated
using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admins can insert inspection schedules
create policy "Admins can insert inspection_schedules"
on inspection_schedules for insert
to authenticated
with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admins can update any inspection schedule
create policy "Admins can update any inspection_schedules"
on inspection_schedules for update
to authenticated
using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Create trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at before update
on profiles for each row execute procedure update_updated_at_column();

drop trigger if exists update_nkv_registrations_updated_at on nkv_registrations;
create trigger update_nkv_registrations_updated_at before update
on nkv_registrations for each row execute procedure update_updated_at_column();

-- Dokter Hewan registrations table
create table if not exists dokter_hewan_registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade,
  registration_number text unique not null,
  full_name text not null,
  birth_place_date text,
  ktp_address text,
  clinic_address text,
  phone text,
  email text,
  color_photo_url text,
  diploma_url text,
  competency_cert_url text,
  professional_recommendation_url text,
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

drop trigger if exists update_dokter_hewan_registrations_updated_at on dokter_hewan_registrations;
create trigger update_dokter_hewan_registrations_updated_at before update
on dokter_hewan_registrations for each row execute procedure update_updated_at_column();

-- Tracking logs for registration status changes
create table if not exists tracking_logs (
  id uuid primary key default uuid_generate_v4(),
  nkv_registration_id uuid references nkv_registrations on delete cascade,
  dokter_hewan_registration_id uuid references dokter_hewan_registrations on delete cascade,
  status text not null,
  notes text,
  created_at timestamp with time zone default now(),
  created_by uuid references profiles
);

-- Enable RLS for tracking_logs
alter table tracking_logs enable row level security;

-- Tracking logs policies: users can view logs for their own registrations
create policy "Users can view tracking logs for their registrations"
on tracking_logs for select
to authenticated
using (
  nkv_registration_id in (select id from nkv_registrations where user_id = auth.uid())
  or
  dokter_hewan_registration_id in (select id from dokter_hewan_registrations where user_id = auth.uid())
);

-- Admins can view all tracking logs
create policy "Admins can view all tracking_logs"
on tracking_logs for select
to authenticated
using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admins can insert tracking logs
create policy "Admins can insert tracking_logs"
on tracking_logs for insert
to authenticated
with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Comments table for admin notes
create table if not exists registration_comments (
  id uuid primary key default uuid_generate_v4(),
  nkv_registration_id uuid references nkv_registrations on delete cascade,
  dokter_hewan_registration_id uuid references dokter_hewan_registrations on delete cascade,
  admin_id uuid references profiles,
  comment text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for registration_comments
alter table registration_comments enable row level security;

-- Admins can view all comments
create policy "Admins can view all registration_comments"
on registration_comments for select
to authenticated
using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admins can insert comments
create policy "Admins can insert registration_comments"
on registration_comments for insert
to authenticated
with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- RLS policies for registrations
alter table dokter_hewan_registrations enable row level security;
alter table nkv_registrations enable row level security;

create policy "Users can insert dokter_hewan_registrations"
on dokter_hewan_registrations for insert
to authenticated
with check (true);

create policy "Users can view own dokter_hewan_registrations"
on dokter_hewan_registrations for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update own dokter_hewan_registrations"
on dokter_hewan_registrations for update
to authenticated
using (user_id = auth.uid());

create policy "Users can insert nkv_registrations"
on nkv_registrations for insert
to authenticated
with check (true);

create policy "Users can view own nkv_registrations"
on nkv_registrations for select
to authenticated
using (user_id = auth.uid());

create policy "Users can update own nkv_registrations"
on nkv_registrations for update
to authenticated
using (user_id = auth.uid());

-- Admin policies: allow admins to view all registrations
create policy "Admins can view all nkv_registrations"
on nkv_registrations for select
to authenticated
using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can view all dokter_hewan_registrations"
on dokter_hewan_registrations for select
to authenticated
using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can update any nkv_registrations"
on nkv_registrations for update
to authenticated
using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can update any dokter_hewan_registrations"
on dokter_hewan_registrations for update
to authenticated
using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'admin'
  )
);

-- Public tracking policies (allow anonymous read for tracking modal)
create policy "Public can view NKV registration by tracking number"
on nkv_registrations for select
to anon
using (true);

create policy "Public can view Dokter Hewan registration by tracking number"
on dokter_hewan_registrations for select
to anon
using (true);

-- Storage bucket for registration documents
insert into storage.buckets (id, name, public) 
values ('registration-documents', 'registration-documents', true)
on conflict (id) do nothing;

-- Storage policies for registration documents bucket
drop policy if exists "Users can upload files" on storage.objects;
create policy "Users can upload files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'registration-documents');

drop policy if exists "Users can view files" on storage.objects;
create policy "Users can view files"
on storage.objects for select
to authenticated
using (bucket_id = 'registration-documents');

drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
on storage.objects for update
to authenticated
using (bucket_id = 'registration-documents' and auth.uid()::text = split_part(name, '/', 1));

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (bucket_id = 'registration-documents' and auth.uid()::text = split_part(name, '/', 1));