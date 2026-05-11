-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table for user data
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

-- Create business_units table for company data
create table business_units (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  phone text,
  email text,
  business_type text,
  created_at timestamp with time zone default now()
);

-- Create product_types table for animal product types
create table product_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  created_at timestamp with time zone default now()
);

-- Create nkv_registrations table for NKV applications
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

-- Create registration_documents table for uploaded files
create table registration_documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references nkv_registrations on delete cascade,
  document_type text,
  file_url text,
  file_name text,
  uploaded_at timestamp with time zone default now(),
  verified boolean default false
);

-- Create inspection_schedules table for field inspection scheduling
create table inspection_schedules (
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

-- Create trigger function for updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers to tables
create trigger update_profiles_updated_at before update
on profiles for each row execute procedure update_updated_at_column();

create trigger update_nkv_registrations_updated_at before update
on nkv_registrations for each row execute procedure update_updated_at_column();

-- Insert sample product types
insert into product_types (name, description, category) values
('Daging Sapi', 'Produk daging sapi segar dan olahan', 'hewan'),
('Daging Ayam', 'Produk daging ayam segar dan olahan', 'hewan'),
('Telur Ayam', 'Produk telur ayam segar', 'hewan'),
('Susu Sapi', 'Produk susu segar dan olahan', 'hewan'),
('Terpakai Babi', 'Produk terpakai/terolah dari babi', 'hewan');