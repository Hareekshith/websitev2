/**
 * ACM VIT CHENNAI — MOTION ENGINE v2
 * Performance-first scroll reveals, counters, kinetic text, subtle tilt.
 * Canvas particles removed for cleaner performance.
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  /* ==========================================================================
     1. SCROLL REVEAL (IntersectionObserver)
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
      const elementsToReveal = document.querySelectorAll(
        '.spatial-scene, .bento-card, .bc-chip, .impact-kpi-card, .partner-card, .testimonial-card, .event-row, .bc-gallery-item, .reach-pill, .award-badge-wrap, .bc-left-col, .bc-right-col, .membership-banner-inner, .split-content, .split-image, .stat-item, .team-card, .contact-card, .timeline-card, .timeline-entry, .journey-step, .bn-card, .bn-newsletter-card, .gallery-event-card'
      );

      if (!('IntersectionObserver' in window)) {
        elementsToReveal.forEach((el) => el.classList.add('in-view'));
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
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
      const duration = 1200;
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
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
        const maxShift = window.innerWidth < 768 ? 25 : 50;

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();

          if (rect.bottom > 0 && rect.top < winHeight) {
            const progress = 1 - (rect.bottom / (winHeight + rect.height));
            const offset = (progress - 0.5) * 2;
            const factor = Math.min(Math.max(Math.abs(offset), 0), 1);

            const upFar = section.querySelector('.diverge-up-far');
            const upNear = section.querySelector('.diverge-up-near');
            const downNear = section.querySelector('.diverge-down-near');
            const downFar = section.querySelector('.diverge-down-far');

            if (upFar) upFar.style.transform = `translate3d(0, ${-factor * maxShift * 1.3}px, 0)`;
            if (upNear) upNear.style.transform = `translate3d(0, ${-factor * maxShift * 0.65}px, 0)`;
            if (downNear) downNear.style.transform = `translate3d(0, ${factor * maxShift * 0.65}px, 0)`;
            if (downFar) downFar.style.transform = `translate3d(0, ${factor * maxShift * 1.3}px, 0)`;
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
        '.bento-card, .bc-chip, .partner-card, .testimonial-card, .impact-kpi-card, .bc-gallery-item, .reach-pill, .team-card, .contact-card, .bn-card, .timeline-card, .card, .gallery-event-card, .stat-item'
      );

      cards.forEach((card) => {
        card.classList.add('spatial-tilt-card');
        let isHovered = false;
        let ticking = false;

        card.addEventListener('mouseenter', () => { isHovered = true; });

        card.addEventListener('mousemove', (e) => {
          if (!isHovered || ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
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
     2. INIT
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { new MotionOrchestrator(); });
  } else {
    new MotionOrchestrator();
  }
})();
