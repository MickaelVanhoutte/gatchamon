export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}

/**
 * Convert an animated sprite path to its static PNG equivalent.
 * e.g. "monsters/ani/bulbasaur.gif" → "monsters/static/bulbasaur.png"
 */
export function staticSpriteUrl(animatedPath: string): string {
  return assetUrl(
    animatedPath
      .replace('monsters/ani-shiny/', 'monsters/static-shiny/')
      .replace('monsters/ani/', 'monsters/static/')
      .replace('.gif', '.png'),
  );
}
