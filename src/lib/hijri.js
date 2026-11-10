// hijri.js — mesin konversi kalender Hijriah HijriahKu.
//
// METODE: kalender Umm al-Qura sebagaimana disediakan platform lewat
// Intl.DateTimeFormat (kalender 'islamic-umalqura'). Konversi
// Masehi → Hijriah membaca langsung hasil Intl; konversi Hijriah →
// Masehi adalah pencarian biner tanggal Masehi yang representasi
// Umm al-Qura-nya sama persis dengan tanggal Hijriah yang dicari.
//
// Semua tanggal direpresentasikan sebagai objek polos {y, m, d} dan
// dihitung dalam hari UTC agar tidak terpengaruh zona waktu lokal.
// CATATAN KEJUJURAN METODE (ditampilkan juga di situs): penanggalan
// Umm al-Qura adalah kalender hisab aritmetik; tanggal resmi awal
// Ramadan, Idulfitri, dan Iduladha di Indonesia ditetapkan lewat
// sidang isbat Kementerian Agama dan dapat berbeda satu hari.

export const LABEL_METODE =
  'Tanggal Hijriah di situs ini mengikuti hisab kalender Umm al-Qura. ' +
  'Tanggal resmi awal Ramadan, Idul Fitri, dan Idul Adha di Indonesia ' +
  'ditetapkan lewat sidang isbat Kementerian Agama dan dapat berbeda satu hari.';

export const BULAN_HIJRIAH = [
  { nama: 'Muharam', arti: 'Bulan yang dimuliakan; salah satu dari empat bulan haram (suci) di mana peperangan dilarang.' },
  { nama: 'Safar', arti: 'Konon berarti "kosong" — rumah-rumah ditinggal kosong karena penduduknya bepergian atau berperang.' },
  { nama: 'Rabiulawal', arti: 'Musim semi pertama (rabiʿ = musim semi dalam bahasa Arab kuno).' },
  { nama: 'Rabiulakhir', arti: 'Musim semi terakhir.' },
  { nama: 'Jumadilawal', arti: 'Bulan kering atau beku yang pertama (jumada berkaitan dengan kekeringan/beku).' },
  { nama: 'Jumadilakhir', arti: 'Bulan kering atau beku yang terakhir.' },
  { nama: 'Rajab', arti: 'Bulan pengagungan; salah satu dari empat bulan haram.' },
  { nama: 'Syaban', arti: 'Bulan bercabang — kabilah-kabilah berpencar mencari air dan padang penggembalaan.' },
  { nama: 'Ramadan', arti: 'Dari kata ramadha, panas yang terik; bulan puasa wajib bagi umat Islam.' },
  { nama: 'Syawal', arti: 'Bulan "terangkatnya ekor unta" — musim unta mengangkat ekornya; bulan Idul Fitri.' },
  { nama: 'Dzulqaidah', arti: 'Bulan "duduk" atau berhenti berperang; salah satu dari empat bulan haram.' },
  { nama: 'Dzulhijah', arti: 'Bulan pelaksanaan ibadah haji; salah satu dari empat bulan haram.' },
];

export const BULAN_MASEHI = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Indeks 0 = Minggu (mengikuti getUTCDay).
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const HARI_MS = 86400000;

