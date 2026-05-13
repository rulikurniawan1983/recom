# Database Seed

This script populates sample tracking data for testing the tracking modal.

## Prerequisites

1. **Supabase instance** must be running and accessible
2. **.env file** must contain a Service Role Key (not just anon key)

Add to your `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Required for seeding (service role has admin privileges)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Find the Service Role Key in your Supabase dashboard: **Settings → API → Service Role Key (public)**

## Usage

```bash
npm run db:seed
```

## What it creates

- **1 NKV registration** with tracking number `NKV-2026-XXXXXX` (5-step complete timeline)
- **1 Dokter Hewan registration** with tracking number `DKH-2026-XXXXXX` (up to assessment step)

Both include:
- Registration record in respective table
- Full `tracking_logs` history showing all status transitions
- Linked to the first user found in `profiles` table

## Output

After running the script, you'll see:
- ✅ Confirmation of created records
- 📋 The tracking numbers to test
- All log entries with dates

Use those tracking numbers in the **Cek Status Permohonan** modal on the homepage.

## Notes

- If `profiles` table is empty, the script will fail — create a user first
- The script uses existing `business_units` and `product_types` if available; otherwise it creates minimal entries
- To avoid duplicates, the script doesn't check for existing NKV/Dokter Hewan records — run only on fresh/dev databases
