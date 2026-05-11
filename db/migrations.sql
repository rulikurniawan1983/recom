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
  registration_id uuid references nkv_registrations on delete cascade,
  inspector_id uuid references profiles,
  scheduled_date date,
  scheduled_time time,
  location text,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  notes text,
  created_at timestamp with time zone default now()
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

-- Comments table for admin notes
create table if not exists registration_comments (
  id uuid primary key default uuid_generate_v4(),
  nkv_registration_id uuid references nkv_registrations on delete cascade,
  dokter_hewan_registration_id uuid references dokter_hewan_registrations on delete cascade,
  admin_id uuid references profiles,
  comment text not null,
  created_at timestamp with time zone default now()
);

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