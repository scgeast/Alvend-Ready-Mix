/* =====================================================
   DB MODULE — Wrapper Supabase CRUD
   -----------------------------------------------------
   Method:
   - DB.all(table)          → SELECT * ORDER BY id ASC
   - DB.insert(table, item) → INSERT ... RETURNING *
   - DB.update(table, id, patch) → UPDATE ... RETURNING *
   - DB.upsert(table, item) → UPSERT ... RETURNING *
   - DB.remove(table, id)   → DELETE
   ===================================================== */

const DB = {
  _ready() {
    if (!supabaseClient) {
      throw new Error('Supabase belum terhubung. Periksa SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di js/config.js.');
    }
  },

  async all(table) {
    this._ready();
    const { data, error } = await supabaseClient.from(table).select('*').order('id', { ascending: true });
    if (error) { console.error('DB.all error [' + table + ']:', error.message); return []; }
    return (data || []).map(row => DB._normalize(table, row));
  },

  async insert(table, item) {
    this._ready();
    const payload = DB._strip(item);
    const { data, error } = await supabaseClient.from(table).insert(payload).select();
    if (error) { console.error('DB.insert error [' + table + ']:', error.message); throw error; }
    return data && data[0] ? DB._normalize(table, data[0]) : null;
  },

  async update(table, id, patch) {
    this._ready();
    const payload = DB._strip(patch);
    const { data, error } = await supabaseClient.from(table).update(payload).eq('id', id).select();
    if (error) { console.error('DB.update error [' + table + ']:', error.message); throw error; }
    return data && data[0] ? DB._normalize(table, data[0]) : null;
  },

  async upsert(table, item) {
    this._ready();
    const payload = DB._strip(item);
    const { data, error } = await supabaseClient.from(table).upsert(payload, { onConflict: 'id' }).select();
    if (error) { console.error('DB.upsert error [' + table + ']:', error.message); throw error; }
    return data && data[0] ? DB._normalize(table, data[0]) : null;
  },

  async remove(table, id) {
    this._ready();
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) { console.error('DB.remove error [' + table + ']:', error.message); throw error; }
  },

  _normalize(table, row) {
    if (!row) return row;
    if (table === 'users') {
      if (!Array.isArray(row.assigned_sites)) row.assigned_sites = row.assigned_sites || [];
      if (!Array.isArray(row.permissions)) row.permissions = row.permissions || [];
      if (typeof row.is_active === 'undefined') row.is_active = true;
    }
    if (table === 'propose') {
      if (!Array.isArray(row.mutu)) row.mutu = [];
      if (!Array.isArray(row.plant_ids)) row.plant_ids = [];
    }
    if (table === 'notifications') {
      if (!Array.isArray(row.read_by)) row.read_by = [];
    }
    if (table === 'prospects') {
      if (!row.source) row.source = 'internal';
      if (!row.site_no_status) row.site_no_status = 'waiting';
      if (!row.visit_status) row.visit_status = 'not_yet';
      if (typeof row.qty_po === 'undefined') row.qty_po = 0;
    }
    if (table === 'deliveries') {
      if (typeof row.remarks === 'undefined') row.remarks = '';
      if (!row.status) row.status = 'delivered';
    }
    return row;
  },

  _strip(item) {
    // hapus field computed yang tidak ada di tabel
    const out = { ...item };
    delete out.deliveries;
    return out;
  }
};

// Ekspos global
window.DB = DB;
