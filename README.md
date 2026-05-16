# SLIDER-VETSYS

Ruli Kurniawan, S.)t

Sistem manajemen kesehatan hewan peliharaan yang mencakup layanan vaksinasi, pengobatan, dan konsultasi, dengan alur kerja lengkap dari pendaftaran hewan hingga pengelolaan riwayat kesehatan dan layanan yang diterima.

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

SLIDER-VETSYS adalah sistem manajemen kesehatan hewan peliharaan yang setelah login atau registrasi, pengguna diarahkan ke dashboard pengguna tempat mereka dapat memilih layanan: Pelayanan Kesehatan Hewan, Rekomendasi Nomor Kontrol Veteriner, dan Rekomendasi Praktek Dokter Hewan. Pada dashboard pengguna, pemohon bisa mengisi detail hewan yang sehat untuk divaksinasi atau detail hewan sakit yang akan diobati oleh dokter hewan, serta mengajukan konsultasi terkait kesehatan hewan. Pada dashboard admin, admin dapat menangani permohonan vaksinasi, pengobatan, dan konsultasi yang diminta oleh pengguna/pemohon.

---

## Fitur

### 🐾 Sistem Manajemen Hewan Peliharaan Komprehensif
- **Pengolahan Data Hewan Lengkap**: Input danedit data hewan peliharaan termasuk nama, spesies, breed, umur, berat, warna, dan ciri khas
- **Riwayat Kesehatan Terintegrasi**: Catatan kesehatan hewan yang dapat diakses dan diperbarui kapan saja
- **Galeri Dokumentasi**: Sistem upload dan management foto/fitur khusus hewan untuk referensi medis
- **Status Aktif/Non-aktif**: Kemudahan mengarsipkan data hewan yang tidak lagi aktif tanpa menghapus riwayat lengkap

### 📊 Pelacakan Riwayat Kesehatan dan Layanan Hewan
- **Tracking Vaksinasi**: Riwayat lengkap vaksinasi dengan tanggal, jenis vaksin, status, dan QR code verifikasi
- **Riwayat Pengobatan**: Dokumentasi detail pengobatan termasuk deskripsi, obat yang diberikan, dan status penyembuhan
- **Jadwal Konsultasi**: Manajemen janji konsultasi dengan dokter hewan termasuk jenis konsultasi, tanggal, dan catatan hasil
- **Status Layanan Real-time**: Visualisasi status setiap layanan (pending, scheduled, completed) dengan indikator warna yang jelas

### 🏥 Dashboard Pengguna

Setelah login, pengguna akan diarahkan ke dashboard pengguna yang telah diorganisir ulang untuk memberikan pengalaman yang lebih intuitif:

### Navigasi Sidebar yang Disederhanakan
- **Dashboard** - Halaman utama dengan layanan utama
- **Manajemen Profil** - Mengedit informasi pribadi dan akun
- **Pengaturan Akun** - Mengatur preferensi notifikasi dan bahasa

### Tiga Layanan Utama di Halaman Utama
Dashboard menampilkan tiga pilihan layanan utama dalam format kartu yang jelas:

1. **Pelayanan Kesehatan Hewan**
   - Vaksinasi hewan sehat
   - Pengobatan hewan sakit  
   - Konsultasi kesehatan hewan

2. **Nomor Kontrol Veteriner (NKV)**
   - Pengajuan permohonan NKV baru
   - Pengembangan usaha bidang kesehatan hewan
   - Pembaruan dan perpanjangan NKV

3. **Rekomendasi Praktek Dokter Hewan**
   - Untuk dokter hewan yang membuka praktik baru
   - Mengubah lokasi praktik
   - Memperpanjang izin praktik

Setiap kartu layanan memberikan deskripsi singkat dan mengarahkan pengguna langsung ke formulir pendaftaran yang sesuai ketika diklik.

### Statistik dan Filter
Di bawah layanan utama, pengguna masih dapat melihat:
- Statistik permohonan (total, draft, diproses, disetujui)
- Filter pencarian berdasarkan nomor registrasi, nama usaha, atau nama lengkap
- Filter berdasarkan status dan jenis layanan
- Tabel riwayat permohonan dengan opsi detail, edit, hapus, dan ajukan ulang

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

