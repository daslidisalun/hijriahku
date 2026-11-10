// verifikasi-mesin.mjs — baterai verifikasi mesin konversi HijriahKu.
// 1) Jangkar resmi SKB 3 Menteri 2026 & 2027 (sumber: rilis Sekretariat
//    Negara setneg.go.id; data sama yang dipakai proyek KalenderKerja,
//    diverifikasi silang kalenderlengkap.id & SatuTim) vs mesin Umm al-Qura.
// 2) Uji bolak-balik (round-trip) tiap 37 hari, 2020–2030.
// Jalankan: node scripts/verifikasi-mesin.mjs
import { gKeH, hKeG, keISO } from '../src/lib/hijri.js';

const JANGKAR = [
  // [tanggal Masehi resmi, d, m, y Hijriah menurut ketetapan, nama]
  ['2026-01-16', 27, 7, 1447, 'Isra Mikraj 1447 H (SKB 2026)'],
  ['2026-03-21', 1, 10, 1447, 'Idulfitri 1447 H hari pertama (SKB 2026)'],
  ['2026-05-27', 10, 12, 1447, 'Iduladha 1447 H (SKB 2026)'],
  ['2026-06-16', 1, 1, 1448, '1 Muharam 1448 H (SKB 2026)'],
  ['2026-08-25', 12, 3, 1448, 'Maulid Nabi 1448 H (SKB 2026)'],
  ['2027-01-05', 27, 7, 1448, 'Isra Mikraj 1448 H (SKB 2027)'],
  ['2027-03-10', 1, 10, 1448, 'Idulfitri 1448 H hari pertama (SKB 2027)'],
  ['2027-05-17', 10, 12, 1448, 'Iduladha 1448 H (SKB 2027)'],
  ['2027-06-06', 1, 1, 1449, '1 Muharam 1449 H (SKB 2027)'],
];

let cocok = 0;
const beda = [];
console.log('=== JANGKAR SKB vs MESIN UMM AL-QURA ===');
for (const [iso, d, m, y, nama] of JANGKAR) {
  const [gy, gm, gd] = iso.split('-').map(Number);
  const h = gKeH({ y: gy, m: gm, d: gd });
  const sama = h.d === d && h.m === m && h.y === y;
  if (sama) cocok++;
  else beda.push({ nama, iso, resmi: `${d}/${m}/${y}`, mesin: `${h.d}/${h.m}/${h.y}`, mesinUntukResmi: keISO(hKeG({ d, m, y })) });
  console.log(`${sama ? 'COCOK ' : 'BEDA  '} ${iso}  resmi ${d}/${m}/${y}  mesin ${h.d}/${h.m}/${h.y}  — ${nama}`);
}
console.log(`\n${cocok}/${JANGKAR.length} jangkar cocok persis.`);
for (const b of beda) {
  console.log(`BEDA: ${b.nama} — resmi ${b.iso} (${b.resmi} H); mesin menempatkan ${b.resmi} H pada ${b.mesinUntukResmi} (selisih 1 hari lebih awal).`);
}

console.log('\n=== ROUND-TRIP tiap 37 hari, 2020–2030 ===');
const DAY = 86400000;
let n = 0, gagal = 0;
for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2030, 11, 31); t += 37 * DAY) {
  const dt = new Date(t);
  const g = { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  const balik = hKeG(gKeH(g));
  n++;
  if (balik.y !== g.y || balik.m !== g.m || balik.d !== g.d) gagal++;
}
console.log(`${n} tanggal diuji, ${gagal} gagal.`);
if (gagal > 0) process.exitCode = 1;
