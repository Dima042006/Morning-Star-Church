/* Стандартизатор — service worker.
 * Зберігає програму, шрифти й бібліотеку на телефоні, щоб вона відкривалась миттєво і без інтернету.
 * Сторінка (index.html) береться з мережі, якщо вона є (щоб оновлення приходили одразу),
 * а без мережі — з кешу. Решта файлів — з кешу. Запити до Google (Apps Script) не кешуються.
 * Після змін у файлах збільшіть VERSION. */
const VERSION = 'v5';
const CACHE = 'standartyzator-' + VERSION;
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'pptxgen.bundle.js',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'fonts/Mariupol-Regular.otf',
  'fonts/FixelDisplay-Medium.woff2',
  'fonts/FixelDisplay-SemiBold.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('standartyzator-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // Google API — напряму

  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isPage) {
    // мережа першою (свіжа версія), без мережі — кеш
    event.respondWith(
      fetch(req, { cache: 'no-store' })          // завжди свіжа версія сторінки, без кешу браузера
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }
  // шрифти, бібліотека, іконки — з кешу, а якщо немає — з мережі і в кеш
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
