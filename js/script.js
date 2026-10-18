const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Mobile nav toggle =====
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  const setNavOpen = (open) => {
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    root.classList.toggle("no-scroll", open);
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches) setNavOpen(false);
  });
}

// ===== Active nav link =====
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

// ===== Works filter =====
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".works-grid .gallery-item");

filterButtons.forEach((btn) => {
  btn.setAttribute("aria-pressed", String(btn.classList.contains("active")));

  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });

    const category = btn.dataset.filter;

    galleryItems.forEach((item) => {
      const match = category === "all" || item.dataset.category === category;
      item.classList.toggle("hidden", !match);
      item.classList.remove("is-entering");
      if (match) {
        // restart the fade so the new selection settles in gently
        void item.offsetWidth;
        item.classList.add("is-entering");
      }
    });
  });
});

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");

if (lightbox) {
  const lightboxContent = lightbox.querySelector(".lightbox-content");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxMeta = lightbox.querySelector(".lightbox-meta");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let navItems = [];
  let currentIndex = -1;
  let lastFocused = null;

  lightboxImg.addEventListener("load", () => lightboxImg.classList.remove("is-loading"));

  const setZoom = (zoomed, clickX, clickY) => {
    if (!zoomed) {
      lightbox.classList.remove("zoomed");
      lightboxImg.style.width = "";
      return;
    }
    const rect = lightboxImg.getBoundingClientRect();
    const scale = 2;
    const relX = (clickX - rect.left) / rect.width;
    const relY = (clickY - rect.top) / rect.height;

    lightbox.classList.add("zoomed");
    lightboxImg.style.width = `${Math.round(rect.width * scale)}px`;

    // keep the clicked point under the cursor
    lightboxContent.scrollLeft = relX * lightboxImg.offsetWidth - window.innerWidth / 2;
    lightboxContent.scrollTop = relY * lightboxImg.offsetHeight - window.innerHeight / 2;
  };

  const showItem = (item) => {
    const img = item.querySelector("img");
    if (!img) return;

    setZoom(false);
    if (lightboxImg.getAttribute("src") !== img.getAttribute("src")) {
      lightboxImg.classList.add("is-loading");
      lightboxImg.src = img.src;
      if (lightboxImg.complete) lightboxImg.classList.remove("is-loading");
    }
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = item.querySelector("h3")?.textContent || "";
    lightboxMeta.textContent = item.querySelector("span")?.textContent || "";

    // warm the cache for neighbours so arrow navigation feels instant
    if (navItems.length > 1) {
      [-1, 1].forEach((d) => {
        const n = navItems[(currentIndex + d + navItems.length) % navItems.length];
        const src = n?.querySelector("img")?.src;
        if (src) new Image().src = src;
      });
    }
  };

  const updateNavVisibility = () => {
    const hideNav = navItems.length < 2;
    prevBtn?.classList.toggle("is-hidden", hideNav);
    nextBtn?.classList.toggle("is-hidden", hideNav);
  };

  const openLightboxFor = (item) => {
    const img = item.querySelector("img");
    if (!img) return;

    navItems = Array.from(document.querySelectorAll(".gallery-item")).filter(
      (el) => el.querySelector("img") && !el.classList.contains("hidden")
    );
    currentIndex = navItems.indexOf(item);
    lastFocused = document.activeElement;

    showItem(item);
    updateNavVisibility();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    root.classList.add("no-scroll");
    closeBtn?.focus({ preventScroll: true });
  };

  const navigate = (direction) => {
    if (navItems.length < 2) return;
    currentIndex = (currentIndex + direction + navItems.length) % navItems.length;
    showItem(navItems[currentIndex]);
  };

  document.querySelectorAll(".gallery-item").forEach((item) => {
    if (!item.querySelector("img")) return;

    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("click", () => openLightboxFor(item));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightboxFor(item);
      }
    });
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    navigate(-1);
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    navigate(1);
  });

  lightboxImg.addEventListener("click", (e) => {
    e.stopPropagation();
    setZoom(!lightbox.classList.contains("zoomed"), e.clientX, e.clientY);
  });

  const closeLightbox = () => {
    setZoom(false);
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    root.classList.remove("no-scroll");
    lastFocused?.focus?.({ preventScroll: true });
  };

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === lightboxContent) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") {
      if (lightbox.classList.contains("zoomed")) setZoom(false);
      else closeLightbox();
    }
    if (e.key === "ArrowRight") navigate(1);
    if (e.key === "ArrowLeft") navigate(-1);

    // keep focus inside the dialog
    if (e.key === "Tab") {
      const focusables = [closeBtn, prevBtn, nextBtn].filter((b) => b && !b.classList.contains("is-hidden"));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!focusables.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // swipe left / right on touch screens
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    if (lightbox.classList.contains("zoomed") || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigate(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

// ===== Contact form (static demo submit) =====
const contactForm = document.getElementById("contact-form");
const formStatus = document.querySelector(".form-status");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "메시지가 전송되었습니다. 감사합니다!";
    contactForm.reset();
  });
}

// ===== Footer year =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Header scroll shadow =====
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ===== Scroll reveal =====
// the hero animates in with CSS so it never waits on JS (better LCP)
const revealTargets = document.querySelectorAll(
  ".section-title, .gallery-item, .works-header, .about-portrait, .about-text"
);

if (!prefersReducedMotion && "IntersectionObserver" in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => {
    // anything already on screen stays visible immediately — no flash on load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    el.classList.add("reveal-init");
    revealObserver.observe(el);
  });
}
