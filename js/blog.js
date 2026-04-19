/* ═══════════ INLINE AFFILIATE RENDERER ═══════════ */
function affiliateInlineCardHTML(product) {
  const stars = '★'.repeat(product.stars || 5) + '☆'.repeat(5 - (product.stars || 5));
  return `
  <div class="blog-affiliate-inline" onclick="window.open('${product.affiliateLink}','_blank')">
    <div class="blog-affiliate-inline-img">
      <img src="${product.img}" alt="${product.name}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=600&q=80'">
      ${product.badge ? `<span class="blog-affiliate-inline-badge">${product.badge}</span>` : ''}
      <div class="blog-affiliate-inline-tag">Produit recommandé</div>
    </div>
    <div class="blog-affiliate-inline-body">
      <div class="blog-affiliate-inline-stars">${stars}</div>
      <div class="blog-affiliate-inline-name">${product.name}</div>
      <p class="blog-affiliate-inline-desc">${product.desc || ''}</p>
      <div class="blog-affiliate-inline-footer">
        <div class="blog-affiliate-inline-price">${product.price ? product.price.toLocaleString('fr-FR') + ' €' : 'Voir le prix'}</div>
        <div class="blog-affiliate-inline-cta">Voir l\'offre →</div>
      </div>
    </div>
  </div>`;
}

function renderContentWithAffiliates(rawContent) {
  return rawContent.replace(/\[\[AFFILIE:([^\]]+)\]\]/g, (match, id) => {
    const product = AFFILIATE_PRODUCTS.find(p => p.id === id.trim());
    if (!product) return '';
    return affiliateInlineCardHTML(product);
  });
}

/* ═══════════ BLOG ═══════════ */
function blogCardHTML(post, mini=false) {
  return `
  <div class="blog-card" onclick="openArticle(${post.id})">
    <div style="overflow:hidden;height:200px">
      <img class="blog-card-img" src="${post.img}" alt="${post.title}" loading="lazy">
    </div>
    <div class="blog-card-body">
      <span class="blog-card-cat">${post.cat}</span>
      <div class="blog-card-title">${post.title}</div>
      <p class="blog-card-excerpt">${post.excerpt}</p>
      <div class="blog-card-meta">
        <span>📅 ${post.date||'2026'}</span>
        <span>📖 5 min de lecture</span>
      </div>
      <button class="blog-read-more" style="margin-top:12px">Lire l'article →</button>
    </div>
  </div>`;
}

function renderBlogGrid() {
  const el = document.getElementById('blogGrid');
  if(!el) return;
  el.innerHTML = BLOG_POSTS.map(p=>blogCardHTML(p)).join('');
}

function renderHomeBlog() {
  const el = document.getElementById('homeBlogGrid');
  if(!el) return;
  el.innerHTML = BLOG_POSTS.slice(0,3).map(p=>blogCardHTML(p)).join('');
}

