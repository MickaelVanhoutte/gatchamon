let settled = false;

function awaitActivation(sw: ServiceWorker, onNoUpdate: () => void): void {
  if (sw.state === 'activated') {
    window.location.reload();
    return;
  }
  sw.addEventListener('statechange', () => {
    if (settled) return;
    if (sw.state === 'activated') {
      settled = true;
      window.location.reload();
    }
    if (sw.state === 'redundant') {
      onNoUpdate();
    }
  });
}

function registerSW(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      settled = true;
      resolve();
    }, 10_000);

    const resolveOnce = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };

    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        // First install — page was loaded from network, assets are fresh
        if (!navigator.serviceWorker.controller) {
          resolveOnce();
          return;
        }

        // Update already in flight (race: updatefound fired before listener)
        const pendingSW = reg.installing || reg.waiting;
        if (pendingSW) {
          awaitActivation(pendingSW, resolveOnce);
          return;
        }

        // No pending update — listen for one, with a fast-path timeout
        const noUpdateTimeout = setTimeout(resolveOnce, 1500);

        reg.addEventListener('updatefound', () => {
          clearTimeout(noUpdateTimeout);
          const newSW = reg.installing;
          if (!newSW) {
            resolveOnce();
            return;
          }
          awaitActivation(newSW, resolveOnce);
        });
      })
      .catch(() => {
        resolveOnce();
      });
  });
}

export const swReady = registerSW();
