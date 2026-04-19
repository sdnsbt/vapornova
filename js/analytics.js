/* ═══════════ KEYBOARD ═══════════ */
document.addEventListener('keydown', e => {
  if(e.key==='Enter' && document.activeElement===document.getElementById('trackCode')) chercher();
  if(e.key==='Escape') {
    ['productModal','zoomOverlay','mobileMenu'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('open');});
  }
  const _pm=document.getElementById('productModal');
  if(_pm && _pm.classList.contains('open')) {
    if(e.key==='ArrowLeft') navModalImg(-1);
    if(e.key==='ArrowRight') navModalImg(1);
  }
});


/* cursor natif */


/* ═══════════ ADSENSE STATS ═══════════ */
const ADS_HISTORY_KEY = 'vn_ads_history';
let adsChartRange = 7;

function getAdsHistory() {
  try { return JSON.parse(localStorage.getItem(ADS_HISTORY_KEY) || '[]'); } catch(e) { return []; }
}
function saveAdsHistory(data) {
  localStorage.setItem(ADS_HISTORY_KEY, JSON.stringify(data));
}

function saveAdsEntry() {
  const date  = document.getElementById('ads-entry-date').value;
  const rev   = parseFloat(document.getElementById('ads-entry-revenue').value);
  const impr  = parseInt(document.getElementById('ads-entry-impressions').value) || 0;
  const clicks= parseInt(document.getElementById('ads-entry-clicks').value) || 0;
  if(!date || isNaN(rev) || rev < 0) { toast('⚠️ Entrez une date et un revenu valide','⚠️'); return; }
  const history = getAdsHistory();
  const existing = history.findIndex(e => e.date === date);
  const entry = { date, rev, impr, clicks };
  if(existing > -1) { history[existing] = entry; } else { history.push(entry); }
  history.sort((a,b) => a.date.localeCompare(b.date));
  saveAdsHistory(history);
  // Clear fields
  document.getElementById('ads-entry-revenue').value = '';
  document.getElementById('ads-entry-impressions').value = '';
  document.getElementById('ads-entry-clicks').value = '';
  toast('✅ Revenus enregistrés');
  renderAdsStats();
}

function clearAdsHistory() {
  if(!confirm("Vider tout l'historique des revenus AdSense ?")) return;
  localStorage.removeItem(ADS_HISTORY_KEY);
  renderAdsStats();
  toast('🗑️ Historique effacé');
}

function setAdsChartRange(days) {
  adsChartRange = days;
  ['7','30','90'].forEach(d => {
    const btn = document.getElementById('ads-chart-'+d);
    if(btn) { btn.style.background = d == days ? 'var(--blue)' : ''; btn.style.color = d == days ? '#fff' : ''; }
  });
  renderAdsChart(getAdsHistory());
}

