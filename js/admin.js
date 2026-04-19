/* ═══════════ ADMIN ═══════════ */
let _affiliateLocked = false; // empêche les resets automatiques après sauvegarde

function _lockAffiliates(ids, idsBlog) {
  console.log('[AFF-LOCK] 🔒 Lock activé — ids produit:', ids, '| ids blog:', idsBlog);
  _affiliateLocked = true;
  clearTimeout(window._affiliateLockTimer);
  window._affiliateLockTimer = setTimeout(() => {
    _affiliateLocked = false;
    console.log('[AFF-LOCK] 🔓 Lock expiré — réapplication ids:', ids);
    if(ids !== undefined) renderAffiliateProductSelection(ids);
    if(idsBlog !== undefined) renderBlogAffiliateProductSelection(idsBlog);
  }, 400);
}
function openAdminLogin() {
  document.getElementById('adminLogin').classList.add('open');
  document.getElementById('loginError').style.display='none';
  document.getElementById('adminPwd').value='';
  setTimeout(()=>document.getElementById('adminPwd').focus(), 100);
}

async function checkLogin() {
  const pwd = document.getElementById('adminPwd').value;
  const h = await hashPwd(pwd);
  if(h === adminPwdHash) {
    document.getElementById('adminLogin').classList.remove('open');
    document.getElementById('adminModal').classList.add('open');
    initAdminPanel();
    if(typeof checkGhTokenStatus === 'function') setTimeout(checkGhTokenStatus, 200);
  } else {
    document.getElementById('loginError').style.display='block';
  }
}

function closeAdmin() {
  document.getElementById('adminModal').classList.remove('open');
}

