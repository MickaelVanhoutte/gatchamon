import type { BaseStats, PokemonTemplate } from '../types/pokemon.js';
import type { HeldItemInstance, HeldItemMainStatType, HeldItemGrade, ActiveSetEffect } from '../types/held-item.js';
import { ITEM_SETS, MAIN_STAT_SCALING } from '../data/held-items.js';
import { computeStats } from './formulas.js';

// ── Upgrade cost & success rate ────────────────────────────────────────

const BASE_UPGRADE_COSTS = [
  500, 750, 1000,        // +1, +2, +3
  1500, 2000, 2500,      // +4, +5, +6
  3500, 5000, 7000,      // +7, +8, +9
  10000, 15000, 20000,   // +10, +11, +12
  30000, 45000, 60000,   // +13, +14, +15
];

export function getUpgradeCost(currentLevel: number, itemStars: number): number {
  if (currentLevel < 0 || currentLevel >= 15) return 0;
  return BASE_UPGRADE_COSTS[currentLevel] * itemStars;
}

export function getUpgradeSuccessRate(targetLevel: number): number {
  if (targetLevel <= 3) return 1.0;
  if (targetLevel <= 6) return 0.8;
  if (targetLevel <= 9) return 0.6;
  if (targetLevel <= 12) return 0.4;
  return 0.2;
}

// ── Main stat value computation ────────────────────────────────────────

export function computeMainStatValue(statType: HeldItemMainStatType, stars: number, level: number): number {
  const scaling = MAIN_STAT_SCALING[statType];
  const base = scaling.base[stars] ?? 0;
  const per = scaling.perLevel[stars] ?? 0;
  return base + per * level;
}

// ── Active set effects ─────────────────────────────────────────────────

export function getActiveSetEffects(items: HeldItemInstance[]): ActiveSetEffect[] {
  const setCounts: Record<string, number> = {};
  for (const item of items) {
    setCounts[item.setId] = (setCounts[item.setId] ?? 0) + 1;
  }

  const effects: ActiveSetEffect[] = [];
  for (const [setId, count] of Object.entries(setCounts)) {
    const setDef = ITEM_SETS.find(s => s.id === setId);
    if (!setDef) continue;
    const activations = Math.floor(count / setDef.pieces);
    if (activations <= 0) continue;

    effects.push({
      setId: setDef.id,
      setName: setDef.name,
      effectType: setDef.effectType,
      bonusStat: setDef.bonusStat,
      bonusValue: setDef.bonusValue != null ? setDef.bonusValue * activations : undefined,
      bonusType: setDef.bonusType,
      procEffect: setDef.procEffect,
      procChance: setDef.procChance,
      procValue: setDef.procValue,
      activations,
    });
  }

  return effects;
}

// ── Stat computation with held items ───────────────────────────────────

interface StatAccumulators {
  hpFlat: number;
  hpPct: number;
  atkFlat: number;
  atkPct: number;
  defFlat: number;
  defPct: number;
  spdFlat: number;
  spdPct: number;
  critRateFlat: number;
  critDmgFlat: number;
  accFlat: number;
  resFlat: number;
}

function applyStatBonus(type: HeldItemMainStatType, value: number, acc: StatAccumulators): void {
  switch (type) {
    case 'hp_flat':   acc.hpFlat += value; break;
    case 'hp_pct':    acc.hpPct += value; break;
    case 'atk_flat':  acc.atkFlat += value; break;
    case 'atk_pct':   acc.atkPct += value; break;
    case 'def_flat':  acc.defFlat += value; break;
    case 'def_pct':   acc.defPct += value; break;
    case 'spd_flat':  acc.spdFlat += value; break;
    case 'critRate':  acc.critRateFlat += value; break;
    case 'critDmg':   acc.critDmgFlat += value; break;
    case 'acc':       acc.accFlat += value; break;
    case 'res':       acc.resFlat += value; break;
  }
}

export function computeStatsWithItems(
  template: PokemonTemplate,
  level: number,
  stars: number,
  items: HeldItemInstance[],
): BaseStats {
  const base = computeStats(template, level, stars);

  if (items.length === 0) return base;

  const acc: StatAccumulators = {
    hpFlat: 0, hpPct: 0,
    atkFlat: 0, atkPct: 0,
    defFlat: 0, defPct: 0,
    spdFlat: 0, spdPct: 0,
    critRateFlat: 0, critDmgFlat: 0,
    accFlat: 0, resFlat: 0,
  };

  // Accumulate main stat + sub stat bonuses from all items
  for (const item of items) {
    applyStatBonus(item.mainStat, item.mainStatValue, acc);
    for (const sub of item.subStats) {
      applyStatBonus(sub.type, sub.value, acc);
    }
  }

  // Apply set bonuses (stat-type only; procs are handled in battle)
  const setEffects = getActiveSetEffects(items);
  for (const effect of setEffects) {
    if (effect.effectType !== 'stat' || !effect.bonusStat || effect.bonusValue == null) continue;
    if (effect.bonusType === 'percent') {
      switch (effect.bonusStat) {
        case 'hp':  acc.hpPct += effect.bonusValue; break;
        case 'atk': acc.atkPct += effect.bonusValue; break;
        case 'def': acc.defPct += effect.bonusValue; break;
        case 'spd': acc.spdPct += effect.bonusValue; break;
        default: break;
      }
    } else {
      switch (effect.bonusStat) {
        case 'critRate': acc.critRateFlat += effect.bonusValue; break;
        case 'critDmg':  acc.critDmgFlat += effect.bonusValue; break;
        case 'acc':      acc.accFlat += effect.bonusValue; break;
        case 'res':      acc.resFlat += effect.bonusValue; break;
        default: break;
      }
    }
  }

  // Apply: final = floor(base * (1 + pct/100)) + flat
  return {
    hp:       Math.floor(base.hp * (1 + acc.hpPct / 100)) + acc.hpFlat,
    atk:      Math.floor(base.atk * (1 + acc.atkPct / 100)) + acc.atkFlat,
    def:      Math.floor(base.def * (1 + acc.defPct / 100)) + acc.defFlat,
    spd:      Math.floor(base.spd * (1 + acc.spdPct / 100)) + acc.spdFlat,
    critRate: Math.min(100, base.critRate + acc.critRateFlat),
    critDmg:  base.critDmg + acc.critDmgFlat,
    acc:      Math.min(100, base.acc + acc.accFlat),
    res:      Math.min(100, base.res + acc.resFlat),
  };
}

// ── Sell value ──────────────────────────────────────────────────────────

const GRADE_SELL_MULT: Record<HeldItemGrade, number> = {
  common: 1,
  rare: 2,
  hero: 4,
  legend: 8,
};

export function getItemSellValue(item: HeldItemInstance): number {
  const baseValue = item.stars * 100;
  const gradeMult = GRADE_SELL_MULT[item.grade];
  const levelBonus = item.level * item.stars * 50;
  return Math.floor((baseValue + levelBonus) * gradeMult);
}