function renderAdsStats() {
  const history = getAdsHistory();
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const total  = history.reduce((s,e) => s + (e.rev||0), 0);
  const todayE = history.find(e => e.date === today);
  const monthE = history.filter(e => e.date.startsWith(thisMonth));
  const monthRev = monthE.reduce((s,e) => s + (e.rev||0), 0);
  const monthDays = monthE.length || 1;
  const totalClicks = history.reduce((s,e) => s + (e.clicks||0), 0);
  const totalImpr   = history.reduce((s,e) => s + (e.impr||0), 0);
  const ctr = totalImpr > 0 ? ((totalClicks/totalImpr)*100).toFixed(2) : '—';
  const cpm = totalImpr > 0 ? ((total/(totalImpr/1000))).toFixed(2) : '—';

  // Trend vs previous month
  const prevMonth = new Date(); prevMonth.setMonth(prevMonth.getMonth()-1);
  const prevMonthStr = prevMonth.toISOString().slice(0,7);
  const prevRev = history.filter(e=>e.date.startsWith(prevMonthStr)).reduce((s,e)=>s+(e.rev||0),0);
  const trendPct = prevRev > 0 ? (((monthRev - prevRev)/prevRev)*100).toFixed(0) : null;
  const trendStr = trendPct !== null ? (trendPct >= 0 ? `↑ +${trendPct}% vs mois dernier` : `↓ ${trendPct}% vs mois dernier`) : '→ Premier mois';

  function safe(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
  safe('ads-kpi-total',   total.toFixed(2) + ' €');
  safe('ads-kpi-trend',   trendStr);
  safe('ads-kpi-today',   todayE ? todayE.rev.toFixed(2)+' €' : '0.00 €');
  safe('ads-kpi-today-cpm', cpm !== '—' ? '→ CPM '+cpm+' €' : '→ CPM —');
  safe('ads-kpi-month',   monthRev.toFixed(2) + ' €');
  safe('ads-kpi-avg',     '→ Moy/j ' + (monthRev/monthDays).toFixed(2) + ' €');
  safe('ads-kpi-clicks',  totalClicks.toString());
  safe('ads-kpi-ctr',     ctr !== '—' ? '→ CTR '+ctr+'%' : '→ CTR —');

  // Dashboard main stat
  const dashRev = document.querySelector('.adm-stat-val[data-dash="ads-rev"]');
  if(dashRev) dashRev.textContent = total.toFixed(2) + ' €';

  renderAdsChart(history);
  renderAdsTable(history);

  // Pre-fill date with today
  const dateEl = document.getElementById('ads-entry-date');
  if(dateEl && !dateEl.value) dateEl.value = today;
}

function renderAdsChart(history) {
  const el = document.getElementById('ads-rev-chart');
  if(!el) return;
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - adsChartRange + 1);
  const filtered = history.filter(e => new Date(e.date) >= cutoff);
  if(!filtered.length) { el.innerHTML='<div style="color:#444;font-size:12px;text-align:center;width:100%;padding:40px 0">Aucune donnée — saisissez vos revenus ci-dessus</div>'; return; }
  const maxRev = Math.max(...filtered.map(e=>e.rev), 0.01);
  el.innerHTML = filtered.map(e => {
    const h = Math.max(8, Math.round((e.rev/maxRev)*140));
    const d = e.date.slice(5); // MM-DD
    const color = e.rev > 0 ? 'var(--gold2)' : '#333';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0" title="${e.date}: ${e.rev.toFixed(2)}€">
      <div style="font-size:9px;color:#666">${e.rev>0?e.rev.toFixed(2):''}</div>
      <div style="width:100%;background:${color};border-radius:4px 4px 0 0;height:${h}px;transition:height 0.3s"></div>
      <div style="font-size:8px;color:#555;white-space:nowrap;overflow:hidden;max-width:32px;text-align:center">${d}</div>
    </div>`;
  }).join('');
}

function renderAdsTable(history) {
  const el = document.getElementById('ads-history-table');
  if(!el) return;
  if(!history.length) { el.innerHTML='<div style="color:#555;font-size:13px;padding:20px;text-align:center">Aucun historique. Saisissez vos premiers revenus ci-dessus.</div>'; return; }
  const rows = [...history].reverse().slice(0,30).map(e => {
    const ctr = e.impr > 0 ? ((e.clicks/e.impr)*100).toFixed(2)+'%' : '—';
    const cpm = e.impr > 0 ? (e.rev/(e.impr/1000)).toFixed(2)+'€' : '—';
    return `<tr>
      <td style="padding:8px 10px;font-size:12px;color:#aaa">${e.date}</td>
      <td style="padding:8px 10px;font-size:13px;font-weight:700;color:var(--gold2)">${e.rev.toFixed(2)} €</td>
      <td style="padding:8px 10px;font-size:12px;color:#666">${e.impr.toLocaleString()}</td>
      <td style="padding:8px 10px;font-size:12px;color:#666">${e.clicks}</td>
      <td style="padding:8px 10px;font-size:12px;color:#666">${ctr}</td>
      <td style="padding:8px 10px;font-size:12px;color:#666">${cpm}</td>
      <td style="padding:8px 10px"><button onclick="deleteAdsEntry('${e.date}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:13px">🗑</button></td>
    </tr>`;
  }).join('');
  el.innerHTML = `<table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="border-bottom:1px solid var(--border)">
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">Date</th>
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">Revenus</th>
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">Impressions</th>
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">Clics</th>
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">CTR</th>
        <th style="padding:8px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#555;text-align:left">CPM</th>
        <th></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function deleteAdsEntry(date) {
  const history = getAdsHistory().filter(e => e.date !== date);
  saveAdsHistory(history);
  renderAdsStats();
  toast('🗑️ Entrée supprimée');
}

// Call renderAdsStats when ads tab is opened
const _origShowAdmTab = showAdmTab;
showAdmTab = function(name, el) {
  _origShowAdmTab(name, el);
  if(name === 'ads') {
    renderAdsStats();
    // Pre-fill adsenseId field
    const aidEl = document.getElementById('adsenseId');
    if(aidEl) aidEl.value = ADS_CONFIG.adsenseId || 'ca-pub-7479282629047694';
  }
};

/* ═══════════ LIVE PREVIEW — mise à jour immédiate ═══════════ */
(function() {
  // Debounce helper — évite trop d'appels pendant la frappe
  function debounce(fn, ms) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // Reconstruction d'un produit depuis le formulaire admin et refresh de la boutique
  window.liveRefreshProduct = function liveRefreshProduct() {
    const nameEl  = document.getElementById('pf-name');
    const priceEl = document.getElementById('pf-price');
    if(!nameEl || !priceEl) return;

    const name  = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    if(!name || !price || isNaN(price)) return; // pas encore complet

    // Construire un objet temporaire pour la preview
    const images = (typeof pfImages !== 'undefined' && pfImages.length)
      ? pfImages.map(x => x.src).filter(Boolean)
      : [];
    const img = images[0] || '';

    const tempProd = {
      id: (typeof editingProductId !== 'undefined' && editingProductId) ? editingProductId : '__preview__',
      name,
      brand: '',
      cat:   (document.getElementById('pf-cat')  || {}).value || 'kit',
      price,
      old:   parseFloat((document.getElementById('pf-old') || {}).value) || null,
      img,
      images,
      desc:  (document.getElementById('pf-desc') || {}).value || name,
      badge: (document.getElementById('pf-badge') || {}).value || null,
      stars: parseInt((document.getElementById('pf-stars') || {}).value) || 5,
      reviews: 0,
      sizes:  ['XS','S','M','L','XL'],
      colors: ['#1e90ff','#4dabff','#06080f'],
      specs:  [],
      affiliate: (document.getElementById('pf-affiliate') || {}).value || null,
    };

    // Mettre à jour PRODUCTS en mémoire (sans toucher localStorage)
    if(typeof editingProductId !== 'undefined' && editingProductId) {
      const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
      if(idx > -1) {
        const merged = Object.assign({}, PRODUCTS[idx], tempProd);
        PRODUCTS[idx] = merged;
      }
    }
    // Re-render boutique et featured sans sauvegarder
    if(typeof renderShop === 'function')    renderShop();
    if(typeof renderFeatured === 'function') renderFeatured();
    if(typeof renderProductsTable === 'function') renderProductsTable();
  }

  // Reconstruction d'un article blog depuis le formulaire et refresh grille
  function liveRefreshBlog() {
    const titleEl = document.getElementById('bf-title');
    if(!titleEl || !titleEl.value.trim()) return;
    if(typeof renderBlogGrid === 'function')  renderBlogGrid();
    if(typeof renderHomeBlog === 'function')  renderHomeBlog();
  }

  // Listener produit — debounce 300ms pour la frappe, immédiat pour select/checkbox
  const debouncedProd = debounce(liveRefreshProduct, 300);
  const debouncedBlog = debounce(liveRefreshBlog, 300);

  document.addEventListener('input', function(e) {
    const id = e.target.id || '';
    if(id.startsWith('pf-')) debouncedProd();
    if(id.startsWith('bf-')) debouncedBlog();
  });

  document.addEventListener('change', function(e) {
    const id = e.target.id || '';
    // Immédiat pour les selects/checkboxes
    if(id.startsWith('pf-')) liveRefreshProduct();
    if(id.startsWith('bf-')) liveRefreshBlog();
  });
})();

