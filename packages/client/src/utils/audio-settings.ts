/**
 * Global sound on/off preference. Audio is enabled by default; absence of
 * the key means "on" so new players hear SFX without opting in. The
 * AudioManager reads this flag before playing any clip.
 */

const STORAGE_KEY = 'gatchamon_sound_disabled';

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    if (on) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // localStorage unavailable; swallow
  }
}