// --- representasi hari -------------------------------------------------
export const keNomorHari = ({ y, m, d }) => Math.round(Date.UTC(y, m - 1, d) / HARI_MS);
export const dariNomorHari = (n) => {
  const t = new Date(n * HARI_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
export const tambahHari = (g, n) => dariNomorHari(keNomorHari(g) + n);
export const selisihHari = (a, b) => keNomorHari(a) - keNomorHari(b); // a − b
export const namaHari = (g) => NAMA_HARI[new Date(keNomorHari(g) * HARI_MS).getUTCDay()];
export const hariIniLokal = () => {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
};

// --- Intl Umm al-Qura ----------------------------------------------------
function buatPemformat() {
  const calon = ['id-ID-u-ca-islamic-umalqura', 'en-u-ca-islamic-umalqura', 'en-u-ca-islamic'];
  for (const loc of calon) {
    try {
      const f = new Intl.DateTimeFormat(loc, {
        day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
      });
      // uji bahwa hasil parsnya numerik dan kalendernya benar (1 Syawal 1447 = 20 Mar 2026)
      const u = {};
      for (const p of f.formatToParts(new Date(Date.UTC(2026, 2, 20)))) u[p.type] = p.value;
      if (+u.day === 1 && +u.month === 10 && +u.year === 1447) return f;
    } catch { /* coba kandidat berikutnya */ }
  }
  throw new Error('Kalender Islam (Umm al-Qura) tidak tersedia di perangkat ini.');
}
let _fmt = null;
const fmt = () => (_fmt ??= buatPemformat());

// Masehi {y,m,d} → Hijriah {d,m,y}
export function gKeH(g) {
  const u = {};
  for (const p of fmt().formatToParts(new Date(keNomorHari(g) * HARI_MS))) u[p.type] = p.value;
  return { d: +u.day, m: +u.month, y: +u.year };
}

const kunciH = (h) => h.y * 10000 + h.m * 100 + h.d;

// Hijriah {d,m,y} → Masehi {y,m,d}; pencarian biner memakai mesin yang sama.
export function hKeG(h) {
  const target = kunciH(h);
  const kunciPada = (n) => kunciH(gKeH(dariNomorHari(n)));
  // 1 Muharam 1 H bertepatan dengan 19 Juli 622 M (hari Julian) — jauh di
  // bawah semua target yang wajar; batas atas diperkirakan dari tahunnya.
  let lo = Math.round(Date.UTC(622, 6, 19) / HARI_MS);
  let hi = lo + Math.ceil(h.y * 354.37) + (h.m - 1) * 30 + h.d + 800;
  while (kunciPada(hi) < target) hi += 366;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (kunciPada(mid) < target) lo = mid + 1; else hi = mid;
  }
  const hasil = dariNomorHari(lo);
  const cek = gKeH(hasil);
  if (cek.d !== h.d || cek.m !== h.m || cek.y !== h.y) {
    throw new Error(`Tanggal Hijriah tidak ditemukan: ${h.d}/${h.m}/${h.y}`);
  }
  return hasil;
}

export const panjangBulanH = (m, y) => {
  const awal = hKeG({ d: 1, m, y });
  const berikut = m === 12 ? hKeG({ d: 1, m: 1, y: y + 1 }) : hKeG({ d: 1, m: m + 1, y });
  return selisihHari(berikut, awal);
};
export const panjangTahunH = (y) => selisihHari(hKeG({ d: 1, m: 1, y: y + 1 }), hKeG({ d: 1, m: 1, y }));

// Kemunculan berikutnya dari tanggal Hijriah (d, m) pada/setelah tanggal
// Masehi `dari` (inklusif). Mengembalikan tanggal Masehi-nya.
export function berikutnyaH(d, m, dari) {
  const hDari = gKeH(dari);
  let kandidat = hKeG({ d, m, y: hDari.y });
  if (selisihHari(kandidat, dari) < 0) kandidat = hKeG({ d, m, y: hDari.y + 1 });
  return kandidat;
}

// --- format tampilan -----------------------------------------------------
export const formatH = (h) => `${h.d} ${BULAN_HIJRIAH[h.m - 1].nama} ${h.y} H`;
export const formatG = (g) => `${g.d} ${BULAN_MASEHI[g.m - 1]} ${g.y}`;
export const formatGLengkap = (g) => `${namaHari(g)}, ${formatG(g)}`;
export const keISO = (g) =>
  `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`;
export const dariISO = (s) => {
  const [y, m, d] = String(s).split('-').map(Number);
  return { y, m, d };
};

// --- umur dalam penanggalan Hijriah --------------------------------------
// Mengembalikan {tahun, bulan, hari, ultahBerikut: {g, h}} dari tanggal
// lahir Masehi ke tanggal acuan Masehi.
export function umurHijriah(lahirG, acuanG) {
  const L = gKeH(lahirG);
  const A = gKeH(acuanG);
  let tahun = A.y - L.y;
  let bulan = A.m - L.m;
  let hari = A.d - L.d;
  if (hari < 0) {
    bulan -= 1;
    const mSebelum = A.m === 1 ? 12 : A.m - 1;
    const ySebelum = A.m === 1 ? A.y - 1 : A.y;
    hari += panjangBulanH(mSebelum, ySebelum);
  }
  if (bulan < 0) { tahun -= 1; bulan += 12; }
  const ultah = berikutnyaH(L.d, L.m, tambahHari(acuanG, 1));
  return { tahun, bulan, hari, ultahBerikut: { g: ultah, h: gKeH(ultah) } };
}

// --- daftar hari besar ---------------------------------------------------
export const PERINGATAN = [
  { nama: 'Tahun Baru Hijriah', d: 1, m: 1, keterangan: 'Awal tahun dalam kalender Hijriah; memperingati momentum hijrah Nabi Muhammad dari Makkah ke Madinah pada 622 M yang menjadi titik awal penanggalan.' },
  { nama: 'Asyura', d: 10, m: 1, keterangan: 'Hari kesepuluh Muharam. Dalam tradisi Islam dikaitkan dengan peristiwa-peristiwa besar para nabi; banyak umat Islam berpuasa pada 9–10 atau 10–11 Muharam.' },
  { nama: 'Maulid Nabi Muhammad', d: 12, m: 3, keterangan: 'Peringatan hari kelahiran Nabi Muhammad. Di Indonesia dirayakan dengan pengajian, pembacaan sirah, dan tradisi budaya yang beragam di berbagai daerah.' },
  { nama: 'Isra Mikraj', d: 27, m: 7, keterangan: 'Memperingati perjalanan malam Nabi Muhammad dari Masjidil Haram ke Masjidil Aqsa dan naik ke Sidratul Muntaha; dalam keyakinan umat Islam, pada peristiwa inilah perintah salat lima waktu diterima.' },
  { nama: 'Nisfu Syaban', d: 15, m: 8, keterangan: 'Pertengahan bulan Syaban. Sebagian masyarakat Muslim mengisinya dengan ibadah malam dan doa; praktik dan penekanannya berbeda-beda antar tradisi.' },
  { nama: 'Awal Ramadan', d: 1, m: 9, keterangan: 'Hari pertama puasa Ramadan, bulan kesembilan yang diwajibkan bagi umat Islam yang memenuhi syarat. Tanggal resminya di Indonesia ditetapkan lewat sidang isbat.' },
  { nama: 'Nuzulul Quran', d: 17, m: 9, keterangan: 'Peringatan turunnya wahyu Al-Quran pertama kepada Nabi Muhammad, yang menurut riwayat umum terjadi pada bulan Ramadan.' },
  { nama: 'Idul Fitri', d: 1, m: 10, keterangan: 'Hari raya penutup Ramadan, dirayakan dengan salat Id, saling memaafkan, dan silaturahmi. Tanggal resminya di Indonesia ditetapkan lewat sidang isbat.' },
  { nama: 'Hari Arafah', d: 9, m: 12, keterangan: 'Hari wukuf di Padang Arafah, puncak rangkaian ibadah haji. Umat Islam yang tidak berhaji banyak yang berpuasa pada hari ini.' },
  { nama: 'Idul Adha', d: 10, m: 12, keterangan: 'Hari raya kurban yang memperingati keteladanan Nabi Ibrahim; dirayakan dengan salat Id dan penyembelihan hewan kurban, dilanjutkan hari-hari tasyrik (11–13 Dzulhijah). Tanggal resminya ditetapkan lewat sidang isbat.' },
];
