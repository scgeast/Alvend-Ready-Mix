# Backend — ALVEND Readymix Management

Backend aplikasi menggunakan **Supabase** (PostgreSQL + Auth + Realtime).

## Struktur Folder

```
backend/
├── supabase_schema.sql   ← Skema database lengkap (12 tabel + index + seed)
├── seed_data.sql          ← Data demo tambahan (kompetitor, alamat)
└── migrations/            ← Perubahan skema (kalau ada di masa depan)
    └── README.md          ← Catatan cara pakai migrations
```

## Setup Awal (sekali saja)

### 1. Buat project Supabase
- Buka https://supabase.com → New Project
- Isi name: `alvend-readymix`
- Set database password (catat baik-baik!)
- Pilih region: Southeast Asia (Singapore) — paling dekat ke Indonesia
- Tunggu ± 2 menit sampai project ready

### 2. Jalankan schema
- Buka Supabase Dashboard → SQL Editor → New query
- Buka file `backend/supabase_schema.sql`
- Copy semua isinya, paste di SQL Editor
- Klik **RUN** (tunggu sampai "Success. No rows returned")

### 3. (Opsional) Jalankan seed data tambahan
- New query lagi
- Copy isi `backend/seed_data.sql`
- Klik **RUN**

### 4. Verifikasi
Jalankan query ini di SQL Editor:
```sql
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'plants', COUNT(*) FROM plants
UNION ALL SELECT 'mutu', COUNT(*) FROM mutu
UNION ALL SELECT 'competitors', COUNT(*) FROM competitors
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses;
```

Hasil yang diharapkan:
```
table_name    | row_count
users         | 5  (owner, admin, sales1, sales2, customer)
plants        | 2  (Plant Cibubur, Plant Cikarang)
mutu          | 4  (K225, K300, K350, K400)
competitors   | 3
addresses     | 3
```

### 5. Ambil URL & Key
- Supabase Dashboard → Project Settings → API
- Catat:
  - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
  - **anon public key**: `sb_publishable_xxxxxxxxxxxx_xxxxxxxxxxxx`
- Paste nilai-nilai ini ke `frontend/js/config.js`

### 6. Daftarkan akun developer di Supabase Auth (opsional tapi rekomendasi)
- Supabase Dashboard → Authentication → Users → Add user
- Email: `bookingeast0@gmail.com`
- Password: `sultan3110`
- Centang "Auto Confirm User"
- Klik Create user

## Daftar Tabel

| Nama Tabel       | Fungsi                                       |
|------------------|----------------------------------------------|
| `users`          | Akun login semua role (kecuali developer)    |
| `plants`        | Data plant/batching                          |
| `mutu`          | Master mutu beton (K225, K300, dst)         |
| `competitors`   | Data kompetitor                              |
| `addresses`     | Master alamat                                |
| `prospects`     | Data prospek project + repeat order          |
| `visits`        | Visit detail per prospek                     |
| `propose`       | Approval Site No                             |
| `orders`        | Data order pengecoran                        |
| `deliveries`    | Pengiriman per truck                         |
| `notifications` | Notifikasi repeat order untuk sales/owner    |
| `login_logs`    | Log aktivitas user (login, navigasi)         |

## Keamanan — Penting!

### Status saat ini (demo/internal)
**RLS (Row Level Security) DIMATIKAN** di semua tabel. Siapapun yang punya Publishable Key bisa baca/tulis data tanpa pembatasan.

Cocok untuk:
- Demo ke calon client
- Internal testing
- Project dengan tim kecil dan terpercaya

### Untuk Produksi (wajib!)
Aktifkan RLS + buat policy. Contoh policy:

```sql
-- Enable RLS di tabel users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Hanya user yang sudah login (via Supabase Auth) yang bisa baca
CREATE POLICY "Authenticated can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Hanya owner/admin yang bisa insert/update/delete
CREATE POLICY "Only owner/admin can write users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('owner','admin')
    )
  );
```

Lihat dokumentasi lengkap RLS di:
https://supabase.com/docs/guides/auth/row-level-security

## Backup & Restore

### Backup harian (otomatis)
Supabase Free tier sudah backup otomatis harian. Tapi untuk safety, bisa juga export manual:

```bash
# Export via pg_dump (kalau install postgres client)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  < backup_YYYYMMDD.sql
```

## Migrations (perubahan skema di masa depan)

Kalau perlu ubah struktur tabel (tambah kolom, dll), jangan edit `supabase_schema.sql` langsung. Buat file migration baru di `backend/migrations/`:

```
backend/migrations/
├── 001_initial_schema.sql         ← (sudah ada, ini = supabase_schema.sql)
├── 002_add_phone_to_customers.sql ← contoh migration
└── ...
```

Jalankan satu per satu di SQL Editor sesuai urutan nomor.

## Troubleshooting

### Error: "relation does not exist"
Artinya tabel belum dibuat. Jalankan ulang `supabase_schema.sql`.

### Login gagal "User ID tidak ditemukan"
- Cek tabel users: `SELECT * FROM users;`
- Pastikan seed data akun demo sudah masuk

### Aplikasi blank / tidak connect
- Cek `frontend/js/config.js` — URL & Key sudah benar?
- Buka DevTools (F12) → Console → cek error message

### Data tidak muncul
- Buka Supabase Dashboard → Table Editor → pilih tabel
- Cek apakah ada datanya
- Cek RLS — kalau di-enable tanpa policy, data tidak bisa diakses

