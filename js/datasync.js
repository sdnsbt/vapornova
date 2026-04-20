/* ═══════════════════════════════════════════════════════
   DATASYNC.JS — Synchronisation data.json ↔ mémoire
   ═══════════════════════════════════════════════════════
   Mode 1 : server.py local  → /api/data
   Mode 2 : GitHub Pages     → data.json (relatif)
   Mode 3 : Fallback         → localStorage
*/

const DataSync = (() => {
  const API_DATA   = '/api/data';
  const API_SAVE   = '/api/save';
  const LOCAL_JSON = 'data.json';
  let _serverAvailable = null;

  /* ── Teste si le serveur local (server.py) est disponible ── */
  async function checkServer() {
    if (_serverAvailable !== null) return _serverAvailable;
    try {
      const r = await fetch('/ping', { method: 'GET', signal: AbortSignal.timeout(2000) });
      const j = await r.json().catch(() => ({}));
      _serverAvailable = r.ok && j.server === 'VaporNova';
    } catch (e) {
      _serverAvailable = false;
    }
    console.info('[DataSync]', _serverAvailable ? '✅ server.py détecté' : '⚠️ Mode statique (GitHub Pages)');
    return _serverAvailable;
  }

  /* ── Injecte les données dans les variables globales ── */
  function _inject(d) {
    if (d.products  && Array.isArray(d.products))  { PRODUCTS           = d.products;  localStorage.setItem('vn_products',  JSON.stringify(d.products)); }
    if (d.affiliates && Array.isArray(d.affiliates)){ AFFILIATE_PRODUCTS = d.affiliates; localStorage.setItem('vn_affiliates', JSON.stringify(d.affiliates)); }
    if (d.blog      && Array.isArray(d.blog))       { BLOG_POSTS         = d.blog;       localStorage.setItem('vn_blog',       JSON.stringify(d.blog)); }
    if (d.orders    && Array.isArray(d.orders))     { ORDERS             = d.orders;     localStorage.setItem('vn_orders',     JSON.stringify(d.orders)); }
    if (d.settings) localStorage.setItem('vn_settings', JSON.stringify(d.settings));
  }

  /* ── Charge les données ── */
  async function load() {
    const hasServer = await checkServer();

    // Mode 1 : server.py local
    if (hasServer) {
      try {
        const r    = await fetch(API_DATA + '?t=' + Date.now());
        const json = await r.json();
        if (json.ok && json.data) {
          _inject(json.data);
          console.info('[DataSync] ✅ Données chargées depuis server.py');
          return true;
        }
      } catch (e) {
        console.warn('[DataSync] Erreur server.py:', e.message);
      }
    }

    // Mode 2 : GitHub Pages — fetch data.json relatif
    try {
      // Build correct path (works at root AND under /vapornova/)
      const base = window.location.pathname.replace(/\/[^\/]*$/, '/');
      const url  = base + LOCAL_JSON + '?t=' + Date.now();
      const r    = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        // data.json peut avoir .data ou être direct
        const payload = d.data || d;
        if (payload.products || payload.affiliates || payload.blog) {
          _inject(payload);
          console.info('[DataSync] ✅ Données chargées depuis data.json (GitHub Pages)');
          return true;
        }
      }
    } catch (e) {
      console.warn('[DataSync] Erreur data.json:', e.message);
    }

    // Mode 3 : localStorage uniquement
    console.info('[DataSync] Mode localStorage uniquement');
    return false;
  }

  /* ── Sauvegarde via server.py ── */
  async function save() {
    _serverAvailable = null;
    const hasServer = await checkServer();
    if (!hasServer) {
      _showSyncToast('⚠️ Serveur absent — localStorage uniquement', 'info');
      return false;
    }

    const payload = {
      products:   typeof PRODUCTS           !== 'undefined' ? PRODUCTS           : [],
      affiliates: typeof AFFILIATE_PRODUCTS !== 'undefined' ? AFFILIATE_PRODUCTS : [],
      blog:       typeof BLOG_POSTS         !== 'undefined' ? BLOG_POSTS         : [],
      orders:     typeof ORDERS             !== 'undefined' ? ORDERS             : [],
      settings:   JSON.parse(localStorage.getItem('vn_settings') || '{}'),
    };

    try {
      const r    = await fetch(API_SAVE, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const json = await r.json();
      if (json.ok) { _showSyncToast('✅ data.json sauvegardé', 'ok'); return true; }
      _showSyncToast('❌ ' + json.msg, 'error');
    } catch (e) {
      _showSyncToast('❌ Réseau: ' + e.message, 'error');
    }
    return false;
  }

  function _showSyncToast(msg, type) {
    let badge = document.getElementById('_datasync_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '_datasync_badge';
      badge.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:700;font-family:monospace;pointer-events:none;transition:opacity 0.4s;opacity:0;max-width:320px';
      document.body.appendChild(badge);
    }
    const colors = { ok:'background:#0d2b1a;border:1px solid #27ae60;color:#2ecc71', error:'background:#2b0d0d;border:1px solid #c0392b;color:#e74c3c', info:'background:#0d1a2b;border:1px solid #2980b9;color:#3498db' };
    badge.style.cssText += ';' + (colors[type] || colors.info);
    badge.textContent = msg;
    badge.style.opacity = '1';
    clearTimeout(badge._t);
    badge._t = setTimeout(() => { badge.style.opacity = '0'; }, 3500);
  }

  return { load, save, checkServer };
})();
