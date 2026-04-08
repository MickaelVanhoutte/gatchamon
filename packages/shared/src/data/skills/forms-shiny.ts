import type { SkillDefinition } from '../../types/pokemon.js';

export const FORMS_SHINY_SKILLS: Record<string, SkillDefinition> = {
  // ===== MEGA EVOLUTIONS =====
  // --- venusaur_mega --- original: anti_heal+unrecoverable on_attack
  venusaur_mega_skill3b: {
    id: 'venusaur_mega_skill3b',
    name: 'Thick Fat',
    description: 'Passive: when hit, applies Recovery for 1 turn(s) to all allies and extends buffs by 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- charizard_megax --- original: atk_buff+crit_dmg_buff on_crit
  charizard_megax_skill3b: {
    id: 'charizard_megax_skill3b',
    name: 'Tough Claws',
    description: 'Passive: on attack, applies Burn for 2 turn(s) (40% chance) and boosts ATB by 25% to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 40 },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- charizard_megay --- original: burn battle_start
  charizard_megay_skill3b: {
    id: 'charizard_megay_skill3b',
    name: 'Drought',
    description: 'Passive: at turn start, applies Crit DMG Buff for 2 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- blastoise_mega --- original: heal+shield on_hit_received
  blastoise_mega_skill3b: {
    id: 'blastoise_mega_skill3b',
    name: 'Mega Launcher',
    description: 'Passive: on attack, applies DEF Break for 1 turn(s) (40% chance) and boosts ATB by 25% to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 40 },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- beedrill_mega --- original: atk_buff+atb_boost on_kill
  beedrill_mega_skill3b: {
    id: 'beedrill_mega_skill3b',
    name: 'Adaptability',
    description: 'Passive: on crit, applies Bleed for 2 turn(s) (40% chance) and applies Bomb for 2 turn(s) (35% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 40 },
      { id: 'bomb', value: 0, duration: 2, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- pidgeot_mega --- original: acc_buff+spd_buff battle_start
  pidgeot_mega_skill3b: {
    id: 'pidgeot_mega_skill3b',
    name: 'No Guard',
    description: 'Passive: at turn start, applies Crit Rate Buff for 2 turn(s) to self and applies Amplify for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- clefable_mega --- original: heal+cleanse on_ally_death
  clefable_mega_skill3b: {
    id: 'clefable_mega_skill3b',
    name: 'Magic Guard',
    description: 'Passive: when HP drops below threshold, applies RES Buff for 1 turn(s) to all allies and extends buffs by 1 turn(s) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- alakazam_mega --- original: res_buff+immunity turn_start
  alakazam_mega_skill3b: {
    id: 'alakazam_mega_skill3b',
    name: 'Trace',
    description: 'Passive: at battle start, cleanses 1 debuff(s) to all allies and heals to all allies for 8% HP.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- victreebel_mega --- original: bleed+poison on_attack
  victreebel_mega_skill3b: {
    id: 'victreebel_mega_skill3b',
    name: 'Chlorophyll',
    description: 'Passive: when hit, heals to all allies for 8% HP and shortens debuffs by 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- slowbro_mega --- original: shield+def_buff hp_threshold
  slowbro_mega_skill3b: {
    id: 'slowbro_mega_skill3b',
    name: 'Shell Armor',
    description: 'Passive: when an ally faints, heals to all allies for 8% HP and applies Recovery for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- gengar_mega --- original: silence+strip on_hit_received
  gengar_mega_skill3b: {
    id: 'gengar_mega_skill3b',
    name: 'Shadow Tag',
    description: 'Passive: on attack, applies Oblivion for 2 turn(s) (40% chance) and absorbs 15% ATB.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'oblivion', value: 0, duration: 2, chance: 40 },
      { id: 'absorb_atb', value: 15, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- kangaskhan_mega --- original: atk_buff+amplify on_attack
  kangaskhan_mega_skill3b: {
    id: 'kangaskhan_mega_skill3b',
    name: 'Parental Bond',
    description: 'Passive: when hit, applies Evasion for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- starmie_mega --- original: shorten_debuffs+heal turn_start
  starmie_mega_skill3b: {
    id: 'starmie_mega_skill3b',
    name: 'Analytic',
    description: 'Passive: at battle start, balances HP of all allies and grants Shield for 10% HP to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'balance_hp', value: 0, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- pinsir_mega --- original: oblivion+atk_buff on_attack
  pinsir_mega_skill3b: {
    id: 'pinsir_mega_skill3b',
    name: 'Aerilate',
    description: 'Passive: when hit, applies Evasion for 2 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gyarados_mega --- original: atk_break+strip on_hit_received
  gyarados_mega_skill3b: {
    id: 'gyarados_mega_skill3b',
    name: 'Mold Breaker',
    description: 'Passive: on attack, applies Brand for 2 turn(s) (40% chance) and applies Silence for 1 turn(s) (35% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'silence', value: 0, duration: 1, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- aerodactyl_mega --- original: shield+def_buff+endure hp_threshold
  aerodactyl_mega_skill3b: {
    id: 'aerodactyl_mega_skill3b',
    name: 'Tough Claws',
    description: 'Passive: when an ally faints, applies Reflect for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- dragonite_mega --- original: shield+endure+immunity battle_start
  dragonite_mega_skill3b: {
    id: 'dragonite_mega_skill3b',
    name: 'Multiscale',
    description: 'Passive: at turn start, applies Crit DMG Buff for 2 turn(s) to self and applies ATK Buff for 2 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- mewtwo_megax --- original: atk_buff+immunity on_hit_received
  mewtwo_megax_skill3b: {
    id: 'mewtwo_megax_skill3b',
    name: 'Steadfast',
    description: 'Passive: on attack, applies Silence for 1 turn(s) (40% chance) and increases enemy cooldowns by 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 40 },
      { id: 'cd_increase', value: 1, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- mewtwo_megay --- original: cd_increase turn_start
  mewtwo_megay_skill3b: {
    id: 'mewtwo_megay_skill3b',
    name: 'Insomnia',
    description: 'Passive: at battle start, grants Shield for 10% HP to all allies and cleanses 1 debuff(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // ===== MEGA EVOLUTIONS =====
  // --- meganium_mega --- original: extend_buffs turn_start
  meganium_mega_skill3b: {
    id: 'meganium_mega_skill3b',
    name: 'Overgrow',
    description: 'Passive: at battle start, applies Recovery for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- feraligatr_mega --- original: heal+atb_boost turn_start
  feraligatr_mega_skill3b: {
    id: 'feraligatr_mega_skill3b',
    name: 'Torrent',
    description: 'Passive: at battle start, balances HP of all allies and grants Shield for 10% HP to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'balance_hp', value: 0, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- ampharos_mega --- original: spd_buff always
  ampharos_mega_skill3b: {
    id: 'ampharos_mega_skill3b',
    name: 'Static',
    description: 'Passive: at battle start, boosts ATB by 25% to self and reduces cooldowns by 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- steelix_mega --- original: immunity+shield on_hit_received
  steelix_mega_skill3b: {
    id: 'steelix_mega_skill3b',
    name: 'Sturdy',
    description: 'Passive: on attack, applies Provoke for 1 turn(s) (40% chance) and applies Counter for 2 turn(s) to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 40 },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- scizor_mega --- original: acc_break on_hit_received
  scizor_mega_skill3b: {
    id: 'scizor_mega_skill3b',
    name: 'Technician',
    description: 'Passive: on attack, applies Bleed for 2 turn(s) (40% chance) and boosts ATB by 25% to self.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 40 },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- heracross_mega --- original: amplify always
  heracross_mega_skill3b: {
    id: 'heracross_mega_skill3b',
    name: 'Skill Link',
    description: 'Passive: at battle start, grants Shield for 15% HP to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- skarmory_mega --- original: def_buff+endure on_ally_death
  skarmory_mega_skill3b: {
    id: 'skarmory_mega_skill3b',
    name: 'Sturdy',
    description: 'Passive: when HP drops below threshold, grants Shield for 10% HP to all allies and applies Immunity for 1 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- houndoom_mega --- original: oblivion+amplify on_hit_received
  houndoom_mega_skill3b: {
    id: 'houndoom_mega_skill3b',
    name: 'Flash Fire',
    description: 'Passive: on attack, applies Brand for 2 turn(s) (40% chance) and applies Silence for 1 turn(s) (35% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'silence', value: 0, duration: 1, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- tyranitar_mega --- original: expose+def_buff battle_start
  tyranitar_mega_skill3b: {
    id: 'tyranitar_mega_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at turn start, applies Endure for 1 turn(s) to self and applies Counter for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- sceptile_mega --- original: atk_buff on_kill
  sceptile_mega_skill3b: {
    id: 'sceptile_mega_skill3b',
    name: 'Overgrow',
    description: 'Passive: on crit, applies Unrecoverable for 2 turn(s) (40% chance) and applies SPD Buff for 1 turn(s) to self.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'unrecoverable', value: 0, duration: 2, chance: 40 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- blaziken_mega --- original: nullify battle_start
  blaziken_mega_skill3b: {
    id: 'blaziken_mega_skill3b',
    name: 'Blaze',
    description: 'Passive: at turn start, applies ATK Buff for 2 turn(s) to all allies and applies Amplify for 1 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- swampert_mega --- original: balance_hp on_hit_received
  swampert_mega_skill3b: {
    id: 'swampert_mega_skill3b',
    name: 'Torrent',
    description: 'Passive: on attack, applies SPD Slow for 2 turn(s) (40% chance) and heals to self for 15% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 2, chance: 40 },
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- gardevoir_mega --- original: acc_break on_attack
  gardevoir_mega_skill3b: {
    id: 'gardevoir_mega_skill3b',
    name: 'Inner Focus',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to all allies and shortens debuffs by 1 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- sableye_mega --- original: bleed on_attack
  sableye_mega_skill3b: {
    id: 'sableye_mega_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies ATK Buff for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- mawile_mega --- original: balance_hp on_hit_received
  mawile_mega_skill3b: {
    id: 'mawile_mega_skill3b',
    name: 'Sturdy',
    description: 'Passive: on attack, applies Glancing for 1 turn(s) (40% chance) and grants Shield for 15% HP to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'glancing', value: 0, duration: 1, chance: 40 },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- aggron_mega --- original: shield+def_buff hp_threshold
  aggron_mega_skill3b: {
    id: 'aggron_mega_skill3b',
    name: 'Sturdy',
    description: 'Passive: when an ally faints, applies Endure for 1 turn(s) to self and applies Counter for 2 turn(s) to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- medicham_mega --- original: cd_increase on_crit
  medicham_mega_skill3b: {
    id: 'medicham_mega_skill3b',
    name: 'Guts',
    description: 'Passive: on attack, applies DEF Break for 1 turn(s) (40% chance) and applies ATK Buff for 1 turn(s) to self.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 40 },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- manectric_mega --- original: acc_buff always
  manectric_mega_skill3b: {
    id: 'manectric_mega_skill3b',
    name: 'Static',
    description: 'Passive: at battle start, boosts ATB by 25% to self and reduces cooldowns by 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- sharpedo_mega --- original: spd_slow on_attack
  sharpedo_mega_skill3b: {
    id: 'sharpedo_mega_skill3b',
    name: 'Torrent',
    description: 'Passive: when hit, grants Shield for 10% HP to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- camerupt_mega --- original: atb_reduce on_hit_received
  camerupt_mega_skill3b: {
    id: 'camerupt_mega_skill3b',
    name: 'Blaze',
    description: 'Passive: on attack, applies Burn for 2 turn(s) (40% chance) and applies SPD Buff for 1 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 40 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- altaria_mega --- original: heal on_ally_death
  altaria_mega_skill3b: {
    id: 'altaria_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: when HP drops below threshold, applies Crit DMG Buff for 2 turn(s) to self and applies ATK Buff for 2 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- banette_mega --- original: mark on_attack
  banette_mega_skill3b: {
    id: 'banette_mega_skill3b',
    name: 'Levitate',
    description: 'Passive: when hit, grants Shield for 15% HP to self and applies Counter for 2 turn(s) to self.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- absol_mega --- original: seal on_attack
  absol_mega_skill3b: {
    id: 'absol_mega_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies Vampire for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- glalie_mega --- original: atk_buff+spd_buff on_crit
  glalie_mega_skill3b: {
    id: 'glalie_mega_skill3b',
    name: 'Ice Body',
    description: 'Passive: on attack, applies Freeze for 1 turn(s) (40% chance) and applies ACC Break for 2 turn(s) (35% chance).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 40 },
      { id: 'acc_break', value: 0, duration: 2, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- salamence_mega --- original: spd_buff battle_start
  salamence_mega_skill3b: {
    id: 'salamence_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: at turn start, applies Endure for 1 turn(s) to self and applies Vampire for 2 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- metagross_mega --- original: recovery turn_start
  metagross_mega_skill3b: {
    id: 'metagross_mega_skill3b',
    name: 'Sturdy',
    description: 'Passive: at battle start, applies DEF Buff for 2 turn(s) to all allies and applies Reflect for 2 turn(s) to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- latias_mega --- original: atk_buff+spd_buff on_crit
  latias_mega_skill3b: {
    id: 'latias_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: on attack, applies Expose for 2 turn(s) (40% chance) and applies Vampire for 1 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'expose', value: 0, duration: 2, chance: 40 },
      { id: 'vampire', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- latios_mega --- original: amplify+crit_dmg_buff hp_threshold
  latios_mega_skill3b: {
    id: 'latios_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: when an ally faints, applies SPD Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 2 turn(s) to all allies.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- rayquaza_mega --- original: skill_refresh on_kill
  rayquaza_mega_skill3b: {
    id: 'rayquaza_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: on crit, applies Brand for 2 turn(s) (40% chance) and applies Crit DMG Buff for 1 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- lopunny_mega --- original: vampire hp_threshold
  lopunny_mega_skill3b: {
    id: 'lopunny_mega_skill3b',
    name: 'Adaptability',
    description: 'Passive: when an ally faints, applies Evasion for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- garchomp_mega --- original: detonate on_attack
  garchomp_mega_skill3b: {
    id: 'garchomp_mega_skill3b',
    name: 'Intimidate',
    description: 'Passive: when hit, applies SPD Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 2 turn(s) to all allies.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- lucario_mega --- original: shield+def_buff hp_threshold
  lucario_mega_skill3b: {
    id: 'lucario_mega_skill3b',
    name: 'Guts',
    description: 'Passive: when an ally faints, applies Counter for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- abomasnow_mega --- original: shorten_debuffs turn_start
  abomasnow_mega_skill3b: {
    id: 'abomasnow_mega_skill3b',
    name: 'Overgrow',
    description: 'Passive: at battle start, applies Recovery for 1 turn(s) to all allies and extends buffs by 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- gallade_mega --- original: atk_break battle_start
  gallade_mega_skill3b: {
    id: 'gallade_mega_skill3b',
    name: 'Inner Focus',
    description: 'Passive: at turn start, applies Immunity for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- froslass_mega --- original: anti_heal on_attack
  froslass_mega_skill3b: {
    id: 'froslass_mega_skill3b',
    name: 'Ice Body',
    description: 'Passive: when hit, applies Endure for 1 turn(s) to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- emboar_mega --- original: detonate on_attack
  emboar_mega_skill3b: {
    id: 'emboar_mega_skill3b',
    name: 'Blaze',
    description: 'Passive: when hit, applies Amplify for 2 turn(s) to self and applies ATK Buff for 2 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- audino_mega --- original: brand on_attack
  audino_mega_skill3b: {
    id: 'audino_mega_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, grants Shield for 15% HP to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- diancie_mega --- original: extend_buffs turn_start
  diancie_mega_skill3b: {
    id: 'diancie_mega_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at battle start, applies DEF Buff for 2 turn(s) to all allies and applies ACC Buff for 2 turn(s) to all allies.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },


  // ===== ALOLAN FORMS =====
  // --- rattata_alola --- original: atb_boost on_kill
  rattata_alola_skill3b: {
    id: 'rattata_alola_skill3b',
    name: 'Pressure',
    description: 'Passive: on crit, applies Oblivion for 2 turn(s) (40% chance) and strips 1 buff(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'oblivion', value: 0, duration: 2, chance: 40 },
      { id: 'strip', value: 1, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- raticate_alola --- original: bleed on_attack
  raticate_alola_skill3b: {
    id: 'raticate_alola_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies Amplify for 2 turn(s) to self and applies Crit DMG Buff for 2 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- raichu_alola --- original: cd_reduce on_crit
  raichu_alola_skill3b: {
    id: 'raichu_alola_skill3b',
    name: 'Static',
    description: 'Passive: on attack, strips 1 buff(s) and applies SPD Buff for 1 turn(s) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sandshrew_alola --- original: amplify+crit_dmg_buff hp_threshold
  sandshrew_alola_skill3b: {
    id: 'sandshrew_alola_skill3b',
    name: 'Ice Body',
    description: 'Passive: when an ally faints, grants Shield for 10% HP to all allies and applies Immunity for 1 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- sandslash_alola --- original: evasion battle_start
  sandslash_alola_skill3b: {
    id: 'sandslash_alola_skill3b',
    name: 'Ice Body',
    description: 'Passive: at turn start, grants Shield for 10% HP to all allies and applies DEF Buff for 1 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- vulpix_alola --- original: absorb_atb on_attack
  vulpix_alola_skill3b: {
    id: 'vulpix_alola_skill3b',
    name: 'Ice Body',
    description: 'Passive: when hit, grants Shield for 10% HP to all allies and applies DEF Buff for 1 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- ninetales_alola --- original: spd_buff battle_start
  ninetales_alola_skill3b: {
    id: 'ninetales_alola_skill3b',
    name: 'Ice Body',
    description: 'Passive: at turn start, applies Endure for 1 turn(s) to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- diglett_alola --- original: shield turn_start
  diglett_alola_skill3b: {
    id: 'diglett_alola_skill3b',
    name: 'Arena Trap',
    description: 'Passive: at battle start, applies Counter for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- dugtrio_alola --- original: invincibility+recovery hp_threshold
  dugtrio_alola_skill3b: {
    id: 'dugtrio_alola_skill3b',
    name: 'Arena Trap',
    description: 'Passive: when an ally faints, applies Counter for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- meowth_alola --- original: absorb_atb on_attack
  meowth_alola_skill3b: {
    id: 'meowth_alola_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies ATK Buff for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- persian_alola --- original: atk_break battle_start
  persian_alola_skill3b: {
    id: 'persian_alola_skill3b',
    name: 'Pressure',
    description: 'Passive: at turn start, applies Vampire for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- geodude_alola --- original: spd_buff battle_start
  geodude_alola_skill3b: {
    id: 'geodude_alola_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at turn start, applies Reflect for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- graveler_alola --- original: def_buff+endure on_ally_death
  graveler_alola_skill3b: {
    id: 'graveler_alola_skill3b',
    name: 'Sand Stream',
    description: 'Passive: when HP drops below threshold, applies Reflect for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- golem_alola --- original: soul_protect battle_start
  golem_alola_skill3b: {
    id: 'golem_alola_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at turn start, applies Endure for 1 turn(s) to self and applies Counter for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- grimer_alola --- original: absorb_atb on_attack
  grimer_alola_skill3b: {
    id: 'grimer_alola_skill3b',
    name: 'Poison Point',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to all allies and cleanses 1 debuff(s) to all allies.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- muk_alola --- original: nullify battle_start
  muk_alola_skill3b: {
    id: 'muk_alola_skill3b',
    name: 'Poison Point',
    description: 'Passive: at turn start, applies Recovery for 2 turn(s) to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- exeggutor_alola --- original: unrecoverable on_attack
  exeggutor_alola_skill3b: {
    id: 'exeggutor_alola_skill3b',
    name: 'Overgrow',
    description: 'Passive: when hit, heals to all allies for 8% HP and shortens debuffs by 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- marowak_alola --- original: shorten_debuffs turn_start
  marowak_alola_skill3b: {
    id: 'marowak_alola_skill3b',
    name: 'Blaze',
    description: 'Passive: at battle start, applies Crit DMG Buff for 2 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },


  // ===== GALARIAN FORMS =====
  // --- meowth_galar --- original: def_buff battle_start
  meowth_galar_skill3b: {
    id: 'meowth_galar_skill3b',
    name: 'Sturdy',
    description: 'Passive: at turn start, grants Shield for 10% HP to all allies and applies Immunity for 1 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- ponyta_galar --- original: glancing on_hit_received
  ponyta_galar_skill3b: {
    id: 'ponyta_galar_skill3b',
    name: 'Inner Focus',
    description: 'Passive: on attack, applies Silence for 1 turn(s) (40% chance) and increases enemy cooldowns by 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 40 },
      { id: 'cd_increase', value: 1, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- rapidash_galar --- original: res_buff turn_start
  rapidash_galar_skill3b: {
    id: 'rapidash_galar_skill3b',
    name: 'Inner Focus',
    description: 'Passive: at battle start, grants Shield for 10% HP to all allies and cleanses 1 debuff(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- slowpoke_galar --- original: glancing on_hit_received
  slowpoke_galar_skill3b: {
    id: 'slowpoke_galar_skill3b',
    name: 'Inner Focus',
    description: 'Passive: on attack, applies Seal for 1 turn(s) (40% chance) and cleanses 1 debuff(s) to self.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 40 },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- slowbro_galar --- original: counter on_hit_received
  slowbro_galar_skill3b: {
    id: 'slowbro_galar_skill3b',
    name: 'Poison Point',
    description: 'Passive: on attack, applies Buff Block for 2 turn(s) (40% chance) and applies Expose for 2 turn(s) (35% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'buff_block', value: 0, duration: 2, chance: 40 },
      { id: 'expose', value: 0, duration: 2, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- weezing_galar --- original: bomb battle_start
  weezing_galar_skill3b: {
    id: 'weezing_galar_skill3b',
    name: 'Poison Point',
    description: 'Passive: at turn start, grants Shield for 15% HP to self and applies Counter for 2 turn(s) to self.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- mrmime_galar --- original: detonate on_attack
  mrmime_galar_skill3b: {
    id: 'mrmime_galar_skill3b',
    name: 'Ice Body',
    description: 'Passive: when hit, grants Shield for 10% HP to all allies and applies Immunity for 1 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- articuno_galar --- original: absorb_atb on_attack
  articuno_galar_skill3b: {
    id: 'articuno_galar_skill3b',
    name: 'Inner Focus',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- zapdos_galar --- original: recovery battle_start
  zapdos_galar_skill3b: {
    id: 'zapdos_galar_skill3b',
    name: 'Guts',
    description: 'Passive: at turn start, applies ATK Buff for 2 turn(s) to all allies and applies SPD Buff for 1 turn(s) to all allies.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- moltres_galar --- original: brand on_attack
  moltres_galar_skill3b: {
    id: 'moltres_galar_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies Evasion for 2 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- slowking_galar --- original: mark on_attack
  slowking_galar_skill3b: {
    id: 'slowking_galar_skill3b',
    name: 'Poison Point',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to all allies and cleanses 1 debuff(s) to all allies.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- corsola_galar --- original: absorb_atb on_attack
  corsola_galar_skill3b: {
    id: 'corsola_galar_skill3b',
    name: 'Levitate',
    description: 'Passive: when hit, applies Nullify for 1 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'nullify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- zigzagoon_galar --- original: atb_boost+cd_reduce on_kill
  zigzagoon_galar_skill3b: {
    id: 'zigzagoon_galar_skill3b',
    name: 'Pressure',
    description: 'Passive: on crit, applies Brand for 2 turn(s) (40% chance) and applies Silence for 1 turn(s) (35% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'silence', value: 0, duration: 1, chance: 35 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- linoone_galar --- original: acc_buff always
  linoone_galar_skill3b: {
    id: 'linoone_galar_skill3b',
    name: 'Pressure',
    description: 'Passive: at battle start, applies Vampire for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- darumaka_galar --- original: atk_buff+spd_buff on_crit
  darumaka_galar_skill3b: {
    id: 'darumaka_galar_skill3b',
    name: 'Ice Body',
    description: 'Passive: on attack, applies Anti-Heal for 2 turn(s) (40% chance) and applies DEF Buff for 1 turn(s) to self.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'anti_heal', value: 0, duration: 2, chance: 40 },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- yamask_galar --- original: endure hp_threshold
  yamask_galar_skill3b: {
    id: 'yamask_galar_skill3b',
    name: 'Arena Trap',
    description: 'Passive: when an ally faints, applies DEF Buff for 2 turn(s) to self and applies Reflect for 2 turn(s) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- stunfisk_galar --- original: atb_boost on_kill
  stunfisk_galar_skill3b: {
    id: 'stunfisk_galar_skill3b',
    name: 'Arena Trap',
    description: 'Passive: on crit, applies DEF Break for 2 turn(s) (40% chance) and grants Shield for 15% HP to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 2, chance: 40 },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },


  // ===== HISUIAN FORMS =====
  // --- growlithe_hisui --- original: res_buff always
  growlithe_hisui_skill3b: {
    id: 'growlithe_hisui_skill3b',
    name: 'Blaze',
    description: 'Passive: at battle start, applies ATK Buff for 2 turn(s) to all allies and applies Amplify for 1 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- arcanine_hisui --- original: def_buff battle_start
  arcanine_hisui_skill3b: {
    id: 'arcanine_hisui_skill3b',
    name: 'Blaze',
    description: 'Passive: at turn start, applies SPD Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 2 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- voltorb_hisui --- original: atb_reduce on_attack
  voltorb_hisui_skill3b: {
    id: 'voltorb_hisui_skill3b',
    name: 'Static',
    description: 'Passive: when hit, applies ACC Buff for 2 turn(s) to all allies and strips 1 buff(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'strip', value: 1, duration: 0, chance: 100, target: 'all_enemies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- electrode_hisui --- original: skill_refresh on_kill
  electrode_hisui_skill3b: {
    id: 'electrode_hisui_skill3b',
    name: 'Static',
    description: 'Passive: on crit, applies Paralysis for 1 turn(s) (40% chance) and boosts ATB by 25% to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 40 },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- typhlosion_hisui --- original: crit_dmg_buff on_crit
  typhlosion_hisui_skill3b: {
    id: 'typhlosion_hisui_skill3b',
    name: 'Blaze',
    description: 'Passive: on attack, applies Burn for 2 turn(s) (40% chance) and boosts ATB by 25% to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 40 },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- qwilfish_hisui --- original: res_break on_attack
  qwilfish_hisui_skill3b: {
    id: 'qwilfish_hisui_skill3b',
    name: 'Pressure',
    description: 'Passive: when hit, applies Vampire for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- sneasel_hisui --- original: atb_boost+spd_buff hp_threshold
  sneasel_hisui_skill3b: {
    id: 'sneasel_hisui_skill3b',
    name: 'Guts',
    description: 'Passive: when an ally faints, applies Amplify for 2 turn(s) to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- samurott_hisui --- original: expose battle_start
  samurott_hisui_skill3b: {
    id: 'samurott_hisui_skill3b',
    name: 'Torrent',
    description: 'Passive: at turn start, heals to all allies for 8% HP and applies Recovery for 1 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- lilligant_hisui --- original: absorb_atb on_attack
  lilligant_hisui_skill3b: {
    id: 'lilligant_hisui_skill3b',
    name: 'Overgrow',
    description: 'Passive: when hit, applies Recovery for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- zorua_hisui --- original: detonate on_attack
  zorua_hisui_skill3b: {
    id: 'zorua_hisui_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, heals to self for 15% HP and applies Recovery for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- zoroark_hisui --- original: atb_boost+cd_reduce on_kill
  zoroark_hisui_skill3b: {
    id: 'zoroark_hisui_skill3b',
    name: 'Adaptability',
    description: 'Passive: on crit, applies Seal for 1 turn(s) (40% chance) and applies Evasion for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 40 },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- braviary_hisui --- original: spd_buff battle_start
  braviary_hisui_skill3b: {
    id: 'braviary_hisui_skill3b',
    name: 'Inner Focus',
    description: 'Passive: at turn start, cleanses 1 debuff(s) to all allies and heals to all allies for 8% HP.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- sliggoo_hisui --- original: heal on_hit_received
  sliggoo_hisui_skill3b: {
    id: 'sliggoo_hisui_skill3b',
    name: 'Sturdy',
    description: 'Passive: on attack, applies Glancing for 1 turn(s) (40% chance) and grants Shield for 15% HP to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'glancing', value: 0, duration: 1, chance: 40 },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- goodra_hisui --- original: invincibility+recovery hp_threshold
  goodra_hisui_skill3b: {
    id: 'goodra_hisui_skill3b',
    name: 'Sturdy',
    description: 'Passive: when an ally faints, applies DEF Buff for 2 turn(s) to all allies and applies Reflect for 2 turn(s) to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- avalugg_hisui --- original: shield turn_start
  avalugg_hisui_skill3b: {
    id: 'avalugg_hisui_skill3b',
    name: 'Ice Body',
    description: 'Passive: at battle start, applies Endure for 1 turn(s) to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- decidueye_hisui --- original: amplify+crit_dmg_buff hp_threshold
  decidueye_hisui_skill3b: {
    id: 'decidueye_hisui_skill3b',
    name: 'Overgrow',
    description: 'Passive: when an ally faints, applies Nullify for 1 turn(s) to all allies and applies SPD Buff for 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'nullify', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },


  // ===== PALDEAN FORMS =====
  // --- wooper_paldea --- original: recovery turn_start
  wooper_paldea_skill3b: {
    id: 'wooper_paldea_skill3b',
    name: 'Poison Point',
    description: 'Passive: at battle start, applies Nullify for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'nullify', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },


  // ===== DEOXYS FORMS =====
  // --- deoxys_attack --- original: seal on_attack
  deoxys_attack_skill3b: {
    id: 'deoxys_attack_skill3b',
    name: 'Inner Focus',
    description: 'Passive: when hit, grants Shield for 10% HP to all allies and cleanses 1 debuff(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- deoxys_defense --- original: cd_increase on_crit
  deoxys_defense_skill3b: {
    id: 'deoxys_defense_skill3b',
    name: 'Inner Focus',
    description: 'Passive: on attack, applies Seal for 1 turn(s) (40% chance) and cleanses 1 debuff(s) to self.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 40 },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- deoxys_speed --- original: bleed on_attack
  deoxys_speed_skill3b: {
    id: 'deoxys_speed_skill3b',
    name: 'Inner Focus',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },


  // ===== ROTOM FORMS =====
  // --- rotom_fan --- original: bomb on_attack
  rotom_fan_skill3b: {
    id: 'rotom_fan_skill3b',
    name: 'Static',
    description: 'Passive: when hit, boosts ATB by 25% to self and reduces cooldowns by 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- rotom_frost --- original: def_buff+endure on_ally_death
  rotom_frost_skill3b: {
    id: 'rotom_frost_skill3b',
    name: 'Static',
    description: 'Passive: when HP drops below threshold, applies SPD Buff for 2 turn(s) to all allies and applies Immunity for 1 turn(s) to all allies.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- rotom_heat --- original: res_buff turn_start
  rotom_heat_skill3b: {
    id: 'rotom_heat_skill3b',
    name: 'Static',
    description: 'Passive: at battle start, applies ACC Buff for 2 turn(s) to all allies and strips 1 buff(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'strip', value: 1, duration: 0, chance: 100, target: 'all_enemies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- rotom_mow --- original: absorb_atb on_attack
  rotom_mow_skill3b: {
    id: 'rotom_mow_skill3b',
    name: 'Static',
    description: 'Passive: when hit, applies SPD Buff for 2 turn(s) to all allies and applies ACC Buff for 2 turn(s) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- rotom_wash --- original: balance_hp on_hit_received
  rotom_wash_skill3b: {
    id: 'rotom_wash_skill3b',
    name: 'Static',
    description: 'Passive: on attack, applies SPD Slow for 2 turn(s) (40% chance) and reduces cooldowns by 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 2, chance: 40 },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },


  // ===== OTHER ALTERNATE FORMS =====
  // --- giratina_origin --- original: res_break on_attack
  giratina_origin_skill3b: {
    id: 'giratina_origin_skill3b',
    name: 'Levitate',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to self and heals to self for 15% HP.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- shaymin_sky --- original: nullify battle_start
  shaymin_sky_skill3b: {
    id: 'shaymin_sky_skill3b',
    name: 'Overgrow',
    description: 'Passive: at turn start, applies Recovery for 1 turn(s) to all allies and extends buffs by 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },


  // ===== ARCEUS FORMS =====
  // --- arceus_bug --- original: atb_boost+cd_reduce on_kill
  arceus_bug_skill3b: {
    id: 'arceus_bug_skill3b',
    name: 'Adaptability',
    description: 'Passive: on crit, applies Bleed for 2 turn(s) (40% chance) and applies Vampire for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 40 },
      { id: 'vampire', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- arceus_dark --- original: crit_dmg_buff on_crit
  arceus_dark_skill3b: {
    id: 'arceus_dark_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, strips 1 buff(s) and applies ACC Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'acc_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- arceus_dragon --- original: transfer_debuff on_attack
  arceus_dragon_skill3b: {
    id: 'arceus_dragon_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies ACC Buff for 2 turn(s) to self and applies Crit Rate Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arceus_electric --- original: endure hp_threshold
  arceus_electric_skill3b: {
    id: 'arceus_electric_skill3b',
    name: 'Adaptability',
    description: 'Passive: when an ally faints, boosts ATB by 25% to self and reduces cooldowns by 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- arceus_fairy --- original: nullify battle_start
  arceus_fairy_skill3b: {
    id: 'arceus_fairy_skill3b',
    name: 'Adaptability',
    description: 'Passive: at turn start, grants Shield for 10% HP to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- arceus_fighting --- original: detonate on_attack
  arceus_fighting_skill3b: {
    id: 'arceus_fighting_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Nullify for 1 turn(s) to self and applies Reflect for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'nullify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arceus_fire --- original: amplify always
  arceus_fire_skill3b: {
    id: 'arceus_fire_skill3b',
    name: 'Adaptability',
    description: 'Passive: at battle start, applies Immunity for 1 turn(s) to self and heals to self for 15% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- arceus_flying --- original: vampire hp_threshold
  arceus_flying_skill3b: {
    id: 'arceus_flying_skill3b',
    name: 'Adaptability',
    description: 'Passive: when an ally faints, applies Amplify for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- arceus_ghost --- original: atk_buff on_kill
  arceus_ghost_skill3b: {
    id: 'arceus_ghost_skill3b',
    name: 'Adaptability',
    description: 'Passive: on crit, applies Anti-Heal for 2 turn(s) (40% chance) and applies Recovery for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'anti_heal', value: 0, duration: 2, chance: 40 },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- arceus_grass --- original: brand on_attack
  arceus_grass_skill3b: {
    id: 'arceus_grass_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies SPD Buff for 2 turn(s) to self and applies Evasion for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arceus_ground --- original: atk_break battle_start
  arceus_ground_skill3b: {
    id: 'arceus_ground_skill3b',
    name: 'Adaptability',
    description: 'Passive: at turn start, applies ATK Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 1 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- arceus_ice --- original: endure hp_threshold
  arceus_ice_skill3b: {
    id: 'arceus_ice_skill3b',
    name: 'Adaptability',
    description: 'Passive: when an ally faints, applies Crit DMG Buff for 2 turn(s) to self and applies Vampire for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- arceus_poison --- original: immunity battle_start
  arceus_poison_skill3b: {
    id: 'arceus_poison_skill3b',
    name: 'Adaptability',
    description: 'Passive: at turn start, applies ATK Buff for 2 turn(s) to self and applies SPD Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- arceus_psychic --- original: amplify always
  arceus_psychic_skill3b: {
    id: 'arceus_psychic_skill3b',
    name: 'Adaptability',
    description: 'Passive: at battle start, applies Evasion for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- arceus_rock --- original: expose on_attack
  arceus_rock_skill3b: {
    id: 'arceus_rock_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Evasion for 2 turn(s) to self and applies ACC Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arceus_steel --- original: heal+cleanse on_kill
  arceus_steel_skill3b: {
    id: 'arceus_steel_skill3b',
    name: 'Adaptability',
    description: 'Passive: on crit, applies ACC Break for 2 turn(s) (40% chance) and applies Amplify for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_break', value: 0, duration: 2, chance: 40 },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- arceus_water --- original: amplify always
  arceus_water_skill3b: {
    id: 'arceus_water_skill3b',
    name: 'Adaptability',
    description: 'Passive: at battle start, heals to self for 15% HP and applies Recovery for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },


  // ===== THERIAN / FORCES OF NATURE =====
  // --- tornadus_therian --- original: balance_hp on_hit_received
  tornadus_therian_skill3b: {
    id: 'tornadus_therian_skill3b',
    name: 'Keen Eye',
    description: 'Passive: on attack, applies Confusion for 1 turn(s) (40% chance) and applies SPD Buff for 1 turn(s) to self.',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'confusion', value: 0, duration: 1, chance: 40 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- thundurus_therian --- original: atb_boost on_kill
  thundurus_therian_skill3b: {
    id: 'thundurus_therian_skill3b',
    name: 'Static',
    description: 'Passive: on crit, strips 1 buff(s) and applies SPD Buff for 1 turn(s) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- landorus_therian --- original: soul_protect battle_start
  landorus_therian_skill3b: {
    id: 'landorus_therian_skill3b',
    name: 'Arena Trap',
    description: 'Passive: at turn start, grants Shield for 10% HP to all allies and applies DEF Buff for 1 turn(s) to all allies.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },


  // ===== KYUREM FORMS =====
  // --- kyurem_black --- original: detonate on_attack
  kyurem_black_skill3b: {
    id: 'kyurem_black_skill3b',
    name: 'Intimidate',
    description: 'Passive: when hit, applies Endure for 1 turn(s) to self and applies Vampire for 2 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- kyurem_white --- original: cd_increase on_crit
  kyurem_white_skill3b: {
    id: 'kyurem_white_skill3b',
    name: 'Intimidate',
    description: 'Passive: on attack, strips 1 buff(s) and applies Amplify for 1 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },


  // ===== ZYGARDE FORMS =====
  // --- zygarde_10 --- original: nullify on_hit_received
  zygarde_10_skill3b: {
    id: 'zygarde_10_skill3b',
    name: 'Intimidate',
    description: 'Passive: on attack, applies Brand for 2 turn(s) (40% chance) and applies Crit DMG Buff for 1 turn(s) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- zygarde_complete --- original: threat+shield battle_start
  zygarde_complete_skill3b: {
    id: 'zygarde_complete_skill3b',
    name: 'Intimidate',
    description: 'Passive: at turn start, applies SPD Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 2 turn(s) to all allies.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },


  // ===== LYCANROC FORMS =====
  // --- lycanroc_dusk --- original: immunity battle_start
  lycanroc_dusk_skill3b: {
    id: 'lycanroc_dusk_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at turn start, applies DEF Buff for 2 turn(s) to all allies and applies ACC Buff for 2 turn(s) to all allies.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- lycanroc_midnight --- original: def_buff battle_start
  lycanroc_midnight_skill3b: {
    id: 'lycanroc_midnight_skill3b',
    name: 'Sand Stream',
    description: 'Passive: at turn start, applies Reflect for 2 turn(s) to self and applies Threat for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },


  // ===== SILVALLY FORMS =====
  // --- silvally_bug --- original: atb_boost on_crit
  silvally_bug_skill3b: {
    id: 'silvally_bug_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, applies Seal for 1 turn(s) (40% chance) and applies Evasion for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 40 },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_dark --- original: brand on_attack
  silvally_dark_skill3b: {
    id: 'silvally_dark_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Vampire for 2 turn(s) to self and applies Crit DMG Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_dragon --- original: counter on_attack
  silvally_dragon_skill3b: {
    id: 'silvally_dragon_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies ACC Buff for 2 turn(s) to self and applies Crit Rate Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_electric --- original: counter on_hit_received
  silvally_electric_skill3b: {
    id: 'silvally_electric_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, strips 1 buff(s) and applies ACC Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'acc_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_fairy --- original: balance_hp on_hit_received
  silvally_fairy_skill3b: {
    id: 'silvally_fairy_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, applies SPD Slow for 2 turn(s) (40% chance) and applies Counter for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 2, chance: 40 },
      { id: 'counter', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_fighting --- original: detonate on_attack
  silvally_fighting_skill3b: {
    id: 'silvally_fighting_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, grants Shield for 10% HP to all allies and applies RES Buff for 1 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_fire --- original: expose on_attack
  silvally_fire_skill3b: {
    id: 'silvally_fire_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Nullify for 1 turn(s) to self and applies Reflect for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'nullify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_flying --- original: detonate on_attack
  silvally_flying_skill3b: {
    id: 'silvally_flying_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Immunity for 1 turn(s) to self and heals to self for 15% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_ghost --- original: vampire hp_threshold
  silvally_ghost_skill3b: {
    id: 'silvally_ghost_skill3b',
    name: 'Adaptability',
    description: 'Passive: when an ally faints, applies Amplify for 2 turn(s) to self and applies Endure for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- silvally_grass --- original: brand on_attack
  silvally_grass_skill3b: {
    id: 'silvally_grass_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies DEF Buff for 2 turn(s) to self and applies Recovery for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_ground --- original: acc_break on_attack
  silvally_ground_skill3b: {
    id: 'silvally_ground_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies SPD Buff for 2 turn(s) to self and applies Evasion for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_ice --- original: shield turn_start
  silvally_ice_skill3b: {
    id: 'silvally_ice_skill3b',
    name: 'Adaptability',
    description: 'Passive: at battle start, applies ATK Buff for 2 turn(s) to all allies and applies Crit Rate Buff for 1 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- silvally_poison --- original: balance_hp on_hit_received
  silvally_poison_skill3b: {
    id: 'silvally_poison_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, applies DEF Break for 2 turn(s) (40% chance) and applies Crit DMG Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 2, chance: 40 },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_psychic --- original: atb_boost on_crit
  silvally_psychic_skill3b: {
    id: 'silvally_psychic_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, applies DEF Break for 1 turn(s) (40% chance) and applies ATK Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 40 },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_rock --- original: absorb_atb on_attack
  silvally_rock_skill3b: {
    id: 'silvally_rock_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, applies Crit Rate Buff for 2 turn(s) to self and applies Amplify for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silvally_steel --- original: atk_buff+spd_buff on_crit
  silvally_steel_skill3b: {
    id: 'silvally_steel_skill3b',
    name: 'Adaptability',
    description: 'Passive: on attack, applies Brand for 2 turn(s) (40% chance) and applies Crit Rate Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 40 },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- silvally_water --- original: soul_protect on_attack
  silvally_water_skill3b: {
    id: 'silvally_water_skill3b',
    name: 'Adaptability',
    description: 'Passive: when hit, grants Shield for 15% HP to self and applies DEF Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },


  // ===== CROWNED FORMS =====
  // --- zacian_crowned --- original: nullify on_hit_received
  zacian_crowned_skill3b: {
    id: 'zacian_crowned_skill3b',
    name: 'Cute Charm',
    description: 'Passive: on attack, applies Sleep for 1 turn(s) (40% chance) and cleanses 1 debuff(s) to self.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'sleep', value: 0, duration: 1, chance: 40 },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- zamazenta_crowned --- original: soul_protect battle_start
  zamazenta_crowned_skill3b: {
    id: 'zamazenta_crowned_skill3b',
    name: 'Guts',
    description: 'Passive: at turn start, applies ATK Buff for 2 turn(s) to self and applies Crit Rate Buff for 2 turn(s) to self.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },


  // ===== CALYREX RIDER FORMS =====
  // --- calyrex_ice --- original: amplify always
  calyrex_ice_skill3b: {
    id: 'calyrex_ice_skill3b',
    name: 'Inner Focus',
    description: 'Passive: at battle start, cleanses 1 debuff(s) to all allies and heals to all allies for 8% HP.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'heal', value: 8, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- calyrex_shadow --- original: cd_increase on_crit
  calyrex_shadow_skill3b: {
    id: 'calyrex_shadow_skill3b',
    name: 'Inner Focus',
    description: 'Passive: on attack, applies Confusion for 1 turn(s) (40% chance) and applies RES Buff for 1 turn(s) to self.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'confusion', value: 0, duration: 1, chance: 40 },
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },


  // ===== THERIAN / FORCES OF NATURE =====
  // --- enamorus_therian --- original: heal on_ally_death
  enamorus_therian_skill3b: {
    id: 'enamorus_therian_skill3b',
    name: 'Cute Charm',
    description: 'Passive: when HP drops below threshold, applies RES Buff for 1 turn(s) to all allies and extends buffs by 1 turn(s) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

};
