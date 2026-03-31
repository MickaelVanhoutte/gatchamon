/**
 * Sprite scale overrides for Pokemon whose GIF sprites have a lot of
 * transparent whitespace (mostly birds / winged mons whose wings push
 * the visible body into a small portion of the canvas).
 *
 * Values are multipliers applied on top of the normal height-based scale.
 * Used in battle and island views only (collection/altar grids are uniform).
 */
const SPRITE_SCALE_BOOST: Record<string, number> = {
  // Large / iconic winged Pokemon — most noticeable when too small
  charizard:          1.6,
  'charizard-megax':  2,
  'charizard-megay':  2.2,
  articuno:           1.6,
  'articuno-galar':   1.5,
  zapdos:             1.6,
  'zapdos-galar':     1.4,
  moltres:            1.6,
  'moltres-galar':    1.5,
  lugia:              1.5,
  hooh:               1.5,
  dragonite:          1.5,
  'dragonite-mega':   1.5,
  rayquaza:           1.5,
  'rayquaza-mega':    1.5,
  salamence:          1.4,
  'salamence-mega':   1.4,
  aerodactyl:         1.4,
  'aerodactyl-mega':  1.4,
  pidgeot:            1.4,
  'pidgeot-mega':     1.4,
  fearow:             1.4,
  noivern:            1.4,
  yveltal:            1.5,
  togekiss:           1.4,
  honchkrow:          1.4,
  staraptor:          1.4,
  braviary:           1.4,
  'braviary-hisui':   1.4,
  corviknight:        1.4,
  talonflame:         1.3,
  unfezant:           1.3,
  mandibuzz:          1.4,
  archeops:           1.4,
  decidueye:          1.3,
  'decidueye-hisui':  1.3,
  altaria:            1.3,
  'altaria-mega':     1.3,
  skarmory:           1.4,
  'skarmory-mega':    1.4,
  tropius:            1.3,
  flygon:             1.3,
  toucannon:          1.2,
  hawlucha:           1.2,
  tornadus:           1.3,
  'tornadus-therian': 1.3,
  thundurus:          1.3,
  'thundurus-therian':1.3,
  landorus:           1.3,
  'landorus-therian': 1.3,
  butterfree:         1.3,
  crobat:             1.2,
  noctowl:            1.2,
  xatu:               1.2,
  swanna:             1.2,
  pelipper:           1.2,
  cramorant:          1.2,
  'clefable-mega':    1.6,
  'beedrill-mega':    0.8,
  'gyarados-mega':    1.6,

  // Mid-stage / smaller birds
  pidgeotto:          1.15,
  golbat:             1.15,
  swellow:            1.2,
  staravia:           1.15,
  fletchinder:        1.15,
  tranquill:          1.15,
  corvisquire:        1.15,
  dartrix:            1.15,
  trumbeak:           1.15,
  archen:             1.15,
  rufflet:            1.15,
  vullaby:            1.15,
  murkrow:            1.15,
  oricorio:           1.2,
  'oricorio-pau':     1.2,
  'oricorio-sensu':   1.2,
  flapple:            1.2,

  // Serpentine Pokemon whose Pokedex "height" is body length, not visual size
  dratini:            0.6,
  magikarp:           0.6,
};

/** Return the sprite scale boost multiplier for a given Pokemon name. */
export function getSpriteBoost(pokemonName: string): number {
  return SPRITE_SCALE_BOOST[pokemonName.toLowerCase()] ?? 1;
}
