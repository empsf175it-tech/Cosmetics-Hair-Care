/**
 * Aurelle Hair Lab - Luxury Cart & Checkout Engine
 * Persisted in localStorage, supports subscriptions, promo codes, and checkout flow
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'aurelle_cart_items';
  const PROMO_KEY = 'aurelle_promo_code';
  const FREE_SHIPPING_THRESHOLD = 65;

  let cart = [];
  let appliedPromo = null;

  // Load from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) cart = JSON.parse(saved);
    const savedPromo = localStorage.getItem(PROMO_KEY);
    if (savedPromo) appliedPromo = JSON.parse(savedPromo);
    // Auto-migrate legacy 'images/' paths in cart
    if (saved && saved.includes('"image":"images/')) {
      const fixed = saved.replace(/"image":"images\//g, '"image":"assets/images/');
      localStorage.setItem(STORAGE_KEY, fixed);
      cart = JSON.parse(fixed);
    }
  } catch (e) {
    cart = [];
  }

  function fixImagePath(path) {
    if (!path) return 'assets/images/products/rosemary_shampoo.jpg';
    if (path.startsWith('images/')) return 'assets/' + path;
    return path;
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      if (appliedPromo) {
        localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_KEY);
      }
    } catch (e) {}
    updateCartUI();
  }

  function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => {
      const price = item.isSubscription ? (item.price * 0.85) : item.price;
      return sum + (price * item.quantity);
    }, 0);
  }

  function getDiscount() {
    let subtotal = getSubtotal();
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        discount = subtotal * (appliedPromo.value / 100);
      } else if (appliedPromo.type === 'fixed') {
        discount = appliedPromo.value;
      }
    }
    return Math.min(discount, subtotal);
  }

  function getShipping() {
    const subtotal = getSubtotal();
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return 8.00;
  }

  function getTotal() {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    const discount = getDiscount();
    const shipping = getShipping();
    return Math.max(0, subtotal - discount + shipping);
  }

  function addToCart(product, options = {}) {
    const size = options.size || (product.sizes ? product.sizes[0] : 'Standard');
    const isSubscription = options.isSubscription || false;
    const frequency = options.frequency || 'Every 30 Days';
    const quantity = options.quantity || 1;

    const existingIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.size === size && 
      item.isSubscription === isSubscription &&
      (!isSubscription || item.frequency === frequency)
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle || '',
        price: product.price,
        image: product.image,
        size: size,
        isSubscription: isSubscription,
        frequency: frequency,
        quantity: quantity
      });
    }

    saveCart();
    openCartDrawer();

    if (window.showToast) {
      window.showToast(`${product.name} added to your ritual`, 'success');
    }
  }

  function updateQuantity(index, delta) {
    if (cart[index]) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
    }
  }

  function removeFromCart(index) {
    if (cart[index]) {
      const removed = cart.splice(index, 1)[0];
      saveCart();
      if (window.showToast) {
        window.showToast(`Removed from your ritual`, 'info');
      }
    }
  }

  function clearCart() {
    cart = [];
    appliedPromo = null;
    saveCart();
  }

  function applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a valid code' };

    if (cleanCode === 'AURELLE15' || cleanCode === 'SULFATEFREE') {
      appliedPromo = { code: cleanCode, type: 'percent', value: 15 };
      saveCart();
      return { success: true, message: '15% luxury discount applied!' };
    } else if (cleanCode === 'GLOW10') {
      appliedPromo = { code: cleanCode, type: 'fixed', value: 10 };
      saveCart();
      return { success: true, message: '$10 off applied!' };
    } else {
      return { success: false, message: 'Invalid or expired promotional code' };
    }
  }

  function removePromo() {
    appliedPromo = null;
    saveCart();
  }

  function openCartDrawer() {
    const mobileMenu = document.getElementById('mobileMenuOverlay');
    if (mobileMenu) mobileMenu.classList.remove('active');
    const hamburgerBtn = document.getElementById('hamburgerToggleBtn');
    if (hamburgerBtn) hamburgerBtn.classList.remove('is-active');
    document.body.classList.remove('menu-open');

    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('drawer-open');
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }
  }

  function updateCartUI() {
    const badges = document.querySelectorAll('.cart-count-badge');
    const count = getCartItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    });

    const itemsContainer = document.getElementById('cartItemsContainer');
    const emptyState = document.getElementById('cartEmptyState');
    const footer = document.getElementById('cartDrawerFooter');

    if (itemsContainer && emptyState && footer) {
      if (cart.length === 0) {
        itemsContainer.innerHTML = '';
        emptyState.style.display = 'flex';
        footer.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        footer.style.display = 'block';

        itemsContainer.innerHTML = cart.map((item, index) => {
          const itemPrice = item.isSubscription ? (item.price * 0.85) : item.price;
          const totalLine = (itemPrice * item.quantity).toFixed(2);
          return `
            <div class="cart-item" data-index="${index}">
              <div class="cart-item-img-wrap">
                <img src="${fixImagePath(item.image)}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/products/rosemary_shampoo.jpg';">
              </div>
              <div class="cart-item-info">
                <div class="cart-item-header">
                  <h4 class="cart-item-title">${item.name}</h4>
                  <button class="cart-item-remove" data-action="remove" data-index="${index}" aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div class="cart-item-meta">
                  <span class="cart-item-size">${item.size}</span>
                  ${item.isSubscription ? `<span class="cart-sub-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> ${item.frequency} (Save 15%)</span>` : ''}
                </div>
                <div class="cart-item-bottom">
                  <div class="cart-stepper">
                    <button class="cart-step-btn" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="cart-step-btn" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
                  </div>
                  <div class="cart-item-price-wrap">
                    ${item.isSubscription ? `<span class="cart-old-price">$${(item.price * item.quantity).toFixed(2)}</span>` : ''}
                    <span class="cart-item-price">$${totalLine}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Free Shipping Progress
    const shippingProgress = document.getElementById('shippingProgressBar');
    const shippingText = document.getElementById('shippingProgressText');
    const subtotal = getSubtotal();

    if (shippingProgress && shippingText) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingProgress.style.width = '100%';
        shippingText.innerHTML = `<strong>Complimentary Express Shipping</strong> Unlocked!`;
      } else {
        const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
        const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingProgress.style.width = `${percent}%`;
        shippingText.innerHTML = `Add <strong>$${remaining}</strong> more for Complimentary Express Shipping`;
      }
    }

    // Totals
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountEl = document.getElementById('cartDiscountAmount');
    const shippingEl = document.getElementById('cartShippingAmount');
    const totalEl = document.getElementById('cartTotalAmount');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    const discount = getDiscount();
    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-$${discount.toFixed(2)} (${appliedPromo.code})`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (shippingEl) {
      const ship = getShipping();
      shippingEl.textContent = ship === 0 ? 'FREE' : `$${ship.toFixed(2)}`;
    }

    if (totalEl) totalEl.textContent = `$${getTotal().toFixed(2)}`;
  }

  // Event Listeners setup
  document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Open/close drawer triggers
    const toggleBtns = document.querySelectorAll('.cart-toggle-trigger');
    toggleBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    }));

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', closeCartDrawer);

    // Cart items actions (event delegation)
    const itemsContainer = document.getElementById('cartItemsContainer');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index, 10);
        if (action === 'increase') updateQuantity(index, 1);
        if (action === 'decrease') updateQuantity(index, -1);
        if (action === 'remove') removeFromCart(index);
      });
    }

    // Promo code
    const promoForm = document.getElementById('cartPromoForm');
    const promoInput = document.getElementById('cartPromoInput');
    const promoMsg = document.getElementById('cartPromoMsg');

    if (promoForm && promoInput) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = applyPromo(promoInput.value);
        if (promoMsg) {
          promoMsg.textContent = res.message;
          promoMsg.className = `promo-msg ${res.success ? 'success' : 'error'}`;
        }
        if (res.success) promoInput.value = '';
      });
    }

    // Checkout modal trigger
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

    if (checkoutBtn && checkoutModal) {
      checkoutBtn.addEventListener('click', () => {
        closeCartDrawer();
        openCheckoutModal();
      });
    }

    if (closeCheckoutBtn && checkoutModal) {
      closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    }

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
  });

  function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Populate order summary in checkout
    const checkoutItemsEl = document.getElementById('checkoutOrderItems');
    const checkoutTotalEl = document.getElementById('checkoutTotalAmount');
    if (checkoutItemsEl) {
      checkoutItemsEl.innerHTML = cart.map(item => `
        <div class="checkout-mini-item">
          <img src="${fixImagePath(item.image)}" alt="${item.name}" onerror="this.onerror=null; this.src='assets/images/products/rosemary_shampoo.jpg';">
          <div class="checkout-mini-info">
            <span class="checkout-mini-name">${item.name} (${item.size})</span>
            <span class="checkout-mini-sub">Qty: ${item.quantity} ${item.isSubscription ? '• Subscribed 15% Off' : ''}</span>
          </div>
          <span class="checkout-mini-price">$${((item.isSubscription ? item.price * 0.85 : item.price) * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }
    if (checkoutTotalEl) {
      checkoutTotalEl.textContent = `$${getTotal().toFixed(2)}`;
    }
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const orderNumber = 'AUR-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderNumber: orderNumber,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      total: getTotal().toFixed(2),
      shipping: getShipping() === 0 ? 'Complimentary Priority' : '$8.00 Standard',
      address: `${form.querySelector('[name="address"]').value}, ${form.querySelector('[name="city"]').value}`
    };

    // Save order into localStorage for Dashboard Order History
    try {
      const orders = JSON.parse(localStorage.getItem('aurelle_user_orders') || '[]');
      orders.unshift(orderData);
      localStorage.setItem('aurelle_user_orders', JSON.stringify(orders));

      // Also record any subscriptions
      const hasSubs = cart.some(i => i.isSubscription);
      if (hasSubs) {
        const subs = JSON.parse(localStorage.getItem('aurelle_user_subs') || '[]');
        cart.filter(i => i.isSubscription).forEach(i => {
          subs.push({
            id: 'sub-' + Date.now() + Math.random().toString(36).substr(2, 4),
            productName: i.name,
            size: i.size,
            frequency: i.frequency,
            price: (i.price * 0.85).toFixed(2),
            status: 'Active',
            nextDelivery: 'In 30 days',
            image: i.image
          });
        });
        localStorage.setItem('aurelle_user_subs', JSON.stringify(subs));
      }
    } catch (err) {}

    // Show Confirmation Screen
    const formContainer = document.getElementById('checkoutFormContainer');
    const successContainer = document.getElementById('checkoutSuccessContainer');
    const orderNumEl = document.getElementById('successOrderNumber');

    if (formContainer && successContainer) {
      formContainer.style.display = 'none';
      successContainer.style.display = 'block';
      if (orderNumEl) orderNumEl.textContent = orderNumber;
    }

    clearCart();

    if (window.showToast) {
      window.showToast(`Order ${orderNumber} placed successfully!`, 'success');
    }
  }

  // Expose API
  window.AurelleCart = {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCartDrawer,
    closeCartDrawer,
    getCart: () => cart,
    getTotal,
    getSubtotal
  };
})();
