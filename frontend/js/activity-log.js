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

  // 1) DELETE log lebih tua dari 24 jam — di-wrap try/catch sendiri
  //    supaya kalau gagal (RLS, network, dll), SELECT di bawah tetap jalan.
  try {
    const delResult = await supabaseClient.from('login_logs').delete().lt('login_at', cutoff);
    if (delResult.error) {
      console.warn('[activity-log] prune delete warning:', delResult.error.message);
    }
  } catch (e) {
    console.warn('[activity-log] prune delete error:', e?.message || e);
  }

  // 2) SELECT semua log kecuali developer — PISAH dari delete
  //    Supaya kalau delete gagal/race, data tetap terbaca.
  let data = [], error = null;
  try {
    const res = await supabaseClient
      .from('login_logs')
      .select('*')
      .neq('role', 'developer')
      .order('id', { ascending: false });
    data = res.data || [];
    error = res.error;
  } catch (e) {
    error = e;
  }

  if (error) {
    console.warn('[activity-log] select warning:', error.message || error);
    return [];
  }
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

  const payload = {
    user_id: user?.id || null,
    username: user?.username || usernameFallback || '-',
    name: user?.name || '(tidak dikenal)',
    role: user?.role || '-',
    status,
    activity: String(activity || 'Aktivitas user'),
    login_at: new Date().toISOString()
  };

  try {
    const { error } = await supabaseClient.from('login_logs').insert(payload);
    if (error) {
      console.warn('[activity-log] insert warning:', error.message, 'payload:', payload);
    }
  } catch (e) {
    console.warn('[activity-log] insert error:', e?.message || e, 'payload:', payload);
  }
}

// Ekspos global
window.pruneActivityLogsAsync = pruneActivityLogsAsync;
window.appendActivityLogAsync = appendActivityLogAsync;
window.getActivityLogsAsync = getActivityLogsAsync;

/**
 * SELECT-only — baca log aktivitas TANPA delete.
 * Dipakai oleh reload() saat Realtime trigger, supaya
 * tidak ada efek samping DELETE yang berlebihan.
 */
async function getActivityLogsAsync() {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('login_logs')
      .select('*')
      .neq('role', 'developer')
      .order('id', { ascending: false });
    if (error) {
      console.warn('[activity-log] getActivityLogs warning:', error.message);
      return [];
    }
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
  } catch (e) {
    console.warn('[activity-log] getActivityLogs error:', e?.message || e);
    return [];
  }
}