function showAdmTab(name, el) {
  document.querySelectorAll('.adm-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.adm-nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('adm-'+name).classList.add('active');
  if(el) el.classList.add('active');
  if(name==='products') { renderProductsTable(); setTimeout(renderImgGrid, 50); if(!editingProductId && !_affiliateLocked) setTimeout(()=>renderAffiliateProductSelection([]), 80); }
  if(name==='affiliates') { renderAffiliateTable(); }
  if(name==='blog-adm') { renderBlogAdm(); if(!editingBlogId && !_affiliateLocked) setTimeout(()=>renderBlogAffiliateProductSelection([]), 80); }
  if(name==='orders') renderOrdersTable();
  if(name==='settings') { if(typeof checkGhTokenStatus === 'function') setTimeout(checkGhTokenStatus, 100); }
  if(name==='ads') renderAdsToggle();
  if(name==='promo') renderPromoProductSelect();
  if(name==='payments') renderPaymentsTab();
}

function initAdminPanel() {
  renderProductsTable();
  renderBlogAdm();
  renderOrdersTable();
  renderAdsToggle();
  renderRevChart();
  renderImgGrid();
  // Befülle Affiliate-Produkt-Auswahl nur wenn kein Produkt in Bearbeitung
  if(!editingProductId && !_affiliateLocked) renderAffiliateProductSelection([]);
  if(!editingBlogId && !_affiliateLocked) renderBlogAffiliateProductSelection([]);
  document.getElementById('dash-products').textContent = PRODUCTS.length;
  document.getElementById('dash-blog').textContent = BLOG_POSTS.length;
  document.getElementById('dash-orders').textContent = ORDERS.length;
}

/* ── Products Admin ── */
function renderProductsTable(filter, highlightId) {
  const tb = document.getElementById('productsTableBody');
  if(!tb) return;
  const q = (filter||'').toLowerCase();
  const list = q ? PRODUCTS.filter(p=>p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q)) : PRODUCTS;
  if(!list.length) {
    tb.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#555;padding:32px;font-size:13px">Aucun produit — ajoutez-en un ci-dessus</td></tr>`;
    return;
  }
  tb.innerHTML = list.map(p => {
    // Thumbs first, fallback chain
    const thumbArr = (p.thumbs && p.thumbs.length) ? p.thumbs
                   : (p.images && p.images.length) ? p.images
                   : p.img ? [p.img] : [];
    const totalPhotos = (p.images && p.images.length) || thumbArr.length || 0;

    // Build photo strip: main + up to 3 extras
    const mainThumb = thumbArr[0] || '';
    const extras = thumbArr.slice(1, 4);
    const moreCount = totalPhotos > 4 ? totalPhotos - 4 : 0;

    const mainHtml = mainThumb
      ? `<img src="${mainThumb}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:2px solid var(--adm-accent);display:block;flex-shrink:0">`
      : `<div style="width:52px;height:52px;background:var(--adm-border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📷</div>`;

    const extrasHtml = extras.map(src =>
      `<img src="${src}" alt="" style="width:26px;height:26px;object-fit:cover;border-radius:4px;border:1px solid var(--adm-border);display:block">`
    ).join('');

    const photoStrip = `
      <div style="display:flex;align-items:center;gap:6px">
        ${mainHtml}
        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;gap:3px;flex-wrap:wrap">${extrasHtml}${moreCount ? `<div style="width:26px;height:26px;background:var(--adm-border);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#777;font-weight:700">+${moreCount}</div>` : ''}</div>
          <div style="font-size:9px;color:#556;white-space:nowrap">${totalPhotos || 0} photo${totalPhotos!==1?'s':''}</div>
        </div>
      </div>`;

    return `<tr data-product-id="${p.id}" style="">
      <td style="padding:10px 14px">${photoStrip}</td>
      <td style="padding:10px 14px">
        <div style="font-weight:700;color:#e8f4ff;font-size:13px;margin-bottom:2px">${p.name}</div>
        ${p.brand ? `<div style="font-size:10px;color:#5a7aaa">${p.brand}</div>` : ''}
        <div style="font-size:10px;color:#3a5070;margin-top:2px">★ ${p.stars} · ${p.reviews} avis</div>
      </td>
      <td style="padding:10px 14px"><span class="adm-badge adm-badge-blue" style="font-size:10px">${p.cat}</span></td>
      <td style="padding:10px 14px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#e8c96a;letter-spacing:1px">${p.price.toLocaleString()} €</div>
        ${p.old ? `<div style="font-size:10px;color:#444;text-decoration:line-through">${p.old.toLocaleString()} €</div>` : ''}
      </td>
      <td style="padding:10px 14px">${p.badge ? `<span class="adm-badge adm-badge-green" style="font-size:10px">${p.badge}</span>` : '<span style="color:#333">—</span>'}</td>
      <td style="padding:10px 14px">
        <div style="display:flex;flex-direction:column;gap:5px">
          <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="editProduct(${p.id})">✏️ Modifier</button>
          <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteProduct(${p.id})">🗑 Supprimer</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}
function filterProductsTable(q) { renderProductsTable(q); }

function saveProduct() {
  const name = document.getElementById('pf-name').value.trim();
  const priceRaw = document.getElementById('pf-price').value;
  const price = parseFloat(priceRaw);
  if(!name) { toast('⚠️ Le nom du produit est requis', '⚠️'); return; }
  if(!price || isNaN(price) || price <= 0) { toast('⚠️ Entrez un prix valide', '⚠️'); return; }

  // Build images from pfImages state
  let images = pfImages.map(x => x.src).filter(Boolean);
  if(images.length === 0) { toast('⚠️ Ajoutez au moins une photo', '⚠️'); return; }

  const existingProd = editingProductId ? PRODUCTS.find(p => p.id === editingProductId) : null;

  const thumbs = pfImages.map(x => x.thumb || x.src).filter(Boolean);

  const prod = normalizeProduct({
    id: editingProductId || Date.now(),
    name,
    brand: existingProd ? (existingProd.brand || '') : '',
    cat: document.getElementById('pf-cat').value,
    price,
    old: parseFloat(document.getElementById('pf-old').value) || null,
    img: images[0],
    images: images,
    thumbs: thumbs,
    desc: document.getElementById('pf-desc').value.trim() || name,
    badge: document.getElementById('pf-badge').value || null,
    stars: parseInt(document.getElementById('pf-stars').value) || 5,
    reviews: existingProd ? existingProd.reviews : Math.floor(Math.random() * 50) + 5,
    sizes: existingProd ? existingProd.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: existingProd ? existingProd.colors : ['#1e90ff', '#4dabff', '#06080f'],
    specs: existingProd ? (existingProd.specs || []) : [],
    affiliate: document.getElementById('pf-affiliate').value.trim() || null,
    affiliatedProducts: getSelectedAffiliateProducts()
  }); // end normalizeProduct
  console.log('[SAVE-PROD] affiliatedProducts sauvegardés:', prod && prod.affiliatedProducts);

  if(editingProductId) {
    const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
    if(idx > -1) { PRODUCTS[idx] = prod; } else { PRODUCTS.push(prod); }
    toast('✅ Produit modifié avec succès');
    showSaveBanner('Produit', name + ' — modifications enregistrées');
  } else {
    PRODUCTS.push(prod);
    toast('✅ Produit ajouté à la boutique');
    showSaveBanner('Produit', name + ' ajouté');
  }

  try {
    localStorage.setItem('vn_products', JSON.stringify(PRODUCTS));
  } catch(e) {
    try {
      const slim = PRODUCTS.map(p => Object.assign({}, p, {
        images: p.images && p.images.length ? [p.images[0]] : [],
        thumbs: p.thumbs && p.thumbs.length ? [p.thumbs[0]] : []
      }));
      localStorage.setItem('vn_products', JSON.stringify(slim));
      PRODUCTS = PRODUCTS.map((p, i) => slim[i] || p);
      toast('⚠️ Stockage limité — 1 photo par produit conservée', '⚠️');
    } catch(_) {
      toast('❌ Stockage plein. Utilisez des URL externes pour les images.', '⚠️');
      return;
    }
  }
  // Sync vers data.json (immédiatement, avant tout reset DOM)
  if(typeof DataSync !== 'undefined') DataSync.save();

  const savedId = prod.id;
  const savedAffiliatedIds = prod.affiliatedProducts || [];

  // Verrouiller la sélection affiliés pendant les re-renders
  _lockAffiliates(savedAffiliatedIds, undefined);

  renderProductsTable('', savedId);
  resetProductFormKeepAffiliates();

  // 3. Force instant scroll to the updated table row (no smooth = guaranteed visible)
  const updatedRow = document.querySelector('[data-product-id="' + savedId + '"]');
  if(updatedRow) {
    // Instant flash so user sees update regardless of scroll position
    updatedRow.style.transition = 'none';
    updatedRow.style.background = 'rgba(30,144,255,0.35)';
    updatedRow.style.outline = '2px solid rgba(30,144,255,0.6)';

    // Scroll inside .adm-main (which has overflow-y:auto)
    const admMain = document.querySelector('.adm-main');
    if(admMain) {
      // Get row position relative to adm-main scroll container
      let el = updatedRow, offsetTop = 0;
      while(el && el !== admMain) { offsetTop += el.offsetTop; el = el.offsetParent; }
      admMain.scrollTop = offsetTop - 100; // 100px padding above
    }

    // Fade out the highlight
    setTimeout(() => {
      updatedRow.style.transition = 'background 1.8s ease, outline 1.8s ease';
      updatedRow.style.background = 'transparent';
      updatedRow.style.outline = '2px solid transparent';
    }, 120);
  }

  // 4. Update shop display in background
  setTimeout(() => { renderFeatured(); renderShop(); }, 150);

  const dashEl = document.getElementById('dash-products');
  if(dashEl) dashEl.textContent = PRODUCTS.length;
}

function editProduct(id) {
  const p = PRODUCTS.find(x => x.id === id || x.id === Number(id));
  if(!p) { toast('Produit introuvable', '⚠️'); return; }

  // Switch to products tab if not already active
  const prodTab = document.getElementById('adm-products');
  if(prodTab && !prodTab.classList.contains('active')) {
    showAdmTab('products', document.querySelector('.adm-nav-item:nth-child(2)'));
  }

  editingProductId = p.id;

  // Fill all form fields
  document.getElementById('pf-name').value  = p.name || '';
  document.getElementById('pf-cat').value   = p.cat  || 'kit';
  document.getElementById('pf-price').value = p.price || '';
  document.getElementById('pf-old').value   = p.old  || '';
  document.getElementById('pf-desc').value  = p.desc || '';
  document.getElementById('pf-badge').value = p.badge || '';
  document.getElementById('pf-stars').value = p.stars || 5;
  document.getElementById('pf-affiliate').value = p.affiliate || '';
  
  // Load affiliated products selection
  renderAffiliateProductSelection(p.affiliatedProducts || []);

  // Load images — support both images[] array and single img string
  // Also load thumbnails if stored, otherwise use src as thumb (URLs/old data)
  const imgSrcs = (p.images && p.images.length > 0)
    ? p.images
    : (p.img ? [p.img] : []);
  const imgThumbs = (p.thumbs && p.thumbs.length > 0) ? p.thumbs : [];
  pfImages = imgSrcs.filter(Boolean).map((src, i) => ({
    src,
    thumb: imgThumbs[i] || src  // use stored thumb or fall back to full src
  }));

  // Render the image grid (with a small delay to ensure the tab is visible)
  setTimeout(() => {
    renderImgGrid();
    // Scroll form into view
    const form = document.getElementById('productForm');
    if(form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);

  document.getElementById('productFormTitle').textContent = '✏️ Modifier : ' + p.name;
  document.getElementById('cancelEditBtn').style.display = 'block';

  toast('✏️ Produit chargé — modifiez puis cliquez Enregistrer');
}

function deleteProduct(id) {
  if(!confirm('Supprimer ce produit ?')) return;
  PRODUCTS = PRODUCTS.filter(p=>p.id!==id);
  localStorage.setItem('vn_products', JSON.stringify(PRODUCTS));
  if(typeof DataSync !== 'undefined') DataSync.save();
  renderProductsTable(); renderFeatured(); renderShop();
  toast('Produit supprimé');
}

/* ═══════════ AFFILIATE ADMIN ═══════════ */
let editingAffiliateId = null;

function renderAffiliateTable(filter) {
  const q = filter || (document.getElementById('affSearch')||{}).value||'';
  const tbody = document.getElementById('affiliateTableBody');
  if(!tbody) return;
  const list = q ? AFFILIATE_PRODUCTS.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())) : AFFILIATE_PRODUCTS;
  if(!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#555;padding:32px">Aucun produit affilié. Ajoutez-en un ci-dessus.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p=>`
    <tr id="affrow-${p.id}">
      <td><img src="${p.img||''}" alt="${p.name}" style="width:70px;height:52px;object-fit:cover;border-radius:6px;background:#111" onerror="this.style.display='none'"></td>
      <td>
        <div style="font-weight:600;font-size:13px;color:#e8f4ff;margin-bottom:4px">${p.name}</div>
        <div style="font-size:11px;color:#555;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.desc||''}</div>
      </td>
      <td style="font-weight:700;color:var(--gold)">${p.price ? p.price.toLocaleString()+' €' : '—'}</td>
      <td>
        <a href="${p.affiliateLink||'#'}" target="_blank" rel="noopener" style="color:var(--blue2);font-size:11px;text-decoration:none;display:flex;align-items:center;gap:4px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          🔗 ${(p.affiliateLink||'').replace('https://','').substring(0,28)}…
        </a>
      </td>
      <td><span style="background:rgba(30,144,255,0.12);color:var(--blue2);border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700">${p.badge||'—'}</span></td>
      <td>
        <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="editAffiliateProduct('${p.id}')" style="margin-bottom:4px;width:100%">✏️ Éditer</button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteAffiliateProduct('${p.id}')" style="width:100%">🗑 Supprimer</button>
      </td>
    </tr>
  `).join('');
}

function filterAffiliateTable(q) { renderAffiliateTable(q); }

function saveAffiliateProduct() {
  const name = (document.getElementById('af-name')||{}).value||'';
  const link = (document.getElementById('af-link')||{}).value||'';
  if(!name.trim()) { toast('❌ Nom du produit requis'); return; }
  if(!link.trim()) { toast('❌ Lien affilié requis'); return; }
  const prod = {
    id: editingAffiliateId || ('af' + Date.now()),
    name: name.trim(),
    price: parseFloat((document.getElementById('af-price')||{}).value) || 0,
    affiliateLink: link.trim(),
    img: (document.getElementById('af-img')||{}).value.trim() || '',
    desc: (document.getElementById('af-desc')||{}).value.trim() || '',
    badge: (document.getElementById('af-badge')||{}).value || '',
    stars: parseInt((document.getElementById('af-stars')||{}).value) || 5,
  };
  if(editingAffiliateId) {
    const idx = AFFILIATE_PRODUCTS.findIndex(p=>p.id===editingAffiliateId);
    if(idx>-1) AFFILIATE_PRODUCTS[idx]=prod; else AFFILIATE_PRODUCTS.push(prod);
  } else {
    AFFILIATE_PRODUCTS.push(prod);
  }
  localStorage.setItem('vn_affiliates', JSON.stringify(AFFILIATE_PRODUCTS));
  if(typeof DataSync !== 'undefined') DataSync.save();
  renderAffiliateTable();
  renderAffiliatePage();
  resetAffiliateForm();
  toast('✅ Produit affilié enregistré !');
}

function editAffiliateProduct(id) {
  const p = AFFILIATE_PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  editingAffiliateId = id;
  document.getElementById('af-name').value = p.name||'';
  document.getElementById('af-price').value = p.price||'';
  document.getElementById('af-link').value = p.affiliateLink||'';
  document.getElementById('af-img').value = p.img||'';
  document.getElementById('af-desc').value = p.desc||'';
  document.getElementById('af-badge').value = p.badge||'';
  document.getElementById('af-stars').value = p.stars||5;
  document.getElementById('affiliateFormTitle').textContent = '✏️ Modifier le produit affilié';
  document.getElementById('cancelAffiliateBtn').style.display='inline-flex';
  afPreviewImg();
  document.getElementById('affiliateForm').scrollIntoView({behavior:'smooth'});
}

function deleteAffiliateProduct(id) {
  if(!confirm('Supprimer ce produit affilié ?')) return;
  AFFILIATE_PRODUCTS = AFFILIATE_PRODUCTS.filter(p=>p.id!==id);
  localStorage.setItem('vn_affiliates', JSON.stringify(AFFILIATE_PRODUCTS));
  if(typeof DataSync !== 'undefined') DataSync.save();
  renderAffiliateTable();
  renderAffiliatePage();
  toast('Produit affilié supprimé');
}

function resetAffiliateForm() {
  editingAffiliateId = null;
  ['af-name','af-price','af-link','af-img','af-desc'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const b=document.getElementById('af-badge'); if(b) b.selectedIndex=0;
  const s=document.getElementById('af-stars'); if(s) s.value=5;
  document.getElementById('affiliateFormTitle').textContent='➕ Ajouter un produit affilié';
  document.getElementById('cancelAffiliateBtn').style.display='none';
  const prev=document.getElementById('af-img-preview'); if(prev) prev.style.display='none';
}

function afPreviewImg() {
  const url=(document.getElementById('af-img')||{}).value||'';
  const wrap=document.getElementById('af-img-preview');
  const el=document.getElementById('af-img-preview-el');
  if(!wrap||!el) return;
  if(url) { el.src=url; wrap.style.display='block'; } else { wrap.style.display='none'; }
}

function afLiveRefresh() {
  // Live preview on affiliate page if open
  renderAffiliatePage();
}

/* ══════════════════════════════════════════════════════
   AUTO-FETCH AFFILIÉ — Cloudflare Worker (priorité)
   + cascade OG gratuite en fallback

   ➜ Configurez WORKER_URL ci-dessous après déploiement
     du fichier og-worker.js sur Cloudflare Workers.
   ➜ Laissez '' pour utiliser uniquement la cascade gratuite.
   ══════════════════════════════════════════════════════ */

// ↓↓ COLLEZ ICI L'URL DE VOTRE WORKER CLOUDFLARE ↓↓
const WORKER_URL = 'https://affiliateamazone.sdn-sebti.workers.dev';
// Exemple : const WORKER_URL = 'https://og-extractor.ton-compte.workers.dev';

/* ── Nettoyage du titre ── */
function cleanTitle(t) {
  return (t || '')
    .replace(/\s*[\|–\-:]\s*(Amazon|eBay|Aliexpress|AliExpress|Fnac|Cdiscount|Darty|Rakuten|La\s*Redoute)[^\n]*/gi, '')
    .replace(/\s*-\s*Achat\s*\/\s*Vente.*/gi, '')
    .trim();
}

/* ── Extrait l'ASIN et construit l'URL canonique Amazon ── */
function extractAsin(url) {
  const m = url.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return m ? m[1] : null;
}

/* ── Extraction prix depuis texte/HTML ── */
function extractPrice(text) {
  if (!text) return null;
  const patterns = [
    /([0-9]{1,6}[.,][0-9]{2})\s*€/,
    /€\s*([0-9]{1,6}[.,][0-9]{2})/,
    /"price":\s*"?([0-9]{1,6}[.,][0-9]{0,2})"?/i,
    /itemprop=["']price["'][^>]*content=["']([0-9]{1,6}[.,][0-9]{0,2})["']/i,
    /content=["']([0-9]{1,6}[.,][0-9]{0,2})["'][^>]*itemprop=["']price["']/i,
    /\$\s*([0-9]{1,6}[.,][0-9]{2})/,
    /([0-9]{1,4}[.,][0-9]{2})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) { const v = parseFloat(m[1].replace(',', '.')); if (!isNaN(v) && v > 0.5 && v < 100000) return v; }
  }
  return null;
}

/* ── Parsing OG depuis HTML brut ── */
function parseOGFromHTML(html) {
  const dec = s => (s || '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c)).trim();
  const get = (...pats) => { for (const p of pats) { const m = html.match(p); if (m && m[1] && m[1].length > 2) return dec(m[1]); } return ''; };

  const name = get(
    /property=["']og:title["'][^>]*content=["']([^"']{3,300})["']/i,
    /content=["']([^"']{3,300})["'][^>]*property=["']og:title["']/i,
    /name=["']twitter:title["'][^>]*content=["']([^"']{3,300})["']/i,
    /content=["']([^"']{3,300})["'][^>]*name=["']twitter:title["']/i,
    /<title[^>]*>([^<]{3,300})<\/title>/i
  );
  const img = get(
    /property=["']og:image:secure_url["'][^>]*content=["']([^"']{8,})["']/i,
    /content=["']([^"']{8,})["'][^>]*property=["']og:image:secure_url["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']{8,})["']/i,
    /content=["']([^"']{8,})["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']{8,})["']/i,
    /content=["']([^"']{8,})["'][^>]*name=["']twitter:image["']/i,
    /itemprop=["']image["'][^>]*content=["']([^"']{8,})["']/i
  );
  const desc = get(
    /property=["']og:description["'][^>]*content=["']([^"']{5,500})["']/i,
    /content=["']([^"']{5,500})["'][^>]*property=["']og:description["']/i,
    /name=["']twitter:description["'][^>]*content=["']([^"']{5,500})["']/i,
    /content=["']([^"']{5,500})["'][^>]*name=["']twitter:description["']/i,
    /name=["']description["'][^>]*content=["']([^"']{5,500})["']/i,
    /content=["']([^"']{5,500})["'][^>]*name=["']description["']/i
  );
  return { name: cleanTitle(name), img, desc: desc.substring(0, 300), price: extractPrice(html) };
}

/* ══════════════════════════════════════════════════════
   MÉTHODE 0 — Cloudflare Worker (suit toutes les redirections côté serveur)
   ══════════════════════════════════════════════════════ */
/* ── Debug logger — console + panneau admin ── */
function dbLog(type, ...parts) {
  const msg = parts.join(' ');
  // Console
  if(type === 'error') console.error(msg);
  else if(type === 'warn') console.warn(msg);
  else console.log(msg);
  // Panneau admin
  const panel = document.getElementById('af-debug-log');
  const body  = document.getElementById('af-debug-log-body');
  if(!panel || !body) return;
  panel.style.display = 'block';
  const colors = { info:'#4dabff', ok:'#00e5a0', warn:'#c9a84c', error:'#ff3a5c' };
  const row = document.createElement('div');
  row.style.cssText = `font-size:11px;line-height:1.6;color:${colors[type]||'#5a7aaa'};word-break:break-all;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:3px`;
  row.textContent = msg;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}
function dbClear() {
  const body = document.getElementById('af-debug-log-body');
  const panel = document.getElementById('af-debug-log');
  if(body) body.innerHTML = '';
  if(panel) panel.style.display = 'none';
}

async function fetchViaWorker(url) {
  if (!WORKER_URL) return null;
  const workerEndpoint = `${WORKER_URL}?url=${encodeURIComponent(url)}`;
  dbLog('info', '🚀 Worker → ' + workerEndpoint);
  try {
    const res = await fetch(workerEndpoint, {
      signal: AbortSignal.timeout(12000),
    });
    dbLog('info', '📡 HTTP ' + res.status + ' ' + res.statusText);
    const text = await res.text();
    dbLog('info', '📦 Réponse brute : ' + text.substring(0, 300));
    if (!res.ok) {
      dbLog('error', '❌ HTTP error ' + res.status + ' — ' + text.substring(0, 150));
      return null;
    }
    let d;
    try { d = JSON.parse(text); } catch(e) {
      dbLog('error', '❌ JSON invalide : ' + e.message + ' — ' + text.substring(0, 150));
      return null;
    }
    dbLog('ok', '✅ JSON → name:' + (d.name||'—') + ' | img:' + (d.img?'oui':'non') + ' | price:' + (d.price||'—'));
    if (d && d.ok && (d.name || d.img)) return d;
    dbLog('warn', '⚠️ Données insuffisantes — ok:' + d?.ok + ' name:' + d?.name + ' img:' + d?.img);
    if (d && d.error) dbLog('warn', '⚠️ Erreur worker : ' + d.error);
    return null;
  } catch(e) {
    dbLog('error', '💥 Exception : ' + e.name + ' — ' + e.message);
    return null;
  }
}

async function fetchAffiliateInfo() {
  const rawLink = (document.getElementById('af-link') || {}).value.trim();
  if (!rawLink) { toast('❌ Collez d\'abord le lien affilié'); return; }

  const btn      = document.getElementById('af-fetch-btn');
  const loader   = document.getElementById('af-fetch-loader');
  const preview  = document.getElementById('af-fetched-preview');
  const statusEl = document.getElementById('af-fetch-status');
  const oldPanel = document.getElementById('af-debug-panel');
  if (oldPanel) oldPanel.remove();
  dbClear();

  btn.disabled = true; btn.textContent = '⏳ Analyse…';
  loader.style.display = 'block'; preview.style.display = 'none';

  const setStatus = t => { if (statusEl) statusEl.textContent = t; };

  let info = null;
  let usedMethod = '';
  const errors = [];
  const isAmzlink = /amzlink\.to/i.test(rawLink);

  // ── Méthode 0 : Cloudflare Worker (résout amzlink.to et tous les liens courts) ──
  if (WORKER_URL) {
    setStatus('Worker : résolution du lien…');
    dbLog('info', '🔗 URL à traiter : ' + rawLink);
    dbLog('info', '⚙️  WORKER_URL : ' + WORKER_URL);
    info = await fetchViaWorker(rawLink);
    if (info) {
      usedMethod = 'Cloudflare Worker';
      dbLog('ok', '🎉 Extraction réussie via Worker !');
    } else {
      errors.push('Worker : pas de réponse ou données vides');
      dbLog('warn', '⚠️ Worker sans résultat — tentative cascade fallback…');
    }
  } else {
    dbLog('warn', '⚠️ WORKER_URL non configuré — cascade gratuite uniquement');
  }

  // ── Si amzlink.to ET pas de Worker configuré → message d'aide ──
  if (!info && isAmzlink && !WORKER_URL) {
    loader.style.display = 'none';
    btn.disabled = false; btn.textContent = '✨ Remplir automatiquement';
    showAfDebug([
      '⚠️  amzlink.to détecté — Worker Cloudflare non configuré',
      '',
      'amzlink.to utilise une redirection JavaScript que les proxys',
      'gratuits ne peuvent pas traverser.',
      '',
      '✅ Option A — Configurer le Worker (recommandé) :',
      '  Déployez og-worker.js sur Cloudflare Workers (gratuit)',
      '  puis renseignez WORKER_URL dans le code du site.',
      '',
      '✅ Option B — Utiliser l\'URL Amazon directe :',
      '  1. Ouvrez : ' + rawLink,
      '  2. Copiez l\'URL depuis la barre d\'adresse du navigateur',
      '     ex: https://www.amazon.fr/dp/B0XXXXXXXXX',
      '  3. Collez cette URL ici et relancez.',
    ]);
    toast('⚠️ amzlink.to — voir instructions');
    return;
  }

  // Pour les URL non-amzlink, normaliser si Amazon avec ASIN
  let link = rawLink;
  if (!info) {
    const asin = extractAsin(rawLink);
    if (asin) {
      const domainMatch = rawLink.match(/amazon\.(fr|co\.uk|de|it|es|com|ca|co\.jp)/i);
      const domain = domainMatch ? domainMatch[0] : 'amazon.fr';
      link = `https://www.${domain}/dp/${asin}`;
    }
  }

  // ── Méthode 1 : jsonlink.io ──
  if (!info) {
    try {
      setStatus('1/5 — jsonlink.io…');
      const res = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(link)}`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const d = await res.json();
        if (d && (d.title || d.images?.length || d.description)) {
          info = {
            name:  cleanTitle(d.title),
            img:   Array.isArray(d.images) ? (d.images[0] || '') : (d.image || ''),
            desc:  (d.description || '').substring(0, 300),
            price: extractPrice(d.description || d.title || ''),
          };
          usedMethod = 'jsonlink.io';
        } else errors.push('jsonlink.io : réponse vide');
      } else errors.push('jsonlink.io HTTP ' + res.status);
    } catch(e) { errors.push('jsonlink.io : ' + e.message); }
  }

  // ── Méthode 2 : microlink.io ──
  if (!info) {
    try {
      setStatus('2/5 — microlink.io…');
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}&palette=false&audio=false&video=false&iframe=false`, { signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const d = await res.json();
        if (d?.data) {
          const dt = d.data;
          info = {
            name:  cleanTitle(dt.title),
            img:   dt.image?.url || dt.screenshot?.url || '',
            desc:  (dt.description || '').substring(0, 300),
            price: extractPrice(dt.description || dt.title || ''),
          };
          usedMethod = 'microlink.io';
        } else errors.push('microlink.io : ' + d.status);
      } else errors.push('microlink.io HTTP ' + res.status);
    } catch(e) { errors.push('microlink.io : ' + e.message); }
  }

  // ── Méthode 3 : opengraph.io ──
  if (!info) {
    try {
      setStatus('3/5 — opengraph.io…');
      const res = await fetch(`https://opengraph.io/api/1.1/site/${encodeURIComponent(link)}?app_id=samples`, { signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const d = await res.json();
        const og = d?.openGraph || d?.hybridGraph || {};
        if (og.title || og.image) {
          info = {
            name:  cleanTitle(og.title),
            img:   og.image?.url || og.image || '',
            desc:  (og.description || '').substring(0, 300),
            price: extractPrice(og.description || og.title || ''),
          };
          usedMethod = 'opengraph.io';
        } else errors.push('opengraph.io : aucune donnée OG');
      } else errors.push('opengraph.io HTTP ' + res.status);
    } catch(e) { errors.push('opengraph.io : ' + e.message); }
  }

  // ── Méthode 4 : allorigins proxy ──
  if (!info) {
    try {
      setStatus('4/5 — allorigins…');
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(link)}`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const d = await res.json();
        const html = d.contents || '';
        if (html.length > 800 && !/503|Service Unavailable|Access Denied|Forbidden/i.test(html.substring(0, 300))) {
          const parsed = parseOGFromHTML(html);
          if (parsed.name || parsed.img) { info = parsed; usedMethod = 'allorigins'; }
          else errors.push('allorigins : aucune balise OG dans le HTML');
        } else errors.push('allorigins : page erreur (' + html.length + ' chars)');
      } else errors.push('allorigins HTTP ' + res.status);
    } catch(e) { errors.push('allorigins : ' + e.message); }
  }

  // ── Méthode 5 : corsproxy.io ──
  if (!info) {
    try {
      setStatus('5/5 — corsproxy.io…');
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(link)}`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const html = await res.text();
        if (html.length > 800 && !/503|Service Unavailable/i.test(html.substring(0, 300))) {
          const parsed = parseOGFromHTML(html);
          if (parsed.name || parsed.img) { info = parsed; usedMethod = 'corsproxy.io'; }
          else errors.push('corsproxy.io : aucune balise OG');
        } else errors.push('corsproxy.io : page erreur (' + html.length + ' chars)');
      } else errors.push('corsproxy.io HTTP ' + res.status);
    } catch(e) { errors.push('corsproxy.io : ' + e.message); }
  }

  loader.style.display = 'none';
  btn.disabled = false; btn.textContent = '✨ Remplir automatiquement';

  if (info) {
    // ── Remplir les champs du formulaire ──
    const cleanName = cleanTitle(info.name || '');
    if (cleanName)    document.getElementById('af-name').value  = cleanName;
    if (info.price && !isNaN(info.price)) document.getElementById('af-price').value = info.price;
    if (info.desc)    document.getElementById('af-desc').value  = info.desc;
    if (info.img)     document.getElementById('af-img').value   = info.img;

    // ── Remplir le panneau de prévisualisation ──
    document.getElementById('af-fetched-name').textContent  = cleanName || '—';
    document.getElementById('af-fetched-price').textContent = info.price
      ? Number(info.price).toLocaleString('fr-FR', {minimumFractionDigits:2}) + ' €'
      : '⚠️ Non trouvé — saisissez manuellement';
    document.getElementById('af-fetched-desc').textContent  = info.desc || '';
    const pi = document.getElementById('af-fetched-img-preview');
    if (info.img) { pi.src = info.img; pi.style.display = 'block'; }
    else { pi.style.display = 'none'; }

    afPreviewImg();
    preview.style.display = 'block';
    if(typeof renderAffiliatePage === 'function') renderAffiliatePage();
    if(typeof afLiveRefresh === 'function') afLiveRefresh();

    const missing = [!cleanName && 'nom', !info.price && 'prix', !info.img && 'image'].filter(Boolean);
    if (missing.length) toast('⚠️ Partiel — complétez : ' + missing.join(', '));
    else toast('✅ Infos extraites via ' + usedMethod + ' !');

    dbLog('ok', '📝 Champs remplis — nom:' + (cleanName||'—') + ' | prix:' + (info.price||'—') + ' | img:' + (info.img ? 'oui' : 'non'));

  } else {
    // ── Échec total ──
    showAfDebug([
      '❌ Impossible d\'extraire automatiquement',
      '',
      '📋 Tentatives :',
      ...errors.map(e => '   • ' + e),
      '',
      '💡 Remplissez les champs manuellement.',
    ]);
    toast('❌ Extraction échouée — voir debug');
  }
}

