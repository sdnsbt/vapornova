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


/* ═══ NAV SCROLL ═══ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});
