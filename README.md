# Sistem Rekomendasi NKV

Aplikasi web Next.js untuk pendaftaran Rekomendasi NKV (Neraca Keseimbangan Vitalitas) dengan database Supabase.

## Fitur

- **Autentikasi**: Login admin dan user
- **Pendaftaran Online**: Formulir pendaftaran NKV dengan 4 langkah
- **Verifikasi Dokumen**: Admin dapat memverifikasi dokumen pendaftar
- **Pemeriksaan Lapangan**: Jadwal pemeriksaan oleh petugas
- **Penilaian & Rekomendasi**: Proses penilaian dan persetujuan
- **Unduh Rekomendasi**: Download dokumen NKV yang disetujui

## Setup

### 1. Supabase Setup

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan migration di `db/migrations.sql`:
   - Buka SQL Editor di Supabase Dashboard
   - Paste dan jalankan semua query dari file migrations.sql
3. Buat storage bucket `registration-documents` (Public)
4. Copy URL dan anon key ke `.env.local`

### 2. Environment Variables

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

## Deployment ke Vercel

1. Push kode ke GitHub
2. Import project di Vercel
3. Tambahkan environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Struktur Aplikasi

```
src/
├── app/
│   ├── login/          # Halaman login
│   ├── register/       # Halaman register
│   ├── dashboard/      # Dashboard user/admin
│   ├── registration/   # Form pendaftaran NKV
│   └── admin/          # Halaman admin
├── components/
│   ├── ui/             # Komponen UI (Button, Card, dll)
│   └── registration/   # Form pendaftaran
└── lib/
    ├── supabase.ts     # Client Supabase
    ├── supabase-server.ts # Server Supabase
    └── types.ts        # Type definitions
```

## Workflow Pendaftaran NKV

1. **Pendaftaran Online**: Isi form unit usaha, produk, dokumen
2. **Verifikasi Dokumen**: Admin verifikasi kelengkapan berkas
3. **Pemeriksaan Lapangan**: Jadwal kunjungan ke lokasi usaha
4. **Penilaian & Rekomendasi**: Proses penilaian dan persetujuan
5. **Unduh Rekomendasi**: Download dokumen NKV