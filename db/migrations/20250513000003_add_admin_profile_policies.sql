-- Add RLS policies for admin user management

-- Admins can view all profiles
create policy "Admins can view all profiles"
on profiles for select
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  )
);

-- Admins can update any profile
create policy "Admins can update all profiles"
on profiles for update
to authenticated
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  )
);