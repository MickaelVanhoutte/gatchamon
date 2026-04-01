let appReady = false;

/** Call once the loading screen is dismissed so future SW updates notify instead of reloading. */
export function setAppReady() {
  appReady = true;
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

    let notified = false;
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (notified) return;
        notified = true;
        if (!appReady) {
          // Still on loading screen — reload to apply update immediately
          sessionStorage.setItem('sw-just-updated', '1');
          location.reload();
        } else {
          // Already in-game — notify UI components
          window.dispatchEvent(new Event('sw-update-available'));
        }
      });
    }

    const failsafe = setTimeout(resolveOnce, 10_000);

    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        // First install — page was loaded from network, assets are fresh
        if (!navigator.serviceWorker.controller) {
          clearTimeout(failsafe);
          resolveOnce();
          return;
        }

        // Update already in flight — let the loading screen show briefly,
        // controllerchange will reload when the new SW activates
        if (reg.installing || reg.waiting) {
          setTimeout(resolveOnce, 5_000);
          return;
        }

        // No pending update — listen for one, with a fast-path timeout
        const noUpdateTimeout = setTimeout(() => {
          clearTimeout(failsafe);
          resolveOnce();
        }, 1500);

        reg.addEventListener('updatefound', () => {
          clearTimeout(noUpdateTimeout);
          // Update detected — give it time to activate,
          // controllerchange will reload the page
          setTimeout(resolveOnce, 5_000);
        });
      })
      .catch(() => {
        clearTimeout(failsafe);
        resolveOnce();
      });
  });
}

export const swReady = registerSW();
