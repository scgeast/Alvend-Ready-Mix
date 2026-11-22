/* =====================================================
   AUTH MODULE — Supabase Auth integration (optional)
   -----------------------------------------------------
   Hanya dipakai untuk akun developer (bookingeast0@gmail.com).
   Akun owner/admin/sales/customer tetap pakai tabel users.
   ===================================================== */

async function trySupabaseAuth(email, password) {
  if (!supabaseClient || !supabaseClient.auth) return null;
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn('Supabase Auth gagal (fallback ke local):', error.message);
      return null;
    }
    return data?.user || null;
  } catch (e) {
    console.warn('Supabase Auth exception:', e?.message || e);
    return null;
  }
}

async function signOutSupabaseAuth() {
  if (!supabaseClient || !supabaseClient.auth) return;
  try { await supabaseClient.auth.signOut(); } catch (_) {}
}

// Ekspos global
window.trySupabaseAuth = trySupabaseAuth;
window.signOutSupabaseAuth = signOutSupabaseAuth;

