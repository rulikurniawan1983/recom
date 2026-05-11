# Sistem Permohonan Rekomendasi Veteriner Online

Sistem permohonan rekomendasi online untuk Dinas Perikanan dan Peternakan Kabupaten Bogor.

## Fitur

### Jenis Rekomendasi
- **Rekomendasi Nomor Kontrol Veteriner (NKV)** - Untuk pengendalian veteriner pada unit usaha
- **Rekomendasi Praktek Dokter Hewan** - Untuk praktik dokter hewan

### Untuk Pengguna (User)
- Registrasi akun baru
- Login dengan email dan password
- Membuat permohonan NKV atau Dokter Hewan
- Tracking status permohonan secara real-time
- Progress bar visual untuk melihat tahapan proses
- Unduh dokumen rekomendasi setelah disetujui

### Untuk Admin
- Dashboard monitoring semua permohonan
- Statistik permohonan (total, menunggu, disetujui, perlu revisi)
- Verifikasi dokumen
- Manajemen jadwal pemeriksaan lapangan
- Penilaian dan persetujuan rekomendasi

### Fitur Umum
- **Tracking Permohonan Real-time** - Cek status dengan kode tracking
- **Role-based Access Control** - Hak akses berbeda untuk admin dan user
- **Responsive Design** - Tampilan optimal di semua perangkat

## Tech Stack

- **Next.js 16** - React framework dengan Turbopack
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **Supabase** - Backend (Database, Auth, Storage)

## Prerequisites

- Node.js 18+
- NPM atau Yarn
- Akun Supabase

## Setup

### 1. Buat Project Supabase

1. Daftar di [Supabase](https://supabase.com)
2. Buat project baru
3. Catat URL dan anon key dari project settings

### 2. Setup Environment Variables

Buat file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Jalankan Migration

Buka SQL Editor di Supabase Dashboard dan jalankan isi file `db/migrations.sql`.

Atau gunakan Supabase CLI:
```bash
supabase db push
```

### 4. Setup Storage Bucket

Buat storage bucket bernama `registration-documents` dengan akses public:

1. Buka Supabase Dashboard → Storage
2. Create bucket `registration-documents`
3. Set sebagai public

### 5. Install Dependencies

```bash
npm install
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy ke Vercel

1. Push kode ke GitHub repository
2. Buka [Vercel](https://vercel.com)
3. Import repository
4. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik Deploy

## Struktur Folder

```
src/
├── app/
│   ├── admin/
│   │   └── dashboard/       # Dashboard admin
│   │   └── verification/    # Halaman verifikasi
│   ├── api/
│   │   ├── admin/           # API admin (users, status)
│   │   ├── auth/            # Auth session
│   │   ├── registration/    # Submit permohonan
│   │   └── tracking/[code]/ # Cek status permohonan
│   ├── dashboard/           # Dashboard user
│   ├── login/              # Halaman login
│   ├── register/           # Halaman registrasi
│   ├── nkv/register/       # Form permohonan NKV
│   └── dokter-hewan/register/ # Form permohonan Dokter Hewan
├── components/
│   ├── ui/                 # Komponen UI (button, card, modal, dll)
│   ├── registration/       # Komponen form registrasi
│   └── tracking/          # Komponen tracking permohonan
└── lib/
    ├── supabase.ts         # Supabase client (browser)
    ├── supabase-server.ts  # Supabase client (server)
    ├── storage.ts          # Upload file ke storage
    └── types.ts            # Type definitions

db/
└── migrations.sql          # Schema database

```

## API Routes

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/admin/users` | POST | Buat user admin baru |
| `/api/tracking/[code]` | GET | Cek status permohonan |
| `/api/registration` | POST | Submit permohonan baru |
| `/api/admin/nkv/[id]/status` | PUT | Update status NKV |
| `/api/admin/dokter-hewan/[id]/status` | PUT | Update status Dokter Hewan |

## Status Permohonan

| Status | Keterangan |
|--------|------------|
| `draft` | Draft (belum diajukan) |
| `submitted` | Sudah diajukan |
| `document_verification` | Sedang verifikasi dokumen |
| `field_inspection` | Menunggu pemeriksaan lapangan |
| `assessment` | Sedang dinilai |
| `approved` | Disetujui |
| `rejected` | Ditolak |
| `revision_requested` | Perlu revisi |

## Membuat Admin Baru

Gunakan endpoint `/api/admin/users` atau halaman `/setup-admin`:

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","fullName":"Nama Admin","role":"admin"}'
```

## Lisensi

Proyek ini untuk keperluan internal Dinas Perikanan dan Peternakan Kabupaten Bogor.