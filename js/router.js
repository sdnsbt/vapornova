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

/* ═══ SEARCH TOGGLE — Lupe klappt auf ═══ */
function toggleSearch(inputId, wrapperId) {
  const input   = document.getElementById(inputId);
  const wrapper = document.getElementById(wrapperId);
  if (!input) return;

  const isOpen = input.style.opacity === '1';

  if (isOpen) {
    // Zuklappen
    input.style.width   = '0';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.value = '';
    // Reset search
    if (inputId === 'shopSearch'      && typeof searchShop      === 'function') searchShop('');
    if (inputId === 'affiliateSearch' && typeof searchAffiliate === 'function') searchAffiliate('');
  } else {
    // Aufklappen
    input.style.width        = '180px';
    input.style.opacity      = '1';
    input.style.pointerEvents = 'auto';
    // Suchfeld rechts vom Button — Button bleibt sichtbar links
    input.style.position     = 'relative';
    input.style.marginLeft   = '8px';
    setTimeout(() => input.focus(), 310);
  }
}

// Klick außerhalb schließt das Suchfeld
document.addEventListener('click', function(e) {
  ['shopSearchWrap','affiliateSearchWrap'].forEach(function(wId) {
    const w = document.getElementById(wId);
    if (!w) return;
    const inputId = wId === 'shopSearchWrap' ? 'shopSearch' : 'affiliateSearch';
    const input   = document.getElementById(inputId);
    if (!input || input.style.opacity !== '1') return;
    if (!w.contains(e.target)) {
      input.style.width        = '0';
      input.style.opacity      = '0';
      input.style.pointerEvents = 'none';
      input.value = '';
      if (inputId === 'shopSearch'      && typeof searchShop      === 'function') searchShop('');
      if (inputId === 'affiliateSearch' && typeof searchAffiliate === 'function') searchAffiliate('');
    }
  });
});
