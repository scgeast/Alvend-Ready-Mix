# API Reference — ALVEND Readymix Management

Dokumentasi tabel database & operasi yang dilakukan aplikasi.

## Daftar Tabel

### 1. `users`
Akun login semua role (kecuali developer — ada di kode JS).

| Kolom | Tipe | Wajib | Default | Keterangan |
|-------|------|-------|---------|------------|
| id | BIGINT | ya | auto | Primary key |
| username | TEXT | ya | - | Unique, lowercase |
| name | TEXT | ya | - | Nama lengkap |
| email | TEXT | tidak | - | Boleh kosong (kecuali developer) |
| password | TEXT | ya | - | Plaintext (demo) |
| role | TEXT | ya | - | owner/admin/sales/logistik/customer |
| plant_id | BIGINT | tidak | NULL | FK ke plants.id |
| assigned_sites | JSONB | tidak | [] | Array site_no (untuk customer) |
| permissions | JSONB | tidak | [] | Array menu key |
| avatar | TEXT | tidak | NULL | Base64 string |
| is_active | BOOLEAN | tidak | true | Status aktif |
| created_at | TIMESTAMPTZ | tidak | NOW() | Timestamp |

**Operasi:**
- `DB.all('users')` — list semua user (untuk Kelola User)
- `DB.insert('users', newUser)` — owner tambah user baru
- `DB.update('users', id, patch)` — edit user / ganti password / ganti avatar
- `DB.remove('users', id)` — hapus user

---

### 2. `plants`
Data plant/batching.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| code | TEXT | Kode (cth: PL1) |
| name | TEXT | Nama plant |
| address | TEXT | Alamat |
| phone | TEXT | Telepon |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMPTZ | - |

---

### 3. `mutu`
Master mutu beton.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| code | TEXT | Kode (cth: K225) |
| name | TEXT | Nama (cth: Beton K225) |
| slump | TEXT | Slump value |
| price | NUMERIC | Harga per m³ |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMPTZ | - |

---

### 4. `competitors`
Data kompetitor.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| name | TEXT | Nama kompetitor |
| address | TEXT | Alamat |
| contact_person | TEXT | Kontak person |
| phone | TEXT | Telepon |
| created_at | TIMESTAMPTZ | - |

---

### 5. `addresses`
Master alamat.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| label | TEXT | Label (cth: Kantor Pusat) |
| address | TEXT | Alamat lengkap |
| city | TEXT | Kota |
| province | TEXT | Provinsi |
| type | TEXT | site/office/plant |
| created_at | TIMESTAMPTZ | - |

---

### 6. `prospects` (TABEL UTAMA)
Data prospek project + repeat order dari customer.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| prospect_no | TEXT | Format: PRS/YYMM/NNNN |
| project_name | TEXT | Nama project |
| address | TEXT | Alamat project |
| pic_name | TEXT | PIC project |
| pic_contact | TEXT | Kontak PIC |
| construction_type | TEXT | Gedung/Jalan/Jembatan/dst |
| competitor_id | BIGINT | FK competitors |
| competitor_name | TEXT | Snapshot nama kompetitor |
| sales_id | BIGINT | FK users (sales yang handle) |
| sales_visit_id | BIGINT | FK users (yang visit) |
| site_no | TEXT | Site number (setelah approve) |
| site_no_status | TEXT | waiting/propose_site_no/complete/held |
| po_no | TEXT | Nomor PO |
| qty_po | NUMERIC | Qty PO (m³) |
| visit_status | TEXT | not_yet/done |
| visit_done_at | TIMESTAMPTZ | - |
| final_status | TEXT | open/follow_up/won/lost/repeat_order |
| source | TEXT | internal/customer_repeat |
| hold_reason | TEXT | Alasan hold (kalau held) |
| held_at | TIMESTAMPTZ | - |
| held_by | BIGINT | FK users (owner yang hold) |
| site_no_completed_at | TIMESTAMPTZ | - |
| released_at | TIMESTAMPTZ | - |
| **Kolom Repeat Order:** | | |
| requested_by | BIGINT | FK users (customer yang minta) |
| requested_by_name | TEXT | Snapshot nama customer |
| ref_order_no | TEXT | Order referensi |
| ref_prospect_id | BIGINT | FK prospects (self-ref) |
| request_delivery_date | DATE | Tgl yang diminta customer |
| request_pouring_time | TEXT | Jam pouring |
| request_qty | NUMERIC | Qty yang diminta |
| request_metode_cor | TEXT | Pompa/Manual/dst |
| request_mutu_id | BIGINT | FK mutu |
| request_plant_id | BIGINT | FK plants |
| request_note | TEXT | Catatan customer |
| created_at | TIMESTAMPTZ | - |

