/* ============================================================
   TEKTON INDIA — product.js
   Single product detail: gallery · info · inquiry form · related
   ============================================================ */

(function () {
  'use strict';

  /* ── Lookup maps ── */
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

  var CATEGORY_LABELS = {
    'dining-table':  'Dining Table',
    'coffee-table':  'Coffee Table',
    'end-table':     'End & Side Table',
    'centre-table':  'Centre Table',
    'console-table': 'Console Table'
  };

  var CATEGORY_PLURAL = {
    'dining-table':  'Dining Tables',
    'coffee-table':  'Coffee Tables',
    'end-table':     'End & Side Tables',
    'centre-table':  'Centre Tables',
    'console-table': 'Console Tables'
  };

  var PATTERN_LABELS = {
    'river':      'River',
    'multi-band': 'Multi-Band',
    'cookie':     'Cookie',
    'spiral':     'Spiral',
    'edge-frame': 'Edge Frame',
    'full-resin': 'Full Resin',
    'full-wood':  'Full Wood'
  };

  var SHAPE_LABELS = {
    'rectangle':      'Rectangle',
    'oval':           'Oval',
    'round':          'Round',
    'freeform-cookie':'Freeform (Cookie)'
  };

  /* ── Helpers ── */
  function formatPrice(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function placeholderBg(product) {
    return RESIN_PLACEHOLDER[product.resinColor] ||
      'linear-gradient(135deg,#141518 0%,#1E1F23 100%)';
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get('id') || '';
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  /* ── Placeholder SVG for missing images ── */
  function placeholderSvgHtml() {
    return (
      '<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">' +
        '<rect x="4" y="4" width="112" height="72" rx="4"/>' +
        '<line x1="4" y1="40" x2="116" y2="40"/>' +
        '<line x1="18" y1="4" x2="18" y2="76" opacity=".3"/>' +
        '<line x1="36" y1="4" x2="36" y2="76" opacity=".2"/>' +
        '<line x1="54" y1="4" x2="54" y2="76" opacity=".3"/>' +
        '<line x1="72" y1="4" x2="72" y2="76" opacity=".2"/>' +
        '<line x1="90" y1="4" x2="90" y2="76" opacity=".3"/>' +
      '</svg>'
    );
  }

  /* ── Loading skeleton ── */
  function renderLoading(container) {
    container.setAttribute('aria-busy', 'true');
    container.innerHTML =
      '<div class="pd-skeleton">' +
        '<div class="pd-skel-gallery">' +
          '<div class="pd-skel-main shimmer"></div>' +
          '<div class="pd-skel-thumbs">' +
            '<div class="pd-skel-thumb shimmer"></div>' +
            '<div class="pd-skel-thumb shimmer"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pd-skel-info">' +
          '<div class="pd-skel-line shimmer" style="width:38%;height:12px;margin-bottom:18px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:78%;height:44px;margin-bottom:10px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:52%;height:16px;margin-bottom:32px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:32%;height:32px;margin-bottom:36px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:100%;height:13px;margin-bottom:10px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:92%;height:13px;margin-bottom:10px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:80%;height:13px;margin-bottom:36px"></div>' +
          '<div class="pd-skel-line shimmer" style="width:52%;height:52px"></div>' +
        '</div>' +
      '</div>';
  }

  /* ── Not found ── */
  function renderNotFound(container) {
    container.removeAttribute('aria-busy');
    container.innerHTML =
      '<div class="pd-not-found container">' +
        '<div class="pd-not-found-inner">' +
          '<span class="pd-not-found-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 56 56">' +
              '<rect x="8" y="14" width="40" height="28" rx="3"/>' +
              '<line x1="8" y1="28" x2="48" y2="28"/>' +
              '<line x1="8" y1="42" x2="8" y2="50"/>' +
              '<line x1="48" y1="42" x2="48" y2="50"/>' +
            '</svg>' +
          '</span>' +
          '<h1>Product Not Found</h1>' +
          '<p>We couldn\'t find the table you\'re looking for. It may have been sold or the link may be incorrect.</p>' +
          '<a href="products.html" class="btn btn-primary">Browse All Tables</a>' +
        '</div>' +
      '</div>';
  }

  /* ── Gallery HTML ── */
  function buildGalleryHtml(product) {
    var bg = placeholderBg(product);
    var images = product.images || [];

    var escapedBg = bg.replace(/'/g, "\\'");

    /* Main image */
    var mainContent = images.length > 0
      ? '<img class="gallery-main-img" src="' + esc(images[0]) + '" alt="' + esc(product.name) + '" loading="eager"' +
        ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="gallery-main-placeholder" style="display:none">' + placeholderSvgHtml() + '</span>'
      : '<span class="gallery-main-placeholder">' + placeholderSvgHtml() + '</span>';

    /* Thumbnails (only when more than one image) */
    var thumbsHtml = '';
    if (images.length > 1) {
      thumbsHtml = '<div class="gallery-thumbs" role="tablist" aria-label="Product image thumbnails">';
      for (var i = 0; i < images.length; i++) {
        var isActive = i === 0;
        var altText = product.name + (i > 0 ? ' — view ' + (i + 1) : '');
        thumbsHtml +=
          '<button class="gallery-thumb' + (isActive ? ' active' : '') + '"' +
          ' data-src="' + esc(images[i]) + '"' +
          ' data-alt="' + esc(altText) + '"' +
          ' role="tab"' +
          ' aria-selected="' + (isActive ? 'true' : 'false') + '"' +
          ' aria-label="View image ' + (i + 1) + '">' +
          '<img src="' + esc(images[i]) + '" alt="" loading="lazy"' +
          ' onerror="this.style.display=\'none\'">' +
          '</button>';
      }
      thumbsHtml += '</div>';
    }

    return (
      '<div class="pd-gallery">' +
        '<div class="gallery-main" style="background:' + bg + '">' +
          mainContent +
        '</div>' +
        thumbsHtml +
      '</div>'
    );
  }

  /* ── Info panel HTML ── */
  function buildInfoHtml(product) {
    var isArchived = (product.status || 'active') === 'archived';
    var hasSale = product.originalPrice && product.originalPrice > product.price;
    var catLabel = CATEGORY_LABELS[product.category] || capFirst(product.category);
    var patternLabel = PATTERN_LABELS[product.resinPattern] || capFirst(product.resinPattern || '');
    var shapeLabel = SHAPE_LABELS[product.shape] || capFirst(product.shape || '');
    var dim = product.dimensions;
    var dimStr = dim
      ? dim.length + ' × ' + dim.width + ' × ' + dim.height + ' ' + (dim.unit || 'in')
      : 'Contact us for dimensions';
    var woodLabel = product.woodType
      ? capFirst(product.woodType) + ' Wood'
      : 'Natural Wood';

    var availBadge = isArchived
      ? '<span class="pd-avail pd-avail--sold">Sold</span>'
      : product.inStock
        ? '<span class="pd-avail pd-avail--in-stock">In Stock</span>'
        : '<span class="pd-avail pd-avail--made-to-order">Made to Order</span>';

    var priceHtml =
      '<span class="pd-price-current">' + formatPrice(product.price) + '</span>';
    if (hasSale) {
      priceHtml +=
        '<span class="pd-price-original">' + formatPrice(product.originalPrice) + '</span>';
    }

    var specsRows =
      '<tr><th>Dimensions</th><td>' + esc(dimStr) + '</td></tr>' +
      '<tr><th>Wood Type</th><td>' + esc(woodLabel) + '</td></tr>';
    if (product.resinPattern && product.resinPattern !== 'full-wood') {
      specsRows += '<tr><th>Resin Pattern</th><td>' + esc(patternLabel) + '</td></tr>';
    }
    specsRows +=
      '<tr><th>Shape</th><td>' + esc(shapeLabel) + '</td></tr>' +
      '<tr><th>Finish</th><td>Hand-polished epoxy resin</td></tr>' +
      '<tr><th>Category</th><td>' + esc(catLabel) + '</td></tr>';

    var actionsHtml = isArchived
      ? '<a href="#inquire" class="btn btn-primary">Request a Similar Piece</a>' +
        '<a href="configurator.html" class="pd-design-own">' +
          'Or design your own' +
          '<svg viewBox="0 0 16 16" aria-hidden="true">' +
            '<line x1="3" y1="8" x2="13" y2="8"/>' +
            '<polyline points="9 4 13 8 9 12"/>' +
          '</svg>' +
        '</a>'
      : '<a href="#inquire" class="btn btn-primary">Request This Design</a>' +
        '<a href="configurator.html" class="pd-design-own">' +
          'Or design your own' +
          '<svg viewBox="0 0 16 16" aria-hidden="true">' +
            '<line x1="3" y1="8" x2="13" y2="8"/>' +
            '<polyline points="9 4 13 8 9 12"/>' +
          '</svg>' +
        '</a>';

    return (
      '<div class="pd-info">' +
        '<span class="eyebrow">' + esc(catLabel) + '</span>' +
        '<h1 class="pd-name">' + esc(product.name) + '</h1>' +
        '<p class="pd-subtitle">' + esc(product.subtitle) + '</p>' +
        '<div class="pd-price-row">' +
          priceHtml +
          availBadge +
        '</div>' +
        '<div class="pd-description">' +
          '<p>' + esc(product.description || '') + '</p>' +
        '</div>' +
        '<div class="pd-specs">' +
          '<h2 class="pd-specs-heading">Details</h2>' +
          '<table class="specs-table"><tbody>' + specsRows + '</tbody></table>' +
        '</div>' +
        '<div class="pd-actions">' + actionsHtml + '</div>' +
      '</div>'
    );
  }

  /* ── Inquiry form HTML ── */
  function buildFormHtml(product) {
    var isArchived = (product.status || 'active') === 'archived';
    var formHeading = isArchived ? 'Request a Similar Piece' : 'Request This Design';
    var formIntro = isArchived
      ? 'This piece has been sold, but we can craft something similar for you. Fill in your details and we\'ll get back to you within 24 hours.'
      : 'Fill in your details and we\'ll get back to you within 24 hours with pricing and delivery options.';
    var defaultMsg = isArchived
      ? 'Hi, I love the style of ' + product.name + '. Could you create a similar piece for me? Please share availability and pricing details.'
      : 'Hi, I\'m interested in the ' + product.name +
        '. Could you please share more details about availability and delivery options?';

    return (
      '<section class="pd-inquire-section" id="inquire">' +
        '<div class="container pd-inquire-inner">' +
          '<div class="pd-inquire-header">' +
            '<span class="eyebrow">Get in Touch</span>' +
            '<h2>' + formHeading + '</h2>' +
            '<p>' + formIntro + '</p>' +
          '</div>' +
          '<form class="pd-form" action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST" novalidate>' +
            '<input type="hidden" name="_subject" value="Inquiry: ' + esc(product.name) + '">' +
            '<input type="hidden" name="product_id" value="' + esc(product.id) + '">' +
            '<input type="hidden" name="product_name" value="' + esc(product.name) + '">' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label for="inq-name">Full Name <span class="form-required" aria-hidden="true">*</span></label>' +
                '<input type="text" id="inq-name" name="name" required autocomplete="name" placeholder="Your name">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="inq-email">Email <span class="form-required" aria-hidden="true">*</span></label>' +
                '<input type="email" id="inq-email" name="email" required autocomplete="email" placeholder="your@email.com">' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label for="inq-phone">Phone</label>' +
                '<input type="tel" id="inq-phone" name="phone" autocomplete="tel" placeholder="+91 XXXXX XXXXX">' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="inq-city">City</label>' +
                '<input type="text" id="inq-city" name="city" autocomplete="address-level2" placeholder="Your city">' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="inq-message">Message</label>' +
              '<textarea id="inq-message" name="message" rows="4">' + esc(defaultMsg) + '</textarea>' +
            '</div>' +
            '<div class="form-footer">' +
              '<button type="submit" class="btn btn-primary pd-form-submit">Send Inquiry</button>' +
              '<p class="form-note">No payment required — this is just an inquiry.</p>' +
            '</div>' +
            '<div class="form-success hidden" role="alert">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' +
              '<div>' +
                '<strong>Inquiry sent!</strong>' +
                '<p>We\'ll be in touch within 24 hours. Thank you for your interest in ' + esc(product.name) + '.</p>' +
              '</div>' +
            '</div>' +
            '<div class="form-error hidden" role="alert">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></svg>' +
              '<div>' +
                '<strong>Submission failed</strong>' +
                '<p>Please try again or email us directly at <a href="mailto:tektonindia.biz@gmail.com">tektonindia.biz@gmail.com</a>.</p>' +
              '</div>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</section>'
    );
  }

  /* ── Related product card (mirrors products.js buildCard) ── */
  function buildRelatedCard(product) {
    var href = 'product.html?id=' + product.id;
    var hasSale = product.originalPrice && product.originalPrice > product.price;
    var bg = placeholderBg(product);
    var escapedBg = bg.replace(/'/g, "\\'");

    var badgeHtml = !product.inStock
      ? '<span class="product-badge badge-soldout">Sold Out</span>'
      : hasSale
        ? '<span class="product-badge badge-sale">Sale</span>'
        : '';

    var priceHtml = hasSale
      ? '<span class="price">' + formatPrice(product.price) + '</span>' +
        '<span class="original-price">' + formatPrice(product.originalPrice) + '</span>'
      : '<span class="price">' + formatPrice(product.price) + '</span>';

    var img1 = (product.images && product.images[0])
      ? '<img src="' + esc(product.images[0]) + '" alt="' + esc(product.name) + '" class="primary" loading="lazy"' +
        ' onerror="this.parentElement.style.background=\'' + escapedBg + '\';this.style.display=\'none\'">'
      : '';
    var img2 = (product.images && product.images[1])
      ? '<img src="' + esc(product.images[1]) + '" alt="' + esc(product.name) + ' — alternate view" class="secondary" loading="lazy">'
      : '';

    return (
      '<a href="' + href + '" class="product-card" role="listitem"' +
      ' aria-label="' + esc(product.name) + ', ' + formatPrice(product.price) + '">' +
        '<div class="product-card-img-wrap" style="background:' + bg + '">' +
          img1 + img2 + badgeHtml +
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
          '<span class="product-card-name">' + esc(product.name) + '</span>' +
          '<span class="product-card-subtitle">' + esc(product.subtitle) + '</span>' +
          '<div class="product-card-price">' + priceHtml + '</div>' +
          '<span class="product-card-cta">View Details' +
            '<svg viewBox="0 0 16 16" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/>' +
            '<polyline points="9 4 13 8 9 12"/></svg>' +
          '</span>' +
        '</div>' +
      '</a>'
    );
  }

  /* ── Related section HTML ── */
  function buildRelatedHtml(product, allProducts) {
    var related = allProducts.filter(function (p) {
      return p.id !== product.id &&
             p.category === product.category &&
             (p.status || 'active') !== 'archived';
    }).slice(0, 3);

    if (related.length === 0) return '';

    var catPlural = CATEGORY_PLURAL[product.category] || 'Products';

    return (
      '<section class="pd-related-section">' +
        '<div class="container">' +
          '<div class="section-header">' +
            '<span class="eyebrow">Explore More</span>' +
            '<h2>From the Same Collection</h2>' +
          '</div>' +
          '<div class="product-grid pd-related-grid" role="list">' +
            related.map(buildRelatedCard).join('') +
          '</div>' +
          '<div class="pd-related-cta">' +
            '<a href="products.html?cat=' + esc(product.category) + '" class="btn btn-outline">' +
              'View All ' + esc(catPlural) +
            '</a>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  /* ── Bind gallery thumbnail clicks ── */
  function bindGallery(container) {
    var mainImg = container.querySelector('.gallery-main-img');
    if (!mainImg) return;

    var thumbs = container.querySelectorAll('.gallery-thumb');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.dataset.src;
        var alt = thumb.dataset.alt || '';

        /* Swap main image */
        mainImg.style.display = '';
        mainImg.src = src;
        mainImg.alt = alt;

        /* Hide placeholder if it was showing */
        var placeholder = container.querySelector('.gallery-main-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        /* Update active thumb */
        thumbs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        thumb.classList.add('active');
        thumb.setAttribute('aria-selected', 'true');
      });
    });
  }

  /* ── Bind inquiry form (AJAX submission) ── */
  function bindForm(container) {
    var form = container.querySelector('.pd-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('.pd-form-submit');
      var successEl = form.querySelector('.form-success');
      var errorEl = form.querySelector('.form-error');

      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('server');
          form.reset();
          btn.textContent = 'Sent!';
          successEl.classList.remove('hidden');
          errorEl.classList.add('hidden');
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Send Inquiry';
          errorEl.classList.remove('hidden');
          successEl.classList.add('hidden');
        });
    });
  }

  /* ── Main render ── */
  function renderProduct(product, allProducts, container) {
    var catLabel = CATEGORY_LABELS[product.category] || capFirst(product.category);

    var breadcrumb =
      '<nav class="pd-breadcrumb" aria-label="Breadcrumb">' +
        '<div class="container">' +
          '<ol class="pd-breadcrumb-list">' +
            '<li><a href="products.html">All Products</a></li>' +
            '<li aria-hidden="true">/</li>' +
            '<li><a href="products.html?cat=' + esc(product.category) + '">' + esc(catLabel) + '</a></li>' +
            '<li aria-hidden="true">/</li>' +
            '<li aria-current="page">' + esc(product.name) + '</li>' +
          '</ol>' +
        '</div>' +
      '</nav>';

    var isArchived = (product.status || 'active') === 'archived';

    var archivedBanner = isArchived
      ? '<div class="pd-archived-banner container">' +
          '<div class="pd-archived-banner-inner">' +
            '<strong>This piece has found its home.</strong> ' +
            'It has been sold, but we can craft something similar. ' +
            '<a href="#inquire">Request a similar piece &rarr;</a>' +
          '</div>' +
        '</div>'
      : '';

    var layout =
      '<div class="container pd-layout-wrap">' +
        '<div class="pd-layout">' +
          buildGalleryHtml(product) +
          buildInfoHtml(product) +
        '</div>' +
      '</div>';

    container.innerHTML =
      breadcrumb +
      archivedBanner +
      layout +
      buildFormHtml(product) +
      buildRelatedHtml(product, allProducts);

    container.removeAttribute('aria-busy');

    document.title = product.name + ' — Tekton India';

    bindGallery(container);
    bindForm(container);
  }

  /* ── Init ── */
  function init() {
    var container = document.getElementById('product-container');
    if (!container) return;

    var id = getProductId();
    if (!id) {
      renderNotFound(container);
      return;
    }

    renderLoading(container);

    fetch('data/products.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var product = null;
        for (var i = 0; i < data.length; i++) {
          if (data[i].id === id) { product = data[i]; break; }
        }
        if (!product) {
          renderNotFound(container);
          return;
        }
        renderProduct(product, data, container);
      })
      .catch(function () {
        renderNotFound(container);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
