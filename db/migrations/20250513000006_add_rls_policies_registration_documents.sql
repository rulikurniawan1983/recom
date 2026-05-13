-- RLS policies for registration_documents table

-- Enable RLS (already enabled, but ensure)
alter table registration_documents enable row level security;

-- Policy: Users can insert documents for their own NKV registrations
create policy "Users can insert documents for own nkv_registrations"
on registration_documents for insert
to authenticated
with check (
  exists (
    select 1 from nkv_registrations
    where id = registration_id
    and user_id = auth.uid()
  )
);

-- Policy: Users can view their own registration documents
create policy "Users can view own registration_documents"
on registration_documents for select
to authenticated
using (
  exists (
    select 1 from nkv_registrations
    where id = registration_id
    and user_id = auth.uid()
  )
);

-- Policy: Users can update their own documents (e.g., if needed)
create policy "Users can update own registration_documents"
on registration_documents for update
to authenticated
using (
  exists (
    select 1 from nkv_registrations
    where id = registration_id
    and user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from nkv_registrations
    where id = registration_id
    and user_id = auth.uid()
  )
);

-- Policy: Users can delete their own documents (if allowed)
create policy "Users can delete own registration_documents"
on registration_documents for delete
to authenticated
using (
  exists (
    select 1 from nkv_registrations
    where id = registration_id
    and user_id = auth.uid()
  )
);

-- Admin policies: Admins can view all registration_documents
create policy "Admins can view all registration_documents"
on registration_documents for select
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admin policies: Admins can update any registration_documents
create policy "Admins can update any registration_documents"
on registration_documents for update
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admin policies: Admins can delete any registration_documents
create policy "Admins can delete any registration_documents"
on registration_documents for delete
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);
