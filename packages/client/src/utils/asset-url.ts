import type { BattleState } from '@gatchamon/shared';

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}

/* ── Region → background (story mode) ── */
const REGION_BACKGROUNDS: Record<number, string> = {
  1:  'backgrounds/cave-arena.png',
  2:  'backgrounds/forest-arena.png',
  3:  'backgrounds/colosseum-arena.png',
  4:  'backgrounds/mushroom-forest.png',
  5:  'backgrounds/swamp-forest.png',
  6:  'backgrounds/castle-arena.png',
  7:  'backgrounds/underground-arena.png',
  8:  'backgrounds/cave-arena.png',
  9:  'backgrounds/prison-arena.png',
  10: 'backgrounds/colosseum-arena.png',
  11: 'backgrounds/forest.png',
  12: 'backgrounds/mushroom-forest.png',
  13: 'backgrounds/colosseum-arena.png',
  14: 'backgrounds/undead-arena.png',
  15: 'backgrounds/cave-arena.png',
  16: 'backgrounds/prison-arena.png',
  17: 'backgrounds/winter-arena.png',
  18: 'backgrounds/castle-arena.png',
  19: 'backgrounds/underground-arena.png',
  20: 'backgrounds/colosseum-arena.png',
};

/* ── Dungeon ID → background (essence & item dungeons) ── */
const DUNGEON_BACKGROUNDS: Record<number, string> = {
  9:  'backgrounds/castle-arena.png',
  1:  'backgrounds/mushroom-forest.png',
  2:  'backgrounds/underground-arena.png',
  3:  'backgrounds/cave-arena.png',
  4:  'backgrounds/castle-arena.png',
  5:  'backgrounds/undead-arena.png',
  6:  'backgrounds/night-forest.png',
  7:  'backgrounds/undead-arena.png',
  8:  'backgrounds/prison-arena.png',
  101: 'backgrounds/cave-arena.png',
  102: 'backgrounds/forest.png',
  103: 'backgrounds/castle-arena.png',
  104: 'backgrounds/winter-arena.png',
  105: 'backgrounds/undead-arena.png',
};

export function getBattleBackground(state: BattleState): string {
  if ((state.mode === 'dungeon' || state.mode === 'item-dungeon') && state.dungeonId != null) {
    const bg = DUNGEON_BACKGROUNDS[state.dungeonId];
    if (bg) return assetUrl(bg);
  }
  if (state.mode === 'mystery-dungeon') {
    const pool = ['backgrounds/night-forest.png', 'backgrounds/swamp-forest.png', 'backgrounds/undead-arena.png', 'backgrounds/underground-arena.png'];
    const seed = state.mysteryDateKey ? state.mysteryDateKey.split('-').reduce((a, b) => a + Number(b), 0) : 0;
    return assetUrl(pool[seed % pool.length]);
  }
  if (state.mode === 'arena' || state.mode === 'arena-rival') {
    return assetUrl('backgrounds/colosseum-arena.png');
  }
  const bg = REGION_BACKGROUNDS[state.floor.region];
  return assetUrl(bg ?? 'backgrounds/forest-arena.png');
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
