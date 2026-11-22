-- ═══════════════════════════════════════════════════════════════
--  ALVEND READYMIX — SEED DATA TAMBAHAN (opsional)
-- ═══════════════════════════════════════════════════════════════
--  Jalankan SETELAH supabase_schema.sql kalau butuh data demo
--  lebih lengkap (kompetitor, alamat, prospek contoh).
-- ═══════════════════════════════════════════════════════════════

-- Kompetitor contoh
INSERT INTO competitors (name, address, contact_person, phone) VALUES
('Beton Maju Sejahtera', 'Jl. Raya Bogor KM 25, Jakarta Timur', 'Pak Andi', '0812-1111-2222'),
('Concretex Indonesia', 'Jl. Industri No. 8, Cikarang', 'Bu Sari', '0813-3333-4444'),
('ReadyMix Bangun Persada', 'Jl. Cibubur No. 12, Jakarta Timur', 'Pak Budi', '0814-5555-6666')
ON CONFLICT DO NOTHING;

-- Alamat contoh
INSERT INTO addresses (label, address, city, province, type) VALUES
('Kantor Pusat', 'Jl. MH Thamrin No. 1, Jakarta Pusat', 'Jakarta Pusat', 'DKI Jakarta', 'office'),
('Plant Cibubur', 'Jl. Cibubur No. 1, Jakarta Timur', 'Jakarta Timur', 'DKI Jakarta', 'plant'),
('Plant Cikarang', 'Jl. Industri Cikarang No. 5, Bekasi', 'Cikarang', 'Jawa Barat', 'plant')
ON CONFLICT DO NOTHING;