### 1. Login ke Dashboard Admin
- Kunjungi `/admin` atau klik "Admin Panel" dari menu
- Login dengan akun yang memiliki role `admin`

### 2. Dashboard Admin
- Setelah login, admin akan melihat dashboard dengan tampilan ringkasan permohonan yang masuk
- Terdapat tiga jenis layanan yang dapat dikelola:
  1. **Pelayanan Kesehatan Hewan (Vaksinasi)** - untuk hewan sehat yang akan divaksinasi
  2. **Rekomendasi Nomor Kontrol Veteriner** - untuk pendaftaran dan verifikasi NKV
  3. **Rekomendasi Praktek Dokter Hewan** - untuk verifikasi dan rekomendasi praktek dokter hewan
- Admin dapat menyaring permohonan berdasarkan jenis layanan, status, dan rentang tanggal

### 3. Menangani Permohonan Vaksinasi (Hewan Sehat)
**Status awal:** `draft` → setelah pengguna mengisi detail hewan sehat dan mengajukan permohonan vaksinasi, status menjadi `submitted_vaksinasi`
- Admin melihat daftar permohonan vaksinasi yang statusnya `submitted_vaksinasi`
- Untuk setiap permohonan, admin dapat:
  - Melihat detail hewan yang akan divaksinasi (nama, spesies, breed, umur, berat, warna, ciri khas)
  - Memeriksa riwayat kesehatan dan vaksinasi sebelumnya
  - Memverifikasi kebenaran data hewan yang diberikan pengguna
  - Menyetujui permohonan vaksinasi → status menjadi `approved_vaksinasi`
  - Menolak permohonan vaksinasi dengan memberikan alasan → status menjadi `rejected_vaksinasi`
  - Meminta revisi data hewan → status menjadi `revision_vaksinasi` (opsional)
- Setelah disetujui, sistem otomatis menghasilkan jadwal vaksinasi berdasarkan kebijakan klinik dan memberitahukan pengguna

### 4. Menangani Permohonan Pengobatan (Hewan Sakit)
**Status awal:** `draft` → setelah pengguna mengisi detail hewan sakit dan mengajukan permohonan pengobatan, status menjadi `submitted_pengobatan`
- Admin melihat daftar permohonan pengobatan yang statusnya `submitted_pengobatan`
- Untuk setiap permohonan, admin dapat:
  - Melihat detail hewan sakit dan gejala yang dilaporkan pengguna
  - Menetapkan dokter hewan yang akan menangani kasus berdasarkan spesialisasi
  - Menjadwalkan konsultasi awal untuk diagnosis
  - Menyetujui permohonan pengobatan → status menjadi `approved_pengobatan`
  - Menolak permohonan pengobatan dengan memberikan alasan → status menjadi `rejected_pengobatan`
  - Meminta informasi tambahan atau hasil pemeriksaan awal → status menjadi `revision_pengobatan` (opsional)
- Setelah disetujui, pengguna dapat melanjutkan ke tahap pengobatan sesuai jadwal yang telah ditetapkan dengan dokter yang ditugaskan

### 5. Menangani Permohonan Konsultasi Kesehatan Hewan
**Status awal:** `draft` → setelah pengguna mengajukan permohonan konsultasi terkait kesehatan hewan, status menjadi `submitted_konsultasi`
- Admin melihat daftar permohonan konsultasi yang statusnya `submitted_konsultasi`
- Untuk setiap permohonan, admin dapat:
  - Melihat jenis konsultasi yang diminta (misalnya: konsultasi gizi, konsultasi perilaku, konsultasi pasca-operasi, konsultasi umum)
  - Menetapkan dokter hewan spesialis sesuai jenis konsultasi yang diminta
  - Menjadwalkan waktu konsultasi berdasarkan ketersediaan dokter dan klinik
  - Menyetujui permohonan konsultasi → status menjadi `approved_konsultasi`
  - Menolak permohonan konsultasi dengan memberikan alasan → status menjadi `rejected_konsultasi`
  - Meminta klarifikasi topik konsultasi atau informasi tambahan → status menjadi `revision_konsultasi` (opsional)
- Setelah disetujui, sistem akan mengirimkan konfirmasi jadwal konsultasi kepada pengguna termasuk dokter yang ditugaskan, tanggal, waktu, dan lokasi konsultasi

