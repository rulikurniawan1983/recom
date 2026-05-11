-- Drop existing tables
drop table if exists registration_documents cascade;
drop table if exists inspection_schedules cascade;
drop table if exists tracking_logs cascade;
drop table if exists nkv_registrations cascade;
drop table if exists dokter_hewan_registrations cascade;
drop table if exists product_types cascade;
drop table if exists business_units cascade;
drop table if exists profiles cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
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
create table business_units (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  phone text,
  email text,
  business_type text,
  created_at timestamp with time zone default now()
);

-- Product types table
create table product_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  created_at timestamp with time zone default now()
);

-- Dokter Hewan Registrations table
create table dokter_hewan_registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade,
  registration_number text unique not null,
  status text check (status in (
    'draft', 'submitted', 'document_verification', 
    'field_inspection', 'assessment', 'approved', 
    'rejected', 'revision_requested'
  )) default 'draft',
  full_name text,
  phone text,
  email text,
  clinic_address text,
  nib_number text,
  strv_number text,
  verification_notes text,
  inspection_notes text,
  assessment_notes text,
  recommendation_file_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  approved_at timestamp with time zone
);

-- NKV Registrations table
create table nkv_registrations (
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
create table registration_documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid,
  registration_type text,
  document_type text,
  file_url text,
  file_name text,
  uploaded_at timestamp with time zone default now(),
  verified boolean default false
);

-- Tracking logs table for progress tracking
create table tracking_logs (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid,
  registration_type text,
  status text,
  notes text,
  updated_by text,
  created_at timestamp with time zone default now()
);

-- Inspection schedules table
create table inspection_schedules (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid,
  registration_type text,
  inspector_id uuid references profiles,
  scheduled_date date,
  scheduled_time time,
  location text,
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled',
  notes text,
  created_at timestamp with time zone default now()
);

-- Trigger function for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_nkv_registrations_updated_at before update on nkv_registrations for each row execute procedure update_updated_at_column();
create trigger update_dokter_hewan_registrations_updated_at before update on dokter_hewan_registrations for each row execute procedure update_updated_at_column();

-- Insert sample product types
insert into product_types (name, description, category) values
('Daging Sapi', 'Produk daging sapi', 'hewan'),
('Daging Ayam', 'Produk daging ayam', 'hewan'),
('Telur Ayam', 'Produk telur', 'hewan'),
('Susu Sapi', 'Produk susu', 'hewan');