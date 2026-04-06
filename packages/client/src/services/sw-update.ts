let appReady = false;
let registration: ServiceWorkerRegistration | null = null;

const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

/** Call once the loading screen is dismissed so future SW updates notify instead of reloading. */
export function setAppReady() {
  appReady = true;
  if (registration) {
    setInterval(() => {
      registration?.update().catch(() => {});
    }, CHECK_INTERVAL);
  }
}

/** Register a callback to be notified when a new version is available (in-game only). */
export function onUpdateAvailable(cb: () => void) {
  window.addEventListener('sw-update-available', () => cb());
}

function registerSW(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve();
      return;
    }

    let resolved = false;
    const resolveOnce = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    // Absolute failsafe — never block longer than 8 seconds
    const failsafe = setTimeout(resolveOnce, 8_000);

    // Listen for controller change (new SW took over)
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!appReady) {
        // Still on loading screen — reload to apply update immediately
        if (reloading) return;
        reloading = true;
        sessionStorage.setItem('sw-just-updated', '1');
        location.reload();
      } else {
        // Already in-game — notify UI
        window.dispatchEvent(new Event('sw-update-available'));
      }
    });

    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        registration = reg;

        // First-ever install — page loaded from network, assets are fresh
        if (!navigator.serviceWorker.controller) {
          clearTimeout(failsafe);
          resolveOnce();
          return;
        }

        // Update already in flight — wait for controllerchange to reload
        if (reg.waiting || reg.installing) {
          setTimeout(resolveOnce, 5_000);
          return;
        }

        // No pending update — explicitly check for one
        reg.update().catch(() => {});

        const onUpdateFound = () => {
          reg.removeEventListener('updatefound', onUpdateFound);
          // Update detected — controllerchange will reload the page.
          // Give it up to 5s; resolve anyway if it doesn't happen.
          setTimeout(resolveOnce, 5_000);
        };
        reg.addEventListener('updatefound', onUpdateFound);

        // If no update found, reg.update() resolves without firing updatefound.
        // 3s is generous for the byte-check of sw.js.
        setTimeout(() => {
          reg.removeEventListener('updatefound', onUpdateFound);
          clearTimeout(failsafe);
          resolveOnce();
        }, 3_000);
      })
      .catch(() => {
        clearTimeout(failsafe);
        resolveOnce();
      });
  });
}

export const swReady = registerSW();