### 6. Menangani Permohonan Rekomendasi Nomor Kontrol Veteriner (NKV)
**Status awal:** `draft` → setelah pengguna mengajukan permohonan NKV dan mengunggah dokumen yang diperlukan, status menjadi `submitted_nkv`
- Admin melihat daftar permohonan NKV yang statusnya `submitted_nkv`
- Untuk setiap permohonan, admin dapat:
  - Melihat data pemohon dan perusahaan/instansi
  - Memverifikasi dokumen yang diupload (SIUP, TDP, surat permohonan, dll.)
  - Menyetujui permohonan NKV → status menjadi `approved_nkv` dan sistem menghasilkan nomor kontrol veteriner
  - Menolak permohonan NKV dengan memberikan alasan → status menjadi `rejected_nkv`
  - Meminta revisi dokumen → status menjadi `revision_nkv` (opsional)
- Sistem mencatat nomor kontrol veteriner yang telah diberikan untuk referensi di masa depan

### 7. Menangani Permohonan Rekomendasi Praktek Dokter Hewan
**Status awal:** `draft` → setelah dokter hewan mengajukan permohonan praktek dan mengunggah dokumen yang diperlukan, status menjadi `submitted_praktik`
- Admin melihat daftar permohonan praktek dokter hewan yang statusnya `submitted_praktik`
- Untuk setiap permohonan, admin dapat:
  - Melihat data dokter hewan (nama, nomor STR, spesialisasi, tempat praktik)
  - Memverifikasi dokumen yang diupload (Sertifikat Str, SIP, surat izin praktik, dll.)
  - Menyetujui permohonan praktek → status menjadi `approved_praktik` dan sistem memberikan rekomendasi praktek
  - Menolak permohonan praktek dengan memberikan alasan → status menjadi `rejected_praktik`
  - Meminta revisi dokumen → status menjadi `revision_praktik` (opsional)
- Sistem mencatat dokter hewan yang telah mendapatkan rekomendasi praktek untuk referensi verifikasi secara berkala

### 8. Monitoring dan Laporan
- Admin dapat melihat laporan harian, mingguan, atau bulanan mengenai jumlah permohonan yang disetujui, ditolak, dan dalam proses untuk setiap jenis layanan
- Terdapat grafik distribusi jenis layanan yang paling sering diminta dan tren permohonan dari waktu ke waktu
- Admin dapat mengekspor data dalam format CSV atau PDF untuk keperluan administrasi dan audit
- Sistem memberikan notifikasi kepada admin apabila ada permohonan yang telah menunggu lebih dari batas waktu yang ditentukan

---

## Alur Kerja Pemohon

### 1. Registrasi & Login
- Kunjungi halaman registrasi sesuai jenis layanan yang diinginkan:
  - `/nkv/register` untuk Nomor Kontrol Veteriner
  - `/dokter-hewan/register` untuk Rekomendasi Praktek Dokter Hewan
  - Atau langsung login jika sudah memiliki akun
- Isi form lengkap dengan data pribadi & perusahaan (jika適用)
- Setelah registrasi, login di `/login`

### 2. Dashboard Pengguna
- Setelah login, pengguna akan diarahkan ke dashboard pengguna
- Pada dashboard pengguna, terdapat tiga pilihan layanan utama:
  1. **Pelayanan Kesehatan Hewan** - untuk vaksinasi hewan sehat atau pengobatan hewan sakit
  2. **Rekomendasi Nomor Kontrol Veteriner (NKV)** - untuk pendaftaran dan verifikasi NKV
  3. **Rekomendasi Praktek Dokter Hewan** - untuk verifikasi dan rekomendasi praktek dokter hewan
- Pengguna dapat memilih layanan yang sesuai dengan kebutuhan

### 3. Mengajukan Permohonan Baru
- Klik **"Ajukan Permohonan Baru"** di dashboard pengguna
- Pilih jenis layanan yang diinginkan:
  - **Pelayanan Kesehatan Hewan** (untuk vaksinasi atau pengobatan)
  - **Rekomendasi Nomor Kontrol Veteriner**
  - **Rekomendasi Praktek Dokter Hewan**
- Berdasarkan jenis layanan yang dipilih, pengguna akan diminta mengisi formulir yang sesuai

