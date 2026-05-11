# Sistem Permohonan Rekomendasi Veteriner Online
Ruli Kurniawan, S.Pt

Sistem permohonan rekomendasi online untuk Dinas Perikanan dan Peternakan Kabupaten Bogor. Aplikasi ini menyediakan platform digital untuk pengajuan rekomendasi Nomor Kontrol Veteriner (NKV) dan Praktik Dokter Hewan.

## 🎯 Fitur Utama

### Jenis Rekomendasi
- **Rekomendasi Nomor Kontrol Veteriner (NKV)** - Untuk unit usaha produk hewan (RPH, pengolahan daging, susu, telur)
- **Rekomendasi Praktik Dokter Hewan** - Untuk klinik dan praktik dokter hewan

### Untuk Pengguna (User)
- Registrasi akun baru dengan email dan password
- Login dengan autentikasi Supabase
- Membuat permohonan NKV atau Praktik Dokter Hewan
- Upload dokumen pendukung (PDF, gambar)
- Tracking status permohonan secara real-time dengan kode tracking
- Progress bar visual untuk melihat tahapan proses (Draft → Diajukan → Verifikasi → Lapangan → Penilaian → Selesai)
- Unduh dokumen rekomendasi setelah disetujui
- Notifikasi update status via tracking log

### Untuk Admin
- Dashboard monitoring semua permohonan
- Statistik permohonan (total, menunggu verifikasi, disetujui, ditolak, perlu revisi)
- Filter permohonan berdasarkan status
- Pencarian permohonan berdasarkan nomor registrasi atau nama
- Verifikasi dokumen kelengkapan
- Update status permohonan (verifikasi dokumen, jadwal pemeriksaan, penilaian)
- Upload dokumen rekomendasi hasil

### Fitur Umum
- **Tracking Permohonan Real-time** - Cek status dengan kode tracking tanpa login
- **Role-based Access Control** - Hak akses berbeda untuk admin dan user
- **Responsive Design** - Tampilan optimal di semua perangkat (desktop, tablet, mobile)
- **Upload Dokumen** - Upload file ke storage Supabase

## 🛠️ Tech Stack

- **Next.js 16** - React framework dengan Turbopack (super cepat)
- **TypeScript** - Type safety untuk development yang lebih aman
- **Tailwind CSS** - Styling utility-first untuk tampilan modern
- **Supabase** - Backend as a Service (Database PostgreSQL, Auth, Storage)
- **Lucide React** - Icon library modern

## 📋 Persyaratan Sistem

- Node.js 18+ 
- NPM atau Yarn
- Akun Supabase (gratis)

## 🚀 Setup Development

### 1. Buat Project Supabase

