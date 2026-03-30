/**
 * Shared Battle Engine — Pure functions for combat resolution.
 * No I/O, no storage, no DB — only takes state and returns new state + logs.
 * Both client and server import from here.
 */

import type {
  BaseStats,
  PokemonTemplate,
  SkillDefinition,
  SkillEffect,
  EffectId,
  SkillTarget,
  PassiveTrigger,
  LegacyEffectType,
} from '../types/pokemon.js';
import type {
  BattleState,
  BattleMon,
  BattleLogEntry,
  ActiveEffect,
} from '../types/battle.js';
import { calculateDamage } from '../constants/formulas.js';
import {
  EFFECT_REGISTRY,
  getEffectMeta,
  isBuffEffect,
  isDebuffEffect,
  isInstantEffect,
  isStackable,
  isBeneficialEffect,
  isHarmfulEffect,
  MAX_DEBUFFS,
} from '../constants/effects.js';
import { getTemplate as getTemplateShared } from '../data/pokedex/index.js';
import { getSkillsForPokemon } from '../data/skills/index.js';
import { getSkillMultiplierBonus } from '../constants/formulas.js';

// ---------------------------------------------------------------------------
// Legacy compatibility — map old skill effects to new EffectId system
// ---------------------------------------------------------------------------

function resolveEffectId(effect: SkillEffect): EffectId {
  if (effect.id) return effect.id;

  // Map legacy type+stat to new EffectId
  switch (effect.type) {
    case 'buff':
      if (effect.stat === 'atk') return 'atk_buff';
      if (effect.stat === 'def') return 'def_buff';
      if (effect.stat === 'spd') return 'spd_buff';
      if (effect.stat === 'critRate') return 'crit_rate_buff';
      if (effect.stat === 'hp') return 'recovery';  // Legacy HP buff → recovery
      if (effect.stat === 'res') return 'def_buff';  // Legacy res buff → def buff
      return 'atk_buff';
    case 'debuff':
      if (effect.stat === 'atk') return 'atk_break';
      if (effect.stat === 'def') return 'def_break';
      if (effect.stat === 'spd') return 'spd_slow';
      if (effect.stat === 'acc') return 'glancing';
      if (effect.stat === 'res') return 'def_break';
      return 'atk_break';
    case 'dot':
      return 'poison';
    case 'stun':
      return 'freeze';
    case 'heal':
      return 'heal';
    default:
      return 'atk_buff';
  }
}

/** Normalize a skill effect to always have an EffectId */
function normalizeEffect(effect: SkillEffect): SkillEffect & { id: EffectId } {
  return { ...effect, id: resolveEffectId(effect) };
}

/**
 * Infer the correct default target for an effect when no explicit effect.target is set.
 * Beneficial effects on offensive skills default to 'self' (not the enemy).
 * Harmful effects on support/self skills default to 'all_enemies' (not allies).
 */
