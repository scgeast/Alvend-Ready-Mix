// ═══════════════════════════════════════════════════════════════
// js/app.js — Alpine.js component app()
// ALVEND Readymix Management
//
// ✅ FIX DATABASE: Menyesuaikan nama tabel dengan Supabase
//    - prospek -> prospects
//    - activity_logs -> login_logs
// ✅ FIX EDIT USER: Menambahkan fungsi simpan edit user
// ═══════════════════════════════════════════════════════════════

function app() {
  return {
    // ── State global ──────────────────────────────────────────
    fatalError: '',
    currentUser: null,
    page: 'dashboard',
    pageTitle: 'Dashboard',
    sidebarOpen: true,
    toast: '',
    toastType: 'success',
    isRefreshing: false,

    // Login
    loginForm: { username: '', password: '' },
    loginError: '',
    showLoginPw: false,

    // Data master
    users: [],
    plants: [],
    mutuList: [],
    competitors: [],
    addresses: [],
    prospek: [], // Tetap gunakan variabel 'prospek' di frontend, tapi ambil dari tabel 'prospects'
    orders: [],
    deliveries: [],
    logs: [],

    // Filter
    dashFilter: { preset: 'month', start: '', end: '' },
    pFilter: { q: '', source: '', status: '' },
    jFilter: { plants: [], status: '', date: '' },
    sFilter: { q: '', plant_id: '', mutu_id: '', status: '' },
    adFilter: { q: '', plant_id: '', date_from: '', date_to: '', status: '' },
    psFilter: { q: '', status: '' },
    logFilter: { q: '', status: '' },
    mktFilter: { siteSearch: '' },

    // Forms
    pForm: {},
    oForm: {},
    uForm: { assigned_sites: [] },
    plForm: {},
    mForm: {},
    cForm: {},
    aForm: {},
    profileForm: { old_password: '', new_password: '', confirm_password: '' },
    edvForm: {},
    epForm: {},
    emForm: {},
    ecForm: {},
    eaForm: {},
    euForm: {},
    accessForm: { permissions: [] },

    // Modal state
    editPropModal: { show: false },
    editPropForm: { mutu: [], plant_ids: [] },
    accessModal: { show: false, userId: null, userName: '' },
    orderDetailModal: { show: false, data: null },
    editDvModal: { show: false },
    editPlantModal: { show: false },
    editMutuModal: { show: false },
    editKompetitorModal: { show: false },
    editAlamatModal: { show: false },
    editUserModal: { show: false }, // ✅ Tambahan untuk modal edit user
    ocModal: { show: false, mode: 'new' },

    // Password visibility
    showUserPw: false,
    showOldPw: false,
    showNewPw: false,
    showConfirmPw: false,
    pwVisible: {},

    // Marketing
    mktSelectedSite: null,
    mktSuggestions: [],
    mktSuggestOpen: false,

    // Notifikasi
    unreadNotifCount: 0,

    // ═══════════════════════════════════════════════════════════
    // MENU REGISTRY
    // ═══════════════════════════════════════════════════════════
    allMenus: [
      { key: 'dashboard',     label: 'Dashboard',         icon: 'fa-solid fa-gauge-high' },
      { key: 'inputProspek',  label: 'Input Prospek',     icon: 'fa-solid fa-plus-circle' },
      { key: 'dataProspek',   label: 'Data Prospek',      icon: 'fa-solid fa-list' },
      { key: 'inputOrder',    label: 'Input Order',       icon: 'fa-solid fa-cart-plus' },
      { key: 'orderSearch',   label: 'Order Search',      icon: 'fa-solid fa-magnifying-glass' },
      { key: 'marketing',     label: 'Marketing',         icon: 'fa-solid fa-chart-line' },
      { key: 'jadwal',        label: 'Jadwal Pengecoran', icon: 'fa-solid fa-calendar-days' },
      { key: 'afterDelivery', label: 'After Delivery',    icon: 'fa-solid fa-truck-fast' },
    ],

    menuGroups: [
      { group: 'Utama', items: [ { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' } ]},
      { group: 'Prospek', items: [
        { key: 'inputProspek', label: 'Input Prospek', icon: 'fa-solid fa-plus-circle' },
        { key: 'dataProspek',  label: 'Data Prospek',  icon: 'fa-solid fa-list' },
      ]},
      { group: 'Order', items: [
        { key: 'inputOrder',  label: 'Input Order',  icon: 'fa-solid fa-cart-plus' },
        { key: 'orderSearch', label: 'Order Search', icon: 'fa-solid fa-magnifying-glass' },
        { key: 'marketing',   label: 'Marketing',    icon: 'fa-solid fa-chart-line' },
      ]},
      { group: 'Pengiriman', items: [
        { key: 'jadwal',        label: 'Jadwal Pengecoran', icon: 'fa-solid fa-calendar-days' },
        { key: 'afterDelivery', label: 'After Delivery',    icon: 'fa-solid fa-truck-fast' },
      ]},
    ],

    // ═══════════════════════════════════════════════════════════
    // HAK AKSES (FIX)
    // ═══════════════════════════════════════════════════════════
    hasAccessExact(perm) {
      if (!this.currentUser) return false;
      if (this.currentUser.role === 'owner' || this.currentUser.role === 'developer') return true;
      const perms = this.currentUser.permissions || this.defaultPermsFor(this.currentUser.role) || [];
      return perms.includes(perm);
    },

    hasAccess(perm) {
      if (!this.currentUser) return false;
      if (this.currentUser.role === 'owner' || this.currentUser.role === 'developer') return true;
      const perms = this.currentUser.permissions || this.defaultPermsFor(this.currentUser.role) || [];
      if (perm === 'dashboard') {
        return perms.some(p => this.dashboardGroup.includes(p));
      }
      return perms.includes(perm);
    },

    get dashboardGroup() {
      return [
        'dashboard', 'inputProspek', 'dataProspek', 'inputOrder', 
        'orderSearch', 'marketing', 'jadwal', 'afterDelivery'
      ];
    },

    nav(page) {
      if (!this.currentUser) return;
      if (page === 'dashboard' && !this.hasAccessExact('dashboard')) {
        const fallback = ['inputProspek', 'dataProspek', 'inputOrder',
                          'orderSearch', 'marketing', 'jadwal', 'afterDelivery']
          .find(p => this.hasAccessExact(p));
        if (fallback) page = fallback;
      }
      this.page = page;
      this.pageTitle = this.titleForPage(page);
      try { location.hash = 'page=' + page; } catch (e) {}
    },

    titleForPage(page) {
      const map = {
        dashboard: 'Dashboard', inputProspek: 'Input Prospek', dataProspek: 'Data Prospek',
        inputOrder: 'Input Order', orderSearch: 'Order Search', marketing: 'Marketing',
        jadwal: 'Jadwal Pengecoran', afterDelivery: 'After Delivery', proposeSiteNo: 'Approval Site No',
        kelolaUser: 'Kelola User', kelolaHakAkses: 'Kelola Hak Akses', kelolaPlant: 'Kelola Plant',
        kelolaMutu: 'Kelola Mutu', kelolaKompetitor: 'Kelola Kompetitor', kelolaAlamat: 'Kelola Alamat',
        logAktivitas: 'Log Aktivitas', profil: 'Profil Saya',
      };
      return map[page] || 'Dashboard';
    },

    // ═══════════════════════════════════════════════════════════
    // INIT & AUTH
    // ═══════════════════════════════════════════════════════════
    async init() {
      try {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
          this.fatalError = 'Supabase client tidak terinisialisasi. Cek js/config.js';
          return;
        }
        this.applyDashPreset('month');
        
        try {
          const { data: sess } = await supabaseClient.auth.getSession();
          if (sess && sess.session) {
            const email = sess.session.user?.email;
            if (email) {
              const { data: rows } = await supabaseClient.from('users').select('*').eq('email', email).limit(1);
              if (rows && rows.length) {
                this.currentUser = rows[0];
                await this.refreshData();
                this.nav(this.page);
                return;
              }
            }
          }
        } catch (e) { console.warn('auth session check', e); }

        const m = (location.hash || '').match(/page=([a-zA-Z0-9_]+)/);
        if (m && m[1]) this.nav(m[1]);
      } catch (e) {
        console.error(e);
        this.fatalError = e.message || String(e);
      }
    },

    async login() {
      this.loginError = '';
      try {
        const username = (this.loginForm.username || '').trim();
        const password = this.loginForm.password || '';
        if (!username || !password) {
          this.loginError = 'User ID dan password wajib diisi';
          return;
        }

        // Developer default account (offline)
        if (typeof DEVELOPER_DEFAULT_ACCOUNT !== 'undefined'
            && username === DEVELOPER_DEFAULT_ACCOUNT.username
            && password === DEVELOPER_DEFAULT_ACCOUNT.password) {
          this.currentUser = {
            id: 'developer', username: DEVELOPER_DEFAULT_ACCOUNT.username,
            name: DEVELOPER_DEFAULT_ACCOUNT.name, role: 'developer', email: '',
            permissions: this.allMenus.map(m => m.key), is_active: true,
          };
          await this.refreshData();
          this.nav('dashboard');
          if (typeof appendActivityLogAsync === 'function') appendActivityLogAsync({ activity: 'Login developer', status: 'success' });
          return;
        }

        // Cek user di tabel users
        const { data: rows, error } = await supabaseClient
          .from('users')
          .select('*')
          .or(`username.eq.${username},email.eq.${username}`)
          .limit(1);

        if (error) throw error;
        if (!rows || !rows.length) {
          this.loginError = 'User tidak ditemukan';
          if (typeof appendActivityLogAsync === 'function') appendActivityLogAsync({ activity: `Login gagal: user ${username} tidak ditemukan`, status: 'failed' });
          return;
        }

        const u = rows[0];
        if (u.is_active === false) {
          this.loginError = 'Akun Anda dinonaktifkan. Hubungi owner.';
          if (typeof appendActivityLogAsync === 'function') appendActivityLogAsync({ activity: `Login gagal: akun ${username} nonaktif`, status: 'inactive' });
          return;
        }
        if (u.password !== password) {
          this.loginError = 'Password salah';
          if (typeof appendActivityLogAsync === 'function') appendActivityLogAsync({ activity: `Login gagal: password salah untuk ${username}`, status: 'failed' });
          return;
        }

        this.currentUser = u;
        await this.refreshData();
        this.nav('dashboard');
        if (typeof appendActivityLogAsync === 'function') appendActivityLogAsync({ activity: `Login berhasil sebagai ${u.role}`, status: 'success' });
      } catch (e) {
        console.error(e);
        this.loginError = e.message || String(e);
      }
    },

    async logout() {
      try {
        if (typeof signOutSupabaseAuth === 'function') await signOutSupabaseAuth();
      } catch (e) { /* ignore */ }
      this.currentUser = null;
      this.loginForm = { username: '', password: '' };
      this.page = 'dashboard';
      this.pageTitle = 'Dashboard';
    },

    defaultPermsFor(role) {
      switch (role) {
        case 'owner': case 'developer': return this.allMenus.map(m => m.key);
        case 'admin': return ['dashboard','inputProspek','dataProspek','inputOrder','orderSearch','marketing','jadwal','afterDelivery'];
        case 'sales': return ['dashboard','inputProspek','dataProspek','inputOrder','orderSearch','marketing','jadwal'];
        case 'logistik': return ['dashboard','jadwal','afterDelivery'];
        case 'customer': return ['jadwal'];
        default: return [];
      }
    },

    isOwnerOrDeveloper() {
      return this.currentUser && (this.currentUser.role === 'owner' || this.currentUser.role === 'developer');
    },

    // ═══════════════════════════════════════════════════════════
    // HAK AKSES MODAL
    // ═══════════════════════════════════════════════════════════
    async saveAccess() {
      try {
        const user = this.users.find(u => u.id === this.accessModal.userId);
        if (!user) { this.toast = 'User tidak ditemukan'; this.toastType = 'error'; return; }
        const perms = [...new Set(this.accessForm.permissions.filter(Boolean))];
        const { error } = await supabaseClient.from('users').update({ permissions: perms }).eq('id', user.id);
        if (error) throw error;
        
        user.permissions = perms;
        if (typeof appendActivityLogAsync === 'function') {
          appendActivityLogAsync({ activity: `Ubah hak akses user ${user.username || user.name}: ${perms.join(', ') || '(kosong)'}`, status: 'success' });
        }
        this.toast = 'Hak akses berhasil disimpan';
        this.toastType = 'success';
        this.accessModal.show = false;
        await this.refreshData();
      } catch (err) {
        console.error(err);
        this.toast = 'Gagal menyimpan hak akses: ' + (err.message || err);
        this.toastType = 'error';
      }
    },

    openAccessModal(u) {
      this.accessModal = { show: true, userId: u.id, userName: u.name };
      this.accessForm.permissions = [...(u.permissions || this.defaultPermsFor(u.role) || [])];
    },

    toggleAllAccess() {
      if (this.accessForm.permissions.length === this.allMenus.length) {
        this.accessForm.permissions = [];
      } else {
        this.accessForm.permissions = this.allMenus.map(m => m.key);
      }
    },

    menuLabel(key) {
      const m = this.allMenus.find(x => x.key === key);
      return m ? m.label : key;
    },

    // ═══════════════════════════════════════════════════════════
    // REFRESH DATA
    // ═══════════════════════════════════════════════════════════
    async refreshData() {
      if (this.isRefreshing) return;
      this.isRefreshing = true;
      
      try {
        const [usersRes, plantsRes, mutuRes, compRes, addrRes, prospRes, ordRes, delivRes, logRes] =
          await Promise.all([
            supabaseClient.from('users').select('*').order('name'),
            supabaseClient.from('plants').select('*').order('name'),
            supabaseClient.from('mutu').select('*').order('code'),
            supabaseClient.from('competitors').select('*').order('name'),
            supabaseClient.from('addresses').select('*').order('label'),
            // ✅ FIX: prospects (pakai s)
            supabaseClient.from('prospects').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('orders').select('*').order('delivery_date', { ascending: false }),
            supabaseClient.from('deliveries').select('*').order('delivery_date', { ascending: false }),
            // ✅ FIX: login_logs
            supabaseClient.from('login_logs').select('*').order('login_at', { ascending: false }).limit(500),
          ]);

        this.users = usersRes.data || [];
        this.plants = plantsRes.data || [];
        this.mutuList = mutuRes.data || [];
        this.competitors = compRes.data || [];
        this.addresses = addrRes.data || [];
        this.prospek = prospRes.data || [];
        this.orders = ordRes.data || [];
        this.deliveries = delivRes.data || [];
        this.logs = logRes.data || [];

        if (this.hasAccess('dataProspek')) {
          this.unreadNotifCount = this.prospek.filter(p => (p.source === 'customer_repeat') && !p.sales_id).length;
        } else {
          this.unreadNotifCount = 0;
        }

        if (this.currentUser && this.currentUser.id !== 'developer') {
          const fresh = this.users.find(u => u.id === this.currentUser.id);
          if (fresh) this.currentUser = fresh;
        }

        this.toast = 'Data berhasil diperbarui!';
        this.toastType = 'success';
        setTimeout(() => { this.toast = ''; }, 3000);

      } catch (e) {
        console.error('refreshData', e);
        this.toast = 'Gagal memuat data: ' + (e.message || e);
        this.toastType = 'error';
      } finally {
        this.isRefreshing = false;
      }
    },
    
    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════
    roleBadge(role) {
      const map = { owner: 'bg-purple-100 text-purple-700', developer: 'bg-indigo-100 text-indigo-700', admin: 'bg-blue-100 text-blue-700', sales: 'bg-emerald-100 text-emerald-700', logistik: 'bg-amber-100 text-amber-700', customer: 'bg-slate-100 text-slate-700' };
      return map[role] || 'bg-slate-100 text-slate-700';
    },
    statusBadge(status) {
      const map = { scheduled: 'bg-blue-100 text-blue-700', partial: 'bg-amber-100 text-amber-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };
      return map[status] || 'bg-slate-100 text-slate-700';
    },
    fmt(n) { return (Number(n) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 }); },
    fmtDate(d) {
      if (!d) return '-';
      try { return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; }
    },
    mutuCode(id) { const m = this.mutuList.find(x => Number(x.id) === Number(id)); return m ? m.code : '-'; },
    plantName(id) { const p = this.plants.find(x => Number(x.id) === Number(id)); return p ? p.name : '-'; },
    salesName(id) { const u = this.users.find(x => x.id === id); return u ? u.name : '-'; },
    orderById(id) { return this.orders.find(o => Number(o.id) === Number(id)); },
    hasDelivery(orderId) { return this.deliveries.some(d => Number(d.order_id) === Number(orderId) && (d.status || 'delivered') === 'delivered'); },
    isOrderFinished(o) { return o && (o.status === 'completed' || o.status === 'cancelled' || (Number(o.qty_remain) <= 0)); },

    // ═══════════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════
    applyDashPreset(preset) {
      const today = new Date(); const iso = (d) => d.toISOString().slice(0, 10);
      if (preset === 'today') { this.dashFilter.start = iso(today); this.dashFilter.end = iso(today); }
      else if (preset === 'week') { const s = new Date(today); s.setDate(s.getDate() - 6); this.dashFilter.start = iso(s); this.dashFilter.end = iso(today); }
      else if (preset === 'month') { const s = new Date(today); s.setDate(s.getDate() - 29); this.dashFilter.start = iso(s); this.dashFilter.end = iso(today); }
    },
    onDashDateChange() { this.dashFilter.preset = 'custom'; },
    get _dashRange() { return { start: this.dashFilter.start, end: this.dashFilter.end }; },
    get _dashOrdersInRange() {
      const { start, end } = this._dashRange;
      return this.orders.filter(o => (!start || o.delivery_date >= start) && (!end || o.delivery_date <= end));
    },
    get _dashDeliveriesInRange() {
      const { start, end } = this._dashRange;
      return this.deliveries.filter(d => (d.status || 'delivered') === 'delivered' && (!start || d.delivery_date >= start) && (!end || d.delivery_date <= end));
    },
    get dashStats() {
      const ords = this._dashOrdersInRange;
      const delivs = this._dashDeliveriesInRange;
      const { start, end } = this._dashRange;
      const pros = this.prospek.filter(p => {
        const d = (p.created_at || '').slice(0, 10);
        return (!start || d >= start) && (!end || d <= end);
      });
      return {
        totalProspek: pros.length,
        repeatOrder: pros.filter(p => (p.source || 'internal') === 'customer_repeat').length,
        complete: pros.filter(p => p.site_no_status === 'complete').length,
        totalOrder: ords.length,
        qtyOrder: ords.reduce((a, o) => a + (Number(o.qty_order) || 0), 0),
        qtyDelivered: delivs.reduce((a, d) => a + (Number(d.qty) || 0), 0),
      };
    },
    get dashDeliveryRate() { const s = this.dashStats; return s.qtyOrder > 0 ? (s.qtyDelivered / s.qtyOrder) * 100 : 0; },
    get dashRepeatOrderRate() { const s = this.dashStats; return s.totalProspek > 0 ? (s.repeatOrder / s.totalProspek) * 100 : 0; },
    get dashConversionRate() { const s = this.dashStats; return s.totalProspek > 0 ? (s.totalOrder / s.totalProspek) * 100 : 0; },
    get dashStatusBreakdown() {
      const ords = this._dashOrdersInRange;
      return { open: ords.filter(o => o.status === 'scheduled').length, partial: ords.filter(o => o.status === 'partial').length, completed: ords.filter(o => o.status === 'completed').length, cancelled: ords.filter(o => o.status === 'cancelled').length, total: ords.length };
    },
    get dashDonutStyle() {
      const b = this.dashStatusBreakdown;
      if (b.total === 0) return 'background: conic-gradient(#e2e8f0 0deg 360deg);';
      const seg = (n) => (n / b.total) * 360;
      const a1 = seg(b.open), a2 = a1 + seg(b.partial), a3 = a2 + seg(b.completed), a4 = a3 + seg(b.cancelled);
      return `background: conic-gradient(#3b82f6 0deg ${a1}deg, #f59e0b ${a1}deg ${a2}deg, #10b981 ${a2}deg ${a3}deg, #ef4444 ${a3}deg ${a4}deg);`;
    },
    get dashTrendDaily() {
      const { start, end } = this._dashRange;
      if (!start || !end) return [];
      const days = []; const cur = new Date(start); const last = new Date(end);
      while (cur <= last) { const key = cur.toISOString().slice(0, 10); days.push({ date: key, label: key, orderQty: 0, delivQty: 0 }); cur.setDate(cur.getDate() + 1); }
      const map = {}; days.forEach(d => { map[d.date] = d; });
      this._dashOrdersInRange.forEach(o => { if (map[o.delivery_date]) map[o.delivery_date].orderQty += Number(o.qty_order) || 0; });
      this._dashDeliveriesInRange.forEach(d => { if (map[d.delivery_date]) map[d.delivery_date].delivQty += Number(d.qty) || 0; });
      return days;
    },
    get dashTrendMax() { return Math.max(1, ...this.dashTrendDaily.map(d => Math.max(d.orderQty, d.delivQty))); },
    get dashWeeklyData() {
      const { start, end } = this._dashRange;
      if (!start || !end) return [];
      const weeks = []; const s = new Date(start); const day = (s.getDay() + 6) % 7; s.setDate(s.getDate() - day);
      while (s <= new Date(end)) {
        const ws = new Date(s); const we = new Date(s); we.setDate(we.getDate() + 6);
        weeks.push({ label: `${ws.getDate()}/${ws.getMonth() + 1}`, start: ws.toISOString().slice(0, 10), end: we.toISOString().slice(0, 10), prospek: 0, order: 0 });
        s.setDate(s.getDate() + 7);
      }
      const inWeek = (dateStr, w) => dateStr >= w.start && dateStr <= w.end;
      weeks.forEach(w => {
        w.prospek = this.prospek.filter(p => inWeek((p.created_at || '').slice(0, 10), w)).length;
        w.order = this._dashOrdersInRange.filter(o => inWeek(o.delivery_date, w)).reduce((a, o) => a + (Number(o.qty_order) || 0), 0);
      });
      return weeks;
    },
    get dashWeeklyMaxProspek() { return Math.max(1, ...this.dashWeeklyData.map(w => w.prospek)); },
    get dashWeeklyMaxOrder() { return Math.max(1, ...this.dashWeeklyData.map(w => w.order)); },
    get dashRecentOrders() { return [...this._dashOrdersInRange].sort((a, b) => (b.delivery_date || '').localeCompare(a.delivery_date || '')).slice(0, 5); },
    get dashIncompleteSites() {
      const bySite = {};
      this.prospek.forEach(p => {
        if (p.site_no_status !== 'complete' || !p.site_no) return;
        const qtyPo = Number(p.qty_po) || 0;
        const ords = this.orders.filter(o => o.site_no === p.site_no && o.status !== 'cancelled');
        const delivered = ords.reduce((a, o) => a + (Number(o.qty_delivery) || 0), 0);
        const remain = qtyPo > 0 ? Math.max(0, qtyPo - delivered) : 0;
        if (remain > 0) bySite[p.id] = { id: p.id, site_no: p.site_no, project_name: p.project_name, qty_po: qtyPo, remain };
      });
      return Object.values(bySite).slice(0, 10);
    },

    // ═══════════════════════════════════════════════════════════
    // PROSPEK
    // ═══════════════════════════════════════════════════════════
    get filteredProspek() {
      const q = (this.pFilter.q || '').toLowerCase();
      return this.prospek.filter(p => {
        if (q && !((p.project_name || '').toLowerCase().includes(q) || (p.site_no || '').toLowerCase().includes(q))) return false;
        if (this.pFilter.source && (p.source || 'internal') !== this.pFilter.source) return false;
        if (this.pFilter.status && (p.site_no_status || 'waiting') !== this.pFilter.status) return false;
        return true;
      });
    },

    async saveProspek() {
      try {
        const payload = { ...this.pForm, source: 'internal', site_no_status: 'waiting', created_by: this.currentUser.id, created_at: new Date().toISOString() };
        // ✅ FIX: prospects
        const { error } = await supabaseClient.from('prospects').insert(payload);
        if (error) throw error;
        this.toast = 'Prospek berhasil disimpan';
        this.toastType = 'success';
        this.pForm = {};
        await this.refreshData();
        this.nav('dataProspek');
      } catch (e) {
        this.toast = 'Gagal menyimpan prospek: ' + (e.message || e);
        this.toastType = 'error';
      }
    },

    async deleteProspect(p) {
      if (!confirm(`Hapus prospek "${p.project_name}"?`)) return;
      try {
        // ✅ FIX: prospects
        const { error } = await supabaseClient.from('prospects').delete().eq('id', p.id);
        if (error) throw error;
        this.toast = 'Prospek dihapus'; this.toastType = 'success';
        await this.refreshData();
      } catch (e) { this.toast = 'Gagal hapus: ' + (e.message || e); this.toastType = 'error'; }
    },

    async claimProspek(p) {
      try {
        // ✅ FIX: prospects
        const { error } = await supabaseClient.from('prospects').update({ sales_id: this.currentUser.id }).eq('id', p.id);
        if (error) throw error;
        this.toast = 'Prospek berhasil di-claim'; this.toastType = 'success';
        await this.refreshData();
      } catch (e) { this.toast = 'Gagal claim: ' + (e.message || e); this.toastType = 'error'; }
    },

    showRequestDetail(p) { alert(`Detail Permintaan Repeat Order\n\nProject: ${p.project_name}\nAlamat: ${p.address || '-'}\nPIC: ${p.pic_name || '-'}\nKontak: ${p.pic_contact || '-'}`); },
    openVisit(p) { alert(`Form visit untuk: ${p.project_name}\n\n(Fitur ini membuka modal visit di versi asli)`); },

    goOrder(p) {
      this.oForm = { site_no: p.site_no, project_name: p.project_name, address: p.address || '', po_no: p.po_no || '', pic_name: p.pic_name || '', mutu_list: this.mutuList.filter(m => (p.mutu || []).map(Number).includes(Number(m.id))), plant_list: this.plants.filter(pl => (p.plant_ids || []).map(Number).includes(Number(pl.id))) };
      this.nav('inputOrder');
    },

    // ═══════════════════════════════════════════════════════════
    // ORDER
    // ═══════════════════════════════════════════════════════════
    get completeSites() { return this.prospek.filter(p => p.site_no_status === 'complete' && p.site_no); },
    get filteredOrders() {
      const q = (this.sFilter.q || '').toLowerCase();
      return this.orders.filter(o => {
        if (q && !((o.order_no || '').toLowerCase().includes(q) || (o.site_no || '').toLowerCase().includes(q) || (o.project_name || '').toLowerCase().includes(q))) return false;
        if (this.sFilter.plant_id && String(o.plant_id) !== String(this.sFilter.plant_id)) return false;
        if (this.sFilter.mutu_id && String(o.mutu_id) !== String(this.sFilter.mutu_id)) return false;
        if (this.sFilter.status && o.status !== this.sFilter.status) return false;
        return true;
      });
    },
    onSiteChange() {
      const site = this.completeSites.find(s => s.site_no === this.oForm.site_no);
      if (!site) return;
      this.oForm.project_name = site.project_name;
      this.oForm.address = site.address || '';
      this.oForm.po_no = site.po_no || '';
      this.oForm.pic_name = site.pic_name || '';
      this.oForm.mutu_list = this.mutuList.filter(m => (site.mutu || []).map(Number).includes(Number(m.id)));
      this.oForm.plant_list = this.plants.filter(pl => (site.plant_ids || []).map(Number).includes(Number(pl.id)));
    },
    async saveOrder() {
      try {
        const count = (this.orders || []).length + 1; const orderNo = 'ORD-' + String(count).padStart(5, '0');
        const payload = {
          order_no: orderNo, site_no: this.oForm.site_no, project_name: this.oForm.project_name, address: this.oForm.address,
          po_no: this.oForm.po_no, mutu_id: this.oForm.mutu_id, plant_id: this.oForm.plant_id, delivery_date: this.oForm.delivery_date,
          pouring_time: this.oForm.pouring_time, qty_order: this.oForm.qty_order, qty_delivery: 0, qty_remain: this.oForm.qty_order,
          metode_cor: this.oForm.metode_cor, status: 'scheduled', sales_id: this.currentUser.id, created_at: new Date().toISOString(),
        };
        const { error } = await supabaseClient.from('orders').insert(payload);
        if (error) throw error;
        this.toast = 'Order berhasil disimpan'; this.toastType = 'success'; this.oForm = {};
        await this.refreshData(); this.nav('jadwal');
      } catch (e) { this.toast = 'Gagal simpan order: ' + (e.message || e); this.toastType = 'error'; }
    },
    openOrderDetail(o) { this.orderDetailModal = { show: true, data: o }; },
    get orderDetailDeliveries() { return this.orderDetailModal.data ? this.deliveries.filter(d => Number(d.order_id) === Number(this.orderDetailModal.data.id)) : []; },
    openEditOrder(o) { this.oForm = { ...o }; this.nav('inputOrder'); },
    openEditOrderFromDetail() { const o = this.orderDetailModal.data; this.orderDetailModal.show = false; this.openEditOrder(o); },
    async cancelOrderFromSearch(o) {
      const reason = prompt('Alasan cancel order:'); if (!reason) return;
      try {
        const { error } = await supabaseClient.from('orders').update({ status: 'cancelled', cancel_reason: reason }).eq('id', o.id);
        if (error) throw error;
        this.toast = 'Order dibatalkan'; this.toastType = 'success'; await this.refreshData();
      } catch (e) { this.toast = 'Gagal cancel: ' + (e.message || e); this.toastType = 'error'; }
    },

    // ═══════════════════════════════════════════════════════════
    // JADWAL & DELIVERY
    // ═══════════════════════════════════════════════════════════
    get jadwalPlantOptions() { return this.plants; },
    get groupedOrders() {
      const filtered = this.orders.filter(o => {
        if (this.jFilter.plants.length && !this.jFilter.plants.map(Number).includes(Number(o.plant_id))) return false;
        if (this.jFilter.status && o.status !== this.jFilter.status) return false;
        if (this.jFilter.date && o.delivery_date !== this.jFilter.date) return false;
        return true;
      });
      const groups = {};
      filtered.forEach(o => {
        const p = this.plants.find(x => Number(x.id) === Number(o.plant_id));
        const key = p ? p.name : 'Tanpa Plant';
        if (!groups[key]) groups[key] = { plant: key, orders: [] };
        groups[key].orders.push({ ...o, deliveries: this.deliveries.filter(d => Number(d.order_id) === Number(o.id)) });
      });
      return Object.values(groups);
    },
    openDelivery(o) {
      const now = new Date();
      this.edvForm = { order_id: o.id, status: 'delivered', sj_no: '', delivery_date: now.toISOString().slice(0, 10), truck_no: '', qty: 0, driver_name: '', remarks: '', _mode: 'create' };
      this.editDvModal = { show: true, order_no: o.order_no, delivery_date: this.edvForm.delivery_date };
    },
    openEditDelivery(d) { this.edvForm = { ...d, _mode: 'edit' }; const o = this.orderById(d.order_id); this.editDvModal = { show: true, order_no: o?.order_no || '-', delivery_date: d.delivery_date }; },
    async saveEditDelivery() {
      try {
        const mode = this.edvForm._mode || 'edit';
        if (mode === 'create') {
          const { error } = await supabaseClient.from('deliveries').insert({ order_id: this.edvForm.order_id, status: this.edvForm.status || 'delivered', sj_no: this.edvForm.sj_no, delivery_date: this.edvForm.delivery_date, truck_no: this.edvForm.truck_no, qty: this.edvForm.qty, driver_name: this.edvForm.driver_name, remarks: this.edvForm.remarks, created_at: new Date().toISOString() });
          if (error) throw error;
        } else {
          const { error } = await supabaseClient.from('deliveries').update({ status: this.edvForm.status, sj_no: this.edvForm.sj_no, truck_no: this.edvForm.truck_no, qty: this.edvForm.qty, driver_name: this.edvForm.driver_name, remarks: this.edvForm.remarks }).eq('id', this.edvForm.id);
          if (error) throw error;
        }
        await this._recomputeOrder(this.edvForm.order_id);
        this.toast = 'Pengiriman tersimpan'; this.toastType = 'success'; this.editDvModal.show = false; await this.refreshData();
      } catch (e) { this.toast = 'Gagal simpan pengiriman: ' + (e.message || e); this.toastType = 'error'; }
    },
    async _recomputeOrder(orderId) {
      const { data: fresh } = await supabaseClient.from('deliveries').select('*').eq('order_id', orderId);
      const total = (fresh || []).filter(d => (d.status || 'delivered') === 'delivered').reduce((a, d) => a + (Number(d.qty) || 0), 0);
      const order = this.orderById(orderId); if (!order) return;
      const qtyOrder = Number(order.qty_order) || 0; const remain = Math.max(0, qtyOrder - total);
      const status = total <= 0 ? 'scheduled' : (remain <= 0 ? 'completed' : 'partial');
      await supabaseClient.from('orders').update({ qty_delivery: total, qty_remain: remain, status }).eq('id', orderId);
    },

    // ═══════════════════════════════════════════════════════════
    // AFTER DELIVERY
    // ═══════════════════════════════════════════════════════════
    get filteredDeliveries() {
      const q = (this.adFilter.q || '').toLowerCase();
      return this.deliveries.filter(d => {
        const o = this.orderById(d.order_id);
        if (q) { const hay = [d.sj_no, o?.order_no, o?.site_no, o?.project_name].join(' ').toLowerCase(); if (!hay.includes(q)) return false; }
        if (this.adFilter.plant_id && String(o?.plant_id) !== String(this.adFilter.plant_id)) return false;
        if (this.adFilter.status && (d.status || 'delivered') !== this.adFilter.status) return false;
        if (this.adFilter.date_from && d.delivery_date < this.adFilter.date_from) return false;
        if (this.adFilter.date_to && d.delivery_date > this.adFilter.date_to) return false;
        return true;
      });
    },
    downloadAfterDeliveryExcel() {
      const rows = this.filteredDeliveries; if (!rows.length) { alert('Tidak ada data'); return; }
      const header = ['Tgl Kirim','No SJ','Status','Order No','Site No','Project','Sales','Mutu','Plant','Truck No','Qty','Driver','Remarks'];
      const lines = [header.join('\t')];
      rows.forEach(d => {
        const o = this.orderById(d.order_id) || {};
        lines.push([d.delivery_date, d.sj_no || '', d.status || 'delivered', o.order_no || '', o.site_no || '', o.project_name || '', this.salesName(o.sales_id), this.mutuCode(o.mutu_id), this.plantName(o.plant_id), d.truck_no || '', d.qty || 0, d.driver_name || '', d.remarks || ''].map(x => String(x).replace(/\t/g, ' ')).join('\t'));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `after-delivery-${todayISO()}.tsv`; a.click();
    },

    // ═══════════════════════════════════════════════════════════
    // APPROVAL SITE NO
    // ═══════════════════════════════════════════════════════════
    get filteredProposals() {
      const q = (this.psFilter.q || '').toLowerCase();
      return this.prospek.filter(p => {
        if (this.psFilter.status && (p.site_no_status || 'waiting') !== this.psFilter.status) return false;
        if (q && !((p.project_name || '').toLowerCase().includes(q) || (p.site_no || '').toLowerCase().includes(q))) return false;
        return true;
      });
    },
    openPropose(p) {
      this.editPropModal = { show: true, ...p };
      this.editPropForm = { site_no: p.site_no || '', po_no: p.po_no || '', qty_po: p.qty_po || 0, mutu: (p.mutu || []).map(Number), plant_ids: (p.plant_ids || []).map(Number) };
    },
    openEditPropose(p) { this.openPropose(p); },
    get editPropVisitMutuLabel() { const p = this.editPropModal; return p.visit_mutu_code ? `${p.visit_mutu_code} — ${p.visit_mutu_name || ''}`.trim() : '-'; },
    async saveEditPropose() {
      try {
        // ✅ FIX: prospects
        const { error } = await supabaseClient.from('prospects').update({ site_no: this.editPropForm.site_no, po_no: this.editPropForm.po_no, qty_po: this.editPropForm.qty_po, mutu: this.editPropForm.mutu, plant_ids: this.editPropForm.plant_ids, site_no_status: 'complete', site_no_completed_at: new Date().toISOString() }).eq('id', this.editPropModal.id);
        if (error) throw error;
        this.toast = 'Approval site no tersimpan'; this.toastType = 'success'; this.editPropModal.show = false; await this.refreshData();
      } catch (e) { this.toast = 'Gagal simpan: ' + (e.message || e); this.toastType = 'error'; }
    },
    async toggleHoldSite(p) {
      try {
        const held = p.site_no_status === 'held';
        const reason = held ? null : (prompt('Alasan hold site:') || 'Di-hold owner');
        // ✅ FIX: prospects
        const { error } = await supabaseClient.from('prospects').update({ site_no_status: held ? 'complete' : 'held', hold_reason: reason }).eq('id', p.id);
        if (error) throw error;
        this.toast = held ? 'Site di-release' : 'Site di-hold'; this.toastType = 'success'; await this.refreshData();
      } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; }
    },

    // ═══════════════════════════════════════════════════════════
    // MARKETING
    // ═══════════════════════════════════════════════════════════
    onMktSearchInput() {
      const q = (this.mktFilter.siteSearch || '').toLowerCase();
      if (!q) { this.mktSuggestions = []; this.mktSuggestOpen = false; this.mktSelectedSite = null; return; }
      this.mktSuggestions = this.completeSites.filter(s => (s.site_no || '').toLowerCase().includes(q) || (s.project_name || '').toLowerCase().includes(q)).slice(0, 8);
      this.mktSuggestOpen = this.mktSuggestions.length > 0; this.mktSelectedSite = null;
    },
    onMktSearchEnter() { if (this.mktSuggestions.length) this.selectMktSite(this.mktSuggestions[0]); },
    selectMktSite(s) { this.mktSelectedSite = s; this.mktSuggestOpen = false; this.mktFilter.siteSearch = s.site_no; },
    resetMktSearch() { this.mktFilter.siteSearch = ''; this.mktSuggestions = []; this.mktSuggestOpen = false; this.mktSelectedSite = null; },
    get mktOrders() { return this.mktSelectedSite ? this.orders.filter(o => o.site_no === this.mktSelectedSite.site_no) : []; },
    get mktDeliveries() { if (!this.mktSelectedSite) return []; const orderIds = this.mktOrders.map(o => o.id); return this.deliveries.filter(d => orderIds.map(Number).includes(Number(d.order_id))); },
    get mktStats() {
      const s = this.mktSelectedSite; if (!s) return { hasLimit: false, qty_po: 0, totalOrdered: 0, totalDelivered: 0, remainPO: 0 };
      const qtyPo = Number(s.qty_po) || 0; const hasLimit = qtyPo > 0;
      const ords = this.mktOrders.filter(o => o.status !== 'cancelled');
      const totalOrdered = ords.reduce((a, o) => a + (Number(o.qty_order) || 0), 0);
      const totalDelivered = this.mktDeliveries.filter(d => (d.status || 'delivered') === 'delivered').reduce((a, d) => a + (Number(d.qty) || 0), 0);
      return { hasLimit, qty_po: qtyPo, totalOrdered, totalDelivered, remainPO: hasLimit ? qtyPo - totalOrdered : 0 };
    },

    // ═══════════════════════════════════════════════════════════
    // KELOLA USER (EDIT USER FIX)
    // ═══════════════════════════════════════════════════════════
    async addUser() {
      try {
        const payload = { username: this.uForm.username, name: this.uForm.name, email: this.uForm.email || '', password: this.uForm.password, role: this.uForm.role, plant_id: this.uForm.plant_id || null, assigned_sites: this.uForm.role === 'customer' ? (this.uForm.assigned_sites || []) : [], permissions: this.defaultPermsFor(this.uForm.role), is_active: true, created_at: new Date().toISOString() };
        const { error } = await supabaseClient.from('users').insert(payload);
        if (error) throw error;
        this.toast = 'User berhasil ditambahkan'; this.toastType = 'success'; this.uForm = { assigned_sites: [] }; await this.refreshData();
      } catch (e) { this.toast = 'Gagal tambah user: ' + (e.message || e); this.toastType = 'error'; }
    },
    
    openEditUser(u) {
      this.euForm = { ...u }; 
      this.editUserModal = { show: true };
    },
    
    async saveEditUser() {
      try {
        const payload = { username: this.euForm.username, name: this.euForm.name, email: this.euForm.email || '', role: this.euForm.role };
        if (this.euForm.password) payload.password = this.euForm.password;

        const { error } = await supabaseClient.from('users').update(payload).eq('id', this.euForm.id);
        if (error) throw error;
        
        this.toast = 'User berhasil diperbarui'; this.toastType = 'success';
        this.editUserModal.show = false; await this.refreshData();
        
        if (this.euForm.id === this.currentUser.id) this.currentUser = { ...this.currentUser, ...payload };
      } catch (e) { this.toast = 'Gagal update user: ' + (e.message || e); this.toastType = 'error'; }
    },

    togglePwVisible(id) { this.pwVisible = { ...this.pwVisible, [id]: !this.pwVisible[id] }; },
    async toggleUserActive(id) {
      try {
        const u = this.users.find(x => x.id === id); if (!u) return;
        const { error } = await supabaseClient.from('users').update({ is_active: u.is_active === false }).eq('id', id);
        if (error) throw error; await this.refreshData();
      } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; }
    },
    async delUser(id) {
      if (!confirm('Hapus user ini?')) return;
      try {
        const { error } = await supabaseClient.from('users').delete().eq('id', id);
        if (error) throw error; await this.refreshData();
      } catch (e) { this.toast = 'Gagal hapus: ' + (e.message || e); this.toastType = 'error'; }
    },

    // ═══════════════════════════════════════════════════════════
    // MASTER DATA
    // ═══════════════════════════════════════════════════════════
    async addPlant() { try { const { error } = await supabaseClient.from('plants').insert(this.plForm); if (error) throw error; this.plForm = {}; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    openEditPlant(p) { this.epForm = { ...p }; this.editPlantModal = { show: true }; },
    async saveEditPlant() { try { const { error } = await supabaseClient.from('plants').update(this.epForm).eq('id', this.epForm.id); if (error) throw error; this.editPlantModal.show = false; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    
    async addMutu() { try { const { error } = await supabaseClient.from('mutu').insert(this.mForm); if (error) throw error; this.mForm = {}; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    openEditMutu(m) { this.emForm = { ...m }; this.editMutuModal = { show: true }; },
    async saveEditMutu() { try { const { error } = await supabaseClient.from('mutu').update(this.emForm).eq('id', this.emForm.id); if (error) throw error; this.editMutuModal.show = false; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    
    async addCompetitor() { try { const { error } = await supabaseClient.from('competitors').insert(this.cForm); if (error) throw error; this.cForm = {}; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    openEditCompetitor(c) { this.ecForm = { ...c }; this.editKompetitorModal = { show: true }; },
    async saveEditCompetitor() { try { const { error } = await supabaseClient.from('competitors').update(this.ecForm).eq('id', this.ecForm.id); if (error) throw error; this.editKompetitorModal.show = false; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    
    async addAddress() { try { const { error } = await supabaseClient.from('addresses').insert(this.aForm); if (error) throw error; this.aForm = {}; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    openEditAddress(a) { this.eaForm = { ...a }; this.editAlamatModal = { show: true }; },
    async saveEditAddress() { try { const { error } = await supabaseClient.from('addresses').update(this.eaForm).eq('id', this.eaForm.id); if (error) throw error; this.editAlamatModal.show = false; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    
    async delItem(table, id) {
      if (!confirm('Hapus data ini?')) return;
      try { const { error } = await supabaseClient.from(table).delete().eq('id', id); if (error) throw error; await this.refreshData(); } catch (e) { this.toast = 'Gagal hapus: ' + (e.message || e); this.toastType = 'error'; }
    },

    // ═══════════════════════════════════════════════════════════
    // LOG AKTIVITAS
    // ═══════════════════════════════════════════════════════════
    get filteredLogs() {
      const q = (this.logFilter.q || '').toLowerCase();
      return this.logs.filter(l => {
        if (this.logFilter.status && l.status !== this.logFilter.status) return false;
        if (q && !((l.username || '').toLowerCase().includes(q) || (l.name || '').toLowerCase().includes(q))) return false;
        return true;
      });
    },

    // ═══════════════════════════════════════════════════════════
    // PROFIL
    // ═══════════════════════════════════════════════════════════
    async uploadAvatar(ev) {
      try {
        const file = ev.target.files?.[0]; if (!file) return;
        if (file.size > 500 * 1024) { this.toast = 'Ukuran foto maksimal 500 KB'; this.toastType = 'error'; return; }
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          await supabaseClient.from('users').update({ avatar: dataUrl }).eq('id', this.currentUser.id);
          this.currentUser.avatar = dataUrl; await this.refreshData();
        };
        reader.readAsDataURL(file);
      } catch (e) { this.toast = 'Gagal upload: ' + (e.message || e); this.toastType = 'error'; }
    },
    async removeAvatar() { try { await supabaseClient.from('users').update({ avatar: null }).eq('id', this.currentUser.id); this.currentUser.avatar = null; await this.refreshData(); } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; } },
    async changeMyPassword() {
      try {
        if (this.profileForm.new_password !== this.profileForm.confirm_password) { this.toast = 'Konfirmasi password tidak cocok'; this.toastType = 'error'; return; }
        if (this.profileForm.old_password !== this.currentUser.password) { this.toast = 'Password lama salah'; this.toastType = 'error'; return; }
        const { error } = await supabaseClient.from('users').update({ password: this.profileForm.new_password }).eq('id', this.currentUser.id);
        if (error) throw error;
        this.toast = 'Password berhasil diubah'; this.toastType = 'success'; this.profileForm = { old_password: '', new_password: '', confirm_password: '' };
      } catch (e) { this.toast = 'Gagal: ' + (e.message || e); this.toastType = 'error'; }
    },

    // ═══════════════════════════════════════════════════════════
    // ONE-CLICK ORDER (customer)
    // ═══════════════════════════════════════════════════════════
    openNewCustomerOrder() { this.ocModal = { show: true, mode: 'new' }; },
    openOneClickOrder(o) { this.ocModal = { show: true, mode: 'repeat', order: o }; },
  };
}

window.app = app;
