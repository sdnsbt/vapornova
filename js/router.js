/* ═══ ROUTER — Navigation SPA ═══ */
/* DEAKTIVIERT - Website verwendet jetzt separate HTML-Dateien */

// Router ist deaktiviert, da die Website jetzt mit separaten HTML-Dateien arbeitet
// Alle Links zeigen direkt auf .html Dateien (boutique.html, blog.html, etc.)

window.addEventListener('DOMContentLoaded', () => {
  // Cacher modals au démarrage
  ['adminModal','adminLogin','cartOverlay','cartSidebar','productModal','mobileMenu'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('open');
    if(id==='cartOverlay'||id==='checkoutModal') el.style.display='none';
  });
  if(typeof applyAdsConfig === 'function') applyAdsConfig();
  if(typeof renderRevChart === 'function') renderRevChart();
  // Note: le rendu des pages est géré par page-init.js (avec DataSync.load)
});

// Dummy-Funktion für Kompatibilität
function showPage(name) {
  // Leite zu der entsprechenden HTML-Datei um
  const pages = {
    'home': 'index.html',
    'shop': 'boutique.html',
    'blog': 'blog.html',
    'contact': 'contact.html',
    'affiliate': 'affiliation.html'
  };
  if(pages[name]) window.location.href = pages[name];
}

function filterAndShow(cat) {
  window.location.href = 'boutique.html?filter=' + cat;
}
