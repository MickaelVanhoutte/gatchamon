/**
 * Small wrapper around the Web Vibration API.
 *
 * Design notes:
 * - iOS Safari (as of 2026) still doesn't implement navigator.vibrate, so
 *   calls are a no-op there. Don't gate behavior on haptic feedback.
 * - Keep durations short and deliberate. 300ms+ rattles feel cheap; 8-25ms
 *   matches mobile-game touch feedback conventions.
 * - Haptics are opt-in — disabled by default. Users enable from the options
 *   modal on the home screen.
 */

const STORAGE_KEY = 'gatchamon_haptics_enabled';

function enabled(): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setHapticsEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable; swallow
  }
}

export function areHapticsEnabled(): boolean {
  return enabled();
}

/** Raw vibrate passthrough for custom patterns. */
export function vibrate(pattern: number | number[]): void {
  if (!enabled()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw instead of no-op; swallow.
  }
}

/**
 * Semantic haptics. Prefer these over raw `vibrate()` so we can tune the
 * whole game's feel from one place.
 */
export const haptic = {
  /** Subtle tick for primary button presses. */
  tap: () => vibrate(8),
  /** Slightly heavier for significant actions (confirm, claim). */
  medium: () => vibrate(18),
  /** Two quick pulses — reveal, level up. */
  double: () => vibrate([10, 40, 10]),
  /** Impactful — crit, evolution, 5★ summon. */
  impact: () => vibrate([25, 30, 40]),
  /** Success cascade — rewards, victory. */
  success: () => vibrate([12, 40, 12, 40, 20]),
  /** Error / denied. */
  error: () => vibrate([30, 50, 30]),
};
