import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN5_SHINY_SKILLS: Record<string, SkillDefinition> = {
  // --- victini (psychic/fire) ---
  // Original: hp_threshold(<30%) self amplify + crit_dmg_buff => Alt: battle_start all_allies atk_buff + spd_buff
  victini_skill3b: {
    id: 'victini_skill3b',
    name: 'Victory Star',
    description: 'Passive: applies ATK Buff for 2 turn(s) and SPD Buff for 2 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- snivy (grass) ---
  // Original: on_crit self cd_reduce => Alt: on_attack apply poison
  snivy_skill3b: {
    id: 'snivy_skill3b',
    name: 'Contrary',
    description: 'Passive: applies Poison for 2 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- servine (grass) ---
  // Original: always self res_buff => Alt: on_hit_received all_allies heal
  servine_skill3b: {
    id: 'servine_skill3b',
    name: 'Contrary',
    description: 'Passive: heals all allies for 3% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- serperior (grass) ---
  // Original: battle_start all_allies recovery => Alt: on_hit_received self counter + reflect
  serperior_skill3b: {
    id: 'serperior_skill3b',
    name: 'Contrary',
    description: 'Passive: applies Counter for 1 turn(s) and Reflect for 1 turn(s) (30% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- tepig (fire) ---
  // Original: battle_start self atb_boost => Alt: on_attack burn
  tepig_skill3b: {
    id: 'tepig_skill3b',
    name: 'Thick Fat',
    description: 'Passive: applies Burn for 1 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pignite (fire/fighting) ---
  // Original: on_kill self atk_buff => Alt: on_hit_received self def_buff
  pignite_skill3b: {
    id: 'pignite_skill3b',
    name: 'Thick Fat',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- emboar (fire/fighting) ---
  // Original: on_attack burn (30%) => Alt: on_crit self amplify + atk_buff
  emboar_skill3b: {
    id: 'emboar_skill3b',
    name: 'Reckless',
    description: 'Passive: applies Amplify for 2 turn(s) and ATK Buff for 1 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- oshawott (water) ---
  // Original: on_attack steal_buff (15%) => Alt: turn_start all_allies cleanse
  oshawott_skill3b: {
    id: 'oshawott_skill3b',
    name: 'Shell Armor',
    description: 'Passive: removes 1 debuff(s) from all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- dewott (water) ---
  // Original: turn_start all_allies extend_buffs => Alt: on_attack acc_break
  dewott_skill3b: {
    id: 'dewott_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies ACC Break for 2 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_break', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- samurott (water) ---
  // Original: on_attack acc_break (29%) => Alt: battle_start all_allies immunity
  samurott_skill3b: {
    id: 'samurott_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies Immunity for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- patrat (normal) ---
  // Original: turn_start all_allies atb_boost (10%) => Alt: on_attack def_break
  patrat_skill3b: {
    id: 'patrat_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies DEF Break for 1 turn(s) (22% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- watchog (normal) ---
  // Original: battle_start all_allies immunity => Alt: on_hit_received self counter
  watchog_skill3b: {
    id: 'watchog_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Counter for 1 turn(s) (28% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 28, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- lillipup (normal) ---
  // Original: on_crit self crit_dmg_buff => Alt: on_attack spd_slow
  lillipup_skill3b: {
    id: 'lillipup_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: applies Slow for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- herdier (normal) ---
  // Original: on_attack absorb_atb (15%, 23%) => Alt: on_hit_received self shield
  herdier_skill3b: {
    id: 'herdier_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- stoutland (normal) ---
  // Original: on_attack absorb_atb (10%, 22%) => Alt: battle_start all_allies atk_buff
  stoutland_skill3b: {
    id: 'stoutland_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: applies ATK Buff for 2 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- purrloin (dark) ---
  // Original: turn_start all_enemies strip => Alt: on_attack silence
  purrloin_skill3b: {
    id: 'purrloin_skill3b',
    name: 'Prankster',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- liepard (dark) ---
  // Original: on_attack steal_buff (15%) => Alt: on_crit self evasion + spd_buff
  liepard_skill3b: {
    id: 'liepard_skill3b',
    name: 'Prankster',
    description: 'Passive: applies Evasion for 1 turn(s) and SPD Buff for 1 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- pansage (grass) ---
  // Original: on_crit cd_increase (on enemy) => Alt: on_attack unrecoverable
  pansage_skill3b: {
    id: 'pansage_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Unrecoverable for 2 turn(s) (22% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'unrecoverable', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- simisage (grass) ---
  // Original: battle_start self threat + shield => Alt: on_attack bleed + poison
  simisage_skill3b: {
    id: 'simisage_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Bleed for 2 turn(s) (25% chance) and Poison for 2 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 25 },
      { id: 'poison', value: 0, duration: 2, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pansear (fire) ---
  // Original: on_attack self atb_boost (15%, 29%) => Alt: battle_start all_allies crit_rate_buff
  pansear_skill3b: {
    id: 'pansear_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s) to all allies.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- simisear (fire) ---
  // Original: on_attack detonate (20%) => Alt: on_crit burn + brand
  simisear_skill3b: {
    id: 'simisear_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Burn for 2 turn(s) (35% chance) and Brand for 1 turn(s) (35% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 35 },
      { id: 'brand', value: 0, duration: 1, chance: 35 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- panpour (water) ---
  // Original: on_ally_death all_allies atb_boost (15%) => Alt: turn_start all_allies recovery
  panpour_skill3b: {
    id: 'panpour_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Recovery for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- simipour (water) ---
  // Original: battle_start all_allies nullify => Alt: on_hit_received all_allies heal
  simipour_skill3b: {
    id: 'simipour_skill3b',
    name: 'Gluttony',
    description: 'Passive: heals all allies for 3% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- munna (psychic) ---
  // Original: on_hit_received glancing (30%) => Alt: on_attack sleep
  munna_skill3b: {
    id: 'munna_skill3b',
    name: 'Synchronize',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'sleep', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- musharna (psychic) ---
  // Original: on_attack anti_heal (23%) => Alt: on_hit_received self shield + def_buff
  musharna_skill3b: {
    id: 'musharna_skill3b',
    name: 'Synchronize',
    description: 'Passive: applies Shield for 2 turn(s) and DEF Buff for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- pidove (normal/flying) ---
  // Original: on_kill self skill_refresh => Alt: on_attack spd_slow
  pidove_skill3b: {
    id: 'pidove_skill3b',
    name: 'Big Pecks',
    description: 'Passive: applies Slow for 1 turn(s) (22% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tranquill (normal/flying) ---
  // Original: battle_start all_allies def_buff => Alt: on_crit self atb_boost + crit_dmg_buff
  tranquill_skill3b: {
    id: 'tranquill_skill3b',
    name: 'Big Pecks',
    description: 'Passive: boosts ATB by 20% and applies Crit DMG Buff for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- unfezant (normal/flying) ---
  // Original: on_ally_death revive (CD 6) => Alt: battle_start all_allies shield
  unfezant_skill3b: {
    id: 'unfezant_skill3b',
    name: 'Big Pecks',
    description: 'Passive: applies Shield for 3 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 18, duration: 3, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- blitzle (electric) ---
  // Original: on_attack steal_buff (15%) => Alt: on_hit_received paralysis
  blitzle_skill3b: {
    id: 'blitzle_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: applies Paralysis for 1 turn(s) (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- zebstrika (electric) ---
  // Original: always self acc_buff => Alt: on_attack atb_reduce
  zebstrika_skill3b: {
    id: 'zebstrika_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: reduces ATB by 15% (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 15, duration: 0, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- roggenrola (rock) ---
  // Original: hp_threshold(<50%) self shield + def_buff => Alt: on_attack atk_break
  roggenrola_skill3b: {
    id: 'roggenrola_skill3b',
    name: 'Weak Armor',
    description: 'Passive: applies ATK Break for 2 turn(s) (25% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_break', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- boldore (rock) ---
  // Original: on_crit self atb_boost + spd_buff => Alt: battle_start all_allies def_buff
  boldore_skill3b: {
    id: 'boldore_skill3b',
    name: 'Weak Armor',
    description: 'Passive: applies DEF Buff for 2 turn(s) to all allies.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- gigalith (rock) ---
  // Original: battle_start all_allies def_buff => Alt: on_hit_received self counter + threat
  gigalith_skill3b: {
    id: 'gigalith_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Counter for 1 turn(s) and Threat for 1 turn(s) (30% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'threat', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- woobat (psychic/flying) ---
  // Original: on_attack bleed (30%) => Alt: on_hit_received self nullify
  woobat_skill3b: {
    id: 'woobat_skill3b',
    name: 'Simple',
    description: 'Passive: applies Nullify for 1 turn(s) (30% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- swoobat (psychic/flying) ---
  // Original: on_kill self atb_boost (50%) => Alt: on_attack confusion
  swoobat_skill3b: {
    id: 'swoobat_skill3b',
    name: 'Simple',
    description: 'Passive: applies Confusion for 1 turn(s) (22% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- drilbur (ground) ---
  // Original: on_hit_received all_allies balance_hp => Alt: on_attack def_break
  drilbur_skill3b: {
    id: 'drilbur_skill3b',
    name: 'Sand Rush',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- excadrill (ground/steel) ---
  // Original: on_hit_received self reflect (31%) => Alt: on_crit atb_boost + cd_reduce
  excadrill_skill3b: {
    id: 'excadrill_skill3b',
    name: 'Sand Rush',
    description: 'Passive: boosts ATB by 25% and reduces cooldowns by 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- audino (normal) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: turn_start all_allies heal
  audino_skill3b: {
    id: 'audino_skill3b',
    name: 'Healer',
    description: 'Passive: heals all allies for 5% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- timburr (fighting) ---
  // Original: on_crit self atb_boost (20%) => Alt: on_attack expose
  timburr_skill3b: {
    id: 'timburr_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies Expose for 1 turn(s) (20% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gurdurr (fighting) ---
  // Original: on_attack expose (25%) => Alt: on_hit_received self endure
  gurdurr_skill3b: {
    id: 'gurdurr_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- conkeldurr (fighting) ---
  // Original: always self amplify => Alt: on_attack brand + def_break
  conkeldurr_skill3b: {
    id: 'conkeldurr_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies Brand for 2 turn(s) (30% chance) and DEF Break for 1 turn(s) (30% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 30 },
      { id: 'def_break', value: 0, duration: 1, chance: 30 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tympole (water) ---
  // Original: on_attack bleed (20%) => Alt: on_hit_received self recovery
  tympole_skill3b: {
    id: 'tympole_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- palpitoad (water/ground) ---
  // Original: hp_threshold(<33%) self endure => Alt: on_attack spd_slow
  palpitoad_skill3b: {
    id: 'palpitoad_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Slow for 1 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- seismitoad (water/ground) ---
  // Original: battle_start all_allies spd_buff => Alt: on_hit_received all_allies heal
  seismitoad_skill3b: {
    id: 'seismitoad_skill3b',
    name: 'Swift Swim',
    description: 'Passive: heals all allies for 3% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- throh (fighting) ---
  // Original: on_attack expose (32%) => Alt: on_hit_received self vampire
  throh_skill3b: {
    id: 'throh_skill3b',
    name: 'Mold Breaker',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- sawk (fighting) ---
  // Original: always self amplify => Alt: on_kill self atb_boost + cd_reduce
  sawk_skill3b: {
    id: 'sawk_skill3b',
    name: 'Mold Breaker',
    description: 'Passive: boosts ATB by 50% and reduces cooldowns by 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- sewaddle (bug/grass) ---
  // Original: on_crit self atb_boost + spd_buff => Alt: on_attack seal
  sewaddle_skill3b: {
    id: 'sewaddle_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: applies Seal for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- swadloon (bug/grass) ---
  // Original: on_attack atb_reduce (10%, 33%) => Alt: on_hit_received self shield
  swadloon_skill3b: {
    id: 'swadloon_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 14, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- leavanny (bug/grass) ---
  // Original: on_attack self atb_boost (15%, 31%) => Alt: battle_start all_allies acc_buff
  leavanny_skill3b: {
    id: 'leavanny_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: applies ACC Buff for 2 turn(s) to all allies.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- venipede (bug/poison) ---
  // Original: turn_start all_allies atb_boost (10%) => Alt: on_attack poison
  venipede_skill3b: {
    id: 'venipede_skill3b',
    name: 'Speed Boost',
    description: 'Passive: applies Poison for 2 turn(s) (22% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- whirlipede (bug/poison) ---
  // Original: on_attack mark (21%) => Alt: on_hit_received self reflect
  whirlipede_skill3b: {
    id: 'whirlipede_skill3b',
    name: 'Speed Boost',
    description: 'Passive: applies Reflect for 1 turn(s) (28% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 28, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- scolipede (bug/poison) ---
  // Original: battle_start all_allies recovery => Alt: on_attack bomb
  scolipede_skill3b: {
    id: 'scolipede_skill3b',
    name: 'Speed Boost',
    description: 'Passive: applies Bomb for 2 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cottonee (grass/fairy) ---
  // Original: on_attack self atb_boost (15%, 29%) => Alt: on_hit_received all_allies cleanse
  cottonee_skill3b: {
    id: 'cottonee_skill3b',
    name: 'Prankster',
    description: 'Passive: removes 1 debuff(s) from all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- whimsicott (grass/fairy) ---
  // Original: battle_start all_allies nullify => Alt: on_ally_death all_allies heal + immunity
  whimsicott_skill3b: {
    id: 'whimsicott_skill3b',
    name: 'Prankster',
    description: 'Passive: heals all allies for 10% HP and applies Immunity for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- petilil (grass) ---
  // Original: on_hit_received all_allies heal (3%) => Alt: on_attack anti_heal
  petilil_skill3b: {
    id: 'petilil_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: applies Anti-Heal for 2 turn(s) (22% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'anti_heal', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- lilligant (grass) ---
  // Original: on_hit_received all_allies balance_hp => Alt: battle_start all_allies spd_buff + atb_boost
  lilligant_skill3b: {
    id: 'lilligant_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: applies SPD Buff for 2 turn(s) and boosts ATB by 15% to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- sandile (ground/dark) ---
  // Original: on_attack mark (24%) => Alt: on_crit self atk_buff
  sandile_skill3b: {
    id: 'sandile_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- krokorok (ground/dark) ---
  // Original: on_attack atb_reduce (10%, 29%) => Alt: on_hit_received self shield + def_buff
  krokorok_skill3b: {
    id: 'krokorok_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Shield for 2 turn(s) and DEF Buff for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 14, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- krookodile (ground/dark) ---
  // Original: battle_start all_enemies bomb => Alt: on_attack bleed + expose
  krookodile_skill3b: {
    id: 'krookodile_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Bleed for 2 turn(s) (30% chance) and Expose for 1 turn(s) (30% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 30 },
      { id: 'expose', value: 0, duration: 1, chance: 30 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- darumaka (fire) ---
  // Original: always self amplify => Alt: on_attack burn + brand
  darumaka_skill3b: {
    id: 'darumaka_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Burn for 1 turn(s) (28% chance) and Brand for 1 turn(s) (28% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 28 },
      { id: 'brand', value: 0, duration: 1, chance: 28 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- darmanitan_zen (fire/psychic) ---
  // Original: on_attack burn (26%) => Alt: hp_threshold self invincibility + recovery
  darmanitan_zen_skill3b: {
    id: 'darmanitan_zen_skill3b',
    name: 'Zen Mode',
    description: 'Passive: applies Invincibility for 1 turn(s) and Recovery for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'invincibility', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- maractus (grass) ---
  // Original: on_ally_death all_allies atb_boost (15%) => Alt: on_attack unrecoverable + anti_heal
  maractus_skill3b: {
    id: 'maractus_skill3b',
    name: 'Storm Drain',
    description: 'Passive: applies Unrecoverable for 2 turn(s) (25% chance) and Anti-Heal for 1 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'unrecoverable', value: 0, duration: 2, chance: 25 },
      { id: 'anti_heal', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dwebble (bug/rock) ---
  // Original: on_kill self skill_refresh => Alt: on_hit_received self endure
  dwebble_skill3b: {
    id: 'dwebble_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- crustle (bug/rock) ---
  // Original: battle_start self threat + shield => Alt: on_attack mark + def_break
  crustle_skill3b: {
    id: 'crustle_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies Mark for 2 turn(s) (25% chance) and DEF Break for 1 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'mark', value: 0, duration: 2, chance: 25 },
      { id: 'def_break', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- scraggy (dark/fighting) ---
  // Original: hp_threshold(<50%) self vampire => Alt: on_attack steal_buff
  scraggy_skill3b: {
    id: 'scraggy_skill3b',
    name: 'Moxie',
    description: 'Passive: steals 1 buff(s) from the enemy (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- scrafty (dark/fighting) ---
  // Original: hp_threshold(<33%) self endure => Alt: on_kill self atk_buff + crit_rate_buff
  scrafty_skill3b: {
    id: 'scrafty_skill3b',
    name: 'Moxie',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Crit Rate Buff for 2 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- sigilyph (psychic/flying) ---
  // Original: turn_start all_allies shorten_debuffs => Alt: battle_start all_allies immunity
  sigilyph_skill3b: {
    id: 'sigilyph_skill3b',
    name: 'Magic Guard',
    description: 'Passive: applies Immunity for 2 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- yamask (ghost) ---
  // Original: on_attack res_break (20%) => Alt: on_hit_received self reflect + glancing
  yamask_skill3b: {
    id: 'yamask_skill3b',
    name: 'Mummy',
    description: 'Passive: applies Reflect for 1 turn(s) (25% chance) and Glancing Hit for 1 turn(s) (25% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'glancing', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- cofagrigus (ghost) ---
  // Original: on_attack mark (22%) => Alt: battle_start all_enemies oblivion
  cofagrigus_skill3b: {
    id: 'cofagrigus_skill3b',
    name: 'Mummy',
    description: 'Passive: applies Oblivion for 2 turn(s) to all enemies.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- tirtouga (water/rock) ---
  // Original: on_attack steal_buff (15%) => Alt: on_hit_received self shield + def_buff
  tirtouga_skill3b: {
    id: 'tirtouga_skill3b',
    name: 'Solid Rock',
    description: 'Passive: applies Shield for 2 turn(s) and DEF Buff for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- carracosta (water/rock) ---
  // Original: battle_start all_allies nullify => Alt: on_ally_death all_allies heal + immunity
  carracosta_skill3b: {
    id: 'carracosta_skill3b',
    name: 'Solid Rock',
    description: 'Passive: heals all allies for 15% HP and applies Immunity for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- archen (rock/flying) ---
  // Original: hp_threshold(<50%) self shield + def_buff => Alt: on_crit self atk_buff + crit_dmg_buff
  archen_skill3b: {
    id: 'archen_skill3b',
    name: 'Defeatist',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Crit DMG Buff for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- archeops (rock/flying) ---
  // Original: on_attack freeze (45%) => Alt: battle_start self amplify + crit_rate_buff
  archeops_skill3b: {
    id: 'archeops_skill3b',
    name: 'Defeatist',
    description: 'Passive: applies Amplify for 2 turn(s) and Crit Rate Buff for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- trubbish (poison) ---
  // Original: battle_start all_allies soul_protect => Alt: on_attack poison + buff_block
  trubbish_skill3b: {
    id: 'trubbish_skill3b',
    name: 'Aftermath',
    description: 'Passive: applies Poison for 2 turn(s) (25% chance) and Buff Block for 1 turn(s) (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 2, chance: 25 },
      { id: 'buff_block', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- garbodor (poison) ---
  // Original: battle_start all_allies immunity => Alt: on_hit_received self counter + reflect
  garbodor_skill3b: {
    id: 'garbodor_skill3b',
    name: 'Aftermath',
    description: 'Passive: applies Counter for 1 turn(s) and Reflect for 1 turn(s) (30% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- zorua (dark) ---
  // Original: battle_start self atb_boost (20%) => Alt: on_attack silence + oblivion
  zorua_skill3b: {
    id: 'zorua_skill3b',
    name: 'Illusion',
    description: 'Passive: applies Silence for 1 turn(s) (18% chance) and Oblivion for 1 turn(s) (18% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 18 },
      { id: 'oblivion', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- zoroark (dark) ---
  // Original: battle_start all_enemies bomb => Alt: on_attack strip + seal
  zoroark_skill3b: {
    id: 'zoroark_skill3b',
    name: 'Illusion',
    description: 'Passive: strips 1 buff(s) and applies Seal for 1 turn(s) (22% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 22, target: 'all_enemies' },
      { id: 'seal', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- minccino (normal) ---
  // Original: on_kill self atk_buff => Alt: on_attack spd_buff + acc_buff
  minccino_skill3b: {
    id: 'minccino_skill3b',
    name: 'Skill Link',
    description: 'Passive: applies SPD Buff for 1 turn(s) (20% chance) and ACC Buff for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 20, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cinccino (normal) ---
  // Original: turn_start self spd_buff => Alt: on_crit self atb_boost + skill_refresh
  cinccino_skill3b: {
    id: 'cinccino_skill3b',
    name: 'Skill Link',
    description: 'Passive: boosts ATB by 20% and applies Skill Refresh for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
      { id: 'skill_refresh', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- gothita (psychic) ---
  // Original: on_attack res_break (20%) => Alt: on_hit_received glancing
  gothita_skill3b: {
    id: 'gothita_skill3b',
    name: 'Shadow Tag',
    description: 'Passive: applies Glancing Hit for 2 turn(s) (25% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gothorita (psychic) ---
  // Original: on_attack confusion (20%) => Alt: battle_start all_enemies buff_block
  gothorita_skill3b: {
    id: 'gothorita_skill3b',
    name: 'Shadow Tag',
    description: 'Passive: applies Buff Block for 2 turn(s) to all enemies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- gothitelle (psychic) ---
  // Original: on_hit_received self counter (23%) => Alt: battle_start all_allies res_buff + def_buff
  gothitelle_skill3b: {
    id: 'gothitelle_skill3b',
    name: 'Shadow Tag',
    description: 'Passive: applies RES Buff for 2 turn(s) and DEF Buff for 2 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'res_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- solosis (psychic) ---
  // Original: hp_threshold(<40%) self soul_protect => Alt: on_attack silence
  solosis_skill3b: {
    id: 'solosis_skill3b',
    name: 'Magic Guard',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- duosion (psychic) ---
  // Original: on_attack mark (23%) => Alt: on_crit self cd_reduce
  duosion_skill3b: {
    id: 'duosion_skill3b',
    name: 'Magic Guard',
    description: 'Passive: reduces cooldowns by 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- reuniclus (psychic) ---
  // Original: battle_start all_enemies bomb => Alt: on_hit_received all_allies shield
  reuniclus_skill3b: {
    id: 'reuniclus_skill3b',
    name: 'Magic Guard',
    description: 'Passive: applies Shield for 2 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 16, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- ducklett (water/flying) ---
  // Original: on_ally_death revive (CD 6) => Alt: turn_start all_allies recovery
  ducklett_skill3b: {
    id: 'ducklett_skill3b',
    name: 'Hydration',
    description: 'Passive: applies Recovery for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- swanna (water/flying) ---
  // Original: on_hit_received all_allies heal (3%) => Alt: battle_start all_allies spd_buff
  swanna_skill3b: {
    id: 'swanna_skill3b',
    name: 'Hydration',
    description: 'Passive: applies SPD Buff for 2 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- vanillite (ice) ---
  // Original: on_crit self cd_reduce => Alt: on_attack freeze
  vanillite_skill3b: {
    id: 'vanillite_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies Freeze for 1 turn(s) (18% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- vanillish (ice) ---
  // Original: on_crit cd_increase (on enemy) => Alt: on_hit_received self evasion
  vanillish_skill3b: {
    id: 'vanillish_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies Evasion for 1 turn(s) (30% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- vanilluxe (ice) ---
  // Original: hp_threshold(<25%) self invincibility + recovery => Alt: battle_start all_allies def_buff + res_buff
  vanilluxe_skill3b: {
    id: 'vanilluxe_skill3b',
    name: 'Snow Warning',
    description: 'Passive: applies DEF Buff for 2 turn(s) and RES Buff for 2 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- deerling (normal/grass) ---
  // Original: on_kill self atb_boost (50%) => Alt: on_attack acc_break + spd_slow
  deerling_skill3b: {
    id: 'deerling_skill3b',
    name: 'Sap Sipper',
    description: 'Passive: applies ACC Break for 1 turn(s) (20% chance) and Slow for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_break', value: 0, duration: 1, chance: 20 },
      { id: 'spd_slow', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sawsbuck (normal/grass) ---
  // Original: on_kill self heal + cleanse => Alt: battle_start all_allies atk_buff + crit_rate_buff
  sawsbuck_skill3b: {
    id: 'sawsbuck_skill3b',
    name: 'Sap Sipper',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Crit Rate Buff for 2 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- emolga (electric/flying) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: on_attack paralysis + spd_slow
  emolga_skill3b: {
    id: 'emolga_skill3b',
    name: 'Motor Drive',
    description: 'Passive: applies Paralysis for 1 turn(s) (22% chance) and Slow for 1 turn(s) (22% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 22 },
      { id: 'spd_slow', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- karrablast (bug) ---
  // Original: on_attack self atb_boost (15%, 26%) => Alt: on_crit self amplify
  karrablast_skill3b: {
    id: 'karrablast_skill3b',
    name: 'No Guard',
    description: 'Passive: applies Amplify for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- escavalier (bug/steel) ---
  // Original: hp_threshold(<50%) self shield + def_buff => Alt: on_attack glancing + atk_break
  escavalier_skill3b: {
    id: 'escavalier_skill3b',
    name: 'Overcoat',
    description: 'Passive: applies Glancing Hit for 2 turn(s) (25% chance) and ATK Break for 1 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'glancing', value: 0, duration: 2, chance: 25 },
      { id: 'atk_break', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- foongus (grass/poison) ---
  // Original: battle_start all_allies nullify => Alt: on_attack poison + seal
  foongus_skill3b: {
    id: 'foongus_skill3b',
    name: 'Effect Spore',
    description: 'Passive: applies Poison for 2 turn(s) (22% chance) and Seal for 1 turn(s) (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 2, chance: 22 },
      { id: 'seal', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- amoonguss (grass/poison) ---
  // Original: on_kill self atb_boost (50%) => Alt: on_attack buff_block + silence
  amoonguss_skill3b: {
    id: 'amoonguss_skill3b',
    name: 'Effect Spore',
    description: 'Passive: applies Buff Block for 1 turn(s) (22% chance) and Silence for 1 turn(s) (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'buff_block', value: 0, duration: 1, chance: 22 },
      { id: 'silence', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- alomomola (water) ---
  // Original: always self acc_buff => Alt: on_hit_received all_allies recovery
  alomomola_skill3b: {
    id: 'alomomola_skill3b',
    name: 'Regenerator',
    description: 'Passive: applies Recovery for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- joltik (bug/electric) ---
  // Original: on_attack steal_buff (15%) => Alt: on_crit self spd_buff + atb_boost
  joltik_skill3b: {
    id: 'joltik_skill3b',
    name: 'Compound Eyes',
    description: 'Passive: applies SPD Buff for 1 turn(s) and boosts ATB by 15%.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- galvantula (bug/electric) ---
  // Original: battle_start self atb_boost (20%) => Alt: on_attack paralysis + acc_break
  galvantula_skill3b: {
    id: 'galvantula_skill3b',
    name: 'Compound Eyes',
    description: 'Passive: applies Paralysis for 1 turn(s) (22% chance) and ACC Break for 1 turn(s) (22% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 22 },
      { id: 'acc_break', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ferroseed (grass/steel) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: on_hit_received self counter
  ferroseed_skill3b: {
    id: 'ferroseed_skill3b',
    name: 'Iron Barbs',
    description: 'Passive: applies Counter for 1 turn(s) (30% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- ferrothorn (grass/steel) ---
  // Original: hp_threshold(<33%) self endure => Alt: battle_start self threat + counter + shield
  ferrothorn_skill3b: {
    id: 'ferrothorn_skill3b',
    name: 'Iron Barbs',
    description: 'Passive: applies Threat for 2 turn(s), Counter for 2 turn(s), and Shield for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'shield', value: 18, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- klink (steel) ---
  // Original: on_hit_received glancing (30%) => Alt: on_attack def_break
  klink_skill3b: {
    id: 'klink_skill3b',
    name: 'Clear Body',
    description: 'Passive: applies DEF Break for 1 turn(s) (22% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- klang (steel) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: on_crit self cd_reduce + amplify
  klang_skill3b: {
    id: 'klang_skill3b',
    name: 'Clear Body',
    description: 'Passive: reduces cooldowns by 1 turn(s) and applies Amplify for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- klinklang (steel) ---
  // Original: turn_start all_allies cleanse => Alt: battle_start all_allies shield + immunity
  klinklang_skill3b: {
    id: 'klinklang_skill3b',
    name: 'Clear Body',
    description: 'Passive: applies Shield for 2 turn(s) and Immunity for 1 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 16, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- tynamo (electric) ---
  // Original: on_kill self skill_refresh => Alt: on_attack atb_reduce
  tynamo_skill3b: {
    id: 'tynamo_skill3b',
    name: 'Levitate',
    description: 'Passive: reduces ATB by 10% (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- eelektrik (electric) ---
  // Original: battle_start self evasion => Alt: on_attack spd_slow + acc_break
  eelektrik_skill3b: {
    id: 'eelektrik_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Slow for 1 turn(s) (22% chance) and ACC Break for 1 turn(s) (22% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 22 },
      { id: 'acc_break', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- eelektross (electric) ---
  // Original: battle_start self evasion => Alt: on_attack strip + paralysis
  eelektross_skill3b: {
    id: 'eelektross_skill3b',
    name: 'Levitate',
    description: 'Passive: strips 1 buff(s) (20% chance) and applies Paralysis for 1 turn(s) (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 20, target: 'all_enemies' },
      { id: 'paralysis', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- elgyem (psychic) ---
  // Original: on_attack anti_heal (31%) => Alt: on_hit_received self nullify
  elgyem_skill3b: {
    id: 'elgyem_skill3b',
    name: 'Analytic',
    description: 'Passive: applies Nullify for 1 turn(s) (28% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 28, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- beheeyem (psychic) ---
  // Original: battle_start all_enemies expose => Alt: on_attack silence + confusion
  beheeyem_skill3b: {
    id: 'beheeyem_skill3b',
    name: 'Analytic',
    description: 'Passive: applies Silence for 1 turn(s) (22% chance) and Confusion for 1 turn(s) (22% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 22 },
      { id: 'confusion', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- litwick (ghost/fire) ---
  // Original: on_attack seal (20%) => Alt: on_crit self vampire + atb_boost
  litwick_skill3b: {
    id: 'litwick_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Vampire for 1 turn(s) and boosts ATB by 15%.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- lampent (ghost/fire) ---
  // Original: hp_threshold(<30%) self amplify + crit_dmg_buff => Alt: on_attack burn + bomb
  lampent_skill3b: {
    id: 'lampent_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Burn for 1 turn(s) (25% chance) and Bomb for 2 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 25 },
      { id: 'bomb', value: 0, duration: 2, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- chandelure (ghost/fire) ---
  // Original: on_crit self atk_buff + spd_buff => Alt: battle_start all_allies amplify
  chandelure_skill3b: {
    id: 'chandelure_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Amplify for 2 turn(s) to all allies.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- axew (dragon) ---
  // Original: on_kill self atb_boost + cd_reduce => Alt: on_attack expose + bleed
  axew_skill3b: {
    id: 'axew_skill3b',
    name: 'Mold Breaker',
    description: 'Passive: applies Expose for 1 turn(s) (25% chance) and Bleed for 1 turn(s) (25% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'expose', value: 0, duration: 1, chance: 25 },
      { id: 'bleed', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- fraxure (dragon) ---
  // Original: on_attack expose (32%) => Alt: on_kill self atb_boost + skill_refresh
  fraxure_skill3b: {
    id: 'fraxure_skill3b',
    name: 'Mold Breaker',
    description: 'Passive: boosts ATB by 50% and applies Skill Refresh for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' },
      { id: 'skill_refresh', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- haxorus (dragon) ---
  // Original: on_crit self atk_buff + spd_buff => Alt: always self crit_rate_buff
  haxorus_skill3b: {
    id: 'haxorus_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies Crit Rate Buff for 999 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- cubchoo (ice) ---
  // Original: on_attack detonate (20%) => Alt: on_hit_received self shield + evasion
  cubchoo_skill3b: {
    id: 'cubchoo_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies Shield for 1 turn(s) and Evasion for 1 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 12, duration: 1, chance: 100, target: 'self' },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- beartic (ice) ---
  // Original: on_kill self heal + cleanse => Alt: battle_start self amplify + crit_dmg_buff
  beartic_skill3b: {
    id: 'beartic_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Amplify for 2 turn(s) and Crit DMG Buff for 2 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- cryogonal (ice) ---
  // Original: on_attack anti_heal (36%) => Alt: on_hit_received self reflect + def_buff
  cryogonal_skill3b: {
    id: 'cryogonal_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Reflect for 1 turn(s) (30% chance) and DEF Buff for 1 turn(s) (30% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- shelmet (bug) ---
  // Original: hp_threshold(<33%) self endure => Alt: on_attack poison + seal
  shelmet_skill3b: {
    id: 'shelmet_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance) and Seal for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 20 },
      { id: 'seal', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- accelgor (bug) ---
  // Original: turn_start all_allies res_buff => Alt: on_attack spd_slow + cd_increase
  accelgor_skill3b: {
    id: 'accelgor_skill3b',
    name: 'Unburden',
    description: 'Passive: applies Slow for 1 turn(s) (25% chance) and increases cooldowns by 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 25 },
      { id: 'cd_increase', value: 1, duration: 0, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- stunfisk (ground/electric) ---
  // Original: on_crit self cd_reduce => Alt: on_hit_received paralysis + glancing
  stunfisk_skill3b: {
    id: 'stunfisk_skill3b',
    name: 'Limber',
    description: 'Passive: applies Paralysis for 1 turn(s) (25% chance) and Glancing Hit for 1 turn(s) (25% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 25 },
      { id: 'glancing', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- mienfoo (fighting) ---
  // Original: on_attack brand (26%) => Alt: on_crit self atb_boost + spd_buff
  mienfoo_skill3b: {
    id: 'mienfoo_skill3b',
    name: 'Inner Focus',
    description: 'Passive: boosts ATB by 20% and applies SPD Buff for 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- mienshao (fighting) ---
  // Original: on_attack brand (31%) => Alt: on_kill self heal + cleanse + atb_boost
  mienshao_skill3b: {
    id: 'mienshao_skill3b',
    name: 'Inner Focus',
    description: 'Passive: heals for 15% HP, removes 1 debuff(s), and boosts ATB by 30%.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- druddigon (dragon) ---
  // Original: on_attack detonate (20%) => Alt: on_hit_received self counter + def_buff
  druddigon_skill3b: {
    id: 'druddigon_skill3b',
    name: 'Rough Skin',
    description: 'Passive: applies Counter for 1 turn(s) (30% chance) and DEF Buff for 1 turn(s) (30% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- golett (ground/ghost) ---
  // Original: turn_start self recovery => Alt: on_attack provoke + atk_break
  golett_skill3b: {
    id: 'golett_skill3b',
    name: 'Iron Fist',
    description: 'Passive: applies Provoke for 1 turn(s) (22% chance) and ATK Break for 1 turn(s) (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 22 },
      { id: 'atk_break', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- golurk (ground/ghost) ---
  // Original: on_attack anti_heal (25%) => Alt: battle_start self threat + shield + counter
  golurk_skill3b: {
    id: 'golurk_skill3b',
    name: 'Iron Fist',
    description: 'Passive: applies Threat for 2 turn(s), Shield for 2 turn(s), and Counter for 2 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'shield', value: 18, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- pawniard (dark/steel) ---
  // Original: on_kill self atb_boost (50%) => Alt: on_attack strip + seal
  pawniard_skill3b: {
    id: 'pawniard_skill3b',
    name: 'Defiant',
    description: 'Passive: strips 1 buff(s) (20% chance) and applies Seal for 1 turn(s) (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 20, target: 'all_enemies' },
      { id: 'seal', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- bisharp (dark/steel) ---
  // Original: on_hit_received all_allies balance_hp => Alt: on_attack steal_buff + expose
  bisharp_skill3b: {
    id: 'bisharp_skill3b',
    name: 'Defiant',
    description: 'Passive: steals 1 buff(s) (20% chance) and applies Expose for 1 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'steal_buff', value: 1, duration: 0, chance: 20 },
      { id: 'expose', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- bouffalant (normal) ---
  // Original: hp_threshold(<50%) self vampire => Alt: on_attack brand + bleed
  bouffalant_skill3b: {
    id: 'bouffalant_skill3b',
    name: 'Sap Sipper',
    description: 'Passive: applies Brand for 2 turn(s) (28% chance) and Bleed for 1 turn(s) (28% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 28 },
      { id: 'bleed', value: 0, duration: 1, chance: 28 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- rufflet (normal/flying) ---
  // Original: on_attack self atb_boost (15%, 34%) => Alt: on_crit self crit_dmg_buff + amplify
  rufflet_skill3b: {
    id: 'rufflet_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s) and Amplify for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- braviary (normal/flying) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: on_kill self heal + atb_boost + skill_refresh
  braviary_skill3b: {
    id: 'braviary_skill3b',
    name: 'Sheer Force',
    description: 'Passive: heals for 15% HP, boosts ATB by 50%, and applies Skill Refresh for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' },
      { id: 'skill_refresh', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- vullaby (dark/flying) ---
  // Original: battle_start self atb_boost (20%) => Alt: on_hit_received self endure + def_buff
  vullaby_skill3b: {
    id: 'vullaby_skill3b',
    name: 'Overcoat',
    description: 'Passive: applies Endure for 1 turn(s) and DEF Buff for 1 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- mandibuzz (dark/flying) ---
  // Original: battle_start all_enemies bomb => Alt: on_attack bleed + poison + anti_heal
  mandibuzz_skill3b: {
    id: 'mandibuzz_skill3b',
    name: 'Overcoat',
    description: 'Passive: applies Bleed for 2 turn(s) (30% chance), Poison for 2 turn(s) (25% chance), and Anti-Heal for 1 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 30 },
      { id: 'poison', value: 0, duration: 2, chance: 25 },
      { id: 'anti_heal', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- heatmor (fire) ---
  // Original: battle_start all_enemies bomb => Alt: on_attack brand + burn
  heatmor_skill3b: {
    id: 'heatmor_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Brand for 2 turn(s) (30% chance) and Burn for 2 turn(s) (30% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 30 },
      { id: 'burn', value: 0, duration: 2, chance: 30 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- durant (bug/steel) ---
  // Original: on_ally_death self def_buff + endure => Alt: battle_start all_allies atk_buff + spd_buff
  durant_skill3b: {
    id: 'durant_skill3b',
    name: 'Hustle',
    description: 'Passive: applies ATK Buff for 2 turn(s) and SPD Buff for 2 turn(s) to all allies.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- deino (dark/dragon) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: on_attack steal_buff + mark
  deino_skill3b: {
    id: 'deino_skill3b',
    name: 'Hustle',
    description: 'Passive: steals 1 buff(s) (18% chance) and applies Mark for 1 turn(s) (22% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'steal_buff', value: 1, duration: 0, chance: 18 },
      { id: 'mark', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- zweilous (dark/dragon) ---
  // Original: on_attack expose (42%) => Alt: on_crit self amplify + atk_buff
  zweilous_skill3b: {
    id: 'zweilous_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Amplify for 2 turn(s) and ATK Buff for 1 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- hydreigon (dark/dragon) ---
  // Original: on_attack seal (20%) => Alt: battle_start all_enemies def_break + acc_break
  hydreigon_skill3b: {
    id: 'hydreigon_skill3b',
    name: 'Levitate',
    description: 'Passive: applies DEF Break for 2 turn(s) and ACC Break for 2 turn(s) to all enemies.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 2, chance: 100, target: 'all_enemies' },
      { id: 'acc_break', value: 0, duration: 2, chance: 100, target: 'all_enemies' },
    ],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- larvesta (bug/fire) ---
  // Original: on_attack atb_reduce (10%, 28%) => Alt: on_hit_received self shield + recovery
  larvesta_skill3b: {
    id: 'larvesta_skill3b',
    name: 'Flame Body',
    description: 'Passive: applies Shield for 1 turn(s) and Recovery for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 12, duration: 1, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- volcarona (bug/fire) ---
  // Original: on_crit self atb_boost + spd_buff => Alt: battle_start self amplify + crit_rate_buff + crit_dmg_buff
  volcarona_skill3b: {
    id: 'volcarona_skill3b',
    name: 'Flame Body',
    description: 'Passive: applies Amplify for 2 turn(s), Crit Rate Buff for 2 turn(s), and Crit DMG Buff for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- cobalion (steel/fighting) ---
  // Original: always self amplify => Alt: on_hit_received all_allies def_buff + shield
  cobalion_skill3b: {
    id: 'cobalion_skill3b',
    name: 'Justified',
    description: 'Passive: applies DEF Buff for 1 turn(s) and Shield for 2 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- terrakion (rock/fighting) ---
  // Original: battle_start self crit_rate_buff => Alt: on_attack expose + def_break
  terrakion_skill3b: {
    id: 'terrakion_skill3b',
    name: 'Justified',
    description: 'Passive: applies Expose for 2 turn(s) (40% chance) and DEF Break for 1 turn(s) (35% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'expose', value: 0, duration: 2, chance: 40 },
      { id: 'def_break', value: 0, duration: 1, chance: 35 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- virizion (grass/fighting) ---
  // Original: on_hit_received self nullify (43%) => Alt: battle_start all_allies immunity + res_buff
  virizion_skill3b: {
    id: 'virizion_skill3b',
    name: 'Justified',
    description: 'Passive: applies Immunity for 2 turn(s) and RES Buff for 2 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- reshiram (dragon/fire) ---
  // Original: on_attack brand (45%) => Alt: on_crit self amplify + atk_buff + crit_dmg_buff
  reshiram_skill3b: {
    id: 'reshiram_skill3b',
    name: 'Turboblaze',
    description: 'Passive: applies Amplify for 2 turn(s), ATK Buff for 2 turn(s), and Crit DMG Buff for 1 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- zekrom (dragon/electric) ---
  // Original: hp_threshold(<50%) self atb_boost + spd_buff => Alt: always self amplify + crit_rate_buff
  zekrom_skill3b: {
    id: 'zekrom_skill3b',
    name: 'Teravolt',
    description: 'Passive: applies Amplify for 999 turn(s) and Crit Rate Buff for 999 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 999, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- kyurem (dragon/ice) ---
  // Original: on_attack expose (52%) => Alt: battle_start all_enemies freeze + spd_slow
  kyurem_skill3b: {
    id: 'kyurem_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Freeze for 1 turn(s) (45% chance) and Slow for 2 turn(s) (50% chance) to all enemies.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 45, target: 'all_enemies' },
      { id: 'spd_slow', value: 0, duration: 2, chance: 50, target: 'all_enemies' },
    ],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- genesect (bug/steel) ---
  // Original: on_ally_death self def_buff + endure => Alt: battle_start all_allies atk_buff + acc_buff
  genesect_skill3b: {
    id: 'genesect_skill3b',
    name: 'Download',
    description: 'Passive: applies ATK Buff for 2 turn(s) and ACC Buff for 2 turn(s) to all allies.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },
};
