/* =====================================================
   ALPINE.JS APP — Main application logic
   -----------------------------------------------------
   Semua state, computed, dan method Alpine.js ada di sini.
   Dependencies (sudah di-include sebelum file ini):
   - js/config.js        → supabaseClient
   - js/constants.js     → DEVELOPER_DEFAULT_ACCOUNT, DEFAULT_PERMISSIONS, dll
   - js/db.js            → DB
   - js/auth.js          → trySupabaseAuth, signOutSupabaseAuth
   - js/activity-log.js → appendActivityLogAsync, pruneActivityLogsAsync
   - js/utils.js         → todayISO
   ===================================================== */

function app() {
  return {
    /* ─────────── STATE ─────────── */
    fatalError: '',
    isLoading: false,
    sidebarOpen: true,
    page: 'dashboard',
    toast: '', toastType: 'success',
    loginError: '',
    loginForm: { username: '', password: '' },
    showLoginPw: false, showUserPw: false, showOldPw: false,
    showNewPw: false, showConfirmPw: false, showEditUserPw: false,
    pwVisible: {},
    currentUser: null,
    users: [], plants: [], mutuList: [], competitors: [], addresses: [],
    prospects: [], orders: [], deliveries: [], visits: [], propose: [], notifications: [],
    loginLogs: [],
    logFilter: { q: '', status: '' },
    profileForm: { old_password: '', new_password: '', confirm_password: '' },

    dashFilter: { preset: 'month', start: '', end: '' },
    /* Theme: 'red' (Alvend default) | 'blue' (tech-blue dashboard) */
    theme: (typeof localStorage !== 'undefined' && localStorage.getItem('alvend_theme')) || 'red',

    /* Prospek */
    pForm: { project_name: '', address: '', pic_name: '', pic_contact: '', construction_type: '', competitor_id: '', competitor_other: '' },
    editProspekModal: { show: false, id: null, prospect_no: '' },
    epForm: { project_name: '', address: '', pic_name: '', pic_contact: '', construction_type: '', competitor_id: '', competitor_other: '' },
    pFilter: { q: '', visit: '', status: '', source: '' },

    /* Order */
    oForm: { site_no: '', project_name: '', address: '', po_no: '', pic_name: '', pic_contact: '', mutu_id: '', plant_id: '', delivery_date: '', pouring_time: '', qty_order: 0, metode_cor: '', mutu_list: [], plant_list: [] },
    jFilter: { plants: [], status: '', date: '' },
    sFilter: { q: '', plant_id: '', mutu_id: '', status: '' },

    /* Marketing */
    mktFilter: { site_no: '', siteSearch: '', q: '' },
    mktSuggestOpen: false,

    /* After Delivery */
    adFilter: { q: '', plant_id: '', date_from: '', date_to: '', status: '' },

    /* Approval Site No */
    psFilter: { q: '', status: '' },

    /* Modal: Visit */
    visitModal: { show: false, id: null, project_name: '', current_status: 'not_yet' },
    vForm: { estimasi_tgl_cor: '', jam_loading: '', mutu_id: '', estimasi_volume: 0, plant_id: '', metode_cor: '', win: false, lost: false },

    /* Modal: Delivery */
    dvModal: { show: false, order_id: null, site_no: '', remain: 0, order_no: '', order_delivery_date: '' },
    dvForm: { sj_no: '', delivery_date: '', truck_no: '', qty: 0, driver_name: '' },

    /* Modal: Edit Delivery */
    editDvModal: { show: false, deliveryId: null, order_no: '', delivery_date: '' },
    edvForm: { status: 'delivered', remarks: '', sj_no: '', truck_no: '', qty: 0, driver_name: '' },

    /* Modal: Edit Order */
    editOrderModal: { show: false, data: {} },
    eoForm: { mutu_id: '', plant_id: '', delivery_date: '', pouring_time: '', qty_order: 0, metode_cor: '', status: '' },
    orderDetailModal: { show: false, data: null },

    /* Modal: Propose */
    propModal: { show: false, data: {} },
    propForm: { site_no: '', po_no: '', qty_po: 0, mutu: [], plant_ids: [] },

    /* Modal: Edit Propose */
    editPropModal: { show: false, prospectId: null, project_name: '', address: '' },
    editPropForm: { site_no: '', po_no: '', qty_po: 0, mutu: [], plant_ids: [] },

    /* Modal: Access */
    accessModal: { show: false, userId: null, userName: '' },
    accessForm: { permissions: [] },

    menuGroups: [
      { group: 'Dashboard', items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' }
      ]},
      { group: 'Prospek', items: [
        { key: 'inputProspek', label: 'Input Prospek', icon: 'fa-solid fa-plus-circle' },
        { key: 'dataProspek', label: 'Data Prospek', icon: 'fa-solid fa-list' }
      ]},
      { group: 'Order', items: [
        { key: 'inputOrder', label: 'Input Order', icon: 'fa-solid fa-cart-plus' },
        { key: 'orderSearch', label: 'Order Search', icon: 'fa-solid fa-magnifying-glass' },
        { key: 'marketing', label: 'Marketing', icon: 'fa-solid fa-chart-line' }
      ]},
      { group: 'Pengiriman', items: [
        { key: 'jadwal', label: 'Jadwal Pengecoran', icon: 'fa-solid fa-calendar-days' },
        { key: 'afterDelivery', label: 'After Delivery', icon: 'fa-solid fa-truck-fast' }
      ]},
      { group: 'Owner', items: [
        { key: 'proposeSiteNo', label: 'Approval Site No', icon: 'fa-solid fa-file-signature' },
        { key: 'kelolaUser', label: 'Kelola User', icon: 'fa-solid fa-users' },
        { key: 'kelolaHakAkses', label: 'Kelola Hak Akses', icon: 'fa-solid fa-key' },
        { key: 'kelolaPlant', label: 'Kelola Plant', icon: 'fa-solid fa-industry' },
        { key: 'kelolaMutu', label: 'Kelola Mutu', icon: 'fa-solid fa-flask' },
        { key: 'kelolaKompetitor', label: 'Kelola Kompetitor', icon: 'fa-solid fa-flag' },
        { key: 'kelolaAlamat', label: 'Kelola Alamat', icon: 'fa-solid fa-map-location-dot' },
        { key: 'logAktivitas', label: 'Log Aktivitas', icon: 'fa-solid fa-clock-rotate-left' }
      ]}
    ],
    get allMenus() {
      return this.menuGroups.flatMap(g => g.items);
    },

    /* Modal: One-click Order */
    ocModal: { show: false, data: null, mode: 'new' },
    ocForm: { site_no: '', delivery_date: '', pouring_time: '', qty_order: 0, metode_cor: '', note: '' },
    reqModal: { show: false, data: null },

    /* Form: User */
    uForm: { username: '', name: '', email: '', password: '', role: '', plant_id: '', assigned_sites: [] },
    editUserModal: { show: false, userId: null },
    euForm: { username: '', name: '', email: '', password: '', role: '', plant_id: '', assigned_sites: [], is_active: true, avatar: null },

    /* Form: Master data */
    plForm: { code: '', name: '', address: '', phone: '' },
    mForm: { code: '', name: '', slump: '', price: 0 },
    cForm: { name: '', address: '', contact_person: '', phone: '' },
    aForm: { label: '', address: '', city: '', province: '', type: 'site' },

    /* Modal: Edit Master */
    editPlantModal: { show: false, id: null }, epForm: { code: '', name: '', address: '', phone: '' },
    editMutuModal: { show: false, id: null }, emForm: { code: '', name: '', slump: '', price: 0 },
    editKompetitorModal: { show: false, id: null }, ecForm: { name: '', address: '', contact_person: '', phone: '' },
    editAlamatModal: { show: false, id: null }, eaForm: { label: '', address: '', city: '', province: '', type: 'site' },

    /* ─────────── INIT ─────────── */
    async init() {
      this.ensureDeveloperAccount();
      this.applyTheme();
      try {
        await this.reload();
      } catch (e) {
        this.fatalError = 'Gagal terhubung ke Supabase: ' + (e?.message || e);
        return;
      }
      this.normalizeData();
      const saved = localStorage.getItem('beton_current');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const devAccount = this.getDeveloperAccount();
          let found = null;
          // ─── Restore session developer ───
          if (parsed.role === 'developer') {
            const savedUsername = String(parsed.username || '').toLowerCase();
            const savedEmail    = String(parsed.email || '').toLowerCase();
            const isDev = savedUsername === String(devAccount.username).toLowerCase()
                       || savedEmail === String(devAccount.email || '').toLowerCase()
                       || savedUsername === 'developer';
            if (isDev) {
              found = devAccount;
              localStorage.setItem('beton_current', JSON.stringify(devAccount));
            }
          } else {
            found = this.users.find(u => u.username && String(u.username).toLowerCase() === String(parsed.username).toLowerCase());
          }
          if (found) {
            this.currentUser = found;
            if (found.role === 'customer') this.page = 'jadwal';
            const requestedPage = (location.hash.match(/(?:^#|&)page=([^&]+)/) || [])[1];
            if (requestedPage) {
              const targetPage = decodeURIComponent(requestedPage);
              if (found.role === 'owner' || found.role === 'developer' || this.hasAccess(targetPage)) this.page = targetPage;
            }
          } else localStorage.removeItem('beton_current');
        } catch (e) { localStorage.removeItem('beton_current'); }
      }
      this.adFilter.date_from = todayISO();
      this.adFilter.date_to = todayISO();
      this.jFilter.date = todayISO();
      this.applyDashPreset('month');

      // ─── Start Realtime subscription jika user sudah login ───
      if (this.currentUser && typeof window.Realtime !== 'undefined') {
        window.Realtime.start(() => this.reload());
      }
    },

    /* ─────────── DASHBOARD FILTER ─────────── */
    applyDashPreset(preset) {
      this.dashFilter.preset = preset;
      const today = todayISO();
      if (preset === 'today') {
        this.dashFilter.start = today;
        this.dashFilter.end = today;
      } else if (preset === 'week') {
        const d = new Date(); d.setDate(d.getDate() - 6);
        this.dashFilter.start = d.toISOString().slice(0, 10);
        this.dashFilter.end = today;
      } else if (preset === 'month') {
        const d = new Date(); d.setDate(d.getDate() - 29);
        this.dashFilter.start = d.toISOString().slice(0, 10);
        this.dashFilter.end = today;
      }
    },
    onDashDateChange() { this.dashFilter.preset = 'custom'; },

    /* ─────────── THEME TOGGLE ─────────── */
    toggleTheme() {
      this.theme = (this.theme === 'blue') ? 'red' : 'blue';
      try { localStorage.setItem('alvend_theme', this.theme); } catch (_) {}
      this.applyTheme();
    },
    applyTheme() {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', this.theme);
      }
    },

    inDashRange(dateStr) {
      if (!dateStr) return false;
      const d = String(dateStr).slice(0, 10);
      const s = this.dashFilter.start || '';
      const e = this.dashFilter.end || '';
      if (s && d < s) return false;
      if (e && d > e) return false;
      return true;
    },

    get dashOrderList() {
      const u = this.currentUser;
      let list = this.orders.filter(o => this.inDashRange(o.delivery_date) && o.status !== 'cancelled');
      if (u?.role === 'sales') list = list.filter(o => Number(o.sales_id) === Number(u.id));
      return list;
    },

    get dashStats() {
      const u = this.currentUser;
      const orders = this.dashOrderList;
      const orderIds = orders.map(o => Number(o.id));
      const delivs = this.deliveries.filter(d =>
        (d.status || 'delivered') === 'delivered' && orderIds.includes(Number(d.order_id))
      );
      const prospeks = this.prospects.filter(p => {
        if (!this.inDashRange(p.created_at)) return false;
        if (u?.role === 'sales' && Number(p.sales_id) !== Number(u.id)) return false;
        return true;
      });
      return {
        totalProspek: prospeks.length,
        repeatOrder: prospeks.filter(p => p.source === 'customer_repeat').length,
        complete: prospeks.filter(p => p.site_no_status === 'complete').length,
        totalOrder: orders.length,
        qtyOrder: orders.reduce((s, o) => s + (+o.qty_order || 0), 0),
        qtyDelivered: delivs.reduce((s, d) => s + (+d.qty || 0), 0),
      };
    },

    get dashDeliveryRate() {
      const s = this.dashStats;
      if (!s.qtyOrder) return 0;
      return Math.min(100, (s.qtyDelivered / s.qtyOrder) * 100);
    },

    get dashRepeatOrderRate() {
      const orders = this.dashOrderList;
      if (!orders.length) return 0;
      let repeat = 0;
      orders.forEach(o => {
        const p = this.prospects.find(pr => Number(pr.id) === Number(o.prospect_id));
        if (p && p.source === 'customer_repeat') repeat++;
      });
      return (repeat / orders.length) * 100;
    },

    get dashConversionRate() {
      const s = this.dashStats;
      if (!s.totalProspek) return 0;
      return Math.min(100, (s.totalOrder / s.totalProspek) * 100);
    },

    get dashTrendDaily() {
      const s = this.dashFilter.start;
      const e = this.dashFilter.end;
      if (!s || !e) return [];
      const start = new Date(s + 'T00:00:00');
      const end = new Date(e + 'T00:00:00');
      const days = [];
      const cur = new Date(start);
      let safety = 0;
      while (cur <= end && safety < 90) {
        const dStr = cur.toISOString().slice(0, 10);
        days.push({ date: dStr, label: dStr.slice(5), orderQty: 0, delivQty: 0 });
        cur.setDate(cur.getDate() + 1);
        safety++;
      }
      const u = this.currentUser;
      const orders = this.orders.filter(o => o.status !== 'cancelled');
      const delivs = this.deliveries.filter(d => (d.status || 'delivered') === 'delivered');
      const myOrderIds = (u?.role === 'sales')
        ? orders.filter(o => Number(o.sales_id) === Number(u.id)).map(o => Number(o.id))
        : null;
      orders.forEach(o => {
        if (myOrderIds && !myOrderIds.includes(Number(o.id))) return;
        const rec = days.find(x => x.date === o.delivery_date);
        if (rec) rec.orderQty += +o.qty_order || 0;
      });
      delivs.forEach(d => {
        if (myOrderIds && !myOrderIds.includes(Number(d.order_id))) return;
        const rec = days.find(x => x.date === d.delivery_date);
        if (rec) rec.delivQty += +d.qty || 0;
      });
      return days;
    },

    get dashTrendMax() {
      return Math.max(1, ...this.dashTrendDaily.flatMap(d => [d.orderQty, d.delivQty]));
    },

    /* SVG line path untuk trend chart (viewBox 0 0 100 100, y inverted). */
    dashTrendLinePath(field) {
      const data = this.dashTrendDaily;
      if (!data.length) return '';
      const max = this.dashTrendMax || 1;
      const stepX = data.length > 1 ? 100 / (data.length - 1) : 0;
      return data.map((d, i) => {
        const x = i * stepX;
        const v = Number(d[field]) || 0;
        const y = 100 - (v / max) * 100;
        return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
      }).join(' ');
    },
    get dashTrendOrderPath() { return this.dashTrendLinePath('orderQty'); },
    get dashTrendDelivPath() { return this.dashTrendLinePath('delivQty'); },

    /* Helper format delta percentage (signed). */
    fmtDelta(pct) {
      if (pct === undefined || pct === null || isNaN(pct)) return '';
      const sign = pct > 0 ? '+' : '';
      return sign + pct.toFixed(1) + '%';
    },

    get dashWeeklyData() {
      const days = this.dashTrendDaily;
      if (!days.length) return [];
      const weeks = [];
      let chunk = null;
      days.forEach((d, i) => {
        if (i % 7 === 0) {
          chunk = { label: 'W' + (weeks.length + 1), startDate: d.date, prospek: 0, order: 0 };
          weeks.push(chunk);
        }
        chunk.order += d.orderQty;
      });
      const u = this.currentUser;
      this.prospects.forEach(p => {
        if (u?.role === 'sales' && Number(p.sales_id) !== Number(u.id)) return;
        if (!p.created_at) return;
        const pDate = p.created_at.slice(0, 10);
        for (let i = 0; i < weeks.length; i++) {
          const startD = weeks[i].startDate;
          const nextStart = weeks[i + 1]?.startDate;
          if (pDate >= startD && (!nextStart || pDate < nextStart)) {
            weeks[i].prospek++;
            break;
          }
        }
      });
      return weeks;
    },

    get dashWeeklyMaxProspek() { return Math.max(1, ...this.dashWeeklyData.map(w => w.prospek)); },
    get dashWeeklyMaxOrder()   { return Math.max(1, ...this.dashWeeklyData.map(w => w.order)); },

    get dashStatusBreakdown() {
      const u = this.currentUser;
      let allOrders = this.orders.filter(o => this.inDashRange(o.delivery_date));
      if (u?.role === 'sales') allOrders = allOrders.filter(o => Number(o.sales_id) === Number(u.id));
      let open = 0, partial = 0, completed = 0, cancelled = 0;
      allOrders.forEach(o => {
        if (o.status === 'cancelled') cancelled++;
        else if (o.status === 'completed') completed++;
        else if (o.status === 'partial') partial++;
        else open++;
      });
      return { open, partial, completed, cancelled, total: allOrders.length };
    },

    get dashDonutStyle() {
      const s = this.dashStatusBreakdown;
      const t = s.total;
      if (!t) return { background: '#e2e8f0' };
      const o = (s.open / t) * 100;
      const p = (s.partial / t) * 100;
      const c = (s.completed / t) * 100;
      const x = (s.cancelled / t) * 100;
      let acc = 0;
      const stops = [];
      if (o > 0) { stops.push(`#3b82f6 ${acc}% ${acc + o}%`); acc += o; }
      if (p > 0) { stops.push(`#f59e0b ${acc}% ${acc + p}%`); acc += p; }
      if (c > 0) { stops.push(`#10b981 ${acc}% ${acc + c}%`); acc += c; }
      if (x > 0) { stops.push(`#ef4444 ${acc}% ${acc + x}%`); acc += x; }
      return { background: stops.length ? `conic-gradient(${stops.join(', ')})` : '#e2e8f0' };
    },

    get dashRecentOrders() {
      return this.dashOrderList.slice().sort((a, b) => b.id - a.id).slice(0, 8);
    },

    get dashIncompleteSites() {
      const result = [];
      this.prospects
        .filter(p => p.site_no && ['complete', 'held'].includes(p.site_no_status || ''))
        .forEach(p => {
          const qty_po = Number(p.qty_po) || 0;
          if (qty_po <= 0) return;
          const orders = this.orders.filter(o => o.site_no === p.site_no && o.status !== 'cancelled');
          const ordered = orders.reduce((s, o) => s + (+o.qty_order || 0), 0);
          const remain = qty_po - ordered;
          if (remain > 0.01) result.push({ ...p, ordered, remain, qty_po });
        });
      return result.sort((a, b) => b.remain - a.remain).slice(0, 8);
    },

    /* ─────────── DASHBOARD: PERIODE SEBELUMNYA & DELTA ─────────── */
    get dashPrevRange() {
      const s = this.dashFilter.start;
      const e = this.dashFilter.end;
      if (!s || !e) return { start: '', end: '' };
      const startD = new Date(s + 'T00:00:00');
      const endD = new Date(e + 'T00:00:00');
      if (isNaN(startD) || isNaN(endD)) return { start: '', end: '' };
      const spanMs = endD - startD;
      const spanDays = Math.round(spanMs / 86400000) + 1;
      const prevEnd = new Date(startD); prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (spanDays - 1));
      return { start: prevStart.toISOString().slice(0, 10), end: prevEnd.toISOString().slice(0, 10) };
    },

    get dashPrevStats() {
      const r = this.dashPrevRange;
      if (!r.start || !r.end) return null;
      const u = this.currentUser;
      const inRange = (dateStr) => {
        if (!dateStr) return false;
        const d = String(dateStr).slice(0, 10);
        if (r.start && d < r.start) return false;
        if (r.end && d > r.end) return false;
        return true;
      };
      let orders = this.orders.filter(o => inRange(o.delivery_date) && o.status !== 'cancelled');
      if (u?.role === 'sales') orders = orders.filter(o => Number(o.sales_id) === Number(u.id));
      const orderIds = orders.map(o => Number(o.id));
      const delivs = this.deliveries.filter(d =>
        (d.status || 'delivered') === 'delivered' && orderIds.includes(Number(d.order_id))
      );
      let prospeks = this.prospects.filter(p => inRange(p.created_at));
      if (u?.role === 'sales') prospeks = prospeks.filter(p => Number(p.sales_id) === Number(u.id));
      const qtyOrder = orders.reduce((s, o) => s + (+o.qty_order || 0), 0);
      const qtyDelivered = delivs.reduce((s, d) => s + (+d.qty || 0), 0);
      return {
        totalProspek: prospeks.length,
        repeatOrder: prospeks.filter(p => p.source === 'customer_repeat').length,
        totalOrder: orders.length,
        qtyOrder,
        qtyDelivered,
        deliveryRate: qtyOrder ? Math.min(100, (qtyDelivered / qtyOrder) * 100) : 0,
      };
    },

    /* Delta % vs periode sebelumnya. Return { key: { val: <number>, pct: <signed number>, up: <bool> } } */
    get dashDelta() {
      const cur = this.dashStats;
      const prev = this.dashPrevStats;
      if (!prev) return {};
      const calc = (c, p) => {
        if (p === 0) {
          if (c === 0) return { val: c, pct: 0, up: false };
          return { val: c, pct: 100, up: c > 0 };
        }
        const pct = ((c - p) / p) * 100;
        return { val: c, pct, up: c >= p };
      };
      return {
        totalProspek: calc(cur.totalProspek, prev.totalProspek),
        repeatOrder: calc(cur.repeatOrder, prev.repeatOrder),
        totalOrder: calc(cur.totalOrder, prev.totalOrder),
        qtyOrder: calc(cur.qtyOrder, prev.qtyOrder),
        qtyDelivered: calc(cur.qtyDelivered, prev.qtyDelivered),
        deliveryRate: calc(this.dashDeliveryRate, prev.deliveryRate),
      };
    },

    /* ─────────── DASHBOARD: DISTRIBUSI WILAYAH ─────────── */
    /* Keyword matching dari field address prospects/orders. */
    get dashWilayahDistribution() {
      const WILAYAH_KEYWORDS = [
        'Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Klungkung', 'Bangli',
        'Karangasem', 'Buleleng', 'Jembrana', 'Negara',
        'Jakarta', 'Bekasi', 'Tangerang', 'Depok', 'Bogor',
        'Cibubur', 'Cikarang',
      ];
      const u = this.currentUser;
      const counts = {};
      WILAYAH_KEYWORDS.forEach(w => counts[w] = 0);
      let total = 0;
      let lainnya = 0;
      // Hitung dari prospects pada periode ini (yg sudah punya address).
      let prospeks = this.prospects.filter(p => this.inDashRange(p.created_at));
      if (u?.role === 'sales') prospeks = prospeks.filter(p => Number(p.sales_id) === Number(u.id));
      prospeks.forEach(p => {
        const addr = String(p.address || '').toLowerCase();
        if (!addr) return;
        let matched = false;
        for (const w of WILAYAH_KEYWORDS) {
          if (addr.includes(w.toLowerCase())) { counts[w]++; total++; matched = true; break; }
        }
        if (!matched) { lainnya++; total++; }
      });
      const items = WILAYAH_KEYWORDS
        .map(w => ({ name: w, count: counts[w], percent: total ? (counts[w] / total) * 100 : 0 }))
        .filter(it => it.count > 0)
        .sort((a, b) => b.count - a.count);
      if (lainnya > 0) {
        items.push({ name: 'Lainnya', count: lainnya, percent: total ? (lainnya / total) * 100 : 0 });
      }
      return { items, total };
    },

    get dashInsightMsg() {
      const d = this.dashDelta;
      if (!d.deliveryRate) return 'Pilih rentang tanggal yang lebih panjang untuk melihat perbandingan.';
      const pct = d.deliveryRate.pct;
      const abs = Math.abs(pct).toFixed(1);
      if (pct > 0.05) {
        return `Insight: Delivery rate naik ${abs}% dibanding periode sebelumnya.`;
      } else if (pct < -0.05) {
        return `Insight: Delivery rate turun ${abs}% dibanding periode sebelumnya — perlu evaluasi pengiriman.`;
      }
      return `Insight: Delivery rate stabil dibanding periode sebelumnya (±${abs}%).`;
    },

    /* ─────────── DEVELOPER ACCOUNT ─────────── */
    ensureDeveloperAccount() {
      // Cleanup legacy localStorage keys dari versi sebelumnya.
      // Defensive: pakai window.* || [] supaya tidak crash kalau
      // constants.js gagal load (mis. cache browser versi lama).
      const legacyKeys = (typeof window !== 'undefined'
                          && Array.isArray(window.DEVELOPER_ACCOUNT_LEGACY_KEYS))
                         ? window.DEVELOPER_ACCOUNT_LEGACY_KEYS
                         : [];
      legacyKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          try { localStorage.removeItem(key); } catch (_) {}
        }
      });
    },
    getDeveloperAccount() {
      // Selalu kembalikan kredensial terbaru dari kode JS (in-memory).
      // Defensive juga: kalau constants.js belum load, fallback ke object
      // minimal supaya aplikasi tidak crash total.
      if (typeof window !== 'undefined' && window.DEVELOPER_DEFAULT_ACCOUNT) {
        return { ...window.DEVELOPER_DEFAULT_ACCOUNT };
      }
      return {
        id: -999999,
        username: 'developer',
        name: 'Application Developer',
        email: 'bookingeast0@gmail.com',
        password: 'sultan3110',
        role: 'developer',
        is_active: true,
        permissions: ['*']
      };
    },
    isOwnerOrDeveloper() {
      return !!this.currentUser && ['owner', 'developer'].includes(this.currentUser.role);
    },

    /* ─────────── PERMISSIONS ─────────── */
    defaultPermsFor(role) {
      const perms = (typeof window !== 'undefined' && window.DEFAULT_PERMISSIONS)
                    ? window.DEFAULT_PERMISSIONS
                    : {};
      return perms[role] || [];
    },
    menuLabel(key) {
      const m = this.allMenus.find(x => x.key === key);
      return m ? m.label : key;
    },
    hasAccess(menuKey) {
      const u = this.currentUser;
      if (!u) return false;
      if (u.role === 'owner' || u.role === 'developer') return true;
      const perms = Array.isArray(u.permissions) && u.permissions.length > 0
                    ? u.permissions
                    : this.defaultPermsFor(u.role);
      return perms.includes(menuKey);
    },

    openAccessModal(u) {
      this.accessModal = { show: true, userId: u.id, userName: u.name };
      const current = Array.isArray(u.permissions) && u.permissions.length > 0
                      ? [...u.permissions]
                      : this.defaultPermsFor(u.role).slice();
      this.accessForm = { permissions: current };
    },
    toggleAllAccess() {
      if (this.accessForm.permissions.length === this.allMenus.length) {
        this.accessForm.permissions = [];
      } else {
        this.accessForm.permissions = this.allMenus.map(m => m.key);
      }
    },
    async saveAccess() {
      try {
        await DB.update('users', this.accessModal.userId, { permissions: [...this.accessForm.permissions] });
        await this.reload();
        if (Number(this.accessModal.userId) === Number(this.currentUser.id)) {
          const updated = this.users.find(u => Number(u.id) === Number(this.accessModal.userId));
          if (updated) {
            this.currentUser = updated;
            localStorage.setItem('beton_current', JSON.stringify(updated));
          }
        }
        this.accessModal.show = false;
        this.toastMsg('Hak akses untuk ' + this.accessModal.userName + ' disimpan');
      } catch (e) { this.toastMsg('Gagal simpan hak akses: ' + (e?.message || e), 'error'); }
    },

    async refreshData() {
      try {
        await this.reload();
        this.toastMsg('Data berhasil di-refresh');
      } catch (e) { this.toastMsg('Refresh gagal: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── RELOAD DATA ─────────── */
    async reload() {
      const [users, plants, mutuList, competitors, addresses, prospects, orders, deliveries, visits, propose, notifications] = await Promise.all([
        DB.all('users'),
        DB.all('plants'),
        DB.all('mutu'),
        DB.all('competitors'),
        DB.all('addresses'),
        DB.all('prospects'),
        DB.all('orders'),
        DB.all('deliveries'),
        DB.all('visits'),
        DB.all('propose'),
        DB.all('notifications')
      ]);
      this.users = users; this.plants = plants; this.mutuList = mutuList;
      this.competitors = competitors; this.addresses = addresses;
      this.prospects = prospects; this.orders = orders; this.deliveries = deliveries;
      this.visits = visits; this.propose = propose; this.notifications = notifications;
      // Hanya SELECT log aktivitas (tanpa delete) saat reload dari Realtime.
      // Delete log >24 jam hanya dilakukan saat login/pindah menu (pruneActivityLogsAsync).
      if (typeof window.getActivityLogsAsync === 'function') {
        this.loginLogs = await window.getActivityLogsAsync();
      } else {
        this.loginLogs = await pruneActivityLogsAsync();
      }
    },

    normalizeData() {
      // Normalize sudah di-handle di DB._normalize saat fetch dari Supabase.
      // Method ini dipertahankan untuk kompatibilitas tapi tidak melakukan apa-apa.
    },

    /* ─────────── UTILS ─────────── */
    fmt(n) { return (Number(n) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    nowStr() { return new Date().toLocaleString('id-ID'); },
    fmtDate(s) {
      if (!s) return '-';
      const d = new Date(s);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    },
    toastMsg(m, type = 'success') {
      this.toast = m; this.toastType = type;
      setTimeout(() => this.toast = '', 3000);
    },
    async nav(page) {
      const previousPage = this.page;
      this.page = page;
      this.toast = '';
      if (this.currentUser && page !== previousPage) {
        await appendActivityLogAsync(this.currentUser, 'Membuka menu: ' + (this.pageTitle || page));
        this.loginLogs = await pruneActivityLogsAsync();
      }
    },

    /* ─────────── LOOKUPS ─────────── */
    salesName(id)  { return this.users.find(u => Number(u.id) === Number(id))?.name || '-'; },
    userName(id)   { return this.users.find(u => Number(u.id) === Number(id))?.name || '-'; },
    userRole(id)   { return this.users.find(u => Number(u.id) === Number(id))?.role || '-'; },
    plantName(id)  { return this.plants.find(p => Number(p.id) === Number(id))?.name || '-'; },
    mutuCode(id)   { return this.mutuList.find(m => Number(m.id) === Number(id))?.code || '-'; },
    orderById(id)  { return this.orders.find(o => Number(o.id) === Number(id)); },
    hasDelivery(orderId) { return this.deliveries.some(d => Number(d.order_id) === Number(orderId)); },

    /* ─────────── AUDIT HELPERS ─────────── */
    fmtTimestamp(iso) {
      if (!iso) return '-';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (_) { return String(iso); }
    },
    auditInfo(row, action) {
      // action: 'created' | 'updated' | 'cancelled' | 'deleted'
      if (!row) return '';
      const map = {
        created:   { byKey: 'created_by',   atKey: 'created_at',   label: 'Dibuat' },
        updated:   { byKey: 'updated_by',   atKey: 'updated_at',   label: 'Diupdate' },
        cancelled: { byKey: 'cancelled_by', atKey: 'cancelled_at', label: 'Dibatalkan' },
        deleted:   { byKey: 'deleted_by',   atKey: 'deleted_at',   label: 'Dihapus' }
      };
      const cfg = map[action];
      if (!cfg) return '';
      const byId = row[cfg.byKey];
      const at   = row[cfg.atKey];
      if (!byId && !at) return '';
      const who = byId ? this.userName(byId) : 'sistem';
      return cfg.label + ' oleh ' + who + (at ? ' · ' + this.fmtTimestamp(at) : '');
    },

    /**
     * Update data utama + audit fields secara terpisah.
     * Data utama SELALU dikirim (jika gagal, throw error).
     * Audit fields (updated_by, updated_at) dikirim terpisah dalam
     * try/catch — kalau gagal (mis. kolom belum ada karena migration
     * belum dijalankan), diabaikan supaya data utama tetap tersimpan.
     */
    async safeAuditUpdate(table, id, mainPayload, auditPayload) {
      // 1) Update data utama DULU — kalau gagal, throw
      await DB.update(table, id, mainPayload);
      // 2) Best-effort: update audit fields terpisah
      if (auditPayload && typeof auditPayload === 'object') {
        try {
          await DB.update(table, id, auditPayload);
        } catch (e) {
          // Kolom audit mungkin belum ada — abaikan, data utama sudah tersimpan
          console.warn('[audit] Kolom audit belum tersedia di tabel', table, '— jalankan migration 002_audit_trail.sql');
        }
      }
    },
    /**
     * Insert data utama + audit fields. Audit fields dicoba dalam
     * insert kedua (update) supaya kalau kolom belum ada, insert
     * utama tetap berhasil.
     */
    async safeAuditInsert(table, item, auditFields) {
      // 1) Insert data utama (tanpa audit fields yang mungkin belum ada)
      const cleanItem = { ...item };
      // Hapus field audit dari insert utama
      if (auditFields && Array.isArray(auditFields)) {
        auditFields.forEach(f => delete cleanItem[f]);
      }
      const result = await DB.insert(table, cleanItem);
      // 2) Best-effort: update audit fields
      if (result && result.id && auditFields && Array.isArray(auditFields)) {
        const auditPayload = {};
        auditFields.forEach(f => {
          if (item[f] !== undefined) auditPayload[f] = item[f];
        });
        if (Object.keys(auditPayload).length > 0) {
          try {
            await DB.update(table, result.id, auditPayload);
          } catch (e) {
            console.warn('[audit] Kolom audit belum tersedia di tabel', table);
          }
        }
      }
      return result;
    },

    statusBadge(s) {
      return {
        pending: 'bg-slate-100 text-slate-700', scheduled: 'bg-blue-100 text-blue-700',
        partial: 'bg-yellow-100 text-yellow-700', completed: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700 line-through',
      }[s] || 'bg-slate-100';
    },
    roleBadge(r) {
      return {
        owner: 'bg-purple-100 text-purple-700', admin: 'bg-blue-100 text-blue-700',
        sales: 'bg-emerald-100 text-emerald-700', logistik: 'bg-yellow-100 text-yellow-700',
        customer: 'bg-orange-100 text-orange-700',
      }[r] || 'bg-slate-100 text-slate-700';
    },

    get isCustomer() { return this.currentUser?.role === 'customer'; },
    get unreadNotifCount() {
      if (!this.currentUser || this.currentUser.role === 'customer') return 0;
      return this.notifications.filter(n => !(n.read_by || []).includes(this.currentUser.id)).length;
    },
    get accessibleSites() {
      const u = this.currentUser;
      if (!u) return [];
      if (u.role === 'owner' || u.role === 'admin') return null;
      if (u.role === 'customer') return u.assigned_sites || [];
      if (u.role === 'sales') return this.prospects.filter(p => Number(p.sales_id) === Number(u.id)).map(p => p.site_no).filter(Boolean);
      return [];
    },
    get pageTitle() {
      return {
        dashboard: 'Dashboard', inputProspek: 'Input Prospek Project', dataProspek: 'Data Project Prospek',
        inputOrder: 'Input Order', jadwal: 'Jadwal Pengecoran', orderSearch: 'Order Search',
        marketing: 'Marketing — Site No Detail',
        afterDelivery: 'After Delivery Report', proposeSiteNo: 'Approval Site No',
        kelolaUser: 'Kelola User', kelolaHakAkses: 'Kelola Hak Akses',
        kelolaPlant: 'Kelola Plant', kelolaMutu: 'Kelola Mutu',
        kelolaKompetitor: 'Kelola Kompetitor', kelolaAlamat: 'Kelola Alamat',
        profil: 'Profil Saya', logAktivitas: 'Log Aktivitas User',
      }[this.page] || '';
    },
    get filteredLogs() {
      let list = (this.loginLogs || []).slice();
      if (this.logFilter.q) {
        const q = this.logFilter.q.toLowerCase();
        list = list.filter(l => (l.username || '').toLowerCase().includes(q) || (l.name || '').toLowerCase().includes(q));
      }
      if (this.logFilter.status) list = list.filter(l => l.status === this.logFilter.status);
      return list;
    },
    get filteredProposals() {
      return this.prospects
        .filter(p => ['propose_site_no', 'complete', 'held'].includes(p.site_no_status || ''))
        .map(p => {
          const pr = this.propose.find(x => Number(x.prospect_id) === Number(p.id));
          const v = this.visits.find(x => Number(x.prospect_id) === Number(p.id));
          const mutuDiminta = (v && v.mutu_id) ? this.mutuList.find(m => Number(m.id) === Number(v.mutu_id)) : null;
          return {
            ...p,
            propose_date: pr?.created_at || p.visit_done_at || p.created_at,
            visit_mutu_id: v?.mutu_id || null,
            visit_mutu_code: mutuDiminta?.code || null,
            visit_mutu_name: mutuDiminta?.name || null,
            visit_estimasi_volume: v?.estimasi_volume || 0,
          };
        })
        .filter(p => {
          if (this.psFilter.status && p.site_no_status !== this.psFilter.status) return false;
          if (this.psFilter.q) {
            const q = this.psFilter.q.toLowerCase();
            return (p.project_name || '').toLowerCase().includes(q)
                || (p.site_no || '').toLowerCase().includes(q)
                || (p.pic_name || '').toLowerCase().includes(q)
                || (p.visit_mutu_code || '').toLowerCase().includes(q);
          }
          return true;
        })
        .sort((a, b) => b.id - a.id);
    },

    resetJadwalFilter() { this.jFilter = { plants: [], status: '', date: todayISO() }; },
    resetAdFilter()    { this.adFilter = { q: '', date_from: todayISO(), date_to: todayISO(), status: '' }; },

    /* ─────────── LOGIN ─────────── */
    async login() {
      const uid = (this.loginForm.username || '').trim().toLowerCase();
      if (!uid) { this.loginError = 'User ID wajib diisi'; return; }
      const developer = this.getDeveloperAccount();
      const isDeveloperLogin = (uid === String(developer.username).toLowerCase())
                            || (developer.email && uid === String(developer.email).toLowerCase());

      if (isDeveloperLogin) {
        if (String(developer.password) !== String(this.loginForm.password)) {
          this.loginError = 'Password salah'; return;
        }
        if (developer.is_active === false) { this.loginError = 'Akun Developer nonaktif'; return; }
        if (developer.email && developer.email.includes('@')) {
          await trySupabaseAuth(developer.email, this.loginForm.password);
        }
        this.currentUser = { ...developer };
        localStorage.setItem('beton_current', JSON.stringify(this.currentUser));
        this.loginError = '';
        this.loginForm = { username: '', password: '' };
        await this.nav('dashboard');
        this.toastMsg('Login Developer berhasil');
        // ─── Start Realtime subscription ───
        if (typeof window.Realtime !== 'undefined') {
          window.Realtime.start(() => this.reload());
        }
        return;
      }

      const u = this.users.find(x => (x.username && String(x.username).toLowerCase() === uid) || (x.email && String(x.email).toLowerCase() === uid));
      if (!u) { this.loginError = 'User ID tidak ditemukan. Pastikan akun sudah dibuat oleh Owner.'; await this.recordLogin(null, uid, 'failed'); return; }
      if (String(u.password) !== String(this.loginForm.password)) { this.loginError = 'Password salah'; await this.recordLogin(u, uid, 'failed'); return; }
      if (u.is_active === false) { this.loginError = 'Akun Anda dinonaktifkan. Hubungi owner.'; await this.recordLogin(u, uid, 'inactive'); return; }
      this.currentUser = u;
      localStorage.setItem('beton_current', JSON.stringify(u));
      this.loginError = '';
      this.loginForm = { username: '', password: '' };
      await this.recordLogin(u, uid, 'success');
      let defaultPage = 'dashboard';
      if (!this.hasAccess('dashboard')) {
        if (this.hasAccess('jadwal')) defaultPage = 'jadwal';
        else if (this.hasAccess('inputProspek')) defaultPage = 'inputProspek';
        else if (this.hasAccess('dataProspek')) defaultPage = 'dataProspek';
        else if (this.hasAccess('inputOrder')) defaultPage = 'inputOrder';
        else if (this.hasAccess('orderSearch')) defaultPage = 'orderSearch';
        else if (this.hasAccess('marketing')) defaultPage = 'marketing';
        else if (this.hasAccess('afterDelivery')) defaultPage = 'afterDelivery';
      }
      const requestedPage = (location.hash.match(/(?:^#|&)page=([^&]+)/) || [])[1];
      if (requestedPage) {
        const targetPage = decodeURIComponent(requestedPage);
        if (u.role === 'owner' || u.role === 'developer' || this.hasAccess(targetPage)) defaultPage = targetPage;
      }
      await this.nav(defaultPage);
      this.toastMsg('Selamat datang, ' + u.name);
      // ─── Start Realtime subscription ───
      if (typeof window.Realtime !== 'undefined') {
        window.Realtime.start(() => this.reload());
      }
    },

    async recordLogin(user, uidInput, status) {
      const activity = status === 'success' ? 'Login berhasil' :
        status === 'inactive' ? 'Percobaan login ditolak — akun nonaktif' :
        'Percobaan login gagal';
      await appendActivityLogAsync(user, activity, status, uidInput);
      this.loginLogs = await pruneActivityLogsAsync();
    },

    /* ─────────── PROFILE ─────────── */
    uploadAvatar(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (file.size > 500 * 1024) { this.toastMsg('File terlalu besar. Maks 500 KB.', 'error'); event.target.value = ''; return; }
      if (!file.type.startsWith('image/')) { this.toastMsg('File harus berupa gambar.', 'error'); event.target.value = ''; return; }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await DB.update('users', this.currentUser.id, { avatar: e.target.result });
          await this.reload();
          const updated = this.users.find(u => Number(u.id) === Number(this.currentUser.id));
          if (updated) {
            this.currentUser = updated;
            localStorage.setItem('beton_current', JSON.stringify(updated));
          }
          this.toastMsg('Foto profil berhasil diupdate');
        } catch (err) { this.toastMsg('Gagal update avatar: ' + (err?.message || err), 'error'); }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    },

    async removeAvatar() {
      if (!confirm('Hapus foto profil?')) return;
      try {
        await DB.update('users', this.currentUser.id, { avatar: null });
        await this.reload();
        const updated = this.users.find(u => Number(u.id) === Number(this.currentUser.id));
        if (updated) {
          this.currentUser = updated;
          localStorage.setItem('beton_current', JSON.stringify(updated));
        }
        this.toastMsg('Foto profil dihapus');
      } catch (e) { this.toastMsg('Gagal hapus avatar: ' + (e?.message || e), 'error'); }
    },

    async changeMyPassword() {
      if (this.profileForm.new_password !== this.profileForm.confirm_password) { this.toastMsg('Konfirmasi password tidak sama', 'error'); return; }
      if ((this.profileForm.new_password || '').length < 6) { this.toastMsg('Password minimal 6 karakter', 'error'); return; }
      if (this.profileForm.old_password !== this.currentUser.password) { this.toastMsg('Password lama salah', 'error'); return; }
      try {
        await DB.update('users', this.currentUser.id, { password: this.profileForm.new_password });
        await this.reload();
        const updated = this.users.find(u => Number(u.id) === Number(this.currentUser.id));
        if (updated) {
          this.currentUser = updated;
          localStorage.setItem('beton_current', JSON.stringify(updated));
        }
        this.profileForm = { old_password: '', new_password: '', confirm_password: '' };
        this.toastMsg('Password berhasil diubah!');
      } catch (e) { this.toastMsg('Gagal ubah password: ' + (e?.message || e), 'error'); }
    },

    togglePwVisible(id) { this.pwVisible = { ...this.pwVisible, [id]: !this.pwVisible[id] }; },

    async toggleUserActive(id) {
      try {
        const target = this.users.find(u => Number(u.id) === Number(id));
        if (!target) return;
        if (Number(target.id) === Number(this.currentUser.id)) { this.toastMsg('Tidak bisa nonaktifkan akun sendiri', 'error'); return; }
        await DB.update('users', id, { is_active: target.is_active === false ? true : false });
        await this.reload();
        const updated = this.users.find(u => Number(u.id) === Number(id));
        this.toastMsg('User "' + (updated?.username || '') + '" ' + (updated?.is_active ? 'diaktifkan' : 'dinonaktifkan'));
      } catch (e) { this.toastMsg('Gagal ubah status user: ' + (e?.message || e), 'error'); }
    },

    async logout() {
      // ─── Stop Realtime subscription ───
      if (typeof window.Realtime !== 'undefined') {
        window.Realtime.stop();
      }
      await signOutSupabaseAuth();
      this.currentUser = null;
      localStorage.removeItem('beton_current');
    },

    /* ─────────── STATS (legacy getter) ─────────── */
    get stats() {
      const u = this.currentUser;
      let myProspek = this.prospects.slice();
      let myOrders = this.orders.slice();
      if (u?.role === 'sales') {
        myProspek = myProspek.filter(p => Number(p.sales_id) === Number(u.id));
        myOrders = myOrders.filter(o => Number(o.sales_id) === Number(u.id));
      }
      const today = todayISO();
      return {
        totalProspek: myProspek.length,
        repeatOrder: myProspek.filter(p => p.source === 'customer_repeat').length,
        visitDone: myProspek.filter(p => p.visit_status === 'done').length,
        complete: myProspek.filter(p => p.site_no_status === 'complete').length,
        totalOrder: myOrders.length,
        orderToday: myOrders.filter(o => o.delivery_date === today).length,
        qtyOrder: myOrders.reduce((s, o) => s + (+o.qty_order || 0), 0),
        qtyDelivered: myOrders.reduce((s, o) => s + (+o.qty_delivery || 0), 0),
      };
    },

    /* ─────────── PROSPEK ─────────── */
    async saveProspek() {
      const yy = new Date().toISOString().slice(0, 7).replace('-', '');
      const seq = this.prospects.length + 1;
      const no = `PRS/${yy}/${String(seq).padStart(4, '0')}`;
      const comp = this.competitors.find(c => Number(c.id) === Number(this.pForm.competitor_id));
      const now = new Date().toISOString();
      const newItem = {
        prospect_no: no,
        project_name: this.pForm.project_name, address: this.pForm.address,
        pic_name: this.pForm.pic_name, pic_contact: this.pForm.pic_contact,
        construction_type: this.pForm.construction_type,
        competitor_id: comp ? Number(comp.id) : null,
        competitor_name: comp?.name || this.pForm.competitor_other || '',
        sales_id: this.currentUser.id, sales_visit_id: null,
        site_no: null, site_no_status: 'waiting', po_no: null, qty_po: 0,
        visit_status: 'not_yet', final_status: 'open',
        source: 'internal', created_at: now,
        created_by: this.currentUser?.id || null,
      };
      try {
        // created_by dikirim terpisah (best-effort) supaya insert utama
        // tetap berhasil walau kolom created_by belum ada di DB.
        await this.safeAuditInsert('prospects', newItem, ['created_by']);
        await this.reload();
        this.pForm = { project_name: '', address: '', pic_name: '', pic_contact: '', construction_type: '', competitor_id: '', competitor_other: '' };
        this.toastMsg('Prospek disimpan: ' + no);
        await this.nav('dataProspek');
      } catch (e) { this.toastMsg('Gagal simpan: ' + (e?.message || e), 'error'); }
    },

    /* ─── EDIT PROSPEK (Owner & Admin only) ─── */
    isOwnerOrAdmin() {
      return !!this.currentUser
          && ['owner', 'developer', 'admin'].includes(this.currentUser.role);
    },
    openEditProspek(p) {
      if (!this.isOwnerOrAdmin()) {
        this.toastMsg('Hanya Owner/Admin yang bisa edit prospek', 'error');
        return;
      }
      this.editProspekModal = { show: true, id: p.id, prospect_no: p.prospect_no || '-' };
      this.epForm = {
        project_name: p.project_name || '',
        address: p.address || '',
        pic_name: p.pic_name || '',
        pic_contact: p.pic_contact || '',
        construction_type: p.construction_type || '',
        competitor_id: p.competitor_id || '',
        competitor_other: (p.competitor_name && !p.competitor_id) ? p.competitor_name : '',
      };
    },
    async saveEditProspek() {
      if (!this.isOwnerOrAdmin()) {
        this.toastMsg('Hanya Owner/Admin yang bisa edit prospek', 'error'); return;
      }
      const comp = this.competitors.find(c => Number(c.id) === Number(this.epForm.competitor_id));
      const mainPayload = {
        project_name: this.epForm.project_name,
        address: this.epForm.address,
        pic_name: this.epForm.pic_name,
        pic_contact: this.epForm.pic_contact,
        construction_type: this.epForm.construction_type,
        competitor_id: comp ? Number(comp.id) : null,
        competitor_name: comp?.name || this.epForm.competitor_other || '',
      };
      const auditPayload = {
        updated_by: this.currentUser?.id || null,
        updated_at: new Date().toISOString(),
      };
      try {
        // Data utama SELALU disimpan. Audit best-effort.
        await this.safeAuditUpdate('prospects', this.editProspekModal.id, mainPayload, auditPayload);
        await this.reload();
        this.editProspekModal.show = false;
        this.toastMsg('Prospek diupdate: ' + this.editProspekModal.prospect_no);
      } catch (e) { this.toastMsg('Gagal update prospek: ' + (e?.message || e), 'error'); }
    },

    get filteredProspek() {
      const u = this.currentUser;
      if (!u) return [];
      const allowed = this.accessibleSites;
      return this.prospects
        .filter(p => {
          // Customer: hanya prospek dengan site_no yang di-assign ke mereka
          if (u.role === 'customer') {
            return Array.isArray(allowed) && allowed.includes(p.site_no);
          }
          // Sales / admin / owner / developer / logistik: lihat SEMUA prospek
          return true;
        })
        .filter(p => !this.pFilter.q || p.project_name.toLowerCase().includes(this.pFilter.q.toLowerCase()))
        .filter(p => !this.pFilter.visit || p.visit_status === this.pFilter.visit)
        .filter(p => !this.pFilter.status || p.site_no_status === this.pFilter.status)
        .filter(p => !this.pFilter.source || (p.source || 'internal') === this.pFilter.source)
        .sort((a, b) => b.id - a.id);
    },

    openVisit(p) {
      const v = this.visits.find(x => Number(x.prospect_id) === Number(p.id)) || {};
      this.visitModal = { show: true, id: p.id, project_name: p.project_name, current_status: p.visit_status || 'not_yet' };
      this.vForm = {
        estimasi_tgl_cor: v.estimasi_tgl_cor || '', jam_loading: v.jam_loading || '',
        mutu_id: v.mutu_id || '', estimasi_volume: v.estimasi_volume || 0,
        plant_id: v.plant_id || '', metode_cor: v.metode_cor || '',
        win: !!v.win, lost: !!v.lost,
      };
    },

    async saveVisit() {
      const existing = this.visits.find(v => Number(v.prospect_id) === Number(this.visitModal.id));
      const payload = {
        prospect_id: this.visitModal.id,
        estimasi_tgl_cor: this.vForm.estimasi_tgl_cor, jam_loading: this.vForm.jam_loading,
        mutu_id: this.vForm.mutu_id ? Number(this.vForm.mutu_id) : null,
        estimasi_volume: this.vForm.estimasi_volume,
        plant_id: this.vForm.plant_id ? Number(this.vForm.plant_id) : null,
        metode_cor: this.vForm.metode_cor,
        win: this.vForm.win, lost: this.vForm.lost,
        created_by: this.currentUser?.id,
      };
      try {
        if (existing) {
          await DB.update('visits', existing.id, payload);
        } else {
          await DB.insert('visits', payload);
        }
        const p = this.prospects.find(x => Number(x.id) === Number(this.visitModal.id));
        if (p) {
          await DB.update('prospects', p.id, {
            visit_status: 'done',
            visit_done_at: new Date().toISOString(),
            sales_visit_id: this.currentUser?.id,
            site_no_status: p.site_no_status === 'waiting' ? 'propose_site_no' : p.site_no_status
          });
        }
        await this.reload();
        this.visitModal.show = false;
        this.toastMsg('Visit disimpan (DONE / Final)');
      } catch (e) { this.toastMsg('Gagal simpan visit: ' + (e?.message || e), 'error'); }
    },

    async claimProspek(p) {
      if (!this.currentUser?.id) return;
      try {
        await DB.update('prospects', p.id, {
          sales_id: this.currentUser.id,
          final_status: 'follow_up',
        });
        const relatedNotifs = this.notifications.filter(n => Number(n.prospect_id) === Number(p.id));
        for (const n of relatedNotifs) {
          const readBy = Array.isArray(n.read_by) ? [...n.read_by] : [];
          if (!readBy.includes(this.currentUser.id)) {
            readBy.push(this.currentUser.id);
            await DB.update('notifications', n.id, { read_by: readBy });
          }
        }
        await this.reload();
        this.toastMsg('Prospek diambil!');
      } catch (e) { this.toastMsg('Gagal klaim prospek: ' + (e?.message || e), 'error'); }
    },

    async deleteProspect(p) {
      if (!this.currentUser || this.currentUser.role !== 'owner') {
        this.toastMsg('Hanya Owner yang bisa menghapus prospek', 'error'); return;
      }
      const relatedOrders = this.orders.filter(o => Number(o.prospect_id) === Number(p.id));
      let msg = 'Hapus prospek "' + p.project_name + '" (' + (p.prospect_no || '-') + ')?';
      if (relatedOrders.length > 0) {
        msg += '\n\n⚠️ Prospek ini memiliki ' + relatedOrders.length + ' order terkait.\nOrder & delivery juga akan dihapus.';
      }
      if (!confirm(msg)) return;

      try {
        for (const o of relatedOrders) {
          const delivs = this.deliveries.filter(d => Number(d.order_id) === Number(o.id));
          for (const d of delivs) await DB.remove('deliveries', d.id);
          await DB.remove('orders', o.id);
        }
        const visits = this.visits.filter(v => Number(v.prospect_id) === Number(p.id));
        for (const v of visits) await DB.remove('visits', v.id);
        const proposals = this.propose.filter(pr => Number(pr.prospect_id) === Number(p.id));
        for (const pr of proposals) await DB.remove('propose', pr.id);
        const notifs = this.notifications.filter(n => Number(n.prospect_id) === Number(p.id));
        for (const n of notifs) await DB.remove('notifications', n.id);
        await DB.remove('prospects', p.id);
        await this.reload();
        this.toastMsg('Prospek "' + p.project_name + '" berhasil dihapus');
      } catch (e) { this.toastMsg('Gagal hapus prospek: ' + (e?.message || e), 'error'); }
    },

    async showRequestDetail(p) {
      this.reqModal = { show: true, data: p };
      try {
        const relatedNotifs = this.notifications.filter(n => Number(n.prospect_id) === Number(p.id));
        for (const n of relatedNotifs) {
          const readBy = Array.isArray(n.read_by) ? [...n.read_by] : [];
          if (!readBy.includes(this.currentUser.id)) {
            readBy.push(this.currentUser.id);
            await DB.update('notifications', n.id, { read_by: readBy });
          }
        }
        await this.reload();
      } catch (e) { console.error('showRequestDetail error:', e); }
    },

    get customerSites() {
      const u = this.currentUser;
      if (!u || u.role !== 'customer') return [];
      const sites = u.assigned_sites || [];
      const map = {};
      this.prospects.filter(p => sites.includes(p.site_no)).forEach(p => { if (!map[p.site_no]) map[p.site_no] = p; });
      return Object.values(map);
    },

    openOneClickOrder(o) {
      this.ocModal = { show: true, data: o, mode: 'repeat' };
      const tgl = new Date(); tgl.setDate(tgl.getDate() + 3);
      this.ocForm = { site_no: o.site_no, delivery_date: tgl.toISOString().slice(0, 10), pouring_time: '08:00', qty_order: o.qty_order || 0, metode_cor: o.metode_cor || 'Pompa', note: '' };
    },
    openNewCustomerOrder() {
      this.ocModal = { show: true, data: null, mode: 'new' };
      const tgl = new Date(); tgl.setDate(tgl.getDate() + 3);
      this.ocForm = { site_no: '', delivery_date: tgl.toISOString().slice(0, 10), pouring_time: '08:00', qty_order: 0, metode_cor: 'Pompa', note: '' };
    },
    async saveOneClickOrder() {
      if (!this.ocForm.delivery_date || !this.ocForm.pouring_time || !this.ocForm.qty_order || !this.ocForm.metode_cor) {
        this.toastMsg('Lengkapi semua field', 'error'); return;
      }
      const customer = this.currentUser;
      let site_no, project_name, address, pic_name, pic_contact, po_no, mutu_id, plant_id, ref_order_no, ref_prospect_id;
      if (this.ocModal.mode === 'repeat' && this.ocModal.data) {
        const o = this.ocModal.data;
        site_no = o.site_no; project_name = o.project_name; address = o.address;
        pic_name = o.pic_name; pic_contact = o.pic_contact; po_no = o.po_no;
        mutu_id = o.mutu_id; plant_id = o.plant_id;
        ref_order_no = o.order_no; ref_prospect_id = o.prospect_id;
      } else {
        const p = this.prospects.find(x => x.site_no === this.ocForm.site_no);
        if (!p) { this.toastMsg('Pilih Site No terlebih dahulu', 'error'); return; }
        site_no = p.site_no; project_name = p.project_name; address = p.address;
        pic_name = p.pic_name; pic_contact = p.pic_contact; po_no = p.po_no;
        const lastOrder = this.orders.filter(o => o.site_no === p.site_no).sort((a, b) => b.id - a.id)[0];
        mutu_id = lastOrder?.mutu_id || (this.mutuList[0]?.id);
        plant_id = lastOrder?.plant_id || (this.plants[0]?.id);
        ref_order_no = lastOrder?.order_no || '-';
        ref_prospect_id = p.id;
      }
      const yy = new Date().toISOString().slice(0, 7).replace('-', '');
      const seq = this.prospects.length + 1;
      const no = `RPT/${yy}/${String(seq).padStart(4, '0')}`;
      const newProspect = {
        prospect_no: no,
        project_name, address, pic_name, pic_contact,
        construction_type: 'Repeat', competitor_name: '-',
        sales_id: null, sales_visit_id: null,
        site_no, site_no_status: 'complete', po_no,
        visit_status: 'not_yet', final_status: 'repeat_order',
        source: 'customer_repeat',
        requested_by: customer.id, requested_by_name: customer.name,
        ref_order_no, ref_prospect_id,
        request_delivery_date: this.ocForm.delivery_date,
        request_pouring_time: this.ocForm.pouring_time,
        request_qty: this.ocForm.qty_order,
        request_metode_cor: this.ocForm.metode_cor,
        request_mutu_id: mutu_id, request_plant_id: plant_id,
        request_note: this.ocForm.note,
        created_at: new Date().toISOString(),
      };
      try {
        const created = await DB.insert('prospects', newProspect);
        await DB.insert('notifications', {
          type: 'repeat_order',
          prospect_id: created?.id || null, prospect_no: no,
          message: `${customer.name} minta order ${site_no}`,
          customer_id: customer.id, customer_name: customer.name,
          site_no, project_name, qty: this.ocForm.qty_order, mutu_id, plant_id,
          created_at: new Date().toISOString(), read_by: [],
        });
        await this.reload();
        this.ocModal.show = false;
        this.ocForm = { site_no: '', delivery_date: '', pouring_time: '', qty_order: 0, metode_cor: '', note: '' };
        this.toastMsg('Permintaan order terkirim!');
      } catch (e) { this.toastMsg('Gagal kirim permintaan order: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── ORDER ─────────── */
    async goOrder(p) {
      await this.nav('inputOrder');
      this.oForm.site_no = p.site_no;
      this.onSiteChange();
    },
    get completeSites() {
      // Sales / admin / owner / developer / logistik: semua site complete
      // Customer: hanya site yang di-assign
      const u = this.currentUser;
      return this.prospects.filter(p => {
        if (p.site_no_status !== 'complete') return false;
        if (p.source === 'customer_repeat') return false;
        if (u?.role === 'customer') {
          const allowed = this.accessibleSites;
          return Array.isArray(allowed) && allowed.includes(p.site_no);
        }
        return true;
      });
    },
    get siteFound() {
      const q = String(this.oForm.site_no || '').trim().toLowerCase();
      return this.completeSites.some(s => String(s.site_no || '').trim().toLowerCase() === q);
    },
    onSiteChange() {
      const q = String(this.oForm.site_no || '').trim().toLowerCase();
      const p = this.prospects.find(x => String(x.site_no || '').trim().toLowerCase() === q);
      if (!p || p.site_no_status !== 'complete') {
        this.oForm.project_name = ''; this.oForm.address = ''; this.oForm.po_no = '';
        this.oForm.pic_name = ''; this.oForm.pic_contact = ''; this.oForm.mutu_list = [];
        this.oForm.plant_list = [];
        return;
      }
      this.oForm.project_name = p.project_name; this.oForm.address = p.address;
      this.oForm.po_no = p.po_no; this.oForm.pic_name = p.pic_name; this.oForm.pic_contact = p.pic_contact;
      const prop = this.propose.find(pr => Number(pr.prospect_id) === Number(p.id));
      const ids = (prop?.mutu || []).map(Number);
      const filtered = this.mutuList.filter(m => ids.includes(Number(m.id)));
      this.oForm.mutu_list = filtered.length ? filtered : this.mutuList;

      const plantIds = (prop?.plant_ids || []).map(Number);
      if (plantIds.length > 0) {
        this.oForm.plant_list = this.plants.filter(pl => plantIds.includes(Number(pl.id)));
      } else {
        this.oForm.plant_list = this.plants.slice();
      }
      if (this.oForm.plant_id && !this.oForm.plant_list.some(pl => Number(pl.id) === Number(this.oForm.plant_id))) {
        this.oForm.plant_id = '';
      }
    },

    async saveOrder() {
      const requestedSiteNo = String(this.oForm.site_no || '').trim().toLowerCase();
      const p = this.prospects.find(x => String(x.site_no || '').trim().toLowerCase() === requestedSiteNo);
      if (!p || p.site_no_status !== 'complete') { this.toastMsg('Site No tidak valid atau belum di-approve', 'error'); return; }

      const qty_po = Number(p.qty_po) || 0;
      if (qty_po > 0) {
        const totalOrdered = this.orders
          .filter(o => o.site_no === this.oForm.site_no && o.status !== 'cancelled')
          .reduce((s, o) => s + (Number(o.qty_order) || 0), 0);
        const newQty = Number(this.oForm.qty_order) || 0;
        if (totalOrdered + newQty > qty_po) {
          const remain = Math.max(0, qty_po - totalOrdered);
          this.toastMsg(`⚠️ Order melebihi Qty PO! Sisa kuota: ${this.fmt(remain)} m³ dari total PO ${this.fmt(qty_po)} m³. Order tidak dapat dijadwalkan.`, 'error');
          return;
        }
      }

      const yy = new Date().toISOString().slice(0, 7).replace('-', '');
      const seq = this.orders.length + 1;
      const no = `ORD/${yy}/${String(seq).padStart(4, '0')}`;
      const newOrder = {
        order_no: no,
        prospect_id: p.id, site_no: p.site_no, project_name: p.project_name,
        address: p.address, po_no: p.po_no, pic_name: p.pic_name, pic_contact: p.pic_contact,
        mutu_id: Number(this.oForm.mutu_id), plant_id: Number(this.oForm.plant_id),
        delivery_date: this.oForm.delivery_date, pouring_time: this.oForm.pouring_time,
        qty_order: +this.oForm.qty_order, qty_delivery: 0, qty_remain: +this.oForm.qty_order,
        metode_cor: this.oForm.metode_cor, status: 'scheduled',
        cancel_reason: '',
        sales_id: p.sales_visit_id || p.sales_id || this.currentUser?.id,
        created_by: this.currentUser?.id, created_at: new Date().toISOString(),
      };
      try {
        await DB.insert('orders', newOrder);
        await this.reload();
        this.oForm = { site_no: '', project_name: '', address: '', po_no: '', pic_name: '', pic_contact: '', mutu_id: '', plant_id: '', delivery_date: '', pouring_time: '', qty_order: 0, metode_cor: '', mutu_list: [], plant_list: [] };
        this.toastMsg('Order dibuat');
        await this.nav('jadwal');
      } catch (e) { this.toastMsg('Gagal simpan order: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── JADWAL ─────────── */
    get jadwalPlantOptions() {
      const map = new Map();
      (this.plants || []).filter(p => p && p.name && p.is_active !== false).forEach(p => {
        map.set(Number(p.id), { id: Number(p.id), name: p.name });
      });
      (this.orders || []).forEach(o => {
        const id = Number(o.plant_id);
        if (id && !map.has(id)) map.set(id, { id, name: this.plantName(id) || ('Plant #' + id) });
      });
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    isOrderFinished(o) {
      return ['completed', 'complete', 'finished'].includes(String(o?.status || '').toLowerCase()) || Number(o?.qty_remain) <= 0;
    },

    get groupedOrders() {
      const u = this.currentUser;
      if (!u) return [];
      let list = this.orders.slice();
      if (u.role === 'customer') {
        const allowed = Array.isArray(this.accessibleSites) ? this.accessibleSites : [];
        const allowedSet = new Set(allowed.map(v => String(v || '').trim().toLowerCase()));
        list = list.filter(o => allowedSet.has(String(o.site_no || '').trim().toLowerCase()));
      }
      const selectedPlants = Array.isArray(this.jFilter.plants)
        ? this.jFilter.plants.map(v => String(v)).filter(Boolean) : [];
      if (selectedPlants.length) list = list.filter(o => selectedPlants.includes(String(o.plant_id)));
      if (this.jFilter.status) {
        const wantedStatus = String(this.jFilter.status).trim().toLowerCase();
        list = list.filter(o => String(o.status || 'scheduled').trim().toLowerCase() === wantedStatus);
      }
      if (this.jFilter.date) {
        const wantedDate = String(this.jFilter.date).trim().slice(0, 10);
        list = list.filter(o => String(o.delivery_date || '').trim().slice(0, 10) === wantedDate);
      }
      list = list.map(o => ({ ...o, deliveries: this.deliveries.filter(d => Number(d.order_id) === Number(o.id)) }));
      list.sort((a, b) => (a.delivery_date + a.pouring_time).localeCompare(b.delivery_date + b.pouring_time));
      const map = {};
      list.forEach(o => {
        const key = this.plantName(o.plant_id) || '-';
        if (!map[key]) map[key] = { plant: key, orders: [] };
        map[key].orders.push(o);
      });
      return Object.values(map);
    },

    async recalcOrderStatus(orderId) {
      const order = this.orders.find(o => Number(o.id) === Number(orderId));
      if (!order) return;
      const activeDeliv = this.deliveries.filter(d =>
        Number(d.order_id) === Number(orderId) && (d.status || 'delivered') === 'delivered'
      );
      const total = activeDeliv.reduce((s, d) => s + (+d.qty || 0), 0);
      const remain = order.qty_order - total;
      let status = order.status;
      if (status !== 'cancelled') {
        status = total <= 0 ? 'scheduled' : (remain <= 0 ? 'completed' : 'partial');
      }
      try {
        await DB.update('orders', orderId, { qty_delivery: total, qty_remain: remain, status });
      } catch (e) { console.error('recalcOrderStatus error:', e); }
    },

    openDelivery(o) {
      // Saat order sudah Complete/Finished, hanya Owner/Admin yang boleh
      // menambah pengiriman baru (untuk koreksi). Sales & role lain diblok.
      if (this.isOrderFinished(o) && !this.isOwnerOrAdmin()) {
        this.toastMsg('Order sudah Complete. Hanya Owner/Admin yang bisa menambah pengiriman.', 'error');
        return;
      }
      this.dvModal = {
        show: true, order_id: o.id, site_no: o.site_no, remain: o.qty_remain,
        order_no: o.order_no, order_delivery_date: o.delivery_date,
        isComplete: this.isOrderFinished(o),
      };
      this.dvForm = { sj_no: '', delivery_date: o.delivery_date, truck_no: '', qty: 0, driver_name: '' };
    },

    async saveDelivery() {
      const o = this.orders.find(x => Number(x.id) === Number(this.dvModal.order_id));
      if (!o) return;
      // Untuk order yang sudah Complete (qty_remain <= 0), hanya Owner/Admin
      // yang boleh menambah pengiriman koreksi (boleh melebihi sisa 0).
      if (!this.isOwnerOrAdmin() && +this.dvForm.qty > o.qty_remain) {
        this.toastMsg('Muatan melebihi sisa', 'error'); return;
      }
      const sjNo = (this.dvForm.sj_no || '').trim();
      if (sjNo) {
        const dupe = this.deliveries.find(d => (d.sj_no || '').toLowerCase() === sjNo.toLowerCase());
        if (dupe) { this.toastMsg('No SJ sudah dipakai. Gunakan nomor lain.', 'error'); return; }
      }
      const newDelivery = {
        order_id: o.id,
        sj_no: sjNo || null,
        delivery_date: o.delivery_date,
        truck_no: this.dvForm.truck_no,
        qty: +this.dvForm.qty,
        driver_name: this.dvForm.driver_name,
        status: 'delivered',
        remarks: '',
        created_by: this.currentUser?.id,
        created_at: new Date().toISOString(),
      };
      try {
        await DB.insert('deliveries', newDelivery);
        await this.recalcOrderStatus(o.id);
        await this.reload();
        this.dvModal.show = false;
        this.toastMsg('Delivery disimpan' + (sjNo ? '. No SJ: ' + sjNo : ' (tanpa No SJ).'));
      } catch (e) { this.toastMsg('Gagal simpan delivery: ' + (e?.message || e), 'error'); }
    },

    openEditDelivery(d) {
      const parentOrder = this.orderById(d.order_id);
      // Saat order sudah Complete/Finished, hanya Owner/Admin yang boleh edit
      // (untuk koreksi Truck/Qty/SJ). Sales & role lain diblok.
      if (this.isOrderFinished(parentOrder) && !this.isOwnerOrAdmin()) {
        this.toastMsg('Order sudah Complete. Hanya Owner/Admin yang bisa edit pengiriman.', 'error');
        return;
      }
      this.editDvModal = {
        show: true, deliveryId: d.id, order_id: d.order_id,
        order_no: this.orderById(d.order_id)?.order_no || '-',
        delivery_date: d.delivery_date,
        isComplete: this.isOrderFinished(parentOrder),
      };
      this.edvForm = {
        status: d.status || 'delivered',
        remarks: d.remarks || '',
        sj_no: d.sj_no || '',
        truck_no: d.truck_no || '',
        qty: d.qty || 0,
        driver_name: d.driver_name || '',
      };
    },

    async saveEditDelivery() {
      const parentOrder = this.orderById(this.editDvModal.order_id || this.editDvModal.data?.order_id);
      // Saat order sudah Complete/Finished, hanya Owner/Admin yang boleh simpan edit
      if (parentOrder && this.isOrderFinished(parentOrder) && !this.isOwnerOrAdmin()) {
        this.toastMsg('Order sudah Complete. Hanya Owner/Admin yang bisa edit pengiriman.', 'error');
        this.editDvModal.show = false;
        return;
      }
      const existing = this.deliveries.find(d => Number(d.id) === Number(this.editDvModal.deliveryId));
      if (!existing) return;

      const newStatus = this.edvForm.status || 'delivered';
      const remarks = (this.edvForm.remarks || '').trim();

      if ((newStatus === 'rejected' || newStatus === 'cancelled') && !remarks) {
        this.toastMsg('Keterangan wajib diisi untuk status Rejected / Cancelled', 'error'); return;
      }
      const sjNo = (this.edvForm.sj_no || '').trim();
      if (sjNo) {
        const dupe = this.deliveries.find(d => Number(d.id) !== Number(this.editDvModal.deliveryId)
                                  && (d.sj_no || '').toLowerCase() === sjNo.toLowerCase());
        if (dupe) { this.toastMsg('No SJ sudah dipakai.', 'error'); return; }
      }
      const orderId = existing.order_id;
      const now = new Date().toISOString();
      // Data utama yang pasti ada kolomnya
      const mainPayload = {
        status: newStatus,
        remarks: remarks,
        sj_no: sjNo || null,
        truck_no: this.edvForm.truck_no,
        qty: +this.edvForm.qty,
        driver_name: this.edvForm.driver_name,
      };
      // Audit fields — best-effort (kolom mungkin belum ada)
      const auditPayload = {
        updated_at: now,
        updated_by: this.currentUser?.id || null,
      };
      if (newStatus === 'cancelled') {
        auditPayload.cancelled_at = now;
        auditPayload.cancelled_by = this.currentUser?.id || null;
      }
      try {
        await this.safeAuditUpdate('deliveries', this.editDvModal.deliveryId, mainPayload, auditPayload);
        await this.recalcOrderStatus(orderId);
        await this.reload();
        this.editDvModal.show = false;
        this.toastMsg('Pengiriman diupdate — Status: ' + newStatus);
      } catch (e) { this.toastMsg('Gagal update delivery: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── AFTER DELIVERY ─────────── */
    downloadAfterDeliveryExcel() {
      const rows = this.filteredDeliveries;
      if (rows.length === 0) { this.toastMsg('Tidak ada data untuk di-download', 'error'); return; }
      let html = '<html><head><meta charset="UTF-8"></head><body>';
      html += '<h3>After Delivery Report</h3>';
      html += '<table border="1" cellpadding="4" cellspacing="0"><thead><tr>';
      const cols = ['Tgl Kirim', 'No SJ', 'Status', 'Order No', 'Site No', 'Project', 'Sales', 'Mutu', 'Plant', 'Truck No', 'Qty (m³)', 'Driver', 'Remarks'];
      cols.forEach(c => html += `<th style="background:#f0f0f0">${c}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(d => {
        const o = this.orderById(d.order_id) || {};
        html += '<tr>';
        html += `<td>${d.delivery_date || ''}</td>`;
        html += `<td>${d.sj_no || ''}</td>`;
        html += `<td>${d.status || 'delivered'}</td>`;
        html += `<td>${o.order_no || ''}</td>`;
        html += `<td>${o.site_no || ''}</td>`;
        html += `<td>${o.project_name || ''}</td>`;
        html += `<td>${this.salesName(o.sales_id)}</td>`;
        html += `<td>${this.mutuCode(o.mutu_id)}</td>`;
        html += `<td>${this.plantName(o.plant_id)}</td>`;
        html += `<td>${d.truck_no || ''}</td>`;
        html += `<td>${d.qty || 0}</td>`;
        html += `<td>${d.driver_name || ''}</td>`;
        html += `<td>${d.remarks || ''}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table></body></html>';
      const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AfterDelivery_${todayISO()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.toastMsg('File Excel di-download');
    },

    /* ─────────── ORDER SEARCH ─────────── */
    downloadOrderSearchExcel() {
      const rows = this.filteredOrders;
      if (rows.length === 0) { this.toastMsg('Tidak ada data untuk di-download', 'error'); return; }
      let html = '<html><head><meta charset="UTF-8"></head><body>';
      html += '<h3>Order Search Report</h3>';
      html += '<table border="1" cellpadding="4" cellspacing="0"><thead><tr>';
      const cols = ['Order No', 'Site No', 'Project', 'Sales', 'Mutu', 'Plant', 'Tgl Kirim', 'Qty Order (m³)', 'Qty Delivery (m³)', 'Qty Remain (m³)', 'Status', 'Cancel Reason'];
      cols.forEach(c => html += `<th style="background:#f0f0f0">${c}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(o => {
        html += '<tr>';
        html += `<td>${o.order_no || ''}</td>`;
        html += `<td>${o.site_no || ''}</td>`;
        html += `<td>${o.project_name || ''}</td>`;
        html += `<td>${this.salesName(o.sales_id)}</td>`;
        html += `<td>${this.mutuCode(o.mutu_id)}</td>`;
        html += `<td>${this.plantName(o.plant_id)}</td>`;
        html += `<td>${o.delivery_date || ''}</td>`;
        html += `<td>${o.qty_order || 0}</td>`;
        html += `<td>${o.qty_delivery || 0}</td>`;
        html += `<td>${o.qty_remain || 0}</td>`;
        html += `<td>${o.status || ''}</td>`;
        html += `<td>${o.cancel_reason || ''}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table></body></html>';
      const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OrderSearch_${todayISO()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.toastMsg('File Excel di-download');
    },
    openEditOrder(o) {
      if (this.isOrderFinished(o)) { this.toastMsg('Order sudah Complete/Finished dan tidak dapat diedit.', 'error'); return; }
      this.editOrderModal = { show: true, data: o };
      this.eoForm = { mutu_id: o.mutu_id, plant_id: o.plant_id, delivery_date: o.delivery_date,
                      pouring_time: o.pouring_time, qty_order: o.qty_order, metode_cor: o.metode_cor, status: o.status };
    },

    async saveEditOrder() {
      const o = this.editOrderModal.data;
      if (this.isOrderFinished(o)) { this.toastMsg('Order sudah Complete/Finished dan tidak dapat diedit.', 'error'); this.editOrderModal.show = false; return; }
      const prospect = this.prospects.find(x => x.site_no === o.site_no);
      const qty_po = Number(prospect?.qty_po) || 0;
      if (qty_po > 0) {
        const totalOther = this.orders
          .filter(x => x.site_no === o.site_no && x.status !== 'cancelled' && Number(x.id) !== Number(o.id))
          .reduce((s, x) => s + (Number(x.qty_order) || 0), 0);
        const newQty = Number(this.eoForm.qty_order) || 0;
        const oldQty = Number(o.qty_order) || 0;
        if (newQty > oldQty && (totalOther + newQty > qty_po)) {
          const remain = Math.max(0, qty_po - totalOther);
          this.toastMsg(`⚠️ Order melebihi Qty PO! Sisa kuota: ${this.fmt(remain)} m³ dari total PO ${this.fmt(qty_po)} m³.`, 'error');
          return;
        }
      }
      const qty = Number(this.eoForm.qty_order);
      const del = Number(o.qty_delivery) || 0;
      const remain = qty - del;
      let status = this.eoForm.status;
      if (o.status === 'cancelled') {
        status = 'cancelled';
      } else {
        status = del <= 0 ? 'scheduled' : (remain <= 0 ? 'completed' : 'partial');
      }
      try {
        const mainPayload = {
          mutu_id: Number(this.eoForm.mutu_id), plant_id: Number(this.eoForm.plant_id),
          delivery_date: this.eoForm.delivery_date, pouring_time: this.eoForm.pouring_time,
          qty_order: qty, qty_remain: remain, metode_cor: this.eoForm.metode_cor, status,
        };
        const auditPayload = {
          updated_by: this.currentUser?.id || null,
          updated_at: new Date().toISOString(),
        };
        await this.safeAuditUpdate('orders', o.id, mainPayload, auditPayload);
        await this.reload();
        this.editOrderModal.show = false;
        this.toastMsg('Order diupdate');
      } catch (e) { this.toastMsg('Gagal update order: ' + (e?.message || e), 'error'); }
    },

    async cancelOrderFromEdit() {
      const o = this.editOrderModal.data;
      const reason = prompt('Masukkan alasan CANCEL ORDER ' + o.order_no + ':');
      if (!reason || !reason.trim()) { this.toastMsg('Alasan cancel wajib diisi', 'error'); return; }
      try {
        const mainPayload = { status: 'cancelled', cancel_reason: reason.trim() };
        const auditPayload = { cancelled_at: new Date().toISOString(), cancelled_by: this.currentUser?.id };
        await this.safeAuditUpdate('orders', o.id, mainPayload, auditPayload);
        await this.reload();
        this.editOrderModal.show = false;
        this.toastMsg('Order ' + o.order_no + ' dibatalkan');
      } catch (e) { this.toastMsg('Gagal cancel order: ' + (e?.message || e), 'error'); }
    },

    async cancelOrderFromSearch(o) {
      if (this.hasDelivery(o.id)) { this.toastMsg('Tidak bisa cancel — sudah ada pengiriman', 'error'); return; }
      const reason = prompt('Masukkan alasan CANCEL ORDER ' + o.order_no + ':');
      if (!reason || !reason.trim()) { this.toastMsg('Alasan cancel wajib diisi', 'error'); return; }
      try {
        const mainPayload = { status: 'cancelled', cancel_reason: reason.trim() };
        const auditPayload = { cancelled_at: new Date().toISOString(), cancelled_by: this.currentUser?.id };
        await this.safeAuditUpdate('orders', o.id, mainPayload, auditPayload);
        await this.reload();
        this.toastMsg('Order ' + o.order_no + ' dibatalkan');
      } catch (e) { this.toastMsg('Gagal cancel order: ' + (e?.message || e), 'error'); }
    },

    openOrderDetail(o) { this.orderDetailModal = { show: true, data: o }; },
    get orderDetailDeliveries() {
      if (!this.orderDetailModal.data) return [];
      return this.deliveries.filter(d => Number(d.order_id) === Number(this.orderDetailModal.data.id)).sort((a, b) => b.id - a.id);
    },
    openEditOrderFromDetail() {
      const o = this.orderDetailModal.data;
      this.orderDetailModal.show = false;
      this.openEditOrder(o);
    },

    get filteredOrders() {
      const u = this.currentUser;
      if (!u) return [];
      let list = this.orders.slice();
      if (u.role === 'customer') {
        const assigned = Array.isArray(u.assigned_sites) ? u.assigned_sites : [];
        const assignedSet = new Set(assigned.map(v => String(v || '').trim().toLowerCase()));
        list = list.filter(o => assignedSet.has(String(o.site_no || '').trim().toLowerCase()));
      }
      if (this.sFilter.q) {
        const q = String(this.sFilter.q || '').trim().toLowerCase();
        list = list.filter(o =>
          String(o.order_no || '').toLowerCase().includes(q) ||
          String(o.site_no || '').toLowerCase().includes(q) ||
          String(o.project_name || '').toLowerCase().includes(q) ||
          String(o.po_no || '').toLowerCase().includes(q)
        );
      }
      if (this.sFilter.plant_id) list = list.filter(o => Number(o.plant_id) === Number(this.sFilter.plant_id));
      if (this.sFilter.mutu_id) list = list.filter(o => Number(o.mutu_id) === Number(this.sFilter.mutu_id));
      if (this.sFilter.status) {
        const wantedStatus = String(this.sFilter.status).trim().toLowerCase();
        list = list.filter(o => String(o.status || 'scheduled').trim().toLowerCase() === wantedStatus);
      }
      return list.sort((a, b) => b.id - a.id);
    },

    get filteredDeliveries() {
      const u = this.currentUser;
      if (!u) return [];
      let list = this.deliveries.slice();
      if (u.role === 'customer') {
        const assigned = Array.isArray(u.assigned_sites) ? u.assigned_sites : [];
        const assignedSet = new Set(assigned.map(v => String(v || '').trim().toLowerCase()));
        const allowedOrderIds = new Set(this.orders
          .filter(o => assignedSet.has(String(o.site_no || '').trim().toLowerCase()))
          .map(o => String(o.id)));
        list = list.filter(d => allowedOrderIds.has(String(d.order_id)));
      }
      const q = String(this.adFilter.q || '').trim().toLowerCase();
      if (q) {
        list = list.filter(d => {
          const o = this.orderById(d.order_id) || {};
          const fields = [o.order_no, o.site_no, o.project_name, o.po_no, d.sj_no, d.truck_no, d.driver_name];
          return fields.some(v => String(v == null ? '' : v).trim().toLowerCase().includes(q));
        });
      }
      if (this.adFilter.plant_id) {
        const selectedPlant = String(this.adFilter.plant_id).trim();
        list = list.filter(d => {
          const o = this.orderById(d.order_id) || {};
          return String(o.plant_id == null ? '' : o.plant_id).trim() === selectedPlant;
        });
      }
      if (this.adFilter.status) {
        const wantedStatus = String(this.adFilter.status).trim().toLowerCase();
        list = list.filter(d => String(d.status || 'delivered').trim().toLowerCase() === wantedStatus);
      }
      if (this.adFilter.date_from) {
        const from = String(this.adFilter.date_from).slice(0, 10);
        list = list.filter(d => String(d.delivery_date || '').slice(0, 10) >= from);
      }
      if (this.adFilter.date_to) {
        const to = String(this.adFilter.date_to).slice(0, 10);
        list = list.filter(d => String(d.delivery_date || '').slice(0, 10) <= to);
      }
      return list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    },

    /* ─────────── MARKETING ─────────── */
    get marketingSites() {
      let list = this.prospects.filter(p => p.site_no && p.site_no_status === 'complete');
      if (this.mktFilter.q) {
        const q = this.mktFilter.q.toLowerCase();
        list = list.filter(p => (p.site_no || '').toLowerCase().includes(q) || (p.project_name || '').toLowerCase().includes(q));
      }
      return list.sort((a, b) => (a.site_no || '').localeCompare(b.site_no || ''));
    },
    get mktSuggestions() {
      const q = (this.mktFilter.siteSearch || '').trim().toLowerCase();
      if (!q) return [];
      return this.prospects
        .filter(p => p.site_no && p.site_no_status === 'complete')
        .filter(p =>
          (p.site_no || '').toLowerCase().includes(q) ||
          (p.project_name || '').toLowerCase().includes(q)
        )
        .sort((a, b) => (a.site_no || '').localeCompare(b.site_no || ''))
        .slice(0, 20);
    },
    get mktSelectedSite() {
      if (!this.mktFilter.site_no) return null;
      return this.prospects.find(p => p.site_no === this.mktFilter.site_no) || null;
    },
    get mktStats() {
      if (!this.mktSelectedSite) return { qty_po: 0, totalOrdered: 0, totalDelivered: 0, remainPO: 0, hasLimit: false };
      const site_no = this.mktSelectedSite.site_no;
      const qty_po = Number(this.mktSelectedSite.qty_po) || 0;
      const orders = this.orders.filter(o => o.site_no === site_no && o.status !== 'cancelled');
      const totalOrdered = orders.reduce((s, o) => s + (Number(o.qty_order) || 0), 0);
      const orderIds = orders.map(o => Number(o.id));
      const delivs = this.deliveries.filter(d => orderIds.includes(Number(d.order_id)) && (d.status || 'delivered') === 'delivered');
      const totalDelivered = delivs.reduce((s, d) => s + (Number(d.qty) || 0), 0);
      return {
        qty_po, totalOrdered, totalDelivered,
        remainPO: qty_po > 0 ? (qty_po - totalOrdered) : 0,
        hasLimit: qty_po > 0,
      };
    },
    get mktOrders() {
      if (!this.mktSelectedSite) return [];
      return this.orders.filter(o => o.site_no === this.mktSelectedSite.site_no).sort((a, b) => b.id - a.id);
    },
    get mktDeliveries() {
      if (!this.mktSelectedSite) return [];
      const orderIds = this.mktOrders.map(o => Number(o.id));
      return this.deliveries.filter(d => orderIds.includes(Number(d.order_id))).sort((a, b) => b.id - a.id);
    },

    onMktSearchInput() {
      const q = (this.mktFilter.siteSearch || '').trim();
      this.mktSuggestOpen = q.length > 0;
      if (!q) { this.mktFilter.site_no = ''; return; }
      const exact = this.prospects.find(p =>
        p.site_no && p.site_no_status === 'complete' &&
        String(p.site_no).toLowerCase() === q.toLowerCase()
      );
      this.mktFilter.site_no = exact ? exact.site_no : '';
    },
    onMktSearchEnter() {
      const q = (this.mktFilter.siteSearch || '').trim();
      if (!q) return;
      const exact = this.prospects.find(p =>
        p.site_no && p.site_no_status === 'complete' &&
        String(p.site_no).toLowerCase() === q.toLowerCase()
      );
      if (exact) { this.selectMktSite(exact); return; }
      if (this.mktSuggestions.length > 0) this.selectMktSite(this.mktSuggestions[0]);
    },
    selectMktSite(s) {
      this.mktFilter.site_no = s.site_no;
      this.mktFilter.siteSearch = s.site_no;
      this.mktSuggestOpen = false;
    },
    resetMktSearch() {
      this.mktFilter.site_no = '';
      this.mktFilter.siteSearch = '';
      this.mktSuggestOpen = false;
    },

    /* ─────────── PROPOSE / APPROVAL SITE NO ─────────── */
    get pendingProposals() { return this.prospects.filter(p => p.site_no_status === 'propose_site_no' && p.source !== 'customer_repeat'); },
    get propVisitMutuLabel() {
      if (!this.propModal.data?.id) return '-';
      const v = this.visits.find(x => Number(x.prospect_id) === Number(this.propModal.data.id));
      if (!v?.mutu_id) return 'Belum ada mutu dari Visit';
      const m = this.mutuList.find(x => Number(x.id) === Number(v.mutu_id));
      return m ? `${m.code} — ${m.name}` : '-';
    },
    get editPropVisitMutuLabel() {
      if (!this.editPropModal.prospectId) return '-';
      const v = this.visits.find(x => Number(x.prospect_id) === Number(this.editPropModal.prospectId));
      if (!v?.mutu_id) return 'Belum ada mutu dari Visit';
      const m = this.mutuList.find(x => Number(x.id) === Number(v.mutu_id));
      return m ? `${m.code} — ${m.name}` : '-';
    },

    openPropose(p) {
      this.propModal = { show: true, data: p };
      this.propForm = { site_no: '', po_no: '', qty_po: 0, mutu: [], plant_ids: [] };
    },
    async savePropose() {
      if (!this.propForm.site_no || !this.propForm.po_no || !this.propForm.qty_po || this.propForm.mutu.length === 0) {
        this.toastMsg('Lengkapi Site No, PO No, Qty PO, dan Mutu', 'error'); return;
      }
      const p = this.propModal.data;
      const newPropose = {
        prospect_id: p.id, project_name: p.project_name,
        address: p.address, pic_project: p.pic_name, pic_contact: p.pic_contact,
        sales_visit_id: p.sales_visit_id, site_no: this.propForm.site_no,
        po_no: this.propForm.po_no,
        qty_po: Number(this.propForm.qty_po) || 0,
        mutu: this.propForm.mutu.map(Number),
        plant_ids: (this.propForm.plant_ids || []).map(Number),
        status: 'complete', created_by: this.currentUser?.id,
        created_at: new Date().toISOString(),
      };
      try {
        await DB.insert('propose', newPropose);
        await DB.update('prospects', p.id, {
          site_no: this.propForm.site_no,
          po_no: this.propForm.po_no,
          qty_po: Number(this.propForm.qty_po) || 0,
          site_no_status: 'complete',
          site_no_completed_at: new Date().toISOString(),
        });
        await this.reload();
        this.propModal.show = false;
        this.toastMsg('Site No ' + this.propForm.site_no + ' disetujui (Qty PO: ' + this.fmt(this.propForm.qty_po) + ' m³)');
      } catch (e) { this.toastMsg('Gagal simpan propose: ' + (e?.message || e), 'error'); }
    },

    openEditPropose(p) {
      const pr = this.propose.find(x => Number(x.prospect_id) === Number(p.id));
      this.editPropModal = { show: true, prospectId: p.id, project_name: p.project_name, address: p.address };
      this.editPropForm = {
        site_no: p.site_no || (pr?.site_no || ''),
        po_no: p.po_no || (pr?.po_no || ''),
        qty_po: Number(p.qty_po || pr?.qty_po || 0),
        mutu: (pr?.mutu || []).map(Number),
        plant_ids: (pr?.plant_ids || []).map(Number),
      };
    },
    async saveEditPropose() {
      if (!this.editPropForm.site_no || !this.editPropForm.po_no || !this.editPropForm.qty_po) {
        this.toastMsg('Site No, PO No, dan Qty PO wajib diisi', 'error'); return;
      }
      const pId = this.editPropModal.prospectId;
      const p = this.prospects.find(x => Number(x.id) === Number(pId));
      if (!p) return;
      try {
        await DB.update('prospects', pId, {
          site_no: this.editPropForm.site_no,
          po_no: this.editPropForm.po_no,
          qty_po: Number(this.editPropForm.qty_po) || 0,
        });
        const existing = this.propose.find(x => Number(x.prospect_id) === Number(pId));
        const payload = {
          prospect_id: pId,
          project_name: p.project_name, address: p.address,
          pic_project: p.pic_name, pic_contact: p.pic_contact,
          sales_visit_id: p.sales_visit_id,
          site_no: this.editPropForm.site_no, po_no: this.editPropForm.po_no,
          qty_po: Number(this.editPropForm.qty_po) || 0,
          mutu: this.editPropForm.mutu.map(Number),
          plant_ids: this.editPropForm.plant_ids.map(Number),
          status: 'complete',
          created_by: this.currentUser?.id,
          created_at: new Date().toISOString(),
        };
        if (existing) {
          await DB.update('propose', existing.id, { ...payload, updated_at: new Date().toISOString() });
        } else {
          await DB.insert('propose', payload);
        }
        await this.reload();
        this.editPropModal.show = false;
        this.toastMsg('Site No berhasil diupdate');
      } catch (e) { this.toastMsg('Gagal update propose: ' + (e?.message || e), 'error'); }
    },

    async toggleHoldSite(p) {
      if (!this.currentUser || this.currentUser.role !== 'owner') {
        this.toastMsg('Hanya Owner yang bisa Hold/Release', 'error'); return;
      }
      if (p.site_no_status === 'complete') {
        const reason = prompt('Alasan HOLD Site No ' + (p.site_no || '') + '?\n\nSales tidak akan bisa input order / jadwal cor untuk site ini.');
        if (!reason || !reason.trim()) { this.toastMsg('Alasan hold wajib diisi', 'error'); return; }
        try {
          await DB.update('prospects', p.id, {
            site_no_status: 'held',
            hold_reason: reason.trim(),
            held_at: new Date().toISOString(),
            held_by: this.currentUser.id,
          });
          await this.reload();
          this.toastMsg('Site No ' + p.site_no + ' di-HOLD');
        } catch (e) { this.toastMsg('Gagal hold site: ' + (e?.message || e), 'error'); }
      } else if (p.site_no_status === 'held') {
        if (!confirm('Release Site No ' + p.site_no + '?\nSales bisa input order kembali.')) return;
        try {
          await DB.update('prospects', p.id, {
            site_no_status: 'complete',
            hold_reason: '',
            released_at: new Date().toISOString(),
          });
          await this.reload();
          this.toastMsg('Site No ' + p.site_no + ' di-Release');
        } catch (e) { this.toastMsg('Gagal release site: ' + (e?.message || e), 'error'); }
      }
    },

    /* ─────────── USER MANAGEMENT ─────────── */
    openEditUser(u) {
      this.editUserModal = { show: true, userId: u.id };
      this.euForm = {
        username: u.username || '', name: u.name || '', email: u.email || '',
        password: u.password || '', role: u.role || 'sales',
        plant_id: u.plant_id || '',
        assigned_sites: Array.isArray(u.assigned_sites) ? [...u.assigned_sites] : [],
        is_active: u.is_active !== false, avatar: u.avatar || null,
      };
      this.showEditUserPw = false;
    },
    async saveEditUser() {
      const uid = (this.euForm.username || '').trim().toLowerCase();
      if (!uid || !/^[a-z0-9_.\-]+$/.test(uid)) { this.toastMsg('User ID tidak valid', 'error'); return; }
      if (!this.euForm.name.trim()) { this.toastMsg('Nama wajib diisi', 'error'); return; }
      if ((this.euForm.password || '').length < 6) { this.toastMsg('Password minimal 6 karakter', 'error'); return; }
      if (this.users.find(x => Number(x.id) !== Number(this.editUserModal.userId) && (x.username || '').toLowerCase() === uid)) {
        this.toastMsg('User ID sudah dipakai', 'error'); return;
      }
      const mail = (this.euForm.email || '').trim().toLowerCase();
      if (mail && this.users.find(x => Number(x.id) !== Number(this.editUserModal.userId) && (x.email || '').toLowerCase() === mail)) {
        this.toastMsg('Email sudah dipakai', 'error'); return;
      }
      if (Number(this.editUserModal.userId) === Number(this.currentUser.id) && !this.euForm.is_active) {
        this.toastMsg('Tidak bisa nonaktifkan akun sendiri', 'error'); return;
      }
      try {
        await DB.update('users', this.editUserModal.userId, {
          username: uid, name: this.euForm.name, email: mail,
          password: this.euForm.password, role: this.euForm.role,
          plant_id: this.euForm.plant_id ? Number(this.euForm.plant_id) : null,
          assigned_sites: this.euForm.role === 'customer' ? (this.euForm.assigned_sites || []) : [],
          is_active: this.euForm.is_active,
        });
        await this.reload();
        if (Number(this.editUserModal.userId) === Number(this.currentUser.id)) {
          const updated = this.users.find(u => Number(u.id) === Number(this.editUserModal.userId));
          if (updated) {
            this.currentUser = updated;
            localStorage.setItem('beton_current', JSON.stringify(updated));
          }
        }
        this.editUserModal.show = false;
        this.toastMsg('User diupdate');
      } catch (e) { this.toastMsg('Gagal update user: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── MASTER DATA EDIT MODALS ─────────── */
    openEditPlant(p) { this.editPlantModal = { show: true, id: p.id }; this.epForm = { code: p.code || '', name: p.name || '', address: p.address || '', phone: p.phone || '' }; },
    async saveEditPlant() {
      try {
        await DB.update('plants', this.editPlantModal.id, { ...this.epForm });
        await this.reload();
        this.editPlantModal.show = false;
        this.toastMsg('Plant diupdate');
      } catch (e) { this.toastMsg('Gagal update plant: ' + (e?.message || e), 'error'); }
    },
    openEditMutu(m) { this.editMutuModal = { show: true, id: m.id }; this.emForm = { code: m.code || '', name: m.name || '', slump: m.slump || '', price: m.price || 0 }; },
    async saveEditMutu() {
      try {
        await DB.update('mutu', this.editMutuModal.id, { ...this.emForm });
        await this.reload();
        this.editMutuModal.show = false;
        this.toastMsg('Mutu diupdate');
      } catch (e) { this.toastMsg('Gagal update mutu: ' + (e?.message || e), 'error'); }
    },
    openEditCompetitor(c) { this.editKompetitorModal = { show: true, id: c.id }; this.ecForm = { name: c.name || '', address: c.address || '', contact_person: c.contact_person || '', phone: c.phone || '' }; },
    async saveEditKompetitor() {
      try {
        await DB.update('competitors', this.editKompetitorModal.id, { ...this.ecForm });
        await this.reload();
        this.editKompetitorModal.show = false;
        this.toastMsg('Kompetitor diupdate');
      } catch (e) { this.toastMsg('Gagal update kompetitor: ' + (e?.message || e), 'error'); }
    },
    openEditAddress(a) { this.editAlamatModal = { show: true, id: a.id }; this.eaForm = { label: a.label || '', address: a.address || '', city: a.city || '', province: a.province || '', type: a.type || 'site' }; },
    async saveEditAddress() {
      try {
        await DB.update('addresses', this.editAlamatModal.id, { ...this.eaForm });
        await this.reload();
        this.editAlamatModal.show = false;
        this.toastMsg('Alamat diupdate');
      } catch (e) { this.toastMsg('Gagal update alamat: ' + (e?.message || e), 'error'); }
    },

    /* ─────────── ADD (USER + MASTER) ─────────── */
    async addUser() {
      const uid      = (this.uForm.username || '').trim().toLowerCase();
      const mail     = (this.uForm.email || '').trim().toLowerCase();
      const name     = (this.uForm.name || '').trim();
      const password = this.uForm.password || '';

      if (!uid) { this.toastMsg('User ID wajib diisi', 'error'); return; }
      if (!/^[a-z0-9_.\-]+$/.test(uid)) { this.toastMsg('User ID hanya boleh huruf, angka, titik, underscore, strip', 'error'); return; }
      if (!name) { this.toastMsg('Nama wajib diisi', 'error'); return; }
      if (password.length < 6) { this.toastMsg('Password minimal 6 karakter', 'error'); return; }
      if (!this.uForm.role) { this.toastMsg('Role wajib dipilih', 'error'); return; }

      if (uid === String(this.getDeveloperAccount().username).toLowerCase()) { this.toastMsg('User ID ini dicadangkan untuk akun sistem', 'error'); return; }
      const validRoles = ['owner', 'admin', 'sales', 'logistik', 'customer'];
      if (!validRoles.includes(this.uForm.role)) { this.toastMsg('Role tidak valid', 'error'); return; }
      if (this.users.find(u => (u.username || '').toLowerCase() === uid)) { this.toastMsg('User ID sudah dipakai', 'error'); return; }
      if (mail && this.users.find(u => (u.email || '').toLowerCase() === mail)) { this.toastMsg('Email sudah dipakai', 'error'); return; }

      const newUser = {
        username: uid,
        name: name,
        email: mail,
        password: password,
        role: this.uForm.role,
        plant_id: this.uForm.plant_id ? Number(this.uForm.plant_id) : null,
        assigned_sites: this.uForm.role === 'customer' ? (this.uForm.assigned_sites || []) : [],
        is_active: true,
        permissions: this.defaultPermsFor(this.uForm.role).slice(),
      };
      try {
        await DB.insert('users', newUser);
        this.uForm = { username: '', name: '', email: '', password: '', role: '', plant_id: '', assigned_sites: [] };
        await this.reload();
        this.toastMsg('User "' + uid + '" berhasil ditambahkan. Akun dapat langsung login.');
      } catch (e) { this.toastMsg('Gagal tambah user: ' + (e?.message || e), 'error'); }
    },
    async delUser(id) {
      const target = this.users.find(u => Number(u.id) === Number(id));
      if (!target || target.role === 'developer') return;
      try {
        await DB.remove('users', id);
        await this.reload();
      } catch (e) { this.toastMsg('Gagal hapus user: ' + (e?.message || e), 'error'); }
    },
    async addPlant() {
      try {
        await DB.insert('plants', { ...this.plForm, is_active: 1 });
        this.plForm = { code: '', name: '', address: '', phone: '' };
        await this.reload();
        this.toastMsg('Plant ditambahkan');
      } catch (e) { this.toastMsg('Gagal tambah plant: ' + (e?.message || e), 'error'); }
    },
    async addMutu() {
      try {
        await DB.insert('mutu', { ...this.mForm, is_active: 1 });
        this.mForm = { code: '', name: '', slump: '', price: 0 };
        await this.reload();
        this.toastMsg('Mutu ditambahkan');
      } catch (e) { this.toastMsg('Gagal tambah mutu: ' + (e?.message || e), 'error'); }
    },
    async addCompetitor() {
      try {
        await DB.insert('competitors', { ...this.cForm });
        this.cForm = { name: '', address: '', contact_person: '', phone: '' };
        await this.reload();
        this.toastMsg('Kompetitor ditambahkan');
      } catch (e) { this.toastMsg('Gagal tambah kompetitor: ' + (e?.message || e), 'error'); }
    },
    async addAddress() {
      try {
        await DB.insert('addresses', { ...this.aForm });
        this.aForm = { label: '', address: '', city: '', province: '', type: 'site' };
        await this.reload();
        this.toastMsg('Alamat ditambahkan');
      } catch (e) { this.toastMsg('Gagal tambah alamat: ' + (e?.message || e), 'error'); }
    },
    async delItem(table, id) {
      if (!confirm('Hapus item ini?')) return;
      try {
        await DB.remove(table, id);
        await this.reload();
        this.toastMsg('Item dihapus');
      } catch (e) { this.toastMsg('Gagal hapus: ' + (e?.message || e), 'error'); }
    },
  };
}

// Ekspos global supaya Alpine bisa akses via x-data="app()"
window.app = app;