1. Daftar di [Supabase](https://supabase.com)
2. Buat project baru
3. Catat URL dan anon key dari **Project Settings → API**

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxx
```

**Catatan:** Service Role Key diperlukan untuk membuat user admin via API.

### 3. Jalankan Migration

Buka SQL Editor di Supabase Dashboard dan jalankan isi file `db/migrations.sql`:

Atau gunakan Supabase CLI:
```bash
supabase db push < db/migrations.sql
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

## 📦 Deployment

### Deploy ke Vercel (Rekomendasi)

1. Push kode ke GitHub repository
2. Buka [Vercel](https://vercel.com)
3. Import repository
4. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik Deploy

### Deploy Manual

```bash
npm run build
npm start
```

## 📁 Struktur Folder

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/              # Dashboard admin
│   │   │   └── page.tsx
│   │   │   └── admin-dashboard-client.tsx
│   │   └── verification/             # Halaman verifikasi
│   │       ├── page.tsx
│   │       └── dokter-hewan/        # Verifikasi dokter hewan
│   ├── api/
│   │   ├── admin/
│   │   │   ├── users/route.ts       # Buat user admin
│   │   │   ├── nkv/[id]/status/     # Update status NKV
│   │   │   ├── dokter-hewan/[id]/status/
│   │   │   └── schedules/route.ts
│   │   ├── auth/
│   │   │   ├── session/route.ts
│   │   │   └── signout/route.ts
│   │   ├── registration/route.ts    # Submit permohonan
│   │   └── tracking/[code]/route.ts # Cek status
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── dashboard-client.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── nkv/register/page.tsx
│   ├── dokter-hewan/register/page.tsx
│   └── setup-admin/page.tsx         # Buat admin baru
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   ├── registration/
│   │   ├── nkv-registration-form.tsx
│   │   ├── dokter-hewan-registration-form.tsx
│   │   └── success-modal.tsx
│   └── tracking/
│       └── tracking-modal.tsx
└── lib/
    ├── supabase.ts                   # Client browser
    ├── supabase-server.ts            # Client server
    ├── storage.ts                    # Upload file
    └── types.ts                      # Type definitions

db/
└── migrations.sql                      # Schema database

public/
└── data/                               # File pendukung
```

## 🔌 API Routes

| Route | Method | Auth | Deskripsi |
|-------|--------|------|-----------|
| `/api/admin/users` | POST | Service Key | Buat user admin baru |
| `/api/tracking/[code]` | GET | Public | Cek status permohonan |
| `/api/registration` | POST | User | Submit permohonan baru |
| `/api/admin/nkv/[id]/status` | PUT | Admin | Update status NKV |
| `/api/admin/dokter-hewan/[id]/status` | PUT | Admin | Update status Dokter Hewan |
| `/api/auth/session` | POST | User | Simpan session |
| `/api/auth/signout` | POST | User | Logout |

## 📊 Status Permohonan

| Status | Keterangan | Progress |
|--------|------------|----------|
| `draft` | Draft (belum diajukan) | 10% |
| `submitted` | Sudah diajukan | 25% |
| `document_verification` | Sedang verifikasi dokumen | 50% |
| `field_inspection` | Menunggu pemeriksaan lapangan | 70% |
| `assessment` | Sedang dinilai | 85% |
| `approved` | Disetujui | 100% |
| `rejected` | Ditolak | 100% |
| `revision_requested` | Perlu revisi | 50% |

## 👨‍💼 Membuat Admin Baru

### Via Halaman Setup Admin

Akses `/setup-admin` dan isi form:
- Nama Lengkap
- Email
- Password

### Via API (curl)

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","fullName":"Nama Admin","role":"admin"}'
```

### Via SQL (manual)

```sql
-- Set role user menjadi admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 🏢 Jenis Usaha yang Dapat Mengajukan

### Rumah Pemotongan Hewan (RPH)
- RPH Unggas (RPU)
- RPH Babi
- RPH Sapi/Ruminansia

### Budidaya
- Usaha budidaya unggas petelur
- Usaha budidaya sapi perah

### Unit Pengolahan
- Usaha pengolahan susu
- Usaha pengolahan daging
- Usaha pengolahan telur
- Usaha pengolahan madu

### Distribusi/Ritel
- Gudang pendingin (cold storage)
- Toko/kios daging (meat shop)
- Unit pendingin susu (milk cooling center)
- Gudang kering
- Tempat pengemasan/pelabelan telur

### Pemasukan & Pengeluaran
- Usaha yang melakukan impor atau ekspor produk hewan

## 🎨 Screenshots

### Homepage
- Navbar dark blue dengan tombol Login dan Tracking
- Judul "Pilih Rekomendasi"
- Tombol NKV dan Dokter Hewan berukuran besar
- Grid 12 jenis usaha yang dapat mengajukan

### Dashboard User
- Statistik permohonan (total, disetujui, dalam proses, revisi)
- Timeline progres status
- Riwayat permohonan dengan tombol unduh

### Dashboard Admin
- Statistik semua permohonan
- Filter berdasarkan status
- Daftar permohonan dengan tombol verifikasi

## 🛠️ Troubleshooting

### Error: "Service Role Key tidak valid"
Pastikan `SUPABASE_SERVICE_ROLE_KEY` benar dan dari Project Settings → API

### Error: "Migration gagal"
Jalankan SQL migration di Supabase Dashboard secara manual

### Error: "Storage upload gagal"
Pastikan bucket `registration-documents` sudah dibuat dan public

## 📄 Lisensi

Proyek ini untuk keperluan internal Dinas Perikanan dan Peternakan Kabupaten Bogor.

Copyright 2026 - DINAS PERIKANAN DAN PETERNAKAN KABUPATEN BOGOR
#   r e k o m e n d a s i  
 