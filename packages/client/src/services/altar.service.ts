import type { PokemonInstance } from '@gatchamon/shared';
import {
  calculateFodderXp,
  canStarEvolve,
  MAX_SKILL_LEVEL,
  xpToNextLevel,
  MAX_LEVEL_BY_STARS,
  DITTO_TEMPLATE_ID,
  getEvolutionLineage,
} from '@gatchamon/shared';

export interface AltarValidation {
  valid: boolean;
  reason?: string;
}

export interface AltarPreview {
  totalXpGain: number;
  skillUps: number;
  willStarEvolve: boolean;
  willBecomeShiny: boolean;
  newStars: number;
  newLevel: number;
  newExp: number;
  skillUpResults: number[]; // indices of skills that would be upgraded (for display)
}

export function validateAltarFeed(
  base: PokemonInstance,
  fodder: PokemonInstance[],
): AltarValidation {
  if (fodder.length === 0) {
    return { valid: false, reason: 'Select at least one fodder monster' };
  }
  if (fodder.length > 5) {
    return { valid: false, reason: 'Cannot feed more than 5 monsters at once' };
  }
  for (const f of fodder) {
    if (f.instanceId === base.instanceId) {
      return { valid: false, reason: 'Cannot feed a monster to itself' };
    }
  }
  const ids = new Set(fodder.map(f => f.instanceId));
  if (ids.size !== fodder.length) {
    return { valid: false, reason: 'Duplicate fodder selected' };
  }
  return { valid: true };
}

export function previewAltarFeed(
  base: PokemonInstance,
  fodder: PokemonInstance[],
): AltarPreview {
  const fodderStars = fodder.map(f => f.stars);
  const willStarEvolve = canStarEvolve(base.level, base.stars, fodderStars);
  const newStars = willStarEvolve ? (base.stars + 1) as PokemonInstance['stars'] : base.stars;

  // Count same-family fodder for skill-ups (same species or pre/post-evolutions)
  const baseLineage = new Set(getEvolutionLineage(base.templateId));
  const sameSpeciesCount = fodder.filter(f => baseLineage.has(f.templateId) || f.templateId === DITTO_TEMPLATE_ID).length;
  const currentSkills = base.skillLevels ?? [1, 1, 1];
  const upgradableSlots = currentSkills.filter(l => l < MAX_SKILL_LEVEL).length;
  const skillUps = Math.min(sameSpeciesCount, upgradableSlots);

  // Shiny transfer: if any same-lineage fodder is shiny, base becomes shiny
  const willBecomeShiny = !base.isShiny && fodder.some(f => f.isShiny && baseLineage.has(f.templateId));

  // Calculate total XP
  let totalXpGain = 0;
  for (const f of fodder) {
    totalXpGain += calculateFodderXp(f.level, f.stars);
  }

  // Simulate level-ups
  let level = base.level;
  let exp = base.exp;
  const maxLevel = MAX_LEVEL_BY_STARS[newStars] ?? 99;

  exp += totalXpGain;
  while (level < maxLevel && exp >= xpToNextLevel(level)) {
    exp -= xpToNextLevel(level);
    level++;
  }
  if (level >= maxLevel) {
    level = maxLevel;
    exp = 0;
  }

  return {
    totalXpGain,
    skillUps,
    willStarEvolve,
    willBecomeShiny,
    newStars,
    newLevel: level,
    newExp: exp,
    skillUpResults: [],
  };
}
