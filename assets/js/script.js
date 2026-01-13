// Smart Navbar Logic
(function () {
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector(".navbar");
  const scrollThreshold = 15;

  if (!navbar) {
    console.error("Navbar element not found!");
    return;
  }

  console.log("Navbar Smart Scroll Initialized");

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // Mobile bounce protection
    if (currentScrollY < 0) return;

    // Always show if at very top
    if (currentScrollY < 10) {
      navbar.classList.remove("navbar-hidden");
      lastScrollY = currentScrollY;
      return;
    }

    // Determine Direction
    if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
      // SCROLLING DOWN -> HIDE
      if (!navbar.classList.contains("navbar-hidden")) {
        navbar.classList.add("navbar-hidden");
      }
    } else if (currentScrollY < lastScrollY) {
      // SCROLLING UP -> SHOW
      if (navbar.classList.contains("navbar-hidden")) {
        navbar.classList.remove("navbar-hidden");
      }
    }

    lastScrollY = currentScrollY;
  });

  // Mobile Hamburger Injection
  const toggleBtn = document.createElement("div");
  toggleBtn.className = "navbar-toggle";
  toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  // Insert after logo, before menu (technically standard flex order handles this if justify-between)
  // Actually append to navbar.
  navbar.appendChild(toggleBtn);

  const menu = navbar.querySelector(".navbar-menu");
  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", () => {
      menu.classList.toggle("active");
      toggleBtn.innerHTML = menu.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking a link
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("active");
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
})();

// Lightbox Logic
(function () {
  // Create Lightbox DOM
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox-modal";
  lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" src="" alt="Enlarged Image">
    `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector(".lightbox-content");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  // Function to open lightbox
  const openLightbox = (src) => {
    lightboxImg.src = src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable scroll
  };

  // Function to close lightbox
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Enable scroll
  };

  // Event Delegation for Gallery Images
  document.addEventListener("click", (e) => {
    if (
      e.target.tagName === "IMG" &&
      (e.target.closest(".scrolling-gallery-item") ||
        e.target.closest(".gallery-event-card"))
    ) {
      openLightbox(e.target.src);
    }
  });

  // Close events
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
})();

// Scroll Reveal & Parallax
(function () {
  const revealEls = document.querySelectorAll(
    ".reveal, .animate-fade, .animate-scale, .animate-blur",
  );
  const hero = document.querySelector(".hero");
  const bg = document.querySelector(".hero.hero-parallax .hero-background");
  const overlay = document.querySelector(".hero.hero-parallax .hero-overlay");

  // Reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 },
  );

  revealEls.forEach((el) => observer.observe(el));

  // Parallax for hero
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    // subtle parallax only when hero exists
    if (hero && bg) {
      const offset = Math.min(60, y * 0.2);
      bg.style.transform = `translateY(${offset}px) scale(1.02)`;
    }
    if (hero && overlay) {
      const fade = Math.max(0.4, 0.9 - y * 0.001);
      overlay.style.opacity = String(fade);
    }
    lastY = y;
  });
})();

// Modal Logic for Registration
(function () {
  const openModalBtn = document.getElementById("openRegistrationModal");
  const modal = document.getElementById("registrationModal");
  const closeButton = modal.querySelector(".close-button");

  if (!openModalBtn || !modal || !closeButton) {
    console.warn("Modal elements not found. Skipping modal functionality.");
    return;
  }

  // Function to open the modal
  const openModal = () => {
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Disable body scroll
  };

  // Function to close the modal
  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = ""; // Re-enable body scroll
  };

  // Event listeners
  openModalBtn.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  // Close when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close when pressing the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
})();

// Modal Logic for Registration
(function () {
  const openModalBtn = document.getElementById("openRegistrationModal");
  const modal = document.getElementById("registrationModal");
  const closeButton = modal.querySelector(".close-button");

  if (!openModalBtn || !modal || !closeButton) {
    console.warn("Modal elements not found. Skipping modal functionality.");
    return;
  }

  // Function to open the modal
  const openModal = () => {
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Disable body scroll
  };

  // Function to close the modal
  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = ""; // Re-enable body scroll
  };

  // Event listeners
  openModalBtn.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  // Close when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Close when pressing the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
})();
