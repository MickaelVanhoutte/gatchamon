import type { SkillDefinition } from '../../types/pokemon.js';

// ══════════════════════════════════════════════════════════════════════════
// Silvally skill catalogue — 13 skills per element × 5 elements = 65 skills.
// Naming convention (internal codename "homunculus" kept to match the service
// layer and DB column; user-facing label is "Silvally"):
//
//   homunculus_{type}_basic         — col-1 base attack (always unlocked)
//   homunculus_{type}_base_a        — col-1 upgrade A (mutex with base_b)
//   homunculus_{type}_base_b        — col-1 upgrade B (mutex with base_a)
//   homunculus_{type}_s2_p1         — col-2 branch-1 parent (gate only, no skill)
//   homunculus_{type}_s2_1a         — col-2 branch-1 leaf A
//   homunculus_{type}_s2_1b         — col-2 branch-1 leaf B
//   homunculus_{type}_s2_p2         — col-2 branch-2 parent (gate only, no skill)
//   homunculus_{type}_s2_2a         — col-2 branch-2 leaf A
//   homunculus_{type}_s2_2b         — col-2 branch-2 leaf B
//   homunculus_{type}_p_1a / _1b    — col-3 passive pair 1 (independent)
//   homunculus_{type}_p_2a / _2b    — col-3 passive pair 2 (independent)
//
// Col-2 parents are purely gating; they don't have a skill definition and the
// resolver never returns them. Leaves inside the same col-2 branch are mutex.
// Across branches, only one leaf can be active at a time (the active skill
// slot). Col-3 passives are fully independent — all four can be unlocked and
// fire simultaneously.
// ══════════════════════════════════════════════════════════════════════════

