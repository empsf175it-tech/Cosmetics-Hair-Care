/**
 * Aurelle Hair Lab - Hair Type Diagnostic Quiz Engine
 * Multi-step clinical questionnaire, porosity water-glass test guide,
 * personalized Hair Profile generation, and customized routine prescription.
 */
(function() {
  'use strict';

  const quizState = {
    currentStep: 1,
    totalSteps: 6,
    answers: {
      texture: 'wavy',
      porosity: 'medium',
      scalp: 'balanced',
      concern: 'frizz',
      treatments: ['color'],
      goal: 'shine'
    }
  };

  const stepsData = [
    {
      step: 1,
      title: "What is your natural hair texture & curl pattern?",
      subtitle: "Observe your hair when air-dried without any styling products.",
      field: "texture",
      options: [
        {
          value: "straight",
          label: "Type 1: Straight",
          desc: "Hair falls completely flat from root to tip with natural gloss.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="2" x2="12" y2="22"/><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/></svg>`
        },
        {
          value: "wavy",
          label: "Type 2: Wavy (2A - 2C)",
          desc: "Gentle S-curves or loose beachy waves with medium body.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12c2.5-3 5.5-3 8 0s5.5 3 8 0"/><path d="M4 6c2.5-3 5.5-3 8 0s5.5 3 8 0"/><path d="M4 18c2.5-3 5.5-3 8 0s5.5 3 8 0"/></svg>`
        },
        {
          value: "curly",
          label: "Type 3: Curly (3A - 3C)",
          desc: "Defined springy spirals or corkscrews with noticeable shrinkage.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a4 4 0 0 0-4 4c0 3 4 5 4 8a4 4 0 0 1-4 4c0 3 4 4 4 4"/></svg>`
        },
        {
          value: "coily",
          label: "Type 4: Coily / Kinky (4A - 4C)",
          desc: "Tight zigzag angles or micro-coils with dense, voluminous architecture.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="6" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="18" r="3"/></svg>`
        }
      ]
    },
    {
      step: 2,
      title: "How does your hair absorb water & moisture (Porosity)?",
      subtitle: "Porosity determines whether your cuticle scales are tightly closed, normal, or wide open.",
      field: "porosity",
      hasWaterGlassHelper: true,
      options: [
        {
          value: "low",
          label: "Low Porosity (Moisture Resistant)",
          desc: "Takes forever to get fully wet, products sit on top, slow drying time.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
        },
        {
          value: "medium",
          label: "Medium Porosity (Balanced Cuticle)",
          desc: "Absorbs hydration smoothly, holds styles well, consistent shine.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 11v6"/></svg>`
        },
        {
          value: "high",
          label: "High Porosity (Porous / Lifted)",
          desc: "Drinks water instantly, dries super fast, prone to immediate frizz & dullness.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
        }
      ]
    },
    {
      step: 3,
      title: "What is your primary scalp condition?",
      subtitle: "A balanced scalp microbiome is the foundation of follicular vitality.",
      field: "scalp",
      options: [
        {
          value: "oily",
          label: "Oily / Overactive Sebum",
          desc: "Roots look greasy within 24 hours of washing, flat volume.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`
        },
        {
          value: "balanced",
          label: "Balanced / Normal",
          desc: "Feels comfortable between washes, rarely itchy or excessively oily.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`
        },
        {
          value: "dry",
          label: "Dry, Tight or Flaky",
          desc: "Prone to fine white flakes, tight sensation, needs rich moisture.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18"/><path d="M3 12h18"/><path d="m5.5 5.5 13 13"/><path d="m18.5 5.5-13 13"/></svg>`
        },
        {
          value: "sensitive",
          label: "Sensitive / Reactive",
          desc: "Tingling, redness, or burning from sulfates, heat, and harsh perfumes.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        }
      ]
    },
    {
      step: 4,
      title: "What is your main hair care frustration right now?",
      subtitle: "Select the challenge you want our clinical formulas to solve first.",
      field: "concern",
      options: [
        {
          value: "frizz",
          label: "Persistent Frizz & Puffiness",
          desc: "Cuticles open up in humidity, creating unruly halos.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`
        },
        {
          value: "dryness",
          label: "Dehydration & Straw-like Texture",
          desc: "Ends feel brittle, coarse, lacking softness and flexibility.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
        },
        {
          value: "shedding",
          label: "Hair Fall & Thinning Roots",
          desc: "Excessive shedding in the shower or visible loss of density.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20v-8m0 0l-4 4m4-4l4 4"/><circle cx="12" cy="5" r="3"/></svg>`
        },
        {
          value: "color_damage",
          label: "Chemical, Bleach or Heat Damage",
          desc: "Broken disulfide bonds, split ends, and accelerated color fading.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M16 16l6-6"/><path d="m18 8 3-3"/></svg>`
        }
      ]
    },
    {
      step: 5,
      title: "Chemical treatments & environmental stressors?",
      subtitle: "Choose all that apply to calibrate exact lipid-to-protein ratio.",
      field: "treatments",
      isMulti: true,
      options: [
        {
          value: "color",
          label: "Color-Treated / Balayage",
          desc: "Permanent dye, highlights, or toner requiring UV and color lock.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 14.83 4.24 4.24"/></svg>`
        },
        {
          value: "heat",
          label: "Daily Heat Styling (350°F+)",
          desc: "Frequent blow drying, flat irons, or curling tongs.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
        },
        {
          value: "hardwater",
          label: "Hard Tap Water Exposure",
          desc: "Calcium and mineral deposits causing buildup and brassiness.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`
        },
        {
          value: "none",
          label: "Virgin Hair (No Chemicals)",
          desc: "Naturally untouched by bleach, perms, or relaxers.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
        }
      ]
    },
    {
      step: 6,
      title: "What is your primary hair transformation goal?",
      subtitle: "The signature finish you desire after 30 days with Aurelle.",
      field: "goal",
      options: [
        {
          value: "shine",
          label: "Glass Mirror Shine & Silk Slip",
          desc: "Ultra-reflective, polished cuticles that glide through fingers.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        },
        {
          value: "definition",
          label: "Weightless Curl Definition & Spring",
          desc: "Juicy, clumped curls and waves with 72-hour moisture lock.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/></svg>`
        },
        {
          value: "density",
          label: "Maximum Follicular Density & Volume",
          desc: "Thicker feeling roots, reduced shedding, fuller ponytail girth.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`
        },
        {
          value: "repair",
          label: "Total Structural Bond Rebuilding",
          desc: "Restoring broken strands, eliminating split ends, resilient elasticity.",
          icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
        }
      ]
    }
  ];

  function renderCurrentStep() {
    const stepObj = stepsData[quizState.currentStep - 1];
    const container = document.getElementById('quizStepContainer');
    const progressBar = document.getElementById('quizProgressBar');
    const stepCountEl = document.getElementById('quizStepIndicator');
    const prevBtn = document.getElementById('quizPrevBtn');
    const nextBtn = document.getElementById('quizNextBtn');

    if (!container) return;

    // Progress bar
    const percent = Math.round((quizState.currentStep / quizState.totalSteps) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (stepCountEl) stepCountEl.textContent = `Step ${quizState.currentStep} of ${quizState.totalSteps}`;

    if (prevBtn) {
      const isVisible = quizState.currentStep > 1;
      prevBtn.style.visibility = isVisible ? 'visible' : 'hidden';
      prevBtn.classList.toggle('hidden-step', !isVisible);
    }
    if (nextBtn) nextBtn.textContent = quizState.currentStep === quizState.totalSteps ? 'Generate Hair Profile' : 'Next Question →';

    let html = `
      <div class="quiz-step-header text-center">
        <h3 class="quiz-question-title">${stepObj.title}</h3>
        <p class="quiz-question-desc">${stepObj.subtitle}</p>
        ${stepObj.hasWaterGlassHelper ? `
          <button type="button" class="porosity-helper-btn" id="openPorosityModalBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            How to do the 3-Minute Water Glass Porosity Test
          </button>
        ` : ''}
      </div>

      <div class="quiz-options-grid ${stepObj.options.length === 3 ? 'grid-3' : 'grid-4'}">
    `;

    stepObj.options.forEach(opt => {
      const isSelected = stepObj.isMulti 
        ? quizState.answers[stepObj.field]?.includes(opt.value)
        : quizState.answers[stepObj.field] === opt.value;

      html += `
        <div class="quiz-option-card tilt-card ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-field="${stepObj.field}" data-multi="${!!stepObj.isMulti}">
          <div class="quiz-option-inner tilt-depth">
            <div class="quiz-option-icon">${opt.icon}</div>
            <h4 class="quiz-option-label">${opt.label}</h4>
            <p class="quiz-option-text">${opt.desc}</p>
            <div class="quiz-select-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    if (window.initTiltCards) {
      window.initTiltCards(container);
    }

    // Attach porosity test popup trigger
    const porosityBtn = document.getElementById('openPorosityModalBtn');
    if (porosityBtn) {
      porosityBtn.addEventListener('click', openPorosityModal);
    }
  }

  function handleOptionClick(card) {
    const field = card.dataset.field;
    const value = card.dataset.value;
    const isMulti = card.dataset.multi === 'true';

    if (isMulti) {
      let current = quizState.answers[field] || [];
      if (value === 'none') {
        current = ['none'];
      } else {
        current = current.filter(v => v !== 'none');
        if (current.includes(value)) {
          current = current.filter(v => v !== value);
        } else {
          current.push(value);
        }
      }
      quizState.answers[field] = current;
    } else {
      quizState.answers[field] = value;
    }

    renderCurrentStep();
  }

  function nextStep() {
    if (quizState.currentStep < quizState.totalSteps) {
      quizState.currentStep++;
      renderCurrentStep();
    } else {
      showResults();
    }
  }

  function prevStep() {
    if (quizState.currentStep > 1) {
      quizState.currentStep--;
      renderCurrentStep();
    }
  }

  function computeArchetype() {
    const { texture, porosity, scalp, concern, goal } = quizState.answers;
    
    let archetypeName = "Luminous Moisture-Balanced Archetype";
    let summary = "Your hair displays well-conditioned cuticle integrity with a strong response to lightweight botanical oils.";
    let hydrationScore = 78;
    let cuticleScore = 84;
    let scalpBalanceScore = 80;

    if (porosity === 'high' || concern === 'color_damage') {
      archetypeName = "High-Porosity Bond-Rebuilding Archetype";
      summary = "Your cuticles are elevated or chemically compromised, requiring intensive plant keratin infusions and lipid barriers to halt moisture evaporation.";
      hydrationScore = 45;
      cuticleScore = 52;
      scalpBalanceScore = 70;
    } else if (texture === 'curly' || texture === 'coily') {
      archetypeName = "High-Density Moisture-Sculpting Archetype";
      summary = "Your natural curl spirals require rich emollients like Murumuru butter and flaxseed mucilage to lock in moisture and define clumps without frizz.";
      hydrationScore = 58;
      cuticleScore = 75;
      scalpBalanceScore = 78;
    } else if (scalp === 'oily' || concern === 'shedding') {
      archetypeName = "Follicular Density & Scalp Detox Archetype";
      summary = "Your follicular roots benefit from cold-pressed rosemary clarifying washes and GHK-Cu copper peptides to unclog pores and encourage vigorous microcirculation.";
      hydrationScore = 82;
      cuticleScore = 88;
      scalpBalanceScore = 54;
    }

    return {
      name: archetypeName,
      summary: summary,
      scores: {
        hydration: hydrationScore,
        cuticle: cuticleScore,
        scalp: scalpBalanceScore
      }
    };
  }

  function getPrescribedRoutine() {
    const products = window.AURELLE_PRODUCTS || [];
    const { texture, porosity, scalp, concern } = quizState.answers;
    
    // Choose 4 tailored products
    let routine = [];

    // Step 1: Cleanser
    if (concern === 'color_damage' || quizState.answers.treatments?.includes('color')) {
      routine.push(products.find(p => p.id === 'prod-8') || products[0]); // Violet or clarifying
    } else {
      routine.push(products.find(p => p.id === 'prod-1') || products[0]);
    }

    // Step 2: Conditioner / Mask
    if (porosity === 'high' || texture === 'coily') {
      routine.push(products.find(p => p.id === 'prod-3') || products[2]); // Intensive Argan Mask
    } else {
      routine.push(products.find(p => p.id === 'prod-2') || products[1]); // Keratin Conditioner
    }

    // Step 3: Treatment / Scalp
    if (scalp === 'dry' || scalp === 'sensitive') {
      routine.push(products.find(p => p.id === 'prod-12') || products[3]); // Neem Scalp Oil
    } else if (scalp === 'oily' || concern === 'shedding') {
      routine.push(products.find(p => p.id === 'prod-4') || products[3]); // Biotin Scalp Serum
    } else {
      routine.push(products.find(p => p.id === 'prod-10') || products[1]); // Leave-in detangler
    }

    // Step 4: Finishing Seal
    if (texture === 'curly' || texture === 'coily') {
      routine.push(products.find(p => p.id === 'prod-6') || products[4]); // Curl cream
    } else {
      routine.push(products.find(p => p.id === 'prod-5') || products[4]); // Bonding Gloss Elixir
    }

    return routine;
  }

  function showResults() {
    const quizCard = document.getElementById('quizCard');
    const resultCard = document.getElementById('quizResultCard');

    if (!quizCard || !resultCard) return;

    quizCard.style.display = 'none';
    resultCard.style.display = 'block';

    const archetype = computeArchetype();
    const routine = getPrescribedRoutine();

    // Save profile to localStorage for Dashboard integration
    try {
      const userProfile = {
        archetype: archetype.name,
        texture: quizState.answers.texture,
        porosity: quizState.answers.porosity,
        scalp: quizState.answers.scalp,
        scores: archetype.scores,
        prescribedRoutine: routine.map(p => ({ id: p.id, name: p.name, price: p.price, image: p.image })),
        generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      localStorage.setItem('aurelle_hair_profile', JSON.stringify(userProfile));
    } catch (e) {}

    // Populate Results
    const titleEl = document.getElementById('resultArchetypeTitle');
    const summaryEl = document.getElementById('resultArchetypeSummary');
    const routineGrid = document.getElementById('resultRoutineGrid');
    const subRoutineBtn = document.getElementById('subscribeRoutineBtn');
    const addAllRoutineBtn = document.getElementById('addAllRoutineBtn');

    if (titleEl) titleEl.textContent = archetype.name;
    if (summaryEl) summaryEl.textContent = archetype.summary;

    // Scores
    const hydEl = document.getElementById('scoreHydration');
    const cutEl = document.getElementById('scoreCuticle');
    const scaEl = document.getElementById('scoreScalp');

    if (hydEl) hydEl.style.width = `${archetype.scores.hydration}%`;
    if (cutEl) cutEl.style.width = `${archetype.scores.cuticle}%`;
    if (scaEl) scaEl.style.width = `${archetype.scores.scalp}%`;

    // Routine Cards
    if (routineGrid) {
      routineGrid.innerHTML = routine.map((prod, idx) => `
        <div class="prescribed-prod-card tilt-card">
          <div class="prescribed-step-num">Step 0${idx + 1}</div>
          <div class="prescribed-prod-img-wrap">
            <img src="${prod.image}" alt="${prod.name}">
          </div>
          <div class="prescribed-prod-info text-center">
            <span class="prescribed-cat">${prod.category}</span>
            <h5 class="prescribed-name">${prod.name}</h5>
            <span class="prescribed-price">$${prod.price}</span>
            <button class="btn btn-sm btn-outline-rose add-prescribed-single" data-prod-id="${prod.id}">
              Add to Cart
            </button>
          </div>
        </div>
      `).join('');

      if (window.initTiltCards) {
        window.initTiltCards(routineGrid);
      }
    }

    // Subscribe whole routine CTA (15% discount)
    if (subRoutineBtn) {
      subRoutineBtn.onclick = () => {
        routine.forEach(prod => {
          if (window.AurelleCart) {
            window.AurelleCart.addToCart(prod, { isSubscription: true, frequency: 'Every 45 Days' });
          }
        });
        if (window.showToast) {
          window.showToast('Full 4-Step Routine Subscribed with 15% VIP Savings!', 'success');
        }
      };
    }

    if (addAllRoutineBtn) {
      addAllRoutineBtn.onclick = () => {
        routine.forEach(prod => {
          if (window.AurelleCart) {
            window.AurelleCart.addToCart(prod, { isSubscription: false });
          }
        });
        if (window.showToast) {
          window.showToast('4-Step Routine added to your cart!', 'success');
        }
      };
    }

    // Scroll smoothly to results
    if (window.smoothScrollTo) {
      window.smoothScrollTo(resultCard, { offset: 90 });
    } else {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function retakeQuiz() {
    quizState.currentStep = 1;
    const quizCard = document.getElementById('quizCard');
    const resultCard = document.getElementById('quizResultCard');

    if (quizCard && resultCard) {
      resultCard.style.display = 'none';
      quizCard.style.display = 'block';
      renderCurrentStep();
      if (window.smoothScrollTo) {
        window.smoothScrollTo(quizCard, { offset: 90 });
      } else {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function openPorosityModal() {
    const modal = document.getElementById('porosityTestModal');
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closePorosityModal() {
    const modal = document.getElementById('porosityTestModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  // Setup Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    renderCurrentStep();

    const container = document.getElementById('quizStepContainer');
    if (container) {
      container.addEventListener('click', (e) => {
        const card = e.target.closest('.quiz-option-card');
        if (card) {
          handleOptionClick(card);
        }
      });
    }

    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextStep);

    const prevBtn = document.getElementById('quizPrevBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevStep);

    const retakeBtn = document.getElementById('retakeQuizBtn');
    if (retakeBtn) retakeBtn.addEventListener('click', retakeQuiz);

    const closePorosityBtn = document.getElementById('closePorosityModalBtn');
    if (closePorosityBtn) closePorosityBtn.addEventListener('click', closePorosityModal);

    // Share / Print Result
    const shareBtn = document.getElementById('shareResultBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `Aurelle Hair Lab Diagnostic: My profile is ${computeArchetype().name}. Know your hair. Treat it right.`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            if (window.showToast) window.showToast('Hair Profile Summary copied to clipboard!', 'info');
          });
        }
      });
    }

    // Add individual prescribed product
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-prescribed-single');
      if (btn) {
        const prodId = btn.dataset.prodId;
        const prod = (window.AURELLE_PRODUCTS || []).find(p => p.id === prodId);
        if (prod && window.AurelleCart) {
          window.AurelleCart.addToCart(prod);
        }
      }
    });
  });

  window.AurelleQuiz = {
    retakeQuiz,
    getAnswers: () => quizState.answers
  };
})();