function inferEffectTarget(effectId: EffectId, skillTarget: SkillTarget): SkillTarget {
  const isSkillOffensive = skillTarget === 'single_enemy' || skillTarget === 'all_enemies';
  if (isBeneficialEffect(effectId) && isSkillOffensive) {
    return 'self';
  }
  if (isHarmfulEffect(effectId) && !isSkillOffensive) {
    return 'all_enemies';
  }
  return skillTarget;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTemplate(templateId: number): PokemonTemplate {
  const t = getTemplateShared(templateId);
  if (!t) throw new Error(`Unknown templateId ${templateId}`);
  return t;
}

export function allDead(team: BattleMon[]): boolean {
  return team.every(m => !m.isAlive);
}

function trackHeal(state: BattleState, monId: string, amount: number): void {
  if (amount <= 0) return;
  if (!state.recap) state.recap = {};
  if (!state.recap[monId]) state.recap[monId] = { hpHealed: 0 };
  state.recap[monId].hpHealed += amount;
}

// ---------------------------------------------------------------------------
// Effect application
// ---------------------------------------------------------------------------

/** Check if a mon has a specific buff */
export function hasBuff(mon: BattleMon, id: EffectId): boolean {
  return mon.buffs.some(b => b.id === id && b.remainingTurns > 0);
}

/** Check if a mon has a specific debuff/status */
export function hasDebuff(mon: BattleMon, id: EffectId): boolean {
  return mon.debuffs.some(d => d.id === id && d.remainingTurns > 0);
}

/** Count stacks of a stackable effect */
function countStacks(mon: BattleMon, id: EffectId): number {
  return mon.debuffs.filter(d => d.id === id && d.remainingTurns > 0).length;
}

/** Apply a buff to a monster, respecting uniqueness and buff_block */
function applyBuff(mon: BattleMon, id: EffectId, duration: number, value: number, sourceId?: string): boolean {
  // Check buff_block
  if (hasDebuff(mon, 'buff_block')) return false;

  const meta = getEffectMeta(id);
  if (meta.unique) {
    // Replace existing (refresh duration)
    const existing = mon.buffs.find(b => b.id === id);
    if (existing) {
      existing.remainingTurns = Math.max(existing.remainingTurns, duration);
      existing.value = value;
      return true;
    }
  } else if (meta.maxStacks) {
    const currentStacks = mon.buffs.filter(b => b.id === id).length;
    if (currentStacks >= meta.maxStacks) return false;
  }

  mon.buffs.push({ id, type: 'buff', value, remainingTurns: duration, sourceId });
  return true;
}

/** Apply a debuff/status to a monster, respecting immunity and max debuffs */
function applyDebuff(mon: BattleMon, id: EffectId, duration: number, value: number, sourceId?: string): boolean {
  // Check immunity
  if (hasBuff(mon, 'immunity')) return false;

  // Check max debuffs
  if (mon.debuffs.length >= MAX_DEBUFFS) return false;

  const meta = getEffectMeta(id);
  if (meta.unique) {
    // Replace existing (refresh duration)
    const existing = mon.debuffs.find(d => d.id === id);
    if (existing) {
      existing.remainingTurns = Math.max(existing.remainingTurns, duration);
      existing.value = value;
      existing.sourceId = sourceId;
      return true;
    }
  } else if (meta.maxStacks) {
    const currentStacks = mon.debuffs.filter(d => d.id === id).length;
    if (currentStacks >= meta.maxStacks) return false;
  }

  mon.debuffs.push({ id, type: 'debuff', value, remainingTurns: duration, sourceId });
  return true;
}

/** Accuracy vs Resistance check (SW formula) */
function resistCheck(attackerAcc: number, defenderRes: number): boolean {
  const landChance = Math.max(15, 100 - Math.max(0, defenderRes - attackerAcc));
  return Math.random() * 100 < landChance;
}

// ---------------------------------------------------------------------------
// Effective stats (percentage-based modifiers)
// ---------------------------------------------------------------------------

export function getEffectiveStats(mon: BattleMon): BaseStats {
  const stats = { ...mon.stats };

  // Collect percentage modifiers per stat
  let atkMod = 0;
  let defMod = 0;
  let spdMod = 0;
  let critRateMod = 0;

  // Process buffs
  for (const effect of mon.buffs) {
    const meta = EFFECT_REGISTRY[effect.id];
    if (!meta?.statMod) continue;
    const pct = meta.statMod.perStack ? meta.statMod.percent : meta.statMod.percent;
    switch (meta.statMod.stat) {
      case 'atk': atkMod += pct; break;
      case 'def': defMod += pct; break;
      case 'spd': spdMod += pct; break;
      case 'critRate': critRateMod += pct; break;
    }
  }

  // Process debuffs (including status effects like burn)
  for (const effect of mon.debuffs) {
    const meta = EFFECT_REGISTRY[effect.id];
    if (!meta?.statMod) continue;
    if (meta.statMod.perStack) {
      // Stackable: count stacks
      const stacks = countStacks(mon, effect.id);
      switch (meta.statMod.stat) {
        case 'atk': atkMod += meta.statMod.percent * stacks; break;
        case 'def': defMod += meta.statMod.percent * stacks; break;
        case 'spd': spdMod += meta.statMod.percent * stacks; break;
        case 'critRate': critRateMod += meta.statMod.percent * stacks; break;
      }
      // Only count once for stackable (we processed all stacks)
      break;
    } else {
      switch (meta.statMod.stat) {
        case 'atk': atkMod += meta.statMod.percent; break;
        case 'def': defMod += meta.statMod.percent; break;
        case 'spd': spdMod += meta.statMod.percent; break;
        case 'critRate': critRateMod += meta.statMod.percent; break;
      }
    }
  }

  // Apply percentage modifiers
  stats.atk = Math.max(1, Math.floor(stats.atk * (1 + atkMod / 100)));
  stats.def = Math.max(1, Math.floor(stats.def * (1 + defMod / 100)));
  stats.spd = Math.max(1, Math.floor(stats.spd * (1 + spdMod / 100)));
  stats.critRate = Math.max(0, Math.floor(stats.critRate + critRateMod));
  stats.hp = Math.max(1, stats.hp);

  return stats;
}

// ---------------------------------------------------------------------------
// CC (crowd control) checks
// ---------------------------------------------------------------------------

export type CCResult =
  | { type: 'none' }
  | { type: 'stun'; reason: 'freeze' | 'sleep' }
  | { type: 'skip'; reason: 'paralysis_skip' }
  | { type: 'cd_increase'; reason: 'paralysis_cd' }
  | { type: 'confusion' }
  | { type: 'provoke'; targetId: string }
  | { type: 'silence' };

export function getCCState(mon: BattleMon): CCResult {
  // Hard CC — full stun (freeze, sleep)
  if (hasDebuff(mon, 'freeze')) return { type: 'stun', reason: 'freeze' };
  if (hasDebuff(mon, 'sleep')) return { type: 'stun', reason: 'sleep' };

  // Paralysis — 50/50
  if (hasDebuff(mon, 'paralysis')) {
    if (Math.random() < 0.5) {
      return { type: 'skip', reason: 'paralysis_skip' };
    } else {
      return { type: 'cd_increase', reason: 'paralysis_cd' };
    }
  }

  // Provoke — must attack provoker with basic
  const provokeEffect = mon.debuffs.find(d => d.id === 'provoke' && d.remainingTurns > 0);
  if (provokeEffect && provokeEffect.sourceId) {
    return { type: 'provoke', targetId: provokeEffect.sourceId };
  }

  // Silence — can only use basic attack
  if (hasDebuff(mon, 'silence')) return { type: 'silence' };

  // Confusion — 50% redirect (handled during skill resolution)
  if (hasDebuff(mon, 'confusion')) {
    if (Math.random() < 0.5) return { type: 'confusion' };
  }

  return { type: 'none' };
}

// ---------------------------------------------------------------------------
// Turn order — action gauge simulation
// ---------------------------------------------------------------------------

export function advanceToNextActor(state: BattleState): string {
  const allMons = [...state.playerTeam, ...state.enemyTeam].filter(m => m.isAlive);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const mon of allMons) {
      const effectiveStats = getEffectiveStats(mon);
      mon.actionGauge += effectiveStats.spd;
    }
    const ready = allMons
      .filter(m => m.actionGauge >= 1000)
      .sort((a, b) => b.actionGauge - a.actionGauge);

    if (ready.length > 0) {
      const actor = ready[0];
      actor.actionGauge = 0;
      return actor.instanceId;
    }
  }
}

