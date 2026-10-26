/**
 * Aurelle Hair Lab - Luxury 3D Tilt Engine with Glare & Depth Layers
 * Built specifically for high-end luxury beauty cards
 */
(function() {
  'use strict';

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class TiltCard {
    constructor(element, options = {}) {
      this.element = element;
      this.options = Object.assign({
        maxTilt: 12,
        perspective: 1000,
        scale: 1.02,
        speed: 400,
        glare: true,
        maxGlare: 0.35,
        depth: 25
      }, options);

      if (isTouchDevice || prefersReducedMotion) {
        this.element.classList.add('tilt-touch-fallback');
        return;
      }

      this.init();
    }

    init() {
      this.width = null;
      this.height = null;
      this.left = null;
      this.top = null;
      this.transitionTimeout = null;
      this.updateCall = null;

      this.element.style.transformStyle = 'preserve-3d';
      this.element.style.perspective = `${this.options.perspective}px`;

      if (this.options.glare) {
        this.prepareGlare();
      }

      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);

      this.element.addEventListener('mouseenter', this.onMouseEnter);
      this.element.addEventListener('mousemove', this.onMouseMove);
      this.element.addEventListener('mouseleave', this.onMouseLeave);
    }

    prepareGlare() {
      let glareEl = this.element.querySelector('.tilt-glare');
      if (!glareEl) {
        glareEl = document.createElement('div');
        glareEl.className = 'tilt-glare';
        glareEl.innerHTML = '<div class="tilt-glare-inner"></div>';
        this.element.appendChild(glareEl);
      }
      this.glareElement = glareEl.querySelector('.tilt-glare-inner');
    }

    updateDimensions() {
      const rect = this.element.getBoundingClientRect();
      this.width = this.element.offsetWidth;
      this.height = this.element.offsetHeight;
      this.left = rect.left;
      this.top = rect.top;
    }

    onMouseEnter() {
      this.updateDimensions();
      this.element.style.willChange = 'transform';
      this.setTransition();
    }

    onMouseMove(event) {
      if (this.updateCall !== null) {
        cancelAnimationFrame(this.updateCall);
      }
      this.event = event;
      this.updateCall = requestAnimationFrame(this.update.bind(this));
    }

    onMouseLeave() {
      this.setTransition();
      this.reset();
    }

    setTransition() {
      clearTimeout(this.transitionTimeout);
      this.element.style.transition = `transform ${this.options.speed}ms cubic-bezier(.03,.98,.52,.99)`;
      if (this.glareElement) {
        this.glareElement.style.transition = `opacity ${this.options.speed}ms cubic-bezier(.03,.98,.52,.99)`;
      }
      this.transitionTimeout = setTimeout(() => {
        this.element.style.transition = '';
        if (this.glareElement) this.glareElement.style.transition = '';
      }, this.options.speed);
    }

    update() {
      if (!this.width || !this.height) return;

      const x = (this.event.clientX - this.left) / this.width;
      const y = (this.event.clientY - this.top) / this.height;

      const tiltX = (this.options.maxTilt / 2 - x * this.options.maxTilt).toFixed(2);
      const tiltY = (y * this.options.maxTilt - this.options.maxTilt / 2).toFixed(2);

      this.element.style.transform = `perspective(${this.options.perspective}px) rotateX(${tiltY}deg) rotateY(${-tiltX}deg) scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})`;

      const innerElements = this.element.querySelectorAll('.tilt-depth');
      innerElements.forEach(el => {
        const depth = el.dataset.depth || this.options.depth;
        el.style.transform = `translateZ(${depth}px)`;
      });

      if (this.glareElement) {
        const angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);
        const opacity = (Math.hypot(x - 0.5, y - 0.5) * 2 * this.options.maxGlare).toFixed(2);
        this.glareElement.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
        this.glareElement.style.opacity = Math.min(this.options.maxGlare, opacity);
      }

      this.updateCall = null;
    }

    reset() {
      this.element.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      const innerElements = this.element.querySelectorAll('.tilt-depth');
      innerElements.forEach(el => {
        el.style.transform = 'translateZ(0px)';
      });
      if (this.glareElement) {
        this.glareElement.style.opacity = '0';
      }
    }

    destroy() {
      this.element.removeEventListener('mouseenter', this.onMouseEnter);
      this.element.removeEventListener('mousemove', this.onMouseMove);
      this.element.removeEventListener('mouseleave', this.onMouseLeave);
      this.element.style.transform = '';
      this.element.style.perspective = '';
    }
  }

  window.initTiltCards = function(container = document) {
    const cards = container.querySelectorAll('.tilt-card:not([data-tilt-initialized])');
    cards.forEach(card => {
      card.setAttribute('data-tilt-initialized', 'true');
      new TiltCard(card, {
        maxTilt: card.dataset.tiltMax ? parseFloat(card.dataset.tiltMax) : 10,
        scale: card.dataset.tiltScale ? parseFloat(card.dataset.tiltScale) : 1.02,
        glare: true,
        maxGlare: 0.35
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.initTiltCards();
  });
})();