### 4. Untuk Layanan Pelayanan Kesehatan Hewan
#### A. Vaksinasi Hewan Sehat
- Pilih oonika "Vaksinasi Hewan Sehat"
- Isi detail hewan yang akan divaksinasi:
  - Nama hewan
  - Spesies (Anjing, Kucing, Sapi, dll.)
  - Breed/Ras
  - Umur (tahun dan bulan)
  - Jenis kelamin (Jantan/Betina)
  - Berat (kg)
  - Warna bulu
  - Ciri khas khusus
  - Riwayat kesehatan (opsional)
- Pilih jenis vaksinasi yang diinginkan berdasarkan rekomendasi dokter hewan atau jadwal standar
- Unggah dokumentasi pendukung jika diperlukan (Kartu vaksinasi sebelumnya, dll.)
- Klik **"Kirim Permohonan Vaksinasi"** → status menjadi `submitted_vaksinasi`

#### B. Pengobatan Hewan Sakit
- Pilih oonika "Pengobatan Hewan Sakit"
- Isi detail hewan yang sakit:
  - Nama hewan
  - Spesies
  - Breed/Ras
  - Umur
  - Jenis kelamin
  - Berat
  - Warna bulu
  - Ciri khas
- Jelaskan gejala yang dialami hewan:
  - Gejala utama yang terlihat
  - Durasi gejala
  - Perubahan perilaku atau pola makan
  - Riwayat penyakit sebelumnya (jika ada)
  - Pengobatan yang telah diberikan (jika ada)
- Unggah dokumentasi pendukung jika diperlukan (foto, video, hasil pemeriksaan sebelumnya)
- Klik **"Kirim Permohonan Pengobatan"** → status menjadi `submitted_pengobatan`

### 5. Untuk Layanan Rekomendasi Nomor Kontrol Veteriner (NKV)
- Pilih oonika "Rekomendasi Nomor Kontrol Veteriner"
- Isi data pemohon:
  - Nama lengkap
  - Nama perusahaan/instansi
  - Alamat lengkap
  - Nomor telepon
  - Email
- Unggah dokumen yang diperlukan:
  - Surat permohonan NKV
  - SIUP (Surat Izin Usaha Perdagangan)
  - TDP (Tanda Daftar Perusahaan)
  - Dokumen pendukung lain sesuai ketentuan
- Klik **"Kirim Permohonan NKV"** → status menjadi `submitted_nkv`

### 6. Untuk Layanan Rekomendasi Praktek Dokter Hewan
- Pilih oonika "Rekomendasi Praktek Dokter Hewan"
- Isi data dokter hewan:
  - Nama lengkap
  - Nomor STR (Surat Tanda Registrasi)
  - Spesialisasi (Jika ada)
  - Alamat praktik
  - Nomor telepon praktik
  - Email praktik
- Unggah dokumen yang diperlukan:
  - Fotokopi STR yang masih berlaku
  - Sertifikat pendidikan dokter hewan
  - Surat izin praktik dari dinas pertanian atau peternakan
  - Surat keterangan bebas narkotika dan psikotropika
  - Dokumen pendukung lain sesuai ketentuan
- Klik **"Kirim Permohonan Praktek"** → status menjadi `submitted_praktik`

### 7. Mengajukan Konsultasi Kesehatan Hewan
- Dari dashboard pengguna, pilih layanan "Pelayanan Kesehatan Hewan"
- Pilih oonika "Konsultasi Kesehatan Hewan"
- Isi formulir konsultasi:
  - Pilih hewan yang ingin dikonsultasi dari daftar hewan terdaftar (atau tambah hewan baru jika belum terdaftar)
  - Jenis konsultasi yang diminta:
    - Konsultasi umum kesehatan hewan
    - Konsultasi gizi dan diet
    - Konsultasi perilaku dan latihan
    - Konsultasi pasca-operasi atau pasca-treatment
    - Konsultasi reproduksi dan keturunan
    - Konsultasi spesies khusus (konsultasi hewan eksotik, dll.)
  - Topik atau pertanyaan spesifik yang ingin dibahas
  - Riwayat kesehatan hewan terkait topik konsultasi
  - Gejala atau kondisi saat ini yang menjadi pertimbangan konsultasi
- Unggah dokumentasi pendukung jika diperlukan (foto, video, hasil pemeriksaan terkait)
- Pilih preferred waktu konsultasi (opsional, untuk pertimbangan jadwal)
- Klik **"Kirim Permohonan Konsultasi"** → status menjadi `submitted_konsultasi`

