/**
 * ACM STUDENT CHAPTER - VIT CHENNAI
 * Core Interactivity, Lightbox, Modals, Dynamic Navigation & Tilt
 */

(function () {
  'use strict';

  // 1. SMART NAVBAR LOGIC
  (function initNavbar() {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 15;

    if (!navbar) return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      // Mobile bounce protection
      if (currentScrollY < 0) return;

      // Top of page
      if (currentScrollY < 15) {
        navbar.classList.remove('navbar-hidden');
        lastScrollY = currentScrollY;
        return;
      }

      // Scroll Down -> Hide, Scroll Up -> Show
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScrollY < lastScrollY) {
        navbar.classList.remove('navbar-hidden');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Mobile Hamburger Toggle
    let toggleBtn = navbar.querySelector('.navbar-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('div');
      toggleBtn.className = 'navbar-toggle';
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      navbar.appendChild(toggleBtn);
    }

    const menu = navbar.querySelector('.navbar-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        toggleBtn.innerHTML = menu.classList.contains('active')
          ? '<i class="fas fa-times"></i>'
          : '<i class="fas fa-bars"></i>';
      });

      // Close menu on link click
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          menu.classList.remove('active');
          toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
      });
    }

    // Active Route Highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  })();

  // 2. LIGHTBOX LOGIC
  (function initLightbox() {
    let lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" src="" alt="Enlarged Image">
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src) => {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const img = e.target.closest('.bc-gallery-item img, .scrolling-gallery-item img, .gallery-event-card img, .team-card img');
      if (img) {
        openLightbox(img.src);
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  })();

  // 3. REGISTRATION / ACTION MODAL LOGIC
  (function initModals() {
    const openModalBtn = document.getElementById('openRegistrationModal');
    const modal = document.getElementById('registrationModal');
    if (!openModalBtn || !modal) return;

    const closeButton = modal.querySelector('.close-button');

    const openModal = () => {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    };

    openModalBtn.addEventListener('click', openModal);
    if (closeButton) closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.style.display === 'block') closeModal();
    });
  })();

  // 4. LINKEDIN EMBED FALLBACK HANDLER
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
})();
