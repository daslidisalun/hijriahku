// base.js — SATU-SATUNYA helper jalur dasar (base path) situs.
//
// Nilai BASE diambil dari konfigurasi Astro (astro.config.mjs → base),
// terbaca lewat import.meta.env.BASE_URL yang selalu diakhiri '/'.
// Semua URL internal WAJIB dibangun lewat u() agar otomatis mengikuti
// base — mis. di GitHub Pages project site: '/hijriahku/'.
export const BASE = import.meta.env.BASE_URL;

// u('/konverter/') → '/konverter/'  (atau '/hijriahku/konverter/' bila ber-base)
// u('/')           → '/'
export const u = (path) => BASE + String(path).replace(/^\/+/, '');
