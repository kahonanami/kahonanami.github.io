(() => {
  'use strict';

  const STORAGE_THEME_KEY = 'yuyao-theme';
  const EMAIL_ADDRESS = 'azusaq@qq.com';

  let toastTimer = null;
  let copyResetTimer = null;
  let lastFocusedBeforeLightbox = null;

  /* Theme Management
     ======================================================================== */

  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function getActiveTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, persist = false) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#171b21' : '#f9f8f5');
    }
    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    }
    if (persist) {
      try {
        localStorage.setItem(STORAGE_THEME_KEY, theme);
      } catch (_) {
        // Ignore storage errors in restricted environments
      }
    }
  }

  if (themeToggleBtn) {
    applyTheme(getActiveTheme(), false);
    themeToggleBtn.addEventListener('click', () => {
      applyTheme(getActiveTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* Toast Notification
     ======================================================================== */

  const toastEl = document.getElementById('toast');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2400);
  }

  /* Copy Email Action
     ======================================================================== */

  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyLabelEl = document.getElementById('copy-email-label');

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fall back to textarea copy when clipboard API permission is unavailable
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('Copy command failed');
    return true;
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      try {
        await copyText(EMAIL_ADDRESS);
        copyEmailBtn.classList.add('is-copied');
        if (copyLabelEl) copyLabelEl.textContent = 'Copied';
        showToast('Email address copied to clipboard');

        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(() => {
          copyEmailBtn.classList.remove('is-copied');
          if (copyLabelEl) copyLabelEl.textContent = 'Copy';
        }, 2000);
      } catch (_) {
        showToast('Unable to copy automatically — please copy the address directly');
      }
    });
  }

  /* Avatar Lightbox Modal
     ======================================================================== */

  const avatarTrigger = document.getElementById('avatar-trigger');
  const lightbox = document.getElementById('avatar-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox() {
    if (!lightbox) return;
    lastFocusedBeforeLightbox = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === 'function') {
      lastFocusedBeforeLightbox.focus();
    }
  }

  if (avatarTrigger) {
    avatarTrigger.addEventListener('click', openLightbox);
  }
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });

  /* Scroll-Aware Header & Active Navigation Link
     ======================================================================== */

  const headerEl = document.getElementById('site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateHeaderScroll() {
    if (!headerEl) return;
    headerEl.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0.01 }
    );
    observedSections.forEach((section) => navObserver.observe(section));
  }
})();
