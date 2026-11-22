# ALVEND Readymix Management

Aplikasi manajemen pengecoran beton ready-mix — mulai dari prospek, order, jadwal pengiriman, sampai after-delivery report.

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Frontend | HTML, Tailwind CSS (CDN), Alpine.js |
| Backend  | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting  | GitHub Pages (frontend) + Supabase (backend) |
| Version Control | Git + GitHub |

## Struktur Repository

```
alvend-readymix/
├── frontend/                  # Aplikasi web (HTML/CSS/JS)
│   ├── index.html
│   ├── css/                   # 11 file CSS terpisah per komponen
│   ├── js/                    # 7 file JS terpisah per modul
│   │   ├── config.js          # ⚠ GANTI Supabase URL & Key di sini
│   │   ├── constants.js        # Akun developer, default permissions
│   │   ├── utils.js            # Helper functions
│   │   ├── db.js               # Wrapper CRUD Supabase
│   │   ├── auth.js             # Supabase Auth (khusus developer)
│   │   ├── activity-log.js     # Log aktivitas user
│   │   └── app.js              # Komponen Alpine.js utama
│   ├── assets/                 # Gambar, icon, logo
│   └── README.md
│
├── backend/                   # Database schema Supabase
│   ├── supabase_schema.sql    # 12 tabel + index + seed data
│   ├── seed_data.sql          # Data demo tambahan (opsional)
│   ├── migrations/            # Perubahan skema (kalau ada)
│   └── README.md
│
├── docs/                      # Dokumentasi
│   ├── SETUP.md               # Cara setup lengkap dari nol
│   ├── DEPLOYMENT.md          # Cara deploy ke GitHub Pages / Netlify / Vercel
│   └── API.md                 # Dokumentasi tabel + RLS
│
├── .github/workflows/         # CI/CD
│   └── deploy-frontend.yml    # Auto-deploy frontend ke GitHub Pages
│
├── .gitignore
└── README.md                  # File ini
```

## Quick Start (5 menit)

### 1. Clone repo
```bash
git clone https://github.com/USERNAME-ANDA/alvend-readymix.git
cd alvend-readymix
```

### 2. Setup database Supabase
- Buka https://supabase.com → buat project baru
- SQL Editor → paste isi `backend/supabase_schema.sql` → RUN
- Catat **Project URL** dan **anon public key** dari Settings → API

### 3. Konfigurasi frontend
Edit `frontend/js/config.js`:
```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';            // GANTI
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xxxxxxxxxxxx';    // GANTI
```

### 4. Jalankan lokal
- Buka VS Code → install ekstensi **Live Server**
- Klik kanan `frontend/index.html` → **Open with Live Server**
- Browser buka `http://127.0.0.1:5500/`


## Deploy ke Production

Lihat [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) untuk panduan lengkap.

Singkatnya: push ke GitHub → buka Settings → Pages → Source: **GitHub Actions** → tunggu 1-2 menit → akses `https://USERNAME.github.io/alvend-readymix/`.

## Dokumentasi

- [Setup Guide](docs/SETUP.md) — panduan lengkap dari nol sampai jalan
- [Deployment Guide](docs/DEPLOYMENT.md) — cara deploy ke berbagai platform
- [API Reference](docs/API.md) — dokumentasi tabel, kolom, RLS
- [Frontend README](frontend/README.md) — struktur folder frontend
- [Backend README](backend/README.md) — cara setup database

## Fitur Aplikasi

### Multi-Role Access
- **Owner** — akses penuh, kelola user & hak akses
- **Admin** — dashboard, prospek, order, marketing, jadwal, after delivery
- **Sales** — input prospek, follow up, buat order, lihat performa
- **Logistik** — lihat jadwal pengecoran & after delivery
- **Customer** — lihat jadwal pengiriman ke site miliknya, request repeat order
- **Developer** — full access (akun sistem, hanya di kode JS)

### Modul Utama
1. **Dashboard** — KPI, trend order, status order, performance rate
2. **Prospek** — input & data prospek, visit detail
3. **Order** — input order, order search, marketing (per Site No)
4. **Pengiriman** — jadwal pengecoran, after delivery report
5. **Approval Site No** — owner approve/reject site yang diajukan sales
6. **Master Data** — kelola plant, mutu, kompetitor, alamat
7. **Kelola User & Hak Akses** — tambah user, atur permission per menu
8. **Log Aktivitas** — history login & aktivitas user (retention 24 jam)

### Keamanan
- Akun developer in-memory only (tidak di localStorage, tidak di tabel users)
- Sesi login disimpan di localStorage (`beton_current`) supaya tetap login setelah refresh
- Aktivitas developer tidak pernah ditulis ke log Supabase
- Password user disimpan plaintext di tabel (cocok untuk demo — untuk produksi, pakai Supabase Auth)

## Workflow Development

```bash
# Edit kode di VS Code
# Test di Live Server (localhost:5500)

# Push ke GitHub (auto-deploy ke GitHub Pages)
git add .
git commit -m "feat: deskripsi perubahan"
git push

# Cek status deploy di tab Actions
# Tunggu 1-2 menit, website otomatis update

.```

## License

Private project — © 2026 ALVEND Readymix. All rights reserved.

---

**Created By Kim Jong Un — November 2026**

