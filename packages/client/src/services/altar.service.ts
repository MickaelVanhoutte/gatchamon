import type { PokemonInstance } from '@gatchamon/shared';
import {
  calculateFodderXp,
  canStarEvolve,
  isMaxLevel,
  MAX_SKILL_LEVEL,
  xpToNextLevel,
  MAX_LEVEL_BY_STARS,
  DITTO_TEMPLATE_ID,
} from '@gatchamon/shared';
import { loadCollection, saveCollection } from './storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from './reward.service';

export interface AltarValidation {
  valid: boolean;
  reason?: string;
}

export interface AltarPreview {
  totalXpGain: number;
  skillUps: number;
  willStarEvolve: boolean;
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

  // Count same-species fodder for skill-ups
  const sameSpeciesCount = fodder.filter(f => f.templateId === base.templateId || f.templateId === DITTO_TEMPLATE_ID).length;
  const currentSkills = base.skillLevels ?? [1, 1, 1];
  const upgradableSlots = currentSkills.filter(l => l < MAX_SKILL_LEVEL).length;
  const skillUps = Math.min(sameSpeciesCount, upgradableSlots);

  // Calculate total XP
  let totalXpGain = 0;
  for (const f of fodder) {
    totalXpGain += calculateFodderXp(f.level, f.stars);
  }

  // Simulate level-ups
  let level = willStarEvolve ? 1 : base.level;
  let exp = willStarEvolve ? 0 : base.exp;
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
    newStars,
    newLevel: level,
    newExp: exp,
    skillUpResults: [],
  };
}

export function performAltarFeed(
  baseInstanceId: string,
  fodderInstanceIds: string[],
): PokemonInstance {
  const collection = loadCollection();
  const baseIdx = collection.findIndex(p => p.instanceId === baseInstanceId);
  if (baseIdx === -1) throw new Error('Base monster not found');

  const base = collection[baseIdx];
  const fodder: PokemonInstance[] = [];
  for (const fid of fodderInstanceIds) {
    const f = collection.find(p => p.instanceId === fid);
    if (!f) throw new Error(`Fodder monster ${fid} not found`);
    fodder.push(f);
  }

  const validation = validateAltarFeed(base, fodder);
  if (!validation.valid) throw new Error(validation.reason);

  // 1. Calculate total XP
  let totalXpGain = 0;
  for (const f of fodder) {
    totalXpGain += calculateFodderXp(f.level, f.stars);
  }

  // 2. Apply skill-ups (same species fodder)
  const skillLevels: [number, number, number] = [...(base.skillLevels ?? [1, 1, 1])] as [number, number, number];
  for (const f of fodder) {
    if (f.templateId !== base.templateId && f.templateId !== DITTO_TEMPLATE_ID) continue;
    const upgradable = skillLevels
      .map((lvl, idx) => ({ lvl, idx }))
      .filter(s => s.lvl < MAX_SKILL_LEVEL);
    if (upgradable.length === 0) break;
    const pick = upgradable[Math.floor(Math.random() * upgradable.length)];
    skillLevels[pick.idx]++;
  }

  // 3. Star evolution
  const fodderStars = fodder.map(f => f.stars);
  const willStarEvolve = canStarEvolve(base.level, base.stars, fodderStars);
  const newStars = willStarEvolve ? (base.stars + 1) as PokemonInstance['stars'] : base.stars;

  // 4. Apply XP
  let level = willStarEvolve ? 1 : base.level;
  let exp = willStarEvolve ? 0 : base.exp;
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

  // 5. Update base monster
  collection[baseIdx] = {
    ...base,
    stars: newStars,
    level,
    exp,
    skillLevels,
  };

  // 6. Remove fodder (splice from highest index first to avoid shifting)
  const fodderIdSet = new Set(fodderInstanceIds);
  const remaining = collection.filter(p => !fodderIdSet.has(p.instanceId) || p.instanceId === baseInstanceId);
  saveCollection(remaining);

  // 7. Track rewards
  trackStat('totalMerges', fodder.length);
  incrementMission('merge_monster', fodder.length);
  checkAndUpdateTrophies();

  return remaining.find(p => p.instanceId === baseInstanceId)!;
}
