import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { BattleMon, BattleState, ActiveEffect } from '../types/battle.js';
import type { SkillDefinition, EffectId } from '../types/pokemon.js';
import {
  getEffectiveStats,
  hasBuff,
  hasDebuff,
  resolveSkill,
  processStartOfTurn,
  getCCState,
  advanceToNextActor,
  checkBattleEnd,
  allDead,
} from './engine.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Create a BattleMon with sensible defaults (templateId 1 = Bulbasaur) */
function makeMon(overrides: Partial<BattleMon> = {}): BattleMon {
  return {
    instanceId: 'mon-1',
    templateId: 1, // Bulbasaur — valid template in pokedex
    isPlayerOwned: true,
    currentHp: 1000,
    maxHp: 1000,
    stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 15, critDmg: 150, acc: 50, res: 50 },
    skillCooldowns: {},
    buffs: [],
    debuffs: [],
    isAlive: true,
    actionGauge: 0,
    ...overrides,
  };
}

function makeBuff(id: EffectId, duration = 3, value = 0): ActiveEffect {
  return { id, type: 'buff', value, remainingTurns: duration };
}

function makeDebuff(id: EffectId, duration = 3, value = 0, sourceId?: string): ActiveEffect {
  return { id, type: 'debuff', value, remainingTurns: duration, sourceId };
}

function makeState(overrides: Partial<BattleState> = {}): BattleState {
  return {
    battleId: 'test-battle',
    playerId: 'player-1',
    playerTeam: [makeMon()],
    enemyTeam: [makeMon({ instanceId: 'enemy-1', isPlayerOwned: false, templateId: 4 })], // Charmander
    currentActorId: null,
    turnNumber: 1,
    status: 'active',
    log: [],
    floor: { region: 1, floor: 1, difficulty: 'normal' },
    mode: 'story',
    ...overrides,
  };
}

/** Create a basic offensive skill for testing */
function makeSkill(overrides: Partial<SkillDefinition> = {}): SkillDefinition {
  return {
    id: 'test_skill',
    name: 'Test Attack',
    description: 'A test skill',
    type: 'normal',
    category: 'basic',
    cooldown: 0,
    multiplier: 1.0,
    effects: [],
    target: 'single_enemy',
    ...overrides,
  } as SkillDefinition;
}

// ---------------------------------------------------------------------------
// 1. getEffectiveStats
// ---------------------------------------------------------------------------

