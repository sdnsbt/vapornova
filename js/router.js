/* ═══ ROUTER — Navigation ═══ */

// Detect base path (works both locally and on GitHub Pages /vapornova/)
const BASE = (function() {
  const p = window.location.pathname;
  const m = p.match(/^(\/[^/]+\/)/);
  // If running on GitHub Pages under a subpath (e.g. /vapornova/), use it
  // If running locally or at root, use empty string
  if (m && m[1] !== '/') return m[1];
  return '';
})();

window.addEventListener('DOMContentLoaded', () => {
  ['adminModal','adminLogin','cartOverlay','cartSidebar','productModal','mobileMenu'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('open');
    if(id==='cartOverlay'||id==='checkoutModal') el.style.display='none';
  });
  if(typeof applyAdsConfig === 'function') applyAdsConfig();
  if(typeof renderRevChart === 'function') renderRevChart();
});

function showPage(name) {
  const pages = {
    'home':      'index.html',
    'shop':      'boutique.html',
    'blog':      'blog.html',
    'contact':   'contact.html',
    'affiliate': 'affiliation.html'
  };
  if(pages[name]) window.location.href = BASE + pages[name];
}

function filterAndShow(cat) {
  window.location.href = BASE + 'boutique.html?filter=' + cat;
}
