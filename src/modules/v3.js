/**
 * v3 — expanding cards (data-rc="xcards"), why-row image swap (data-rc="why-media"),
 * article table of contents (data-rc="toc"), light/dark theme morph fallback (data-rc-morph),
 * nav Esc-to-close. Ported from the AD v3 mock (presify/design/ad/v3/v3.js).
 * Every block exits silently when its markup is missing; content is usable without JS.
 */
export default function v3() {
  var d = document.documentElement; d.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var desk = matchMedia('(min-width: 992px)');
  var phone = matchMedia('(max-width: 767px)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* ---- xcards: expanding cards (items 1 + 2) ---- */
  $$('[data-rc="xcards"]').forEach(function (row) {
    var cards = $$('[data-rc-xcard]', row);
    if (!cards.length) return;
    function set(card, on) {
      card.classList.toggle('is-open', on);
      var b = card.querySelector('[data-rc-xcard-toggle]');
      if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    function open(card) { cards.forEach(function (c) { set(c, c === card); }); }
    if (!row.querySelector('[data-rc-xcard].is-open')) set(cards[0], true);
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { if (fine.matches && !phone.matches) open(card); });
      card.addEventListener('focusin', function () { if (!card.classList.contains('is-open')) open(card); });
      var b = card.querySelector('[data-rc-xcard-toggle]');
      if (b) b.addEventListener('click', function () {
        if (phone.matches && card.classList.contains('is-open')) { set(card, false); return; } /* accordion may close */
        open(card);
      });
    });
    window.RC = window.RC || {}; (RC.xcards = RC.xcards || []).push({ el: row, open: open });
  });

  /* ---- why rows: image on the left follows the hovered row (item 3) ---- */
  $$('[data-rc="why-media"]').forEach(function (wrap) {
    var rows = $$('[data-rc-why-row]', wrap), media = $$('[data-rc-why-img]', wrap);
    function on(i) {
      rows.forEach(function (r, j) { r.classList.toggle('is-on', i === j); });
      media.forEach(function (m, j) { m.classList.toggle('is-on', i === j); });
    }
    if (!wrap.querySelector('[data-rc-why-row].is-on')) on(0);
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { on(i); });
      r.addEventListener('click', function () { on(i); });
    });
    window.RC = window.RC || {}; RC.why = on;
  });

  /* ---- toc: built from the article's H2s (item 5) ---- */
  $$('[data-rc="toc"]').forEach(function (nav) {
    var src = document.querySelector(nav.getAttribute('data-rc-toc-source') || 'main');
    var wrap = nav.closest('[data-rc-toc-wrap]');
    if (!src) return;
    var hs = $$('h2', src);
    if (hs.length < 2) return;                      /* wrapper stays hidden by CSS */
    var used = {};
    function slug(t) {
      var s = t.toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      var b = s, n = 2; while (used[s] || document.getElementById(s)) s = b + '-' + n++;
      used[s] = 1; return s;
    }
    var ol = document.createElement('ol'), links = [];
    hs.forEach(function (h) {
      if (!h.id) h.id = slug(h.textContent);
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent.trim();
      li.appendChild(a); ol.appendChild(li); links.push(a);
    });
    nav.appendChild(ol);
    if (wrap) wrap.classList.add('is-ready');
    var det = nav.closest('details');
    function sync() { if (det) det.open = desk.matches; }
    sync(); desk.addEventListener('change', sync);
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && det && !desk.matches) det.open = false; });
    var current = null;
    function mark(i) {
      if (current === i) return; current = i;
      links.forEach(function (a, j) { if (i === j) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
    var tick = false;
    function spy() {                                /* active = last H2 above 30% of the viewport */
      tick = false; var line = innerHeight * 0.3, idx = 0;
      hs.forEach(function (h, i) { if (h.getBoundingClientRect().top <= line) idx = i; });
      mark(idx);
    }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  });

  /* ---- theme morph fallback (item 6): only where CSS scroll-driven animations are missing ---- */
  (function () {
    var secs = $$('[data-rc-morph]');
    if (!secs.length) return;
    if (window.CSS && CSS.supports('animation-timeline: view()')) return;   /* CSS does it */
    d.classList.add('th-js');
    var dur = 600;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var lit = e.isIntersecting || e.boundingClientRect.top < 0;
        if (lit === e.target.classList.contains('is-lit')) return;
        e.target.classList.toggle('is-lit', lit);
        if (reduce.matches) return;
        e.target.classList.add('is-morphing');
        clearTimeout(e.target._t);
        e.target._t = setTimeout(function () { e.target.classList.remove('is-morphing'); }, dur);
      });
    }, { rootMargin: '0px 0px -45% 0px', threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  })();

  /* ---- nav: Esc closes an open panel (hover/focus-within do the rest) ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var item = document.activeElement && document.activeElement.closest('.mn-item');
    if (item) { var l = item.querySelector('.mn-link, .nav-link'); if (l) l.focus(); item.classList.add('is-closed'); setTimeout(function () { item.classList.remove('is-closed'); }, 50); document.activeElement.blur(); }
  });
}
