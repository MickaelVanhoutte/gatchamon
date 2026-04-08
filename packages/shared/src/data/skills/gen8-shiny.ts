import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN8_SHINY_SKILLS: Record<string, SkillDefinition> = {
  // --- grookey (grass) --- original: steal_buff on_attack
  grookey_skill3b: {
    id: 'grookey_skill3b',
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

  // --- thwackey (grass) --- original: res_buff team turn_start
  thwackey_skill3b: {
    id: 'thwackey_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Amplify for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- rillaboom (grass) --- original: heal 3% team on_hit_received
  rillaboom_skill3b: {
    id: 'rillaboom_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- scorbunny (fire) --- original: atb_boost+spd_buff self hp_threshold
  scorbunny_skill3b: {
    id: 'scorbunny_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 1 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- raboot (fire) --- original: heal+cleanse self on_kill
  raboot_skill3b: {
    id: 'raboot_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- cinderace (fire) --- original: seal on_attack
  cinderace_skill3b: {
    id: 'cinderace_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 50 },
  },

  // --- sobble (water) --- original: steal_buff on_attack
  sobble_skill3b: {
    id: 'sobble_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 3% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- drizzile (water) --- original: spd_buff team battle_start
  drizzile_skill3b: {
    id: 'drizzile_skill3b',
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

  // --- inteleon (water) --- original: heal self on_ally_death
  inteleon_skill3b: {
    id: 'inteleon_skill3b',
    name: 'Torrent',
    description: 'Passive: removes 1 debuff(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- skwovet (normal) --- original: cd_reduce self on_crit
  skwovet_skill3b: {
    id: 'skwovet_skill3b',
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

  // --- greedent (normal) --- original: amplify always
  greedent_skill3b: {
    id: 'greedent_skill3b',
    name: 'Adaptability',
    description: 'Passive: steals 1 buff(s) from the enemy.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- rookidee (flying) --- original: atb_reduce on_attack
  rookidee_skill3b: {
    id: 'rookidee_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Evasion for 1 turn(s).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- corvisquire (flying) --- original: skill_refresh on_kill
  corvisquire_skill3b: {
    id: 'corvisquire_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies ACC Buff for 2 turn(s).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- corviknight (flying/steel) --- original: shield+def_buff self hp_threshold
  corviknight_skill3b: {
    id: 'corviknight_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Counter for 2 turn(s).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- blipbug (bug) --- original: nullify on_hit_received
  blipbug_skill3b: {
    id: 'blipbug_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dottler (bug/psychic) --- original: spd_buff self turn_start
  dottler_skill3b: {
    id: 'dottler_skill3b',
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

  // --- orbeetle (bug/psychic) --- original: steal_buff on_attack
  orbeetle_skill3b: {
    id: 'orbeetle_skill3b',
    name: 'Swarm',
    description: 'Passive: increases cooldowns by 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_increase', value: 1, duration: 0, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- nickit (dark) --- original: strip all_enemies turn_start
  nickit_skill3b: {
    id: 'nickit_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Oblivion for 1 turn(s) (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- thievul (dark) --- original: skill_refresh on_kill
  thievul_skill3b: {
    id: 'thievul_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Buff Block for 2 turn(s) (18% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 2, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gossifleur (grass) --- original: extend_buffs team turn_start
  gossifleur_skill3b: {
    id: 'gossifleur_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 5% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- eldegoss (grass) --- original: heal 3% team on_hit_received
  eldegoss_skill3b: {
    id: 'eldegoss_skill3b',
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

  // --- wooloo (normal) --- original: cd_reduce on_crit
  wooloo_skill3b: {
    id: 'wooloo_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- dubwool (normal) --- original: invincibility+recovery self hp_threshold
  dubwool_skill3b: {
    id: 'dubwool_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- chewtle (water) --- original: heal self on_ally_death
  chewtle_skill3b: {
    id: 'chewtle_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Reflect for 1 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- drednaw (water/rock) --- original: atb_reduce on_hit_received
  drednaw_skill3b: {
    id: 'drednaw_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Threat for 3 turn(s), applies Counter for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 3, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- yamper (electric) --- original: atb_boost on_kill
  yamper_skill3b: {
    id: 'yamper_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- boltund (electric) --- original: atb_boost+spd_buff on_crit
  boltund_skill3b: {
    id: 'boltund_skill3b',
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

  // --- rolycoly (rock) --- original: atb_boost on_kill
  rolycoly_skill3b: {
    id: 'rolycoly_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- carkol (rock/fire) --- original: amplify+crit_dmg_buff hp_threshold
  carkol_skill3b: {
    id: 'carkol_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Break for 2 turn(s) (20% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- coalossal (rock/fire) --- original: detonate on_attack
  coalossal_skill3b: {
    id: 'coalossal_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- applin (grass/dragon) --- original: atb_reduce on_attack
  applin_skill3b: {
    id: 'applin_skill3b',
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

  // --- flapple (grass/dragon) --- original: balance_hp on_hit_received
  flapple_skill3b: {
    id: 'flapple_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies Crit Rate Buff for 1 turn(s).',
    type: 'grass',
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

  // --- appletun (grass/dragon) --- original: shorten_debuffs team turn_start
  appletun_skill3b: {
    id: 'appletun_skill3b',
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

  // --- silicobra (ground) --- original: atb_boost on_kill
  silicobra_skill3b: {
    id: 'silicobra_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Provoke for 1 turn(s) (25% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'provoke', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- sandaconda (ground) --- original: shield team turn_start
  sandaconda_skill3b: {
    id: 'sandaconda_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Reflect for 1 turn(s) (30% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- cramorant (flying/water) --- original: absorb_atb on_attack
  cramorant_skill3b: {
    id: 'cramorant_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Glancing Hit for 2 turn(s) (25% chance).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arrokuda (water) --- original: atb_boost on_attack
  arrokuda_skill3b: {
    id: 'arrokuda_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- barraskewda (water) --- original: mark on_attack
  barraskewda_skill3b: {
    id: 'barraskewda_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- toxel (electric/poison) --- original: atk_break all_enemies battle_start
  toxel_skill3b: {
    id: 'toxel_skill3b',
    name: 'Static',
    description: 'Passive: applies Bomb for 1 turn(s) (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sizzlipede (fire/bug) --- original: detonate on_attack
  sizzlipede_skill3b: {
    id: 'sizzlipede_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s) (20% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- centiskorch (fire/bug) --- original: absorb_atb on_attack
  centiskorch_skill3b: {
    id: 'centiskorch_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Brand for 2 turn(s) (22% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- clobbopus (fighting) --- original: spd_buff team battle_start
  clobbopus_skill3b: {
    id: 'clobbopus_skill3b',
    name: 'Guts',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- grapploct (fighting) --- original: absorb_atb on_attack
  grapploct_skill3b: {
    id: 'grapploct_skill3b',
    name: 'Guts',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- sinistea (ghost) --- original: detonate on_attack
  sinistea_skill3b: {
    id: 'sinistea_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Confusion for 1 turn(s) (18% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- polteageist (ghost) --- original: mark on_attack
  polteageist_skill3b: {
    id: 'polteageist_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Bleed for 2 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- hatenna (psychic) --- original: provoke on_hit_received
  hatenna_skill3b: {
    id: 'hatenna_skill3b',
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

  // --- hattrem (psychic) --- original: revive on_ally_death
  hattrem_skill3b: {
    id: 'hattrem_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Immunity for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- hatterene (psychic/fairy) --- original: res_buff team turn_start
  hatterene_skill3b: {
    id: 'hatterene_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'sleep', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- impidimp (dark/fairy) --- original: revive on_ally_death
  impidimp_skill3b: {
    id: 'impidimp_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Buff Block for 2 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- morgrem (dark/fairy) --- original: acc_break on_attack
  morgrem_skill3b: {
    id: 'morgrem_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Seal for 1 turn(s) (18% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- grimmsnarl (dark/fairy) --- original: res_break on_attack
  grimmsnarl_skill3b: {
    id: 'grimmsnarl_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Expose for 2 turn(s) (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- obstagoon (dark/normal) --- original: strip all_enemies turn_start
  obstagoon_skill3b: {
    id: 'obstagoon_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Counter for 999 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- perrserker (steel) --- original: expose all_enemies battle_start
  perrserker_skill3b: {
    id: 'perrserker_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- cursola (ghost) --- original: soul_protect team battle_start
  cursola_skill3b: {
    id: 'cursola_skill3b',
    name: 'Levitate',
    description: 'Passive: heals for 5% HP.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- mrrime (ice/psychic) --- original: heal+cleanse on_kill
  mrrime_skill3b: {
    id: 'mrrime_skill3b',
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

  // --- runerigus (ground/ghost) --- original: atb_reduce on_hit_received
  runerigus_skill3b: {
    id: 'runerigus_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- milcery (fairy) --- original: revive on_ally_death
  milcery_skill3b: {
    id: 'milcery_skill3b',
    name: 'Cute Charm',
    description: 'Passive: heals for 3% HP.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- alcremie (fairy) --- original: revive on_ally_death
  alcremie_skill3b: {
    id: 'alcremie_skill3b',
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

  // --- falinks (fighting) --- original: atb_boost on_attack
  falinks_skill3b: {
    id: 'falinks_skill3b',
    name: 'Guts',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- pincurchin (electric) --- original: bleed on_attack
  pincurchin_skill3b: {
    id: 'pincurchin_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (30% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- snom (ice/bug) --- original: res_buff always
  snom_skill3b: {
    id: 'snom_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s) (15% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- frosmoth (ice/bug) --- original: spd_buff team battle_start
  frosmoth_skill3b: {
    id: 'frosmoth_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Petrify for 1 turn(s) (18% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'petrify', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- stonjourner (rock) --- original: atb_reduce on_hit_received
  stonjourner_skill3b: {
    id: 'stonjourner_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- cufant (steel) --- original: counter on_hit_received
  cufant_skill3b: {
    id: 'cufant_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- copperajah (steel) --- original: expose all_enemies battle_start
  copperajah_skill3b: {
    id: 'copperajah_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- dracozolt (electric/dragon) --- original: shield team turn_start
  dracozolt_skill3b: {
    id: 'dracozolt_skill3b',
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

  // --- arctozolt (electric/ice) --- original: atb_boost team on_ally_death
  arctozolt_skill3b: {
    id: 'arctozolt_skill3b',
    name: 'Static',
    description: 'Passive: applies Immunity for 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- dracovish (water/dragon) --- original: balance_hp on_hit_received
  dracovish_skill3b: {
    id: 'dracovish_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Vampire for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- arctovish (water/ice) --- original: atb_boost+cd_reduce on_kill
  arctovish_skill3b: {
    id: 'arctovish_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Reflect for 1 turn(s) (35% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- duraludon (steel/dragon) --- original: crit_rate_buff battle_start
  duraludon_skill3b: {
    id: 'duraludon_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Expose for 2 turn(s) (25% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dreepy (dragon/ghost) --- original: atb_reduce on_attack
  dreepy_skill3b: {
    id: 'dreepy_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies SPD Buff for 1 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- drakloak (dragon/ghost) --- original: expose on_attack
  drakloak_skill3b: {
    id: 'drakloak_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- dragapult (dragon/ghost) --- original: bleed on_attack
  dragapult_skill3b: {
    id: 'dragapult_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- zacian (fairy) --- original: soul_protect team battle_start
  zacian_skill3b: {
    id: 'zacian_skill3b',
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

  // --- zamazenta (fighting) --- original: heal team turn_start
  zamazenta_skill3b: {
    id: 'zamazenta_skill3b',
    name: 'Guts',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- eternatus (poison/dragon) --- original: detonate on_attack
  eternatus_skill3b: {
    id: 'eternatus_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 2 turn(s) (30% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit',
  },

  // --- kubfu (fighting) --- original: atb_boost team turn_start
  kubfu_skill3b: {
    id: 'kubfu_skill3b',
    name: 'Guts',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- zarude (dark/grass) --- original: recovery team battle_start
  zarude_skill3b: {
    id: 'zarude_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Nullify for 999 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 999, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- regieleki (electric) --- original: atb_boost+spd_buff on_crit
  regieleki_skill3b: {
    id: 'regieleki_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (35% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 35 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- regidrago (dragon) --- original: atk_break all_enemies battle_start
  regidrago_skill3b: {
    id: 'regidrago_skill3b',
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

  // --- glastrier (ice) --- original: reflect on_hit_received
  glastrier_skill3b: {
    id: 'glastrier_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s) (30% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- spectrier (ghost) --- original: heal team turn_start
  spectrier_skill3b: {
    id: 'spectrier_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Evasion for 999 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- calyrex (psychic/grass) --- original: recovery team battle_start
  calyrex_skill3b: {
    id: 'calyrex_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Nullify for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- wyrdeer (normal/psychic) --- original: transfer_debuff on_attack
  wyrdeer_skill3b: {
    id: 'wyrdeer_skill3b',
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

  // --- kleavor (bug/rock) --- original: cd_reduce on_crit
  kleavor_skill3b: {
    id: 'kleavor_skill3b',
    name: 'Swarm',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- ursaluna_bloodmoon (ground/normal) --- original: nullify on_hit_received
  ursaluna_bloodmoon_skill3b: {
    id: 'ursaluna_bloodmoon_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Bomb for 1 turn(s) (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 1, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ursaluna (ground/normal) --- original: reflect on_hit_received
  ursaluna_skill3b: {
    id: 'ursaluna_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Endure for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- sneasler (fighting/poison) --- original: res_break on_attack
  sneasler_skill3b: {
    id: 'sneasler_skill3b',
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

  // --- overqwil (dark/poison) --- original: soul_protect team battle_start
  overqwil_skill3b: {
    id: 'overqwil_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Poison for 2 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },
};