export const HOMUNCULUS_SKILLS: Record<string, SkillDefinition> = {
  // ════════════════════════════════════════════════════════════════════════
  // 🔥 FIRE — burn focus
  // ════════════════════════════════════════════════════════════════════════
  homunculus_fire_basic: {
    id: 'homunculus_fire_basic',
    name: 'Ember Strike',
    description: 'A fire-type strike. 20% chance to Burn the target for 2 turn(s).',
    type: 'fire', category: 'basic', cooldown: 0, multiplier: 0.9,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 20 }],
    target: 'single_enemy',
  },
  homunculus_fire_base_a: {
    id: 'homunculus_fire_base_a',
    name: 'Searing Strike',
    description: 'A focused fire strike. 40% chance to Burn the target for 2 turn(s).',
    type: 'fire', category: 'basic', cooldown: 0, multiplier: 1.1,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 40 }],
    target: 'single_enemy',
  },
  homunculus_fire_base_b: {
    id: 'homunculus_fire_base_b',
    name: 'Ember Spread',
    description: 'Scatters embers onto all enemies. 30% chance to Burn each for 2 turn(s).',
    type: 'fire', category: 'basic', cooldown: 0, multiplier: 0.95,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 30, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_fire_s2_1a: {
    id: 'homunculus_fire_s2_1a',
    name: 'Inferno Lance',
    description: 'Pierces one enemy with concentrated flame. 70% chance to Burn for 3 turn(s).',
    type: 'fire', category: 'active', cooldown: 4, multiplier: 2.3,
    effects: [{ id: 'burn', value: 0, duration: 3, chance: 70 }],
    target: 'single_enemy',
  },
  homunculus_fire_s2_1b: {
    id: 'homunculus_fire_s2_1b',
    name: 'Crit Combust',
    description: 'A guaranteed critical strike. 50% chance to Burn the target for 2 turn(s).',
    type: 'fire', category: 'active', cooldown: 4, multiplier: 2.0,
    effects: [
      { id: 'crit_rate_buff', value: 100, duration: 1, chance: 100, target: 'self' },
      { id: 'burn', value: 0, duration: 2, chance: 50 },
    ],
    target: 'single_enemy',
  },
  homunculus_fire_s2_2a: {
    id: 'homunculus_fire_s2_2a',
    name: 'Scorching Field',
    description: 'Engulfs all enemies in flame. 45% chance to Burn each for 2 turn(s).',
    type: 'fire', category: 'active', cooldown: 4, multiplier: 1.6,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 45, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_fire_s2_2b: {
    id: 'homunculus_fire_s2_2b',
    name: 'Heat Wave',
    description: 'A searing wave that weakens every enemy. 70% DEF Break for 2 turn(s).',
    type: 'fire', category: 'active', cooldown: 4, multiplier: 1.5,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 70, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_fire_p_1a: {
    id: 'homunculus_fire_p_1a',
    name: 'Smolder',
    description: 'Passive: when hit, 40% chance to Burn the attacker for 2 turn(s).',
    type: 'fire', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 40 }],
    target: 'self', passiveTrigger: 'on_hit_received',
  },
  homunculus_fire_p_1b: {
    id: 'homunculus_fire_p_1b',
    name: 'Ignite',
    description: 'Passive: each attack has a 50% chance to Burn the target for 2 turn(s).',
    type: 'fire', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 50 }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_fire_p_2a: {
    id: 'homunculus_fire_p_2a',
    name: 'Heat Aura',
    description: 'Passive: on critical hit, Burns all enemies for 2 turn(s).',
    type: 'fire', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies', passiveTrigger: 'on_crit',
  },
  homunculus_fire_p_2b: {
    id: 'homunculus_fire_p_2b',
    name: 'Furnace Heart',
    description: 'Passive: on attack, 50% chance to gain ATK Up for 2 turn(s).',
    type: 'fire', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 50, target: 'self' }],
    target: 'self', passiveTrigger: 'on_attack',
  },

  // ════════════════════════════════════════════════════════════════════════
  // 💧 WATER — freeze + ATB
  // ════════════════════════════════════════════════════════════════════════
  homunculus_water_basic: {
    id: 'homunculus_water_basic',
    name: 'Icy Jet',
    description: 'A water-type strike. 20% chance to reduce the target\'s ATB by 10%.',
    type: 'water', category: 'basic', cooldown: 0, multiplier: 0.9,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 20 }],
    target: 'single_enemy',
  },
  homunculus_water_base_a: {
    id: 'homunculus_water_base_a',
    name: 'Frost Jet',
    description: 'A piercing cold jet. 40% chance to reduce the target\'s ATB by 20%.',
    type: 'water', category: 'basic', cooldown: 0, multiplier: 1.1,
    effects: [{ id: 'atb_reduce', value: 20, duration: 0, chance: 40 }],
    target: 'single_enemy',
  },
  homunculus_water_base_b: {
    id: 'homunculus_water_base_b',
    name: 'Tidal Jet',
    description: 'Splashes every enemy. 25% chance to reduce each ATB by 10%.',
    type: 'water', category: 'basic', cooldown: 0, multiplier: 0.95,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 25, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_water_s2_1a: {
    id: 'homunculus_water_s2_1a',
    name: 'Glacial Lance',
    description: 'A heavy ice strike. 50% chance to Freeze the target.',
    type: 'water', category: 'active', cooldown: 4, multiplier: 2.2,
    effects: [{ id: 'freeze', value: 0, duration: 2, chance: 50 }],
    target: 'single_enemy',
  },
  homunculus_water_s2_1b: {
    id: 'homunculus_water_s2_1b',
    name: 'Permafrost',
    description: 'Locks the target in ice. 70% chance to Freeze, guaranteed −30% ATB.',
    type: 'water', category: 'active', cooldown: 4, multiplier: 1.8,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 70 },
      { id: 'atb_reduce', value: 30, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
  },
  homunculus_water_s2_2a: {
    id: 'homunculus_water_s2_2a',
    name: 'Tidal Crash',
    description: 'Crashes a tide onto all enemies, absorbing 20% of each ATB gauge.',
    type: 'water', category: 'active', cooldown: 4, multiplier: 1.5,
    effects: [{ id: 'absorb_atb', value: 20, duration: 0, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_water_s2_2b: {
    id: 'homunculus_water_s2_2b',
    name: 'Whirlpool',
    description: 'A draining whirlpool. 70% SPD Slow for 2 turn(s) and −20% ATB to all.',
    type: 'water', category: 'active', cooldown: 4, multiplier: 1.4,
    effects: [
      { id: 'spd_slow', value: 0, duration: 2, chance: 70, target: 'all_enemies' },
      { id: 'atb_reduce', value: 20, duration: 0, chance: 100, target: 'all_enemies' },
    ],
    target: 'all_enemies',
  },
  homunculus_water_p_1a: {
    id: 'homunculus_water_p_1a',
    name: 'Flowing Tide',
    description: 'Passive: on attack, gain 12% ATB.',
    type: 'water', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'atb_boost', value: 12, duration: 0, chance: 100, target: 'self' }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_water_p_1b: {
    id: 'homunculus_water_p_1b',
    name: 'Momentum',
    description: 'Passive: when hit, 70% chance to gain 15% ATB.',
    type: 'water', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'atb_boost', value: 15, duration: 0, chance: 70, target: 'self' }],
    target: 'self', passiveTrigger: 'on_hit_received',
  },
  homunculus_water_p_2a: {
    id: 'homunculus_water_p_2a',
    name: 'Chilling Presence',
    description: 'Passive: each attack has a 30% chance to Freeze the target.',
    type: 'water', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 30 }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_water_p_2b: {
    id: 'homunculus_water_p_2b',
    name: 'Frozen Field',
    description: 'Passive: on critical hit, Freezes all enemies for 1 turn.',
    type: 'water', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies', passiveTrigger: 'on_crit',
  },

  // ════════════════════════════════════════════════════════════════════════
  // 🌿 GRASS — brand + damage
  // ════════════════════════════════════════════════════════════════════════
  homunculus_grass_basic: {
    id: 'homunculus_grass_basic',
    name: 'Leaf Slash',
    description: 'A clean grass-type slash.',
    type: 'grass', category: 'basic', cooldown: 0, multiplier: 1.0,
    effects: [],
    target: 'single_enemy',
  },
  homunculus_grass_base_a: {
    id: 'homunculus_grass_base_a',
    name: 'Razor Slash',
    description: 'A precise slash that sharpens the wielder. 40% chance to gain Crit Rate Up.',
    type: 'grass', category: 'basic', cooldown: 0, multiplier: 1.2,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 40, target: 'self' }],
    target: 'single_enemy',
  },
  homunculus_grass_base_b: {
    id: 'homunculus_grass_base_b',
    name: 'Seed Slash',
    description: 'Embeds a seed in the wound. 35% chance to Brand for 2 turn(s).',
    type: 'grass', category: 'basic', cooldown: 0, multiplier: 1.0,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 35 }],
    target: 'single_enemy',
  },
  homunculus_grass_s2_1a: {
    id: 'homunculus_grass_s2_1a',
    name: 'Sylvan Execution',
    description: 'A decisive strike. Guaranteed Brand for 3 turn(s).',
    type: 'grass', category: 'active', cooldown: 4, multiplier: 2.4,
    effects: [{ id: 'brand', value: 0, duration: 3, chance: 100 }],
    target: 'single_enemy',
  },
  homunculus_grass_s2_1b: {
    id: 'homunculus_grass_s2_1b',
    name: 'Piercing Thorn',
    description: 'A thorn that shatters armor. Guaranteed DEF Break for 2 turn(s).',
    type: 'grass', category: 'active', cooldown: 4, multiplier: 2.2,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 100 }],
    target: 'single_enemy',
  },
  homunculus_grass_s2_2a: {
    id: 'homunculus_grass_s2_2a',
    name: 'Thorn Volley',
    description: 'Peppers all enemies. 50% chance to Brand each for 2 turn(s).',
    type: 'grass', category: 'active', cooldown: 4, multiplier: 1.6,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 50, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_grass_s2_2b: {
    id: 'homunculus_grass_s2_2b',
    name: 'Pollen Storm',
    description: 'Chokes all enemies with pollen. 70% ACC Break for 2 turn(s).',
    type: 'grass', category: 'active', cooldown: 4, multiplier: 1.5,
    effects: [{ id: 'acc_break', value: 0, duration: 2, chance: 70, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_grass_p_1a: {
    id: 'homunculus_grass_p_1a',
    name: 'Verdant Mark',
    description: 'Passive: each attack has a 40% chance to Brand the target for 2 turn(s).',
    type: 'grass', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 40 }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_grass_p_1b: {
    id: 'homunculus_grass_p_1b',
    name: 'Deep Roots',
    description: 'Passive: each attack inflicts 2 stacks of Bleed (50% chance).',
    type: 'grass', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 3, chance: 50 },
      { id: 'bleed', value: 0, duration: 3, chance: 50 },
    ],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_grass_p_2a: {
    id: 'homunculus_grass_p_2a',
    name: 'Overgrowth',
    description: 'Passive: on critical hit, Brands all enemies for 3 turn(s).',
    type: 'grass', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 3, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies', passiveTrigger: 'on_crit',
  },
  homunculus_grass_p_2b: {
    id: 'homunculus_grass_p_2b',
    name: 'Living Shield',
    description: 'Passive: when hit, 40% chance to gain DEF Up for 2 turn(s).',
    type: 'grass', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 40, target: 'self' }],
    target: 'self', passiveTrigger: 'on_hit_received',
  },

  // ════════════════════════════════════════════════════════════════════════
  // 🟣 PSYCHIC — silence + buff-strip
  // ════════════════════════════════════════════════════════════════════════
  homunculus_psychic_basic: {
    id: 'homunculus_psychic_basic',
    name: 'Psybeam',
    description: 'A psychic beam. 20% chance to Strip a buff from the target.',
    type: 'psychic', category: 'basic', cooldown: 0, multiplier: 0.9,
    effects: [{ id: 'strip', value: 0, duration: 0, chance: 20 }],
    target: 'single_enemy',
  },
  homunculus_psychic_base_a: {
    id: 'homunculus_psychic_base_a',
    name: 'Psi Lance',
    description: 'A concentrated psi-spear. 40% chance to Strip a buff.',
    type: 'psychic', category: 'basic', cooldown: 0, multiplier: 1.1,
    effects: [{ id: 'strip', value: 0, duration: 0, chance: 40 }],
    target: 'single_enemy',
  },
  homunculus_psychic_base_b: {
    id: 'homunculus_psychic_base_b',
    name: 'Mind Scatter',
    description: 'Shatters enemy focus. 25% chance to Strip a buff from each enemy.',
    type: 'psychic', category: 'basic', cooldown: 0, multiplier: 0.95,
    effects: [{ id: 'strip', value: 0, duration: 0, chance: 25, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_psychic_s2_1a: {
    id: 'homunculus_psychic_s2_1a',
    name: 'Mind Crush',
    description: 'A devastating mental blow. 80% chance to Silence for 2 turn(s).',
    type: 'psychic', category: 'active', cooldown: 4, multiplier: 2.3,
    effects: [{ id: 'silence', value: 0, duration: 2, chance: 80 }],
    target: 'single_enemy',
  },
  homunculus_psychic_s2_1b: {
    id: 'homunculus_psychic_s2_1b',
    name: 'Mental Break',
    description: 'Strips every buff from the target and applies DEF Break.',
    type: 'psychic', category: 'active', cooldown: 4, multiplier: 2.0,
    effects: [
      { id: 'strip', value: 0, duration: 0, chance: 100 },
      { id: 'strip', value: 0, duration: 0, chance: 100 },
      { id: 'strip', value: 0, duration: 0, chance: 100 },
      { id: 'def_break', value: 0, duration: 2, chance: 100 },
    ],
    target: 'single_enemy',
  },
  homunculus_psychic_s2_2a: {
    id: 'homunculus_psychic_s2_2a',
    name: 'Psychic Wave',
    description: 'A wave that numbs all minds. 50% chance to Silence each for 2 turn(s).',
    type: 'psychic', category: 'active', cooldown: 4, multiplier: 1.6,
    effects: [{ id: 'silence', value: 0, duration: 2, chance: 50, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_psychic_s2_2b: {
    id: 'homunculus_psychic_s2_2b',
    name: 'Oppressive Aura',
    description: 'Crushes every enemy\'s will. 70% ATK Break for 2 turn(s).',
    type: 'psychic', category: 'active', cooldown: 4, multiplier: 1.5,
    effects: [{ id: 'atk_break', value: 0, duration: 2, chance: 70, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_psychic_p_1a: {
    id: 'homunculus_psychic_p_1a',
    name: 'Null Void',
    description: 'Passive: each attack has a 40% chance to Strip a buff from the target.',
    type: 'psychic', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'strip', value: 0, duration: 0, chance: 40 }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_psychic_p_1b: {
    id: 'homunculus_psychic_p_1b',
    name: 'Psi Shield',
    description: 'Passive: when hit, 35% chance to Silence the attacker for 1 turn.',
    type: 'psychic', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 35 }],
    target: 'self', passiveTrigger: 'on_hit_received',
  },
  homunculus_psychic_p_2a: {
    id: 'homunculus_psychic_p_2a',
    name: 'Telepath',
    description: 'Passive: on attack, 50% chance to gain Crit Rate Up for 1 turn.',
    type: 'psychic', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 1, chance: 50, target: 'self' }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_psychic_p_2b: {
    id: 'homunculus_psychic_p_2b',
    name: 'Overmind',
    description: 'Passive: on critical hit, Silences all enemies for 2 turn(s).',
    type: 'psychic', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies', passiveTrigger: 'on_crit',
  },

  // ════════════════════════════════════════════════════════════════════════
  // ⚫ DARK — bleed + lifesteal + execution
  // ════════════════════════════════════════════════════════════════════════
  homunculus_dark_basic: {
    id: 'homunculus_dark_basic',
    name: 'Shadow Claw',
    description: 'A vicious shadow slash. 20% chance to Bleed.',
    type: 'dark', category: 'basic', cooldown: 0, multiplier: 0.95,
    effects: [{ id: 'bleed', value: 0, duration: 3, chance: 20 }],
    target: 'single_enemy',
  },
  homunculus_dark_base_a: {
    id: 'homunculus_dark_base_a',
    name: 'Rending Claw',
    description: 'A tearing strike. 40% chance to apply 2 stacks of Bleed.',
    type: 'dark', category: 'basic', cooldown: 0, multiplier: 1.15,
    effects: [
      { id: 'bleed', value: 0, duration: 3, chance: 40 },
      { id: 'bleed', value: 0, duration: 3, chance: 40 },
    ],
    target: 'single_enemy',
  },
  homunculus_dark_base_b: {
    id: 'homunculus_dark_base_b',
    name: 'Shadow Volley',
    description: 'Shadow shards rake every enemy. 30% chance to Bleed each.',
    type: 'dark', category: 'basic', cooldown: 0, multiplier: 0.9,
    effects: [{ id: 'bleed', value: 0, duration: 3, chance: 30, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_dark_s2_1a: {
    id: 'homunculus_dark_s2_1a',
    name: "Executioner's Blade",
    description: 'A killing stroke. Guaranteed 3 stacks of Bleed.',
    type: 'dark', category: 'active', cooldown: 4, multiplier: 2.4,
    effects: [
      { id: 'bleed', value: 0, duration: 3, chance: 100 },
      { id: 'bleed', value: 0, duration: 3, chance: 100 },
      { id: 'bleed', value: 0, duration: 3, chance: 100 },
    ],
    target: 'single_enemy',
  },
  homunculus_dark_s2_1b: {
    id: 'homunculus_dark_s2_1b',
    name: 'Soul Reap',
    description: 'Strikes and gains Vampire, recovering HP from damage dealt.',
    type: 'dark', category: 'active', cooldown: 4, multiplier: 2.0,
    effects: [{ id: 'vampire', value: 0, duration: 3, chance: 100, target: 'self' }],
    target: 'single_enemy',
  },
  homunculus_dark_s2_2a: {
    id: 'homunculus_dark_s2_2a',
    name: 'Nightfall',
    description: 'Drowns every enemy in darkness. 50% chance to Bleed each.',
    type: 'dark', category: 'active', cooldown: 4, multiplier: 1.5,
    effects: [{ id: 'bleed', value: 0, duration: 3, chance: 50, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_dark_s2_2b: {
    id: 'homunculus_dark_s2_2b',
    name: 'Void Howl',
    description: 'A terrible cry. 55% chance to apply ATK Break to each enemy.',
    type: 'dark', category: 'active', cooldown: 4, multiplier: 1.4,
    effects: [{ id: 'atk_break', value: 0, duration: 2, chance: 55, target: 'all_enemies' }],
    target: 'all_enemies',
  },
  homunculus_dark_p_1a: {
    id: 'homunculus_dark_p_1a',
    name: 'Bloodthirst',
    description: 'Passive: on attack, 50% chance to gain Vampire for 2 turn(s).',
    type: 'dark', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 50, target: 'self' }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_dark_p_1b: {
    id: 'homunculus_dark_p_1b',
    name: 'Undying Will',
    description: 'Passive: gains Soul Protect at the start of battle — revives once at 30% HP on lethal damage.',
    type: 'dark', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'soul_protect', value: 0, duration: 0, chance: 100, target: 'self' }],
    target: 'self', passiveTrigger: 'battle_start',
  },
  homunculus_dark_p_2a: {
    id: 'homunculus_dark_p_2a',
    name: 'Dark Presence',
    description: 'Passive: each attack has a 40% chance to apply DEF Break.',
    type: 'dark', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 40 }],
    target: 'self', passiveTrigger: 'on_attack',
  },
  homunculus_dark_p_2b: {
    id: 'homunculus_dark_p_2b',
    name: 'Killing Edge',
    description: 'Passive: each attack has a 60% chance to apply 2 stacks of Bleed.',
    type: 'dark', category: 'passive', cooldown: 0, multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 3, chance: 60 },
      { id: 'bleed', value: 0, duration: 3, chance: 60 },
    ],
    target: 'self', passiveTrigger: 'on_attack',
  },
};
