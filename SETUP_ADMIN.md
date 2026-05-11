# Setup Admin User

## Cara 1: Via Dashboard Supabase
1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Add User"
3. Email: `admin@recom.com`
4. Password: `admin123`
5. Setelah user dibuat, catat User ID (UUID)
6. Buka SQL Editor dan jalankan:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('USER_ID_FROM_ABOVE', 'admin@recom.com', 'Administrator', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

## Cara 2: Via CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create user
supabase auth users create \
  --email admin@recom.com \
  --password admin123 \
  --user-metadata '{"role": "admin"}'
```

## Cara 3: Via Seed Data
Jalankan di SQL Editor Supabase:

```sql
-- Setelah membuat user di Auth, dapatkan UUID-nya
-- Lalu jalankan:
UPDATE profiles 
SET role = 'admin', 
    full_name = 'Administrator'
WHERE email = 'admin@recom.com';
```

## Login
- URL: `/login`
- Email: `admin@recom.com`
- Password: `admin123`