function showAfDebug(lines) {
  let panel = document.getElementById('af-debug-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'af-debug-panel';
    panel.style.cssText = 'background:#0d0a00;border:1px solid rgba(201,168,76,0.35);border-radius:8px;padding:16px;margin-bottom:16px;position:relative';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Fermer';
    closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.06);border:1px solid #333;color:#888;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:10px';
    closeBtn.onclick = () => panel.remove();
    panel.appendChild(closeBtn);
    const pre = document.createElement('pre');
    pre.id = 'af-debug-text';
    pre.style.cssText = 'margin:0;white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:11px;line-height:1.8;color:#f0c060';
    panel.appendChild(pre);
    const form = document.getElementById('affiliateForm');
    if (form) form.prepend(panel);
  }
  document.getElementById('af-debug-text').textContent = lines.join('\n');
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function _resetProductFormBase() {
  editingProductId = null;
  ['pf-name','pf-price','pf-old','pf-desc','pf-affiliate','pf-img-url','pf-img'].forEach(id => {
    try { const el = document.getElementById(id); if(el) el.value = ''; } catch(e) {}
  });
  const catEl = document.getElementById('pf-cat');
  if(catEl) catEl.selectedIndex = 0;
  const badgeEl = document.getElementById('pf-badge');
  if(badgeEl) badgeEl.selectedIndex = 0;
  const starsEl = document.getElementById('pf-stars');
  if(starsEl) starsEl.value = '5';
  const titleEl = document.getElementById('productFormTitle');
  if(titleEl) titleEl.textContent = '➕ Ajouter un produit';
  const cancelEl = document.getElementById('cancelEditBtn');
  if(cancelEl) cancelEl.style.display = 'none';
  const filesInput = document.getElementById('pf-img-files');
  if(filesInput) filesInput.value = '';
  pfImages = [];
  renderImgGrid();
}

