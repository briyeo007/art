// ===== Mobile nav toggle =====
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

// ===== Active nav link =====
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

// ===== Works filter =====
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".works-grid .gallery-item");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.filter;

    galleryItems.forEach((item) => {
      const match = category === "all" || item.dataset.category === category;
      item.classList.toggle("hidden", !match);
    });
  });
});

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");

if (lightbox) {
  const lightboxImg = lightbox.querySelector("img");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxMeta = lightbox.querySelector(".lightbox-meta");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img) return;

      const title = item.querySelector("h3")?.textContent || "";
      const meta = item.querySelector("span")?.textContent || "";

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxTitle.textContent = title;
      lightboxMeta.textContent = meta;
      lightbox.classList.add("open");
    });
  });

  const closeLightbox = () => lightbox.classList.remove("open");

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
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
  window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 8);
  });
}

// ===== Scroll reveal =====
const revealTargets = document.querySelectorAll(
  ".hero, .section-title, .gallery-item, .works-header, .filter-bar, .about-portrait, .about-text"
);

if ("IntersectionObserver" in window && revealTargets.length) {
  revealTargets.forEach((el) => el.classList.add("reveal-init"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}