// ---------------------------------------------------------------------------
// Start of turn processing
// ---------------------------------------------------------------------------

export function processStartOfTurn(mon: BattleMon, state: BattleState): string[] {
  const effects: string[] = [];
  const template = getTemplate(mon.templateId);
  const hasInvincibility = hasBuff(mon, 'invincibility');
  const hasUnrecoverable = hasDebuff(mon, 'unrecoverable');

  // 1. Process Recovery (HoT) buff
  if (hasBuff(mon, 'recovery') && !hasUnrecoverable) {
    const healAmt = Math.floor(mon.maxHp * 0.15);
    const oldHp = mon.currentHp;
    mon.currentHp = Math.min(mon.maxHp, mon.currentHp + healAmt);
    const healed = mon.currentHp - oldHp;
    trackHeal(state, mon.instanceId, healed);
    if (healed > 0) {
      effects.push(`${template.name} recovered ${healed} HP (Recovery)`);
    }
  }

  // 2. Process Sleep heal
  if (hasDebuff(mon, 'sleep') && !hasUnrecoverable) {
    const healAmt = Math.floor(mon.maxHp * 0.10);
    const oldHp = mon.currentHp;
    mon.currentHp = Math.min(mon.maxHp, mon.currentHp + healAmt);
    const healed = mon.currentHp - oldHp;
    trackHeal(state, mon.instanceId, healed);
    if (healed > 0) {
      effects.push(`${template.name} recovered ${healed} HP while sleeping`);
    }
  }

  // 3. Process Poison DoT (blocked by invincibility)
  if (!hasInvincibility) {
    const poisonStacks = mon.debuffs.filter(d => d.id === 'poison' && d.remainingTurns > 0).length;
    if (poisonStacks > 0) {
      const dotDmg = Math.floor(mon.maxHp * 0.05 * poisonStacks);
      mon.currentHp = Math.max(0, mon.currentHp - dotDmg);
      effects.push(`${template.name} takes ${dotDmg} poison damage (${poisonStacks} stacks)`);
      if (mon.currentHp <= 0) {
        // Check endure
        if (hasBuff(mon, 'endure')) {
          mon.currentHp = 1;
          effects.push(`${template.name} endured!`);
        } else {
          mon.isAlive = false;
          effects.push(`${template.name} fainted from poison!`);
        }
      }
    }
  }

  // 4. Process Burn DoT (blocked by invincibility)
  if (!hasInvincibility) {
    const burnStacks = mon.debuffs.filter(d => d.id === 'burn' && d.remainingTurns > 0).length;
    if (burnStacks > 0) {
      const dotDmg = Math.floor(mon.maxHp * 0.03 * burnStacks);
      mon.currentHp = Math.max(0, mon.currentHp - dotDmg);
      effects.push(`${template.name} takes ${dotDmg} burn damage (${burnStacks} stacks)`);
      if (mon.currentHp <= 0) {
        if (hasBuff(mon, 'endure')) {
          mon.currentHp = 1;
          effects.push(`${template.name} endured!`);
        } else {
          mon.isAlive = false;
          effects.push(`${template.name} fainted from burn!`);
        }
      }
    }
  }

  // 5. Tick all buff/debuff durations
  for (const buff of mon.buffs) {
    if (buff.remainingTurns < 999) buff.remainingTurns--;
  }
  for (const debuff of mon.debuffs) {
    if (debuff.remainingTurns < 999) debuff.remainingTurns--;
  }

  // 6. Remove expired effects
  mon.buffs = mon.buffs.filter(b => b.remainingTurns > 0);
  mon.debuffs = mon.debuffs.filter(d => d.remainingTurns > 0);

  return effects;
}

// ---------------------------------------------------------------------------
// Passive trigger processing
// ---------------------------------------------------------------------------

