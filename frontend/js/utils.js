/* =====================================================
   UTILS — Helper functions
   ===================================================== */

const todayISO = () => new Date().toISOString().slice(0, 10);

// Ekspos global
window.todayISO = todayISO;
