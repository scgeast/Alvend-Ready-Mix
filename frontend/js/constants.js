/* =====================================================
   CONSTANTS — Akun developer, default permissions, default users
   ===================================================== */

// ─────────────────────────────────────────────────────────────────
//  AKUN DEVELOPER (IN-MEMORY ONLY)
//  Disimpan hanya di kode JavaScript — TIDAK ada di localStorage,
//  TIDAK ada di tabel users Supabase. Kredensial selalu ambil dari
//  sini, jadi tidak akan ada masalah cache stale.
//
//  Email   : bookingeast0@gmail.com
//  Password: sultan3110
//
//  ⚠ Untuk produksi: daftarkan email ini di Supabase Auth (Dashboard →
//    Authentication → Users → Add user) supaya login developer divalidasi
//    server-side. Tanpa Supabase Auth, login tetap berfungsi via
//    credential di bawah ini.
// ─────────────────────────────────────────────────────────────────
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

// Nama key localStorage lama — dipakai HANYA untuk migrasi cleanup
// (hapus data lama yang tersisa dari versi sebelumnya).
const DEVELOPER_ACCOUNT_LEGACY_KEYS = [
  'beton_developer_account',
  'beton_developer_account_version'
];

const DEFAULT_PERMISSIONS = {
  owner:    ['dashboard','inputProspek','dataProspek','inputOrder','orderSearch','marketing','jadwal','afterDelivery','proposeSiteNo','kelolaUser','kelolaHakAkses','kelolaPlant','kelolaMutu','kelolaKompetitor','kelolaAlamat','logAktivitas'],
  admin:    ['dashboard','inputProspek','dataProspek','inputOrder','orderSearch','marketing','jadwal','afterDelivery'],
  sales:    ['dashboard','inputProspek','dataProspek','inputOrder','orderSearch','marketing','jadwal','afterDelivery'],
  logistik: ['dashboard','jadwal','afterDelivery'],
  customer: ['jadwal']
};

// Hanya dokumentasi — tidak dipakai untuk login.
// Akun demo (owner, admin, sales1, sales2, customer) dibuat via
// supabase_schema.sql dan disimpan di tabel users Supabase.
const DEFAULT_USERS = [
  { id:1, username:'owner',    name:'Owner Utama',    email:'owner@app.com',    password:'password', role:'owner',    plant_id:null, is_active:true,  permissions: DEFAULT_PERMISSIONS.owner.slice() },
  { id:2, username:'admin',    name:'Admin Satu',     email:'admin@app.com',    password:'password', role:'admin',    plant_id:null, is_active:true,  permissions: DEFAULT_PERMISSIONS.admin.slice() },
  { id:3, username:'sales1',   name:'Rina Sales',     email:'sales1@app.com',   password:'password', role:'sales',    plant_id:null, is_active:true,  permissions: DEFAULT_PERMISSIONS.sales.slice() },
  { id:4, username:'sales2',   name:'Dodi Sales',     email:'sales2@app.com',   password:'password', role:'sales',    plant_id:null, is_active:true,  permissions: DEFAULT_PERMISSIONS.sales.slice() },
  { id:5, username:'customer', name:'Customer Demo',  email:'customer@app.com', password:'password', role:'customer', assigned_sites:[], is_active:true, permissions: DEFAULT_PERMISSIONS.customer.slice() },
];

// Retention log aktivitas — log lebih lama dari 24 jam otomatis dihapus
const ACTIVITY_LOG_RETENTION_MS = 24 * 60 * 60 * 1000;

// Ekspos global
window.DEVELOPER_DEFAULT_ACCOUNT = DEVELOPER_DEFAULT_ACCOUNT;
window.DEVELOPER_ACCOUNT_LEGACY_KEYS = DEVELOPER_ACCOUNT_LEGACY_KEYS;
window.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;
window.DEFAULT_USERS = DEFAULT_USERS;
window.ACTIVITY_LOG_RETENTION_MS = ACTIVITY_LOG_RETENTION_MS;