function openArticle(id) {
  const post = BLOG_POSTS.find(p=>p.id===id);
  if(!post) return;
  
  // Speichere aktuellen Post für Affiliate-Anzeige
  window.currentBlogPost = post;
  
  // Naviguer vers la page blog sans réinitialiser la vue article
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-blog');
  if(pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  const nl = document.getElementById('nav-blog');
  if(nl) nl.classList.add('active');
  // Afficher la vue article
  document.getElementById('blogListSection').style.display='none';
  document.getElementById('blogArticleSection').style.display='block';
  // Related articles
  const related = BLOG_POSTS.filter(p=>p.id!==id).slice(0,3);
  document.getElementById('blogArticleContent').innerHTML = `
    <div class="blog-article-header">
      <span class="blog-article-cat">${post.cat || post.tag || ''}</span>
      <h1 class="blog-article-title">${post.title}</h1>
      <div class="blog-article-meta">
        <span>📅 ${post.date||'2026'}</span>
        <span>📖 5 min de lecture</span>
        <span>🏷️ ${(post.keywords||'').split(',').slice(0,2).join(', ')}</span>
      </div>
    </div>
    <img class="blog-article-hero" src="${post.img}" alt="${post.title}" loading="lazy">
    
    <!-- AD inline article top — machine AdSense -->
    <div class="ad-zone blog-ad-inline" style="border-radius:var(--r)">
      <span class="ad-zone-label">Publicité</span>
      <div class="ad-placeholder">Publicité</div>
    </div>
    
    <div class="blog-article-content">${renderContentWithAffiliates(post.content || '<p>' + (post.excerpt || '') + '</p>')}</div>
    
    <!-- AD inline article milieu -->
    <div class="ad-zone blog-ad-inline" style="border-radius:var(--r)">
      <span class="ad-zone-label">Publicité</span>
      <div class="ad-placeholder">Publicité</div>
    </div>
    
    <!-- CTA produit -->
    <div style="background:var(--ink3);border:1px solid var(--border);border-radius:var(--r);padding:24px;margin-top:32px;text-align:center">
      <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--gold2);margin-bottom:8px">Prête à commander votre caftan ? ✨</div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Découvrez notre collection et commandez sur mesure avec livraison internationale.</p>
      <span class="btn-hero btn-primary" onclick="showPage('shop')">Voir la boutique →</span>
    </div>
    
    <!-- AD article bas -->
    <div class="ad-zone blog-ad-inline" style="border-radius:var(--r)">
      <span class="ad-zone-label">Publicité</span>
      <div class="ad-placeholder">Publicité</div>
    </div>
    
    <!-- Related -->
    <div class="blog-related">
      <div class="blog-related-title">Articles similaires</div>
      <div class="blog-related-grid">
        ${related.map(p=>`
          <div class="blog-card" onclick="openArticle(${p.id})" style="cursor:pointer">
            <div style="height:120px;overflow:hidden"><img class="blog-card-img" src="${p.img}" alt="${p.title}" loading="lazy" style="height:120px"></div>
            <div class="blog-card-body" style="padding:14px">
              <div class="blog-card-title" style="font-size:1rem">${p.title}</div>
              <button class="blog-read-more" style="margin-top:8px">Lire →</button>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
  window.scrollTo(0,0);
  // Affiliate-Produkte für diesen Artikel anzeigen
  setTimeout(() => renderBlogAffiliateProductsInArticle(post), 100);
}

function showBlogList() {
  document.getElementById('blogListSection').style.display='block';
  document.getElementById('blogArticleSection').style.display='none';
  // Reset article affiliate section
  const artAff = document.getElementById('blogArticleAffiliateSection');
  if(artAff) artAff.style.display='none';
  window.currentBlogPost = null;
  renderBlogGrid();
  renderBlogAffiliateProducts(); // Liste-Affiliates wieder anzeigen
  window.scrollTo(0,0);
}


/* ═══════════ AFFILIATE IN BLOG ═══════════ */
function renderBlogAffiliateProducts() {
  const el = document.getElementById('blogAffiliateGrid');
  if(!el) return;
  
  if(!AFFILIATE_PRODUCTS || AFFILIATE_PRODUCTS.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--muted);grid-column:1/-1;padding:40px">Aucun produit affilié disponible</div>';
    return;
  }
  
  el.innerHTML = AFFILIATE_PRODUCTS.map(p => affiliateCardHTML(p)).join('');
}

/* ═══ Affiliate-Produkte im Artikel ═══ */
function renderBlogAffiliateProductsInArticle(post) {
  const section = document.getElementById('blogArticleAffiliateSection');
  const grid = document.getElementById('blogArticleAffiliateGrid');
  if (!section || !grid) return;
  const ids = (post && post.affiliatedProducts) ? post.affiliatedProducts : [];
  const list = ids.length ? AFFILIATE_PRODUCTS.filter(ap => ids.includes(ap.id)) : [];
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = list.map(p => `
    <div style="background:var(--ink2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all 0.3s;cursor:pointer"
         onclick="window.open('${p.affiliateLink}','_blank')"
         onmouseenter="this.style.transform='translateY(-4px)';this.style.borderColor='var(--gold2)'"
         onmouseleave="this.style.transform='translateY(0)';this.style.borderColor='var(--border)'">
      <div style="position:relative;height:200px;overflow:hidden">
        <img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=600&q=80'">
        ${p.badge ? `<span style="position:absolute;top:12px;right:12px;background:var(--gold);color:var(--ink);font-size:10px;font-weight:700;padding:4px 10px;border-radius:6px">${p.badge}</span>` : ''}
        <div style="position:absolute;top:12px;left:12px;background:linear-gradient(135deg,#27ae60,#1e8449);color:white;font-size:9px;font-weight:800;padding:4px 8px;border-radius:4px;letter-spacing:1.5px">AFFILIÉ</div>
      </div>
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:var(--ice);margin-bottom:8px">${p.name}</div>
        <div style="color:var(--gold2);font-size:11px;margin-bottom:10px">${'★'.repeat(p.stars||5)}${'☆'.repeat(5-(p.stars||5))}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:18px;font-weight:700;color:var(--gold)">${p.price ? p.price.toLocaleString()+' €' : 'Voir prix'}</div>
          <div style="background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--ink);font-size:11px;font-weight:800;padding:6px 14px;border-radius:6px">Voir l'offre →</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Auto-render beim Laden
if(document.getElementById('blogAffiliateGrid')) {
  setTimeout(renderBlogAffiliateProducts, 100);
}
