/**
 * Terra Brew Service Worker — v1
 *
 * Strategies:
 *  - Static assets (CSS, JS, images, fonts):  Cache-first
 *  - API GET (dashboard stats):               Stale-while-revalidate
 *  - API GET (other):                         Network-first
 *  - POST / PUT / DELETE:                     Queue in IndexedDB when offline → replay on reconnect
 *  - Offline fallback:                        Custom offline page
 */

const CACHE_NAME = 'terra-brew-v1';
const STATIC_CACHE = 'terra-brew-static-v1';
const DYNAMIC_CACHE = 'terra-brew-dynamic-v1';
const SWR_CACHE = 'terra-brew-swr-v1';

const STATIC_EXTENSIONS = [
  '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json',
];

const DASHBOARD_STATS_PATTERN = /\/api\/dashboard\/stats/;

// ─── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/logo.svg',
      ]);
    })
  );
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([STATIC_CACHE, DYNAMIC_CACHE, SWR_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !allowedCaches.has(name))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // POST / PUT / DELETE — queue when offline
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    event.respondWith(handleMutation(request));
    return;
  }

  // Only handle GET from here on
  if (request.method !== 'GET') return;

  // Dashboard stats → stale-while-revalidate
  if (DASHBOARD_STATS_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API calls → network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets → cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests → network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Default → network-first
  event.respondWith(networkFirst(request));
});

// ─── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'terra-brew-sync') {
    event.waitUntil(replayQueuedMutations());
  }
});

// ─── Message from client (trigger replay) ───────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REPLAY_SYNC_QUEUE') {
    event.waitUntil(replayQueuedMutations());
  }
});

// ─── Strategies ─────────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Request timeout' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SWR_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallbackPage();
  }
}

function offlineFallbackPage() {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Terra Brew — Offline</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Space Mono', monospace, system-ui;
      background: #FEFCE8;
      color: #6B4226;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { text-align: center; max-width: 480px; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #92400E; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem; }
    button {
      background: #6B4226; color: #FEFCE8; border: none;
      padding: 0.75rem 2rem; border-radius: 0.5rem;
      font-size: 0.875rem; cursor: pointer;
      font-family: inherit;
    }
    button:hover { background: #5A3520; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">☕</div>
    <h1>Bạn đang ngoại tuyến</h1>
    <p>
      Terra Brew hiện không thể kết nối đến máy chủ.
      Các thay đổi của bạn đã được lưu và sẽ đồng bộ khi có kết nối mạng trở lại.
    </p>
    <button onclick="window.location.reload()">Thử lại</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ─── Mutation Queue (IndexedDB) ─────────────────────────────────────────────────

const IDB_NAME = 'terra-brew-sw-db';
const IDB_STORE = 'sync-queue';
const IDB_VERSION = 1;

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllQueued() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function clearQueue() {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function handleMutation(request) {
  try {
    // Try the network first
    const response = await fetch(request.clone());
    return response;
  } catch {
    // Network failed — queue the mutation for later
    const body = await serializeBody(request);
    const entry = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    };

    const db = await openIDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Try to register a background sync tag
    try {
      const reg = await self.registration;
      if (reg && reg.sync) {
        await reg.sync.register('terra-brew-sync');
      }
    } catch {
      // Background Sync not supported — will rely on 'online' event on client side
    }

    return new Response(
      JSON.stringify({
        queued: true,
        message: 'Yêu cầu đã được lưu và sẽ đồng bộ khi có mạng.',
        offline: true,
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function serializeBody(request) {
  try {
    const cloned = request.clone();
    const text = await cloned.text();
    // Try to parse as JSON for nicer storage
    try {
      return { type: 'json', content: JSON.parse(text) };
    } catch {
      return { type: 'text', content: text };
    }
  } catch {
    return null;
  }
}

async function replayQueuedMutations() {
  const queue = await getAllQueued();
  if (queue.length === 0) return;

  const results = [];
  for (const entry of queue) {
    try {
      const body =
        entry.body === null
          ? undefined
          : entry.body.type === 'json'
            ? JSON.stringify(entry.body.content)
            : entry.body.content;

      const fetchOpts = {
        method: entry.method,
        headers: entry.headers || {},
      };
      if (body !== undefined) {
        fetchOpts.body = body;
      }

      const response = await fetch(entry.url, fetchOpts);
      results.push({ url: entry.url, ok: response.ok, status: response.status });
    } catch (err) {
      // If replay fails, we stop and keep remaining items
      break;
    }
  }

  // If all succeeded, clear the queue
  const allOk = results.length === queue.length && results.every((r) => r.ok);
  if (allOk) {
    await clearQueue();
    // Notify clients
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'BACKGROUND_SYNC_SUCCESS', results });
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}
