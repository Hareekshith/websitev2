/**
 * ACM STUDENT CHAPTER - VIT CHENNAI
 * Core Interactive Scripts: Smart Navbar, Mobile Navigation, Lightbox, Modals, Category Filters
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. SMART FLOATING NAVBAR LOGIC
     ========================================================================== */
  (function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 20;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Ignore rubber banding on mobile
          if (currentScrollY < 0) {
            ticking = false;
            return;
          }

          if (currentScrollY <= scrollThreshold) {
            navbar.classList.remove('navbar-hidden', 'navbar-scrolled');
          } else {
            navbar.classList.add('navbar-scrolled');
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down
              navbar.classList.add('navbar-hidden');
            } else if (currentScrollY < lastScrollY) {
              // Scrolling up
              navbar.classList.remove('navbar-hidden');
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Mobile Hamburger Toggle
    let toggleBtn = navbar.querySelector('.navbar-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'navbar-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      navbar.appendChild(toggleBtn);
    }

    const menu = navbar.querySelector('.navbar-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('active');
        toggleBtn.classList.toggle('open', isOpen);
        toggleBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (menu.classList.contains('active') && !navbar.contains(e.target)) {
          menu.classList.remove('active');
          toggleBtn.classList.remove('open');
          toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
          toggleBtn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('menu-open');
        }
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          menu.classList.remove('active');
          toggleBtn.classList.remove('open');
          toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
          toggleBtn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('menu-open');
        });
      });
    }

    // Active Route Highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  })();

  /* ==========================================================================
     2. LIGHTBOX PREVIEW MODAL
     ========================================================================== */
  (function initLightbox() {
    let lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-dialog">
          <button class="lightbox-close" aria-label="Close Preview">&times;</button>
          <img class="lightbox-content" src="" alt="Enlarged Visual Preview">
          <div class="lightbox-caption"></div>
        </div>
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');

    const openLightbox = (src, alt) => {
      if (!src) return;
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'Preview';
      if (lightboxCaption) {
        lightboxCaption.textContent = alt || '';
        lightboxCaption.style.display = alt ? 'block' : 'none';
      }
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImg.src = '';
        }
      }, 300);
    };

    document.addEventListener('click', (e) => {
      const target = e.target.closest(
        '.bc-gallery-item img, .gallery-image-wrapper img, .event-row-img, .lightbox-trigger, .bc-gallery-cert img'
      );
      if (target) {
        e.preventDefault();
        openLightbox(target.src, target.alt || target.getAttribute('data-caption'));
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  })();

  /* ==========================================================================
     3. EVENT CATEGORY FILTERING (FOR EVENTS PAGE)
     ========================================================================== */
  (function initEventFilters() {
    const filterContainer = document.querySelector('.event-filter-tabs');
    if (!filterContainer) return;

    const filterBtns = filterContainer.querySelectorAll('.filter-tab-btn');
    const eventCards = document.querySelectorAll('.gallery-event-card, .event-card-item');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');

        eventCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category') || 'all';
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  })();

  /* ==========================================================================
     4. LINKEDIN EMBED FALLBACK HANDLER
     ========================================================================== */
  (function initLinkedInEmbeds() {
    const embedFrames = document.querySelectorAll('.linkedin-embed-frame');
    if (!embedFrames.length) return;

    embedFrames.forEach((frame) => {
      const iframe = frame.querySelector('iframe');
      const fallback = frame.querySelector('.linkedin-embed-fallback');
      if (!iframe || !fallback) return;

      iframe.addEventListener('error', () => {
        iframe.style.display = 'none';
        fallback.hidden = false;
      });
    });
  })();

  /* ==========================================================================
     5. SMOOTH ANCHOR SCROLL
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();
