// ============================================================
// Interactions — cursor, magnetics, smooth scroll, accordions,
// filters, reveals, clock, menu.
// ============================================================
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  // always start at the top on reload; mid-page restores look broken
  // with the reveal animations and Lenis
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- hero line reveal ---------- */
  function markLoaded() { document.body.classList.add('loaded'); }
  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded);
    // fonts/CDN stalling shouldn't hold the headline hostage
    setTimeout(markLoaded, 1200);
  }

  /* ---------- smooth scroll (Lenis, optional) ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !reducedMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(0);
  }

  function scrollToTarget(hash) {
    var el = hash === '#top' ? document.body : document.querySelector(hash);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: hash === '#top' ? 0 : -90 });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(link.getAttribute('href'));
  });

  /* ---------- cursor ---------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && finePointer && !reducedMotion) {
    document.body.classList.add('custom-cursor');
    var cx = -100, cy = -100, tx = -100, ty = -100;

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    (function follow() {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform =
        'translate(' + (cx - cursor.offsetWidth / 2) + 'px,' + (cy - cursor.offsetHeight / 2) + 'px)';
      requestAnimationFrame(follow);
    })();

    document.addEventListener('pointerover', function (e) {
      if (e.target.closest('.work-head, .contact-mail')) {
        cursor.classList.add('big');
      } else if (e.target.closest('a, button')) {
        cursor.classList.add('mid');
      }
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('.work-head, .contact-mail')) cursor.classList.remove('big');
      if (e.target.closest('a, button')) cursor.classList.remove('mid');
    });
  }

  /* ---------- magnetic elements ---------- */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var strength = 0.3;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = 'translate(0, 0)';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('navBurger');
  var overlay = document.getElementById('menuOverlay');

  function closeMenu() {
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    burger.classList.remove('open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  if (burger && overlay) {
    burger.addEventListener('click', function () {
      var open = !overlay.classList.contains('open');
      overlay.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      overlay.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
  }

  /* ---------- clock ---------- */
  var clockEl = document.getElementById('clock');
  if (clockEl) {
    function tick() {
      clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- work accordions ---------- */
  document.querySelectorAll('.work-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var row = head.closest('.work-row');
      var open = row.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- work filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var rows = document.querySelectorAll('.work-row');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (f) {
        f.classList.remove('active');
        f.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      var cat = btn.dataset.filter;
      rows.forEach(function (row) {
        var show = cat === 'all' || row.dataset.cat === cat;
        row.classList.toggle('hidden', !show);
        if (!show) {
          row.classList.remove('open');
          var h = row.querySelector('.work-head');
          if (h) h.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- back to top / year ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', function () { scrollToTarget('#top'); });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
