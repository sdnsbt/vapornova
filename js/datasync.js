/* ═══════════════════════════════════════════════════════
   DATASYNC.JS — Synchronisation data.json ↔ mémoire
   ═══════════════════════════════════════════════════════
   - Au chargement : fetch('/api/data') → remplace localStorage + variables globales
   - À chaque save admin : POST '/api/save' → écrit data.json côté serveur
   - Fallback : si serveur absent → localStorage uniquement (mode statique)
*/

const DataSync = (() => {
  const API_DATA = '/api/data';
  const API_SAVE = '/api/save';
  let _serverAvailable = null; // null=inconnu, true, false

  /* ── Teste si le serveur Node/Python est disponible ── */
  async function checkServer() {
    if (_serverAvailable !== null) return _serverAvailable;
    console.log('[DataSync] 🔍 Vérification serveur VaporNova (/ping)...');
    try {
      const r = await fetch('/ping', { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (!r.ok) {
        _serverAvailable = false;
        console.warn('[DataSync] ⚠️ /ping HTTP', r.status, '— mode localStorage');
        return false;
      }
      const j = await r.json();
      if (j.server === 'VaporNova') {
        _serverAvailable = true;
        console.info('[DataSync] ✅ server.py VaporNova détecté — data.json activé');
      } else {
        _serverAvailable = false;
        console.warn('[DataSync] ⚠️ Serveur inconnu (pas server.py) — mode localStorage');
      }
    } catch (e) {
      _serverAvailable = false;
      console.warn('[DataSync] ⚠️ Serveur inaccessible (' + e.message + ') — mode localStorage');
    }
    return _serverAvailable;
  }

  /* ── Charge les données depuis data.json et injecte dans les variables globales ── */
  async function load() {
    const hasServer = await checkServer();
    if (!hasServer) {
      console.info('[DataSync] Serveur absent — mode localStorage uniquement');
      return false;
    }
    try {
      const r    = await fetch(API_DATA + '?t=' + Date.now());
      const json = await r.json();
      if (!json.ok || !json.data) return false;
      const d = json.data;

      /* Injecter dans les variables globales AVANT le rendu */
      if (d.products  && Array.isArray(d.products))  { PRODUCTS          = d.products;  localStorage.setItem('vn_products',  JSON.stringify(d.products)); }
      if (d.affiliates && Array.isArray(d.affiliates)){ AFFILIATE_PRODUCTS = d.affiliates; localStorage.setItem('vn_affiliates', JSON.stringify(d.affiliates)); }
      if (d.blog      && Array.isArray(d.blog))       { BLOG_POSTS         = d.blog;       localStorage.setItem('vn_blog',       JSON.stringify(d.blog)); }
      if (d.orders    && Array.isArray(d.orders))     { ORDERS             = d.orders;     localStorage.setItem('vn_orders',     JSON.stringify(d.orders)); }
      if (d.settings) localStorage.setItem('vn_settings', JSON.stringify(d.settings));

      console.info('[DataSync] ✅ Données chargées depuis data.json');
      return true;
    } catch (err) {
      console.warn('[DataSync] Erreur chargement:', err.message);
      return false;
    }
  }

  /* ── Sauvegarde toutes les données dans data.json ── */
  async function save() {
    console.group('[DataSync] 💾 Sauvegarde data.json...');

    // 1. Vérifier serveur (forcer re-check à chaque save)
    _serverAvailable = null;
    const hasServer = await checkServer();
    if (!hasServer) {
      console.warn('[DataSync] ⚠️ Serveur non disponible — données sauvegardées uniquement dans localStorage');
      console.groupEnd();
      return false;
    }
    console.log('[DataSync] ✅ Serveur disponible →', API_SAVE);

    // 2. Construire le payload
    const payload = {
      products:   typeof PRODUCTS !== 'undefined'           ? PRODUCTS           : [],
      affiliates: typeof AFFILIATE_PRODUCTS !== 'undefined' ? AFFILIATE_PRODUCTS : [],
      blog:       typeof BLOG_POSTS !== 'undefined'         ? BLOG_POSTS         : [],
      orders:     typeof ORDERS !== 'undefined'             ? ORDERS             : [],
      settings:   JSON.parse(localStorage.getItem('vn_settings') || '{}'),
    };
    console.log('[DataSync] 📦 Payload:', {
      produits:   payload.products.length,
      affilies:   payload.affiliates.length,
      articles:   payload.blog.length,
      commandes:  payload.orders.length,
    });

    // 3. Envoyer
    try {
      const r = await fetch(API_SAVE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      console.log('[DataSync] 📡 Réponse HTTP:', r.status, r.statusText);

      if (!r.ok) {
        console.error('[DataSync] ❌ Erreur HTTP', r.status);
        _showSyncToast('❌ Erreur serveur HTTP ' + r.status, 'error');
        console.groupEnd();
        return false;
      }

      const json = await r.json();
      console.log('[DataSync] 📄 Réponse JSON:', json);

      if (json.ok) {
        console.info('[DataSync] ✅ data.json sauvegardé avec succès —', json.msg);
        _showSyncToast('✅ data.json sauvegardé', 'ok');
        console.groupEnd();
        return true;
      }

      console.error('[DataSync] ❌ Erreur serveur:', json.msg);
      _showSyncToast('❌ ' + json.msg, 'error');
      console.groupEnd();
      return false;

    } catch (err) {
      console.error('[DataSync] ❌ Exception réseau:', err.name, err.message);
      _showSyncToast('❌ Réseau: ' + err.message, 'error');
      console.groupEnd();
      return false;
    }
  }

  /* ── Affiche un indicateur visuel de sync dans la page ── */
  function _showSyncToast(msg, type) {
    // Badge flottant en haut à droite
    let badge = document.getElementById('_datasync_badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = '_datasync_badge';
      badge.style.cssText = [
        'position:fixed', 'top:16px', 'right:16px', 'z-index:99999',
        'padding:8px 14px', 'border-radius:8px', 'font-size:12px',
        'font-weight:700', 'font-family:monospace', 'pointer-events:none',
        'transition:opacity 0.4s', 'opacity:0', 'max-width:320px'
      ].join(';');
      document.body.appendChild(badge);
    }
    const colors = {
      ok:    'background:#0d2b1a;border:1px solid #27ae60;color:#2ecc71',
      error: 'background:#2b0d0d;border:1px solid #c0392b;color:#e74c3c',
      info:  'background:#0d1a2b;border:1px solid #2980b9;color:#3498db',
    };
    badge.style.cssText += ';' + (colors[type] || colors.info);
    badge.textContent = msg;
    badge.style.opacity = '1';
    clearTimeout(badge._t);
    badge._t = setTimeout(() => { badge.style.opacity = '0'; }, 3500);
  }

  return { load, save, checkServer };
})();