export function processPassiveTrigger(
  trigger: PassiveTrigger,
  mon: BattleMon,
  state: BattleState,
  context?: {
    targetMon?: BattleMon;
    wasCrit?: boolean;
    killedTarget?: boolean;
  },
): string[] {
  const effects: string[] = [];
  if (!mon.isAlive) return effects;

  // Check oblivion — disables passives
  if (hasDebuff(mon, 'oblivion')) return effects;

  const template = getTemplate(mon.templateId);
  const skills = getSkillsForPokemon(template.skillIds);

  for (const skill of skills) {
    if (skill.category !== 'passive') continue;
    if (!skill.passiveTrigger || skill.passiveTrigger !== trigger) continue;

    // Check conditions
    if (skill.passiveCondition?.hpBelow) {
      const hpPct = (mon.currentHp / mon.maxHp) * 100;
      if (hpPct >= skill.passiveCondition.hpBelow) continue;
    }

    // Resolve passive effects
    for (const rawEffect of skill.effects) {
      const effect = normalizeEffect(rawEffect);
      const roll = Math.random() * 100;
      if (roll >= effect.chance) continue;

      // Determine targets for this effect
      const effectTarget = effect.target || inferEffectTarget(effect.id, skill.target);
      let targets: BattleMon[];

      if (effectTarget === 'self') {
        targets = [mon];
      } else if (effectTarget === 'all_allies') {
        const team = mon.isPlayerOwned ? state.playerTeam : state.enemyTeam;
        targets = team.filter(m => m.isAlive);
      } else if (effectTarget === 'all_enemies') {
        const team = mon.isPlayerOwned ? state.enemyTeam : state.playerTeam;
        targets = team.filter(m => m.isAlive);
      } else if (effectTarget === 'single_enemy' && context?.targetMon) {
        targets = [context.targetMon];
      } else {
        targets = [mon];
      }

      for (const target of targets) {
        const result = applySingleEffect(effect, mon, target, state);
        if (result) {
          effects.push(`[${skill.name}] ${result}`);
        }
      }
    }
  }

  return effects;
}

// ---------------------------------------------------------------------------
// Apply passives at battle start (legacy support + battle_start trigger)
// ---------------------------------------------------------------------------

export function applyPassives(state: BattleState): void {
  const allMons = [...state.playerTeam, ...state.enemyTeam];
  for (const mon of allMons) {
    const template = getTemplate(mon.templateId);
    const skills = getSkillsForPokemon(template.skillIds);
    for (const skill of skills) {
      if (skill.category !== 'passive') continue;

      // Handle both legacy passives (no passiveTrigger) and battle_start passives
      const trigger = skill.passiveTrigger || 'battle_start';
      if (trigger !== 'battle_start' && trigger !== 'always') continue;

      for (const rawEffect of skill.effects) {
        const effect = normalizeEffect(rawEffect);
        const roll = Math.random() * 100;
        if (roll >= effect.chance) continue;

        const effectTarget = effect.target || inferEffectTarget(effect.id, skill.target);
        let targets: BattleMon[];
        if (effectTarget === 'self') {
          targets = [mon];
        } else if (effectTarget === 'all_allies') {
          targets = mon.isPlayerOwned
            ? state.playerTeam.filter(m => m.isAlive)
            : state.enemyTeam.filter(m => m.isAlive);
        } else if (effectTarget === 'all_enemies') {
          targets = mon.isPlayerOwned
            ? state.enemyTeam.filter(m => m.isAlive)
            : state.playerTeam.filter(m => m.isAlive);
        } else {
          targets = [mon];
        }

        for (const target of targets) {
          // For 'always' passives, use duration 999
          const duration = trigger === 'always' ? 999 : effect.duration;
          applyEffectToTarget(effect.id, target, duration, effect.value, mon.instanceId);
        }
      }
    }
  }
}

