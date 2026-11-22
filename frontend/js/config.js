/* =====================================================
   SUPABASE CONFIG
   -----------------------------------------------------
   Ganti URL & Publishable Key dengan milik Anda.
   Ambil dari: Supabase Dashboard → Project Settings → API Keys
   ===================================================== */

const SUPABASE_URL = 'https://74S88rRafH0wVi70p40hWA.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_74S88rRafH0wVi70p40hWA_b8ivR...'; // ← GANTI dengan key LENGKAP dari dashboard

let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  } else {
    console.error('Library Supabase JS tidak ter-load. Cek koneksi internet.');
  }
} catch (e) {
  console.error('Gagal inisialisasi Supabase:', e);
}

// Ekspos global untuk dipakai modul lain
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
window.supabaseClient = supabaseClient;

