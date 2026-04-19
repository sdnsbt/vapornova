/* ═══════════ CONTACT ═══════════ */
function sendContact() {
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value;
  const msg = document.getElementById('cf-msg').value.trim();
  if(!name||!email||!msg) { toast('Remplissez tous les champs','⚠️'); return; }
  const wa = localStorage.getItem('vn_settings') ? JSON.parse(localStorage.getItem('vn_settings')).wa || '491729092941' : '491729092941';
  const text = `👗 *VaporNova — Contact*\n\n👤 ${name}\n📧 ${email}\n📋 ${subject}\n\n💬 ${msg}`;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
  toast('Message envoyé ! Nous vous répondrons sous 24h ✅');
}

/* ═══════════ MOBILE MENU ═══════════ */
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function toggleMobile() { toggleMobileMenu(); }
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}


/* ═══════════ NORMALIZE PRODUCT ═══════════ */
function normalizeProduct(p) {
  const imgs = p.images && p.images.length ? p.images : (p.img ? [p.img] : []);
  const thumbs = p.thumbs && p.thumbs.length ? p.thumbs : imgs.map(s => s); // fallback: full src
  return {
    id: p.id || Date.now(),
    name: p.name || 'Produit',
    brand: p.brand || '',
    cat: p.cat || 'kit',
    price: p.price || 0,
    old: p.old || null,
    img: p.img || imgs[0] || '',
    images: imgs,
    thumbs: thumbs,
    desc: p.desc || '',
    badge: p.badge || null,
    stars: p.stars || 5,
    reviews: p.reviews || Math.floor(Math.random()*50)+5,
    sizes: (p.sizes && p.sizes.length) ? p.sizes : ['XS','S','M','L','XL','XXL'],
    colors: (p.colors && p.colors.length) ? p.colors : ['#1e90ff','#4dabff','#0a5aaa'],
    specs: p.specs || [],
    affiliate: p.affiliate || null,
    affiliatedProducts: p.affiliatedProducts || []
  };
}

/* ═══════════ SAVE BANNER ═══════════ */
let _bannerTimer = null;
function showSaveBanner(category, message) {
  // Toujours afficher le toast même si le banner HTML est absent
  toast('✅ ' + category + ' — ' + message);
  const banner = document.getElementById('saveBanner');
  if(!banner) return;
  const prog = document.getElementById('saveBannerProgress');
  const catEl = document.getElementById('sbCategory');
  const msgEl = document.getElementById('sbMessage');
  const timeEl = document.getElementById('sbTime');
  if(catEl) catEl.textContent = category;
  if(msgEl) msgEl.textContent = message;
  if(timeEl) timeEl.textContent = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  banner.classList.add('show');
  if(prog) { prog.classList.remove('running'); void prog.offsetWidth; prog.classList.add('running'); }
  clearTimeout(_bannerTimer);
  _bannerTimer = setTimeout(() => banner.classList.remove('show'), 3500);
}
function closeSaveBanner() {
  const banner = document.getElementById('saveBanner');
  if(banner) banner.classList.remove('show');
  clearTimeout(_bannerTimer);
}

/* ═══════════ TOAST ═══════════ */
function toast(msg, icon='✅') {
  const t = document.getElementById('toast');
  if(!t) { console.warn('Toast:', msg); return; }
  t.textContent = (icon==='✅'?'':icon+' ')+msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

/* ═══════════ ADS CONFIG ═══════════ */
const ADS_DEFAULTS = { adsenseId:'ca-pub-7479282629047694', strategy:'blog_heavy', home_top:true, between_products:false, footer:false, blog_top:true, blog_bottom:true };
let ADS_CONFIG = Object.assign({}, ADS_DEFAULTS, JSON.parse(localStorage.getItem('vn_ads')||'{}'));

function applyAdsConfig() {
  const zones = {
    'ad-home_top': ADS_CONFIG.home_top,
    'ad-between_products': ADS_CONFIG.between_products,
    'ad-footer': ADS_CONFIG.footer,
    'ad-blog_top': ADS_CONFIG.blog_top,
    'ad-blog_bottom': ADS_CONFIG.blog_bottom,
  };
  const pubId = ADS_CONFIG.adsenseId || ADS_DEFAULTS.adsenseId;
  Object.entries(zones).forEach(([id, active]) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.toggle('hidden', !active);
    if(active) {
      // Update data-ad-client on existing ins elements
      el.querySelectorAll('ins.adsbygoogle').forEach(ins => {
        ins.setAttribute('data-ad-client', pubId);
        if(!ins.dataset.adsbygoogleStatus) {
          try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e){}
        }
      });
    }
  });
  // Update active zones count in dashboard
  const activeCount = Object.values(zones).filter(Boolean).length;
  const dashEl = document.querySelector('.adm-stat-val[data-dash="ads"]');
  if(dashEl) dashEl.textContent = activeCount;
}

