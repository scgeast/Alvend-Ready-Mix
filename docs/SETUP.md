# Setup Guide — ALVEND Readymix Management

Panduan lengkap setup project untuk developer baru. Ikuti urutan ini dari nol sampai aplikasi jalan.

## Prasyarat

| Tool | Versi | Catatan |
|------|-------|---------|
| VS Code | latest | Editor utama |
| Git | latest | Version control |
| Browser modern | Chrome/Firefox/Edge | Untuk testing |
| Akun Supabase | gratis | https://supabase.com |
| Akun GitHub | gratis | Untuk hosting & version control |

### Ekstensi VS Code yang direkomendasikan
- **Live Server** (Ritwick Dey) — preview real-time
- **Alpine.js IntelliSense** — autocomplete atribut Alpine
- **Tailwind CSS IntelliSense** — autocomplete class Tailwind
- **Prettier** — auto-format kode
- **ESLint** — cek error JS

---

## Langkah 1 — Clone Repository

```bash
git clone https://github.com/USERNAME-ANDA/alvend-readymix.git
cd alvend-readymix
```

Struktur folder:
```
alvend-readymix/
├── frontend/          ← HTML/CSS/JS (frontend)
├── backend/           ← SQL schema (Supabase)
├── docs/              ← Dokumentasi
└── .github/workflows/ ← CI/CD (auto-deploy)
```

## Langkah 2 — Setup Backend (Supabase)

### 2.1 Buat project Supabase baru
- Buka https://supabase.com → sign up/login
- Klik **New Project**
- Isi:
  - **Name**: `alvend-readymix`
  - **Database Password**: buat password kuat, catat!
  - **Region**: Southeast Asia (Singapore)
- Klik **Create new project**, tunggu ±2 menit

### 2.2 Jalankan schema database
- Buka project Supabase → **SQL Editor** (menu kiri)
- Klik **New query**
- Buka file `backend/supabase_schema.sql` dari repo ini
- Copy semua isi, paste di SQL Editor
- Klik **RUN** (tunggu sampai "Success")

### 2.3 (Opsional) Tambah seed data
- New query lagi
- Buka `backend/seed_data.sql`
- Copy + paste + RUN

### 2.4 Verifikasi data
Jalankan query ini:
```sql
SELECT 'users' AS tbl, COUNT(*) AS rows FROM users
UNION ALL SELECT 'plants', COUNT(*) FROM plants
UNION ALL SELECT 'mutu', COUNT(*) FROM mutu;
```

Harusnya muncul:
```
users  | 5
plants | 2
mutu   | 4
```

### 2.5 Daftarkan akun developer di Supabase Auth (opsional tapi rekomendasi)
- Supabase Dashboard → **Authentication** → **Users**
- Klik **Add user**
- Email: `bookingeast0@gmail.com`
- Password: `sultan3110`
- Centang **Auto Confirm User**
- Klik **Create user**

### 2.6 Catat URL & API Key
- Supabase Dashboard → **Project Settings** (gear icon) → **API**
- Catat 2 nilai ini:
  - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
  - **anon public**: `sb_publishable_xxxxxxxxxxxx_xxxxxxxxxxxx`

## Langkah 3 — Setup Frontend

### 3.1 Edit config
Buka file `frontend/js/config.js` di VS Code:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';                    // ← GANTI
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xxxxxxxxxxxx_xxxxxxxx';   // ← GANTI
```

Ganti dengan nilai yang Anda catat di langkah 2.6.

### 3.2 Jalankan dengan Live Server
- Buka VS Code di folder `alvend-readymix/`
- Install ekstensi **Live Server** (kalau belum)
- Klik kanan `frontend/index.html` → **Open with Live Server**
- Browser otomatis buka `http://127.0.0.1:5500/`

### 3.3 Test login
Coba login dengan akun demo:

| User ID   | Password   | Role    |
|-----------|------------|---------|
| owner     | password   | Owner   |
| admin     | password   | Admin   |
| sales1    | password   | Sales   |
| customer  | password   | Customer |
| bookingeast0@gmail.com | sultan3110 | Developer |

Kalau login berhasil → aplikasi siap dipakai!

## Langkah 4 — Push ke GitHub

### 4.1 Buat repo GitHub
- Buka https://github.com/new
- Repository name: `alvend-readymix`
- Pilih **Private** (atau Public kalau mau open-source)
- Jangan centang "Add a README" (sudah ada di repo)
- Klik **Create repository**

### 4.2 Push kode
```bash
cd alvend-readymix

# Inisialisasi git (kalau belum)
git init
git add .
git commit -m "Initial commit - ALVEND Readymix Management"

# Set remote & push
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/alvend-readymix.git
git push -u origin main
```

### 4.3 Aktifkan GitHub Pages
- Buka repo GitHub → tab **Settings**
- Scroll ke **Pages** (menu kiri)
- **Source**: pilih **GitHub Actions**
- File `.github/workflows/deploy-frontend.yml` sudah otomatis deploy tiap push

### 4.4 Tunggu 1-2 menit
- Buka tab **Actions** di repo
- Lihat workflow "Deploy Frontend to GitHub Pages"
- Kalau sudah hijau (success), website live di:
  ```
  https://USERNAME-ANDA.github.io/alvend-readymix/
  ```

## Langkah 5 — Test Production

Buka URL GitHub Pages di browser, coba:
1. Login sebagai `owner` / `password`
2. Buka menu Kelola User → tambah user baru
3. Logout, login sebagai user baru → harusnya bisa masuk
4. Coba input prospek, buat order, update delivery
5. Cek di Supabase Dashboard → Table Editor → data harusnya tersimpan

## Selesai!

Aplikasi siap dipakai. Untuk update selanjutnya, cukup:
1. Edit kode di VS Code
2. `git add . && git commit -m "..." && git push`
3. GitHub Pages otomatis update dalam 1-2 menit

## Troubleshooting

### Aplikasi blank di Live Server
- Buka DevTools (F12) → Console
- Kalau ada error "supabase is not defined" → cek koneksi internet (CDN Supabase gagal load)
- Kalau "Fatal: Supabase belum terhubung" → cek `js/config.js` URL & Key

### GitHub Pages 404
- Tunggu 2-3 menit setelah push
- Cek tab Actions → workflow harus success
- Cek Settings → Pages → source harus "GitHub Actions"

### Data tidak tersimpan
- Buka DevTools → Network → cek request ke Supabase gagal atau sukses
- Kalau gagal 401 Unauthorized → cek API Key
- Kalau gagal 404 → cek URL

### Login gagal padahal user ada
- Cek Supabase Dashboard → Table Editor → users
- Pastikan user `is_active = true`
- Cek password sama persis (case-sensitive)

---

Lihat juga: [DEPLOYMENT.md](./DEPLOYMENT.md) | [API.md](./API.md)

