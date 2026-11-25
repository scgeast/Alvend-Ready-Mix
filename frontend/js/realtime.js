/* =====================================================
   REALTIME — Supabase Realtime subscriptions
   -----------------------------------------------------
   Listen ke perubahan di tabel utama (postgres_changes).
   Saat ada INSERT/UPDATE/DELETE dari user lain, otomatis
   trigger reload() di app Alpine supaya UI terupdate.

   Catatan:
   - Realtime harus diaktifkan di Supabase Dashboard:
     Database → Replication → aktifkan "realtime" untuk
     tabel: prospects, orders, deliveries, visits, propose,
     notifications, users, plants, mutu, competitors,
     addresses
   - Cek juga Publication "supabase_realtime" sudah include
     tabel-tabel tersebut.
   ===================================================== */

const Realtime = {
  _channel: null,
  _reloadFn: null,
  _debounceTimer: null,
  _enabled: false,

  /**
   * Mulai subscribe ke perubahan tabel.
   * @param {Function} reloadFn - fungsi async untuk reload data (app.reload)
   */
  start(reloadFn) {
    if (!supabaseClient) {
      console.warn('[Realtime] supabaseClient belum siap — realtime nonaktif');
      return;
    }
    if (this._enabled) {
      // Sudah jalan, hanya ganti reloadFn
      this._reloadFn = reloadFn;
      return;
    }
    this._reloadFn = reloadFn;
    this._enabled = true;

    const tables = [
      'prospects', 'orders', 'deliveries', 'visits', 'propose',
      'notifications', 'users', 'plants', 'mutu', 'competitors', 'addresses'
    ];

    try {
      this._channel = supabaseClient
        .channel('alvend-realtime-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            // Log untuk debugging (bisa dihapus di produksi)
            // console.log('[Realtime] change:', payload.table, payload.eventType);
            this._scheduleReload();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Terhubung — auto-update aktif untuk', tables.length, 'tabel');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[Realtime] Status:', status, '— mencoba reconnect...');
          } else if (status === 'CLOSED') {
            console.warn('[Realtime] Channel tertutup');
          }
        });
    } catch (e) {
      console.error('[Realtime] Gagal subscribe:', e);
      this._enabled = false;
    }
  },

  /**
   * Debounce reload agar tidak spam saat banyak perubahan sekaligus.
   * Tungu 500ms setelah perubahan terakhir baru reload.
   */
  _scheduleReload() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(async () => {
      this._debounceTimer = null;
      if (typeof this._reloadFn === 'function') {
        try {
          await this._reloadFn();
        } catch (e) {
          console.error('[Realtime] Error saat reload:', e);
        }
      }
    }, 500);
  },

  /**
   * Stop subscription (dipanggil saat logout).
   */
  stop() {
    if (this._channel && supabaseClient) {
      try {
        supabaseClient.removeChannel(this._channel);
      } catch (_) {}
    }
    this._channel = null;
    this._reloadFn = null;
    this._enabled = false;
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
  }
};

// Ekspos global
window.Realtime = Realtime;
