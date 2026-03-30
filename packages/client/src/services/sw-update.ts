let updateCallback: (() => void) | null = null;

/** Register a callback to be notified when a new version is available. */
export function onUpdateAvailable(cb: () => void) {
  updateCallback = cb;
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

    // Notify the UI when a new SW takes control instead of force-reloading
    let notified = false;
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (notified) return;
        notified = true;
        updateCallback?.();
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
