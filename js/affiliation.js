/* ═══════════════════════════════════════════════════
   AFFILIATION PAGE
   ═══════════════════════════════════════════════════ */

function renderAffiliatePage() {
  const grid = document.getElementById('affiliateGrid');
  if (!grid) return;
  
  if (!AFFILIATE_PRODUCTS || AFFILIATE_PRODUCTS.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)"><h2>Aucun produit affilié pour le moment</h2><p style="margin-top:12px">Revenez bientôt pour découvrir nos recommandations!</p></div>';
    return;
  }
  
  grid.innerHTML = AFFILIATE_PRODUCTS.map(p => `
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
