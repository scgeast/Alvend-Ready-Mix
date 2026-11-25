-- ═══════════════════════════════════════════════════════════════
--  ALVEND READYMIX MANAGEMENT — DATABASE SCHEMA (Supabase)
-- ═══════════════════════════════════════════════════════════════
--  Cara pakai:
--   1. Buka Supabase Dashboard → SQL Editor → New query
--   2. Paste seluruh isi file ini
--   3. Klik RUN
--
--  Catatan:
--   - Skema ini dibuat dari kode aplikasi (alvend_readymix_supabase.html)
--   - Semua tabel dimatikan RLS-nya untuk demo/internal use
--   - Untuk produksi: WAJIB enable RLS + buat policy (lihat README.md)
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- TABEL: plants (data plant/batching)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plants (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: mutu (mutu beton, mis. K225, K300)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mutu (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  slump       TEXT,
  price       NUMERIC DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: competitors (kompetitor)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitors (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL,
  address         TEXT,
  contact_person  TEXT,
  phone           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: addresses (master alamat)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label       TEXT,
  address     TEXT NOT NULL,
  city        TEXT,
  province    TEXT,
  type        TEXT DEFAULT 'site',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: users (akun login)
-- ─────────────────────────────────────────────
-- Catatan:
--   - Password disimpan plaintext (cocok untuk demo/internal)
--   - Untuk produksi: hapus kolom password, pakai Supabase Auth
--   - Akun developer TIDAK ada di tabel ini (hanya di kode JS)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username        TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT,
  password        TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('owner','admin','sales','logistik','customer')),
  plant_id        BIGINT REFERENCES plants(id) ON DELETE SET NULL,
  assigned_sites  JSONB DEFAULT '[]'::jsonb,
  permissions     JSONB DEFAULT '[]'::jsonb,
  avatar          TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: prospects (data prospek project)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospects (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_no           TEXT UNIQUE,
  project_name          TEXT NOT NULL,
  address               TEXT,
  pic_name              TEXT,
  pic_contact           TEXT,
  construction_type     TEXT,
  competitor_id         BIGINT REFERENCES competitors(id) ON DELETE SET NULL,
  competitor_name       TEXT,
  sales_id              BIGINT REFERENCES users(id) ON DELETE SET NULL,
  sales_visit_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  site_no               TEXT,
  site_no_status        TEXT DEFAULT 'waiting' CHECK (site_no_status IN ('waiting','propose_site_no','complete','held')),
  po_no                 TEXT,
  qty_po                NUMERIC DEFAULT 0,
  visit_status         TEXT DEFAULT 'not_yet' CHECK (visit_status IN ('not_yet','done')),
  visit_done_at        TIMESTAMPTZ,
  final_status         TEXT DEFAULT 'open',
  source                TEXT DEFAULT 'internal' CHECK (source IN ('internal','customer_repeat')),
  hold_reason           TEXT,
  held_at               TIMESTAMPTZ,
  held_by               BIGINT REFERENCES users(id) ON DELETE SET NULL,
  site_no_completed_at  TIMESTAMPTZ,
  released_at           TIMESTAMPTZ,
  -- Untuk repeat order dari customer:
  requested_by          BIGINT REFERENCES users(id) ON DELETE SET NULL,
  requested_by_name     TEXT,
  ref_order_no          TEXT,
  ref_prospect_id       BIGINT REFERENCES prospects(id) ON DELETE SET NULL,
  request_delivery_date DATE,
  request_pouring_time  TEXT,
  request_qty           NUMERIC,
  request_metode_cor    TEXT,
  request_mutu_id       BIGINT REFERENCES mutu(id) ON DELETE SET NULL,
  request_plant_id      BIGINT REFERENCES plants(id) ON DELETE SET NULL,
  request_note          TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: visits (visit project detail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_id         BIGINT REFERENCES prospects(id) ON DELETE CASCADE,
  estimasi_tgl_cor    DATE,
  jam_loading         TEXT,
  mutu_id             BIGINT REFERENCES mutu(id) ON DELETE SET NULL,
  estimasi_volume     NUMERIC,
  plant_id            BIGINT REFERENCES plants(id) ON DELETE SET NULL,
  metode_cor          TEXT,
  win                 BOOLEAN DEFAULT false,
  lost                BOOLEAN DEFAULT false,
  created_by          BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: propose (approval site no)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS propose (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_id     BIGINT REFERENCES prospects(id) ON DELETE CASCADE,
  project_name    TEXT,
  address         TEXT,
  pic_project     TEXT,
  pic_contact     TEXT,
  sales_visit_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  site_no         TEXT,
  po_no           TEXT,
  qty_po          NUMERIC,
  mutu            JSONB DEFAULT '[]'::jsonb,
  plant_ids       JSONB DEFAULT '[]'::jsonb,
  status          TEXT DEFAULT 'complete',
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- TABEL: orders (data order pengecoran)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_no        TEXT UNIQUE,
  prospect_id     BIGINT REFERENCES prospects(id) ON DELETE SET NULL,
  site_no         TEXT,
  project_name    TEXT,
  address         TEXT,
  po_no           TEXT,
  pic_name        TEXT,
  pic_contact     TEXT,
  mutu_id         BIGINT REFERENCES mutu(id) ON DELETE SET NULL,
  plant_id        BIGINT REFERENCES plants(id) ON DELETE SET NULL,
  delivery_date   DATE,
  pouring_time    TEXT,
  qty_order       NUMERIC NOT NULL DEFAULT 0,
  qty_delivery    NUMERIC NOT NULL DEFAULT 0,
  qty_remain      NUMERIC NOT NULL DEFAULT 0,
  metode_cor      TEXT,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('pending','scheduled','partial','completed','cancelled')),
  cancel_reason   TEXT DEFAULT '',
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  sales_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: deliveries (data pengiriman per truck)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  sj_no           TEXT,
  delivery_date   DATE NOT NULL,
  truck_no        TEXT NOT NULL,
  qty             NUMERIC NOT NULL,
  driver_name     TEXT,
  status          TEXT DEFAULT 'delivered' CHECK (status IN ('delivered','rejected','cancelled')),
  remarks         TEXT DEFAULT '',
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- TABEL: notifications (notifikasi repeat order)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type            TEXT DEFAULT 'repeat_order',
  prospect_id     BIGINT REFERENCES prospects(id) ON DELETE CASCADE,
  prospect_no     TEXT,
  message         TEXT,
  customer_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  customer_name   TEXT,
  site_no         TEXT,
  project_name    TEXT,
  qty             NUMERIC,
  mutu_id         BIGINT REFERENCES mutu(id) ON DELETE SET NULL,
  plant_id        BIGINT REFERENCES plants(id) ON DELETE SET NULL,
  read_by         JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: login_logs (log aktivitas user)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  username    TEXT,
  name        TEXT,
  role        TEXT,
  status      TEXT CHECK (status IN ('success','failed','inactive')),
  activity    TEXT,
  login_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
--  DISABLE ROW LEVEL SECURITY (untuk demo/internal use)
-- ═══════════════════════════════════════════════════════════════
--  ⚠ UNTUK PRODUKSI: WAJIB enable RLS + buat policy
--    Lihat: docs/API.md bagian "Row Level Security"
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE plants         DISABLE ROW LEVEL SECURITY;
ALTER TABLE mutu           DISABLE ROW LEVEL SECURITY;
ALTER TABLE competitors    DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      DISABLE ROW LEVEL SECURITY;
ALTER TABLE users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE prospects      DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits         DISABLE ROW LEVEL SECURITY;
ALTER TABLE propose        DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders         DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries     DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs     DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
--  INDEXES (untuk performance query)
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_users_username           ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_prospects_site_no         ON prospects(site_no);
CREATE INDEX IF NOT EXISTS idx_prospects_sales_id       ON prospects(sales_id);
CREATE INDEX IF NOT EXISTS idx_prospects_source          ON prospects(source);
CREATE INDEX IF NOT EXISTS idx_orders_site_no           ON orders(site_no);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date     ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_sales_id          ON orders(sales_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id      ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status        ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_at      ON login_logs(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_by    ON notifications USING GIN(read_by);

-- ═══════════════════════════════════════════════════════════════
--  SEED DATA (akun demo)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (username, name, email, password, role, plant_id, assigned_sites, permissions, is_active) VALUES
('owner',    'Owner Utama',    'owner@app.com',    'password', 'owner',    NULL, '[]'::jsonb, '["dashboard","inputProspek","dataProspek","inputOrder","orderSearch","marketing","jadwal","afterDelivery","proposeSiteNo","kelolaUser","kelolaHakAkses","kelolaPlant","kelolaMutu","kelolaKompetitor","kelolaAlamat","logAktivitas"]'::jsonb, true),
('admin',    'Admin Satu',     'admin@app.com',    'password', 'admin',    NULL, '[]'::jsonb, '["dashboard","inputProspek","dataProspek","inputOrder","orderSearch","marketing","jadwal","afterDelivery"]'::jsonb, true),
('sales1',   'Rina Sales',     'sales1@app.com',   'password', 'sales',    NULL, '[]'::jsonb, '["dashboard","inputProspek","dataProspek","inputOrder","orderSearch","marketing","jadwal","afterDelivery"]'::jsonb, true),
('sales2',   'Dodi Sales',     'sales2@app.com',   'password', 'sales',    NULL, '[]'::jsonb, '["dashboard","inputProspek","dataProspek","inputOrder","orderSearch","marketing","jadwal","afterDelivery"]'::jsonb, true),
('customer', 'Customer Demo',  'customer@app.com', 'password', 'customer', NULL, '[]'::jsonb, '["jadwal"]'::jsonb, true)
ON CONFLICT (username) DO NOTHING;

-- Seed sample plant
INSERT INTO plants (code, name, address, phone, is_active) VALUES
('PL1', 'Plant Cibubur', 'Jl. Cibubur No. 1, Jakarta Timur', '021-1234567', true),
('PL2', 'Plant Cikarang', 'Jl. Industri Cikarang No. 5, Bekasi', '021-7654321', true)
ON CONFLICT DO NOTHING;

-- Seed sample mutu
INSERT INTO mutu (code, name, slump, price, is_active) VALUES
('K225', 'Beton K225', '10±2', 850000, true),
('K300', 'Beton K300', '12±2', 950000, true),
('K350', 'Beton K350', '14±2', 1050000, true),
('K400', 'Beton K400', '15±2', 1150000, true)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
--  VERIFIKASI SETELAH RUN
-- ═══════════════════════════════════════════════════════════════
--  Jalankan query ini di SQL Editor untuk verifikasi:
--
--  SELECT 'users' AS table, COUNT(*) AS row_count FROM users
--  UNION ALL SELECT 'plants', COUNT(*) FROM plants
--  UNION ALL SELECT 'mutu', COUNT(*) FROM mutu
--  UNION ALL SELECT 'competitors', COUNT(*) FROM competitors
--  UNION ALL SELECT 'addresses', COUNT(*) FROM addresses
--  UNION ALL SELECT 'prospects', COUNT(*) FROM prospects
--  UNION ALL SELECT 'visits', COUNT(*) FROM visits
--  UNION ALL SELECT 'propose', COUNT(*) FROM propose
--  UNION ALL SELECT 'orders', COUNT(*) FROM orders
--  UNION ALL SELECT 'deliveries', COUNT(*) FROM deliveries
--  UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
--  UNION ALL SELECT 'login_logs', COUNT(*) FROM login_logs
--  ORDER BY table;
-- ═══════════════════════════════════════════════════════════════