// Reset complet (bouton Annuler / nouveau produit)
function resetProductForm() {
  _resetProductFormBase();
  renderAffiliateProductSelection([]);
}

// Reset après sauvegarde — recharge les affiliés du produit sauvegardé
function resetProductFormKeepAffiliates() {
  _resetProductFormBase();
  // La sélection affiliés est rechargée par saveProduct() après cet appel
}

/* ══════════════════════════════════════════════════════
   COMPRESSION IMAGE — réduit à max 800×800px / ~80 Ko
   Permet stockage base64 persistant dans localStorage
══════════════════════════════════════════════════════ */
function compressImage(file, maxW, maxH, quality, callback) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      // Calcul des dimensions cibles en conservant le ratio
      let w = img.width, h = img.height;
      if(w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      // JPEG avec qualité réduite = ~60-120 Ko selon l'image
      const compressed = canvas.toDataURL('image/jpeg', quality);
      callback(compressed);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ── Produit : upload multi-images avec compression ── */
function renderImgGrid() {
  const grid = document.getElementById('pf-img-grid');
  if(!grid) return;
  const MAX = 6;
  let html = '';

  // Filled slots - use thumb for display (fast), full src is preserved for saving
  pfImages.forEach((img, i) => {
    const displaySrc = img.thumb || img.src; // use small thumbnail for display
    html += `
    <div class="multi-img-slot filled" draggable="true"
         ondragstart="pfDragStart(${i})" ondragover="pfDragOver(event,${i})" ondrop="pfDrop(event,${i})" ondragend="pfDragEnd()">
      <span class="slot-num">${i+1}</span>
      <img src="${displaySrc}" alt="Photo ${i+1}" loading="lazy">
      ${i===0 ? '<span class="multi-img-main-badge">⭐ Principale</span>' : ''}
      <div class="slot-overlay">
        ${i>0 ? `<button class="slot-action-btn" onclick="moveImgFirst(${i})" title="Mettre en principale">⭐</button>` : ''}
        <button class="slot-del-btn" onclick="removeImgSlot(${i})" title="Supprimer">🗑</button>
      </div>
    </div>`;
  });

  // Empty slots
  for(let i=pfImages.length; i<MAX; i++) {
    const isFirst = i===0 && pfImages.length===0;
    html += `
    <div class="multi-img-slot empty-slot" onclick="document.getElementById('pf-img-files').click()"
         ondragover="event.preventDefault();this.classList.add('drag-over')"
         ondragleave="this.classList.remove('drag-over')"
         ondrop="pfDropFile(event,this)">
      <span class="slot-add-icon">${isFirst ? '📷' : '＋'}</span>
      <span style="font-size:9px;margin-top:4px;text-align:center;line-height:1.3">${isFirst ? 'Photo<br>principale' : 'Ajouter'}</span>
      ${pfImages.length===0 && i===0 ? '<span style="font-size:9px;color:#444;margin-top:2px">ou glisser</span>' : ''}
    </div>`;
  }

  grid.innerHTML = html;
}

// Drag-reorder state
let pfDragIdx = null;
function pfDragStart(i) { pfDragIdx = i; }
function pfDragEnd() { pfDragIdx = null; document.querySelectorAll('.multi-img-slot').forEach(s=>s.classList.remove('drag-over')); }
function pfDragOver(e, i) { e.preventDefault(); document.querySelectorAll('.multi-img-slot').forEach(s=>s.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over'); }
function pfDrop(e, targetIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if(pfDragIdx===null || pfDragIdx===targetIdx) return;
  const moved = pfImages.splice(pfDragIdx, 1)[0];
  pfImages.splice(targetIdx, 0, moved);
  pfDragIdx = null;
  renderImgGrid();
  if(typeof liveRefreshProduct === 'function') liveRefreshProduct();
}
// Drop files onto empty slot
function pfDropFile(e, el) {
  e.preventDefault();
  el.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/'));
  if(!files.length) return;
  const fakeInput = { files, value: '' };
  handleMultiImageUpload(fakeInput);
}
function moveImgFirst(i) {
  const img = pfImages.splice(i, 1)[0];
  pfImages.unshift(img);
  renderImgGrid();
  if(typeof liveRefreshProduct === 'function') liveRefreshProduct();
  toast('⭐ Photo mise en principale');
}

function removeImgSlot(idx) {
  pfImages.splice(idx, 1);
  renderImgGrid();
  if(typeof liveRefreshProduct === 'function') liveRefreshProduct();
  toast('🗑 Photo supprimée');
}

function handleMultiImageUpload(input) {
  const files = Array.from(input.files);
  if(!files.length) return;
  const MAX = 6;
  const remaining = MAX - pfImages.length;
  if(remaining <= 0) { toast('Maximum 6 photos atteint','⚠️'); return; }
  const toProcess = files.slice(0, remaining);
  if(files.length > remaining) toast(`⚠️ Seulement ${remaining} photo(s) ajoutée(s) — maximum 6 atteint`);
  let processed = 0;
  toProcess.forEach(file => {
    if(file.size > 20 * 1024 * 1024) { toast(`${file.name} trop lourd (max 20 Mo)`,'⚠️'); processed++; return; }
    // Generate full image
    compressImage(file, 800, 1000, 0.72, compressed => {
      // Also generate a small thumbnail for table display
      compressImage(file, 120, 120, 0.55, thumb => {
        pfImages.push({ src: compressed, thumb: thumb });
        processed++;
        if(processed === toProcess.length) {
          renderImgGrid();
          toast(`✅ ${toProcess.length} photo(s) ajoutée(s)`);
          if(typeof liveRefreshProduct === 'function') liveRefreshProduct();
        }
      });
    });
  });
  input.value = '';
}

function addImgFromUrl() {
  const url = document.getElementById('pf-img-url').value.trim();
  if(!url) { toast("Entrez une URL d'image",'⚠️'); return; }
  if(pfImages.length >= 6) { toast('Maximum 6 photos atteint','⚠️'); return; }
  // For URLs, thumb = src (browser handles sizing via CSS)
  pfImages.push({ src: url, thumb: url });
  document.getElementById('pf-img-url').value = '';
  renderImgGrid();
  if(typeof liveRefreshProduct === 'function') liveRefreshProduct();
  toast('✅ URL ajoutée');
}

/* ── Produit : upload image locale avec compression ── */
function handleProductImageUpload(input) {
  const file = input.files[0];
  if(!file) return;
  if(file.size > 20 * 1024 * 1024) { toast('Image trop lourde (max 20 Mo)','⚠️'); input.value=''; return; }
  toast('Compression en cours… ⏳');
  compressImage(file, 800, 1000, 0.72, compressed => {
    document.getElementById('pf-img').value = '';
    setImgPreview(compressed);
    toast('✅ Image compressée et prête — Enregistrez le produit');
  });
}

function setImgPreview(src) {
  const el = document.getElementById('pf-img-preview');
  if(!el) return;
  if(src) {
    el.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
  } else {
    el.innerHTML = '<span style="font-size:1.8rem">👗</span>';
  }
}

/* ── Blog Admin ── */
function renderBlogAdm() {
  const el = document.getElementById('blogListAdm');
  if(!el) return;
  el.innerHTML = BLOG_POSTS.map(p=>`
    <div class="blog-list-item">
      <img src="${p.img}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;flex-shrink:0" alt="">
      <div class="blog-list-item-info">
        <div class="blog-list-item-title">${p.title}</div>
        <div class="blog-list-item-meta">${p.cat} · ${p.date||'2026'} · <span style="color:#6c63ff">${(p.keywords||'').split(',')[0]}</span></div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="editBlogPost(${p.id})">✏️</button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteBlogPost(${p.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function saveBlogPost() {
  try {
    // Lecture null-safe de tous les champs
    const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };

    const title = getVal('bf-title').trim();
    if(!title) { toast('Remplissez le titre','⚠️'); return; }

    // Image : priorité base64 uploadée > URL saisie > défaut
    const previewWrap = document.getElementById('bf-img-preview');
    const previewImgEl = previewWrap ? previewWrap.querySelector('img') : null;
    let imgVal = getVal('bf-img').trim() || 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&q=80';
    if(previewImgEl && previewImgEl.src && previewImgEl.src.startsWith('data:image')) {
      imgVal = previewImgEl.src;
    }

    const post = {
      id: editingBlogId || Date.now(),
      title,
      cat: getVal('bf-cat') || 'guide',
      img: imgVal,
      excerpt: getVal('bf-excerpt') || title,
      content: getVal('bf-content') || `<p>${title}</p>`,
      keywords: getVal('bf-keywords'),
      date: new Date().toISOString().split('T')[0],
      affiliatedProducts: getBlogSelectedAffiliateProducts()
    };

    if(editingBlogId) {
      const idx = BLOG_POSTS.findIndex(p => p.id === editingBlogId);
      if(idx > -1) BLOG_POSTS[idx] = post;
      showSaveBanner('Blog', 'Article modifié avec succès');
    } else {
      BLOG_POSTS.unshift(post);
      showSaveBanner('Blog', 'Article publié avec succès');
    }

    try {
      localStorage.setItem('vn_blog', JSON.stringify(BLOG_POSTS));
    } catch(e) {
      try {
        ['vn_cart','vn_wish'].forEach(k => localStorage.removeItem(k));
        localStorage.setItem('vn_blog', JSON.stringify(BLOG_POSTS));
        toast('⚠️ Cache purgé pour libérer de l\'espace.');
      } catch(_) {
        toast('❌ Stockage plein. Utilisez des URL externes pour les images.','⚠️');
      }
    }

    const savedBlogAffiliatedIds = post.affiliatedProducts || [];

    // Verrouiller la sélection affiliés pendant les re-renders
    _lockAffiliates(undefined, savedBlogAffiliatedIds);

    _resetBlogFormBase();
    if(typeof DataSync !== 'undefined') DataSync.save();
    if(typeof renderBlogAdm === 'function') renderBlogAdm();
    if(typeof renderBlogGrid === 'function') renderBlogGrid();
    if(typeof renderHomeBlog === 'function') renderHomeBlog();
    const dashEl = document.getElementById('dash-blog');
    if(dashEl) dashEl.textContent = BLOG_POSTS.length;

  } catch(err) {
    console.error('saveBlogPost error:', err);
    toast('❌ Erreur lors de la sauvegarde : ' + err.message, '⚠️');
  }
}

function editBlogPost(id) {
  const p = BLOG_POSTS.find(x=>x.id===id);
  if(!p) { toast('Article introuvable','⚠️'); return; }
  editingBlogId = id;

  // Remplir les champs — null-safe
  const setVal = (elId, val) => { const el=document.getElementById(elId); if(el) el.value = val||''; };
  setVal('bf-title',   p.title);
  setVal('bf-excerpt', p.excerpt);
  setVal('bf-content', p.content || '');
  setVal('bf-keywords',p.keywords || '');

  // Catégorie
  const catEl = document.getElementById('bf-cat');
  if(catEl) catEl.value = p.cat || 'guide';

  // Image
  const imgEl = document.getElementById('bf-img');
  if(imgEl) imgEl.value = (p.img && !p.img.startsWith('data:')) ? p.img : '';
  if(typeof setBlogImgPreview === 'function') setBlogImgPreview(p.img);

  // Produits affiliés
  if(typeof renderBlogAffiliateProductSelection === 'function')
    renderBlogAffiliateProductSelection(p.affiliatedProducts || []);

  document.getElementById('blogFormTitle').textContent = '✏️ Modifier l\'article';
  const cancelBtn = document.getElementById('cancelBlogBtn');
  if(cancelBtn) cancelBtn.style.display = 'block';
  const tab = document.getElementById('adm-blog-adm');
  if(tab) tab.scrollIntoView({behavior:'smooth'});
}

function deleteBlogPost(id) {
  if(!confirm('Supprimer cet article ?')) return;
  BLOG_POSTS = BLOG_POSTS.filter(p=>p.id!==id);
  localStorage.setItem('vn_blog', JSON.stringify(BLOG_POSTS));
  if(typeof DataSync !== 'undefined') DataSync.save();
  renderBlogAdm(); renderBlogGrid(); renderHomeBlog();
  toast('Article supprimé');
}

function _resetBlogFormBase() {
  editingBlogId = null;
  ['bf-title','bf-img','bf-excerpt','bf-content','bf-keywords'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const catEl = document.getElementById('bf-cat'); if(catEl) catEl.value = 'guide';
  const titleEl = document.getElementById('blogFormTitle'); if(titleEl) titleEl.textContent = '✍️ Nouvel article';
  const cancelBtn = document.getElementById('cancelBlogBtn'); if(cancelBtn) cancelBtn.style.display = 'none';
  const fileEl = document.getElementById('bf-img-file'); if(fileEl) fileEl.value = '';
  const prevEl = document.getElementById('bf-img-preview');
  if(prevEl) prevEl.innerHTML = '<span style="color:#555;font-size:12px">Aperçu de l\'image</span>';
}

// Reset complet (bouton Annuler)
function resetBlogForm() {
  _resetBlogFormBase();
  if(typeof renderBlogAffiliateProductSelection === 'function') renderBlogAffiliateProductSelection([]);
}

/* ── Blog: Upload image locale avec compression ── */
function handleBlogImageUpload(input) {
  const file = input.files[0];
  if(!file) return;
  if(file.size > 20 * 1024 * 1024) { toast('Image trop lourde (max 20 Mo)','⚠️'); input.value=''; return; }
  toast('Compression en cours… ⏳');
  // Max 1200×800px, qualité 0.72 → image hero légère et persistante
  compressImage(file, 1200, 800, 0.72, compressed => {
    document.getElementById('bf-img').value = '';
    setBlogImgPreview(compressed);
    toast('✅ Image compressée et prête — Publiez l\'article');
  });
}

function setBlogImgPreview(src) {
  const el = document.getElementById('bf-img-preview');
  if(!el) return;
  if(src && src.length > 4) {
    el.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" alt="Aperçu">`;
  } else {
    el.innerHTML = '<span style="color:#555;font-size:12px">Aperçu de l\'image</span>';
  }
}

function prefillSeoArticle() {
  const templates = [
    { title:"Caftan Marocain Luxe 2026 — Tendances et Prix", cat:"seo", keywords:"caftan marocain luxe 2026, caftan prix, caftan tendance",
      excerpt:"Découvrez les tendances du caftan marocain luxe pour 2026. Prix, matières, couleurs : le guide complet.",
      content:`<h2>Introduction</h2><p>Le caftan marocain luxe connaît un regain d'intérêt mondial en 2026...</p><h2>Les Prix du Caftan Luxe</h2><p>Les prix varient de 2000 à 8000 MAD selon la qualité...</p><h2>Où Commander ?</h2><p>VaporNova propose des caftans sur mesure livrés dans le monde entier.</p>` },
    { title:"Takchita Mariage Pas Cher — Guide 2026", cat:"mariage", keywords:"takchita mariage pas cher, takchita prix 2026",
      excerpt:"Comment trouver une belle takchita de mariage à prix abordable ? Notre guide complet 2026.",
      content:`<h2>Takchita Mariage Prix</h2><p>Une belle takchita ne doit pas nécessairement coûter une fortune...</p><h2>Notre Sélection</h2><p>Chez VaporNova, nous proposons des takchitas dès 3000 MAD.</p>` },
    { title:"Comment Entretenir son Caftan Marocain ?", cat:"conseil", keywords:"entretien caftan, laver caftan, caftan soie entretien",
      excerpt:"Conseils d'experts pour entretenir votre caftan marocain et le garder comme neuf pendant des années.",
      content:`<h2>Entretien du Caftan</h2><p>Un caftan bien entretenu peut durer toute une vie...</p><h2>Lavage à la Main</h2><p>Toujours laver votre caftan à la main avec un savon doux...</p>` }
  ];
  const t = templates[Math.floor(Math.random()*templates.length)];
  document.getElementById('bf-title').value = t.title;
  document.getElementById('bf-cat').value = t.cat;
  document.getElementById('bf-keywords').value = t.keywords;
  document.getElementById('bf-excerpt').value = t.excerpt;
  document.getElementById('bf-content').value = t.content;
  document.getElementById('bf-img').value = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';
  setBlogImgPreview('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800');
  toast('Modèle SEO chargé ! Personnalisez et publiez 📝');
}

/* ── Payments Admin ── */
function renderPaymentsTab() {
  const settings = localStorage.getItem('vn_settings') ? JSON.parse(localStorage.getItem('vn_settings')) : {};
  const paypal = settings.paypal || 'sdn.sebti@gmail.com';

  // PayPal status
  const el = document.getElementById('paypal-status-display');
  if(el) el.innerHTML = `🅿️ <strong style="color:#5ba3d9">${paypal}</strong> — <span style="color:#27ae60">✅ Compte configuré</span>`;
  const paypalEmailEl = document.getElementById('paypal-email-pay');
  if(paypalEmailEl) paypalEmailEl.value = paypal;

  // Taux
  const rate = parseFloat(localStorage.getItem('vn_mad_rate') || '0.093');
  const rateEl = document.getElementById('mad-rate');
  if(rateEl) rateEl.value = rate;

  // Stripe config
  const cfg = getStripeConfig();
  if(cfg.pk && document.getElementById('stripe-pk')) document.getElementById('stripe-pk').value = cfg.pk;
  if(cfg.sk && document.getElementById('stripe-sk')) document.getElementById('stripe-sk').value = cfg.sk;
  if(cfg.currency && document.getElementById('stripe-currency')) document.getElementById('stripe-currency').value = cfg.currency;
  if(cfg.mode && document.getElementById('stripe-mode')) document.getElementById('stripe-mode').value = cfg.mode;
  updateStripeStatusBadge();

  // Méthodes actives
  const pm = getPaymentMethods();
  if(document.getElementById('pm-whatsapp')) document.getElementById('pm-whatsapp').checked = pm.whatsapp !== false;
  if(document.getElementById('pm-paypal')) document.getElementById('pm-paypal').checked = pm.paypal !== false;
  if(document.getElementById('pm-card')) document.getElementById('pm-card').checked = !!pm.card;

  // Transactions
  renderTransactionsList();
}
function saveRate() {
  const rate = parseFloat(document.getElementById('mad-rate').value) || 0.093;
  localStorage.setItem('vn_mad_rate', rate.toString());
  showSaveBanner('PayPal', `Taux MAD→EUR mis à jour: 1 MAD = ${rate} EUR`);
}

/* ── Orders Admin ── */
let _orderPhotoBase64 = null;

function renderOrdersTable() {
  const tb = document.getElementById('ordersTableBody');
  if(!tb) return;
  // Also populate the select
  const sel = document.getElementById('of-select-id');
  if(sel) {
    sel.innerHTML = '<option value="">— Choisir une commande —</option>' + ORDERS.map(o=>`<option value="${o.id}">${o.id} — ${o.name}</option>`).join('');
  }
  tb.innerHTML = ORDERS.map(o=>{
    const cur = o.history&&o.history.length>0 ? o.history[o.history.length-1] : null;
    const sc = STATUS_CLS[cur?cur.step:'En attente']||'sb-wait';
    const photoCount = o.history ? o.history.filter(h=>h.photo).length : 0;
    return `<tr>
      <td style="font-weight:700;color:#e8c96a">${o.id}</td>
      <td>${o.name}</td>
      <td style="max-width:180px;font-size:12px">${o.desc||'-'}</td>
      <td style="font-size:11px;color:#6c8">${o.email||'-'}</td>
      <td><span class="sb ${sc}">${cur?cur.step:'En attente'}</span></td>
      <td style="font-size:12px;color:#888">📷 ${photoCount}</td>
      <td><button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteOrder('${o.id}')">🗑️</button></td>
    </tr>`;
  }).join('');
}

function onOrderSelect(id) {
  _orderPhotoBase64 = null;
  document.getElementById('of-photo-preview').innerHTML = '<span style="color:#555;font-size:12px">Aperçu de la photo</span>';
  document.getElementById('of-photo-file').value = '';
  if(!id) return;
  const o = ORDERS.find(x=>x.id===id);
  if(!o) return;
  const cur = o.history&&o.history.length>0 ? o.history[o.history.length-1] : null;
  if(cur) {
    document.getElementById('of-step').value = cur.step;
    if(cur.photo) {
      document.getElementById('of-photo-preview').innerHTML = `<img src="${cur.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" alt="Photo étape">`;
    }
  }
}

function handleOrderPhotoUpload(input) {
  const file = input.files[0];
  if(!file) return;
  if(file.size > 20 * 1024 * 1024) { toast('Image trop lourde (max 20 Mo)','⚠️'); input.value=''; return; }
  toast('Compression en cours… ⏳');
  compressImage(file, 1000, 750, 0.75, compressed => {
    _orderPhotoBase64 = compressed;
    document.getElementById('of-photo-preview').innerHTML = `<img src="${compressed}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" alt="Photo étape">`;
    toast('✅ Photo prête');
  });
}

function saveOrderStep() {
  const id = document.getElementById('of-select-id').value;
  const step = document.getElementById('of-step').value;
  if(!id) { toast('Choisissez une commande','⚠️'); return; }
  const o = ORDERS.find(x=>x.id===id);
  if(!o) { toast('Commande introuvable','⚠️'); return; }
  const photo = _orderPhotoBase64 || (o.history&&o.history.length>0 ? o.history[o.history.length-1].photo : 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=400');
  o.history = o.history || [];
  o.history.push({ step, photo, date: new Date().toLocaleDateString('fr-FR') });
  try {
    localStorage.setItem('vn_orders', JSON.stringify(ORDERS));
    if(typeof DataSync !== 'undefined') DataSync.save();
  } catch(e) {
    toast('❌ Stockage plein — supprimez des commandes ou utilisez des URL externes','⚠️'); return;
  }
  _orderPhotoBase64 = null;
  document.getElementById('of-photo-file').value = '';
  renderOrdersTable();
  document.getElementById('dash-orders').textContent = ORDERS.length;
  showSaveBanner('Commande', `${id} — étape "${step}" mise à jour`);
}

function createOrderManual() {
  const id = document.getElementById('of-id').value.trim().toUpperCase();
  const name = document.getElementById('of-name').value.trim();
  const desc = document.getElementById('of-desc').value.trim();
  if(!id || !name) { toast('Remplissez le code et le nom','⚠️'); return; }
  const existing = ORDERS.find(o=>o.id===id);
  if(existing) { toast('Ce code existe déjà — utilisez "Mettre à jour"','⚠️'); return; }
  ORDERS.push({id, name, desc, email:'', history:[{step:'En attente', photo:'https://images.unsplash.com/photo-1583001809873-a128495da465?w=400', date: new Date().toLocaleDateString('fr-FR')}]});
  localStorage.setItem('vn_orders', JSON.stringify(ORDERS));
  document.getElementById('of-id').value='';
  document.getElementById('of-name').value='';
  document.getElementById('of-desc').value='';
  renderOrdersTable();
  document.getElementById('dash-orders').textContent = ORDERS.length;
  showSaveBanner('Commande', `${id} créée avec succès`);
}

function saveOrder() { createOrderManual(); }

function deleteOrder(id) {
  if(!confirm('Supprimer cette commande ?')) return;
  ORDERS = ORDERS.filter(o=>o.id!==id);
  localStorage.setItem('vn_orders', JSON.stringify(ORDERS));
  renderOrdersTable();
  toast('Commande supprimée');
}

/* ── Ads Admin ── */
function renderAdsToggle() {
  const el = document.getElementById('adsToggleList');
  if(!el) return;
  const _DEFAULTS = typeof ADS_DEFAULTS !== 'undefined' ? ADS_DEFAULTS : { adsenseId:'ca-pub-7479282629047694', strategy:'blog_heavy', home_top:true, between_products:false, footer:false, blog_top:true, blog_bottom:true };
  const _CONFIG   = typeof ADS_CONFIG   !== 'undefined' ? ADS_CONFIG   : _DEFAULTS;
  el.innerHTML = document.getElementById('adsenseId') ? '' : '';
  document.getElementById('adsenseId').value = _CONFIG.adsenseId || _DEFAULTS.adsenseId;
  document.getElementById('adStrategy').value = _CONFIG.strategy || 'blog_heavy';

  const zones = [
    { key:'home_top', label:"🏠 Accueil — Bandeau top", desc:"Bannière 728×90 juste après le hero" },
    { key:'between_products', label:"🛍 Entre les produits vedettes", desc:"Rectangle 336×280 au milieu de la home" },
    { key:'footer', label:"📋 Bas de page home", desc:"Bannière 728×90 avant le footer" },
    { key:'blog_top', label:"📝 Blog — Haut de la liste", desc:"Rectangle avant la liste d'articles (très efficace)" },
    { key:'blog_bottom', label:"📝 Blog — Bas de la liste", desc:"Bannière après la liste d'articles" },
  ];
  el.innerHTML = zones.map(z=>`
    <div class="toggle-row">
      <div class="toggle-info">
        <div class="toggle-label">${z.label}</div>
        <div class="toggle-desc">${z.desc}</div>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" ${_CONFIG[z.key]?'checked':''} onchange="toggleAd('${z.key}',this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>`).join('');
}

function toggleAd(key, val) {
  ADS_CONFIG[key] = val;
  // Ensure adsenseId is never lost when saving
  if(!ADS_CONFIG.adsenseId) ADS_CONFIG.adsenseId = ADS_DEFAULTS.adsenseId;
  localStorage.setItem('vn_ads', JSON.stringify(ADS_CONFIG));
  applyAdsConfig();
  const labels = {'home_top':'Accueil top','between_products':'Entre produits','footer':'Pied de page','blog_top':'Blog haut','blog_bottom':'Blog bas'};
  showSaveBanner('Zone pub', `${labels[key]||key} ${val?'✅ activée':'❌ désactivée'}`);
}

function saveAdsConfig() {
  const newId = document.getElementById('adsenseId').value.trim();
  ADS_CONFIG.adsenseId = newId || ADS_DEFAULTS.adsenseId;
  ADS_CONFIG.strategy = document.getElementById('adStrategy').value;
  // Save merged object to localStorage
  localStorage.setItem('vn_ads', JSON.stringify(ADS_CONFIG));
  applyAdsConfig();
  renderAdsToggle();
  showSaveBanner('AdSense', `✅ ID sauvegardé: ${ADS_CONFIG.adsenseId}`);
}

/* ── Promo Admin ── */
function renderPromoProductSelect() {
  const sel = document.getElementById('promo-product');
  if(!sel) return;
  sel.innerHTML = PRODUCTS.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
}

function savePromo() {
  const pId = parseInt(document.getElementById('promo-product').value);
  const pct = parseInt(document.getElementById('promo-pct').value);
  if(!pct || pct<1 || pct>80) { toast('Entrez une réduction valide (1-80%)','⚠️'); return; }
  const p = PRODUCTS.find(x=>x.id===pId);
  if(p) {
    p.old = p.price;
    p.price = Math.round(p.price * (1 - pct/100));
    p.badge = 'Promo';
    localStorage.setItem('vn_products', JSON.stringify(PRODUCTS));
    renderShop(); renderFeatured(); renderProductsTable();
    document.getElementById('promoList').innerHTML = `
      <div style="background:#1a1a28;border-radius:8px;padding:12px;display:flex;gap:12px;align-items:center">
        <span style="color:#e8c96a;font-weight:700">${p.name}</span>
        <span class="adm-badge adm-badge-green">-${pct}%</span>
        <span style="color:#555;font-size:12px">${p.old?.toLocaleString()} → ${p.price.toLocaleString()} MAD</span>
      </div>`;
    showSaveBanner('Promotion', `-${pct}% appliqué sur ${p.name}`);
  }
}

/* ── Settings ── */
async function saveSettings() {
  const pwd = document.getElementById('set-pwd').value;
  if(pwd) {
    adminPwdHash = await hashPwd(pwd);
    localStorage.setItem(ADMIN_PWD_KEY, adminPwdHash);
  }
  const settings = {
    name: document.getElementById('set-name').value,
    wa: document.getElementById('set-wa').value,
    email: document.getElementById('set-email').value,
    paypal: document.getElementById('set-paypal').value.trim() || 'sdn.sebti@gmail.com',
    addr: document.getElementById('set-addr').value,
  };
  // Stripe Payment Link
  const stripeLink = document.getElementById('set-stripe-link')?.value.trim();
  if(stripeLink) localStorage.setItem('vn_stripe_link', stripeLink);
  const seoTitle = document.getElementById('set-seo-title').value;
  const seoDesc = document.getElementById('set-seo-desc').value;
  if(seoTitle) document.title = seoTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', seoDesc);
  localStorage.setItem('vn_settings', JSON.stringify(settings));
  if(typeof DataSync !== 'undefined') DataSync.save();
  showSaveBanner('Paramètres', 'Tous les paramètres sauvegardés');
}

/* ── Revenue Chart ── */
function renderRevChart() {
  const el = document.getElementById('revChart');
  if(!el) return;
  const days = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
  const vals = [2800,3200,1500,4500,6200,8400,5100];
  const max = Math.max(...vals);
  el.innerHTML = vals.map((v,i)=>`
    <div class="rev-bar-wrap">
      <div class="rev-bar" style="height:${Math.round((v/max)*100)}px" title="${v.toLocaleString()} MAD"></div>
      <div class="rev-bar-lbl">${days[i]}</div>
    </div>`).join('');
}


/* ═══════════ AFFILIATE PRODUCT SELECTION ═══════════ */
// Product Affiliate Selection (NO LIMIT - like blog)
function renderAffiliateProductSelection(selectedIds = []) {
  console.trace('[AFF-SELECT] renderAffiliateProductSelection appelé avec IDs:', selectedIds, '| _affiliateLocked:', _affiliateLocked);
  const container = document.getElementById('pf-affiliated-products');
  if(!container) return;
  
  if(!AFFILIATE_PRODUCTS || AFFILIATE_PRODUCTS.length === 0) {
    container.innerHTML = '<div style="padding:12px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:6px;font-size:12px;color:var(--gold2)">Aucun produit affilié disponible. Créez-en dans l\'onglet "Affiliés".</div>';
    return;
  }
  
  container.innerHTML = AFFILIATE_PRODUCTS.map(ap => {
    const isSelected = selectedIds.includes(ap.id);
    
    return `
      <label style="display:flex;align-items:center;gap:10px;padding:10px;background:${isSelected?'rgba(201,168,76,0.08)':'rgba(255,255,255,0.02)'};border:1px solid ${isSelected?'var(--gold2)':'var(--border)'};border-radius:6px;cursor:pointer;transition:all 0.2s" onmouseenter="this.style.borderColor='var(--gold2)'" onmouseleave="this.style.borderColor='${isSelected?'var(--gold2)':'var(--border)'}'">
        <input type="checkbox" 
               value="${ap.id}" 
               ${isSelected?'checked':''} 
               onchange="toggleAffiliateProduct(this)"
               style="width:18px;height:18px;cursor:pointer">
        <img src="${ap.img}" alt="${ap.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--ice);margin-bottom:2px">${ap.name}</div>
          <div style="font-size:11px;color:var(--gold2)">${ap.price ? ap.price.toLocaleString() + ' €' : ''} ${'★'.repeat(ap.stars||5)}</div>
        </div>
      </label>
    `;
  }).join('');
}

// Blog Affiliate Selection (NO LIMIT)
function renderBlogAffiliateProductSelection(selectedIds = []) {
  const container = document.getElementById('bf-affiliated-products');
  if(!container) return;
  
  if(!AFFILIATE_PRODUCTS || AFFILIATE_PRODUCTS.length === 0) {
    container.innerHTML = '<div style="padding:12px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:6px;font-size:12px;color:var(--gold2)">Aucun produit affilié disponible. Créez-en dans l\'onglet "Affiliés".</div>';
    return;
  }
  
  container.innerHTML = AFFILIATE_PRODUCTS.map(ap => {
    const isSelected = selectedIds.includes(ap.id);
    
    return `
      <label style="display:flex;align-items:center;gap:10px;padding:10px;background:${isSelected?'rgba(201,168,76,0.08)':'rgba(255,255,255,0.02)'};border:1px solid ${isSelected?'var(--gold2)':'var(--border)'};border-radius:6px;cursor:pointer;transition:all 0.2s" onmouseenter="this.style.borderColor='var(--gold2)'" onmouseleave="this.style.borderColor='${isSelected?'var(--gold2)':'var(--border)'}'">
        <input type="checkbox" 
               value="${ap.id}" 
               ${isSelected?'checked':''} 
               onchange="toggleBlogAffiliateProduct(this)"
               style="width:18px;height:18px;cursor:pointer">
        <img src="${ap.img}" alt="${ap.name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--ice);margin-bottom:2px">${ap.name}</div>
          <div style="font-size:11px;color:var(--gold2)">${ap.price ? ap.price.toLocaleString() + ' €' : ''} ${'★'.repeat(ap.stars||5)}</div>
        </div>
      </label>
    `;
  }).join('');
}

function toggleAffiliateProduct(checkbox) {
  // No limit - just update visual selection
  const allBoxes = document.querySelectorAll('#pf-affiliated-products input[type="checkbox"]');
  allBoxes.forEach(box => {
    if(box.checked) {
      box.parentElement.style.background = 'rgba(201,168,76,0.08)';
      box.parentElement.style.borderColor = 'var(--gold2)';
    } else {
      box.parentElement.style.background = 'rgba(255,255,255,0.02)';
      box.parentElement.style.borderColor = 'var(--border)';
    }
  });
}

function toggleBlogAffiliateProduct(checkbox) {
  // No limit for blog - just update visual
  const allBoxes = document.querySelectorAll('#bf-affiliated-products input[type="checkbox"]');
  allBoxes.forEach(box => {
    if(box.checked) {
      box.parentElement.style.background = 'rgba(201,168,76,0.08)';
      box.parentElement.style.borderColor = 'var(--gold2)';
    } else {
      box.parentElement.style.background = 'rgba(255,255,255,0.02)';
      box.parentElement.style.borderColor = 'var(--border)';
    }
  });
}

function getSelectedAffiliateProducts() {
  try {
    const checkboxes = document.querySelectorAll('#pf-affiliated-products input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  } catch(e) { return []; }
}

function getBlogSelectedAffiliateProducts() {
  try {
    const checkboxes = document.querySelectorAll('#bf-affiliated-products input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  } catch(e) { return []; }
}
