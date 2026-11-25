// ═══════════════════════════════════════════════════════════════
// js/constants.js
// ALVEND Readymix Management — Konstanta Global
// ✅ FIX: ALL_MENUS & defaultPermsFor konsisten dengan app.js
// ═══════════════════════════════════════════════════════════════

// ── Akun default developer (offline fallback) ─────────────────
const DEVELOPER_DEFAULT_ACCOUNT = {
  username: 'developer',
  password: 'dev12345',
  name: 'Developer',
  role: 'developer',
};

// ═══════════════════════════════════════════════════════════════
// DAFTAR MENU GLOBAL
// Harus SINKRON dengan:
//   - app.js → allMenus, menuGroups, DASHBOARD_GROUP
//   - index.html → sidebar (x-show="hasAccess('...')")
// ═══════════════════════════════════════════════════════════════
const ALL_MENUS = [
  'dashboard',
  'inputProspek',
  'dataProspek',
  'inputOrder',
  'orderSearch',
  'marketing',
  'jadwal',
  'afterDelivery',
];

// ═══════════════════════════════════════════════════════════════
// MENU REGISTRY (untuk Kelola Hak Akses)
// label = teks tampil, icon = class FontAwesome
// ═══════════════════════════════════════════════════════════════
const MENU_REGISTRY = [
  { key: 'dashboard',     label: 'Dashboard',         icon: 'fa-solid fa-gauge-high' },
  { key: 'inputProspek',  label: 'Input Prospek',     icon: 'fa-solid fa-plus-circle' },
  { key: 'dataProspek',   label: 'Data Prospek',      icon: 'fa-solid fa-list' },
  { key: 'inputOrder',    label: 'Input Order',       icon: 'fa-solid fa-cart-plus' },
  { key: 'orderSearch',   label: 'Order Search',      icon: 'fa-solid fa-magnifying-glass' },
  { key: 'marketing',     label: 'Marketing',         icon: 'fa-solid fa-chart-line' },
  { key: 'jadwal',        label: 'Jadwal Pengecoran', icon: 'fa-solid fa-calendar-days' },
  { key: 'afterDelivery', label: 'After Delivery',    icon: 'fa-solid fa-truck-fast' },
];

// ═══════════════════════════════════════════════════════════════
// MENU GROUPS (untuk modal Kelola Hak Akses — dikelompokkan)
// ═══════════════════════════════════════════════════════════════
const MENU_GROUPS = [
  {
    group: 'Utama',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
    ],
  },
  {
    group: 'Prospek',
    items: [
      { key: 'inputProspek', label: 'Input Prospek', icon: 'fa-solid fa-plus-circle' },
      { key: 'dataProspek',  label: 'Data Prospek',  icon: 'fa-solid fa-list' },
    ],
  },
  {
    group: 'Order',
    items: [
      { key: 'inputOrder',  label: 'Input Order',  icon: 'fa-solid fa-cart-plus' },
      { key: 'orderSearch', label: 'Order Search', icon: 'fa-solid fa-magnifying-glass' },
      { key: 'marketing',   label: 'Marketing',    icon: 'fa-solid fa-chart-line' },
    ],
  },
  {
    group: 'Pengiriman',
    items: [
      { key: 'jadwal',        label: 'Jadwal Pengecoran', icon: 'fa-solid fa-calendar-days' },
      { key: 'afterDelivery', label: 'After Delivery',    icon: 'fa-solid fa-truck-fast' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// GRUP DASHBOARD (container)
// Menu-menu ini dirender DI DALAM wrapper <template x-if="hasAccess('dashboard')">
// di index.html. Jadi kalau 'dashboard' di-uncheck owner tapi menu lain
// masih terceklis, wrapper tetap harus terbuka.
//
// Aturan: hasAccess('dashboard') = true jika user punya MINIMAL SATU
// menu di grup ini.
// ═══════════════════════════════════════════════════════════════
const DASHBOARD_GROUP = [
  'dashboard',
  'inputProspek',
  'dataProspek',
  'inputOrder',
  'orderSearch',
  'marketing',
  'jadwal',
  'afterDelivery',
];

// ═══════════════════════════════════════════════════════════════
// DEFAULT PERMISSIONS PER ROLE
// Dipakai sebagai fallback jika kolom `permissions` di tabel users
// kosong / null. JANGAN sampai kosong untuk role yang seharusnya
// punya akses.
// ═══════════════════════════════════════════════════════════════
function defaultPermsFor(role) {
  switch (role) {
    case 'owner':
    case 'developer':
      // Full access ke semua menu
      return [...ALL_MENUS];

    case 'admin':
      return [
        'dashboard',
        'inputProspek', 'dataProspek',
        'inputOrder', 'orderSearch', 'marketing',
        'jadwal', 'afterDelivery',
      ];

    case 'sales':
      return [
        'dashboard',
        'inputProspek', 'dataProspek',
        'inputOrder', 'orderSearch', 'marketing',
        'jadwal',
      ];

    case 'logistik':
      return [
        'dashboard',
        'jadwal', 'afterDelivery',
      ];

    case 'customer':
      // Customer hanya lihat jadwal pengecoran miliknya
      return ['jadwal'];

    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// LABEL HELPER (opsional — dipakai modal Kelola Hak Akses)
// ═══════════════════════════════════════════════════════════════
function menuLabel(key) {
  const m = MENU_REGISTRY.find(x => x.key === key);
  return m ? m.label : key;
}

function menuIcon(key) {
  const m = MENU_REGISTRY.find(x => x.key === key);
  return m ? m.icon : 'fa-solid fa-circle';
}
