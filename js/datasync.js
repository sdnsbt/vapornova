/* ═══════════════════════════════════════════════════════
   DATASYNC.JS — Synchronisation data.json ↔ mémoire
   Mode 1 : server.py local  → /api/data
   Mode 2 : GitHub Pages     → data.json (même dossier)
   Mode 3 : Fallback         → localStorage
*/

const DataSync = (() => {
  const API_DATA   = '/api/data';
  const API_SAVE   = '/api/save';
  let _serverAvailable = null;

  async function checkServer() {
    if (_serverAvailable !== null) return _serverAvailable;
    try {
      const r = await fetch('/ping', { method:'GET', signal:AbortSignal.timeout(2000) });
      const j = await r.json().catch(() => ({}));
      _serverAvailable = r.ok && j.server === 'VaporNova';
    } catch (e) {
      _serverAvailable = false;
    }
    console.info('[DataSync]', _serverAvailable ? '✅ server.py détecté' : '⚠️ Mode statique (GitHub Pages)');
    return _serverAvailable;
  }

  function _inject(d) {
    if (d.products   && Array.isArray(d.products))  { PRODUCTS           = d.products;   localStorage.setItem('vn_products',   JSON.stringify(d.products)); }
    if (d.affiliates && Array.isArray(d.affiliates)) { AFFILIATE_PRODUCTS = d.affiliates; localStorage.setItem('vn_affiliates', JSON.stringify(d.affiliates)); }
    if (d.blog       && Array.isArray(d.blog))       { BLOG_POSTS         = d.blog;       localStorage.setItem('vn_blog',       JSON.stringify(d.blog)); }
    if (d.orders     && Array.isArray(d.orders))     { ORDERS             = d.orders;     localStorage.setItem('vn_orders',     JSON.stringify(d.orders)); }
    if (d.settings) localStorage.setItem('vn_settings', JSON.stringify(d.settings));
  }

  async function load() {
    // ── Mode 1 : server.py local ──────────────────────────────────
    const hasServer = await checkServer();
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

    // ── Mode 2 : GitHub Pages — data.json dans le même dossier ────
    // On utilise une URL relative simple, sans manipuler pathname
    const dataUrls = [
      'data.json',                    // même dossier (fonctionne pour toutes les pages)
      './data.json',                  // explicitement relatif
      window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + 'data.json'
    ];

    for (const url of dataUrls) {
      try {
        const r = await fetch(url + '?t=' + Date.now());
        if (!r.ok) continue;
        const d = await r.json();
        // Supporte {data:{...}} (server.py) et {...} direct (GitHub)
        const payload = (d && d.data) ? d.data : d;
        if (payload && (payload.products || payload.affiliates || payload.blog)) {
          _inject(payload);
          console.info('[DataSync] ✅ Données chargées depuis', url);
          return true;
        }
      } catch (e) {
        console.warn('[DataSync] Échec', url, ':', e.message);
      }
    }

    // ── Mode 3 : localStorage uniquement ──────────────────────────
    console.info('[DataSync] ⚠️ Mode localStorage uniquement');
    return false;
  }

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
