/**
 * Aurelle Hair Lab - Shop, Filters, Quick View, Before/After & Review Lightbox Engine
 */
(function() {
  'use strict';

  let currentFilters = {
    search: '',
    sulfateFreeOnly: false,
    parabenFree: false,
    siliconeFree: false,
    vegan: false,
    crueltyFree: false,
    hairType: 'all',
    concern: 'all',
    category: 'all',
    maxPrice: 80,
    sortBy: 'featured'
  };

  // State of selected sizes and subscription toggles per product card
  const productCardStates = {};

  function initShop() {
    renderProducts();
    setupShopEventListeners();
    setupReviewGallery();
    setupBundles();
  }

  function getFilteredProducts() {
    const products = window.AURELLE_PRODUCTS || [];

    return products.filter(prod => {
      // Search
      if (currentFilters.search) {
        const query = currentFilters.search.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchSub = prod.subtitle.toLowerCase().includes(query);
        const matchDesc = prod.description.toLowerCase().includes(query);
        if (!matchName && !matchSub && !matchDesc) return false;
      }

      // Hero Sulfate-free toggle
      if (currentFilters.sulfateFreeOnly && !prod.sulfateFree) return false;

      // Clean checkmarks
      if (currentFilters.parabenFree && !prod.parabenFree) return false;
      if (currentFilters.siliconeFree && !prod.siliconeFree) return false;
      if (currentFilters.vegan && !prod.vegan) return false;
      if (currentFilters.crueltyFree && !prod.crueltyFree) return false;

      // Category
      if (currentFilters.category !== 'all' && prod.category.toLowerCase() !== currentFilters.category.toLowerCase()) {
        return false;
      }

      // Hair Type
      if (currentFilters.hairType !== 'all') {
        const hasType = prod.hairTypes.some(t => t.toLowerCase() === currentFilters.hairType.toLowerCase());
        if (!hasType) return false;
      }

      // Concern
      if (currentFilters.concern !== 'all') {
        const hasConcern = prod.concerns.some(c => c.toLowerCase() === currentFilters.concern.toLowerCase());
        if (!hasConcern) return false;
      }

      // Price
      if (prod.price > currentFilters.maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (currentFilters.sortBy === 'price-asc') return a.price - b.price;
      if (currentFilters.sortBy === 'price-desc') return b.price - a.price;
      if (currentFilters.sortBy === 'rating') return b.rating - a.rating;
      if (currentFilters.sortBy === 'new') return b.id.localeCompare(a.id);
      return 0; // featured
    });
  }

  function renderProducts(showSkeleton = false) {
    const grid = document.getElementById('shopProductGrid');
    const countEl = document.getElementById('shopResultsCount');
    const emptyState = document.getElementById('shopNoResults');
    const activeChipsContainer = document.getElementById('activeFilterChips');

    if (!grid) return;

    if (showSkeleton) {
      grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="product-skeleton-card">
          <div class="skeleton-shimmer skeleton-img"></div>
          <div class="skeleton-shimmer skeleton-line" style="width: 60%; margin: 12px auto;"></div>
          <div class="skeleton-shimmer skeleton-line" style="width: 80%; margin: 8px auto;"></div>
          <div class="skeleton-shimmer skeleton-line" style="width: 40%; margin: 8px auto;"></div>
          <div class="skeleton-shimmer skeleton-btn"></div>
        </div>
      `).join('');
      setTimeout(() => renderProducts(false), 280);
      return;
    }

    const filtered = getFilteredProducts();

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} clean formulation${filtered.length === 1 ? '' : 's'}`;
    }

    // Render active chips
    if (activeChipsContainer) {
      renderActiveChips(activeChipsContainer);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(prod => {
      if (!productCardStates[prod.id]) {
        productCardStates[prod.id] = {
          size: prod.sizes[0],
          isSubscription: false,
          frequency: 'Every 30 Days'
        };
      }
      const state = productCardStates[prod.id];
      const displayPrice = state.isSubscription ? (prod.price * 0.85).toFixed(2) : prod.price.toFixed(2);

      return `
        <div class="product-card tilt-card" data-prod-id="${prod.id}">
          <div class="product-card-inner tilt-depth" data-depth="20">
            <div class="product-badge-wrap">
              ${prod.sulfateFree ? `<span class="badge badge-sage">Sulfate-Free</span>` : ''}
              ${prod.badge && prod.badge !== 'Sulfate-Free' ? `<span class="badge badge-gold">${prod.badge}</span>` : ''}
            </div>

            <button class="quick-view-trigger" data-action="quickview" data-prod-id="${prod.id}" title="Quick View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            <div class="product-image-container">
              <img src="${prod.image}" alt="${prod.name}" class="product-img" loading="lazy">
              <div class="product-gloss-sweep"></div>
            </div>

            <div class="product-content text-center">
              <div class="product-header-info">
                <span class="product-cat-tag">${prod.category}</span>
                <h3 class="product-title">${prod.name}</h3>
                <p class="product-subtitle">${prod.subtitle}</p>

                <div class="product-rating-row">
                  <div class="star-rating">
                    ${'★'.repeat(Math.floor(prod.rating))}
                    <span class="star-empty">${'★'.repeat(5 - Math.floor(prod.rating))}</span>
                  </div>
                  <span class="rating-num">${prod.rating}</span>
                  <span class="reviews-count">(${prod.reviewsCount})</span>
                </div>
              </div>

              <div class="product-actions-cluster">
                <!-- Size selector -->
                <div class="product-size-selector">
                  ${prod.sizes.map(size => `
                    <button type="button" class="size-pill ${state.size === size ? 'active' : ''}" data-action="select-size" data-size="${size}" data-prod-id="${prod.id}">
                      ${size}
                    </button>
                  `).join('')}
                </div>

                <!-- Subscribe & Save 15% Toggle -->
                <div class="product-sub-toggle-row">
                  <label class="sub-toggle-switch">
                    <input type="checkbox" class="sub-checkbox" data-prod-id="${prod.id}" ${state.isSubscription ? 'checked' : ''}>
                    <span class="sub-toggle-slider"></span>
                  </label>
                  <div class="sub-toggle-label">
                    <span class="sub-title">Subscribe & Save 15%</span>
                    <span class="sub-note">Free shipping + cancel anytime</span>
                  </div>
                </div>

                <!-- Price & CTA -->
                <div class="product-card-bottom">
                  <div class="product-price-box">
                    ${state.isSubscription ? `<span class="product-orig-price">$${prod.price.toFixed(2)}</span>` : ''}
                    <span class="product-active-price">$${displayPrice}</span>
                  </div>
                  <button type="button" class="btn btn-rose add-to-cart-btn" data-action="add-cart" data-prod-id="${prod.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.initTiltCards) {
      window.initTiltCards(grid);
    }
  }

  function renderActiveChips(container) {
    let chips = [];

    if (currentFilters.search) {
      chips.push({ label: `Search: "${currentFilters.search}"`, key: 'search', reset: '' });
    }
    if (currentFilters.sulfateFreeOnly) {
      chips.push({ label: 'Sulfate-Free Only', key: 'sulfateFreeOnly', reset: false });
    }
    if (currentFilters.category !== 'all') {
      chips.push({ label: `Category: ${currentFilters.category}`, key: 'category', reset: 'all' });
    }
    if (currentFilters.hairType !== 'all') {
      chips.push({ label: `Hair: ${currentFilters.hairType}`, key: 'hairType', reset: 'all' });
    }
    if (currentFilters.concern !== 'all') {
      chips.push({ label: `Concern: ${currentFilters.concern}`, key: 'concern', reset: 'all' });
    }
    if (currentFilters.maxPrice < 80) {
      chips.push({ label: `Under $${currentFilters.maxPrice}`, key: 'maxPrice', reset: 80 });
    }
    if (currentFilters.vegan) {
      chips.push({ label: 'Vegan', key: 'vegan', reset: false });
    }
    if (currentFilters.parabenFree) {
      chips.push({ label: 'Paraben-Free', key: 'parabenFree', reset: false });
    }

    if (chips.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="active-chips-wrap">
        <span class="active-chips-label">Active Filters:</span>
        ${chips.map(c => `
          <button type="button" class="filter-chip" data-key="${c.key}">
            ${c.label}
            <span class="chip-remove">&times;</span>
          </button>
        `).join('')}
        <button type="button" class="clear-all-chips-btn" id="clearAllFiltersBtn">Clear all</button>
      </div>
    `;

    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (key === 'search') {
          currentFilters.search = '';
          const sInput = document.getElementById('shopSearchInput');
          if (sInput) sInput.value = '';
        } else if (key === 'sulfateFreeOnly') {
          currentFilters.sulfateFreeOnly = false;
          const sToggle = document.getElementById('sulfateFreeHeroToggle');
          if (sToggle) sToggle.checked = false;
        } else if (key === 'category') {
          currentFilters.category = 'all';
          updatePillActive('filterCategoryPills', 'all');
        } else if (key === 'hairType') {
          currentFilters.hairType = 'all';
          updatePillActive('filterHairTypePills', 'all');
        } else if (key === 'concern') {
          currentFilters.concern = 'all';
          updatePillActive('filterConcernPills', 'all');
        } else if (key === 'maxPrice') {
          currentFilters.maxPrice = 80;
          const pSlider = document.getElementById('priceRangeSlider');
          const pDisplay = document.getElementById('priceRangeValue');
          if (pSlider) pSlider.value = 80;
          if (pDisplay) pDisplay.textContent = '$80';
        } else {
          currentFilters[key] = false;
          const chk = document.querySelector(`input[name="${key}"]`);
          if (chk) chk.checked = false;
        }
        renderProducts(true);
      });
    });

    const clearAllBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', resetAllFilters);
    }
  }

  function updatePillActive(containerId, value) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.value === value);
    });
  }

  function resetAllFilters() {
    currentFilters = {
      search: '',
      sulfateFreeOnly: false,
      parabenFree: false,
      siliconeFree: false,
      vegan: false,
      crueltyFree: false,
      hairType: 'all',
      concern: 'all',
      category: 'all',
      maxPrice: 80,
      sortBy: 'featured'
    };

    const sInput = document.getElementById('shopSearchInput');
    if (sInput) sInput.value = '';

    const sToggle = document.getElementById('sulfateFreeHeroToggle');
    if (sToggle) sToggle.checked = false;

    const pSlider = document.getElementById('priceRangeSlider');
    const pDisplay = document.getElementById('priceRangeValue');
    if (pSlider) pSlider.value = 80;
    if (pDisplay) pDisplay.textContent = '$80';

    document.querySelectorAll('.filter-checkbox').forEach(c => c.checked = false);
    updatePillActive('filterCategoryPills', 'all');
    updatePillActive('filterHairTypePills', 'all');
    updatePillActive('filterConcernPills', 'all');

    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    renderProducts(true);
  }

  function setupShopEventListeners() {
    // Search
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.trim();
        renderProducts(false);
      });
    }

    // Hero Sulfate-Free toggle
    const sfToggle = document.getElementById('sulfateFreeHeroToggle');
    if (sfToggle) {
      sfToggle.addEventListener('change', (e) => {
        currentFilters.sulfateFreeOnly = e.target.checked;
        renderProducts(true);
      });
    }

    // Secondary Clean Checkboxes
    document.querySelectorAll('.clean-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        currentFilters[e.target.name] = e.target.checked;
        renderProducts(true);
      });
    });

    // Pill filters (Categories, Hair Types, Concerns)
    ['filterCategoryPills', 'filterHairTypePills', 'filterConcernPills'].forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.addEventListener('click', (e) => {
          const pill = e.target.closest('.filter-pill');
          if (!pill) return;
          container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          const filterType = container.dataset.filterType;
          currentFilters[filterType] = pill.dataset.value;
          renderProducts(true);
        });
      }
    });

    // Price range slider
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceValue = document.getElementById('priceRangeValue');
    if (priceSlider && priceValue) {
      priceSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        priceValue.textContent = `$${val}`;
        currentFilters.maxPrice = val;
        renderProducts(false);
      });
    }

    // Sort select
    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        renderProducts(true);
      });
    }

    // Empty state reset button
    const resetEmptyBtn = document.getElementById('resetEmptyFiltersBtn');
    if (resetEmptyBtn) resetEmptyBtn.addEventListener('click', resetAllFilters);

    // Mobile filter drawer toggle
    const mobileFilterOpenBtn = document.getElementById('openMobileFiltersBtn');
    const mobileFilterCloseBtn = document.getElementById('closeMobileFiltersBtn');
    const filterSidebar = document.getElementById('shopFilterSidebar');
    const filterOverlay = document.getElementById('filterDrawerOverlay');

    if (mobileFilterOpenBtn && filterSidebar && filterOverlay) {
      mobileFilterOpenBtn.addEventListener('click', () => {
        filterSidebar.classList.add('mobile-active');
        filterOverlay.classList.add('active');
        document.body.classList.add('filter-open');
      });
    }

    const closeMobileFilter = () => {
      if (filterSidebar && filterOverlay) {
        filterSidebar.classList.remove('mobile-active');
        filterOverlay.classList.remove('active');
        document.body.classList.remove('filter-open');
      }
    };

    if (mobileFilterCloseBtn) mobileFilterCloseBtn.addEventListener('click', closeMobileFilter);
    if (filterOverlay) filterOverlay.addEventListener('click', closeMobileFilter);

    // Product card actions (Delegation)
    const productGrid = document.getElementById('shopProductGrid');
    if (productGrid) {
      productGrid.addEventListener('click', (e) => {
        const target = e.target;

        // Size button
        const sizeBtn = target.closest('[data-action="select-size"]');
        if (sizeBtn) {
          const prodId = sizeBtn.dataset.prodId;
          const size = sizeBtn.dataset.size;
          if (productCardStates[prodId]) {
            productCardStates[prodId].size = size;
          }
          const card = sizeBtn.closest('.product-card');
          card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
          sizeBtn.classList.add('active');
          return;
        }

        // Add to cart
        const addCartBtn = target.closest('[data-action="add-cart"]');
        if (addCartBtn) {
          const prodId = addCartBtn.dataset.prodId;
          const prod = (window.AURELLE_PRODUCTS || []).find(p => p.id === prodId);
          if (prod && window.AurelleCart) {
            const state = productCardStates[prodId] || { size: prod.sizes[0], isSubscription: false };
            window.AurelleCart.addToCart(prod, {
              size: state.size,
              isSubscription: state.isSubscription,
              frequency: state.frequency
            });
          }
          return;
        }

        // Quick View
        const qvBtn = target.closest('[data-action="quickview"]');
        if (qvBtn) {
          const prodId = qvBtn.dataset.prodId;
          openQuickView(prodId);
          return;
        }
      });

      // Sub checkbox change
      productGrid.addEventListener('change', (e) => {
        if (e.target.classList.contains('sub-checkbox')) {
          const prodId = e.target.dataset.prodId;
          const checked = e.target.checked;
          if (productCardStates[prodId]) {
            productCardStates[prodId].isSubscription = checked;
          }
          const card = e.target.closest('.product-card');
          const prod = (window.AURELLE_PRODUCTS || []).find(p => p.id === prodId);
          if (card && prod) {
            const priceBox = card.querySelector('.product-price-box');
            if (checked) {
              priceBox.innerHTML = `
                <span class="product-orig-price">$${prod.price.toFixed(2)}</span>
                <span class="product-active-price">$${(prod.price * 0.85).toFixed(2)}</span>
              `;
            } else {
              priceBox.innerHTML = `
                <span class="product-active-price">$${prod.price.toFixed(2)}</span>
              `;
            }
          }
        }
      });
    }

    // Quick View Modal Close & Backdrop Click Dismiss
    const qvModal = document.getElementById('quickViewModal');
    const closeQvBtn = document.getElementById('closeQuickViewBtn');
    if (qvModal) {
      if (closeQvBtn) {
        closeQvBtn.addEventListener('click', closeQuickView);
      }
      qvModal.addEventListener('click', (e) => {
        if (e.target === qvModal) {
          closeQuickView();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qvModal.classList.contains('active')) {
          closeQuickView();
        }
      });
    }
  }

  function openQuickView(prodId) {
    const prod = (window.AURELLE_PRODUCTS || []).find(p => p.id === prodId);
    const modal = document.getElementById('quickViewModal');
    if (!prod || !modal) return;

    const modalBody = document.getElementById('quickViewBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="qv-grid">
          <div class="qv-img-col">
            <img src="${prod.image}" alt="${prod.name}" class="qv-product-img">
            <div class="qv-badges">
              ${prod.sulfateFree ? `<span class="badge badge-sage">Sulfate-Free</span>` : ''}
              <span class="badge badge-botanical">100% Vegan</span>
              <span class="badge badge-rose">Silicon-Free</span>
            </div>
          </div>
          <div class="qv-info-col">
            <span class="qv-category">${prod.category}</span>
            <h2 class="qv-title">${prod.name}</h2>
            <p class="qv-subtitle">${prod.subtitle}</p>
            <div class="qv-rating-row">
              <span class="star-rating">★★★★★</span>
              <span class="qv-rating-val">${prod.rating}</span>
              <span class="qv-reviews">(${prod.reviewsCount} customer reviews)</span>
            </div>
            <div class="qv-price-row">
              <span class="qv-price">$${prod.price.toFixed(2)}</span>
              <span class="qv-sub-offer">or <strong>$${(prod.price * 0.85).toFixed(2)}</strong> with Auto-Replenish (15% Off)</span>
            </div>
            <p class="qv-desc">${prod.description}</p>
            
            <div class="qv-section">
              <h4>Clinical Botanical Benefits</h4>
              <ul class="qv-benefits-list">
                ${prod.benefits.map(b => `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${b}</li>`).join('')}
              </ul>
            </div>

            <div class="qv-section">
              <h4>How to Use</h4>
              <p class="qv-ritual-text">${prod.howToUse}</p>
            </div>

            <div class="qv-section">
              <h4>Pure Botanical Ingredients</h4>
              <p class="qv-ingredients-text">${prod.ingredients}</p>
            </div>

            <div class="qv-actions-row">
              <button class="btn btn-rose btn-block qv-add-btn" id="qvAddToCartBtn">
                Add to Cart — $${prod.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      `;

      const addBtn = document.getElementById('qvAddToCartBtn');
      if (addBtn) {
        addBtn.onclick = () => {
          if (window.AurelleCart) {
            window.AurelleCart.addToCart(prod);
            closeQuickView();
          }
        };
      }
    }

    modal.classList.add('active');
    const modalWin = modal.querySelector('.modal-window');
    if (modalWin) {
      modalWin.scrollTop = 0;
      modalWin.classList.add('active');
    }
    document.body.classList.add('modal-open');
  }

  function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
      modal.classList.remove('active');
      modal.querySelector('.modal-window')?.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  function setupBundles() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-bundle-btn');
      if (btn) {
        const bundleId = btn.dataset.bundleId;
        const bundle = (window.AURELLE_BUNDLES || []).find(b => b.id === bundleId);
        if (bundle && window.AurelleCart) {
          window.AurelleCart.addToCart({
            id: bundle.id,
            name: bundle.name,
            subtitle: bundle.tagline,
            price: bundle.price,
            image: bundle.image,
            sizes: ['Curated Ritual Kit']
          });
        }
      }
    });
  }


  function setupReviewGallery() {
    const reviewsGrid = document.getElementById('reviewGalleryGrid');
    const filterContainer = document.getElementById('reviewFilterChips');
    const lightboxModal = document.getElementById('reviewLightboxModal');
    const closeLightboxBtn = document.getElementById('closeReviewLightboxBtn');

    if (!reviewsGrid) return;

    const allReviews = window.AURELLE_REVIEWS || [];
    let currentReviewFilter = 'all';

    function renderReviews() {
      const filtered = currentReviewFilter === 'all'
        ? allReviews
        : allReviews.filter(r => r.hairType.toLowerCase() === currentReviewFilter.toLowerCase());

      reviewsGrid.innerHTML = filtered.map(rev => `
        <div class="review-card tilt-card" data-rev-id="${rev.id}">
          <div class="review-card-inner tilt-depth" data-depth="15">
            <div class="review-photo-wrap">
              <img src="${rev.image}" alt="${rev.name}" class="review-user-photo" loading="lazy">
              <span class="review-hair-badge">${rev.hairTypeTag}</span>
            </div>
            <div class="review-body text-center">
              <div class="review-stars">★★★★★</div>
              <h4 class="review-headline">"${rev.title}"</h4>
              <p class="review-quote">${rev.content}</p>
              <div class="review-author-meta">
                <strong class="review-author-name">${rev.name}</strong>
                <span class="review-verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified Buyer
                </span>
                <span class="review-prod-used">Used: ${rev.product}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      if (window.initTiltCards) {
        window.initTiltCards(reviewsGrid);
      }
    }

    renderReviews();

    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.review-chip');
        if (!chip) return;
        filterContainer.querySelectorAll('.review-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentReviewFilter = chip.dataset.type;
        renderReviews();
      });
    }

    // Lightbox on card click
    reviewsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.review-card');
      if (!card || !lightboxModal) return;
      const revId = card.dataset.revId;
      const rev = allReviews.find(r => r.id === revId);
      if (!rev) return;

      const body = document.getElementById('reviewLightboxBody');
      if (body) {
        body.innerHTML = `
          <div class="lightbox-review-content">
            <img src="${rev.image}" alt="${rev.name}" class="lightbox-img">
            <div class="lightbox-text">
              <span class="review-hair-badge">${rev.hairTypeTag}</span>
              <div class="review-stars" style="color: var(--argan-gold); font-size: 1.3rem;">★★★★★</div>
              <h3 style="font-family: var(--font-serif); margin: 8px 0; font-size: 1.6rem;">${rev.title}</h3>
              <p style="color: var(--text-muted); line-height: 1.7; margin: 12px 0;">${rev.content}</p>
              <div style="margin-top: 16px; border-top: 1px solid rgba(201,139,122,0.2); padding-top: 12px;">
                <strong>${rev.name}</strong> • ${rev.location} <br>
                <span style="font-size: 0.85rem; color: var(--sage);">✓ Verified Treatment Routine: ${rev.product}</span>
              </div>
            </div>
          </div>
        `;
      }

      lightboxModal.classList.add('active');
      document.body.classList.add('modal-open');
    });

    if (closeLightboxBtn && lightboxModal) {
      closeLightboxBtn.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initShop);
})();
