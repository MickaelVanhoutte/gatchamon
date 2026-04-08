import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN3_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- treecko (grass) ---
  // Original: hp_threshold (<50%) -> ATB boost 30% + SPD Buff 2t (self, defensive/reactive)
  // Shiny: on_attack -> vampire + ATK Buff (offensive lifesteal playstyle)
  treecko_skill3b: {
    id: 'treecko_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Vampire for 2 turn(s), applies ATK Buff for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- grovyle (grass) ---
  // Original: on_ally_death -> revive 20% (6t CD, team support)
  // Shiny: turn_start -> heal all allies 3% (consistent sustain instead of emergency revive)
  grovyle_skill3b: {
    id: 'grovyle_skill3b',
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

  // --- sceptile (grass) ---
  // Original: on_ally_death -> revive 20% (6t CD, team support)
  // Shiny: battle_start -> Recovery 2t all allies (proactive sustain)
  sceptile_skill3b: {
    id: 'sceptile_skill3b',
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

  // --- torchic (fire) ---
  // Original: on_crit -> ATB boost 25% + SPD Buff 1t (speed-focused)
  // Shiny: on_attack -> burn 2t 20% chance (DoT offensive)
  torchic_skill3b: {
    id: 'torchic_skill3b',
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

  // --- combusken (fire/fighting) ---
  // Original: on_hit_received -> ATB reduce 15% 33% chance (defensive disruption)
  // Shiny: on_attack -> ATK Buff 1t (offensive empowerment)
  combusken_skill3b: {
    id: 'combusken_skill3b',
    name: 'Blaze',
    description: 'Passive: applies ATK Buff for 1 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- blaziken (fire/fighting) ---
  // Original: on_hit_received -> heal all allies 3% (team sustain on damage taken)
  // Shiny: on_kill -> ATB boost 50% (momentum after kills)
  blaziken_skill3b: {
    id: 'blaziken_skill3b',
    name: 'Blaze',
    description: 'Passive: boosts ATB by 50%.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- mudkip (water) ---
  // Original: always -> ACC Buff 999t (permanent accuracy)
  // Shiny: always -> DEF Buff 999t (permanent defense instead)
  mudkip_skill3b: {
    id: 'mudkip_skill3b',
    name: 'Torrent',
    description: 'Passive: applies DEF Buff for 999 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- marshtomp (water/ground) ---
  // Original: always -> RES Buff 999t (permanent resistance)
  // Shiny: on_hit_received -> counter 1t 30% chance (reactive damage)
  marshtomp_skill3b: {
    id: 'marshtomp_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Counter for 1 turn(s) (30% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- swampert (water/ground) ---
  // Original: turn_start -> extend buffs 1t all allies (buff duration support)
  // Shiny: on_hit_received -> DEF Buff 2t + Endure 1t (tank passive)
  swampert_skill3b: {
    id: 'swampert_skill3b',
    name: 'Torrent',
    description: 'Passive: applies DEF Buff for 2 turn(s), applies Endure for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- poochyena (dark) ---
  // Original: on_attack -> steal buff 15% chance (buff theft)
  // Shiny: on_hit_received -> ATB boost 15% (reactive speed)
  poochyena_skill3b: {
    id: 'poochyena_skill3b',
    name: 'Pressure',
    description: 'Passive: boosts ATB by 15%.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- mightyena (dark) ---
  // Original: on_attack -> bleed 2t 15% chance (DoT on attack)
  // Shiny: on_crit -> DEF Break 2t (armor shred on crits)
  mightyena_skill3b: {
    id: 'mightyena_skill3b',
    name: 'Pressure',
    description: 'Passive: applies DEF Break for 2 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- zigzagoon (normal) ---
  // Original: on_attack -> mark 2t 24% chance (debuff on attack)
  // Shiny: on_hit_received -> reflect 2t (defensive reflect)
  zigzagoon_skill3b: {
    id: 'zigzagoon_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Reflect for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- linoone (normal) ---
  // Original: on_attack -> ATB boost 15% 25% chance (speed on attack)
  // Shiny: on_crit -> CD reduce 1t (skill cycling on crits)
  linoone_skill3b: {
    id: 'linoone_skill3b',
    name: 'Adaptability',
    description: 'Passive: reduces cooldowns by 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- wurmple (bug) ---
  // Original: turn_start -> extend buffs 1t all allies (buff support)
  // Shiny: on_hit_received -> shield 1t (defensive on hit)
  wurmple_skill3b: {
    id: 'wurmple_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- silcoon (bug) ---
  // Original: turn_start -> SPD Buff 1t self (speed sustain)
  // Shiny: on_hit_received -> DEF Buff 1t (tank version)
  silcoon_skill3b: {
    id: 'silcoon_skill3b',
    name: 'Swarm',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- beautifly (bug/flying) ---
  // Original: on_kill -> ATB boost 50% (kill momentum)
  // Shiny: on_attack -> Crit Rate Buff 1t 25% chance (sustained crit building)
  beautifly_skill3b: {
    id: 'beautifly_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Crit Rate Buff for 1 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cascoon (bug) ---
  // Original: on_kill -> Skill Refresh 2t (CD reset on kill)
  // Shiny: battle_start -> Evasion 2t (opening evasion)
  cascoon_skill3b: {
    id: 'cascoon_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Evasion for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- dustox (bug/poison) ---
  // Original: on_attack -> transfer debuff 25% (debuff transfer)
  // Shiny: on_hit_received -> poison 2t (retaliation poison)
  dustox_skill3b: {
    id: 'dustox_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Poison for 2 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- lotad (water/grass) ---
  // Original: on_attack -> ATB reduce 10% 19% chance (speed disruption)
  // Shiny: turn_start -> heal 2% all allies (sustain support)
  lotad_skill3b: {
    id: 'lotad_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 2% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 2, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- lombre (water/grass) ---
  // Original: on_attack -> seal 2t 20% chance (skill disruption)
  // Shiny: on_hit_received -> cleanse 1 (debuff removal on hit)
  lombre_skill3b: {
    id: 'lombre_skill3b',
    name: 'Torrent',
    description: 'Passive: removes 1 debuff(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- ludicolo (water/grass) ---
  // Original: turn_start -> Recovery 1t self (self sustain)
  // Shiny: battle_start -> Immunity 2t all allies (team debuff protection)
  ludicolo_skill3b: {
    id: 'ludicolo_skill3b',
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

  // --- seedot (grass) ---
  // Original: always -> ACC Buff 999t (permanent accuracy)
  // Shiny: always -> Crit Rate Buff 999t (permanent crit instead)
  seedot_skill3b: {
    id: 'seedot_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Crit Rate Buff for 999 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- nuzleaf (grass/dark) ---
  // Original: turn_start -> strip 1 buff all enemies (team buff removal)
  // Shiny: on_attack -> silence 1t 20% chance (skill lockdown)
  nuzleaf_skill3b: {
    id: 'nuzleaf_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- shiftry (grass/dark) ---
  // Original: battle_start -> Recovery 2t all allies (opening heal)
  // Shiny: turn_start -> shorten debuffs 1t all allies (cleanse over time)
  shiftry_skill3b: {
    id: 'shiftry_skill3b',
    name: 'Overgrow',
    description: 'Passive: shortens debuff durations by 1 turn.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- taillow (normal/flying) ---
  // Original: on_kill -> Skill Refresh 2t (CD reset on kill)
  // Shiny: on_attack -> SPD Buff 1t 20% chance (speed buildup)
  taillow_skill3b: {
    id: 'taillow_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies SPD Buff for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 1, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- swellow (normal/flying) ---
  // Original: hp_threshold (<50%) -> Vampire 2t (lifesteal when low)
  // Shiny: on_crit -> Amplify 1t (damage boost on crits)
  swellow_skill3b: {
    id: 'swellow_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Amplify for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- wingull (water/flying) ---
  // Original: battle_start -> SPD Buff 2t all allies (team speed)
  // Shiny: turn_start -> heal 2% all allies (sustained healing)
  wingull_skill3b: {
    id: 'wingull_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 2% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 2, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- pelipper (water/flying) ---
  // Original: on_attack -> steal buff 15% chance (buff theft)
  // Shiny: on_attack -> spd_slow 1t 20% chance (enemy speed disruption)
  pelipper_skill3b: {
    id: 'pelipper_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Slow for 1 turn(s) (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ralts (psychic/fairy) ---
  // Original: turn_start -> Recovery 1t self (self sustain)
  // Shiny: on_hit_received -> shield 1t all allies (team protection on hit)
  ralts_skill3b: {
    id: 'ralts_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- kirlia (psychic/fairy) ---
  // Original: on_ally_death -> ATB boost 15% all allies (rally after death)
  // Shiny: battle_start -> Nullify 999t all allies (opening debuff immunity)
  kirlia_skill3b: {
    id: 'kirlia_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Nullify for 2 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- gardevoir (psychic/fairy) ---
  // Original: on_hit_received -> glancing 2t 30% (defensive glancing)
  // Shiny: on_attack -> silence 1t 25% chance (offensive disruption)
  gardevoir_skill3b: {
    id: 'gardevoir_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- surskit (bug/water) ---
  // Original: turn_start -> RES Buff 1t all allies (team resistance)
  // Shiny: on_ally_death -> heal 10% all allies (emergency sustain)
  surskit_skill3b: {
    id: 'surskit_skill3b',
    name: 'Swarm',
    description: 'Passive: heals for 10% HP.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- masquerain (bug/flying) ---
  // Original: on_kill -> ATB boost 50% (kill momentum)
  // Shiny: on_attack -> ACC Break 1t 20% chance (accuracy disruption)
  masquerain_skill3b: {
    id: 'masquerain_skill3b',
    name: 'Swarm',
    description: 'Passive: applies ACC Break for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_break', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- shroomish (grass) ---
  // Original: turn_start -> SPD Buff 1t self (speed)
  // Shiny: on_attack -> extend buffs 1t 20% chance (buff prolongation)
  shroomish_skill3b: {
    id: 'shroomish_skill3b',
    name: 'Overgrow',
    description: 'Passive: extends buff durations by 1 turn (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'extend_buffs', value: 1, duration: 0, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- breloom (grass/fighting) ---
  // Original: battle_start -> Recovery 2t all allies (opening sustain)
  // Shiny: on_attack -> Vampire 1t 25% chance (offensive lifesteal)
  breloom_skill3b: {
    id: 'breloom_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Vampire for 1 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- slakoth (normal) ---
  // Original: on_attack -> detonate 15% (DoT burst)
  // Shiny: hp_threshold (<50%) -> Endure 1t + ATK Buff 2t (last stand)
  slakoth_skill3b: {
    id: 'slakoth_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Endure for 1 turn(s), applies ATK Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 50 },
  },

  // --- vigoroth (normal) ---
  // Original: battle_start -> Evasion 2t (opening dodge)
  // Shiny: on_attack -> ATB boost 10% 20% chance (sustained speed)
  vigoroth_skill3b: {
    id: 'vigoroth_skill3b',
    name: 'Adaptability',
    description: 'Passive: boosts ATB by 10% (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 10, duration: 0, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- slaking (normal) ---
  // Original: battle_start -> Recovery 2t all allies (opening sustain)
  // Shiny: on_ally_death -> revive 20% (6t CD, emergency revive)
  slaking_skill3b: {
    id: 'slaking_skill3b',
    name: 'Adaptability',
    description: 'Passive: revives a fallen ally with 20% HP (6 turn CD).',
    type: 'normal',
    category: 'passive',
    cooldown: 6,
    multiplier: 0,
    effects: [{ id: 'revive', value: 20, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- nincada (bug/ground) ---
  // Original: on_attack -> ATB boost 15% 24% chance (speed on attack)
  // Shiny: on_hit_received -> Evasion 1t (dodge after hit)
  nincada_skill3b: {
    id: 'nincada_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Evasion for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- ninjask (bug/flying) ---
  // Original: turn_start -> ATB boost 10% all allies (team speed)
  // Shiny: on_crit -> Skill Refresh 1t (CD reset on crits)
  ninjask_skill3b: {
    id: 'ninjask_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Skill Refresh for 1 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'skill_refresh', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- shedinja (bug/ghost) ---
  // Original: on_attack -> ATB boost 15% 18% chance (speed on attack)
  // Shiny: on_kill -> cleanse 2 self (purge debuffs on kill)
  shedinja_skill3b: {
    id: 'shedinja_skill3b',
    name: 'Swarm',
    description: 'Passive: removes 2 debuff(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 2, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- whismur (normal) ---
  // Original: on_attack -> ACC Buff 1t 15% chance (accuracy on attack)
  // Shiny: on_hit_received -> Reflect 1t (damage reflection)
  whismur_skill3b: {
    id: 'whismur_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Reflect for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- loudred (normal) ---
  // Original: on_attack -> ATB reduce 10% 19% chance (disruption)
  // Shiny: on_crit -> CD increase 1t (skill lockdown on crits)
  loudred_skill3b: {
    id: 'loudred_skill3b',
    name: 'Adaptability',
    description: 'Passive: increases cooldowns by 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_increase', value: 1, duration: 0, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- exploud (normal) ---
  // Original: on_crit -> CD increase 1t (skill lockdown on crits)
  // Shiny: on_attack -> ATB reduce 10% 25% chance (persistent disruption)
  exploud_skill3b: {
    id: 'exploud_skill3b',
    name: 'Adaptability',
    description: 'Passive: reduces ATB by 10% (25% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- makuhita (fighting) ---
  // Original: battle_start -> Threat 3t + Shield 3t (opening tank setup)
  // Shiny: on_hit_received -> Counter 2t (retaliation tank)
  makuhita_skill3b: {
    id: 'makuhita_skill3b',
    name: 'Guts',
    description: 'Passive: applies Counter for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- hariyama (fighting) ---
  // Original: on_ally_death -> ATB boost 15% all allies (rally after death)
  // Shiny: battle_start -> ATK Buff 2t all allies (opening offense buff)
  hariyama_skill3b: {
    id: 'hariyama_skill3b',
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

  // --- azurill (normal/fairy) ---
  // Original: turn_start -> heal 5% all allies (team sustain)
  // Shiny: battle_start -> Shield 2t all allies (opening protection)
  azurill_skill3b: {
    id: 'azurill_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- nosepass (rock) ---
  // Original: always -> RES Buff 999t (permanent resistance)
  // Shiny: always -> DEF Buff 999t (permanent defense)
  nosepass_skill3b: {
    id: 'nosepass_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Buff for 999 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- skitty (normal) ---
  // Original: on_kill -> ATB boost 50% (kill momentum)
  // Shiny: on_attack -> Vampire 1t 18% chance (sustained lifesteal)
  skitty_skill3b: {
    id: 'skitty_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Vampire for 1 turn(s) (18% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 1, chance: 18, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- delcatty (normal) ---
  // Original: on_attack -> Brand 2t 18% chance (damage amp debuff)
  // Shiny: on_crit -> Amplify 1t (self damage boost)
  delcatty_skill3b: {
    id: 'delcatty_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Amplify for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- sableye (dark/ghost) ---
  // Original: on_attack -> transfer debuff 25% (debuff transfer)
  // Shiny: on_hit_received -> Confusion 1t 25% chance (retaliatory CC)
  sableye_skill3b: {
    id: 'sableye_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Confusion for 1 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- mawile (steel/fairy) ---
  // Original: on_attack -> ATB reduce 10% 43% chance (speed disruption)
  // Shiny: on_hit_received -> Threat 2t (tank on damage taken)
  mawile_skill3b: {
    id: 'mawile_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Threat for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- aron (steel/rock) ---
  // Original: on_ally_death -> DEF Buff 2t + Endure 1t (defensive rally)
  // Shiny: battle_start -> Shield 3t + Threat 2t (opening tank)
  aron_skill3b: {
    id: 'aron_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Shield for 3 turn(s), applies Threat for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 3, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- lairon (steel/rock) ---
  // Original: battle_start -> Nullify 999t all allies (debuff immunity)
  // Shiny: on_hit_received -> heal 5% self (self sustain tank)
  lairon_skill3b: {
    id: 'lairon_skill3b',
    name: 'Sturdy',
    description: 'Passive: heals for 5% HP.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- aggron (steel/rock) ---
  // Original: on_hit_received -> ATB reduce 15% 35% (reactive disruption)
  // Shiny: battle_start -> DEF Buff 2t all allies (team defense opening)
  aggron_skill3b: {
    id: 'aggron_skill3b',
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

  // --- meditite (fighting/psychic) ---
  // Original: on_attack -> Provoke 2t 26% chance (forced targeting)
  // Shiny: on_crit -> ATK Buff 1t + SPD Buff 1t (burst empowerment)
  meditite_skill3b: {
    id: 'meditite_skill3b',
    name: 'Guts',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies SPD Buff for 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- medicham (fighting/psychic) ---
  // Original: on_attack -> RES Break 2t 23% chance (resistance shred)
  // Shiny: on_crit -> Expose 2t (defense penetration on crit)
  medicham_skill3b: {
    id: 'medicham_skill3b',
    name: 'Guts',
    description: 'Passive: applies Expose for 2 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'expose', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- electrike (electric) ---
  // Original: on_kill -> Skill Refresh 2t (CD reset on kill)
  // Shiny: on_attack -> Paralysis 1t 15% chance (CC on attack)
  electrike_skill3b: {
    id: 'electrike_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (15% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- manectric (electric) ---
  // Original: battle_start -> ATB boost 20% self (opening speed)
  // Shiny: on_crit -> absorb ATB 15% (speed steal on crits)
  manectric_skill3b: {
    id: 'manectric_skill3b',
    name: 'Static',
    description: 'Passive: absorbs 15% ATB from the enemy.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'absorb_atb', value: 15, duration: 0, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- plusle (electric) ---
  // Original: battle_start -> Expose 2t all enemies (opening debuff)
  // Shiny: on_attack -> Brand 1t 25% chance (damage amp debuff on attack)
  plusle_skill3b: {
    id: 'plusle_skill3b',
    name: 'Static',
    description: 'Passive: applies Brand for 1 turn(s) (25% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- minun (electric) ---
  // Original: battle_start -> SPD Buff 2t all allies (team speed)
  // Shiny: turn_start -> ATB boost 5% all allies (sustained team speed)
  minun_skill3b: {
    id: 'minun_skill3b',
    name: 'Static',
    description: 'Passive: boosts ATB by 5%.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- volbeat (bug) ---
  // Original: on_ally_death -> revive 20% 6t CD (revive)
  // Shiny: battle_start -> Soul Protect 999t (prevent death)
  volbeat_skill3b: {
    id: 'volbeat_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Soul Protect for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'soul_protect', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- illumise (bug) ---
  // Original: on_crit -> CD reduce 1t 25% chance (cooldown reduction)
  // Shiny: on_attack -> Buff Block 1t 20% chance (offensive disruption)
  illumise_skill3b: {
    id: 'illumise_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Buff Block for 1 turn(s) (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- roselia (grass/poison) ---
  // Original: battle_start -> SPD Buff 2t all allies (team speed)
  // Shiny: on_attack -> Poison 2t 20% chance (DoT on attack)
  roselia_skill3b: {
    id: 'roselia_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Poison for 2 turn(s) (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gulpin (poison) ---
  // Original: on_attack -> Bleed 2t 24% (DoT on attack)
  // Shiny: on_hit_received -> Poison 2t 25% (retaliation DoT)
  gulpin_skill3b: {
    id: 'gulpin_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 2 turn(s) (25% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- swalot (poison) ---
  // Original: on_hit_received -> Glancing 2t 30% (defensive debuff)
  // Shiny: on_attack -> Anti-Heal 2t 22% (offensive healing prevention)
  swalot_skill3b: {
    id: 'swalot_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Anti-Heal for 2 turn(s) (22% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'anti_heal', value: 0, duration: 2, chance: 22 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- carvanha (water/dark) ---
  // Original: on_attack -> ATB reduce 10% 26% chance (speed disruption)
  // Shiny: on_crit -> Bleed 2t (DoT on crits)
  carvanha_skill3b: {
    id: 'carvanha_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Bleed for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- sharpedo (water/dark) ---
  // Original: on_attack -> transfer debuff 25% (debuff transfer)
  // Shiny: on_kill -> Skill Refresh 2t + ATB boost 30% (kill chain)
  sharpedo_skill3b: {
    id: 'sharpedo_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Skill Refresh for 2 turn(s), boosts ATB by 30%.',
    type: 'water',
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

  // --- wailmer (water) ---
  // Original: battle_start -> DEF Buff 2t all allies (opening defense)
  // Shiny: on_hit_received -> heal 4% self (self sustain tank)
  wailmer_skill3b: {
    id: 'wailmer_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 4% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 4, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- wailord (water) ---
  // Original: on_ally_death -> heal 15% self (emergency self heal)
  // Shiny: turn_start -> Recovery 1t self (sustained sustain)
  wailord_skill3b: {
    id: 'wailord_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- numel (fire/ground) ---
  // Original: on_attack -> Expose 2t 22% (defensive shred)
  // Shiny: on_crit -> Burn 2t (DoT on crits)
  numel_skill3b: {
    id: 'numel_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- camerupt (fire/ground) ---
  // Original: hp_threshold (<25%) -> Invincibility 1t + Recovery 2t (last stand)
  // Shiny: on_attack -> ATK Buff 1t + Crit DMG Buff 1t 20% chance (offensive power)
  camerupt_skill3b: {
    id: 'camerupt_skill3b',
    name: 'Blaze',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies Crit DMG Buff for 1 turn(s) (20% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 20, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- torkoal (fire) ---
  // Original: on_attack -> absorb ATB 15% 35% (speed steal)
  // Shiny: on_hit_received -> Burn 2t 25% (retaliation burn)
  torkoal_skill3b: {
    id: 'torkoal_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- spoink (psychic) ---
  // Original: on_attack -> detonate 15% (DoT burst)
  // Shiny: on_hit_received -> Confusion 1t 20% chance (retaliatory CC)
  spoink_skill3b: {
    id: 'spoink_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- grumpig (psychic) ---
  // Original: on_attack -> RES Break 2t 31% (resistance shred)
  // Shiny: on_crit -> Silence 1t (skill lockdown on crits)
  grumpig_skill3b: {
    id: 'grumpig_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Silence for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- spinda (normal) ---
  // Original: hp_threshold (<50%) -> ATB boost 30% + SPD Buff 2t (emergency speed)
  // Shiny: on_attack -> Evasion 1t 20% chance (dodge on attack)
  spinda_skill3b: {
    id: 'spinda_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Evasion for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 20, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- trapinch (ground) ---
  // Original: on_hit_received -> Provoke 1t 25% (forced targeting on hit)
  // Shiny: on_attack -> Petrify 1t 15% chance (CC on attack)
  trapinch_skill3b: {
    id: 'trapinch_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Petrify for 1 turn(s) (15% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'petrify', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- vibrava (ground/dragon) ---
  // Original: always -> Amplify 999t (permanent damage boost)
  // Shiny: always -> Crit Rate Buff 999t (permanent crit instead)
  vibrava_skill3b: {
    id: 'vibrava_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Crit Rate Buff for 999 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- flygon (ground/dragon) ---
  // Original: always -> RES Buff 999t (permanent resistance)
  // Shiny: always -> Evasion 999t (permanent evasion)
  flygon_skill3b: {
    id: 'flygon_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Evasion for 999 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- cacnea (grass) ---
  // Original: hp_threshold (<40%) -> Soul Protect 999t (death prevention)
  // Shiny: on_ally_death -> heal 15% all allies (emergency team heal)
  cacnea_skill3b: {
    id: 'cacnea_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 15% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 15, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- cacturne (grass/dark) ---
  // Original: turn_start -> shorten debuffs 1t all allies (debuff cleanse)
  // Shiny: battle_start -> Immunity 2t all allies (opening protection)
  cacturne_skill3b: {
    id: 'cacturne_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Immunity for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- swablu (normal/flying) ---
  // Original: on_crit -> ATB boost 25% + SPD Buff 1t (crit speed burst)
  // Shiny: turn_start -> heal 3% all allies (sustained team healing)
  swablu_skill3b: {
    id: 'swablu_skill3b',
    name: 'Adaptability',
    description: 'Passive: heals for 3% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- altaria (dragon/flying) ---
  // Original: on_kill -> ATB boost 50% (kill momentum)
  // Shiny: on_attack -> DEF Break 1t 20% chance (armor shred on attack)
  altaria_skill3b: {
    id: 'altaria_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies DEF Break for 1 turn(s) (20% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- zangoose (normal) ---
  // Original: on_attack -> Seal 2t 20% (passive seal)
  // Shiny: on_crit -> Crit DMG Buff 2t (snowball crits)
  zangoose_skill3b: {
    id: 'zangoose_skill3b',
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

  // --- seviper (poison) ---
  // Original: turn_start -> Recovery 1t self (self sustain)
  // Shiny: on_attack -> Bleed 2t 20% chance (DoT on attack)
  seviper_skill3b: {
    id: 'seviper_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Bleed for 2 turn(s) (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- lunatone (rock/psychic) ---
  // Original: battle_start -> Immunity 1t all allies (opening protection)
  // Shiny: turn_start -> DEF Buff 1t all allies (sustained defense)
  lunatone_skill3b: {
    id: 'lunatone_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Buff for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- solrock (rock/psychic) ---
  // Original: on_attack -> transfer debuff 25% (debuff transfer)
  // Shiny: on_hit_received -> Petrify 1t 20% chance (retaliatory CC)
  solrock_skill3b: {
    id: 'solrock_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Petrify for 1 turn(s) (20% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'petrify', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- barboach (water/ground) ---
  // Original: battle_start -> SPD Buff 2t all allies (team speed)
  // Shiny: on_attack -> ATB reduce 10% 20% chance (speed disruption)
  barboach_skill3b: {
    id: 'barboach_skill3b',
    name: 'Torrent',
    description: 'Passive: reduces ATB by 10% (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- whiscash (water/ground) ---
  // Original: battle_start -> Nullify 999t all allies (debuff immunity)
  // Shiny: on_ally_death -> revive 20% 6t CD (emergency revive)
  whiscash_skill3b: {
    id: 'whiscash_skill3b',
    name: 'Torrent',
    description: 'Passive: revives a fallen ally with 20% HP (6 turn CD).',
    type: 'water',
    category: 'passive',
    cooldown: 6,
    multiplier: 0,
    effects: [{ id: 'revive', value: 20, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- corphish (water) ---
  // Original: on_ally_death -> heal 15% self (emergency self heal)
  // Shiny: turn_start -> cleanse 1 all allies (sustained debuff removal)
  corphish_skill3b: {
    id: 'corphish_skill3b',
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

  // --- crawdaunt (water/dark) ---
  // Original: on_ally_death -> ATB boost 15% all allies (rally after death)
  // Shiny: battle_start -> Evasion 2t + SPD Buff 2t (opening agility)
  crawdaunt_skill3b: {
    id: 'crawdaunt_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Evasion for 2 turn(s), applies SPD Buff for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- baltoy (ground/psychic) ---
  // Original: turn_start -> strip 1 buff all enemies (team buff removal)
  // Shiny: on_attack -> Oblivion 2t 18% chance (passive seal)
  baltoy_skill3b: {
    id: 'baltoy_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Oblivion for 2 turn(s) (18% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 2, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- claydol (ground/psychic) ---
  // Original: on_hit_received -> Glancing 2t 30% (defensive debuff)
  // Shiny: battle_start -> DEF Buff 2t + RES Buff 2t (opening wall)
  claydol_skill3b: {
    id: 'claydol_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies DEF Buff for 2 turn(s), applies RES Buff for 2 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'res_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- lileep (rock/grass) ---
  // Original: battle_start -> SPD Buff 2t all allies (team speed)
  // Shiny: on_hit_received -> Recovery 1t self (self sustain on hit)
  lileep_skill3b: {
    id: 'lileep_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Recovery for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- cradily (rock/grass) ---
  // Original: battle_start -> DEF Buff 2t all allies (team defense)
  // Shiny: turn_start -> heal 3% all allies (sustained healing)
  cradily_skill3b: {
    id: 'cradily_skill3b',
    name: 'Sand Stream',
    description: 'Passive: heals for 3% HP.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- anorith (rock/bug) ---
  // Original: battle_start -> Threat 3t + Shield 3t self (opening tank)
  // Shiny: on_hit_received -> Counter 2t + Reflect 1t (counter tank)
  anorith_skill3b: {
    id: 'anorith_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Counter for 2 turn(s), applies Reflect for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- armaldo (rock/bug) ---
  // Original: on_attack -> ATB boost 15% 33% chance (speed on attack)
  // Shiny: on_crit -> DEF Break 2t (armor shred on crits)
  armaldo_skill3b: {
    id: 'armaldo_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Break for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- feebas (water) ---
  // Original: hp_threshold (<40%) -> Soul Protect 999t (death prevention)
  // Shiny: on_ally_death -> heal 15% all allies + cleanse 1 (emergency team support)
  feebas_skill3b: {
    id: 'feebas_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 15% HP, removes 1 debuff(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 15, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- milotic (water) ---
  // Original: turn_start -> RES Buff 1t all allies (sustained team resistance)
  // Shiny: battle_start -> Recovery 2t + Immunity 1t all allies (opening protection)
  milotic_skill3b: {
    id: 'milotic_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Recovery for 2 turn(s), applies Immunity for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- castform (normal) ---
  // Original: on_attack -> ATB reduce 10% 36% (speed disruption)
  // Shiny: on_crit -> Strip 1 buff (buff removal on crits)
  castform_skill3b: {
    id: 'castform_skill3b',
    name: 'Adaptability',
    description: 'Passive: strips 1 buff(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'strip', value: 1, duration: 0, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- kecleon (normal) ---
  // Original: hp_threshold (<33%) -> Endure 1t (death prevention)
  // Shiny: on_hit_received -> Counter 1t + Reflect 1t (damage reflection)
  kecleon_skill3b: {
    id: 'kecleon_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Counter for 1 turn(s), applies Reflect for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- shuppet (ghost) ---
  // Original: on_ally_death -> heal 15% self (emergency self heal)
  // Shiny: battle_start -> Evasion 2t (opening dodge)
  shuppet_skill3b: {
    id: 'shuppet_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Evasion for 2 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- banette (ghost) ---
  // Original: battle_start -> ATB boost 20% self (opening speed)
  // Shiny: on_attack -> Silence 1t 18% chance (skill lockdown)
  banette_skill3b: {
    id: 'banette_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Silence for 1 turn(s) (18% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 18 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- duskull (ghost) ---
  // Original: battle_start -> ATK Break 2t all enemies (opening enemy debuff)
  // Shiny: on_hit_received -> heal 4% self + Endure 1t (tank sustain)
  duskull_skill3b: {
    id: 'duskull_skill3b',
    name: 'Levitate',
    description: 'Passive: heals for 4% HP, applies Endure for 1 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 4, duration: 0, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 40 },
  },

  // --- dusclops (ghost) ---
  // Original: battle_start -> Bomb 3t all enemies (opening DoT)
  // Shiny: on_attack -> Oblivion 2t 20% chance (passive seal)
  dusclops_skill3b: {
    id: 'dusclops_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Oblivion for 2 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 2, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tropius (grass/flying) ---
  // Original: on_attack -> absorb ATB 15% 30% (speed steal)
  // Shiny: turn_start -> Recovery 1t all allies (team sustain)
  tropius_skill3b: {
    id: 'tropius_skill3b',
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

  // --- chimecho (psychic) ---
  // Original: on_attack -> Seal 2t 30% chance (passive seal)
  // Shiny: on_hit_received -> Sleep 1t 15% chance (retaliatory CC)
  chimecho_skill3b: {
    id: 'chimecho_skill3b',
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

  // --- absol (dark) ---
  // Original: turn_start -> Strip 1 buff all enemies (team buff removal)
  // Shiny: on_crit -> Silence 1t + Seal 1t (full lockdown on crits)
  absol_skill3b: {
    id: 'absol_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Silence for 1 turn(s), applies Seal for 1 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 100 },
      { id: 'seal', value: 0, duration: 1, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- wynaut (psychic) ---
  // Original: battle_start -> Evasion 2t self (opening dodge)
  // Shiny: on_hit_received -> ATB boost 20% (reactive speed)
  wynaut_skill3b: {
    id: 'wynaut_skill3b',
    name: 'Inner Focus',
    description: 'Passive: boosts ATB by 20%.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- snorunt (ice) ---
  // Original: on_hit_received -> balance HP (HP equalization on hit)
  // Shiny: battle_start -> Shield 2t all allies (opening protection)
  snorunt_skill3b: {
    id: 'snorunt_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- glalie (ice) ---
  // Original: on_attack -> Seal 2t 22% (passive seal)
  // Shiny: on_crit -> Freeze 1t (CC on crits)
  glalie_skill3b: {
    id: 'glalie_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Freeze for 1 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- spheal (ice/water) ---
  // Original: turn_start -> SPD Buff 1t self (speed)
  // Shiny: on_hit_received -> Freeze 1t 15% chance (retaliatory CC)
  spheal_skill3b: {
    id: 'spheal_skill3b',
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

  // --- sealeo (ice/water) ---
  // Original: turn_start -> extend buffs 1t all allies (buff support)
  // Shiny: battle_start -> Immunity 1t all allies + DEF Buff 2t (opening protection)
  sealeo_skill3b: {
    id: 'sealeo_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Immunity for 1 turn(s), applies DEF Buff for 2 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- walrein (ice/water) ---
  // Original: on_attack -> absorb ATB 10% 28% (speed steal)
  // Shiny: on_crit -> SPD Slow 2t (enemy slow on crits)
  walrein_skill3b: {
    id: 'walrein_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies Slow for 2 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- clamperl (water) ---
  // Original: battle_start -> Evasion 2t (opening dodge)
  // Shiny: on_attack -> Strip 1 buff 20% chance (buff removal on attack)
  clamperl_skill3b: {
    id: 'clamperl_skill3b',
    name: 'Torrent',
    description: 'Passive: strips 1 buff(s) (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'strip', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- huntail (water) ---
  // Original: turn_start -> strip 1 buff all enemies (team buff removal)
  // Shiny: on_attack -> Mark 1t 25% chance (damage amp debuff)
  huntail_skill3b: {
    id: 'huntail_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Mark for 1 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'mark', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gorebyss (water) ---
  // Original: battle_start -> Soul Protect 999t all allies (death prevention)
  // Shiny: turn_start -> heal 3% all allies (sustained healing)
  gorebyss_skill3b: {
    id: 'gorebyss_skill3b',
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

  // --- relicanth (water/rock) ---
  // Original: hp_threshold (<33%) -> Endure 1t (death prevention)
  // Shiny: on_hit_received -> Shield 1t + DEF Buff 1t (tank on damage)
  relicanth_skill3b: {
    id: 'relicanth_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Shield for 1 turn(s), applies DEF Buff for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 1, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- luvdisc (water) ---
  // Original: turn_start -> RES Buff 1t all allies (team resistance)
  // Shiny: on_ally_death -> heal 12% all allies (emergency team heal)
  luvdisc_skill3b: {
    id: 'luvdisc_skill3b',
    name: 'Torrent',
    description: 'Passive: heals for 12% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 12, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- bagon (dragon) ---
  // Original: battle_start -> Crit Rate Buff 3t (opening crit)
  // Shiny: on_attack -> Amplify 1t 25% chance (damage boost on attack)
  bagon_skill3b: {
    id: 'bagon_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Amplify for 1 turn(s) (25% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- shelgon (dragon) ---
  // Original: turn_start -> SPD Buff 1t self (sustained speed)
  // Shiny: on_crit -> Crit DMG Buff 1t (crit power snowball)
  shelgon_skill3b: {
    id: 'shelgon_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Crit DMG Buff for 1 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- salamence (dragon/flying) ---
  // Original: on_attack -> steal buff 15% (buff theft)
  // Shiny: on_kill -> ATB boost 50% + Amplify 2t (kill chain momentum)
  salamence_skill3b: {
    id: 'salamence_skill3b',
    name: 'Intimidate',
    description: 'Passive: boosts ATB by 50%, applies Amplify for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 50, duration: 0, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- beldum (steel/psychic) ---
  // Original: on_attack -> Threat 2t 32% chance (tank aggro)
  // Shiny: on_hit_received -> Shield 1t (defensive shielding)
  beldum_skill3b: {
    id: 'beldum_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- metang (steel/psychic) ---
  // Original: on_attack -> ATB reduce 10% 40% (speed disruption on attack)
  // Shiny: on_hit_received -> Reflect 1t (damage reflection)
  metang_skill3b: {
    id: 'metang_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Reflect for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- metagross (steel/psychic) ---
  // Original: battle_start -> Soul Protect 999t all allies (death prevention)
  // Shiny: turn_start -> Shield 1t all allies (sustained team shielding)
  metagross_skill3b: {
    id: 'metagross_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Shield for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- regirock (rock) ---
  // Original: battle_start -> Recovery 2t all allies (opening sustain)
  // Shiny: on_hit_received -> DEF Buff 1t + Counter 1t (tank retaliation)
  regirock_skill3b: {
    id: 'regirock_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies DEF Buff for 1 turn(s), applies Counter for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- regice (ice) ---
  // Original: always -> Amplify 999t (permanent damage boost)
  // Shiny: always -> ACC Buff 999t (permanent accuracy)
  regice_skill3b: {
    id: 'regice_skill3b',
    name: 'Ice Body',
    description: 'Passive: applies ACC Buff for 999 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- registeel (steel) ---
  // Original: turn_start -> Recovery 1t self (self sustain)
  // Shiny: on_hit_received -> Endure 1t + heal 3% (tank sustain)
  registeel_skill3b: {
    id: 'registeel_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Endure for 1 turn(s), heals for 3% HP.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- latias (dragon/psychic) ---
  // Original: on_crit -> ATK Buff 1t + SPD Buff 1t (crit empowerment)
  // Shiny: battle_start -> Amplify 2t + Crit Rate Buff 2t (opening burst setup)
  latias_skill3b: {
    id: 'latias_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Amplify for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'dragon',
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

  // --- latios (dragon/psychic) ---
  // Original: on_attack -> detonate 20% (DoT burst)
  // Shiny: on_crit -> Bomb 2t (delayed burst on crits)
  latios_skill3b: {
    id: 'latios_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Bomb for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- kyogre_primal (water) ---
  // Original: turn_start -> heal 5% all allies (team sustain)
  // Shiny: battle_start -> Recovery 2t + RES Buff 2t all allies (opening defense)
  kyogre_primal_skill3b: {
    id: 'kyogre_primal_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Recovery for 2 turn(s), applies RES Buff for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'res_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- groudon_primal (ground/fire) ---
  // Original: on_attack -> Provoke 1t 42% (aggro on attack)
  // Shiny: on_crit -> Amplify 2t + ATK Buff 1t (burst damage on crits)
  groudon_primal_skill3b: {
    id: 'groudon_primal_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Amplify for 2 turn(s), applies ATK Buff for 1 turn(s).',
    type: 'ground',
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

  // --- groudon (ground) ---
  // Original: turn_start -> Shield 1t all allies (sustained team shielding)
  // Shiny: on_hit_received -> Counter 2t + Threat 1t (tank retaliation)
  groudon_skill3b: {
    id: 'groudon_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Counter for 2 turn(s), applies Threat for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'threat', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- jirachi (steel/psychic) ---
  // Original: turn_start -> extend buffs 1t all allies (buff duration support)
  // Shiny: battle_start -> Immunity 2t + SPD Buff 2t all allies (opening protection)
  jirachi_skill3b: {
    id: 'jirachi_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Immunity for 2 turn(s), applies SPD Buff for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- kyogre (water) ---
  // Original: turn_start -> extend buffs 1t all allies (buff duration support)
  // Shiny: on_ally_death -> revive 25% 6t CD + heal 10% (emergency revive)
  kyogre_skill3b: {
    id: 'kyogre_skill3b',
    name: 'Torrent',
    description: 'Passive: revives a fallen ally with 25% HP (6 turn CD), heals for 10% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 6,
    multiplier: 0,
    effects: [
      { id: 'revive', value: 25, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- rayquaza (dragon/flying) ---
  // Original: battle_start -> Crit Rate Buff 3t (opening crit)
  // Shiny: on_kill -> Skill Refresh 2t + Amplify 2t (kill chain)
  rayquaza_skill3b: {
    id: 'rayquaza_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Skill Refresh for 2 turn(s), applies Amplify for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'skill_refresh', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },
};
