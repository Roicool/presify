/**
 * ftabs — feature tabs driving a product screen (data-rc="ftabs"; tabs [data-rc-ftab] with aria-controls → panel id).
 * Optional auto-advance: data-rc-auto (paused on hover, stopped on click, off with reduced motion).
 * Ported from AD v4 mock (presify/design/ad/v4/v4.js). Without JS the first panel shows (CSS).
 */
export default function ftabs() {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  [].slice.call(document.querySelectorAll('[data-rc="ftabs"]')).forEach(function (root) {
    var tabs = [].slice.call(root.querySelectorAll('[data-rc-ftab]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    if (!tabs.length) return;
    var cur = 0, timer = null, auto = root.hasAttribute('data-rc-auto') && !reduce.matches;
    var dur = (parseFloat(getComputedStyle(root).getPropertyValue('--dur--ft')) || 7) * 1000;
    function show(i, user) {
      cur = i;
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) { panels[j].classList.toggle('is-on', on); panels[j].hidden = false; panels[j].setAttribute('aria-hidden', on ? 'false' : 'true'); }
      });
      if (user) stop();
      else if (auto) { var p = tabs[i].querySelector('.ft-prog i'); if (p) { p.style.animation = 'none'; p.offsetWidth; p.style.animation = ''; } }
    }
    function stop() { auto = false; root.classList.remove('is-auto'); clearInterval(timer); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null, v = root.getAttribute('aria-orientation') !== 'horizontal';
        if (k === (v ? 'ArrowDown' : 'ArrowRight')) n = (i + 1) % tabs.length;
        if (k === (v ? 'ArrowUp' : 'ArrowLeft')) n = (i - 1 + tabs.length) % tabs.length;
        if (k === 'Home') n = 0; if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); show(n, true); tabs[n].focus(); }
      });
    });
    if (auto) {
      root.classList.add('is-auto');
      var paused = false;
      root.addEventListener('mouseenter', function () { paused = true; root.classList.add('is-paused'); });
      root.addEventListener('mouseleave', function () { paused = false; root.classList.remove('is-paused'); });
      timer = setInterval(function () { if (!paused && !document.hidden) show((cur + 1) % tabs.length); }, dur);
    }
    show(0);
    window.RC = window.RC || {}; (RC.ftabs = RC.ftabs || []).push({ el: root, show: show });
  });
}