describe('getEffectiveStats', () => {
  it('returns base stats when no effects', () => {
    const mon = makeMon();
    const stats = getEffectiveStats(mon);
    expect(stats.atk).toBe(200);
    expect(stats.def).toBe(200);
    expect(stats.spd).toBe(100);
    expect(stats.acc).toBe(50);
    expect(stats.res).toBe(50);
  });

  it('applies atk_buff (+35%)', () => {
    const mon = makeMon({ buffs: [makeBuff('atk_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.atk).toBe(Math.floor(200 * 1.35));
  });

  it('applies def_buff (+50%)', () => {
    const mon = makeMon({ buffs: [makeBuff('def_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.def).toBe(Math.floor(200 * 1.5));
  });

  it('applies spd_buff (+30%)', () => {
    const mon = makeMon({ buffs: [makeBuff('spd_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.spd).toBe(Math.floor(100 * 1.3));
  });

  it('applies crit_rate_buff (+30 flat)', () => {
    const mon = makeMon({ buffs: [makeBuff('crit_rate_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.critRate).toBe(15 + 30);
  });

  it('applies acc_buff (+50%)', () => {
    const mon = makeMon({ buffs: [makeBuff('acc_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.acc).toBe(Math.floor(50 * 1.5));
  });

  it('applies res_buff (+50%)', () => {
    const mon = makeMon({ buffs: [makeBuff('res_buff')] });
    const stats = getEffectiveStats(mon);
    expect(stats.res).toBe(Math.floor(50 * 1.5));
  });

  it('applies atk_break (-50%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('atk_break')] });
    const stats = getEffectiveStats(mon);
    expect(stats.atk).toBe(Math.floor(200 * 0.5));
  });

  it('applies def_break (-50%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('def_break')] });
    const stats = getEffectiveStats(mon);
    expect(stats.def).toBe(Math.floor(200 * 0.5));
  });

  it('applies spd_slow (-30%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('spd_slow')] });
    const stats = getEffectiveStats(mon);
    expect(stats.spd).toBe(Math.floor(100 * 0.7));
  });

  it('applies acc_break (-50%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('acc_break')] });
    const stats = getEffectiveStats(mon);
    expect(stats.acc).toBe(Math.floor(50 * 0.5));
  });

  it('applies res_break (-50%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('res_break')] });
    const stats = getEffectiveStats(mon);
    expect(stats.res).toBe(Math.floor(50 * 0.5));
  });

  // ---- THE REPORTED BUG: burn stacks + stat breaks ----

  it('applies burn stacks AND def_break simultaneously', () => {
    const mon = makeMon({
      debuffs: [
        makeDebuff('burn'), makeDebuff('burn'), makeDebuff('burn'),
        makeDebuff('def_break'),
      ],
    });
    const stats = getEffectiveStats(mon);
    // burn: -3% atk per stack * 3 = -9% atk
    // def_break: -50% def
    expect(stats.atk).toBe(Math.floor(200 * (1 + (-3 * 3) / 100)));  // 200 * 0.91 = 182
    expect(stats.def).toBe(Math.floor(200 * 0.5));  // 100
  });

  it('applies burn stacks AND atk_break simultaneously', () => {
    const mon = makeMon({
      debuffs: [
        makeDebuff('burn'), makeDebuff('burn'), makeDebuff('burn'),
        makeDebuff('atk_break'),
      ],
    });
    const stats = getEffectiveStats(mon);
    // burn: -9% atk, atk_break: -50% atk → total -59% atk
    expect(stats.atk).toBe(Math.floor(200 * (1 + (-9 - 50) / 100)));  // 200 * 0.41 = 82
  });

  it('applies burn stacks AND atk_break AND def_break simultaneously', () => {
    const mon = makeMon({
      debuffs: [
        makeDebuff('burn'), makeDebuff('burn'),
        makeDebuff('atk_break'),
        makeDebuff('def_break'),
      ],
    });
    const stats = getEffectiveStats(mon);
    // burn: 2 stacks * -3% = -6% atk, atk_break: -50% atk → total -56% atk
    // def_break: -50% def
    expect(stats.atk).toBe(Math.floor(200 * (1 + (-6 - 50) / 100)));  // 200 * 0.44 = 88 via formula
    expect(stats.def).toBe(Math.floor(200 * 0.5));   // 100
  });

  it('applies multiple different debuffs (no stackable) all at once', () => {
    const mon = makeMon({
      debuffs: [
        makeDebuff('atk_break'),
        makeDebuff('def_break'),
        makeDebuff('spd_slow'),
        makeDebuff('acc_break'),
        makeDebuff('res_break'),
      ],
    });
    const stats = getEffectiveStats(mon);
    expect(stats.atk).toBe(Math.floor(200 * 0.5));
    expect(stats.def).toBe(Math.floor(200 * 0.5));
    expect(stats.spd).toBe(Math.floor(100 * 0.7));
    expect(stats.acc).toBe(Math.floor(50 * 0.5));
    expect(stats.res).toBe(Math.floor(50 * 0.5));
  });

  it('does not double-count stackable burn stacks', () => {
    const mon = makeMon({
      debuffs: [makeDebuff('burn'), makeDebuff('burn'), makeDebuff('burn')],
    });
    const stats = getEffectiveStats(mon);
    // 3 stacks * -3% = -9%, NOT -27%
    expect(stats.atk).toBe(Math.floor(200 * 0.91));
  });

  it('petrify doubles def (+100%)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('petrify')] });
    const stats = getEffectiveStats(mon);
    expect(stats.def).toBe(Math.floor(200 * 2));
  });

  it('stat floor: atk/def/spd min 1', () => {
    const mon = makeMon({
      stats: { hp: 100, atk: 1, def: 1, spd: 1, critRate: 15, critDmg: 150, acc: 50, res: 50 },
      debuffs: [makeDebuff('atk_break'), makeDebuff('def_break'), makeDebuff('spd_slow')],
    });
    const stats = getEffectiveStats(mon);
    expect(stats.atk).toBeGreaterThanOrEqual(1);
    expect(stats.def).toBeGreaterThanOrEqual(1);
    expect(stats.spd).toBeGreaterThanOrEqual(1);
  });

  it('stat floor: acc/res min 0', () => {
    const mon = makeMon({
      stats: { hp: 100, atk: 100, def: 100, spd: 100, critRate: 15, critDmg: 150, acc: 0, res: 0 },
      debuffs: [makeDebuff('acc_break'), makeDebuff('res_break')],
    });
    const stats = getEffectiveStats(mon);
    expect(stats.acc).toBeGreaterThanOrEqual(0);
    expect(stats.res).toBeGreaterThanOrEqual(0);
  });

  it('stat floor: critDmg min 50', () => {
    const mon = makeMon({
      stats: { hp: 100, atk: 100, def: 100, spd: 100, critRate: 15, critDmg: 50, acc: 50, res: 50 },
    });
    const stats = getEffectiveStats(mon);
    expect(stats.critDmg).toBeGreaterThanOrEqual(50);
  });

  it('buff + debuff on same stat cancel partially', () => {
    const mon = makeMon({
      buffs: [makeBuff('atk_buff')],       // +35%
      debuffs: [makeDebuff('atk_break')],  // -50%
    });
    const stats = getEffectiveStats(mon);
    // net: -15%
    expect(stats.atk).toBe(Math.floor(200 * 0.85));
  });
});

// ---------------------------------------------------------------------------
// 2. resistCheck (tested through resolveSkill debuff application)
// ---------------------------------------------------------------------------

describe('resistCheck (via resolveSkill)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('debuff always lands when acc >> res (100% land chance)', () => {
    // acc 200, res 0 → land chance = 100%
    // random for chance roll = 0 (always pass), random for resist check = 0.99 (under 100)
    randomSpy.mockReturnValueOnce(0); // effect chance roll (0 < 100)
    randomSpy.mockReturnValueOnce(0); // damage variance
    randomSpy.mockReturnValueOnce(0); // crit roll
    randomSpy.mockReturnValueOnce(0.5); // resist check: 0.5*100=50 < 100 → lands

    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      stats: { hp: 1000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });

    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'def_break')).toBe(true);
  });

  it('debuff has 15% floor when res >> acc', () => {
    // acc=0, res=200 → landChance = max(15, 100 - max(0, 200-0)) = 15
    // We need random < 0.15 to land
    let landed = 0;
    const runs = 500;
    for (let i = 0; i < runs; i++) {
      const actor = makeMon({
        instanceId: 'actor',
        stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 0, res: 50 },
      });
      const target = makeMon({
        instanceId: 'target', isPlayerOwned: false, templateId: 4,
        stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 200 },
      });
      target.debuffs = [];
      const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
      const skill = makeSkill({
        effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
      });
      resolveSkill(actor, skill, [target], state);
      if (hasDebuff(target, 'def_break')) landed++;
    }
    // ~15% land rate. Allow range 5%-30% with 500 samples
    const rate = landed / runs;
    expect(rate).toBeGreaterThan(0.05);
    expect(rate).toBeLessThan(0.30);
  });
});

// ---------------------------------------------------------------------------
// 3. applyBuff / applyDebuff (tested through resolveSkill + getEffectiveStats)
// ---------------------------------------------------------------------------

describe('buff/debuff application', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { randomSpy.mockRestore(); });

  it('unique buff refreshes duration (does not stack)', () => {
    const mon = makeMon({ buffs: [makeBuff('atk_buff', 1)] });
    const actor = makeMon({ instanceId: 'actor', templateId: 4, isPlayerOwned: false });
    const state = makeState({ playerTeam: [mon], enemyTeam: [actor] });

    // Use a self-target skill that applies atk_buff
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'atk_buff' as EffectId, value: 0, duration: 3, chance: 100 }],
    });
    resolveSkill(mon, skill, [mon], state);

    const atkBuffs = mon.buffs.filter(b => b.id === 'atk_buff');
    expect(atkBuffs.length).toBe(1);
    expect(atkBuffs[0].remainingTurns).toBe(3); // refreshed to max
  });

  it('buff blocked by buff_block', () => {
    const mon = makeMon({ debuffs: [makeDebuff('buff_block')] });
    const state = makeState({ playerTeam: [mon], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'atk_buff' as EffectId, value: 0, duration: 3, chance: 100 }],
    });
    resolveSkill(mon, skill, [mon], state);
    expect(hasBuff(mon, 'atk_buff')).toBe(false);
  });

  it('debuff blocked by immunity', () => {
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      buffs: [makeBuff('immunity')],
    });
    const actor = makeMon({ instanceId: 'actor' });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'def_break')).toBe(false);
  });

  it('nullify consumes and blocks next debuff', () => {
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      buffs: [makeBuff('nullify')],
    });
    const actor = makeMon({ instanceId: 'actor' });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'def_break')).toBe(false);
    expect(hasBuff(target, 'nullify')).toBe(false); // consumed
  });

  it('max debuffs limit (10) is enforced', () => {
    const debuffs: ActiveEffect[] = [];
    for (let i = 0; i < 10; i++) {
      debuffs.push(makeDebuff('poison'));
    }
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      debuffs,
    });
    const actor = makeMon({ instanceId: 'actor' });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    // Should still be 10, the 11th debuff should fail
    expect(target.debuffs.length).toBe(10);
    expect(hasDebuff(target, 'def_break')).toBe(false);
  });

  it('stackable debuff respects maxStacks', () => {
    // Poison maxStacks = 10
    const debuffs: ActiveEffect[] = [];
    for (let i = 0; i < 10; i++) {
      debuffs.push(makeDebuff('poison'));
    }
    // Above max debuffs so covered by that test already.
    // Let's test with fewer total debuffs but max stacks for bombs (maxStacks=3)
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      debuffs: [makeDebuff('bomb'), makeDebuff('bomb'), makeDebuff('bomb')],
    });
    const actor = makeMon({ instanceId: 'actor' });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'bomb' as EffectId, value: 0, duration: 3, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    const bombCount = target.debuffs.filter(d => d.id === 'bomb').length;
    expect(bombCount).toBe(3); // not 4
  });
});

