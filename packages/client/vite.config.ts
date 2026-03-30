import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

function generateSW(): Plugin {
  return {
    name: 'generate-sw',
    closeBundle() {
      const buildId = Date.now().toString(36);
      const sw = `const CACHE_NAME = 'gatchamon-${buildId}';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Bypass HTTP cache for navigation (index.html) so users always get the latest
  const req = event.request.mode === 'navigate'
    ? new Request(event.request, { cache: 'no-cache' })
    : event.request;

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
      )
  );
});
`;
      writeFileSync(resolve(__dirname, 'dist', 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  plugins: [react(), generateSW()],
  base: './',
  server: {
    port: 5173,
  },
});
