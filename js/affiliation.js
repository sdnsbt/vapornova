/* ═══════════════════════════════════════════════════
   AFFILIATION PAGE
═══════════════════════════════════════════════════ */

let _affFilter = 'all';
let _affSearch = '';

function renderAffiliatePage() {
  _affFilter = 'all';
  _affSearch = '';
  _renderAffGrid();
}

function _renderAffGrid() {
  const grid = document.getElementById('affiliateGrid');
  if (!grid) return;

  if (!AFFILIATE_PRODUCTS || AFFILIATE_PRODUCTS.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)"><h2>Aucun produit affilié pour le moment</h2><p style="margin-top:12px">Revenez bientôt !</p></div>';
    return;
  }

  let list = [...AFFILIATE_PRODUCTS];

  // Filter
  if (_affFilter === '5') list = list.filter(p => (p.stars || 5) >= 5);
  if (_affFilter === 'promo') list = list.filter(p => p.badge && p.badge.toLowerCase().includes('promo'));

  // Search
  if (_affSearch) {
    const q = _affSearch.toLowerCase();
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.badge || '').toLowerCase().includes(q)
    );
  }

  // Count
  const countEl = document.getElementById('affiliateCount');
  if (countEl) countEl.textContent = list.length + ' produit' + (list.length !== 1 ? 's' : '');

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">🔍</div>
      <div style="font-size:1.1rem;color:var(--ice);margin-bottom:8px">Aucun produit trouvé</div>
      <div style="font-size:13px"><a href="#" onclick="clearAffiliateSearch()" style="color:var(--blue2)">Effacer la recherche</a></div>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="window.open('${p.affiliateLink}', '_blank')" style="cursor:pointer;transition:transform 0.3s" onmouseenter="this.style.transform='translateY(-8px)'" onmouseleave="this.style.transform='translateY(0)'">
      <div class="product-img-wrap" style="position:relative">
        <img src="${p.img}" alt="${p.name}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=600&q=80'">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <div style="position:absolute;top:12px;left:12px;background:linear-gradient(135deg,#27ae60,#1e8449);color:white;font-size:9px;font-weight:800;padding:4px 8px;border-radius:4px;letter-spacing:1.5px">AFFILIÉ</div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-stars">${'★'.repeat(p.stars || 5)}${'☆'.repeat(5 - (p.stars || 5))}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
          <div class="product-price">${p.price ? p.price.toLocaleString() + ' €' : 'Voir prix'}</div>
          <div style="color:var(--green);font-size:12px;font-weight:600">Voir le produit →</div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterAffiliate(type, btn) {
  _affFilter = type;
  _affSearch = '';
  const input = document.getElementById('affiliateSearch');
  if (input) input.value = '';
  document.querySelectorAll('.shop-header-bar .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _renderAffGrid();
}

function searchAffiliate(val) {
  _affSearch = val.trim();
  if (_affSearch) {
    document.querySelectorAll('.shop-header-bar .filter-btn').forEach(b => b.classList.remove('active'));
    _affFilter = 'all';
  }
  _renderAffGrid();
}

function clearAffiliateSearch() {
  _affSearch = '';
  _affFilter = 'all';
  const input = document.getElementById('affiliateSearch');
  if (input) input.value = '';
  const firstBtn = document.querySelector('.shop-header-bar .filter-btn');
  if (firstBtn) firstBtn.classList.add('active');
  _renderAffGrid();
}
