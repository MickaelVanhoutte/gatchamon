import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN4_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- grotle (grass) ---
  // Original: cleanse 1 debuff on all allies (turn_start)
  grotle_skill3b: {
    id: 'grotle_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies ATK Buff for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_kill',
  },

  // --- torterra (grass/ground) ---
  // Original: DEF buff all allies (battle_start)
  torterra_skill3b: {
    id: 'torterra_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Reflect for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- chimchar (fire) ---
  // Original: SPD buff all allies (battle_start)
  chimchar_skill3b: {
    id: 'chimchar_skill3b',
    name: 'Blaze',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- monferno (fire/fighting) ---
  // Original: Mark on attack (25%)
  monferno_skill3b: {
    id: 'monferno_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- infernape (fire/fighting) ---
  // Original: Nullify self on hit received (35%)
  infernape_skill3b: {
    id: 'infernape_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s), applies Amplify for 1 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- piplup (water) ---
  // Original: ATB boost + SPD buff self (hp_threshold < 50)
  piplup_skill3b: {
    id: 'piplup_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- prinplup (water) ---
  // Original: heal 5% all allies (turn_start)
  prinplup_skill3b: {
    id: 'prinplup_skill3b',
    name: 'Torrent',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- empoleon (water/steel) ---
  // Original: balance HP all allies (on_hit_received)
  empoleon_skill3b: {
    id: 'empoleon_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Immunity for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- starly (normal/flying) ---
  // Original: ATB boost 10% all allies (turn_start)
  starly_skill3b: {
    id: 'starly_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Glancing for 1 turn(s) (30% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- staravia (normal/flying) ---
  // Original: heal 15% + cleanse 1 self (on_kill)
  staravia_skill3b: {
    id: 'staravia_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- staraptor (normal/flying) ---
  // Original: SPD buff all allies (battle_start)
  staraptor_skill3b: {
    id: 'staraptor_skill3b',
    name: 'Adaptability',
    description: 'Passive: boosts ATB by 50%, applies ATK Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- bidoof (normal) ---
  // Original: ATB boost 15% self (on_attack, 24%)
  bidoof_skill3b: {
    id: 'bidoof_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- bibarel (normal/water) ---
  // Original: Nullify self (on_hit_received, 19%)
  bibarel_skill3b: {
    id: 'bibarel_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Counter for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- kricketot (bug) ---
  // Original: balance HP all allies (on_hit_received)
  kricketot_skill3b: {
    id: 'kricketot_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kricketune (bug) ---
  // Original: ATB boost 30% + SPD buff self (hp_threshold < 50)
  kricketune_skill3b: {
    id: 'kricketune_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Amplify for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- shinx (electric) ---
  // Original: ATB boost 50% self (on_kill)
  shinx_skill3b: {
    id: 'shinx_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- luxio (electric) ---
  // Original: SPD buff all allies (battle_start)
  luxio_skill3b: {
    id: 'luxio_skill3b',
    name: 'Static',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- luxray (electric) ---
  // Original: Evasion self (battle_start)
  luxray_skill3b: {
    id: 'luxray_skill3b',
    name: 'Static',
    description: 'Passive: applies DEF Break for 2 turn(s) (40% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 40 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- budew (grass/poison) ---
  // Original: heal 5% all allies (turn_start)
  budew_skill3b: {
    id: 'budew_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Poison for 2 turn(s) (30% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- roserade (grass/poison) ---
  // Original: detonate on attack (15%)
  roserade_skill3b: {
    id: 'roserade_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Poison for 2 turn(s) (40% chance), applies Anti Heal for 2 turn(s) (40% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 2, chance: 40 },
      { id: 'anti_heal', value: 0, duration: 2, chance: 40 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cranidos (rock) ---
  // Original: skill refresh self (on_kill)
  cranidos_skill3b: {
    id: 'cranidos_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies Crit Rate Buff for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- rampardos (rock) ---
  // Original: heal 15% self (on_ally_death)
  rampardos_skill3b: {
    id: 'rampardos_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Amplify for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- shieldon (rock/steel) ---
  // Original: shield + DEF buff self (hp_threshold < 50)
  shieldon_skill3b: {
    id: 'shieldon_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Threat for 2 turn(s), applies Counter for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- bastiodon (rock/steel) ---
  // Original: Soul Protect all allies (battle_start)
  bastiodon_skill3b: {
    id: 'bastiodon_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Reflect for 2 turn(s), applies Shield for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 20, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- burmy (bug) ---
  // Original: skill refresh self (on_kill)
  burmy_skill3b: {
    id: 'burmy_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Evasion for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- turtwig (grass) ---
  // Original: ATB boost 15% all allies (on_ally_death)
  turtwig_skill3b: {
    id: 'turtwig_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 10% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- mothim (bug/flying) ---
  // Original: SPD buff self (turn_start)
  mothim_skill3b: {
    id: 'mothim_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- combee (bug/flying) ---
  // Original: strip 1 buff all enemies (turn_start)
  combee_skill3b: {
    id: 'combee_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- vespiquen (bug/flying) ---
  // Original: ATB reduce 15% on hit received (18%)
  vespiquen_skill3b: {
    id: 'vespiquen_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- pachirisu (electric) ---
  // Original: ATB boost 10% all allies (turn_start)
  pachirisu_skill3b: {
    id: 'pachirisu_skill3b',
    name: 'Static',
    description: 'Passive: removes 1 debuff(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- buizel (water) ---
  // Original: Nullify all allies (battle_start)
  buizel_skill3b: {
    id: 'buizel_skill3b',
    name: 'Torrent',
    description: 'Passive: applies SPD Buff for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 999, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- floatzel (water) ---
  // Original: Soul Protect self (hp_threshold < 40)
  floatzel_skill3b: {
    id: 'floatzel_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Vampire for 2 turn(s), applies ATK Buff for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- cherubi (grass) ---
  // Original: absorb ATB 15% on attack (25%)
  cherubi_skill3b: {
    id: 'cherubi_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 8% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 8, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- cherrim (grass) ---
  // Original: RES buff all allies (turn_start)
  cherrim_skill3b: {
    id: 'cherrim_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Immunity for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- shellos (water) ---
  // Original: extend buffs all allies (turn_start)
  shellos_skill3b: {
    id: 'shellos_skill3b',
    name: 'Torrent',
    description: 'Passive: shortens debuff durations by 1 turn.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- gastrodon (water/ground) ---
  // Original: DEF buff all allies (battle_start)
  gastrodon_skill3b: {
    id: 'gastrodon_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 10% HP, removes 1 debuff(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- ambipom (normal) ---
  // Original: counter self (on_hit_received, 30%)
  ambipom_skill3b: {
    id: 'ambipom_skill3b',
    name: 'Adaptability',
    description: 'Passive: steals 1 buff(s) from the enemy (25% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- drifloon (ghost/flying) ---
  // Original: Soul Protect self (hp_threshold < 40)
  drifloon_skill3b: {
    id: 'drifloon_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Silence for 1 turn(s) (30% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- drifblim (ghost/flying) ---
  // Original: transfer debuff on attack (25%)
  drifblim_skill3b: {
    id: 'drifblim_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Bomb for 2 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- buneary (normal) ---
  // Original: ATB boost 30% + cd reduce self (on_kill)
  buneary_skill3b: {
    id: 'buneary_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies SPD Buff for 1 turn(s), applies Evasion for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- lopunny (normal) ---
  // Original: ATK + SPD buff self (on_crit)
  lopunny_skill3b: {
    id: 'lopunny_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies DEF Break for 1 turn(s) (35% chance), applies Glancing for 1 turn(s) (35% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 35 },
      { id: 'glancing', value: 0, duration: 1, chance: 35 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- mismagius (ghost) ---
  // Original: ACC break on attack (36%)
  mismagius_skill3b: {
    id: 'mismagius_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'sleep', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- honchkrow (dark/flying) ---
  // Original: Expose on attack (31%)
  honchkrow_skill3b: {
    id: 'honchkrow_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- glameow (normal) ---
  // Original: RES break on attack (28%)
  glameow_skill3b: {
    id: 'glameow_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Evasion for 1 turn(s) (35% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- purugly (normal) ---
  // Original: cd reduce self (on_crit, 25%)
  purugly_skill3b: {
    id: 'purugly_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies Crit Rate Buff for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- chingling (psychic) ---
  // Original: heal 15% self (on_ally_death)
  chingling_skill3b: {
    id: 'chingling_skill3b',
    name: 'Inner Focus',
    description: 'Passive: reduces cooldowns by 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- stunky (poison/dark) ---
  // Original: Expose all enemies (battle_start)
  stunky_skill3b: {
    id: 'stunky_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 2 turn(s) (35% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 35 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- skuntank (poison/dark) ---
  // Original: RES break on attack (35%)
  skuntank_skill3b: {
    id: 'skuntank_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Buff Block for 2 turn(s) (30% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- bronzor (steel/psychic) ---
  // Original: invincibility + recovery self (hp_threshold < 25)
  bronzor_skill3b: {
    id: 'bronzor_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies DEF Buff for 2 turn(s), applies Reflect for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- bronzong (steel/psychic) ---
  // Original: Threat + Shield self (battle_start)
  bronzong_skill3b: {
    id: 'bronzong_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Provoke for 1 turn(s) (30% chance), reduces ATB by 15%.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 30 },
      { id: 'atb_reduce', value: 15, duration: 0, chance: 30 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- bonsly (rock) ---
  // Original: cd reduce self (on_crit, 25%)
  bonsly_skill3b: {
    id: 'bonsly_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Counter for 1 turn(s) (35% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- mimejr (psychic/fairy) ---
  // Original: revive 20% (on_ally_death, 6 CD)
  mimejr_skill3b: {
    id: 'mimejr_skill3b',
    name: 'Inner Focus',
    description: 'Passive: heals for 10% HP, applies Immunity for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- happiny (normal) ---
  // Original: DEF buff all allies (battle_start)
  happiny_skill3b: {
    id: 'happiny_skill3b',
    name: 'Adaptability',
    description: 'Passive: heals for 5% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- chatot (normal/flying) ---
  // Original: ATB reduce on attack (34%)
  chatot_skill3b: {
    id: 'chatot_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Confusion for 1 turn(s) (25% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- spiritomb (ghost/dark) ---
  // Original: ATK break all enemies (battle_start)
  spiritomb_skill3b: {
    id: 'spiritomb_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Oblivion for 2 turn(s) (25% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gible (dragon/ground) ---
  // Original: Endure self (hp_threshold < 33)
  gible_skill3b: {
    id: 'gible_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies ATK Break for 1 turn(s) (30% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_break', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gabite (dragon/ground) ---
  // Original: SPD buff self (turn_start)
  gabite_skill3b: {
    id: 'gabite_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Bleed for 2 turn(s) (30% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- garchomp (dragon/ground) ---
  // Original: Crit Rate Buff self (battle_start)
  garchomp_skill3b: {
    id: 'garchomp_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Vampire for 2 turn(s), applies ATK Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- munchlax (normal) ---
  // Original: detonate on attack (20%)
  munchlax_skill3b: {
    id: 'munchlax_skill3b',
    name: 'Adaptability',
    description: 'Passive: heals for 10% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 10, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- riolu (fighting) ---
  // Original: SPD buff self (turn_start)
  riolu_skill3b: {
    id: 'riolu_skill3b',
    name: 'Guts',
    description: 'Passive: applies ATK Buff for 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- lucario (fighting/steel) ---
  // Original: recovery self (turn_start)
  lucario_skill3b: {
    id: 'lucario_skill3b',
    name: 'Guts',
    description: 'Passive: applies Endure for 1 turn(s), boosts ATB by 25%.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- hippopotas (ground) ---
  // Original: Immunity all allies (battle_start)
  hippopotas_skill3b: {
    id: 'hippopotas_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies SPD Slow for 2 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- hippowdon (ground) ---
  // Original: shield + DEF buff self (hp_threshold < 50)
  hippowdon_skill3b: {
    id: 'hippowdon_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Provoke for 1 turn(s), heals for 15% HP.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 100, target: 'all_enemies' },
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- skorupi (poison/bug) ---
  // Original: ATK break all enemies (battle_start)
  skorupi_skill3b: {
    id: 'skorupi_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Bleed for 2 turn(s) (25% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- drapion (poison/dark) ---
  // Original: Bleed on attack (31%)
  drapion_skill3b: {
    id: 'drapion_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Seal for 2 turn(s) (25% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- croagunk (poison/fighting) ---
  // Original: ATB boost 10% all allies (turn_start)
  croagunk_skill3b: {
    id: 'croagunk_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Unrecoverable for 2 turn(s) (30% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'unrecoverable', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- toxicroak (poison/fighting) ---
  // Original: ATB boost 30% + cd reduce self (on_kill)
  toxicroak_skill3b: {
    id: 'toxicroak_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Vampire for 2 turn(s), applies Bleed for 2 turn(s) (40% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'bleed', value: 0, duration: 2, chance: 40 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- carnivine (grass) ---
  // Original: Bleed on attack (43%)
  carnivine_skill3b: {
    id: 'carnivine_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- finneon (water) ---
  // Original: ACC buff self (always)
  finneon_skill3b: {
    id: 'finneon_skill3b',
    name: 'Torrent',
    description: 'Passive: applies SPD Buff for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- lumineon (water) ---
  // Original: extend buffs all allies (turn_start)
  lumineon_skill3b: {
    id: 'lumineon_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 5% HP, applies Recovery for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- mantyke (water/flying) ---
  // Original: ATB boost 15% self (on_attack, 25%)
  mantyke_skill3b: {
    id: 'mantyke_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Shield for 1 turn(s) (30% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- snover (grass/ice) ---
  // Original: ATB boost 25% + SPD buff self (on_crit)
  snover_skill3b: {
    id: 'snover_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Freeze for 1 turn(s) (15% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- abomasnow (grass/ice) ---
  // Original: extend buffs all allies (turn_start)
  abomasnow_skill3b: {
    id: 'abomasnow_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Freeze for 1 turn(s) (20% chance), applies SPD Slow for 2 turn(s) (30% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 20 },
      { id: 'spd_slow', value: 0, duration: 2, chance: 30 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- weavile (dark/ice) ---
  // Original: Bomb all enemies (battle_start)
  weavile_skill3b: {
    id: 'weavile_skill3b',
    name: 'Pressure',
    description: 'Passive: applies SPD Buff for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- magnezone (electric/steel) ---
  // Original: ATB reduce on attack (29%)
  magnezone_skill3b: {
    id: 'magnezone_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- lickilicky (normal) ---
  // Original: Amplify self on attack (31%)
  lickilicky_skill3b: {
    id: 'lickilicky_skill3b',
    name: 'Adaptability',
    description: 'Passive: heals for 8% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- rhyperior (ground/rock) ---
  // Original: Shield all allies (turn_start)
  rhyperior_skill3b: {
    id: 'rhyperior_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- tangrowth (grass) ---
  // Original: Soul Protect self (hp_threshold < 40)
  tangrowth_skill3b: {
    id: 'tangrowth_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 8% HP, applies Recovery for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- electivire (electric) ---
  // Original: Evasion self (battle_start)
  electivire_skill3b: {
    id: 'electivire_skill3b',
    name: 'Static',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- magmortar (fire) ---
  // Original: Brand on attack (32%)
  magmortar_skill3b: {
    id: 'magmortar_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s) (35% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 35 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- togekiss (fairy/flying) ---
  // Original: SPD buff self (turn_start)
  togekiss_skill3b: {
    id: 'togekiss_skill3b',
    name: 'Cute Charm',
    description: 'Passive: heals for 5% HP, removes 1 debuff(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- yanmega (bug/flying) ---
  // Original: Evasion self (battle_start)
  yanmega_skill3b: {
    id: 'yanmega_skill3b',
    name: 'Swarm',
    description: 'Passive: applies SPD Buff for 2 turn(s), boosts ATB by 20%.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- leafeon (grass) ---
  // Original: Recovery all allies (battle_start)
  leafeon_skill3b: {
    id: 'leafeon_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'grass',
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

  // --- glaceon (ice) ---
  // Original: Bomb all enemies (battle_start)
  glaceon_skill3b: {
    id: 'glaceon_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s) (25% chance), applies SPD Slow for 2 turn(s) (40% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 25 },
      { id: 'spd_slow', value: 0, duration: 2, chance: 40 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gliscor (ground/flying) ---
  // Original: Reflect self (on_hit_received, 34%)
  gliscor_skill3b: {
    id: 'gliscor_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Evasion for 1 turn(s), applies SPD Buff for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- mamoswine (ice/ground) ---
  // Original: RES buff self (always)
  mamoswine_skill3b: {
    id: 'mamoswine_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies DEF Buff for 999 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- porygon_z (normal) ---
  // Original: heal 15% + cleanse self (on_kill)
  porygon_z_skill3b: {
    id: 'porygon_z_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Skill Refresh for 2 turn(s), boosts ATB by 30%.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'skill_refresh', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- gallade (psychic/fighting) ---
  // Original: RES break on attack (17%)
  gallade_skill3b: {
    id: 'gallade_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Crit DMG Buff for 1 turn(s), applies ATK Buff for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- probopass (rock/steel) ---
  // Original: Soul Protect all allies (battle_start)
  probopass_skill3b: {
    id: 'probopass_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Threat for 3 turn(s), applies DEF Buff for 3 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 3, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 3, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- dusknoir (ghost) ---
  // Original: strip 1 buff all enemies (turn_start)
  dusknoir_skill3b: {
    id: 'dusknoir_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance), applies Oblivion for 1 turn(s) (25% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 25 },
      { id: 'oblivion', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- froslass (ice/ghost) ---
  // Original: RES break on attack (23%)
  froslass_skill3b: {
    id: 'froslass_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s) (20% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- rotom (electric/ghost) ---
  // Original: ACC break on attack (33%)
  rotom_skill3b: {
    id: 'rotom_skill3b',
    name: 'Static',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- uxie (psychic) ---
  // Original: DEF buff + Endure self (on_ally_death)
  uxie_skill3b: {
    id: 'uxie_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Shield for 2 turn(s), applies Immunity for 2 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 20, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- mesprit (psychic) ---
  // Original: shorten debuffs all allies (turn_start)
  mesprit_skill3b: {
    id: 'mesprit_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Buff Block for 2 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- azelf (psychic) ---
  // Original: RES break on attack (41%)
  azelf_skill3b: {
    id: 'azelf_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Amplify for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'psychic',
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

  // --- dialga (steel/dragon) ---
  // Original: ATK buff self (on_kill)
  dialga_skill3b: {
    id: 'dialga_skill3b',
    name: 'Sturdy',
    description: 'Passive: increases cooldowns by 1 turn(s) (35% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_increase', value: 1, duration: 0, chance: 35 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- palkia (water/dragon) ---
  // Original: SPD slow on attack (52%)
  palkia_skill3b: {
    id: 'palkia_skill3b',
    name: 'Torrent',
    description: 'Passive: reduces ATB by 20% (40% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 20, duration: 0, chance: 40 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- heatran (fire/steel) ---
  // Original: Crit Rate Buff self (battle_start)
  heatran_skill3b: {
    id: 'heatran_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s), applies Brand for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 100, target: 'all_enemies' },
      { id: 'brand', value: 0, duration: 2, chance: 100, target: 'all_enemies' },
    ],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- regigigas (normal) ---
  // Original: absorb ATB 10% on attack (50%)
  regigigas_skill3b: {
    id: 'regigigas_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies DEF Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- cresselia (psychic) ---
  // Original: Nullify self (on_hit_received, 53%)
  cresselia_skill3b: {
    id: 'cresselia_skill3b',
    name: 'Inner Focus',
    description: 'Passive: heals for 10% HP, applies Recovery for 2 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- phione (water) ---
  // Original: Nullify all allies (battle_start)
  phione_skill3b: {
    id: 'phione_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Immunity for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 999, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- manaphy (water) ---
  // Original: revive 20% (on_ally_death, 6 CD)
  manaphy_skill3b: {
    id: 'manaphy_skill3b',
    name: 'Torrent',
    description: 'Passive: equalizes HP across all allies, applies Recovery for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'balance_hp', value: 0, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- darkrai (dark) ---
  // Original: Mark on attack (54%)
  darkrai_skill3b: {
    id: 'darkrai_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Sleep for 1 turn(s) (25% chance), applies Petrify for 1 turn(s) (15% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'sleep', value: 0, duration: 1, chance: 25 },
      { id: 'petrify', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- arceus (normal) ---
  // Original: ATK + SPD buff self (on_crit)
  arceus_skill3b: {
    id: 'arceus_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Invincibility for 1 turn(s), applies Endure for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'invincibility', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },
};