---

### 7. `visits`
Detail visit project.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| prospect_id | BIGINT | FK prospects |
| estimasi_tgl_cor | DATE | Estimasi tgl pengecoran |
| jam_loading | TEXT | Jam loading |
| mutu_id | BIGINT | FK mutu |
| estimasi_volume | NUMERIC | Estimasi volume (m³) |
| plant_id | BIGINT | FK plants |
| metode_cor | TEXT | Pompa/Manual/Chute/Conveyor |
| win | BOOLEAN | Status WIN |
| lost | BOOLEAN | Status LOST |
| created_by | BIGINT | FK users |
| created_at | TIMESTAMPTZ | - |

---

### 8. `propose`
Approval Site No.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| prospect_id | BIGINT | FK prospects |
| project_name | TEXT | - |
| address | TEXT | - |
| pic_project | TEXT | - |
| pic_contact | TEXT | - |
| sales_visit_id | BIGINT | FK users |
| site_no | TEXT | Site No yang di-approve |
| po_no | TEXT | - |
| qty_po | NUMERIC | - |
| mutu | JSONB | Array mutu_id |
| plant_ids | JSONB | Array plant_id |
| status | TEXT | complete |
| created_by | BIGINT | FK users |
| created_at | TIMESTAMPTZ | - |
| updated_at | TIMESTAMPTZ | - |

---

### 9. `orders`
Data order pengecoran.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| order_no | TEXT | Format: ORD/YYMM/NNNN |
| prospect_id | BIGINT | FK prospects |
| site_no | TEXT | - |
| project_name | TEXT | - |
| address | TEXT | - |
| po_no | TEXT | - |
| pic_name | TEXT | - |
| pic_contact | TEXT | - |
| mutu_id | BIGINT | FK mutu |
| plant_id | BIGINT | FK plants |
| delivery_date | DATE | Tgl pengiriman |
| pouring_time | TEXT | Jam pouring |
| qty_order | NUMERIC | Qty order (m³) |
| qty_delivery | NUMERIC | Qty sudah dikirim (m³) |
| qty_remain | NUMERIC | Sisa qty (m³) |
| metode_cor | TEXT | - |
| status | TEXT | pending/scheduled/partial/completed/cancelled |
| cancel_reason | TEXT | Alasan cancel (kalau cancelled) |
| cancelled_at | TIMESTAMPTZ | - |
| cancelled_by | BIGINT | FK users |
| sales_id | BIGINT | FK users (sales yang input) |
| created_by | BIGINT | FK users |
| created_at | TIMESTAMPTZ | - |

---

### 10. `deliveries`
Pengiriman per truck.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| order_id | BIGINT | FK orders |
| sj_no | TEXT | No Surat Jalan |
| delivery_date | DATE | - |
| truck_no | TEXT | No polisi truck |
| qty | NUMERIC | Muatan (m³) |
| driver_name | TEXT | - |
| status | TEXT | delivered/rejected/cancelled |
| remarks | TEXT | Catatan (wajib kalau rejected/cancelled) |
| created_by | BIGINT | FK users |
| created_at | TIMESTAMPTZ | - |
| updated_at | TIMESTAMPTZ | - |

---

### 11. `notifications`
Notifikasi repeat order untuk sales/owner.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| type | TEXT | repeat_order |
| prospect_id | BIGINT | FK prospects |
| prospect_no | TEXT | - |
| message | TEXT | Isi notifikasi |
| customer_id | BIGINT | FK users |
| customer_name | TEXT | - |
| site_no | TEXT | - |
| project_name | TEXT | - |
| qty | NUMERIC | - |
| mutu_id | BIGINT | FK mutu |
| plant_id | BIGINT | FK plants |
| read_by | JSONB | Array user_id yang sudah baca |
| created_at | TIMESTAMPTZ | - |

---

### 12. `login_logs`
Log aktivitas user (login, navigasi).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGINT | PK |
| user_id | BIGINT | FK users (NULL kalau login gagal) |
| username | TEXT | Username yang dipakai login |
| name | TEXT | Nama user |
| role | TEXT | Role user |
| status | TEXT | success/failed/inactive |
| activity | TEXT | Deskripsi aktivitas |
| login_at | TIMESTAMPTZ | Timestamp |

