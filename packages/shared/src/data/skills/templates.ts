/**
 * Skill template factories.
 *
 * Most pokémon's skill triple is one of a small set of recurring shapes
 * (basic-with-status, multi-target-debuff, hp-threshold-passive, etc.).
 * Today every gen file (gen1.ts … gen9.ts plus the shiny variants) hand-writes
 * each of those shapes, which means a balance change to e.g. "passive that
 * triggers below 30% HP and grants atk_buff + recovery" requires editing the
 * same literal across thousands of lines.
 *
 * This file holds the factories. It is intentionally not yet wired into the
 * existing gen files — those are the source of truth for current balance and
 * will be migrated incrementally. Use these for new pokémon and reach for the
 * migration when a pattern needs a balance pass.
 */

import type { SkillDefinition, EffectId, PokemonType, SkillTarget } from '../../types/pokemon.js';

// ─── Basic attack with optional on-hit status ──────────────────────────────

export function createBasicWithStatus(opts: {
  id: string;
  name: string;
  type: PokemonType;
  status?: { id: EffectId; duration: number; chance: number };
  multiplier?: number;
}): SkillDefinition {
  const effects = opts.status
    ? [{ id: opts.status.id, value: 0, duration: opts.status.duration, chance: opts.status.chance }]
    : [];
  const desc = opts.status
    ? `A basic ${opts.type} attack that applies ${opts.status.id} for ${opts.status.duration} turn(s) (${opts.status.chance}% chance).`
    : `A basic ${opts.type} attack.`;
  return {
    id: opts.id,
    name: opts.name,
    description: desc,
    type: opts.type,
    category: 'basic',
    cooldown: 0,
    multiplier: opts.multiplier ?? 1,
    effects,
    target: 'single_enemy',
  };
}

// ─── HP-threshold passive (e.g. Overgrow / Blaze / Torrent) ────────────────

export function createHpThresholdPassive(opts: {
  id: string;
  name: string;
  type: PokemonType;
  buffs: EffectId[];
  duration?: number;
  hpBelow?: number;
  description?: string;
}): SkillDefinition {
  const duration = opts.duration ?? 2;
  const hpBelow = opts.hpBelow ?? 30;
  return {
    id: opts.id,
    name: opts.name,
    description: opts.description
      ?? `Passive: applies ${opts.buffs.join(' and ')} for ${duration} turn(s) to self when HP drops below ${hpBelow}%.`,
    type: opts.type,
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: opts.buffs.map(id => ({ id, value: 0, duration, chance: 100, target: 'self' as SkillTarget })),
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow },
  };
}

// ─── Multi-target attack with up to two debuffs ────────────────────────────

export function createMultiTargetDebuff(opts: {
  id: string;
  name: string;
  type: PokemonType;
  multiplier: number;
  cooldown?: number;
  debuffs: { id: EffectId; duration: number; chance: number }[];
}): SkillDefinition {
  return {
    id: opts.id,
    name: opts.name,
    description: `Attacks all enemies. ${opts.debuffs.map(d => `applies ${d.id} for ${d.duration} turn(s) (${d.chance}% chance)`).join(', ')}.`,
    type: opts.type,
    category: 'active',
    cooldown: opts.cooldown ?? 4,
    multiplier: opts.multiplier,
    effects: opts.debuffs.map(d => ({ id: d.id, value: 0, duration: d.duration, chance: d.chance })),
    target: 'all_enemies',
  };
}

/*
 * Example consumer (do NOT add to gen1.ts yet — wired here only as a
 * type-check sanity test):
 *
 *   const bulbasaur_skill3 = createHpThresholdPassive({
 *     id: 'bulbasaur_skill3',
 *     name: 'Overgrow',
 *     type: 'grass',
 *     buffs: ['atk_buff', 'recovery'],
 *   });
 */
