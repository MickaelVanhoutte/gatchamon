/**
 * Attempts to lock the screen to landscape orientation.
 *
 * Strategy:
 * 1. Try screen.orientation.lock() directly (works in installed PWAs)
 * 2. If that fails, try entering fullscreen first then locking (works in browsers)
 * 3. If both fail, CSS rotation fallback remains active via global.css
 *
 * MUST be called from a user gesture (click/tap) for fullscreen to work.
 */
export async function tryLockLandscape(): Promise<boolean> {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };

  // Already landscape — nothing to do
  if (orientation?.type?.startsWith('landscape')) return true;

  // 1) Direct lock (works in PWA / standalone mode)
  if (orientation?.lock) {
    try {
      await orientation.lock('landscape');
      return true;
    } catch {
      // expected in regular browsers — fall through
    }
  }

  // 2) Fullscreen + lock (works in regular mobile browsers with user gesture)
  if (document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen();
      if (orientation?.lock) {
        await orientation.lock('landscape');
        return true;
      }
    } catch {
      // fullscreen denied or lock failed
    }
  }

  return false;
}