### 8. Lacak Status Permohonan
- Di dashboard pengguna, lihat daftar permohonan beserta statusnya untuk setiap jenis layanan
- Status yang mungkin tergantung jenis layanan:
  - **Untuk Vaksinasi Hewan Sehat**:
    - `submitted_vaksinasi` – menunggu verifikasi admin
    - `approved_vaksinasi` – disetujui, menunggu jadwal vaksinasi
    - `scheduled_vaksinasi` – jadwal vaksinasi telah ditetapkan
    - `completed_vaksinasi` – vaksinasi telah dilakukan
    - `rejected_vaksinasi` – ditolak dengan alasan
    - `revision_vaksinasi` – diminta revisi data hewan
  - **Untuk Pengobatan Hewan Sakit**:
    - `submitted_pengobatan` – menunggu verifikasi admin
    - `approved_pengobatan` – disetujui, menunggu penjadwalan konsultasi awal
    - `scheduled_konsultasi_diagnosa` – jadwal konsultasi diagnosis telah ditetapkan
    - `under_treatment` – sedang dalam proses pengobatan
    - `completed_pengobatan` – pengobatan selesai, hewan sembuh
    - `rejected_pengobatan` – ditolak dengan alasan
    - `revision_pengobatan` – diminta informasi tambahan
  - **Untuk Konsultasi Kesehatan Hewan**:
    - `submitted_konsultasi` – menunggu verifikasi admin
    - `approved_konsultasi` – disetujui, menunggu penjadwalan
    - `scheduled_konsultasi` – jadwal konsultasi telah ditetapkan
    - `completed_konsultasi` – konsultasi telah dilakukan
    - `rejected_konsultasi` – ditolak dengan alasan
    - `revision_konsultasi` – diminta klarifikasi topik konsultasi
  - **Untuk NKV**:
    - `submitted_nkv` – menunggu verifikasi dokumen
    - `approved_nkv` – disetujui, nomor kontrol veteriner telah diberikan
    - `rejected_nkv` – ditolak dengan alasan
    - `revision_nkv` – diminta revisi dokumen
  - **Untuk Praktek Dokter Hewan**:
    - `submitted_praktik` – menunggu verifikasi dokumen
    - `approved_praktik` – disetujui, rekomendasi praktek telah diberikan
    - `rejected_praktik` – ditolak dengan alasan
    - `revision_praktik` – diminta revisi dokumen

### 9. Revisi Permohonan (jika diminta)
- Jika admin meminta revisi, pengguna akan mendapat notifikasi
- Klik notifikasi atau lihat permohonan yang statusnya menunjukkan perlu revisi
- Upload dokumen revisi atau perbaiki data sesuai catatan admin
- Klik **"Kirim Revisi"** → admin akan memverifikasi kembali

### 10. Download Hasil dan Bukti Layanan
- Jika permohonan disetujui dan layanan telah dilakukan:
  - Untuk vaksinasi: sertifikat vaksinasi dapat diunduh dari dashboard
  - Untuk pengobatan: ringkasan hasil pengobatan dan surat keterangan sembuh dapat diunduh
  - Untuk konsultasi: catatan konsultasi dan rekomendasi dapat diunduh
  - Untuk NKV: sertifikat nomor kontrol veteriner dapat diunduh
  - Untuk Praktek Dokter Hewan: surat rekomendasi praktek dapat diunduh
- Cek email atau dashboard untuk notifikasi ketersediaan dokumen
- Download dan gunakan sesuai kebutuhan (administrasi, perjalanan, referensi, dll.)

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

SLIDER-VETSYS menggunakan status yang spesifik untuk setiap jenis layanan. Berikut adalah kode status yang digunakan:

#### Untuk Layanan Vaksinasi Hewan Sehat
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `submitted_vaksinasi` | Submitted Vaksinasi | Permohonan vaksinasi diajukan, menunggu verifikasi admin |
| `approved_vaksinasi` | Approved Vaksinasi | Permohonan vaksinasi disetujui, menunggu jadwal vaksinasi |
| `scheduled_vaksinasi` | Scheduled Vaksinasi | Jadwal vaksinasi telah ditetapkan |
| `completed_vaksinasi` | Completed Vaksinasi | Vaksinasi telah dilakukan |
| `rejected_vaksinasi` | Rejected Vaksinasi | Permohonan vaksinasi ditolak dengan alasan |
| `revision_vaksinasi` | Revision Vaksinasi | Diminta revisi data hewan |

