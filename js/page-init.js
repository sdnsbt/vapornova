/* Setze aktive Navigation basierend auf aktueller Seite */
window.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navMap = {
    'index.html': 'nav-home',
    'boutique.html': 'nav-shop',
    'affiliation.html': 'nav-affiliate',
    'blog.html': 'nav-blog',
    'contact.html': 'nav-contact'
  };
  
  // Entferne alle aktiven Klassen
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  
  // Setze aktive Klasse für aktuelle Seite
  const activeNavId = navMap[currentPage] || 'nav-home';
  const activeNav = document.getElementById(activeNavId);
  if(activeNav) activeNav.classList.add('active');
});

/* Auto-render content on page load — avec chargement data.json */
window.addEventListener('DOMContentLoaded', async () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // 1. Charger les données depuis data.json (si serveur dispo)
  if (typeof DataSync !== 'undefined') {
    await DataSync.load();
  }

  // 2. Rendre la page avec les données à jour
  function render() {
    if(typeof updateCartBadge === 'function') updateCartBadge();

    if(currentPage === 'index.html') {
      if(typeof renderFeatured === 'function') renderFeatured();
      if(typeof renderHomeBlog === 'function') renderHomeBlog();
    }
    if(currentPage === 'boutique.html') {
      if(typeof renderShop === 'function') renderShop();
    }
    if(currentPage === 'affiliation.html') {
      if(typeof renderAffiliatePage === 'function') renderAffiliatePage();
    }
    if(currentPage === 'blog.html') {
      if(typeof renderBlogGrid === 'function') renderBlogGrid();
      if(typeof renderBlogAffiliateProducts === 'function') renderBlogAffiliateProducts();
    }
    if(typeof applyAdsConfig === 'function') applyAdsConfig();
  }

  render();
});
