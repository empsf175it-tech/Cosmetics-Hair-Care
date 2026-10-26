/**
 * Aurelle Hair Lab - Master Interactive Controller
 * Handles Navigation, Scrollspy, Hero Particle Canvas, Subscriptions,
 * Build-Your-Box, Booking Consultations, Knowledge Articles, FAQ,
 * Custom Cursor, Theme Toggle, and Hair Assistant Concierge Widget.
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollProgress();
    initNavbarAndScrollspy();
    initHeroParticles();
    initStatsCounter();
    initSubscriptions();
    initBuildYourBox();
    initConsultationBooking();
    initConciergeChat();
    initKnowledgeArticles();
    initFAQAccordions();
    initNewsletter();
    initCustomCursor();
    initConcernTabs();
    initGlobalModalDismiss();
  });

  /* ==========================================================================
     Toast Notification System
     ========================================================================== */
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').onclick = () => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    };

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  };

  /* ==========================================================================
     Theme Configuration (Permanent Dark Luxury Mode)
     ========================================================================== */
  function initTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      localStorage.removeItem('aurelle_theme');
    } catch (_) {}
  }

  /* ==========================================================================
     Scroll Progress & Back to Top
     ========================================================================== */
  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    const backToTopBtn = document.getElementById('backToTopBtn');
    let isBtnVisible = false;

    function applyScrollProgress(winScroll, maxScroll) {
      const scrolledRatio = maxScroll > 0 ? Math.min(Math.max(winScroll / maxScroll, 0), 1) : 0;
      if (progressBar) {
        progressBar.style.transform = `scaleX(${scrolledRatio})`;
      }

      if (backToTopBtn) {
        const shouldBeVisible = winScroll > 280;
        if (shouldBeVisible !== isBtnVisible) {
          isBtnVisible = shouldBeVisible;
          backToTopBtn.classList.toggle('visible', isBtnVisible);
        }
      }
    }

    if (window.AurelleSmoothScroll) {
      window.AurelleSmoothScroll.onScroll((y, max) => applyScrollProgress(y, max));
    } else {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const winScroll = window.pageYOffset || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            applyScrollProgress(winScroll, maxScroll);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.smoothScrollTo) {
          window.smoothScrollTo(0, { duration: 850 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  /* ==========================================================================
     Navbar, Scrollspy (EXACTLY 4 Items), Mobile Overlay Menu
     ========================================================================== */
  function initNavbarAndScrollspy() {
    const navbar = document.getElementById('mainNavbar');
    const navLinks = document.querySelectorAll('.nav-menu-link');
    const sections = [
      document.getElementById('home'),
      document.getElementById('shop'),
      document.getElementById('consult'),
      document.getElementById('subscriptions')
    ].filter(Boolean);

    // Sticky glass on scroll with state caching
    let isScrolled = false;
    function updateNavbar(y) {
      const shouldBeScrolled = y > 40;
      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        navbar?.classList.toggle('scrolled', isScrolled);
      }
    }

    if (window.AurelleSmoothScroll) {
      window.AurelleSmoothScroll.onScroll((y) => updateNavbar(y));
    } else {
      window.addEventListener('scroll', () => {
        updateNavbar(window.pageYOffset || document.documentElement.scrollTop);
      }, { passive: true });
    }

    // Scrollspy with IntersectionObserver
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));

    // Smooth Anchor Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#!') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (window.smoothScrollTo) {
            window.smoothScrollTo(targetEl);
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
          closeMobileMenu();
        }
      });
    });

    // Mobile Hamburger Overlay
    const hamburgerBtn = document.getElementById('hamburgerToggleBtn');
    const mobileMenu = document.getElementById('mobileMenuOverlay');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');

    function openMobileMenu() {
      if (mobileMenu && hamburgerBtn) {
        mobileMenu.classList.add('active');
        hamburgerBtn.classList.add('is-active');
        document.body.classList.add('menu-open');
      }
    }

    function closeMobileMenu() {
      if (mobileMenu && hamburgerBtn) {
        mobileMenu.classList.remove('active');
        hamburgerBtn.classList.remove('is-active');
        document.body.classList.remove('menu-open');
      }
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('.mobile-menu-link, .mobile-action-btn').forEach(item => {
      item.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  /* ==========================================================================
     Hero Floating Droplets & Hair Strand Particle Canvas
     ========================================================================== */
  function initHeroParticles() {
    const canvas = document.getElementById('heroParticleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.parentElement.offsetWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight;

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    });

    // Generate floating botanical droplets and gentle curling strand curves
    const particles = [];
    const particleCount = Math.min(30, Math.floor(width / 40));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
        isDroplet: Math.random() > 0.4,
        oscillation: Math.random() * Math.PI * 2,
        oscillationSpeed: Math.random() * 0.02 + 0.01
      });
    }

    let isVisible = true;
    let animId = null;

    function renderParticles() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.oscillation += p.oscillationSpeed;
        p.x += Math.sin(p.oscillation) * 0.4;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        if (p.isDroplet) {
          // Subtle warm rose gold glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 139, 122, ${p.alpha})`;
          ctx.shadowColor = 'rgba(232, 191, 176, 0.4)';
          ctx.shadowBlur = 8;
          ctx.fill();
        } else {
          // Delicate wavy strand trace
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.bezierCurveTo(p.x + 10, p.y + 15, p.x - 10, p.y + 30, p.x + 5, p.y + 45);
          ctx.strokeStyle = `rgba(217, 164, 65, ${p.alpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(renderParticles);
    }

    if (window.IntersectionObserver) {
      const heroObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(renderParticles);
        } else {
          cancelAnimationFrame(animId);
        }
      }, { threshold: 0.05 });
      heroObserver.observe(canvas.parentElement || canvas);
    } else {
      renderParticles();
    }
  }

  /* ==========================================================================
     Stats Counter (IntersectionObserver)
     ========================================================================== */
  function initStatsCounter() {
    const statsSection = document.getElementById('statsSection');
    const counters = document.querySelectorAll('.stat-count-num');
    if (!statsSection || counters.length === 0) return;

    let hasRun = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasRun) {
        hasRun = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.dataset.target);
          const duration = 2000;
          const startTime = performance.now();
          const isDecimal = target % 1 !== 0;

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = easeProgress * target;

            counter.textContent = isDecimal 
              ? current.toFixed(1) 
              : Math.floor(current).toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = isDecimal 
                ? target.toFixed(1) 
                : target.toLocaleString();
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  /* ==========================================================================
     Subscriptions Engine (Monthly / Quarterly Toggle)
     ========================================================================== */
  function initSubscriptions() {
    const toggleRadios = document.querySelectorAll('input[name="billingCycle"]');
    const planCards = document.querySelectorAll('.sub-plan-card');

    toggleRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const isQuarterly = radio.value === 'quarterly';

        planCards.forEach(card => {
          const monthlyPrice = parseFloat(card.dataset.monthly);
          const quarterlyPrice = parseFloat(card.dataset.quarterly);
          const priceDisplay = card.querySelector('.sub-plan-price-num');
          const billingNote = card.querySelector('.sub-billing-note');

          if (priceDisplay) {
            priceDisplay.style.transform = 'translateY(-10px)';
            priceDisplay.style.opacity = '0';
            setTimeout(() => {
              priceDisplay.textContent = isQuarterly ? `$${quarterlyPrice}` : `$${monthlyPrice}`;
              priceDisplay.style.transform = 'translateY(0)';
              priceDisplay.style.opacity = '1';
            }, 180);
          }

          if (billingNote) {
            billingNote.textContent = isQuarterly ? 'Billed every 90 days (extra 10% off)' : 'Billed every 30 days';
          }
        });
      });
    });

    // Plan Card CTA click
    document.querySelectorAll('.choose-plan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.sub-plan-card');
        const planName = card.querySelector('.sub-plan-name').textContent;
        const price = card.querySelector('.sub-plan-price-num').textContent.replace('$', '');
        
        if (window.AurelleCart) {
          window.AurelleCart.addToCart({
            id: 'plan-' + planName.toLowerCase().replace(/\s+/g, '-'),
            name: `${planName} Subscription Box`,
            subtitle: 'Curated Routine Membership',
            price: parseFloat(price),
            image: 'assets/images/bundles/frizz_fix_kit.jpg',
            sizes: ['Full Membership']
          }, { isSubscription: true, frequency: 'Every 30 Days' });
        }
      });
    });
  }

  /* ==========================================================================
     Build-Your-Box Interactive Customizer
     ========================================================================== */
  function initBuildYourBox() {
    const boxContainer = document.getElementById('buildBoxContainer');
    if (!boxContainer) return;

    const products = window.AURELLE_PRODUCTS || [];
    const state = {
      cleanser: products.find(p => p.id === 'prod-1') || products[0],
      conditioner: products.find(p => p.id === 'prod-2') || products[1],
      treatment: products.find(p => p.id === 'prod-3') || products[2],
      elixir: products.find(p => p.id === 'prod-5') || products[4],
      frequency: 'Every 30 Days'
    };

    function updateBoxTotals() {
      const items = [state.cleanser, state.conditioner, state.treatment, state.elixir].filter(Boolean);
      const regularTotal = items.reduce((sum, item) => sum + item.price, 0);
      const discountedTotal = regularTotal * 0.85;
      const savings = regularTotal - discountedTotal;

      const regEl = document.getElementById('boxRegularPrice');
      const discEl = document.getElementById('boxDiscountedPrice');
      const savEl = document.getElementById('boxSavingsAmount');

      if (regEl) regEl.textContent = `$${regularTotal.toFixed(2)}`;
      if (discEl) discEl.textContent = `$${discountedTotal.toFixed(2)}`;
      if (savEl) savEl.textContent = `You save $${savings.toFixed(2)} (15% Subscriber Perk)`;
    }

    // Select product options
    boxContainer.querySelectorAll('.box-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.dataset.slot;
        const prodId = btn.dataset.prodId;
        const prod = products.find(p => p.id === prodId);
        if (prod) {
          state[slot] = prod;
          const group = btn.closest('.box-slot-options');
          group.querySelectorAll('.box-select-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const previewImg = document.getElementById(`boxPreview_${slot}`);
          if (previewImg) previewImg.src = prod.image;

          updateBoxTotals();
        }
      });
    });

    // Frequency pills
    boxContainer.querySelectorAll('.box-freq-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        boxContainer.querySelectorAll('.box-freq-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.frequency = pill.dataset.freq;
      });
    });

    // Add Box to Cart CTA
    const addBoxBtn = document.getElementById('addCustomBoxToCartBtn');
    if (addBoxBtn) {
      addBoxBtn.addEventListener('click', () => {
        const items = [state.cleanser, state.conditioner, state.treatment, state.elixir].filter(Boolean);
        const regularTotal = items.reduce((sum, item) => sum + item.price, 0);

        if (window.AurelleCart) {
          window.AurelleCart.addToCart({
            id: 'custom-box-' + Date.now(),
            name: 'Custom Curated Hair Care Box',
            subtitle: items.map(i => i.name).join(' • '),
            price: regularTotal,
            image: state.treatment.image,
            sizes: ['4 Full-Size Rituals']
          }, { isSubscription: true, frequency: state.frequency });

          window.showToast?.('Custom Hair Box added with 15% VIP discount!', 'success');
        }
      });
    }

    updateBoxTotals();
  }

  /* ==========================================================================
     Book a Consultation Modal & Form
     ========================================================================== */
  function initConsultationBooking() {
    const bookBtns = document.querySelectorAll('.book-consult-btn');
    const modal = document.getElementById('consultationModal');
    const closeBtn = document.getElementById('closeConsultModalBtn');
    const form = document.getElementById('consultationBookingForm');
    const expertSelect = document.getElementById('consultExpertSelect');

    bookBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const expertName = btn.dataset.expertName;
        if (expertSelect && expertName) {
          expertSelect.value = expertName;
        }
        if (modal) {
          modal.classList.add('active');
          document.body.classList.add('modal-open');
        }
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const booking = {
          id: 'bk-' + Date.now().toString(36),
          expertName: form.querySelector('[name="expert"]').value,
          mode: form.querySelector('[name="mode"]').value,
          date: form.querySelector('[name="date"]').value,
          time: form.querySelector('[name="time"]').value,
          topic: form.querySelector('[name="concerns"]').value
        };

        // Save into localStorage
        try {
          const bookings = JSON.parse(localStorage.getItem('aurelle_user_bookings') || '[]');
          bookings.unshift(booking);
          localStorage.setItem('aurelle_user_bookings', JSON.stringify(bookings));
        } catch (err) {}

        const formBody = document.getElementById('consultFormBody');
        const successBody = document.getElementById('consultSuccessBody');
        if (formBody && successBody) {
          formBody.style.display = 'none';
          successBody.style.display = 'block';
        }

        window.showToast?.(`Consultation booked with ${booking.expertName}!`, 'success');
      });
    }
  }

  /* ==========================================================================
     Knowledge Hub Articles Reader Modal
     ========================================================================== */
  const articlesData = {
    sulfates: {
      title: "The Truth About Sulfates: Why Gentle Surfactants Matter",
      subtitle: "A cosmetic chemist breakdown of lipid disruption and surface tension.",
      readTime: "4 min read",
      author: "Julian Thorne, Head Formulator",
      image: "assets/images/articles/article_sulfates.jpg",
      content: `
        <p>Traditional shampoos rely on Sodium Lauryl Sulfate (SLS) and Sodium Laureth Sulfate (SLES) for one primary reason: they are cheap foaming agents that produce copious bubbles. However, their harsh molecular structure strips not just grease, but the 18-MEA (18-methyleicosanoic acid) lipid cuticle layer that seals natural hair.</p>
        <p>Once this protective lipid membrane is breached, the hair shaft becomes chronically porous. Moisture escapes through the raised cuticles, causing rampant frizz, accelerated color fading, and dry scalp irritation.</p>
        <h4>The Aurelle Biomimetic Alternative</h4>
        <p>At Aurelle Hair Lab, we replace harsh sulfates with coconut-derived Sodium Cocoyl Isethionate and oat-derived amino acid cleansers. These micro-micelles dissolve excess sebum and environmental pollutants while maintaining an optimal pH of 5.5, preserving your scalp's vital microbiome.</p>
      `
    },
    porosity: {
      title: "The Porosity Blueprint: How Your Cuticles Absorb Moisture",
      subtitle: "Understanding why your hair behaves the way it does in humidity and water.",
      readTime: "5 min read",
      author: "Dr. Elena Vance, Certified Trichologist",
      image: "assets/images/articles/article_porosity.jpg",
      content: `
        <p>Hair porosity refers to your hair's ability to absorb and retain moisture. It is determined by the condition and spacing of the shingle-like cuticle scales covering the cortex.</p>
        <h4>Low Porosity (The Moisture-Resistant Shield)</h4>
        <p>Cuticles are tightly clamped shut like roof tiles. Water beads on top, products sit without sinking in, and drying takes hours. Low porosity hair requires warm water to expand the cuticles and lightweight humectants like aloe vera and silk amino acids.</p>
        <h4>High Porosity (The Thirsty Sponge)</h4>
        <p>Cuticles are raised, chipped, or missing due to chemical bleach or heat styling. High porosity hair drinks water instantly but loses it just as quickly. It thrives on rich biomimetic plant keratin treatments and heavy lipid sealants like murumuru and argan.</p>
      `
    },
    scalp: {
      title: "Scalp Microbiome: The Root of Hair Longevity",
      subtitle: "Why beautiful hair cannot grow from a stressed follicular environment.",
      readTime: "4 min read",
      author: "Dr. Elena Vance, Certified Trichologist",
      image: "assets/images/articles/article_scalp.jpg",
      content: `
        <p>The scalp is skin—in fact, it has higher sebum production, thicker epidermis, and over 100,000 follicular openings. When harsh detergents disrupt its acidic mantle, Malassezia yeast overgrowth triggers inflammation, itching, and premature shedding.</p>
        <p>Weekly exfoliation using pink salt crystals gently lifts dead keratinocytes and hard water minerals. Paired with GHK-Cu copper peptides and cold-pressed rosemary oil, you increase follicular microcirculation by up to 40%.</p>
      `
    },
    heat: {
      title: "Thermal Heat Defense: 450°F Barrier Science",
      subtitle: "How heat denatures alpha-keratin coils and how to prevent split ends.",
      readTime: "3 min read",
      author: "Maya Lin, Master Stylist",
      image: "assets/images/articles/article_heat.jpg",
      content: `
        <p>At temperatures above 350°F (175°C), the alpha-keratin helices that provide hair with structural elasticity begin to denature into weaker beta-keratin. The natural moisture trapped inside vaporizes, causing bubble hair deformity and irreversible snapping.</p>
        <p>Aurelle's Thermal Shield mist forms a microscopic botanical film made of beet root bio-polymers and bamboo extract. It dissipates thermal energy uniformly across the surface, preserving strand integrity up to 450°F.</p>
      `
    }
  };

  function initKnowledgeArticles() {
    const cards = document.querySelectorAll('.article-read-btn');
    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementById('closeArticleModalBtn');

    cards.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.articleKey;
        const article = articlesData[key];
        if (!article || !modal) return;

        const body = document.getElementById('articleModalBody');
        if (body) {
          body.innerHTML = `
            <div class="article-modal-content">
              <div class="article-modal-header text-center">
                <span class="badge badge-sage">${article.readTime}</span>
                <h2 style="font-family: var(--font-serif); font-size: 2.2rem; margin: 12px 0;">${article.title}</h2>
                <p style="color: var(--rose-gold); font-size: 1rem;">${article.subtitle}</p>
                <div style="margin: 12px 0; font-size: 0.9rem; color: var(--text-muted);">Written by ${article.author}</div>
              </div>
              <img src="${article.image}" alt="${article.title}" class="article-modal-img" style="width: 100%; border-radius: 12px; margin: 20px 0; max-height: 380px; object-fit: cover;">
              <div class="article-modal-prose" style="line-height: 1.8; color: var(--text-color);">
                ${article.content}
              </div>
            </div>
          `;
        }

        modal.classList.add('active');
        document.body.classList.add('modal-open');
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    }
  }

  /* ==========================================================================
     FAQ Accordions
     ========================================================================== */
  function initFAQAccordions() {
    const accordions = document.querySelectorAll('.faq-item');
    accordions.forEach(item => {
      const header = item.querySelector('.faq-question');
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close siblings in same container
        const parent = item.parentElement;
        parent.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  /* ==========================================================================
     Concierge Chat Assistant Widget
     ========================================================================== */
  function initConciergeChat() {
    const toggleBtn = document.getElementById('chatWidgetToggle');
    const chatDrawer = document.getElementById('chatWidgetDrawer');
    const closeBtn = document.getElementById('closeChatDrawerBtn');
    const messagesContainer = document.getElementById('chatMessagesContainer');
    const inputForm = document.getElementById('chatInputForm');
    const chatInput = document.getElementById('chatInputField');

    if (!toggleBtn || !chatDrawer) return;

    toggleBtn.addEventListener('click', () => {
      chatDrawer.classList.toggle('active');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        chatDrawer.classList.remove('active');
      });
    }

    const cannedAnswers = {
      quiz: "You can discover your exact hair profile and routine in 2 minutes! <a href='#consult' onclick='document.getElementById(\"chatWidgetDrawer\").classList.remove(\"active\");' style='color: var(--rose-gold); text-decoration: underline;'>Take the Hair Diagnostic Quiz here</a>.",
      sulfate: "Every Aurelle formulation is 100% sulfate-free, paraben-free, and silicone-free! We use gentle coconut-derived cleansers that preserve your natural lipids.",
      consult: "You can book a 1-on-1 private video or chat consultation with our certified trichologist or cosmetic chemist! <a href='#consult' onclick='document.getElementById(\"chatWidgetDrawer\").classList.remove(\"active\");' style='color: var(--rose-gold); text-decoration: underline;'>Book a session here</a>.",
      shipping: "We offer Complimentary Carbon-Neutral Express Shipping on all orders over $65, and on all auto-replenish subscriptions!"
    };

    function addMessage(text, isUser = false) {
      const msg = document.createElement('div');
      msg.className = `chat-msg ${isUser ? 'user' : 'assistant'}`;
      msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Quick Canned Prompt Buttons
    document.querySelectorAll('.chat-canned-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.canned;
        addMessage(btn.textContent, true);
        setTimeout(() => {
          addMessage(cannedAnswers[key] || "I am happy to assist! How can I help your hair journey?", false);
        }, 400);
      });
    });

    if (inputForm && chatInput) {
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        addMessage(text, true);
        chatInput.value = '';

        setTimeout(() => {
          const lower = text.toLowerCase();
          if (lower.includes('quiz') || lower.includes('diagnostic')) {
            addMessage(cannedAnswers.quiz, false);
          } else if (lower.includes('sulfate') || lower.includes('paraben')) {
            addMessage(cannedAnswers.sulfate, false);
          } else if (lower.includes('expert') || lower.includes('book') || lower.includes('doctor')) {
            addMessage(cannedAnswers.consult, false);
          } else if (lower.includes('shipping') || lower.includes('delivery')) {
            addMessage(cannedAnswers.shipping, false);
          } else {
            addMessage("Thank you for reaching out! To find your custom routine, we highly recommend taking our <a href='#consult' style='color: var(--rose-gold);'>Hair Diagnostic Quiz</a> or chatting with one of our trichologists.", false);
          }
        }, 500);
      });
    }
  }

  /* ==========================================================================
     Newsletter Form
     ========================================================================== */
  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        window.showToast?.(`Thank you! Your Comprehensive Hair Biology Guide has been sent to ${email}`, 'success');
        form.reset();
      });
    }
  }

  /* ==========================================================================
     Custom Luxury Cursor (Desktop Only)
     ========================================================================== */
  function initCustomCursor() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'custom-cursor-follower';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function loopFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      requestAnimationFrame(loopFollower);
    }
    loopFollower();

    // Hover states on interactive elements
    const hoverTargets = 'a, button, input, select, textarea, .tilt-card, .filter-chip, .size-pill';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('cursor-hover');
        follower.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('cursor-hover');
      }
    });
  }

  /* ==========================================================================
     Hair Concerns Explorer Tab Switcher
     ========================================================================== */
  function initConcernTabs() {
    const tabsNav = document.getElementById('concernTabsNav');
    if (!tabsNav) return;

    const buttons = tabsNav.querySelectorAll('.concern-tab-btn');
    const panes = document.querySelectorAll('.concern-pane');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;

        // Update active state on tab buttons
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Reveal matching concern pane with smooth re-entry
        panes.forEach(pane => {
          if (pane.id === targetId) {
            pane.classList.add('active');
            pane.style.animation = 'none';
            void pane.offsetWidth; // force DOM reflow
            pane.style.animation = '';
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
  }

  /* ==========================================================================
     Global Modal Backdrop & ESC Dismiss
     ========================================================================== */
  function initGlobalModalDismiss() {
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        e.target.querySelector('.modal-window')?.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        if (activeModals.length > 0) {
          activeModals.forEach(m => {
            m.classList.remove('active');
            m.querySelector('.modal-window')?.classList.remove('active');
          });
          document.body.classList.remove('modal-open');
        }
      }
    });
  }

})();
