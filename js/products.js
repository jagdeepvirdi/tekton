/* ============================================================
   TEKTON INDIA — products.js
   Loads products.json · Filters · Renders gallery
   ============================================================ */

(function () {
  'use strict';

  /* ── State ── */
  var allProducts = [];

  var state = {
    category:     'all',
    pattern:      'all',
    availability: 'all'   /* or 'in-stock' */
  };

  /* ── DOM refs (resolved after DOMContentLoaded) ── */
  var grid, countEl, clearBtn;

  /* ── Helpers ── */
  function formatPrice(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  var RESIN_PLACEHOLDER = {
    'black':        'linear-gradient(135deg,#0D0D0D 0%,#252525 100%)',
    'teal-blue':    'linear-gradient(135deg,#0A2A38 0%,#1A6B8A 100%)',
    'crimson-red':  'linear-gradient(135deg,#2E0505 0%,#7A1010 100%)',
    'slate-grey':   'linear-gradient(135deg,#18202A 0%,#3A4A5A 100%)',
    'forest-green': 'linear-gradient(135deg,#081408 0%,#1A5C2A 100%)',
    'ocean-blue':   'linear-gradient(135deg,#08122A 0%,#1A3A8B 100%)',
    'emerald-green':'linear-gradient(135deg,#071408 0%,#1A6B3A 100%)',
    'golden-amber': 'linear-gradient(135deg,#1E1000 0%,#8B6A1A 100%)',
    'jade-green':   'linear-gradient(135deg,#051410 0%,#1A6B50 100%)',
    'cerulean':     'linear-gradient(135deg,#081420 0%,#1A5A8A 100%)',
    'lilac':        'linear-gradient(135deg,#130820 0%,#6A3A9A 100%)',
    'periwinkle':   'linear-gradient(135deg,#080825 0%,#3A3A9A 100%)',
    'golden-blue':  'linear-gradient(135deg,#0E0E08 0%,#4A4A8A 100%)',
    'sapphire-blue':'linear-gradient(135deg,#02040E 0%,#1A2A7A 100%)',
    'white-pearl':  'linear-gradient(135deg,#141414 0%,#323232 100%)',
    'none':         'linear-gradient(135deg,#1E1208 0%,#3A2010 100%)'
  };

  function placeholderBg(product) {
    return RESIN_PLACEHOLDER[product.resinColor] ||
           'linear-gradient(135deg,#141518 0%,#1E1F23 100%)';
  }

  /* ── Archived card builder ── */
  function buildArchivedCard(product) {
    var href = 'product.html?id=' + product.id;
    var bg = placeholderBg(product);

    var img1 = (product.images && product.images[0])
      ? '<img src="' + product.images[0] + '" alt="' + product.name + '" class="primary"' +
        ' loading="lazy" onerror="this.parentElement.style.background=\'' + bg.replace(/'/g, "\\'") + '\';this.style.display=\'none\'">'
      : '';
    var img2 = (product.images && product.images[1])
      ? '<img src="' + product.images[1] + '" alt="' + product.name + ' — alternate view" class="secondary" loading="lazy">'
      : '';

    var card = document.createElement('a');
    card.href = href;
    card.className = 'product-card product-card--archived';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', product.name + ' — Sold. Request a similar piece.');
    card.innerHTML =
      '<div class="product-card-img-wrap" style="background:' + bg + '">' +
        img1 + img2 +
        '<span class="product-badge badge-sold">Sold</span>' +
        '<div class="product-card-placeholder" aria-hidden="true">' +
          '<svg viewBox="0 0 40 26"><rect x="0" y="0" width="40" height="26" rx="2"/>' +
          '<line x1="0" y1="13" x2="40" y2="13"/>' +
          '<line x1="6" y1="0" x2="6" y2="26" opacity=".4"/>' +
          '<line x1="14" y1="0" x2="14" y2="26" opacity=".3"/>' +
          '<line x1="22" y1="0" x2="22" y2="26" opacity=".4"/>' +
          '<line x1="30" y1="0" x2="30" y2="26" opacity=".3"/></svg>' +
        '</div>' +
      '</div>' +
      '<div class="product-card-body">' +
        '<span class="product-card-name">' + product.name + '</span>' +
        '<span class="product-card-subtitle">' + product.subtitle + '</span>' +
        '<span class="product-card-cta product-card-cta--similar">' +
          'Request Similar' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/>' +
          '<polyline points="9 4 13 8 9 12"/></svg>' +
        '</span>' +
      '</div>';

    return card;
  }

  /* ── Render Past Pieces (archived) section ── */
  function renderArchived() {
    var archived = allProducts.filter(function (p) {
      return (p.status || 'active') === 'archived';
    });
    var section = document.getElementById('past-pieces-section');
    if (!section) return;
    if (archived.length === 0) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    var pastGrid = document.getElementById('past-pieces-grid');
    if (!pastGrid) return;
    pastGrid.innerHTML = '';
    archived.forEach(function (p) {
      pastGrid.appendChild(buildArchivedCard(p));
    });
  }

  /* ── Card builder ── */
  function buildCard(product) {
    var href = 'product.html?id=' + product.id;
    var hasSale = product.originalPrice && product.originalPrice > product.price;
    var bg = placeholderBg(product);

    var badgeHtml = '';
    if (!product.inStock) {
      badgeHtml = '<span class="product-badge badge-soldout">Sold Out</span>';
    } else if (hasSale) {
      badgeHtml = '<span class="product-badge badge-sale">Sale</span>';
    }

    var priceHtml = hasSale
      ? '<span class="price">' + formatPrice(product.price) + '</span>' +
        '<span class="original-price">' + formatPrice(product.originalPrice) + '</span>'
      : '<span class="price">' + formatPrice(product.price) + '</span>';

    var img1 = (product.images && product.images[0])
      ? '<img src="' + product.images[0] + '" alt="' + product.name + '" class="primary"' +
        ' loading="lazy" onerror="this.parentElement.style.background=\'' + bg.replace(/'/g, "\\'") + '\';this.style.display=\'none\'">'
      : '';
    var img2 = (product.images && product.images[1])
      ? '<img src="' + product.images[1] + '" alt="' + product.name + ' — alternate view" class="secondary" loading="lazy">'
      : '';

    var card = document.createElement('a');
    card.href = href;
    card.className = 'product-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', product.name + ', ' + formatPrice(product.price));
    card.innerHTML =
      '<div class="product-card-img-wrap" style="background:' + bg + '">' +
        img1 + img2 +
        badgeHtml +
        '<div class="product-card-placeholder" aria-hidden="true">' +
          '<svg viewBox="0 0 40 26"><rect x="0" y="0" width="40" height="26" rx="2"/>' +
          '<line x1="0" y1="13" x2="40" y2="13"/>' +
          '<line x1="6" y1="0" x2="6" y2="26" opacity=".4"/>' +
          '<line x1="14" y1="0" x2="14" y2="26" opacity=".3"/>' +
          '<line x1="22" y1="0" x2="22" y2="26" opacity=".4"/>' +
          '<line x1="30" y1="0" x2="30" y2="26" opacity=".3"/></svg>' +
        '</div>' +
      '</div>' +
      '<div class="product-card-body">' +
        '<span class="product-card-name">' + product.name + '</span>' +
        '<span class="product-card-subtitle">' + product.subtitle + '</span>' +
        '<div class="product-card-price">' + priceHtml + '</div>' +
        '<span class="product-card-cta">' +
          'View Details' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/>' +
          '<polyline points="9 4 13 8 9 12"/></svg>' +
        '</span>' +
      '</div>';

    return card;
  }

  /* ── Skeleton placeholders shown while loading ── */
  function showSkeletons(n) {
    grid.innerHTML = '';
    for (var i = 0; i < n; i++) {
      grid.innerHTML +=
        '<div class="skeleton-card" aria-hidden="true">' +
          '<div class="skeleton-img"></div>' +
          '<div class="skeleton-body">' +
            '<div class="skeleton-line"></div>' +
            '<div class="skeleton-line skeleton-line--short"></div>' +
            '<div class="skeleton-line skeleton-line--price"></div>' +
          '</div>' +
        '</div>';
    }
  }

  /* ── Filter ── */
  function getFiltered() {
    return allProducts.filter(function (p) {
      if ((p.status || 'active') === 'archived') return false;
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.pattern  !== 'all' && p.resinPattern !== state.pattern)  return false;
      if (state.availability === 'in-stock' && !p.inStock) return false;
      return true;
    });
  }

  /* ── Render ── */
  function render() {
    var filtered = getFiltered();
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML =
        '<div class="gallery-empty">' +
          '<div class="gallery-empty-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 56 56">' +
              '<rect x="6" y="12" width="44" height="32" rx="3"/>' +
              '<line x1="6" y1="28" x2="50" y2="28"/>' +
              '<line x1="6" y1="44" x2="6" y2="50"/>' +
              '<line x1="50" y1="44" x2="50" y2="50"/>' +
            '</svg>' +
          '</div>' +
          '<h3>No products match your filters</h3>' +
          '<p>Try adjusting the category or pattern filter.</p>' +
          '<button class="btn btn-outline" onclick="clearAllFilters()">Clear Filters</button>' +
        '</div>';
    } else {
      filtered.forEach(function (p) {
        grid.appendChild(buildCard(p));
      });
    }

    updateCount(filtered.length);
    updateClearBtn();
  }

  /* ── Count ── */
  function updateCount(n) {
    if (!countEl) return;
    countEl.textContent = n + (n === 1 ? ' product' : ' products');
  }

  /* ── Clear button visibility ── */
  function updateClearBtn() {
    if (!clearBtn) return;
    var isFiltered = state.category !== 'all' ||
                     state.pattern  !== 'all' ||
                     state.availability !== 'all';
    clearBtn.classList.toggle('hidden', !isFiltered);
  }

  /* ── Active pill UI ── */
  function updatePillStates() {
    document.querySelectorAll('[data-filter-group]').forEach(function (el) {
      var group = el.dataset.filterGroup;
      var pills = el.querySelectorAll ? el.querySelectorAll('.filter-pill') : [];

      /* single pill (toggle) */
      if (el.classList.contains('filter-pill')) {
        var isActive = state[group] === el.dataset.value;
        el.classList.toggle('active', isActive);
        el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        return;
      }

      /* pill group */
      pills.forEach(function (pill) {
        var isActive = state[group] === pill.dataset.value;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    });
  }

  /* ── URL param sync ── */
  function initFromURL() {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    var pat = params.get('pattern');
    var av  = params.get('availability');
    if (cat) state.category     = cat;
    if (pat) state.pattern      = pat;
    if (av)  state.availability = av;
  }

  function pushURL() {
    var params = new URLSearchParams();
    if (state.category     !== 'all') params.set('cat',          state.category);
    if (state.pattern      !== 'all') params.set('pattern',      state.pattern);
    if (state.availability !== 'all') params.set('availability', state.availability);
    var search = params.toString() ? '?' + params.toString() : window.location.pathname;
    history.replaceState(null, '', search || window.location.pathname);
  }

  /* ── Clear all filters (also called from empty-state button) ── */
  window.clearAllFilters = function () {
    state.category     = 'all';
    state.pattern      = 'all';
    state.availability = 'all';
    updatePillStates();
    pushURL();
    render();
  };

  /* ── Bind filter controls ── */
  function bindFilters() {
    /* Category + Pattern pill groups */
    document.querySelectorAll('[data-filter-group] .filter-pill').forEach(function (pill) {
      var group = pill.closest('[data-filter-group]').dataset.filterGroup;
      pill.addEventListener('click', function () {
        state[group] = pill.dataset.value;
        updatePillStates();
        pushURL();
        render();
      });
    });

    /* Availability single-pill toggle */
    var avPill = document.querySelector('.filter-pill[data-filter-group="availability"]');
    if (avPill) {
      avPill.addEventListener('click', function () {
        state.availability = state.availability === 'in-stock' ? 'all' : 'in-stock';
        updatePillStates();
        pushURL();
        render();
      });
    }

    /* Clear button */
    if (clearBtn) {
      clearBtn.addEventListener('click', window.clearAllFilters);
    }
  }

  /* ── Filter bar scroll shadow ── */
  function bindFilterBarShadow() {
    var bar = document.querySelector('.filter-bar');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var heroBottom = document.querySelector('.page-hero');
      if (!heroBottom) return;
      var rect = heroBottom.getBoundingClientRect();
      bar.classList.toggle('shadowed', rect.bottom <= parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68'
      ));
    }, { passive: true });
  }

  /* ── Fetch & init ── */
  function init() {
    grid     = document.getElementById('products-grid');
    countEl  = document.getElementById('product-count');
    clearBtn = document.getElementById('filter-clear');

    if (!grid) return;

    showSkeletons(6);
    initFromURL();
    updatePillStates();
    bindFilters();
    bindFilterBarShadow();

    fetch('data/products.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        allProducts = data;
        render();
        renderArchived();
      })
      .catch(function () {
        grid.innerHTML =
          '<div class="gallery-empty">' +
            '<h3>Could not load products</h3>' +
            '<p>Please refresh the page or <a href="contact.html">contact us</a> directly.</p>' +
          '</div>';
        if (countEl) countEl.textContent = '—';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
