/* ============================================================
   TEKTON INDIA — main.js
   Mobile nav · Scroll effects · Smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile nav toggle ── */
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileNav  = document.querySelector('.nav-mobile');
  const body       = document.body;

  function openNav() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    body.classList.add('nav-open');
  }

  function closeNav() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    body.classList.remove('nav-open');
  }

  function toggleNav() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', toggleNav);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Close when a mobile link is tapped
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    // Close when clicking outside on wide viewports
    document.addEventListener('click', (e) => {
      const nav = document.querySelector('.site-nav');
      if (nav && !nav.contains(e.target) && !mobileNav.contains(e.target)) {
        closeNav();
      }
    });
  }

  /* ── Nav scroll shadow ── */
  const siteNav = document.querySelector('.site-nav');

  function onScroll() {
    if (!siteNav) return;
    if (window.scrollY > 20) {
      siteNav.classList.add('scrolled');
    } else {
      siteNav.classList.remove('scrolled');
    }
    toggleScrollTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active nav link ── */
  function setActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile-links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  setActiveLink();

  /* ── Scroll-to-top button ── */
  const scrollTopBtn = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Intersection-based reveal (fade-up) ── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ── Smooth scroll for in-page anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || '68', 10);
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Run initial scroll check ── */
  onScroll();
})();
