-- Add registration_type column to registration_documents

alter table registration_documents
add column registration_type text;

-- Update existing records to have a registration_type based on context
-- (This is safe because the column will be nullable initially)

-- Optional: add a check constraint if needed
-- alter table registration_documents
-- add constraint valid_registration_type
-- check (registration_type in ('nkv', 'dokter_hewan'));
