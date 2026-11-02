/**
 * ACM STUDENT CHAPTER - VIT CHENNAI
 * Core Interactive Scripts: Smart Navbar, Mobile Navigation, Lightbox, Modals, Category Filters
 */

(function () {
  'use strict';

  /* ==========================================================================
     0. THEME PALETTE MANAGER & FLOATING SWITCHER
     ========================================================================== */
  const THEMES = [
    {
      id: 'midnight-gold',
      name: 'Midnight Gold',
      desc: 'Obsidian Noir & Amber Gold (Signature)',
      primary: '#f59e0b',
      bg: '#09090b',
      card: '#16161a'
    },
    {
      id: 'cyber-sapphire',
      name: 'Cyber Sapphire',
      desc: 'Electric Cyan & Deep Tech Blue',
      primary: '#00d4ff',
      bg: '#060913',
      card: '#111a30'
    },
    {
      id: 'emerald-matrix',
      name: 'Emerald Matrix',
      desc: 'Hacker Mint & Forest Obsidian',
      primary: '#10b981',
      bg: '#050d09',
      card: '#102419'
    },
    {
      id: 'royal-amethyst',
      name: 'Royal Amethyst',
      desc: 'Cosmic Violet & Luxury Purple',
      primary: '#c084fc',
      bg: '#0a0614',
      card: '#1c1333'
    }
  ];

  function getActiveTheme() {
    try {
      return localStorage.getItem('acm_theme') || 'midnight-gold';
    } catch (e) {
      return 'midnight-gold';
    }
  }

  function setTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('acm_theme', themeId);
    } catch (e) {}

    const label = document.querySelector('.theme-switcher-current-name');
    const dot = document.querySelector('.theme-indicator-dot');
    const matched = THEMES.find((t) => t.id === themeId);
    if (label && matched) label.textContent = matched.name;
    if (dot && matched) {
      dot.style.background = matched.primary;
      dot.style.boxShadow = `0 0 8px ${matched.primary}`;
    }

    document.querySelectorAll('.theme-option-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-id') === themeId);
    });
  }

  // Set theme immediately
  setTheme(getActiveTheme());

  (function initThemeSwitcher() {
    function setupWidget() {
      if (document.querySelector('.theme-switcher-wrapper')) return;

      const activeThemeId = getActiveTheme();
      const current = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

      const wrapper = document.createElement('div');
      wrapper.className = 'theme-switcher-wrapper';
      wrapper.innerHTML = `
        <button class="theme-switcher-trigger" type="button" aria-label="Toggle Color Palette Menu" aria-expanded="false">
          <span class="theme-indicator-dot" style="background:${current.primary}; box-shadow:0 0 8px ${current.primary}"></span>
          <span>Palette:</span>
          <span class="theme-switcher-current-name">${current.name}</span>
          <i class="fas fa-palette" style="font-size:0.75rem; opacity:0.8; margin-left:2px;"></i>
        </button>
        <div class="theme-switcher-modal" role="dialog" aria-label="Theme Selection Menu">
          <div class="theme-switcher-header">
            <span class="theme-switcher-title"><i class="fas fa-palette"></i> Color Palettes</span>
            <button class="theme-switcher-close" type="button" aria-label="Close Palette Menu">&times;</button>
          </div>
          <div class="theme-options-grid">
            ${THEMES.map((t) => `
              <button class="theme-option-btn ${t.id === activeThemeId ? 'active' : ''}" type="button" data-theme-id="${t.id}">
                <div class="theme-option-meta">
                  <span class="theme-option-name">${t.name}</span>
                  <span class="theme-option-desc">${t.desc}</span>
                </div>
                <div class="theme-option-preview">
                  <span class="theme-preview-dot" style="background:${t.bg}" title="Background"></span>
                  <span class="theme-preview-dot" style="background:${t.card}" title="Surface"></span>
                  <span class="theme-preview-dot" style="background:${t.primary}; box-shadow:0 0 6px ${t.primary}" title="Accent"></span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      document.body.appendChild(wrapper);

      const trigger = wrapper.querySelector('.theme-switcher-trigger');
      const modal = wrapper.querySelector('.theme-switcher-modal');
      const closeBtn = wrapper.querySelector('.theme-switcher-close');

      const toggleModal = (show) => {
        const isActive = typeof show === 'boolean' ? show : !modal.classList.contains('active');
        modal.classList.toggle('active', isActive);
        trigger.setAttribute('aria-expanded', String(isActive));
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal();
      });

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModal(false);
      });

      wrapper.querySelectorAll('.theme-option-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetId = btn.getAttribute('data-theme-id');
          setTheme(targetId);
          setTimeout(() => toggleModal(false), 180);
        });
      });

      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          toggleModal(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          toggleModal(false);
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupWidget);
    } else {
      setupWidget();
    }
  })();

  /* ==========================================================================
     1. SMART FLOATING NAVBAR LOGIC
     ========================================================================== */
  (function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const menu = navbar.querySelector('.navbar-menu');
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

          // Don't hide navbar when mobile menu is open
          if (menu && menu.classList.contains('active')) {
            navbar.classList.remove('navbar-hidden');
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

    if (toggleBtn && menu) {
      const closeMenu = () => {
        if (!menu.classList.contains('active')) return;
        menu.classList.remove('active');
        toggleBtn.classList.remove('open');
        navbar.classList.remove('menu-open');
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      };

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('active');
        toggleBtn.classList.toggle('open', isOpen);
        navbar.classList.toggle('menu-open', isOpen);
        toggleBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
          closeMenu();
        }
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeMenu();
        }
      });
    }

    // Active Route Highlight
    if (menu) {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      menu.querySelectorAll('a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
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
