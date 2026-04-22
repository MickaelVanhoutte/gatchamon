/**
 * Tiny central error reporter. Replaces silent `.catch(() => {})` blocks.
 *
 * For now this just logs to console with a tagged context so devs can find
 * the source quickly in DevTools. When a toast/analytics pipeline is added,
 * wire it here — all call sites will benefit automatically.
 */
export function reportError(context: string, err: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[${context}]`, err);
}
