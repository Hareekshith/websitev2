/**
 * ACM VIT CHENNAI - 3D SPATIAL ENGINE
 * Inspired by Samsung One UI spatial motion language.
 * Scroll -> Camera -> Depth -> Objects -> Transformation -> Transition -> Next Scene
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. WEBGL / CANVAS 3D HOLOGRAPHIC AMBIENT CORE
     ========================================================================== */
  class SpatialCanvas3D {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'spatial-canvas-3d';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '0.85';
      document.body.prepend(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.numParticles = window.innerWidth < 768 ? 45 : 90;
      this.width = 0;
      this.height = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.time = 0;
      this.scrollProgress = 0;
      this.targetScrollProgress = 0;
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Generate 3D spatial particles
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 1500,
          size: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.4 + 0.2,
          hue: Math.random() > 0.6 ? 45 : (Math.random() > 0.5 ? 200 : 220), // Gold and Cyan/Navy tones
        });
      }

      window.addEventListener('mousemove', (e) => {
        this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      this.animate();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
    }

    updateScroll(progress) {
      this.targetScrollProgress = progress;
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Smooth interpolation
      this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;
      this.time += 0.015;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw subtle spatial radial illumination
      const gradient = this.ctx.createRadialGradient(
        this.centerX + this.mouseX * 120,
        this.centerY + this.mouseY * 80,
        50,
        this.centerX,
        this.centerY,
        Math.max(this.width, this.height) * 0.7
      );
      gradient.addColorStop(0, 'rgba(15, 32, 67, 0.45)');
      gradient.addColorStop(0.5, 'rgba(8, 18, 38, 0.2)');
      gradient.addColorStop(1, 'rgba(2, 6, 18, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw 3D Gyroscope / Holographic Orbital Core (Hero Scene)
      if (this.scrollProgress < 0.35) {
        this.drawHeroHologram();
      }

      // Draw 3D Depth Particles
      const fov = 400;
      for (let p of this.particles) {
        // Move particle towards camera based on time and scroll
        p.z -= p.speed * (1 + this.scrollProgress * 2.5);
        if (p.z <= 0) {
          p.z = 1500;
          p.x = (Math.random() - 0.5) * 2000;
          p.y = (Math.random() - 0.5) * 2000;
        }

        const scale = fov / (fov + p.z);
        const px = this.centerX + (p.x + this.mouseX * 150) * scale;
        const py = this.centerY + (p.y + this.mouseY * 100 - this.scrollProgress * 400) * scale;

        if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
          const depthAlpha = p.alpha * scale * (1 - this.scrollProgress * 0.6);
          this.ctx.beginPath();
          this.ctx.arc(px, py, p.size * scale * 1.5, 0, Math.PI * 2);
          this.ctx.fillStyle = p.hue === 45 
            ? `rgba(212, 175, 55, ${depthAlpha})`
            : `rgba(56, 189, 248, ${depthAlpha * 0.8})`;
          this.ctx.fill();
        }
      }
    }

    drawHeroHologram() {
      const heroOpacity = Math.max(0, 1 - this.scrollProgress * 3.2);
      if (heroOpacity <= 0.01) return;

      const fov = 500;
      const camZ = this.scrollProgress * 600;
      const rotY = this.time * 0.5 + this.mouseX * 0.8;
      const rotX = Math.sin(this.time * 0.3) * 0.3 + this.mouseY * 0.6;
      const coreZ = 300 - camZ;

      if (coreZ <= -fov) return;

      const scale = fov / (fov + coreZ);
      const hX = this.centerX;
      const hY = this.centerY - this.scrollProgress * 150;

      this.ctx.save();
      this.ctx.translate(hX, hY);
      this.ctx.scale(scale, scale);
      this.ctx.globalAlpha = heroOpacity;

      // Outer Ring
      this.draw3DRing(140, rotX, rotY, 'rgba(212, 175, 55, 0.45)', 1.5);
      // Middle Ring
      this.draw3DRing(110, rotY * 1.2, rotX * 1.5, 'rgba(56, 189, 248, 0.4)', 1.2);
      // Inner Ring
      this.draw3DRing(80, -rotX * 1.4, rotY * 0.8, 'rgba(212, 175, 55, 0.6)', 1.8);

      // Central Luminous Node
      const nodeGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 45);
      nodeGrad.addColorStop(0, 'rgba(212, 175, 55, 0.85)');
      nodeGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
      nodeGrad.addColorStop(1, 'rgba(10, 25, 47, 0)');
      this.ctx.fillStyle = nodeGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    draw3DRing(radius, pitch, yaw, color, lineWidth) {
      const segments = 48;
      this.ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        let x = Math.cos(theta) * radius;
        let y = Math.sin(theta) * radius;
        let z = 0;

        // Rotate X
        let y1 = y * Math.cos(pitch) - z * Math.sin(pitch);
        let z1 = y * Math.sin(pitch) + z * Math.cos(pitch);

        // Rotate Y
        let x2 = x * Math.cos(yaw) + z1 * Math.sin(yaw);
        let z2 = -x * Math.sin(yaw) + z1 * Math.cos(yaw);

        const pScale = 400 / (400 + z2);
        const px = x2 * pScale;
        const py = y1 * pScale;

        if (i === 0) {
          this.ctx.moveTo(px, py);
        } else {
          this.ctx.lineTo(px, py);
        }
      }
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  /* ==========================================================================
     2. LERPED 3D SPATIAL SCENE ORCHESTRATOR
     ========================================================================== */
  class SpatialSceneOrchestrator {
    constructor(canvas3D) {
      this.canvas3D = canvas3D;
      this.scrollY = window.scrollY;
      this.targetScrollY = window.scrollY;
      this.docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scenes = [];
      this.tiltCards = [];
      this.counters = [];
      this.countersTriggered = new Set();

      this.init();
    }

    init() {
      this.cacheElements();
      window.addEventListener('resize', () => {
        this.docHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.cacheElements();
      });

      // Smooth scroll event listener
      window.addEventListener('scroll', () => {
        this.targetScrollY = window.scrollY;
      }, { passive: true });

      // Init 3D Tilt Cards
      this.initTiltCards();

      // Init Dynamic Lighting Cursor Spotlight
      this.initCursorSpotlight();

      // Start animation loop
      this.render();
    }

    cacheElements() {
      this.scenes = Array.from(document.querySelectorAll('.spatial-scene, section.reveal, .hero, .split-section')).map((el) => {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const height = el.offsetHeight;
        return {
          el,
          top,
          height,
          center: top + height / 2,
          depthBg: el.querySelector('.depth-bg, .hero-background, .split-image'),
          depthMid: el.querySelector('.depth-mid, .bento-grid, .bc-container, .impact-main-grid'),
          depthFg: el.querySelector('.depth-fg, .hero-content, .bc-left-col, .split-content, .section-header'),
          badge: el.querySelector('.award-badge-wrap, .hero-pretitle, .bn-badge'),
        };
      });

      // Cache number counter elements
      this.counters = Array.from(document.querySelectorAll('[data-target]'));
    }

    initTiltCards() {
      this.tiltCards = Array.from(document.querySelectorAll(
        '.bento-card, .bc-chip, .partner-card, .testimonial-card, .impact-kpi-card, .event-row, .bc-gallery-item, .team-card, .reach-pill'
      ));

      this.tiltCards.forEach((card) => {
        card.classList.add('spatial-tilt-card');
        
        card.addEventListener('mousemove', (e) => {
          if (prefersReducedMotion) return;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -7;
          const rotateY = ((x - centerX) / centerX) * 7;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
          card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
          card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.setProperty('--mouse-x', '50%');
          card.style.setProperty('--mouse-y', '50%');
        });
      });
    }

    initCursorSpotlight() {
      const spotlight = document.createElement('div');
      spotlight.className = 'spatial-spotlight';
      spotlight.style.position = 'fixed';
      spotlight.style.top = '0';
      spotlight.style.left = '0';
      spotlight.style.width = '100vw';
      spotlight.style.height = '100vh';
      spotlight.style.pointerEvents = 'none';
      spotlight.style.zIndex = '1';
      spotlight.style.opacity = '0.6';
      spotlight.style.background = 'radial-gradient(600px circle at var(--cursor-x, 50vw) var(--cursor-y, 50vh), rgba(56, 189, 248, 0.06), transparent 80%)';
      document.body.prepend(spotlight);

      window.addEventListener('mousemove', (e) => {
        spotlight.style.setProperty('--cursor-x', `${e.clientX}px`);
        spotlight.style.setProperty('--cursor-y', `${e.clientY}px`);
      });
    }

    render() {
      requestAnimationFrame(() => this.render());

      // Smooth scroll lerp
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;
      const progress = this.docHeight > 0 ? this.scrollY / this.docHeight : 0;

      if (this.canvas3D) {
        this.canvas3D.updateScroll(progress);
      }

      if (prefersReducedMotion) return;

      const viewportCenter = this.scrollY + window.innerHeight / 2;
      const viewportHeight = window.innerHeight;

      // Orchestrate 3D Scene Handover
      for (let scene of this.scenes) {
        const dist = (scene.center - viewportCenter) / viewportHeight; // -1 to 1 around view

        // In view range
        if (Math.abs(dist) < 1.4) {
          // Camera push & Z-depth transformations
          const zProgress = Math.max(-1, Math.min(1, dist));
          
          if (scene.depthBg) {
            const bgZ = zProgress * -60;
            const bgScale = 1 + Math.abs(zProgress) * 0.05;
            scene.depthBg.style.transform = `translate3d(0, ${zProgress * 40}px, ${bgZ}px) scale(${bgScale})`;
          }

          if (scene.depthMid) {
            const midZ = zProgress * -30;
            const rotX = zProgress * 4;
            scene.depthMid.style.transform = `perspective(1200px) translate3d(0, ${zProgress * 20}px, ${midZ}px) rotateX(${rotX}deg)`;
          }

          if (scene.depthFg) {
            const fgZ = zProgress * 20;
            const fgOpacity = 1 - Math.pow(Math.abs(zProgress) * 0.9, 2);
            scene.depthFg.style.transform = `translate3d(0, ${zProgress * -15}px, ${fgZ}px)`;
            scene.depthFg.style.opacity = Math.max(0.2, Math.min(1, fgOpacity));
          }

          if (scene.badge) {
            const badgeRot = Math.sin(this.scrollY * 0.005) * 8;
            scene.badge.style.transform = `rotate(${badgeRot}deg) translateZ(25px)`;
          }
        }
      }

      // Check Counters
      this.checkCounters();
    }

    checkCounters() {
      for (let counter of this.counters) {
        if (this.countersTriggered.has(counter)) continue;
        const rect = counter.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
          this.countersTriggered.add(counter);
          this.animateCounter(counter);
        }
      }
    }

    animateCounter(counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      const duration = 1800; // ms
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        // Samsung One UI easing curve
        const easeOut = 1 - Math.pow(1 - p, 4);
        const current = Math.floor(target * easeOut);
        counter.textContent = current + (p >= 1 ? suffix : '');

        if (p < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target + suffix;
        }
      };

      requestAnimationFrame(update);
    }
  }

  /* ==========================================================================
     3. INITIALIZATION ON DOM READY
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    const canvas3D = new SpatialCanvas3D();
    window.spatialSceneOrchestrator = new SpatialSceneOrchestrator(canvas3D);
    console.log('✨ ACM VIT Chennai 3D Spatial Engine Active.');
  });
})();
