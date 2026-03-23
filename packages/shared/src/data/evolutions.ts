import type { EvolutionChain } from '../types/evolution.js';

/**
 * All evolution chains in the game.
 * Material costs scale by evolution stage and base rarity.
 */
export const EVOLUTION_CHAINS: EvolutionChain[] = [
  // ===== 1-STAR POKEMON EVOLUTIONS =====

  // Caterpie(10) -> Metapod(11) -> Butterfree(12)
  { from: 10, to: 11, requirements: { essences: { bug_low: 5, magic_low: 2 }, levelRequired: 15 } },
  { from: 11, to: 12, requirements: { essences: { bug_mid: 8, flying_low: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Weedle(13) -> Kakuna(14) -> Beedrill(15)
  { from: 13, to: 14, requirements: { essences: { bug_low: 5, poison_low: 3 }, levelRequired: 15 } },
  { from: 14, to: 15, requirements: { essences: { bug_mid: 8, poison_mid: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Pidgey(16) -> Pidgeotto(17) -> Pidgeot(18)
  { from: 16, to: 17, requirements: { essences: { flying_low: 5, normal_low: 3 }, levelRequired: 15 } },
  { from: 17, to: 18, requirements: { essences: { flying_mid: 8, normal_mid: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Rattata(19) -> Raticate(20)
  { from: 19, to: 20, requirements: { essences: { normal_low: 8, magic_low: 4 }, levelRequired: 18 } },

  // Spearow(21) -> Fearow(22)
  { from: 21, to: 22, requirements: { essences: { flying_low: 8, normal_low: 4 }, levelRequired: 18 } },

  // Jigglypuff(39) -> Wigglytuff(40)  (2-star base, listed with 1-stars for chain grouping)

  // Zubat(41) -> Golbat(42)
  { from: 41, to: 42, requirements: { essences: { poison_low: 6, flying_low: 4, magic_low: 3 }, levelRequired: 18 } },

  // Oddish(43) -> Gloom(44) -> Vileplume(45)
  { from: 43, to: 44, requirements: { essences: { grass_low: 5, poison_low: 3 }, levelRequired: 15 } },
  { from: 44, to: 45, requirements: { essences: { grass_mid: 10, poison_mid: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Bellsprout(69) -> Weepinbell(70) -> Victreebel(71)
  { from: 69, to: 70, requirements: { essences: { grass_low: 5, poison_low: 3 }, levelRequired: 15 } },
  { from: 70, to: 71, requirements: { essences: { grass_mid: 10, poison_mid: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Geodude(74) -> Graveler(75) -> Golem(76)
  { from: 74, to: 75, requirements: { essences: { rock_low: 5, ground_low: 3 }, levelRequired: 15 } },
  { from: 75, to: 76, requirements: { essences: { rock_mid: 10, ground_mid: 5, magic_mid: 3 }, levelRequired: 25 } },

  // Magikarp(129) -> Gyarados(130)
  { from: 129, to: 130, requirements: { essences: { water_mid: 15, flying_mid: 8, magic_high: 3 }, levelRequired: 20 } },

  // ===== 2-STAR POKEMON EVOLUTIONS =====

  // Bulbasaur(1) -> Ivysaur(2) -> Venusaur(3)
  { from: 1, to: 2, requirements: { essences: { grass_low: 8, poison_low: 4, magic_low: 3 }, levelRequired: 18 } },
  { from: 2, to: 3, requirements: { essences: { grass_mid: 12, poison_mid: 6, magic_mid: 5 }, levelRequired: 30 } },

  // Charmander(4) -> Charmeleon(5) -> Charizard(6)
  { from: 4, to: 5, requirements: { essences: { fire_low: 8, magic_low: 3 }, levelRequired: 18 } },
  { from: 5, to: 6, requirements: { essences: { fire_mid: 12, flying_mid: 6, magic_mid: 5 }, levelRequired: 30 } },

  // Squirtle(7) -> Wartortle(8) -> Blastoise(9)
  { from: 7, to: 8, requirements: { essences: { water_low: 8, magic_low: 3 }, levelRequired: 18 } },
  { from: 8, to: 9, requirements: { essences: { water_mid: 12, magic_mid: 5 }, levelRequired: 30 } },

  // Pikachu(25) -> Raichu(26)
  { from: 25, to: 26, requirements: { essences: { electric_mid: 12, magic_mid: 5 }, levelRequired: 20 } },

  // Abra(63) -> Kadabra(64) -> Alakazam(65)
  { from: 63, to: 64, requirements: { essences: { psychic_low: 8, magic_low: 4 }, levelRequired: 18 } },
  { from: 64, to: 65, requirements: { essences: { psychic_mid: 12, magic_mid: 5 }, levelRequired: 30 } },

  // Machop(66) -> Machoke(67) -> Machamp(68)
  { from: 66, to: 67, requirements: { essences: { fighting_low: 8, magic_low: 4 }, levelRequired: 18 } },
  { from: 67, to: 68, requirements: { essences: { fighting_mid: 12, magic_mid: 5 }, levelRequired: 30 } },

  // Gastly(92) -> Haunter(93) -> Gengar(94)
  { from: 92, to: 93, requirements: { essences: { ghost_low: 8, poison_low: 4 }, levelRequired: 18 } },
  { from: 93, to: 94, requirements: { essences: { ghost_mid: 12, poison_mid: 6, magic_mid: 5 }, levelRequired: 30 } },

  // Growlithe(58) -> Arcanine(59)
  { from: 58, to: 59, requirements: { essences: { fire_mid: 12, magic_mid: 5 }, levelRequired: 20 } },

  // Poliwag(60) -> Poliwhirl(61) -> Poliwrath(62)
  { from: 60, to: 61, requirements: { essences: { water_low: 8, magic_low: 3 }, levelRequired: 18 } },
  { from: 61, to: 62, requirements: { essences: { water_mid: 10, fighting_mid: 6, magic_mid: 5 }, levelRequired: 30 } },

  // Jigglypuff(39) -> Wigglytuff(40)
  { from: 39, to: 40, requirements: { essences: { normal_mid: 10, magic_mid: 5 }, levelRequired: 20 } },

  // Eevee(133) -> Vaporeon(134) / Jolteon(135) / Flareon(136)
  { from: 133, to: 134, requirements: { essences: { water_mid: 15, magic_mid: 5 }, levelRequired: 20 } },
  { from: 133, to: 135, requirements: { essences: { electric_mid: 15, magic_mid: 5 }, levelRequired: 20 } },
  { from: 133, to: 136, requirements: { essences: { fire_mid: 15, magic_mid: 5 }, levelRequired: 20 } },

  // Dratini(147) -> Dragonair(148) -> Dragonite(149)
  { from: 147, to: 148, requirements: { essences: { dragon_low: 10, magic_low: 5 }, levelRequired: 18 } },
  { from: 148, to: 149, requirements: { essences: { dragon_mid: 15, flying_mid: 8, magic_high: 5 }, levelRequired: 30 } },
];

/**
 * Get all possible evolutions from a given template.
 * Returns multiple entries for branching evolutions (e.g. Eevee).
 */
export function getEvolutionsFrom(templateId: number): EvolutionChain[] {
  return EVOLUTION_CHAINS.filter(c => c.from === templateId);
}

/**
 * Check if a template can evolve at all.
 */
export function canEvolve(templateId: number): boolean {
  return EVOLUTION_CHAINS.some(c => c.from === templateId);
}

/**
 * Get the full evolution chain for a template (all connected IDs).
 */
export function getEvolutionLineage(templateId: number): number[] {
  // Find root
  let rootId = templateId;
  let parent = EVOLUTION_CHAINS.find(c => c.to === rootId);
  while (parent) {
    rootId = parent.from;
    parent = EVOLUTION_CHAINS.find(c => c.to === rootId);
  }

  // Walk forward
  const lineage: number[] = [rootId];
  let current = rootId;
  let next = EVOLUTION_CHAINS.find(c => c.from === current);
  while (next) {
    lineage.push(next.to);
    current = next.to;
    next = EVOLUTION_CHAINS.find(c => c.from === current);
  }
  return lineage;
}