**Catatan:** Aktivitas akun developer **tidak pernah** ditulis ke tabel ini (filter di `js/activity-log.js`). Retention: 24 jam (log >24 jam otomatis dihapus).

---

## Akun Developer (Special)

Akun developer TIDAK ada di tabel `users`. Disimpan hanya di kode JavaScript (`frontend/js/constants.js`):

```javascript
const DEVELOPER_DEFAULT_ACCOUNT = {
  id: -999999,
  username: 'developer',
  name: 'Application Developer',
  email: 'bookingeast0@gmail.com',
  password: 'sultan3110',
  role: 'developer',
  is_active: true,
  permissions: ['*']
};
```

Login bisa via:
- User ID: `developer`
- Email: `bookingeast0@gmail.com`

Untuk produksi: daftar email ini di Supabase Auth (Dashboard → Authentication → Users → Add user) supaya login developer divalidasi server-side.

---

## Row Level Security (RLS)

### Status saat ini
**RLS DIMATIKAN** di semua tabel. Siapapun yang punya Publishable Key bisa baca/tulis data.

### Untuk Produksi (Rekomendasi)

```sql
-- Enable RLS di semua tabel
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutu            ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits          ENABLE ROW LEVEL SECURITY;
ALTER TABLE propose         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs      ENABLE ROW LEVEL SECURITY;

-- Contoh policy: hanya user yang login bisa baca data
CREATE POLICY "Authenticated can read" ON users
  FOR SELECT TO authenticated USING (true);

-- Contoh policy: hanya owner/admin bisa tulis users
CREATE POLICY "Owner/admin can write users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('owner','admin')
    )
  );

-- Contoh policy: sales hanya bisa lihat prospek sendiri
CREATE POLICY "Sales see own prospects" ON prospects
  FOR SELECT TO authenticated
  USING (
    sales_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('owner','admin')
    )
  );
```

Dokumentasi lengkap RLS: https://supabase.com/docs/guides/auth/row-level-security

---

## Format Penomoran

| Tipe | Format | Contoh |
|------|--------|--------|
| Prospek internal | `PRS/YYMM/NNNN` | `PRS/2611/0001` |
| Repeat order | `RPT/YYMM/NNNN` | `RPT/2611/0001` |
| Order | `ORD/YYMM/NNNN` | `ORD/2611/0001` |

`YYMM` = tahun-bulan saat dibuat (cth: Nov 2026 = `2611`)
`NNNN` = urutan (mulai dari 0001, pakai `prospects.length + 1`)

---

## Relasi Antar Tabel (ERD)

```
users ──┬──< prospects (sales_id, sales_visit_id, requested_by)
        ├──< visits (created_by)
        ├──< propose (created_by)
        ├──< orders (sales_id, created_by, cancelled_by)
        ├──< deliveries (created_by)
        └──< login_logs (user_id)

plants ──┬──< users (plant_id)
         ├──< visits (plant_id)
         ├──< propose (plant_ids — JSONB array)
         ├──< orders (plant_id)
         └──< prospects (request_plant_id)

mutu ──┬──< visits (mutu_id)
       ├──< propose (mutu — JSONB array)
       ├──< orders (mutu_id)
       └──< prospects (request_mutu_id)

competitors ──< prospects (competitor_id)

prospects ──┬──< visits (prospect_id)
            ├──< propose (prospect_id)
            ├──< orders (prospect_id)
            ├──< notifications (prospect_id)
            └──< prospects (ref_prospect_id — self-ref untuk repeat order)

orders ──< deliveries (order_id)
```

---

## Trigger / Function (Opsional)

Untuk automasi yang bisa ditambahkan di Supabase:

### Trigger: auto-update `qty_remain` di orders
```sql
CREATE OR REPLACE FUNCTION update_order_qty()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET
    qty_delivery = (
      SELECT COALESCE(SUM(qty), 0)
      FROM deliveries
      WHERE order_id = NEW.order_id AND status = 'delivered'
    ),
    qty_remain = (
      SELECT qty_order - COALESCE(SUM(qty), 0)
      FROM orders o
      LEFT JOIN deliveries d ON d.order_id = o.id AND d.status = 'delivered'
      WHERE o.id = NEW.order_id
    )
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_qty
  AFTER INSERT OR UPDATE OR DELETE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_order_qty();
```

---

Lihat juga: [SETUP.md](./SETUP.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)