/** Low-level effect application (buff or debuff) */
function applyEffectToTarget(id: EffectId, target: BattleMon, duration: number, value: number, sourceId?: string): boolean {
  if (isBuffEffect(id)) {
    return applyBuff(target, id, duration, value, sourceId);
  } else if (isDebuffEffect(id)) {
    return applyDebuff(target, id, duration, value, sourceId);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Single effect application (during skill resolution)
// ---------------------------------------------------------------------------

function applySingleEffect(
  rawEffect: SkillEffect,
  actor: BattleMon,
  target: BattleMon,
  state: BattleState,
): string | null {
  const effect = normalizeEffect(rawEffect);
  const targetTemplate = getTemplate(target.templateId);
  const meta = getEffectMeta(effect.id);

  if (isInstantEffect(effect.id)) {
    return applyInstantEffect(effect, actor, target, state);
  }

  if (isBuffEffect(effect.id)) {
    const success = applyBuff(target, effect.id, effect.duration, effect.value, actor.instanceId);
    if (success) {
      return `${targetTemplate.name} gained ${meta.name} (${effect.duration} turns)`;
    }
    if (hasDebuff(target, 'buff_block')) {
      return `${targetTemplate.name}'s buffs are blocked!`;
    }
    return null;
  }

  // Debuff/status — needs acc/res check
  if (isDebuffEffect(effect.id)) {
    if (!target.isAlive) return null;

    // Immunity blocks all debuffs
    if (hasBuff(target, 'immunity')) {
      return `${targetTemplate.name} is immune!`;
    }

    // Accuracy vs Resistance check
    const attackerStats = getEffectiveStats(actor);
    const defenderStats = getEffectiveStats(target);
    if (!resistCheck(attackerStats.acc, defenderStats.res)) {
      return `${targetTemplate.name} resisted ${meta.name}!`;
    }

    const success = applyDebuff(target, effect.id, effect.duration, effect.value, actor.instanceId);
    if (success) {
      return `${targetTemplate.name} got ${meta.name} (${effect.duration} turns)`;
    }
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Instant effect resolution
// ---------------------------------------------------------------------------

function applyInstantEffect(
  rawEffect: SkillEffect & { id: EffectId },
  actor: BattleMon,
  target: BattleMon,
  state: BattleState,
): string | null {
  const effect = rawEffect;
  const targetTemplate = getTemplate(target.templateId);

  switch (effect.id) {
    case 'heal': {
      if (hasDebuff(target, 'unrecoverable')) {
        return `${targetTemplate.name} cannot be healed!`;
      }
      const healAmount = Math.floor(target.maxHp * (effect.value / 100));
      const oldHp = target.currentHp;
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
      const healed = target.currentHp - oldHp;
      trackHeal(state, target.instanceId, healed);
      return healed > 0 ? `${targetTemplate.name} healed ${healed} HP` : null;
    }

    case 'atb_boost': {
      const boostAmount = Math.floor(1000 * (effect.value / 100));
      target.actionGauge = Math.min(1000, target.actionGauge + boostAmount);
      return `${targetTemplate.name}'s ATB increased by ${effect.value}%`;
    }

    case 'atb_reduce': {
      // Acc/res check for ATB reduce (it's harmful)
      if (hasBuff(target, 'immunity')) {
        return `${targetTemplate.name} is immune to ATB reduction!`;
      }
      const attackerStats = getEffectiveStats(actor);
      const defenderStats = getEffectiveStats(target);
      if (!resistCheck(attackerStats.acc, defenderStats.res)) {
        return `${targetTemplate.name} resisted ATB reduction!`;
      }
      const reduceAmount = Math.floor(1000 * (effect.value / 100));
      target.actionGauge = Math.max(0, target.actionGauge - reduceAmount);
      return `${targetTemplate.name}'s ATB decreased by ${effect.value}%`;
    }

    case 'cd_reset': {
      for (const skId of Object.keys(target.skillCooldowns)) {
        target.skillCooldowns[skId] = 0;
      }
      return `${targetTemplate.name}'s cooldowns reset!`;
    }

    case 'cd_reduce': {
      for (const skId of Object.keys(target.skillCooldowns)) {
        target.skillCooldowns[skId] = Math.max(0, target.skillCooldowns[skId] - effect.value);
      }
      return `${targetTemplate.name}'s cooldowns reduced by ${effect.value}`;
    }

    case 'cd_increase': {
      if (hasBuff(target, 'immunity')) {
        return `${targetTemplate.name} is immune to CD increase!`;
      }
      const attackerStats = getEffectiveStats(actor);
      const defenderStats = getEffectiveStats(target);
      if (!resistCheck(attackerStats.acc, defenderStats.res)) {
        return `${targetTemplate.name} resisted CD increase!`;
      }
      for (const skId of Object.keys(target.skillCooldowns)) {
        target.skillCooldowns[skId] += effect.value;
      }
      return `${targetTemplate.name}'s cooldowns increased by ${effect.value}`;
    }

    case 'strip': {
      const count = Math.min(effect.value, target.buffs.length);
      if (count === 0) return null;
      // Remove random buffs
      for (let i = 0; i < count; i++) {
        if (target.buffs.length === 0) break;
        const idx = Math.floor(Math.random() * target.buffs.length);
        const removed = target.buffs.splice(idx, 1)[0];
      }
      return `${targetTemplate.name} lost ${count} buff(s)!`;
    }

    case 'cleanse': {
      const count = Math.min(effect.value, target.debuffs.length);
      if (count === 0) return null;
      // Remove random debuffs
      for (let i = 0; i < count; i++) {
        if (target.debuffs.length === 0) break;
        const idx = Math.floor(Math.random() * target.debuffs.length);
        target.debuffs.splice(idx, 1);
      }
      return `${targetTemplate.name} cleansed ${count} debuff(s)!`;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Skill resolution
// ---------------------------------------------------------------------------

export function resolveSkill(
  actor: BattleMon,
  skill: SkillDefinition,
  targets: BattleMon[],
  state: BattleState,
): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  const actorTemplate = getTemplate(actor.templateId);
  const attackerStats = getEffectiveStats(actor);

  // Apply skill level multiplier bonus
  const skillIndex = actorTemplate.skillIds.indexOf(skill.id);
  const skillLevel = actor.skillLevels?.[skillIndex] ?? 1;
  const levelBonus = getSkillMultiplierBonus(skillLevel);
  const effectiveSkill = skill.multiplier > 0
    ? { ...skill, multiplier: skill.multiplier * levelBonus }
    : skill;

  // Check glancing on attacker
  const hasGlancing = hasDebuff(actor, 'glancing');
  const isGlancingHit = hasGlancing && Math.random() < 0.5;

  for (const target of targets) {
    const targetTemplate = getTemplate(target.templateId);
    let damage = 0;
    let isCrit = false;
    let effectiveness = 1;
    let isGlancing = false;
    let shieldAbsorbed = 0;
    let reflected = 0;
    let endured = false;
    let vampireHealed = 0;
    const appliedEffects: string[] = [];

    const isOffensive = effectiveSkill.target === 'single_enemy' || effectiveSkill.target === 'all_enemies';

    if (isOffensive && effectiveSkill.multiplier > 0) {
      // Calculate base damage
      const result = calculateDamage(
        attackerStats,
        getEffectiveStats(target),
        effectiveSkill,
        actorTemplate.types,
        targetTemplate.types,
      );
      damage = result.damage;
      isCrit = result.isCrit;
      effectiveness = result.effectiveness;

      // Glancing hit: 30% less damage, no crit, no debuff application
      if (isGlancingHit && isOffensive) {
        damage = Math.floor(damage * 0.7);
        isCrit = false;
        isGlancing = true;
        appliedEffects.push('Glancing hit!');
      }

      // Brand: +25% damage
      if (isOffensive && hasDebuff(target, 'brand')) {
        damage = Math.floor(damage * 1.25);
      }

      // Invincibility: 0 damage
      if (isOffensive && hasBuff(target, 'invincibility')) {
        damage = 0;
        appliedEffects.push('Blocked by Invincibility!');
      }

      // Shield absorption
      if (isOffensive && damage > 0) {
        const shields = target.buffs.filter(b => b.id === 'shield');
        for (const shield of shields) {
          if (damage <= 0) break;
          const absorbed = Math.min(damage, shield.value);
          shield.value -= absorbed;
          damage -= absorbed;
          shieldAbsorbed += absorbed;
          if (shield.value <= 0) {
            // Remove depleted shield
            target.buffs = target.buffs.filter(b => b !== shield);
          }
        }
        if (shieldAbsorbed > 0) {
          appliedEffects.push(`Shield absorbed ${shieldAbsorbed} damage`);
        }
      }

      // Apply damage
      if (damage > 0) {
        target.currentHp = Math.max(0, target.currentHp - damage);

        // Endure: HP cannot drop below 1
        if (target.currentHp <= 0 && hasBuff(target, 'endure')) {
          target.currentHp = 1;
          endured = true;
          // Consume endure buff
          target.buffs = target.buffs.filter(b => b.id !== 'endure');
          appliedEffects.push(`${targetTemplate.name} endured!`);
        }

        if (target.currentHp <= 0) {
          target.isAlive = false;
          appliedEffects.push(`${targetTemplate.name} fainted!`);
        }
      }

      // Reflect: return 30% damage to attacker
      if (isOffensive && hasBuff(target, 'reflect') && damage > 0) {
        reflected = Math.floor((damage + shieldAbsorbed) * 0.3);
        actor.currentHp = Math.max(0, actor.currentHp - reflected);
        appliedEffects.push(`${actorTemplate.name} took ${reflected} reflected damage`);
        if (actor.currentHp <= 0) {
          if (hasBuff(actor, 'endure')) {
            actor.currentHp = 1;
            actor.buffs = actor.buffs.filter(b => b.id !== 'endure');
          } else {
            actor.isAlive = false;
            appliedEffects.push(`${actorTemplate.name} fainted from reflect!`);
          }
        }
      }

      // Vampire: heal 20% of damage dealt
      if (isOffensive && hasBuff(actor, 'vampire') && damage > 0) {
        if (!hasDebuff(actor, 'unrecoverable')) {
          vampireHealed = Math.floor((damage + shieldAbsorbed) * 0.2);
          actor.currentHp = Math.min(actor.maxHp, actor.currentHp + vampireHealed);
          trackHeal(state, actor.instanceId, vampireHealed);
        }
      }
    }

    // Apply skill effects
    // Glancing hit blocks debuff application on offensive skills
    const canApplyDebuffs = !isGlancing;

    for (const rawEffect of skill.effects) {
      const effect = normalizeEffect(rawEffect);
      const roll = Math.random() * 100;
      if (roll >= effect.chance) continue;

      const effectMeta = getEffectMeta(effect.id);

      // Determine the target for this effect
      const effectTarget = effect.target || inferEffectTarget(effect.id, skill.target);
      let effectTargets: BattleMon[];

      if (effectTarget === 'self') {
        effectTargets = [actor];
      } else if (effectTarget === 'all_allies') {
        const team = actor.isPlayerOwned ? state.playerTeam : state.enemyTeam;
        effectTargets = team.filter(m => m.isAlive);
      } else if (effectTarget === 'all_enemies') {
        const team = actor.isPlayerOwned ? state.enemyTeam : state.playerTeam;
        effectTargets = team.filter(m => m.isAlive);
      } else if (effectTarget === 'single_ally') {
        effectTargets = [target]; // Context-dependent
      } else {
        effectTargets = [target];
      }

      for (const et of effectTargets) {
        // Skip debuff application if glancing
        if (isDebuffEffect(effect.id) && !canApplyDebuffs) {
          appliedEffects.push(`${getTemplate(et.templateId).name} avoided ${effectMeta.name} (glancing)`);
          continue;
        }

        const result = applySingleEffect(effect, actor, et, state);
        if (result) appliedEffects.push(result);
      }
    }

    // Trigger counter if target has counter buff and was hit by offensive skill
    if (isOffensive && target.isAlive && hasBuff(target, 'counter') && damage > 0) {
      const counterResult = resolveCounterAttack(target, actor, state);
      if (counterResult) appliedEffects.push(counterResult);
    }

    // Trigger on_hit passive for target
    if (isOffensive && target.isAlive && damage > 0) {
      const hitEffects = processPassiveTrigger('on_hit', target, state, { targetMon: actor });
      appliedEffects.push(...hitEffects);
    }

    // Trigger on_attack passive for actor
    if (isOffensive) {
      const attackEffects = processPassiveTrigger('on_attack', actor, state, { targetMon: target });
      appliedEffects.push(...attackEffects);
    }

    // Trigger on_crit passive
    if (isCrit && isOffensive) {
      const critEffects = processPassiveTrigger('on_crit', actor, state, { targetMon: target });
      appliedEffects.push(...critEffects);
    }

    // Trigger on_kill passive
    if (!target.isAlive) {
      const killEffects = processPassiveTrigger('on_kill', actor, state, { killedTarget: true });
      appliedEffects.push(...killEffects);

      // Trigger on_ally_death for allies of the dead target
      const deadTeam = target.isPlayerOwned ? state.playerTeam : state.enemyTeam;
      for (const ally of deadTeam.filter(m => m.isAlive && m.instanceId !== target.instanceId)) {
        const deathEffects = processPassiveTrigger('on_ally_death', ally, state);
        appliedEffects.push(...deathEffects);
      }
    }

    // Trigger hp_threshold passive for target
    if (isOffensive && target.isAlive) {
      const hpEffects = processPassiveTrigger('hp_threshold', target, state);
      appliedEffects.push(...hpEffects);
    }

    logs.push({
      turn: state.turnNumber,
      actorId: actor.instanceId,
      actorName: actorTemplate.name,
      skillUsed: skill.id,
      skillName: skill.name,
      targetId: target.instanceId,
      targetName: targetTemplate.name,
      damage,
      isCrit,
      effectiveness,
      effects: appliedEffects,
      isGlancing,
      shieldAbsorbed,
      reflected,
      endured,
    });
  }

  // Set cooldown for the skill
  if (skill.cooldown > 0) {
    actor.skillCooldowns[skill.id] = skill.cooldown;
  }

  // Tick all cooldowns for this actor
  for (const skId of Object.keys(actor.skillCooldowns)) {
    if (skId !== skill.id && actor.skillCooldowns[skId] > 0) {
      actor.skillCooldowns[skId]--;
    }
  }

  return logs;
}

// ---------------------------------------------------------------------------
// Counter attack resolution
// ---------------------------------------------------------------------------

function resolveCounterAttack(
  counterMon: BattleMon,
  attacker: BattleMon,
  state: BattleState,
): string | null {
  if (!counterMon.isAlive || !attacker.isAlive) return null;

  const template = getTemplate(counterMon.templateId);
  const skills = getSkillsForPokemon(template.skillIds);
  const basicSkill = skills.find(s => s.category === 'basic');
  if (!basicSkill) return null;

  const counterStats = getEffectiveStats(counterMon);
  const targetStats = getEffectiveStats(attacker);
  const attackerTemplate = getTemplate(attacker.templateId);

  const result = calculateDamage(
    counterStats,
    targetStats,
    basicSkill,
    template.types,
    attackerTemplate.types,
  );

  const counterDmg = Math.floor(result.damage * 0.75); // Counter does 75% damage
  attacker.currentHp = Math.max(0, attacker.currentHp - counterDmg);
  if (attacker.currentHp <= 0) {
    if (hasBuff(attacker, 'endure')) {
      attacker.currentHp = 1;
      attacker.buffs = attacker.buffs.filter(b => b.id !== 'endure');
    } else {
      attacker.isAlive = false;
    }
  }

  return `${template.name} counter-attacked for ${counterDmg} damage!`;
}

// ---------------------------------------------------------------------------
// AI logic
// ---------------------------------------------------------------------------

export function pickEnemyAction(
  actor: BattleMon,
  state: BattleState,
): { skill: SkillDefinition; targets: BattleMon[] } {
  const template = getTemplate(actor.templateId);
  const skills = getSkillsForPokemon(template.skillIds).filter(s => s.category !== 'passive');

  let chosenSkill: SkillDefinition | null = null;
  for (let i = skills.length - 1; i >= 0; i--) {
    const sk = skills[i];
    if ((actor.skillCooldowns[sk.id] ?? 0) <= 0) {
      chosenSkill = sk;
      break;
    }
  }
  if (!chosenSkill) {
    chosenSkill = skills[0];
  }

  let targets: BattleMon[];
  if (chosenSkill.target === 'self') {
    targets = [actor];
  } else if (chosenSkill.target === 'single_ally' || chosenSkill.target === 'all_allies') {
    targets = chosenSkill.target === 'all_allies'
      ? state.enemyTeam.filter(m => m.isAlive)
      : [actor];
  } else if (chosenSkill.target === 'all_enemies') {
    targets = state.playerTeam.filter(m => m.isAlive);
  } else {
    // single_enemy — target player mon with lowest HP%
    const alive = state.playerTeam.filter(m => m.isAlive);
    alive.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
    targets = [alive[0]];
  }

  return { skill: chosenSkill, targets };
}

// ---------------------------------------------------------------------------
// Check battle end
// ---------------------------------------------------------------------------

export function checkBattleEnd(state: BattleState): void {
  if (allDead(state.enemyTeam)) {
    (state as any).status = 'victory';
  } else if (allDead(state.playerTeam)) {
    (state as any).status = 'defeat';
  }
}

// ---------------------------------------------------------------------------
// Auto-resolve enemy turns
// ---------------------------------------------------------------------------

export function autoResolveEnemyTurns(state: BattleState): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];

  while (state.status === 'active') {
    const nextActorId = advanceToNextActor(state);
    const allMons = [...state.playerTeam, ...state.enemyTeam];
    const actor = allMons.find(m => m.instanceId === nextActorId);
    if (!actor) break;

    // If next actor is a player mon, set it as current and stop
    if (actor.isPlayerOwned) {
      state.currentActorId = actor.instanceId;
      break;
    }

    // Enemy turn
    state.turnNumber++;

    // Prevent infinite loops (heal/endure/reflect stalls)
    if (state.turnNumber > 500) {
      (state as any).status = 'defeat';
      break;
    }

    // Trigger turn_start passives
    const turnStartEffects = processPassiveTrigger('turn_start', actor, state);
    const turnEffects = processStartOfTurn(actor, state);
    const allTurnEffects = [...turnStartEffects, ...turnEffects];

    if (!actor.isAlive) {
      checkBattleEnd(state);
      continue;
    }

    // Check CC
    const cc = getCCState(actor);
    const template = getTemplate(actor.templateId);

    if (cc.type === 'stun') {
      logs.push({
        turn: state.turnNumber,
        actorId: actor.instanceId,
        actorName: template.name,
        skillUsed: '',
        skillName: cc.reason === 'freeze' ? 'Frozen' : 'Asleep',
        targetId: actor.instanceId,
        targetName: template.name,
        damage: 0, isCrit: false, effectiveness: 1,
        effects: [`${template.name} is ${cc.reason === 'freeze' ? 'frozen' : 'asleep'} and cannot act!`, ...allTurnEffects],
      });
      tickCooldowns(actor);
      checkBattleEnd(state);
      continue;
    }

    if (cc.type === 'skip') {
      logs.push({
        turn: state.turnNumber,
        actorId: actor.instanceId,
        actorName: template.name,
        skillUsed: '',
        skillName: 'Paralyzed',
        targetId: actor.instanceId,
        targetName: template.name,
        damage: 0, isCrit: false, effectiveness: 1,
        effects: [`${template.name} is paralyzed and cannot move!`, ...allTurnEffects],
      });
      tickCooldowns(actor);
      checkBattleEnd(state);
      continue;
    }

    if (cc.type === 'cd_increase') {
      // Paralysis: increase all CDs by 1
      for (const skId of Object.keys(actor.skillCooldowns)) {
        actor.skillCooldowns[skId]++;
      }
      logs.push({
        turn: state.turnNumber,
        actorId: actor.instanceId,
        actorName: template.name,
        skillUsed: '',
        skillName: 'Paralyzed',
        targetId: actor.instanceId,
        targetName: template.name,
        damage: 0, isCrit: false, effectiveness: 1,
        effects: [`${template.name} is paralyzed! Cooldowns increased!`, ...allTurnEffects],
      });
      tickCooldowns(actor);
      checkBattleEnd(state);
      continue;
    }

    // Determine skill (handle provoke, silence, confusion)
    let { skill, targets } = pickEnemyActionWithCC(actor, state, cc);

    const actionLogs = resolveSkill(actor, skill, targets, state);
    if (actionLogs.length > 0 && allTurnEffects.length > 0) {
      actionLogs[0].effects = [...allTurnEffects, ...actionLogs[0].effects];
    }
    logs.push(...actionLogs);

    checkBattleEnd(state);
  }

  return logs;
}

/** Pick action considering CC states (provoke, silence, confusion) */
function pickEnemyActionWithCC(
  actor: BattleMon,
  state: BattleState,
  cc: CCResult,
): { skill: SkillDefinition; targets: BattleMon[] } {
  const template = getTemplate(actor.templateId);
  const skills = getSkillsForPokemon(template.skillIds);
  const basicSkill = skills.find(s => s.category === 'basic') || skills[0];

  if (cc.type === 'provoke') {
    // Must use basic attack on provoker
    const allMons = [...state.playerTeam, ...state.enemyTeam];
    const provoker = allMons.find(m => m.instanceId === cc.targetId && m.isAlive);
    if (provoker) {
      return { skill: basicSkill, targets: [provoker] };
    }
    // Provoker dead, fall through to normal AI
  }

  if (cc.type === 'silence') {
    // Can only use basic attack
    return pickEnemyActionForBasicOnly(actor, state, basicSkill);
  }

  if (cc.type === 'confusion') {
    // 50% hit allies — redirect targets
    const { skill, targets } = pickEnemyAction(actor, state);
    // Redirect to own team
    if (skill.target === 'all_enemies') {
      // AOE hits own team
      const ownTeam = actor.isPlayerOwned ? state.playerTeam : state.enemyTeam;
      return { skill, targets: ownTeam.filter(m => m.isAlive && m.instanceId !== actor.instanceId) };
    } else {
      // Single target: pick random ally
      const ownTeam = actor.isPlayerOwned ? state.playerTeam : state.enemyTeam;
      const allies = ownTeam.filter(m => m.isAlive && m.instanceId !== actor.instanceId);
      if (allies.length > 0) {
        const randomAlly = allies[Math.floor(Math.random() * allies.length)];
        return { skill, targets: [randomAlly] };
      }
    }
  }

  return pickEnemyAction(actor, state);
}

function pickEnemyActionForBasicOnly(
  actor: BattleMon,
  state: BattleState,
  basicSkill: SkillDefinition,
): { skill: SkillDefinition; targets: BattleMon[] } {
  let targets: BattleMon[];
  if (basicSkill.target === 'self') {
    targets = [actor];
  } else if (basicSkill.target === 'all_enemies') {
    targets = state.playerTeam.filter(m => m.isAlive);
  } else {
    const alive = state.playerTeam.filter(m => m.isAlive);
    alive.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
    targets = [alive[0]];
  }
  return { skill: basicSkill, targets };
}

/** Tick all cooldowns for an actor (used when stunned/skipped) */
function tickCooldowns(actor: BattleMon): void {
  for (const skId of Object.keys(actor.skillCooldowns)) {
    if (actor.skillCooldowns[skId] > 0) {
      actor.skillCooldowns[skId]--;
    }
  }
}