#### Untuk Layanan Pengobatan Hewan Sakit
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `submitted_pengobatan` | Submitted Pengobatan | Permohonan pengobatan diajukan, menunggu verifikasi admin |
| `approved_pengobatan` | Approved Pengobatan | Permohonan pengobatan disetujui, menunggu penjadwalan konsultasi awal |
| `scheduled_konsultasi_diagnosa` | Scheduled Konsultasi Diagnosa | Jadwal konsultasi diagnosis telah ditetapkan |
| `under_treatment` | Under Treatment | Sedang dalam proses pengobatan |
| `completed_pengobatan` | Completed Pengobatan | Pengobatan selesai, hewan sembuh |
| `rejected_pengobatan` | Rejected Pengobatan | Permohonan pengobatan ditolak dengan alasan |
| `revision_pengobatan` | Revision Pengobatan | Diminta informasi tambahan atau hasil pemeriksaan awal |

#### Untuk Layanan Konsultasi Kesehatan Hewan
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `submitted_konsultasi` | Submitted Konsultasi | Permohonan konsultasi diajukan, menunggu verifikasi admin |
| `approved_konsultasi` | Approved Konsultasi | Permohonan konsultasi disetujui, menunggu penjadwalan |
| `scheduled_konsultasi` | Scheduled Konsultasi | Jadwal konsultasi telah ditetapkan |
| `completed_konsultasi` | Completed Konsultasi | Konsultasi telah dilakukan |
| `rejected_konsultasi` | Rejected Konsultasi | Permohonan konsultasi ditolak dengan alasan |
| `revision_konsultasi` | Revision Konsultasi | Diminta klarifikasi topik konsultasi atau informasi tambahan |

#### Untuk Layanan Rekomendasi Nomor Kontrol Veteriner (NKV)
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `submitted_nkv` | Submitted NKV | Permohonan NKV diajukan, menunggu verifikasi dokumen |
| `approved_nkv` | Approved NKV | Permohonan NKV disetujui, nomor kontrol veteriner telah diberikan |
| `rejected_nkv` | Rejected NKV | Permohonan NKV ditolak dengan alasan |
| `revision_nkv` | Revision NKV | Diminta revisi dokumen |

#### Untuk Layanan Rekomendasi Praktek Dokter Hewan
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `submitted_praktik` | Submitted Praktek | Permohonan praktek dokter hewan diajukan, menunggu verifikasi dokumen |
| `approved_praktik` | Approved Praktek | Permohonan praktek dokter hewan disetujui, rekomendasi praktek telah diberikan |
| `rejected_praktik` | Rejected Praktek | Permohonan praktek dokter hewan ditolak dengan alasan |
| `revision_praktik` | Revision Praktek | Diminta revisi dokumen |

#### Status Umum yang Masih Digunakan
| Kode | Label | Deskripsi |
|------|-------|-----------|
| `draft` | Draft | Permohonan masih dalam bentuk draft (belum dikirim) |

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

## Changes Made

### Verifikasi Dokter Hewan Empty State Fix
- Updated `src/app/admin/verification/dokter-hewan/dokter-verification-client.tsx`:
  - Changed empty state to display "Tidak ada pendaftaran dokter hewan yang menunggu verifikasi"
  - Added white background and border to registration cards
  - Ensured all text in modal is black with white background

### Type Error Fix
- Fixed `src/components/admin-shell.tsx:69` type error where `activeView === 'applications'` was compared but never returned by `getActiveView()`

---

## Changes Made

### Verifikasi Dokter Hewan Empty State Fix
- Updated `src/app/admin/verification/dokter-hewan/dokter-verification-client.tsx`:
  - Changed empty state to display "Tidak ada pendaftaran dokter hewan yang menunggu verifikasi"
  - Added white background and border to registration cards
  - Ensured all text in modal is black with white background

### Type Error Fix
- Fixed `src/components/admin-shell.tsx:69` type error where `activeView === 'applications'` was compared but never returned by `getActiveView()`

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

**SLIDER-VETSYS** © 2026
