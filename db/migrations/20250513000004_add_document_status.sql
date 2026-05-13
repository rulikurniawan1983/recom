-- Add status tracking to registration_documents

alter table registration_documents
add column status text check (status in ('pending', 'approved', 'rejected', 'revision_requested')) default 'pending',
add column admin_notes text;

-- Update existing documents to 'pending' status (they are currently only 'verified' boolean)
update registration_documents
set status = case when verified then 'approved' else 'pending' end;

-- Drop old verified column (optional, but cleaner)
alter table registration_documents drop column verified;