// ---------------------------------------------------------------------------
// 4. resolveSkill — damage and effect application
// ---------------------------------------------------------------------------

describe('resolveSkill', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random'); });
  afterEach(() => { randomSpy.mockRestore(); });

  it('offensive skill applies damage', () => {
    randomSpy.mockReturnValue(0.5); // no crit, middle variance
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({ instanceId: 'target', isPlayerOwned: false, templateId: 4 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 2.0 });

    const logs = resolveSkill(actor, skill, [target], state);
    expect(logs[0].damage).toBeGreaterThan(0);
    expect(target.currentHp).toBeLessThan(1000);
  });

  it('skill effects proc when roll < chance', () => {
    // Roll = 0 → always under any positive chance
    randomSpy.mockReturnValue(0);
    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'atk_break' as EffectId, value: 0, duration: 2, chance: 50 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'atk_break')).toBe(true);
  });

  it('skill effects do NOT proc when roll >= chance', () => {
    // Roll = 0.99 → 99 >= 50, skip
    randomSpy.mockReturnValue(0.99);
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({ instanceId: 'target', isPlayerOwned: false, templateId: 4, currentHp: 5000, maxHp: 5000 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'atk_break' as EffectId, value: 0, duration: 2, chance: 50 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'atk_break')).toBe(false);
  });

  it('glancing hit blocks debuff application', () => {
    // Glancing = 50% check. We need: hasGlancing=true AND Math.random < 0.5 for glancing hit
    let callCount = 0;
    randomSpy.mockImplementation(() => {
      callCount++;
      return 0; // all rolls pass: glancing check triggers, effect chance passes, but debuff blocked
    });

    const actor = makeMon({
      instanceId: 'actor',
      debuffs: [makeDebuff('glancing')], // has glancing debuff
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);

    expect(hasDebuff(target, 'def_break')).toBe(false);
  });

  it('evasion blocks damage and debuffs', () => {
    randomSpy.mockReturnValue(0); // evasion triggers (0 < 0.5)
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      buffs: [makeBuff('evasion')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      multiplier: 2.0,
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });

    const result = resolveSkill(actor, skill, [target], state);
    expect(result[0].damage).toBe(0);
    expect(hasDebuff(target, 'def_break')).toBe(false);
  });

  it('seal blocks basic attack harmful effects', () => {
    randomSpy.mockReturnValue(0);
    const actor = makeMon({
      instanceId: 'actor',
      debuffs: [makeDebuff('seal')],
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      category: 'basic',
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'def_break')).toBe(false);
  });

  it('seal does NOT block active skill effects', () => {
    randomSpy.mockReturnValue(0);
    const actor = makeMon({
      instanceId: 'actor',
      debuffs: [makeDebuff('seal')],
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      category: 'active',
      cooldown: 3,
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(hasDebuff(target, 'def_break')).toBe(true);
  });

  it('brand applies +25% damage', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor' });
    const targetNoBrand = makeMon({ instanceId: 'target-1', isPlayerOwned: false, templateId: 4 });
    const targetBrand = makeMon({
      instanceId: 'target-2', isPlayerOwned: false, templateId: 4,
      debuffs: [makeDebuff('brand')],
    });
    const state1 = makeState({ playerTeam: [actor], enemyTeam: [targetNoBrand] });
    const state2 = makeState({ playerTeam: [makeMon({ instanceId: 'actor' })], enemyTeam: [targetBrand] });
    const skill = makeSkill({ multiplier: 2.0 });

    const logs1 = resolveSkill(actor, skill, [targetNoBrand], state1);
    const logs2 = resolveSkill(state2.playerTeam[0], skill, [targetBrand], state2);

    expect(logs2[0].damage).toBe(Math.floor(logs1[0].damage * 1.25));
  });

  it('invincibility blocks all damage', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      buffs: [makeBuff('invincibility')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 10.0 });

    const result = resolveSkill(actor, skill, [target], state);
    expect(result[0].damage).toBe(0);
    expect(target.currentHp).toBe(1000);
  });

  it('shield absorbs damage', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      buffs: [makeBuff('shield', 3, 500)],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 2.0 });

    const result = resolveSkill(actor, skill, [target], state);
    expect(result[0].shieldAbsorbed).toBeGreaterThan(0);
  });

  it('endure prevents death at 1 HP', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 5000, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 100,
      buffs: [makeBuff('endure')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 10.0 });

    resolveSkill(actor, skill, [target], state);
    expect(target.currentHp).toBe(1);
    expect(target.isAlive).toBe(true);
    expect(hasBuff(target, 'endure')).toBe(false); // consumed
  });

  it('soul_protect revives at 30% HP', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 5000, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 100, maxHp: 1000,
      buffs: [makeBuff('soul_protect')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 10.0 });

    resolveSkill(actor, skill, [target], state);
    expect(target.currentHp).toBe(300); // 30% of 1000
    expect(target.isAlive).toBe(true);
    expect(hasBuff(target, 'soul_protect')).toBe(false); // consumed
  });

  it('reflect returns 30% damage to attacker', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor', currentHp: 5000, maxHp: 5000 });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      buffs: [makeBuff('reflect')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 2.0 });

    const result = resolveSkill(actor, skill, [target], state);
    expect(result[0].reflected).toBeGreaterThan(0);
    expect(actor.currentHp).toBeLessThan(5000);
  });

  it('vampire heals 20% of damage dealt', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({
      instanceId: 'actor',
      currentHp: 500, maxHp: 1000,
      buffs: [makeBuff('vampire')],
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ multiplier: 2.0 });

    resolveSkill(actor, skill, [target], state);
    expect(actor.currentHp).toBeGreaterThan(500);
  });

  it('amplify +50% damage and is consumed', () => {
    randomSpy.mockReturnValue(0.5);
    const actorNoAmp = makeMon({ instanceId: 'actor-1' });
    const actorAmp = makeMon({ instanceId: 'actor-2', buffs: [makeBuff('amplify')] });
    const target1 = makeMon({ instanceId: 't1', isPlayerOwned: false, templateId: 4 });
    const target2 = makeMon({ instanceId: 't2', isPlayerOwned: false, templateId: 4 });
    const state1 = makeState({ playerTeam: [actorNoAmp], enemyTeam: [target1] });
    const state2 = makeState({ playerTeam: [actorAmp], enemyTeam: [target2] });
    const skill = makeSkill({ multiplier: 2.0 });

    const logs1 = resolveSkill(actorNoAmp, skill, [target1], state1);
    const logs2 = resolveSkill(actorAmp, skill, [target2], state2);

    expect(logs2[0].damage).toBe(Math.floor(logs1[0].damage * 1.5));
    expect(hasBuff(actorAmp, 'amplify')).toBe(false); // consumed
  });

  it('cooldown is set after using a skill', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({ instanceId: 'target', isPlayerOwned: false, templateId: 4 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ id: 'test_active', cooldown: 4, category: 'active' });

    resolveSkill(actor, skill, [target], state);
    expect(actor.skillCooldowns['test_active']).toBe(4);
  });

  it('skill_refresh skips cooldown (consumed)', () => {
    randomSpy.mockReturnValue(0.5);
    const actor = makeMon({ instanceId: 'actor', buffs: [makeBuff('skill_refresh')] });
    const target = makeMon({ instanceId: 'target', isPlayerOwned: false, templateId: 4 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({ id: 'test_active', cooldown: 4, category: 'active' });

    resolveSkill(actor, skill, [target], state);
    expect(actor.skillCooldowns['test_active'] ?? 0).toBe(0);
    expect(hasBuff(actor, 'skill_refresh')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. processStartOfTurn
// ---------------------------------------------------------------------------

describe('processStartOfTurn', () => {
  it('recovery heals 15% max HP', () => {
    const mon = makeMon({ currentHp: 500, buffs: [makeBuff('recovery')] });
    const state = makeState({ playerTeam: [mon] });
    const effects = processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(500 + Math.floor(1000 * 0.15));
    expect(effects.some(e => e.includes('recovered'))).toBe(true);
  });

  it('recovery blocked by unrecoverable', () => {
    const mon = makeMon({
      currentHp: 500,
      buffs: [makeBuff('recovery')],
      debuffs: [makeDebuff('unrecoverable')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(500);
  });

  it('anti-heal halves recovery healing', () => {
    const mon = makeMon({
      currentHp: 500,
      buffs: [makeBuff('recovery')],
      debuffs: [makeDebuff('anti_heal')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    const expected = 500 + Math.floor(Math.floor(1000 * 0.15) * 0.5);
    expect(mon.currentHp).toBe(expected);
  });

  it('poison deals 5% max HP per stack', () => {
    const mon = makeMon({
      currentHp: 1000,
      debuffs: [makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1000 - Math.floor(1000 * 0.05 * 3));
  });

  it('burn deals 5% of snapshotted source ATK per stack', () => {
    const sourceAtk = 200;
    const mon = makeMon({
      currentHp: 1000,
      debuffs: [makeDebuff('burn', 3, sourceAtk), makeDebuff('burn', 3, sourceAtk)],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1000 - Math.floor(sourceAtk * 0.05) * 2);
  });

  it('bleed deals 4% max HP per stack', () => {
    const mon = makeMon({
      currentHp: 1000,
      debuffs: [makeDebuff('bleed'), makeDebuff('bleed')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1000 - Math.floor(1000 * 0.04 * 2));
  });

  it('invincibility blocks DoT', () => {
    const mon = makeMon({
      currentHp: 1000,
      buffs: [makeBuff('invincibility')],
      debuffs: [makeDebuff('poison'), makeDebuff('burn')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1000);
  });

  it('bomb detonates at 1 turn remaining', () => {
    const mon = makeMon({
      currentHp: 1000,
      debuffs: [makeDebuff('bomb', 1)], // 1 turn remaining = about to expire
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1000 - Math.floor(1000 * 0.25));
  });

  it('endure prevents lethal DoT at 1 HP', () => {
    const mon = makeMon({
      currentHp: 10,
      buffs: [makeBuff('endure')],
      debuffs: [makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(1);
    expect(mon.isAlive).toBe(true);
  });

  it('soul_protect revives on lethal DoT', () => {
    const mon = makeMon({
      currentHp: 10, maxHp: 1000,
      buffs: [makeBuff('soul_protect')],
      debuffs: [makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.currentHp).toBe(Math.floor(1000 * 0.3));
    expect(mon.isAlive).toBe(true);
    expect(hasBuff(mon, 'soul_protect')).toBe(false);
  });

  it('mon faints from lethal DoT without protection', () => {
    const mon = makeMon({
      currentHp: 10,
      debuffs: [makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison'), makeDebuff('poison')],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.isAlive).toBe(false);
  });

  it('ticks buff/debuff durations and removes expired', () => {
    const mon = makeMon({
      buffs: [makeBuff('atk_buff', 1)],
      debuffs: [makeDebuff('def_break', 1)],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.buffs.length).toBe(0);
    expect(mon.debuffs.length).toBe(0);
  });

  it('duration 999 effects are not ticked down', () => {
    const mon = makeMon({
      buffs: [makeBuff('atk_buff', 999)],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    expect(mon.buffs[0].remainingTurns).toBe(999);
  });

  it('sleep heals 10% max HP', () => {
    const mon = makeMon({
      currentHp: 500,
      debuffs: [makeDebuff('sleep', 2)],
    });
    const state = makeState({ playerTeam: [mon] });
    processStartOfTurn(mon, state);
    // sleep heals 10% = 100 HP
    expect(mon.currentHp).toBe(600);
  });
});

// ---------------------------------------------------------------------------
// 6. getCCState
// ---------------------------------------------------------------------------

describe('getCCState', () => {
  it('returns none when no CC debuffs', () => {
    const mon = makeMon();
    expect(getCCState(mon).type).toBe('none');
  });

  it('freeze → stun', () => {
    const mon = makeMon({ debuffs: [makeDebuff('freeze')] });
    const cc = getCCState(mon);
    expect(cc.type).toBe('stun');
    if (cc.type === 'stun') expect(cc.reason).toBe('freeze');
  });

  it('sleep → stun', () => {
    const mon = makeMon({ debuffs: [makeDebuff('sleep')] });
    const cc = getCCState(mon);
    expect(cc.type).toBe('stun');
    if (cc.type === 'stun') expect(cc.reason).toBe('sleep');
  });

  it('petrify → stun', () => {
    const mon = makeMon({ debuffs: [makeDebuff('petrify')] });
    const cc = getCCState(mon);
    expect(cc.type).toBe('stun');
    if (cc.type === 'stun') expect(cc.reason).toBe('petrify');
  });

  it('paralysis → skip or cd_increase (50/50)', () => {
    const mon = makeMon({ debuffs: [makeDebuff('paralysis')] });
    const results = new Set<string>();
    const spy = vi.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.1);
    results.add(getCCState(mon).type);
    spy.mockReturnValueOnce(0.9);
    results.add(getCCState(mon).type);
    spy.mockRestore();
    expect(results.has('skip')).toBe(true);
    expect(results.has('cd_increase')).toBe(true);
  });

  it('provoke → provoke with targetId', () => {
    const mon = makeMon({ debuffs: [makeDebuff('provoke', 3, 0, 'provoker-id')] });
    const cc = getCCState(mon);
    expect(cc.type).toBe('provoke');
    if (cc.type === 'provoke') expect(cc.targetId).toBe('provoker-id');
  });

  it('silence → silence', () => {
    const mon = makeMon({ debuffs: [makeDebuff('silence')] });
    expect(getCCState(mon).type).toBe('silence');
  });

  it('confusion → confusion 50% of the time', () => {
    const spy = vi.spyOn(Math, 'random');
    spy.mockReturnValue(0.1); // < 0.5 → confusion triggers
    const mon = makeMon({ debuffs: [makeDebuff('confusion')] });
    expect(getCCState(mon).type).toBe('confusion');
    spy.mockReturnValue(0.9); // >= 0.5 → no confusion
    expect(getCCState(mon).type).toBe('none');
    spy.mockRestore();
  });

  it('petrify takes priority over freeze', () => {
    const mon = makeMon({ debuffs: [makeDebuff('freeze'), makeDebuff('petrify')] });
    const cc = getCCState(mon);
    expect(cc.type).toBe('stun');
    if (cc.type === 'stun') expect(cc.reason).toBe('petrify');
  });
});

// ---------------------------------------------------------------------------
// 7. advanceToNextActor
// ---------------------------------------------------------------------------

describe('advanceToNextActor', () => {
  it('faster mon acts first', () => {
    const fast = makeMon({ instanceId: 'fast', stats: { hp: 1000, atk: 100, def: 100, spd: 200, critRate: 15, critDmg: 150, acc: 50, res: 50 } });
    const slow = makeMon({ instanceId: 'slow', isPlayerOwned: false, templateId: 4, stats: { hp: 1000, atk: 100, def: 100, spd: 50, critRate: 15, critDmg: 150, acc: 50, res: 50 } });
    const state = makeState({ playerTeam: [fast], enemyTeam: [slow] });

    const firstActor = advanceToNextActor(state);
    expect(firstActor).toBe('fast');
  });

  it('speed buff makes mon act first', () => {
    const buffed = makeMon({
      instanceId: 'buffed',
      stats: { hp: 1000, atk: 100, def: 100, spd: 100, critRate: 15, critDmg: 150, acc: 50, res: 50 },
      buffs: [makeBuff('spd_buff')], // +30%
    });
    const normal = makeMon({
      instanceId: 'normal', isPlayerOwned: false, templateId: 4,
      stats: { hp: 1000, atk: 100, def: 100, spd: 120, critRate: 15, critDmg: 150, acc: 50, res: 50 },
    });
    const state = makeState({ playerTeam: [buffed], enemyTeam: [normal] });

    // buffed: 100 * 1.3 = 130 effective spd > 120
    const firstActor = advanceToNextActor(state);
    expect(firstActor).toBe('buffed');
  });
});

// ---------------------------------------------------------------------------
// 8. checkBattleEnd
// ---------------------------------------------------------------------------

describe('checkBattleEnd', () => {
  it('sets victory when all enemies dead', () => {
    const state = makeState({
      enemyTeam: [makeMon({ instanceId: 'e1', isPlayerOwned: false, templateId: 4, isAlive: false })],
    });
    checkBattleEnd(state);
    expect(state.status).toBe('victory');
  });

  it('sets defeat when all players dead', () => {
    const state = makeState({
      playerTeam: [makeMon({ isAlive: false })],
    });
    checkBattleEnd(state);
    expect(state.status).toBe('defeat');
  });

  it('stays active when both teams have alive mons', () => {
    const state = makeState();
    checkBattleEnd(state);
    expect(state.status).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// 9. allDead
// ---------------------------------------------------------------------------

describe('allDead', () => {
  it('returns true when all mons are dead', () => {
    expect(allDead([makeMon({ isAlive: false }), makeMon({ isAlive: false })])).toBe(true);
  });

  it('returns false when at least one mon is alive', () => {
    expect(allDead([makeMon({ isAlive: false }), makeMon()])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 10. inferEffectTarget (tested through resolveSkill)
// ---------------------------------------------------------------------------

describe('inferEffectTarget (via resolveSkill)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { randomSpy.mockRestore(); });

  it('beneficial effect on offensive skill targets self', () => {
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({ instanceId: 'target', isPlayerOwned: false, templateId: 4, currentHp: 5000, maxHp: 5000 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      target: 'single_enemy',
      effects: [{ id: 'atk_buff' as EffectId, value: 0, duration: 3, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    // atk_buff should be on actor (self), not target
    expect(hasBuff(actor, 'atk_buff')).toBe(true);
    expect(hasBuff(target, 'atk_buff')).toBe(false);
  });

  it('harmful effect on self-target skill targets enemies', () => {
    const actor = makeMon({ instanceId: 'actor' });
    const enemy = makeMon({
      instanceId: 'enemy', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [enemy] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'def_break' as EffectId, value: 0, duration: 2, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    // def_break should be on enemy, not self
    expect(hasDebuff(enemy, 'def_break')).toBe(true);
    expect(hasDebuff(actor, 'def_break')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 11. Instant effects (via resolveSkill)
// ---------------------------------------------------------------------------

describe('instant effects', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { randomSpy.mockRestore(); });

  it('heal restores HP', () => {
    const actor = makeMon({ instanceId: 'actor', currentHp: 500 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'heal' as EffectId, value: 30, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.currentHp).toBe(500 + Math.floor(1000 * 0.3));
  });

  it('heal blocked by unrecoverable', () => {
    const actor = makeMon({ instanceId: 'actor', currentHp: 500, debuffs: [makeDebuff('unrecoverable')] });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'heal' as EffectId, value: 30, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.currentHp).toBe(500);
  });

  it('heal halved by anti_heal', () => {
    const actor = makeMon({ instanceId: 'actor', currentHp: 500, debuffs: [makeDebuff('anti_heal')] });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'heal' as EffectId, value: 30, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.currentHp).toBe(500 + Math.floor(Math.floor(1000 * 0.3) * 0.5));
  });

  it('atb_boost increases action gauge', () => {
    const actor = makeMon({ instanceId: 'actor', actionGauge: 200 });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'atb_boost' as EffectId, value: 50, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.actionGauge).toBe(200 + 500);
  });

  it('atb_reduce decreases action gauge (with resist check)', () => {
    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      actionGauge: 800,
      stats: { hp: 5000, atk: 100, def: 100, spd: 100, critRate: 0, critDmg: 150, acc: 50, res: 0 },
      currentHp: 5000, maxHp: 5000,
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      multiplier: 0,
      effects: [{ id: 'atb_reduce' as EffectId, value: 50, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(target.actionGauge).toBe(800 - 500);
  });

  it('strip removes random buffs', () => {
    const actor = makeMon({ instanceId: 'actor' });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      buffs: [makeBuff('atk_buff'), makeBuff('def_buff'), makeBuff('spd_buff')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      multiplier: 0,
      effects: [{ id: 'strip' as EffectId, value: 2, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);
    expect(target.buffs.length).toBe(1);
  });

  it('cleanse removes random debuffs', () => {
    const actor = makeMon({
      instanceId: 'actor',
      debuffs: [makeDebuff('atk_break'), makeDebuff('def_break'), makeDebuff('spd_slow')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'cleanse' as EffectId, value: 2, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.debuffs.length).toBe(1);
  });

  it('revive brings back dead ally', () => {
    const alive = makeMon({ instanceId: 'alive' });
    const dead = makeMon({ instanceId: 'dead', isAlive: false, currentHp: 0 });
    const state = makeState({
      playerTeam: [alive, dead],
      enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })],
    });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'revive' as EffectId, value: 50, duration: 0, chance: 100 }],
    });
    resolveSkill(alive, skill, [alive], state);
    expect(dead.isAlive).toBe(true);
    expect(dead.currentHp).toBe(Math.floor(1000 * 0.5));
  });

  it('cd_reset resets all cooldowns', () => {
    const actor = makeMon({ instanceId: 'actor', skillCooldowns: { s1: 3, s2: 2 } });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'cd_reset' as EffectId, value: 0, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.skillCooldowns['s1']).toBe(0);
    expect(actor.skillCooldowns['s2']).toBe(0);
  });

  it('detonate triggers all DoTs instantly', () => {
    const actor = makeMon({
      instanceId: 'actor',
      stats: { hp: 1000, atk: 200, def: 200, spd: 100, critRate: 0, critDmg: 150, acc: 200, res: 50 },
    });
    const target = makeMon({
      instanceId: 'target', isPlayerOwned: false, templateId: 4,
      currentHp: 5000, maxHp: 5000,
      debuffs: [makeDebuff('poison'), makeDebuff('poison'), makeDebuff('burn')],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [target] });
    const skill = makeSkill({
      multiplier: 0,
      effects: [{ id: 'detonate' as EffectId, value: 0, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [target], state);

    // 2 poison * 5% + 1 burn * 3% = 13% of 5000 = 650
    const expectedDmg = Math.floor(5000 * 0.05 * 2) + Math.floor(5000 * 0.03 * 1);
    expect(target.currentHp).toBe(5000 - expectedDmg);
    // DoTs consumed
    expect(target.debuffs.filter(d => d.id === 'poison').length).toBe(0);
    expect(target.debuffs.filter(d => d.id === 'burn').length).toBe(0);
  });

  it('balance_hp equalizes team', () => {
    const mon1 = makeMon({ instanceId: 'mon1', currentHp: 1000, maxHp: 1000 });
    const mon2 = makeMon({ instanceId: 'mon2', currentHp: 0, maxHp: 1000, isAlive: true });
    const state = makeState({
      playerTeam: [mon1, mon2],
      enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })],
    });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'balance_hp' as EffectId, value: 0, duration: 0, chance: 100 }],
    });
    resolveSkill(mon1, skill, [mon1], state);
    // Average: (1000/1000 + 0/1000) / 2 = 0.5
    expect(mon1.currentHp).toBe(Math.max(1, Math.floor(1000 * 0.5)));
    expect(mon2.currentHp).toBe(Math.max(1, Math.floor(1000 * 0.5)));
  });

  it('extend_buffs adds 1 turn to buff durations', () => {
    const actor = makeMon({
      instanceId: 'actor',
      buffs: [makeBuff('atk_buff', 2), makeBuff('def_buff', 1)],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'extend_buffs' as EffectId, value: 0, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.buffs.find(b => b.id === 'atk_buff')!.remainingTurns).toBe(3);
    expect(actor.buffs.find(b => b.id === 'def_buff')!.remainingTurns).toBe(2);
  });

  it('shorten_debuffs reduces debuff durations by 1', () => {
    const actor = makeMon({
      instanceId: 'actor',
      debuffs: [makeDebuff('atk_break', 3), makeDebuff('def_break', 1)],
    });
    const state = makeState({ playerTeam: [actor], enemyTeam: [makeMon({ instanceId: 'e', isPlayerOwned: false, templateId: 4 })] });
    const skill = makeSkill({
      target: 'self',
      multiplier: 0,
      effects: [{ id: 'shorten_debuffs' as EffectId, value: 0, duration: 0, chance: 100 }],
    });
    resolveSkill(actor, skill, [actor], state);
    expect(actor.debuffs.find(d => d.id === 'atk_break')!.remainingTurns).toBe(2);
    // def_break with 1 turn → 0 → removed
    expect(actor.debuffs.find(d => d.id === 'def_break')).toBeUndefined();
  });
});
