/* ═══════════ PRODUCTS ═══════════ */
function productCardHTML(p) {
  const liked = wishlist.includes(p.id);
  const stars = '★'.repeat(p.stars)+'☆'.repeat(5-p.stars);
  return `
  <div class="product-card" onclick="openProduct(${p.id})">
    <div class="product-img-wrap">
      <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy">
      ${p.badge ? `<span class="product-badge ${p.badge==='Nouveau'?'new':p.badge==='Promo'?'promo':''}">${p.badge}</span>`:''}
      <div class="product-wishlist ${liked?'liked':''}" onclick="toggleWish(event,${p.id})">${liked?'❤️':'🤍'}</div>
    </div>
    <div class="product-info">
      <div class="product-cat">${p.cat}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-stars">${stars} <span style="color:var(--muted);font-size:11px">(${p.reviews})</span></div>
      <div class="product-price-row">
        <div>
          <span class="product-price">${p.price.toLocaleString()} MAD</span>
          ${p.old?`<span class="product-price-old">${p.old.toLocaleString()}</span>`:''}
        </div>
        <button class="btn-add-cart" onclick="quickAdd(event,${p.id})">+ Panier</button>
      </div>
    </div>
  </div>`;
}

function renderFeatured() {
  const el = document.getElementById('featuredGrid');
  if(!el) return;
  el.innerHTML = PRODUCTS.slice(0,4).map(p=>productCardHTML(p)).join('');
}

let currentSearch = '';

function renderShop() {
  const el = document.getElementById('shopGrid');
  if(!el) return;
  let list = currentFilter==='all' ? PRODUCTS : PRODUCTS.filter(p=>p.cat===currentFilter);
  if(currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.brand||'').toLowerCase().includes(q) ||
      (p.desc||'').toLowerCase().includes(q) ||
      (p.cat||'').toLowerCase().includes(q)
    );
  }
  const count = document.getElementById('shopResultCount');
  if(count) count.textContent = list.length + ' produit' + (list.length!==1?'s':'');
  if(list.length === 0) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">🔍</div>
      <div style="font-size:1.1rem;color:var(--ice);margin-bottom:8px">Aucun produit trouvé</div>
      <div style="font-size:13px">Essayez un autre mot-clé ou <a href="#" onclick="clearSearch()" style="color:var(--blue2)">effacez la recherche</a></div>
    </div>`;
    return;
  }
  el.innerHTML = list.map(p=>productCardHTML(p)).join('');
}

function searchShop(val) {
  currentSearch = val.trim();
  // Reset category filter visually when searching
  if(currentSearch) {
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    currentFilter = 'all';
  }
  renderShop();
}

function clearSearch() {
  currentSearch = '';
  const input = document.getElementById('shopSearch');
  if(input) input.value = '';
  const firstBtn = document.querySelector('.filter-btn');
  if(firstBtn) { firstBtn.classList.add('active'); }
  renderShop();
}

/* ═══════════ AFFILIATE ═══════════ */
function affiliateCardHTML(p) {
  const stars = '★'.repeat(p.stars||5)+'☆'.repeat(5-(p.stars||5));
  return `
  <div class="product-card" style="cursor:default">
    <div class="product-img-wrap">
      <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=600&q=80'">
      ${p.badge ? `<span class="product-badge ${p.badge==='Nouveau'?'new':p.badge==='Promo'?'promo':''}">${p.badge}</span>`:''}
      <div style="position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#c9a84c,#e8c96a);color:#06080f;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px;border-radius:4px">AFFILIÉ</div>
    </div>
    <div class="product-info">
      <div class="product-cat">Partenaire</div>
      <div class="product-name">${p.name}</div>
      <div class="product-stars">${stars}</div>
      <div style="font-size:12px;color:var(--muted);margin:6px 0 10px;line-height:1.5">${p.desc||''}</div>
      <div class="product-price-row">
        <div><span class="product-price">${p.price ? p.price.toLocaleString()+' €' : ''}</span></div>
        <a href="${p.affiliateLink||'#'}" target="_blank" rel="noopener noreferrer sponsored"
           onclick="event.stopPropagation()"
           style="background:linear-gradient(135deg,var(--gold),var(--gold2));color:#06080f;border:none;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;text-decoration:none;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;transition:all 0.2s"
           onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(201,168,76,0.4)'"
           onmouseout="this.style.transform='';this.style.boxShadow=''">
          🔗 Voir l'offre
        </a>
      </div>
    </div>
  </div>`;
}

function renderAffiliatePage() {
  const grid = document.getElementById('affiliateGrid');
  const empty = document.getElementById('affiliateEmpty');
  if(!grid) return;
  if(!AFFILIATE_PRODUCTS.length) {
    grid.innerHTML = '';
    if(empty) empty.style.display='block';
    return;
  }
  if(empty) empty.style.display='none';
  grid.innerHTML = AFFILIATE_PRODUCTS.map(p=>affiliateCardHTML(p)).join('');
}

function filterShop(cat, btn) {
  currentFilter = cat;
  currentSearch = '';
  const input = document.getElementById('shopSearch');
  if(input) input.value = '';
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else { const fb = document.querySelector('.filter-btn'); if(fb) fb.classList.add('active'); }
  renderShop();
}

