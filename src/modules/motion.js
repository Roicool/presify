/**
 * motion — scroll reveal, SVG draw-on and count-up (Presify motion spec v2).
 *
 *   data-rc-reveal          element fades/rises in once when it enters the viewport.
 *                           Children stagger with style="--i:n" (CSS uses var(--stagger)).
 *   data-rc-draw            parent of SVG paths with pathLength="1" (or a Technology diagram).
 *                           Below the fold it gets .rc-wait (undrawn), then .is-in → CSS draws it.
 *   data-rc-count           text such as "50+", "4.8", "2,947" counts up from 0 once.
 *
 * Content is never hidden without JS: only elements BELOW the fold at init get .rc-pre.
 * prefers-reduced-motion → everything shows at once, no count-up.
 */
const SEL = '[data-rc-reveal],[data-rc-draw],[data-rc-count]';

function countUp(el) {
  const final = el.textContent.trim();
  const m = final.match(/^(\D*)([\d.,]+)(.*)$/);
  if (!m) return;
  const [, pre, num, suf] = m;
  const dec = (num.split('.')[1] || '').length;
  const sep = num.includes(',');
  const target = parseFloat(num.replace(/,/g, ''));
  if (!isFinite(target)) return;
  el.setAttribute('aria-label', final);
  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  el.textContent = '';
  el.appendChild(span);
  const fmt = (v) => pre + (sep ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec)) + suf;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const t0 = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - t0) / 1200);
    span.textContent = fmt(target * ease(t));
    if (t < 1) requestAnimationFrame(tick); else span.textContent = final;
  };
  requestAnimationFrame(tick);
}

export default function motion() {
  const els = document.querySelectorAll(SEL);
  if (!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const show = (el) => {
    el.classList.add('is-in');
    if (el.hasAttribute('data-rc-count')) countUp(el);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      show(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  const vh = window.innerHeight;
  els.forEach((el) => {
    const below = el.getBoundingClientRect().top > vh;
    if (!below) { show(el); return; }
    if (el.hasAttribute('data-rc-reveal')) el.classList.add('rc-pre');
    if (el.hasAttribute('data-rc-draw')) el.classList.add('rc-wait');
    io.observe(el);
  });
}
