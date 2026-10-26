/**
 * Aurelle Hair Lab - Client-Ready Demo Auth & Concierge Dashboard
 * Handles login/signup, password visibility, and full account management:
 * - Syncs Hair Biology Profile from Quiz
 * - Subscriptions Management (pause, skip next delivery, change frequency)
 * - Order History & tracking
 * - Booked Expert Consultations
 * - Wishlist
 */
(function() {
  'use strict';

  const USER_KEY = 'aurelle_logged_user';
  const SUBS_KEY = 'aurelle_user_subs';
  const ORDERS_KEY = 'aurelle_user_orders';
  const PROFILE_KEY = 'aurelle_hair_profile';
  const BOOKINGS_KEY = 'aurelle_user_bookings';
  const WISHLIST_KEY = 'aurelle_user_wishlist';

  let currentUser = null;

  function fixImagePath(path) {
    if (!path) return 'assets/images/products/rosemary_shampoo.jpg';
    if (path.startsWith('images/')) return 'assets/' + path;
    return path;
  }

  // Initialize demo data if not present
  function initDemoData() {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
      }

      // Auto-migrate any previously stored localStorage data with legacy 'images/' paths
      const storedSubs = localStorage.getItem(SUBS_KEY);
      if (storedSubs && storedSubs.includes('"images/')) {
        localStorage.setItem(SUBS_KEY, storedSubs.replace(/"images\//g, '"assets/images/'));
      }
      const storedOrders = localStorage.getItem(ORDERS_KEY);
      if (storedOrders && storedOrders.includes('"images/')) {
        localStorage.setItem(ORDERS_KEY, storedOrders.replace(/"images\//g, '"assets/images/'));
      }

      if (!localStorage.getItem(SUBS_KEY)) {
        const defaultSubs = [
          {
            id: 'sub-demo-1',
            productName: 'Botanical Clarifying Shampoo',
            size: '300ml',
            frequency: 'Every 30 Days',
            price: '32.30',
            status: 'Active',
            nextDelivery: 'In 14 days',
            image: 'assets/images/products/rosemary_shampoo.jpg'
          },
          {
            id: 'sub-demo-2',
            productName: 'Intensive Argan & Shea Mask',
            size: '250ml',
            frequency: 'Every 45 Days',
            price: '45.90',
            status: 'Active',
            nextDelivery: 'In 28 days',
            image: 'assets/images/products/argan_hair_mask.jpg'
          }
        ];
        localStorage.setItem(SUBS_KEY, JSON.stringify(defaultSubs));
      }

      if (!localStorage.getItem(ORDERS_KEY)) {
        const defaultOrders = [
          {
            orderNumber: 'AUR-892415',
            date: 'Oct 14, 2026',
            items: [
              { name: 'Restorative Keratin Conditioner', size: '300ml', quantity: 1, price: 42.00, image: 'assets/images/products/keratin_conditioner.jpg' },
              { name: 'Botanical Bonding Gloss Elixir', size: '100ml', quantity: 1, price: 48.00, image: 'assets/images/products/gloss_bonding_oil.jpg' }
            ],
            total: '90.00',
            shipping: 'Complimentary Priority',
            address: '742 Evergreen Terrace, San Francisco, CA'
          }
        ];
        localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
      }

      if (!localStorage.getItem(BOOKINGS_KEY)) {
        const defaultBookings = [
          {
            id: 'bk-102',
            expertName: 'Dr. Elena Vance (Certified Trichologist)',
            mode: 'HD Video Consultation',
            date: 'Nov 02, 2026',
            time: '10:30 AM PST',
            topic: 'Scalp density analysis & seasonal shedding review'
          }
        ];
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(defaultBookings));
      }
    } catch (e) {}
  }

  function openAccountModal() {
    const modal = document.getElementById('accountModal');
    if (!modal) return;

    const mobileMenu = document.getElementById('mobileMenuOverlay');
    if (mobileMenu) mobileMenu.classList.remove('active');
    const hamburgerBtn = document.getElementById('hamburgerToggleBtn');
    if (hamburgerBtn) hamburgerBtn.classList.remove('is-active');
    document.body.classList.remove('menu-open');

    if (currentUser) {
      showDashboardView();
    } else {
      showAuthView();
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  function showAuthView() {
    const authContainer = document.getElementById('authViewContainer');
    const dashContainer = document.getElementById('dashboardViewContainer');
    if (authContainer && dashContainer) {
      authContainer.style.display = 'block';
      dashContainer.style.display = 'none';
    }
  }

  function showDashboardView() {
    const authContainer = document.getElementById('authViewContainer');
    const dashContainer = document.getElementById('dashboardViewContainer');
    if (authContainer && dashContainer) {
      authContainer.style.display = 'none';
      dashContainer.style.display = 'block';
      renderDashboard();
    }
  }

  function renderDashboard() {
    if (!currentUser) return;

    // Welcome Header
    const nameEl = document.getElementById('dashUserName');
    const emailEl = document.getElementById('dashUserEmail');
    if (nameEl) nameEl.textContent = currentUser.name || 'Aurelle Member';
    if (emailEl) emailEl.textContent = currentUser.email || 'member@aurellehairlab.com';

    // Hair Profile Tab
    renderHairProfileSummary();

    // Subscriptions Tab
    renderSubscriptions();

    // Orders Tab
    renderOrders();

    // Consultations Tab
    renderConsultations();
  }

  function renderHairProfileSummary() {
    const summaryCard = document.getElementById('dashProfileContent');
    if (!summaryCard) return;

    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (profile) {
        summaryCard.innerHTML = `
          <div class="dash-archetype-card">
            <span class="badge badge-gold">Active Diagnosis</span>
            <h3>${profile.archetype}</h3>
            <p style="margin: 8px 0; color: var(--text-muted);">Calibrated on ${profile.generatedAt}</p>
            <div class="dash-profile-meta-grid">
              <div class="dash-meta-item">
                <span class="dash-meta-lbl">Texture</span>
                <strong>${profile.texture.toUpperCase()}</strong>
              </div>
              <div class="dash-meta-item">
                <span class="dash-meta-lbl">Porosity</span>
                <strong>${profile.porosity.toUpperCase()}</strong>
              </div>
              <div class="dash-meta-item">
                <span class="dash-meta-lbl">Scalp Biology</span>
                <strong>${profile.scalp.toUpperCase()}</strong>
              </div>
            </div>
            <div style="margin-top: 16px;">
              <a href="#consult" class="btn btn-sm btn-outline-rose" onclick="window.AurelleQuiz?.retakeQuiz(); window.AurelleAuth?.closeAccountModal();">
                Update / Retake Diagnostic
              </a>
            </div>
          </div>
        `;
      } else {
        summaryCard.innerHTML = `
          <div class="dash-empty-banner text-center" style="padding: 24px;">
            <p>You haven't completed your clinical hair diagnostic yet.</p>
            <a href="#consult" class="btn btn-rose btn-sm" onclick="window.AurelleAuth?.closeAccountModal();" style="margin-top: 12px;">
              Take the Hair Quiz (2 Mins)
            </a>
          </div>
        `;
      }
    } catch (e) {}
  }

  function renderSubscriptions() {
    const container = document.getElementById('dashSubsList');
    if (!container) return;

    try {
      const subs = JSON.parse(localStorage.getItem(SUBS_KEY) || '[]');
      if (subs.length === 0) {
        container.innerHTML = `
          <div class="dash-empty-box text-center" style="padding: 30px;">
            <p style="color: var(--text-muted);">No active auto-replenishment subscriptions.</p>
            <a href="#subscriptions" class="btn btn-sm btn-rose" onclick="window.AurelleAuth?.closeAccountModal();" style="margin-top: 12px;">
              Explore Subscription Rituals (Save 15%)
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = subs.map((sub, idx) => `
        <div class="dash-sub-card">
          <div class="dash-sub-img">
            <img src="${fixImagePath(sub.image)}" alt="${sub.productName}" onerror="this.onerror=null; this.src='assets/images/products/rosemary_shampoo.jpg';">
          </div>
          <div class="dash-sub-details">
            <div class="dash-sub-header">
              <h4>${sub.productName}</h4>
              <span class="badge ${sub.status === 'Active' ? 'badge-sage' : 'badge-gold'}">${sub.status}</span>
            </div>
            <p class="dash-sub-meta">${sub.size} • $${sub.price}/shipment • ${sub.frequency}</p>
            <p class="dash-sub-next"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Next Box: ${sub.nextDelivery}</p>
            <div class="dash-sub-actions">
              <button class="btn-dash-action" data-action="toggle-status" data-index="${idx}">
                ${sub.status === 'Active' ? 'Pause' : 'Resume'}
              </button>
              <button class="btn-dash-action" data-action="skip-delivery" data-index="${idx}">
                Skip Next Cycle
              </button>
              <button class="btn-dash-action danger" data-action="cancel-sub" data-index="${idx}">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {}
  }

  function renderOrders() {
    const container = document.getElementById('dashOrdersList');
    if (!container) return;

    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (orders.length === 0) {
        container.innerHTML = `<p style="padding: 24px; text-align: center; color: var(--text-muted);">No orders yet.</p>`;
        return;
      }

      container.innerHTML = orders.map(ord => `
        <div class="dash-order-card">
          <div class="dash-order-header">
            <div>
              <strong>Order #${ord.orderNumber}</strong>
              <span class="dash-order-date">${ord.date}</span>
            </div>
            <span class="badge badge-botanical">Delivered</span>
          </div>
          <div class="dash-order-items">
            ${ord.items.map(item => `
              <div class="dash-order-item-row">
                <span>${item.name} (${item.size || '300ml'}) x${item.quantity || 1}</span>
                <span>$${((item.price || 38) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="dash-order-footer">
            <span>Total: <strong>$${ord.total}</strong></span>
            <button class="btn btn-sm btn-outline-rose" onclick="window.showToast?.('Order tracking details sent to email', 'info')">
              Track Package
            </button>
          </div>
        </div>
      `).join('');
    } catch (e) {}
  }

  function renderConsultations() {
    const container = document.getElementById('dashBookingsList');
    if (!container) return;

    try {
      const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
      if (bookings.length === 0) {
        container.innerHTML = `
          <div class="dash-empty-box text-center" style="padding: 24px;">
            <p style="color: var(--text-muted);">No consultations currently booked.</p>
            <a href="#consult" class="btn btn-sm btn-outline-rose" onclick="window.AurelleAuth?.closeAccountModal();" style="margin-top: 10px;">
              Book with an Expert
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = bookings.map(b => `
        <div class="dash-booking-card">
          <div class="dash-booking-header">
            <h4>${b.expertName}</h4>
            <span class="badge badge-rose">${b.mode}</span>
          </div>
          <p style="color: var(--rose-gold); margin: 6px 0;"><strong>${b.date} at ${b.time}</strong></p>
          <p style="font-size: 0.88rem; color: var(--text-muted);">${b.topic}</p>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn btn-sm btn-rose" onclick="window.showToast?.('Opening secure video consultation room...', 'info')">Join Room</button>
            <button class="btn btn-sm btn-outline-rose" onclick="window.showToast?.('Calendar invite (.ics) downloaded', 'success')">Add to Calendar</button>
          </div>
        </div>
      `).join('');
    } catch (e) {}
  }

  function login(email, name = 'Valued Member') {
    currentUser = {
      name: name,
      email: email,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch (e) {}

    showDashboardView();
    if (window.showToast) {
      window.showToast(`Welcome back to Aurelle, ${currentUser.name}!`, 'success');
    }
  }

  function logout() {
    currentUser = null;
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
    showAuthView();
    if (window.showToast) {
      window.showToast('You have been signed out.', 'info');
    }
  }

  // Setup Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    initDemoData();

    // Trigger buttons
    document.querySelectorAll('.account-modal-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAccountModal();
      });
    });

    const closeBtn = document.getElementById('closeAccountModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeAccountModal);

    // Auth Tabs (Login vs Signup)
    const loginTabBtn = document.getElementById('tabBtnLogin');
    const signupTabBtn = document.getElementById('tabBtnSignup');
    const loginForm = document.getElementById('authLoginForm');
    const signupForm = document.getElementById('authSignupForm');

    if (loginTabBtn && signupTabBtn && loginForm && signupForm) {
      loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
      });

      signupTabBtn.addEventListener('click', () => {
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
      });
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          btn.innerHTML = isPassword 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        }
      });
    });

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('[name="email"]').value;
        const name = email.split('@')[0];
        login(email, name.charAt(0).toUpperCase() + name.slice(1));
      });
    }

    // Signup Form Submit
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('[name="name"]').value;
        const email = signupForm.querySelector('[name="email"]').value;
        login(email, name);
      });
    }

    // Logout
    const logoutBtn = document.getElementById('dashLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Dashboard tabs
    const dashTabs = document.querySelectorAll('.dash-nav-btn');
    dashTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        dashTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.dataset.targetTab;
        document.querySelectorAll('.dash-tab-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
      });
    });

    // Subscriptions actions delegation
    const subsContainer = document.getElementById('dashSubsList');
    if (subsContainer) {
      subsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;
        let subs = JSON.parse(localStorage.getItem(SUBS_KEY) || '[]');

        if (action === 'toggle-status') {
          subs[idx].status = subs[idx].status === 'Active' ? 'Paused' : 'Active';
          localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
          renderSubscriptions();
          if (window.showToast) window.showToast(`Subscription status updated`, 'info');
        } else if (action === 'skip-delivery') {
          subs[idx].nextDelivery = 'Skipped to next cycle';
          localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
          renderSubscriptions();
          if (window.showToast) window.showToast(`Next cycle delivery skipped`, 'info');
        } else if (action === 'cancel-sub') {
          if (confirm('Are you sure you want to cancel this auto-replenishment subscription?')) {
            subs.splice(idx, 1);
            localStorage.setItem(SUBS_KEY, JSON.stringify(subs));
            renderSubscriptions();
            if (window.showToast) window.showToast(`Subscription cancelled`, 'info');
          }
        }
      });
    }
  });

  window.AurelleAuth = {
    openAccountModal,
    closeAccountModal,
    login,
    logout,
    getUser: () => currentUser
  };
})();
