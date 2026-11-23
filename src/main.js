/**
 * RC loader — data-rc attribute'larını tarar, ilgili modülü başlatır.
 * Kural: JS class'lara değil data-rc="<modul>" attribute'una bağlanır.
 * Her modül izole çalışır; biri hata verirse diğerleri etkilenmez.
 */
import motion from './modules/motion.js';
import carousel from './modules/carousel.js';
import v3 from './modules/v3.js';

const modules = {
  carousel: () => Promise.resolve({ default: carousel }),
};

function init(root = document) {
  root.querySelectorAll('[data-rc]').forEach((el) => {
    if (el.__rcInit) return;
    el.dataset.rc.split(/\s+/).forEach(async (name) => {
      const load = modules[name];
      if (!load) return;
      try {
        const mod = await load();
        (mod.default || mod.init)(el);
        el.__rcInit = true;
      } catch (err) {
        console.warn(`[RC] "${name}" başlatılamadı`, err);
      }
    });
  });
}

window.RC = Object.assign(window.RC || {}, { init, motion, version: __VERSION__ });

function boot() {
  try { motion(); } catch (err) { console.warn('[RC] motion', err); }
  try { v3(); } catch (err) { console.warn('[RC] v3', err); }
  init();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
