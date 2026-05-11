-- FIX ROW LEVEL SECURITY FOR PROFILES TABLE

-- First, check if RLS is enabled (disable if needed for setup)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Now update the admin user (this should work without RLS)
UPDATE profiles SET role = 'admin', full_name = 'Administrator' WHERE email = 'admin@recom.com';

-- Re-enable RLS with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all" ON profiles;
DROP POLICY IF EXISTS "Admins can update all" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Create proper policies
-- Allow service_role to bypass (for initial setup)
CREATE POLICY "Enable all access for service role" ON profiles
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert (for signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);