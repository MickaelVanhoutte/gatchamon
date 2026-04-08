import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN9_SHINY_SKILLS: Record<string, SkillDefinition> = {
  // --- sprigatito (grass) --- original: atb_boost on_attack
  sprigatito_skill3b: {
    id: 'sprigatito_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- floragato (grass) --- original: immunity team battle_start
  floragato_skill3b: {
    id: 'floragato_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Anti-Heal for 2 turn(s) (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'anti_heal', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- meowscarada (grass/dark) --- original: mark on_attack
  meowscarada_skill3b: {
    id: 'meowscarada_skill3b',
    name: 'Overgrow',
    description: 'Passive: steals 1 buff(s) from the enemy.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- fuecoco (fire) --- original: skill_refresh on_kill
  fuecoco_skill3b: {
    id: 'fuecoco_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Brand for 1 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- crocalor (fire) --- original: atk_buff+spd_buff on_crit
  crocalor_skill3b: {
    id: 'crocalor_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 1 turn(s) (20% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- skeledirge (fire/ghost) --- original: bleed on_attack
  skeledirge_skill3b: {
    id: 'skeledirge_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- quaxly (water) --- original: atb_boost+spd_buff on_crit
  quaxly_skill3b: {
    id: 'quaxly_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 10% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 10, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- quaxwell (water) --- original: cleanse team turn_start
  quaxwell_skill3b: {
    id: 'quaxwell_skill3b',
    name: 'Torrent',
    description: 'Passive: applies SPD Buff for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- quaquaval (water/fighting) --- original: crit_dmg_buff on_crit
  quaquaval_skill3b: {
    id: 'quaquaval_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- lechonk (normal) --- original: absorb_atb on_attack
  lechonk_skill3b: {
    id: 'lechonk_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- tarountula (bug) --- original: absorb_atb on_attack
  tarountula_skill3b: {
    id: 'tarountula_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Glancing Hit for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- spidops (bug) --- original: atb_boost+spd_buff hp_threshold
  spidops_skill3b: {
    id: 'spidops_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Counter for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- nymble (bug) --- original: detonate on_attack
  nymble_skill3b: {
    id: 'nymble_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- lokix (bug/dark) --- original: threat+shield battle_start
  lokix_skill3b: {
    id: 'lokix_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Amplify for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- pawmi (electric) --- original: atb_reduce on_attack
  pawmi_skill3b: {
    id: 'pawmi_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (18% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- pawmo (electric/fighting) --- original: skill_refresh on_kill
  pawmo_skill3b: {
    id: 'pawmo_skill3b',
    name: 'Static',
    description: 'Passive: applies ATK Buff for 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- pawmot (electric/fighting) --- original: absorb_atb on_attack
  pawmot_skill3b: {
    id: 'pawmot_skill3b',
    name: 'Static',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- tandemaus (normal) --- original: steal_buff on_attack
  tandemaus_skill3b: {
    id: 'tandemaus_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies SPD Buff for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- fidough (fairy) --- original: heal team turn_start
  fidough_skill3b: {
    id: 'fidough_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Immunity for 1 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- dachsbun (fairy) --- original: seal on_attack
  dachsbun_skill3b: {
    id: 'dachsbun_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- smoliv (grass/normal) --- original: anti_heal on_attack
  smoliv_skill3b: {
    id: 'smoliv_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- dolliv (grass/normal) --- original: atk_buff+spd_buff on_crit
  dolliv_skill3b: {
    id: 'dolliv_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Seal for 1 turn(s) (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- arboliva (grass/normal) --- original: heal team turn_start
  arboliva_skill3b: {
    id: 'arboliva_skill3b',
    name: 'Overgrow',
    description: 'Passive: extends buff durations by 1 turn.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- nacli (rock) --- original: threat+shield battle_start
  nacli_skill3b: {
    id: 'nacli_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Counter for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- naclstack (rock) --- original: atb_boost on_kill
  naclstack_skill3b: {
    id: 'naclstack_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- garganacl (rock) --- original: nullify on_hit_received
  garganacl_skill3b: {
    id: 'garganacl_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Reflect for 1 turn(s) (30% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- charcadet (fire) --- original: res_break on_attack
  charcadet_skill3b: {
    id: 'charcadet_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 1 turn(s) (22% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- armarouge (fire/psychic) --- original: threat+shield battle_start
  armarouge_skill3b: {
    id: 'armarouge_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Reflect for 999 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- ceruledge (fire/ghost) --- original: soul_protect hp_threshold
  ceruledge_skill3b: {
    id: 'ceruledge_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Amplify for 2 turn(s), applies Crit DMG Buff for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- tadbulb (electric) --- original: evasion battle_start
  tadbulb_skill3b: {
    id: 'tadbulb_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (18% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- bellibolt (electric) --- original: spd_buff turn_start
  bellibolt_skill3b: {
    id: 'bellibolt_skill3b',
    name: 'Static',
    description: 'Passive: applies Nullify for 1 turn(s) (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- wattrel (electric/flying) --- original: atb_boost on_attack
  wattrel_skill3b: {
    id: 'wattrel_skill3b',
    name: 'Static',
    description: 'Passive: applies Evasion for 2 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- kilowattrel (electric/flying) --- original: atb_boost on_attack
  kilowattrel_skill3b: {
    id: 'kilowattrel_skill3b',
    name: 'Static',
    description: 'Passive: applies ACC Buff for 2 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- maschiff (dark) --- original: steal_buff on_attack
  maschiff_skill3b: {
    id: 'maschiff_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Oblivion for 1 turn(s) (18% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- mabosstiff (dark) --- original: res_break on_attack
  mabosstiff_skill3b: {
    id: 'mabosstiff_skill3b',
    name: 'Pressure',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- shroodle (poison/normal) --- original: atb_boost+cd_reduce on_kill
  shroodle_skill3b: {
    id: 'shroodle_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- grafaiai (poison/normal) --- original: cleanse team turn_start
  grafaiai_skill3b: {
    id: 'grafaiai_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- bramblin (grass/ghost) --- original: immunity team battle_start
  bramblin_skill3b: {
    id: 'bramblin_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 3% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- brambleghast (grass/ghost) --- original: immunity team battle_start
  brambleghast_skill3b: {
    id: 'brambleghast_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Seal for 1 turn(s) (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- toedscool (ground/grass) --- original: absorb_atb on_attack
  toedscool_skill3b: {
    id: 'toedscool_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Provoke for 1 turn(s) (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'provoke', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- toedscruel (ground/grass) --- original: spd_buff team battle_start
  toedscruel_skill3b: {
    id: 'toedscruel_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Nullify for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- klawf (rock) --- original: threat+shield battle_start
  klawf_skill3b: {
    id: 'klawf_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Reflect for 1 turn(s) (30% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- capsakid (grass) --- original: skill_refresh on_kill
  capsakid_skill3b: {
    id: 'capsakid_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- scovillain (grass/fire) --- original: reflect on_hit_received
  scovillain_skill3b: {
    id: 'scovillain_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Brand for 1 turn(s) (22% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- rellor (bug) --- original: heal on_ally_death
  rellor_skill3b: {
    id: 'rellor_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Nullify for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- rabsca (bug/psychic) --- original: atb_boost battle_start
  rabsca_skill3b: {
    id: 'rabsca_skill3b',
    name: 'Swarm',
    description: 'Passive: applies ACC Buff for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- flittle (psychic) --- original: strip all_enemies turn_start
  flittle_skill3b: {
    id: 'flittle_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- espathra (psychic) --- original: cd_increase on_crit
  espathra_skill3b: {
    id: 'espathra_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'sleep', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tinkatink (fairy/steel) --- original: atb_boost+spd_buff hp_threshold
  tinkatink_skill3b: {
    id: 'tinkatink_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- tinkatuff (fairy/steel) --- original: atb_reduce on_hit_received
  tinkatuff_skill3b: {
    id: 'tinkatuff_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- tinkaton (fairy/steel) --- original: threat+shield battle_start
  tinkaton_skill3b: {
    id: 'tinkaton_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Counter for 999 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- wiglett (water) --- original: atb_boost+spd_buff on_crit
  wiglett_skill3b: {
    id: 'wiglett_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Evasion for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- wugtrio (water) --- original: shorten_debuffs team turn_start
  wugtrio_skill3b: {
    id: 'wugtrio_skill3b',
    name: 'Torrent',
    description: 'Passive: equalizes HP across all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'balance_hp', value: 0, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- bombirdier (flying/dark) --- original: cd_reduce on_crit
  bombirdier_skill3b: {
    id: 'bombirdier_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Bomb for 1 turn(s) (22% chance).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- finizen (water) --- original: atb_reduce on_attack
  finizen_skill3b: {
    id: 'finizen_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Recovery for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 50 },
  },

  // --- varoom (steel/poison) --- original: res_buff always
  varoom_skill3b: {
    id: 'varoom_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Counter for 1 turn(s) (25% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- revavroom (steel/poison) --- original: invincibility+recovery hp_threshold
  revavroom_skill3b: {
    id: 'revavroom_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Expose for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- cyclizar (dragon/normal) --- original: glancing on_hit_received
  cyclizar_skill3b: {
    id: 'cyclizar_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- orthworm (steel) --- original: nullify on_hit_received
  orthworm_skill3b: {
    id: 'orthworm_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- glimmet (rock/poison) --- original: atb_boost battle_start
  glimmet_skill3b: {
    id: 'glimmet_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Poison for 1 turn(s) (22% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- glimmora (rock/poison) --- original: def_buff team battle_start
  glimmora_skill3b: {
    id: 'glimmora_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- greavard (ghost) --- original: atk_break all_enemies battle_start
  greavard_skill3b: {
    id: 'greavard_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- houndstone (ghost) --- original: seal on_attack
  houndstone_skill3b: {
    id: 'houndstone_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Bleed for 2 turn(s) (22% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- flamigo (flying/fighting) --- original: heal+cleanse on_kill
  flamigo_skill3b: {
    id: 'flamigo_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies SPD Buff for 2 turn(s).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- cetoddle (ice) --- original: amplify always
  cetoddle_skill3b: {
    id: 'cetoddle_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s) (18% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cetitan (ice) --- original: acc_break on_attack
  cetitan_skill3b: {
    id: 'cetitan_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Petrify for 1 turn(s) (22% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'petrify', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- veluza (water/psychic) --- original: threat+shield battle_start
  veluza_skill3b: {
    id: 'veluza_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Reflect for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- dondozo (water) --- original: recovery team battle_start
  dondozo_skill3b: {
    id: 'dondozo_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- annihilape (fighting/ghost) --- original: bleed on_attack
  annihilape_skill3b: {
    id: 'annihilape_skill3b',
    name: 'Guts',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- clodsire (poison/ground) --- original: transfer_debuff on_attack
  clodsire_skill3b: {
    id: 'clodsire_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 2 turn(s) (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- farigiraf (normal/psychic) --- original: crit_dmg_buff on_crit
  farigiraf_skill3b: {
    id: 'farigiraf_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ACC Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- kingambit (dark/steel) --- original: reflect on_hit_received
  kingambit_skill3b: {
    id: 'kingambit_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Expose for 2 turn(s) (30% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- frigibax (dragon/ice) --- original: spd_buff team battle_start
  frigibax_skill3b: {
    id: 'frigibax_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- arctibax (dragon/ice) --- original: detonate on_attack
  arctibax_skill3b: {
    id: 'arctibax_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Freeze for 1 turn(s) (22% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- baxcalibur (dragon/ice) --- original: detonate on_attack
  baxcalibur_skill3b: {
    id: 'baxcalibur_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Amplify for 2 turn(s), applies ATK Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- gimmighoul_roaming (ghost) --- original: absorb_atb on_attack
  gimmighoul_roaming_skill3b: {
    id: 'gimmighoul_roaming_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Evasion for 1 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gholdengo (steel/ghost) --- original: provoke on_hit_received
  gholdengo_skill3b: {
    id: 'gholdengo_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Immunity for 999 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- gimmighoul (ghost) --- original: shorten_debuffs team turn_start
  gimmighoul_skill3b: {
    id: 'gimmighoul_skill3b',
    name: 'Levitate',
    description: 'Passive: applies SPD Buff for 2 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- koraidon (fighting/dragon) --- original: bleed on_attack
  koraidon_skill3b: {
    id: 'koraidon_skill3b',
    name: 'Guts',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- dipplin (grass/dragon) --- original: heal on_ally_death
  dipplin_skill3b: {
    id: 'dipplin_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Immunity for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- poltchageist (grass/ghost) --- original: nullify team battle_start
  poltchageist_skill3b: {
    id: 'poltchageist_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 3% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- sinistcha (grass/ghost) --- original: detonate on_attack
  sinistcha_skill3b: {
    id: 'sinistcha_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Oblivion for 1 turn(s) (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- archaludon (steel/dragon) --- original: atb_boost+cd_reduce on_kill
  archaludon_skill3b: {
    id: 'archaludon_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- hydrapple (grass/dragon) --- original: atb_boost+cd_reduce on_kill
  hydrapple_skill3b: {
    id: 'hydrapple_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Recovery for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },
};
