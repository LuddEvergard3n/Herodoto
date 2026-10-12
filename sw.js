/**
 * Heródoto — Service Worker (PWA)
 * Estratégia: Cache-First para assets estáticos, Network-First para dados.
 * Permite uso offline completo após primeira visita.
 */

const CACHE_VERSION = 'herodoto-v8-1-0';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_DATA    = `${CACHE_VERSION}-data`;

// Assets que queremos pré-cachear na instalação
const STATIC_ASSETS = [
  './',
  './index.html',
  './fontes.html',
  './guia-professor.html',
  './sobre.html',
  './ajuda.html',
  './plano-aula.html',
  './filtros-semanticos.html',
  './vozes-historia.html',
  './vozes-historia-v8.html',
  './css/base.css',
  './css/components.css',
  './css/mobile-v8.css',
  './css/timeline-mobile.css',
  './css/voices-v8.css',
  './js/features.js',
  './js/mobile-shell.js',
  './js/timeline-mobile.js',
  './js/voices-grounded.js',
  './js/voices-runtime.js',
  './js/voices-runtime-worker.js',
  './js/voices-preload.js',
  './js/voices-ui.js',
  './data/dataset-catalog.json',
  './data/timeline-index.json',
  './data/model-manifest.json',
  './data/voices-models.json',
  './data/voices-personas.json',
  './data/voices-sources.json',
  './data/voices-retrieval-index.json',
  './assets/pergaminho.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Fontes do Google serão cacheadas dinamicamente (se online)
];

// ─── Instalação: pré-cachear assets estáticos ─────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => Promise.allSettled(STATIC_ASSETS.map(asset => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

// ─── Ativação: limpar caches antigas ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_DATA)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: estratégia por tipo de recurso ────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1) Dados JSON (datasets e fontes): Network-First → Cache fallback
  if ((url.pathname.includes('/data/') || url.pathname.includes('/fontes/')) && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirstJson(event.request));
    return;
  }

  // 2) Google Fonts: Cache-First (evita re-download de fontes)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, CACHE_STATIC));
    return;
  }

  // 3) Assets estáticos: Cache-First → Network fallback
  event.respondWith(cacheFirst(event.request, CACHE_STATIC));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — recurso não disponível no cache.', {
      status: 503, headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirstJson(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DATA);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('[]', {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
}
