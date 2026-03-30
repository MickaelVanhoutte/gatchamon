/**
 * Sprite scale overrides for Pokemon whose GIF sprites have a lot of
 * transparent whitespace (mostly birds / winged mons whose wings push
 * the visible body into a small portion of the canvas).
 *
 * Values are multipliers applied on top of the normal height-based scale.
 */
const SPRITE_SCALE_BOOST: Record<string, number> = {
  // Large / iconic winged Pokemon — most noticeable when too small
  charizard:          2.4,
  'charizard-megax':  2.4,
  'charizard-megay':  2.4,
  articuno:           2.4,
  'articuno-galar':   2.2,
  zapdos:             2.4,
  'zapdos-galar':     2.0,
  moltres:            2.4,
  'moltres-galar':    2.2,
  lugia:              2.2,
  hooh:               2.2,
  dragonite:          2.2,
  'dragonite-mega':   2.2,
  rayquaza:           2.2,
  'rayquaza-mega':    2.2,
  salamence:          2.1,
  'salamence-mega':   2.1,
  aerodactyl:         2.1,
  'aerodactyl-mega':  2.1,
  pidgeot:            2.1,
  'pidgeot-mega':     2.1,
  fearow:             2.1,
  noivern:            2.1,
  yveltal:            2.2,
  togekiss:           2.1,
  honchkrow:          2.1,
  staraptor:          2.1,
  braviary:           2.1,
  'braviary-hisui':   2.1,
  corviknight:        2.1,
  talonflame:         2.0,
  unfezant:           2.0,
  mandibuzz:          2.1,
  archeops:           2.1,
  decidueye:          2.0,
  'decidueye-hisui':  2.0,
  altaria:            2.0,
  'altaria-mega':     2.0,
  skarmory:           2.1,
  'skarmory-mega':    2.1,
  tropius:            2.0,
  flygon:             2.0,
  toucannon:          1.8,
  hawlucha:           1.8,
  tornadus:           2.0,
  'tornadus-therian': 2.0,
  thundurus:          2.0,
  'thundurus-therian':2.0,
  landorus:           2.0,
  'landorus-therian': 2.0,
  butterfree:         2.0,
  crobat:             1.8,
  noctowl:            1.8,
  xatu:               1.8,
  swanna:             1.8,
  pelipper:           1.8,
  cramorant:          1.8,

  // Mid-stage / smaller birds
  pidgeotto:          1.6,
  golbat:             1.6,
  swellow:            1.8,
  staravia:           1.6,
  fletchinder:        1.6,
  tranquill:          1.6,
  corvisquire:        1.6,
  dartrix:            1.6,
  trumbeak:           1.6,
  archen:             1.6,
  rufflet:            1.6,
  vullaby:            1.6,
  murkrow:            1.6,
  oricorio:           1.8,
  'oricorio-pau':     1.8,
  'oricorio-sensu':   1.8,
  flapple:            1.8,

  // Serpentine Pokemon whose Pokedex "height" is body length, not visual size
  dratini:            0.5,
};

/** Return the sprite scale boost multiplier for a given Pokemon name. */
export function getSpriteBoost(pokemonName: string): number {
  return SPRITE_SCALE_BOOST[pokemonName.toLowerCase()] ?? 1;
}
