# Deployment Guide — ALVEND Readymix Management

Cara deploy aplikasi ke production. Ada beberapa pilihan hosting.

## Arsitektur Deployment

```
                    ┌─────────────────────┐
                    │   User Browser      │
                    │  (Admin/Sales/Cust) │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
              ┌────────────────────────────────┐
              │  Frontend Hosting (Static)     │
              │  • GitHub Pages (gratis)       │
              │  • Netlify (alternatif)        │
              │  • Vercel (alternatif)         │
              └────────────────┬───────────────┘
                               │ fetch() via Supabase JS SDK
                               ▼
              ┌────────────────────────────────┐
              │  Supabase (Backend-as-Service) │
              │  • PostgreSQL Database         │
              │  • Authentication              │
              │  • Storage (kalau ada)         │
              │  • Realtime (kalau aktif)     │
              └────────────────────────────────┘
```

## Opsi 1: GitHub Pages (Rekomendasi — Gratis)

### Kelebihan
- Gratis selamanya
- Auto-deploy dari repo GitHub
- HTTPS otomatis
- Custom domain support (gratis)

### Kekurangan
- Hanya static files (tidak bisa server-side)
- Build time 1-2 menit per push

### Setup
File `.github/workflows/deploy-frontend.yml` sudah disiapkan. Tinggal:
1. Push repo ke GitHub
2. Buka repo → Settings → Pages → Source: **GitHub Actions**
3. Tunggu 1-2 menit, akses `https://USERNAME.github.io/alvend-readymix/`

### Custom Domain (opsional)
1. Beli domain (cth: alvend.com) di Niagahoster/Namecheap
2. Buka repo → Settings → Pages → Custom domain
3. Isi domain Anda → Save
4. Tambah DNS record di provider domain:
   ```
   Type: CNAME
   Host: www
   Value: USERNAME.github.io
   ```
5. Tunggu 1-24 jam propagasi DNS

---

## Opsi 2: Netlify (Alternatif)

### Kelebihan
- Drag & drop folder untuk deploy cepat
- Auto-deploy dari GitHub
- Form submissions (gratis 100/bulan)
- Preview tiap pull request

### Setup
1. Buka https://netlify.com → sign up dengan GitHub
2. **Add new site** → **Import from Git**
3. Pilih repo `alvend-readymix`
4. Konfigurasi:
   - **Build command**: (kosongkan — tidak perlu build)
   - **Publish directory**: `frontend`
5. Klik **Deploy site**
6. Dapat URL: `https://alvend-readymix.netlify.app/`

### Custom Domain
- Site settings → Domain management → Add custom domain
- Ikuti instruksi DNS

---

## Opsi 3: Vercel (Alternatif)

### Kelebihan
- Performance sangat baik (Edge Network)
- Auto-deploy dari GitHub
- Preview tiap branch

### Setup
1. Buka https://vercel.com → sign up dengan GitHub
2. **Add New Project** → import repo `alvend-readymix`
3. Konfigurasi:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: (kosong)
   - **Output Directory**: `frontend`
4. Klik **Deploy**

---

## Environment Variables

**PENTING!** Jangan hardcode URL & API Key Supabase di repo public. Tapi karena ini pakai **Publishable Key** (anon), sebenarnya aman-aman saja untuk ditaruh di kode — karena memang dirilis untuk dipakai di client-side.

### Best Practice (kalau mau lebih aman)
1. Edit `frontend/js/config.js` jadi:
   ```javascript
   const SUPABASE_URL = window.location.hostname === 'localhost'
     ? 'https://xxxxxxxx.supabase.co'           // dev
     : 'https://yyyyyyyy.supabase.co';          // prod

   const SUPABASE_PUBLISHABLE_KEY = window.location.hostname === 'localhost'
     ? 'sb_publishable_dev_xxxxxxxx'
     : 'sb_publishable_prod_yyyyyyyy';
   ```

2. Atau pakai environment variable saat build:
   - Pakai Vite / Webpack untuk build process
   - File `.env` di-ignore dari git (lihat `.gitignore`)

---

## Backup & Restore Database

### Backup harian otomatis
Supabase Free tier: backup harian otomatis (retention 7 hari).
Pro plan: backup harian + Point-in-Time Recovery (PITR).

### Backup manual
```bash
# Install postgres client (kalau belum)
# sudo apt install postgresql-client

# Export database
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  --column-inserts \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  < backup_YYYYMMDD.sql
```

---

## Monitoring

### Supabase Dashboard
- **Table Editor**: lihat isi tabel
- **Logs**: cek error query
- **Reports**: statistik penggunaan database
- **Authentication**: kelola user auth

### GitHub Actions
- Tab **Actions** di repo → status deploy terakhir
- Kalau gagal, klik workflow → lihat log

### Browser DevTools
- **Console**: error JS
- **Network**: request ke Supabase (status, timing)
- **Application → Local Storage**: cek `beton_current` (sesi login)

---

## SSL/HTTPS

Supabase **wajib HTTPS**. Semua opsi hosting di atas (GitHub Pages, Netlify, Vercel) sudah otomatis HTTPS.

Kalau pakai custom domain:
- GitHub Pages: otomatis Let's Encrypt SSL
- Netlify: otomatis Let's Encrypt SSL
- Vercel: otomatis SSL

Tidak perlu setup manual.

---

## Update Aplikasi

### Workflow update (sehari-hari)
```bash
# 1. Edit kode di VS Code
# 2. Test di Live Server (localhost:5500)
# 3. Kalau sudah oke, commit & push
git add .
git commit -m "feat: tambah fitur export PDF"
git push

# 4. GitHub Pages auto-deploy 1-2 menit
# 5. Cek https://USERNAME.github.io/alvend-readymix/
```

### Update database schema
1. Buat file migration baru di `backend/migrations/`
2. Jalankan di Supabase SQL Editor
3. Commit migration file
4. Push ke GitHub

### Rollback
```bash
# Lihat history commit
git log --oneline

# Rollback ke commit tertentu
git reset --hard <commit-hash>
git push --force

# Atau balik 1 commit terakhir
git revert HEAD
git push
```

---

## Troubleshooting Production

### Website loading blank
1. Buka DevTools → Console → cek error
2. Cek `js/config.js` — URL & Key Supabase benar?
3. Cek tab Network — request ke Supabase gagal/gagal CORS?

### Data tidak muncul
1. Cek Supabase Dashboard → Table Editor → data ada?
2. Cek RLS — kalau di-enable tanpa policy, data tidak bisa diakses
3. Cek console untuk error "permission denied"

### Login gagal
1. Cek tabel `users` — user ada?
2. Cek `is_active = true`
3. Cek password sama persis (case-sensitive)
4. Cek console untuk error message

### Build GitHub Actions gagal
1. Buka tab **Actions** di repo
2. Klik workflow yang gagal
3. Baca log error
4. Fix di kode lokal
5. Push ulang

---

Lihat juga: [SETUP.md](./SETUP.md) | [API.md](./API.md)

