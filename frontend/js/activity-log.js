/* =====================================================
   ACTIVITY LOG — Log aktivitas user (login, navigasi)
   -----------------------------------------------------
   - Log disimpan maksimal 24 jam sejak aktivitas dibuat
   - Aktivitas akun developer TIDAK PERNAH ditulis ke Supabase
   ===================================================== */

async function pruneActivityLogsAsync() {
  if (!supabaseClient) return [];
  // Defensive: kalau ACTIVITY_LOG_RETENTION_MS belum terdefinisi (mis.
  // constants.js gagal load), gunakan default 24 jam.
  const retentionMs = (typeof ACTIVITY_LOG_RETENTION_MS !== 'undefined')
                      ? ACTIVITY_LOG_RETENTION_MS
                      : 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - retentionMs).toISOString();
  // Hapus log lebih tua dari 24 jam
  await supabaseClient.from('login_logs').delete().lt('login_at', cutoff);
  // Hanya tampilkan log yang rolenya bukan developer
  const { data, error } = await supabaseClient
    .from('login_logs')
    .select('*')
    .neq('role', 'developer')
    .order('id', { ascending: false });

  if (error) return [];
  return (data || []).map(log => ({
    ...log,
    activity: log.activity || (
      log.status === 'success'
        ? 'Login berhasil'
        : log.status === 'inactive'
          ? 'Percobaan login — akun nonaktif'
          : 'Percobaan login gagal'
    )
  }));
}

async function appendActivityLogAsync(user, activity, status = 'success', usernameFallback = '') {
  if (!supabaseClient) return;
  if (!user && !usernameFallback) return;

  // FILTER: aktivitas akun developer tidak pernah ditulis ke Supabase
  // sehingga tidak muncul di menu Log Aktivitas akun manapun.
  if (user && String(user.role || '') === 'developer') return;
  const username = (user?.username || usernameFallback || '').toLowerCase();
  if (username === 'developer') return;

  await supabaseClient.from('login_logs').insert({
    user_id: user?.id || null,
    username: user?.username || usernameFallback || '-',
    name: user?.name || '(tidak dikenal)',
    role: user?.role || '-',
    status,
    activity: String(activity || 'Aktivitas user'),
    login_at: new Date().toISOString()
  });
}

// Ekspos global
window.pruneActivityLogsAsync = pruneActivityLogsAsync;
window.appendActivityLogAsync = appendActivityLogAsync;
