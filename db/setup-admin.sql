-- Insert admin user directly (requires auth.users to exist)
-- Run this in Supabase SQL editor after user signs up via /register

-- First, sign up via the app registration page with email: admin@recom.com
-- Then run this to set admin role:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@recom.com';