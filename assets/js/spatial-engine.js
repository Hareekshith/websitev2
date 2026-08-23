/**
 * ACM VIT CHENNAI - ULTRA-PERFORMANCE AMBIENT & MOTION ENGINE
 * Engineered for buttery-smooth 60/120fps on all devices (mid-end laptops, desktops & mobile).
 * Features:
 * - Lightweight canvas ambient particles with Page Visibility API auto-pause
 * - High-efficiency IntersectionObserver scroll reveals (zero CPU/GPU cost when idle)
 * - Hardware-accelerated 3D tilt & specular shimmer with pointer throttling
 * - Eased viewport number counters
 */

(function () {
  'use strict';

  // Check reduced motion & touch preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  /* ==========================================================================
     1. ULTRA-LIGHTWEIGHT AMBIENT CANVAS (GPU-FRIENDLY)
     ========================================================================== */
  class AmbientCanvasCore {
    constructor() {
      if (prefersReducedMotion) return;

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'ambient-canvas-core';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '0.7';
      document.body.prepend(this.canvas);

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;

      this.particles = [];
      // Smart particle count: 32 on desktop, 14 on mobile
      this.numParticles = window.innerWidth < 768 ? 14 : 32;
      this.width = 0;
      this.height = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.isRunning = true;
      this.rafId = null;

      this.init();
    }

    init() {
      this.resize();
      
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 150);
      }, { passive: true });

      // Generate optimized particle pool
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.5 + 0.15,
          isGold: Math.random() > 0.65
        });
      }

      // Pause when tab is not active to save battery and GPU cycles
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isRunning = false;
          if (this.rafId) cancelAnimationFrame(this.rafId);
        } else {
          this.isRunning = true;
          this.render();
        }
      });

      this.render();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
    }

    render() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      const w = this.width;
      const h = this.height;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.isGold
          ? `rgba(245, 158, 11, ${p.alpha})`
          : `rgba(56, 189, 248, ${p.alpha})`;
        this.ctx.fill();
      }

      this.rafId = requestAnimationFrame(() => this.render());
    }
  }

  /* ==========================================================================
     2. HARDWARE-ACCELERATED SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  class MotionOrchestrator {
    constructor() {
      this.counters = Array.from(document.querySelectorAll('[data-target]'));
      this.countersTriggered = new Set();
      this.init();
    }

    init() {
      this.initScrollReveals();
      this.initCounters();
      this.initTiltCards();
      this.initKineticTypography();
    }

    initScrollReveals() {
      // Find all key sections, cards, grids, and headings to animate smoothly
      const elementsToReveal = document.querySelectorAll(
        '.spatial-scene, .bento-card, .bc-chip, .impact-kpi-card, .partner-card, .testimonial-card, .event-row, .bc-gallery-item, .reach-pill, .award-badge-wrap, .bc-left-col, .bc-right-col, .membership-banner-inner, .split-content, .split-image'
      );

      if (!('IntersectionObserver' in window)) {
        elementsToReveal.forEach((el) => el.classList.add('in-view'));
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Unobserve once revealed for optimal performance
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      elementsToReveal.forEach((el) => {
        el.classList.add('reveal-item');
        observer.observe(el);
      });
    }

    initCounters() {
      if (!this.counters.length) return;

      if (!('IntersectionObserver' in window)) {
        this.counters.forEach((counter) => this.animateCounter(counter));
        return;
      }

      const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            if (!this.countersTriggered.has(counter)) {
              this.countersTriggered.add(counter);
              this.animateCounter(counter);
              obs.unobserve(counter);
            }
          }
        });
      }, {
        threshold: 0.2
      });

      this.counters.forEach((counter) => counterObserver.observe(counter));
    }

    animateCounter(counter) {
      const targetStr = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const target = parseFloat(targetStr);
      if (isNaN(target)) return;

      const isDecimal = targetStr.includes('.');
      const duration = 1400; // ms
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        // Quartic ease out curve for a fluid feel
        const easeOut = 1 - Math.pow(1 - p, 3);
        const current = target * easeOut;

        if (isDecimal) {
          counter.textContent = current.toFixed(1) + (p >= 1 ? suffix : '');
        } else {
          counter.textContent = Math.floor(current).toLocaleString() + (p >= 1 ? suffix : '');
        }

        if (p < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = (isDecimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
        }
      };

      requestAnimationFrame(update);
    }

    initKineticTypography() {
      const sections = document.querySelectorAll('.kinetic-text-section');
      if (!sections.length || prefersReducedMotion) return;

      let ticking = false;

      const updateDivergence = () => {
        const winHeight = window.innerHeight;
        const maxShift = window.innerWidth < 768 ? 35 : 70;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();

          if (rect.bottom > 0 && rect.top < winHeight) {
            const progress = 1 - (rect.bottom / (winHeight + rect.height));
            const offset = (progress - 0.5) * 2; // -1 to 1
            const factor = Math.min(Math.max(Math.abs(offset), 0), 1);

            const upFar = section.querySelector('.diverge-up-far');
            const upNear = section.querySelector('.diverge-up-near');
            const downNear = section.querySelector('.diverge-down-near');
            const downFar = section.querySelector('.diverge-down-far');

            if (upFar) upFar.style.transform = `translate3d(0, ${-factor * maxShift * 1.5}px, 0)`;
            if (upNear) upNear.style.transform = `translate3d(0, ${-factor * maxShift * 0.75}px, 0)`;
            if (downNear) downNear.style.transform = `translate3d(0, ${factor * maxShift * 0.75}px, 0)`;
            if (downFar) downFar.style.transform = `translate3d(0, ${factor * maxShift * 1.5}px, 0)`;
          }
        });

        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateDivergence);
          ticking = true;
        }
      }, { passive: true });

      updateDivergence();
    }

    initTiltCards() {
      if (prefersReducedMotion || isTouchDevice) return;

      const cards = document.querySelectorAll(
        '.bento-card, .bc-chip, .partner-card, .testimonial-card, .impact-kpi-card, .bc-gallery-item, .reach-pill, .team-card, .contact-card, .bn-card, .timeline-card, .card, .whocard, .gallery-event-card'
      );

      cards.forEach((card) => {
        card.classList.add('spatial-tilt-card');
        let isHovered = false;
        let ticking = false;

        card.addEventListener('mouseenter', () => {
          isHovered = true;
        });

        card.addEventListener('mousemove', (e) => {
          if (!isHovered || ticking) return;

          ticking = true;
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Smooth 3D tilt angles
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
            card.style.setProperty('--mouse-x', `${((x / rect.width) * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${((y / rect.height) * 100).toFixed(1)}%`);
            ticking = false;
          });
        });

        card.addEventListener('mouseleave', () => {
          isHovered = false;
          card.style.transform = '';
          card.style.setProperty('--mouse-x', '50%');
          card.style.setProperty('--mouse-y', '50%');
        });
      });
    }
  }

  /* ==========================================================================
     3. INITIALIZATION ON DOM READY
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new AmbientCanvasCore();
      new MotionOrchestrator();
    });
  } else {
    new AmbientCanvasCore();
    new MotionOrchestrator();
  }
})();
