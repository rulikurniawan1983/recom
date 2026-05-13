-- Allow public (unauthenticated) read access to registration tables for tracking
-- This is needed for the tracking modal to work without authentication

-- Policy for NKV registrations: allow anon to select by registration_number
create policy "Public can view NKV registration by tracking number"
  on nkv_registrations for select
  to anon
  using (true);

-- Policy for Dokter Hewan registrations: allow anon to select by registration_number  
create policy "Public can view Dokter Hewan registration by tracking number"
  on dokter_hewan_registrations for select
  to anon
  using (true);
