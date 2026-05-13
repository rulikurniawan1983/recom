# Sistem Rekomendasi Online

Sistem rekomendasi online untuk verifikasi dan penilaian dokumen, dengan alur kerja lengkap dari pengajuan permohonan hingga penerbitan rekomendasi.

---

## 📋 Daftar Isi

- [Ikhtisar](#ikhtisar)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi & Setup](#instalasi--setup)
- [Alur Kerja Admin](#alur-kerja-admin)
- [Alur Kerja Pemohon](#alur-kerja-pemohon)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Kode Status (Status Codes)](#kode-status)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Ikhtisar

Platform ini mengotomatisasi proses rekomendasi untuk layanan tertentu (misalnya: pengobatan hewan, nursing, atau sejenisnya). Pemohon mengajukan permohonan online, mengunggah dokumen required, dan admin memverifikasi dokumen, menjadwalkan pemeriksaan lapangan, serta memberikan penilaian akhir yang diterbitkan sebagai PDF.

---

## Fitur

### 🔐 Auth & User Management
- Registrasi pemohon (NKV & Dokter Hewan)
- Login/Logout dengan Supabase Auth
- Role-based access: `user`, `admin`
- Admin dapat mengelola pengguna (tambah/hapus)

### 📄 Aplikasi & Dokumen
- Pembuatan permohonan baru dengan upload dokumen
- Dukungan 2 jenis layanan: **NKV** dan **Dokter Hewan**
- Tracking status permohonan real-time
- Upload multiple dokumen dengan tipe tertentu

### 👨‍💼 Admin Dashboard
- **Dashboard ringkasan**: total permohonan, grafik tren
- **Daftar permohonan**: tabel lengkap dengan filter & pencarian
- **Verifikasi dokumen**: approved/rejected/revision request per-dokumen
- **Jadwal pemeriksaan lapangan**: input tanggal, waktu, lokasi
- **Input penilaian**: skor 0-100, catatan, upload PDF rekomendasi
- **Pratinjau dokumen**: preview langsung (PDF/image) tanpa keluar dari modal
- **Status workflow otomatis**: state transitions based on actions

---

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI Library** | Shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **PDF** | Browser native PDF viewer + manual upload for recommendations |

---

## Struktur Proyek

```
recom/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx          ← Admin dashboard (all-in-one)
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── registrations/[id]/
│   │   │   │   │   ├── assess          ← POST: input penilaian
│   │   │   │   │   ├── documents/      ← GET: list dokumen
│   │   │   │   │   ├── documents/[docId] ← PATCH: update dokumen
│   │   │   │   │   ├── schedule        ← POST: jadwal pemeriksaan
│   │   │   │   │   └── verify          ← POST: verifikasi permohonan
│   │   │   │   ├── users/              ← GET/POST: list & create users
│   │   │   │   └── users/[userId]/     ← DELETE: hapus user
│   │   │   ├── dokter-hewan/[id]/status ← PATCH: status DH
│   │   │   ├── nkv/[id]/status          ← PATCH: status NKV
│   │   │   ├── promote/[id]             ← POST: promosi user→admin
│   │   │   ├── schedules                ← GET: list jadwal
│   │   │   ├── setup-first              ← POST: init admin pertama
│   │   │   ├── upload                   ← POST: upload file
│   │   │   └── whoami                   ← GET: current user
│   │   ├── dokter-hewan/
│   │   │   └── register/
│   │   ├── nkv/
│   │   │   └── register/
│   │   ├── registration/
│   │   │   └── new/
│   │   ├── tracking/
│   │   │   └── [code]/
│   │   └── layout.tsx, page.tsx, middleware.ts
│   ├── components/
│   │   └── ui/                    ← Shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts            ← Supabase client
│   │   └── types.ts               ← TypeScript interfaces
│   └── styles/
│       └── globals.css
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Instalasi & Setup

### Prasyarat
- Node.js 18+
- npm / yarn / pnpm
- Akun Supabase (cloud atau self-hosted)

### 1. Clone Repository
```bash
git clone <repository-url>
cd recom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env.local` berbasis `.env.local.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=http://localhost:3000

# Storage buckets (optional customization)
NEXT_PUBLIC_STORAGE_BUCKET_DOKUMEN=dokumen
NEXT_PUBLIC_STORAGE_BUCKET_RECOMMENDATION=recommendation
```

> **⚠️ Penting:** `SUPABASE_SERVICE_ROLE_KEY` harus disimpan rahasia. Jangan commit ke repo.

### 4. Inisialisasi Database
Jalankan SQL setup di Supabase SQL Editor:

```sql
-- File: supabase-schema.sql (disediakan terpisah)
-- atau manual melalui Supabase Dashboard

-- 1. Enable extensions
create extension if not exists "uuid-ossp";

-- 2. Create tables
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text unique not null,
  role text check (role in ('user', 'admin')) default 'user',
  company_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists registrations (
  id uuid primary key default uuid_generate_v4(),
  registration_number text unique not null,
  type text check (type in ('NKV', 'Dokter Hewan')) not null,
  applicant_name text not null,
  email text not null,
  phone text not null,
  status text check (status in (
    'draft',
    'submitted',
    'document_verification',
    'field_inspection',
    'assessment',
    'approved',
    'rejected',
    'revision_requested'
  )) default 'draft',
  assessment_score integer,
  assessment_notes text,
  recommendation_file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) on delete cascade not null,
  registration_type text not null,
  document_type text not null,
  file_url text not null,
  file_name text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verified boolean default false,
  verified_at timestamp with time zone,
  status text check (status in ('pending', 'approved', 'rejected', 'revision_requested')) default 'pending',
  admin_notes text
);

create table if not exists schedules (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references registrations(id) on delete cascade not null,
  scheduled_date date not null,
  scheduled_time time not null,
  location text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table registrations enable row level security;
alter table documents enable row level security;
alter table schedules enable row level security;

-- Policies (simplified – adjust per your needs)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Admins can do everything" on registrations for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can view own registrations" on registrations for select using (
  email = auth.jwt()->>'email' or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  )
);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('dokumen', 'dokumen', false);
insert into storage.buckets (id, name, public) values ('recommendation', 'recommendation', false);

-- Storage policies
create policy "Authenticated users can upload dokumen" on storage.objects for insert
  with check (bucket_id = 'dokumen' and auth.role() = 'authenticated');

create policy "Admins can view all dokumen" on storage.objects for select
  using (bucket_id = 'dokumen' and exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Functions & Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger set_updated_at before update on registrations
  for each row execute procedure update_updated_at_column();

create trigger set_updated_at before update on schedules
  for each row execute procedure update_updated_at_column();
```

### 5. Setup First Admin
Jalankan API untuk membuat admin pertama:

```bash
# PastikanSupabase sudah ter-deploy, lalu:
curl -X POST http://localhost:3000/api/admin/setup-first \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepassword"}'
```

Atau buka `/setup-first-admin` di browser.

### 6. Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

---

## Alur Kerja Admin

### 1. Login ke Dashboard
- Kunjungi `/admin` atau klik "Admin Panel" dari menu
- Login dengan akun yang memiliki role `admin`

### 2. Verifikasi Dokumen
**Status awal:** `submitted` → admin melihat daftar permohonan

**Cara verifikasi:**
- Klik **"Verifikasi Dokumen"** pada baris permohonan → modal **Detail Permohonan** terbuka
- Tab **Dokumen** menampilkan semua file yang diupload
- Admin bisa:
  - Klik kartu dokumen untuk **preview** (PDF/image langsung ditampilkan)
  - Klik **Setujui** → status dokumen `approved`
  - Klik **Revisi** → status `revision_requested` (catatan opsional)
  - Klik **Tolak** → status `rejected` (catatan wajib)
- Setelah semua dokumen NKV disetujui, banner hijau muncul: *"Semua dokumen telah diverifikasi. Siap untuk menjadwalkan pemeriksaan lapangan."*

**Catatan:** Hanya dokumen untuk layanan **NKV** yang diverifikasi satu per satu. Untuk **Dokter Hewan**, verifikasi dilakukan secara keseluruhan pada permutation.

### 3. Jadwalkan Pemeriksaan Lapangan
**Ketika semua dokumen NKV disetujui:**
- Tombol **"Jadwalkan Pemeriksaan Lapangan"** muncul di footer modal (atau dari dropdown di tabel)
- Isi form:
  - Tanggal & Waktu
  - Lokasi pemeriksaan
  - Catatan (opsional)
- Klik **Jadwalkan** → status permutation menjadi `field_inspection`
- Notifikasi berhasil muncul

### 4. Input Penilaian
**Setelah pemeriksaan lapangan selesai:**
- Klik **"Input Penilaian"** pada baris permutation (status `field_inspection` atau `assessment`)
- Masukkan:
  - **Skor (0–100)** – minimal 75 untuk disetujui
  - **Catatan Penilaian** (wajib) – detail temuan, rekomendasi
  - **URL File Rekomendasi** (opsional) – link ke PDF hasil penilaian yang di-upload manual
- Klik **Simpan Penilaian**:
  - Jika skor ≥ 75 → status menjadi `approved`
  - Jika skor < 75 → status menjadi `rejected`
- Sistem menampilkan notifikasi hasil

### 5. (Opsional) Minta Revisi / Tolak
- Tombol **"Minta Revisi"** tersedia untuk permohonan non-final (kecuali draft)
- Tombol **"Tolak"** tersedia untuk permohonan non-final & non-draft
- Keduanya membutuhkan catatan admin (wajib untuk tolak)

### 6. Lihat Dokumen
- Klik **"Lihat Detail"** untuk membuka modal dengan tab:
  - **Dokumen**: list dokumen + aksi verifikasi
  - **Informasi**: data pemohon & permutation
  - **Riwayat**: (akan segera tersedia)

---

## Alur Kerja Pemohon

### 1. Registrasi & Login
- Kunjungi halaman registrasi: `/nkv/register` (untuk NKV) atau `/dokter-hewan/register` (untuk Dokter Hewan)
- Isi form lengkap dengan data pribadi & perusahaan
- Setelah registrasi, login di `/login`

### 2. Ajukan Permohonan Baru
- Klik **"Ajukan Permohonan Baru"** di dashboard user
- Pilih jenis layanan (NKV / Dokter Hewan)
- Upload dokumen required (berdasarkan jenis):
  - **Contoh NKV**: Surat Permohonan, SIUP, TDP, etc.
  - **Contoh Dokter Hewan**: Izin Praktek, Sertifikat, dll.
- Klik **"Kirim Permohonan"** → status menjadi `submitted`

### 3. Lacak Status Permohonan
- Di dashboard user, lihat daftar permohonan beserta status
- Status yang mungkin:
  - `submitted` – menunggu verifikasi dokumen
  - `document_verification` – dokumen diverifikasi, menunggu jadwal
  - `field_inspection` – pemeriksaan lapangan dijadwalkan
  - `assessment` – sedang dinilai
  - `approved` – disetujui
  - `rejected` – ditolak
  - `revision_requested` – diminta revisi

### 4. Revisi Dokumen (jika diminta)
- Jika admin meminta revisi, klik **"Revisi"** pada permohonan
- Upload dokumen revisi dengan catatan admin
- Admin akan diverifikasi kembali

### 5. Download Hasil
- Jika disetujui, cek email atau dashboard untuk link PDF rekomendasi
- Download dan gunakan sesuai kebutuhan

---

## API Endpoints

### Admin Routes (Protected – Hanya Admin)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/admin/whoami` | Cek role & info user login |
| `GET` | `/api/admin/users` | List semua pengguna |
| `POST` | `/api/admin/users` | Tambah pengguna baru |
| `DELETE` | `/api/admin/users/[userId]` | Hapus pengguna |
| `POST` | `/api/admin/setup-first` | Buat admin pertama |
| `GET` | `/api/admin/applications` | List semua permohonan |
| `GET` | `/api/admin/schedules` | List semua jadwal pemeriksaan |
| `POST` | `/api/admin/registrations/[id]/verify` | Verifikasi/Revisi/Tolak permohonan |
| `GET` | `/api/admin/registrations/[id]/documents` | List dokumen permohonan |
| `PATCH` | `/api/admin/registrations/[id]/documents/[docId]` | Update status dokumen |
| `POST` | `/api/admin/registrations/[id]/schedule` | Jadwalkan pemeriksaan lapangan |
| `POST` | `/api/admin/registrations/[id]/assess` | Input penilaian & rekomendasi |
| `PATCH` | `/api/admin/nkv/[id]/status` | Update status NKV (legacy) |
| `PATCH` | `/api/admin/dokter-hewan/[id]/status` | Update status Dokter Hewan (legacy) |
| `POST` | `/api/admin/promote/[id]` | Promosikan user menjadi admin |

### Public / Auth Routes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/registration` | Buat permohonan baru (user) |
| `GET` | `/api/registration` | List permohonan user login |
| `GET` | `/api/registration/[id]` | Detail permohonan user |
| `GET` | `/api/nkv/[id]` | Detail permohonan NKV (public tracking) |
| `GET` | `/api/dokter-hewan/[id]` | Detail permohonan Dokter Hewan |
| `GET` | `/api/tracking/[code]` | Lacak status dengan kode |
| `POST` | `/api/auth/signout` | Logout |
| `GET` | `/api/auth/session` | Cek sesi aktif |

### File Upload
- `POST` `/api/admin/upload` – Upload file ke Supabase Storage (middleware)

---

## Database Schema

### Tabel Utama

#### `profiles`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID (FK → auth.users) | ID user (primary key) |
| `full_name` | TEXT | Nama lengkap |
| `email` | TEXT (unique) | Email login |
| `role` | TEXT (`user`/`admin`) | Peran akses |
| `company_name` | TEXT | Nama perusahaan/instansi |
| `phone` | TEXT | Nomor telepon |
| `created_at` | TIMESTAMPTZ | Tanggal registrasi |
| `updated_at` | TIMESTAMPTZ | Terakhir diperbarui |

#### `registrations`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID (PK) | ID permohonan |
| `registration_number` | TEXT (unique) | Nomor registrasi (RN-XXXXX) |
| `type` | TEXT (`NKV`/`Dokter Hewan`) | Jenis layanan |
| `applicant_name` | TEXT | Nama pemohon/unit usaha |
| `email` | TEXT | Email kontak |
| `phone` | TEXT | Telepon |
| `status` | TEXT | Status workflow |
| `assessment_score` | INTEGER | Skor penilaian (0–100) |
| `assessment_notes` | TEXT | Catatan hasil penilaian |
| `recommendation_file_url` | TEXT | Link PDF rekomendasi |
| `created_at` | TIMESTAMPTZ | Tanggal pengajuan |
| `updated_at` | TIMESTAMPTZ | Terakhir diperbarui |

#### `documents`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID (PK) | ID dokumen |
| `registration_id` | UUID (FK) | ID permohonan |
| `registration_type` | TEXT | Tipe permutation (NKV/Dokter Hewan) |
| `document_type` | TEXT | Nama jenis dokumen |
| `file_url` | TEXT | URL file di Supabase Storage |
| `file_name` | TEXT | Nama file asli |
| `uploaded_at` | TIMESTAMPTZ | Waktu unggah |
| `verified` | BOOLEAN | Apakah diverifikasi? |
| `verified_at` | TIMESTAMPTZ | Waktu verifikasi |
| `status` | TEXT (`pending`/`approved`/`rejected`/`revision_requested`) | Status dokumen |
| `admin_notes` | TEXT | Catatan dari admin |

#### `schedules`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | UUID (PK) | ID jadwal |
| `registration_id` | UUID (FK) | ID permohonan |
| `scheduled_date` | DATE | Tanggal pemeriksaan |
| `scheduled_time` | TIME | Waktu pemeriksaan |
| `location` | TEXT | Lokasi pemeriksaan |
| `notes` | TEXT | Catatan tambahan |
| `created_at` | TIMESTAMPTZ | Dibuat pada |

---

## Kode Status (Status Codes)

### Registrations.status

| Kode | Label | Deskripsi |
|------|-------|-----------|
| `draft` | Draft | Permohonan masih dalam kantong (belum dikirim) |
| `submitted` | Submitted | Dokumen diajukan, menunggu verifikasi awal |
| `document_verification` | Document Verification | Dokumen diverifikasi, menunggu jadwal |
| `field_inspection` | Pemeriksaan Lapangan | Sudah dijadwalkan, menunggu pelaksanaan |
| `assessment` | Assessment | Pemeriksaan selesai, menunggu penilaian |
| `approved` | Approved | Permohonan diterima |
| `rejected` | Rejected | Permohonan ditolak |
| `revision_requested` | Revision Requested | Diminta revisi dokumen |

### Documents.status

| Kode | Label | Deskripsi |
|------|-------|-----------|
| `pending` | Menunggu | Belum diverifikasi |
| `approved` | Disetujui | Dokumen OK |
| `rejected` | Ditolak | Dokumen tidak memenuhi syarat |
| `revision_requested` | Perlu Revisi | Diminta perbaikan |

---

## Development Guidelines

### Code Style
- **TypeScript** – strict mode enabled
- **ESLint** – run `npm run lint` before commit
- **Prettier** – formatting via `npm run format`
- **Component structure** – functional components with hooks
- **Naming** – PascalCase for components, camelCase for variables/functions

### Adding New Document Types
1. Update `src/lib/types.ts` – `DocumentType` enum if needed
2. Update upload form di `src/app/registration/new/page.tsx`
3. Update admin filter di `src/app/admin/page.tsx` jika perlu
4. Update API di `src/app/api/admin/...`

### Adding New Status
Jika ingin menambah status di workflow:
1. Tambah ke `RegistrationStatus` type di `src/lib/types.ts`
2. Tambah entry di `STATUS_LABELS` & `STATUS_COLORS` di admin page
3. Update logika `handleVerification` & `handleAssess` di admin page
4. Update API endpoints yang relevan
5. Update dropdown filter di dashboard admin

### Customizing Icons
Icons from `lucide-react`. Import:
```tsx
import { Mail, File, CheckCircle } from 'lucide-react';
```
Pastikan icon sudah ada di package: https://lucide.dev/icons

---

## Troubleshooting

### Error: "creatingUser is not defined"
Sudah diperbaiki – pastikan state `creatingUser` didefinisikan di `src/app/admin/page.tsx:135`

### Error: "Unexpected token. Did you mean '}'?"
Biasanya karena JSX tuyul (extra/missing tags). Cek balance:
- Setiap `<div>` harus punya `</div>`
- Setiap `{conditional && (...)}` harus ditutup `}`
- Modal structure harus balance

### Files not uploading to Supabase Storage
1. Cek bucket sudah dibuat (`dokumen`, `recommendation`)
2. Cek RLS policy untuk storage.objects
3. Cek `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`

### PDF preview not showing
- File harus `.pdf` dan accessible (public URL atau signed URL)
- Some browsers block iframe PDFs dari domain lain – pastikan CORS di Supabase Storage diizinkan
- Admin dropdown峙 to document preview using `<iframe src={url}>`

### Build error: "middleware file convention is deprecated"
Ini hanya warning. Gunakan `next.config.js` dengan `rewrites` jika ingin proxy. Tidak mempengaruhi build.

### Admin cannot see documents
- Cek role user di `profiles.role` = `'admin'`
- Cek RLS policy pada tabel `documents` & `registrations`
- Admin harus punya akses `SELECT` ke semua records

### Status doesn't update after action
1. Cek API response di browser Network tab
2. Pastikan API route	run correctly (check Supabase logs)
3. Cek triggers pada tabel `registrations` untuk `updated_at`

---

## Contributing

Pull requests welcome. Untuk perubahan besar, buka issue dulu untuk discuss.

### Development Workflow
1. Fork & branch baru (`feature/feature-name` atau `fix/bug-name`)
2. Run locally, pastikan `npm run build` sukses
3. Test di http://localhost:3000
4. Commit dengan pesan yang jelas
5. Push & buat PR ke `main`

---

## License

MIT License – lihat file `LICENSE` untuk detail.

---

## Support

Untuk pertanyaan atau issues, buka ticket di GitHub repository atau hubungi admin sistem.

**Sistem Rekomendasi Online** © 2026
