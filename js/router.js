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

/* ═══ WHATSAPP FLOATING BUTTON ═══ */
(function() {
  const settings = JSON.parse(localStorage.getItem('vn_settings') || '{}');
  const waNumber = (settings.whatsapp || settings.wa || '').replace(/\D/g, '');
  if (!waNumber) return;

  const btn = document.createElement('a');
  btn.id   = 'wa-float-btn';
  btn.href = `https://wa.me/${waNumber}`;
  btn.target = '_blank';
  btn.rel  = 'noopener noreferrer';
  btn.title = 'Contactez-nous sur WhatsApp';
  btn.style.cssText = [
    'position:fixed', 'bottom:28px', 'left:24px', 'z-index:9998',
    'width:56px', 'height:56px', 'border-radius:50%',
    'background:linear-gradient(135deg,#25d366,#128c7e)',
    'display:flex', 'align-items:center', 'justify-content:center',
    'box-shadow:0 4px 20px rgba(37,211,102,0.4)',
    'transition:transform 0.2s,box-shadow 0.2s',
    'text-decoration:none'
  ].join(';');
  btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>`;
  btn.addEventListener('mouseenter', () => {
    btn.style.transform  = 'scale(1.1)';
    btn.style.boxShadow  = '0 6px 28px rgba(37,211,102,0.55)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform  = 'scale(1)';
    btn.style.boxShadow  = '0 4px 20px rgba(37,211,102,0.4)';
  });
  document.body.appendChild(btn);
})();

/* ═══ CONTACT FORM FUNCTIONS ═══ */
function sendContactWhatsApp() {
  const name    = (document.getElementById('cf-name')?.value||'').trim();
  const email   = (document.getElementById('cf-email')?.value||'').trim();
  const subject = (document.getElementById('cf-subject')?.value||'');
  const message = (document.getElementById('cf-message')?.value||'').trim();
  if (!name || !message) { if(typeof toast==='function') toast('⚠️ Remplissez au moins votre nom et message','⚠️'); return; }
  const settings  = JSON.parse(localStorage.getItem('vn_settings')||'{}');
  const waNumber  = (settings.whatsapp||settings.wa||'').replace(/\D/g,'');
  if (!waNumber) { if(typeof toast==='function') toast('⚠️ Numéro WhatsApp non configuré dans l\'admin','⚠️'); return; }
  const text = `*VaporNova — Contact*\n👤 ${name}${email?' ('+email+')':''}\n📌 Sujet: ${subject}\n\n${message}`;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
}

function sendContactEmail() {
  const name    = (document.getElementById('cf-name')?.value||'').trim();
  const email   = (document.getElementById('cf-email')?.value||'').trim();
  const subject = (document.getElementById('cf-subject')?.value||'');
  const message = (document.getElementById('cf-message')?.value||'').trim();
  if (!name || !message) { if(typeof toast==='function') toast('⚠️ Remplissez au moins votre nom et message','⚠️'); return; }
  const settings  = JSON.parse(localStorage.getItem('vn_settings')||'{}');
  const toEmail   = settings.email || 'sdn.sebti@gmail.com';
  const body      = `Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\n${message}`;
  window.location.href = `mailto:${toEmail}?subject=${encodeURIComponent('[VaporNova] '+subject)}&body=${encodeURIComponent(body)}`;
}
