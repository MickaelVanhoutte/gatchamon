/**
 * Mirrors document.hidden into a `body.is-hidden` class so CSS can pause
 * infinite animations while the app is backgrounded. Saves battery and stops
 * particles/pulses from running against a blank tab.
 */
if (typeof document !== 'undefined') {
  const apply = () => {
    document.body.classList.toggle('is-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', apply);
  apply();
}
