import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN1_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- bulbasaur (grass/poison) ---
  // Original: hp_threshold (<30%) -> ATK Buff + Recovery to self
  // Shiny: on_attack -> Poison on target + Vampire to self (offensive sustain)
  bulbasaur_skill3b: {
    id: 'bulbasaur_skill3b',
    name: 'Toxic Boost',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance) and Vampire for 1 turn(s) to self (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 20 },
      { id: 'vampire', value: 15, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ivysaur (grass/poison) ---
  // Original: hp_threshold (<30%) -> ATK Buff + Recovery to self
  // Shiny: on_attack -> Poison on target + Vampire to self (offensive sustain, slightly stronger)
  ivysaur_skill3b: {
    id: 'ivysaur_skill3b',
    name: 'Toxic Boost',
    description: 'Passive: applies Poison for 1 turn(s) (22% chance) and Vampire for 1 turn(s) to self (22% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 22 },
      { id: 'vampire', value: 15, duration: 0, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- venusaur (grass/poison) ---
  // Original: hp_threshold (<30%) -> ATK Buff + Crit Rate Buff to self
  // Shiny: turn_start -> Recovery to all allies (team healer role)
  venusaur_skill3b: {
    id: 'venusaur_skill3b',
    name: 'Thick Forest',
    description: 'Passive: applies Recovery for 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- charmander (fire) ---
  // Original: hp_threshold (<30%) -> Amplify + ATK Buff to self
  // Shiny: on_crit -> Burn on target + ATB boost (aggressive, frequent trigger)
  charmander_skill3b: {
    id: 'charmander_skill3b',
    name: 'Flame Rush',
    description: 'Passive: applies Burn for 1 turn(s) (30% chance) and boosts ATB by 15%.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 30 },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- charmeleon (fire) ---
  // Original: on_kill -> ATB boost 30% + CD reduce
  // Shiny: on_attack -> Brand on target (25% chance) (consistent debuffer)
  charmeleon_skill3b: {
    id: 'charmeleon_skill3b',
    name: 'Scorching Aura',
    description: 'Passive: applies Brand for 2 turn(s) (25% chance) on attack target.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- charizard (fire/flying) ---
  // Original: on_crit -> ATK Buff + SPD Buff to self
  // Shiny: on_kill -> Amplify + ATB boost + CD reduce (snowball resets)
  charizard_skill3b: {
    id: 'charizard_skill3b',
    name: 'Inferno Wings',
    description: 'Passive: applies Amplify for 2 turn(s), boosts ATB by 30%, and reduces cooldowns by 1 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- squirtle (water) ---
  // Original: hp_threshold (<30%) -> ATK Buff + Recovery to self
  // Shiny: on_hit_received -> Shield to self (20% chance) (tanky approach)
  squirtle_skill3b: {
    id: 'squirtle_skill3b',
    name: 'Shell Guard',
    description: 'Passive: applies Shield (8%) to self (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 8, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- wartortle (water) ---
  // Original: hp_threshold (<33%) -> Endure to self
  // Shiny: on_hit_received -> DEF Buff to self (25% chance) (sustained defense)
  wartortle_skill3b: {
    id: 'wartortle_skill3b',
    name: 'Wave Shield',
    description: 'Passive: applies DEF Buff for 1 turn(s) to self (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- blastoise (water) ---
  // Original: on_ally_death -> Revive ally with 20% HP (6 turn CD)
  // Shiny: turn_start -> Shield to all allies (team protector)
  blastoise_skill3b: {
    id: 'blastoise_skill3b',
    name: 'Fortress Shell',
    description: 'Passive: applies Shield (8%) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 8, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- caterpie (bug) ---
  // Original: on_hit_received -> Nullify to self (20%)
  // Shiny: turn_start -> SPD Buff to self (crawl speed)
  caterpie_skill3b: {
    id: 'caterpie_skill3b',
    name: 'Run Away',
    description: 'Passive: boosts ATB by 10% (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- metapod (bug) ---
  // Original: turn_start -> Cleanse 1 debuff self (30%)
  // Shiny: on_hit_received -> DEF Buff to self (25% chance)
  metapod_skill3b: {
    id: 'metapod_skill3b',
    name: 'Hardened Shell',
    description: 'Passive: applies DEF Buff for 1 turn(s) to self (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- butterfree (bug/flying) ---
  // Original: battle_start -> SPD Buff to all allies
  // Shiny: on_attack -> Sleep on target (15% chance) + Confusion (15% chance)
  butterfree_skill3b: {
    id: 'butterfree_skill3b',
    name: 'Tinted Lens',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance) and Confusion for 1 turn(s) (15% chance) on attack target.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'sleep', value: 0, duration: 1, chance: 15 },
      { id: 'confusion', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- weedle (bug/poison) ---
  // Original: on_hit_received -> Nullify to self (15%)
  // Shiny: on_attack -> Poison on target (20% chance)
  weedle_skill3b: {
    id: 'weedle_skill3b',
    name: 'Poison Barb',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance) on attack target.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kakuna (bug/poison) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_hit_received -> Counter for 1 turn (20% chance)
  kakuna_skill3b: {
    id: 'kakuna_skill3b',
    name: 'Spike Shell',
    description: 'Passive: applies Counter for 1 turn(s) to self (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- beedrill (bug/poison) ---
  // Original: on_kill -> ATK Buff + ATB boost 30%
  // Shiny: on_crit -> Bleed + DEF Break on target (aggressive crit build)
  beedrill_skill3b: {
    id: 'beedrill_skill3b',
    name: 'Sniper',
    description: 'Passive: applies Bleed for 2 turn(s) (30% chance) and DEF Break for 1 turn(s) (25% chance) on crit.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 30 },
      { id: 'def_break', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- pidgey (normal/flying) ---
  // Original: battle_start -> ACC Buff to self
  // Shiny: on_attack -> Evasion to self (15% chance)
  pidgey_skill3b: {
    id: 'pidgey_skill3b',
    name: 'Tangled Feet',
    description: 'Passive: applies Evasion for 1 turn(s) to self (15% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 1, chance: 15, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pidgeotto (normal/flying) ---
  // Original: battle_start -> SPD Buff to all allies
  // Shiny: on_attack -> Strip 1 buff from target (20% chance)
  pidgeotto_skill3b: {
    id: 'pidgeotto_skill3b',
    name: 'Big Pecks',
    description: 'Passive: strips 1 buff from target (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pidgeot (normal/flying) ---
  // Original: on_attack -> Evasion to self (20% chance)
  // Shiny: on_crit -> SPD Buff + Crit DMG Buff to self
  pidgeot_skill3b: {
    id: 'pidgeot_skill3b',
    name: 'No Guard',
    description: 'Passive: applies SPD Buff for 1 turn(s) and Crit DMG Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- rattata (normal) ---
  // Original: on_hit_received -> ATB boost 20% (25% chance)
  // Shiny: on_attack -> Glancing on target (20% chance)
  rattata_skill3b: {
    id: 'rattata_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Glancing for 1 turn(s) on target (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'glancing', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- raticate (normal) ---
  // Original: on_hit_received -> ATK Buff to self (25% chance)
  // Shiny: on_crit -> Vampire to self (25% chance)
  raticate_skill3b: {
    id: 'raticate_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Vampire for 1 turn(s) to self (25% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 20, duration: 0, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- spearow (normal/flying) ---
  // Original: battle_start -> ACC Buff to self
  // Shiny: on_attack -> Crit Rate Buff to self (20% chance)
  spearow_skill3b: {
    id: 'spearow_skill3b',
    name: 'Sniper',
    description: 'Passive: applies Crit Rate Buff for 1 turn(s) to self (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- fearow (normal/flying) ---
  // Original: on_attack -> Crit Rate Buff to self (25% chance)
  // Shiny: on_crit -> ATB boost 20% + Bleed on target (25% chance)
  fearow_skill3b: {
    id: 'fearow_skill3b',
    name: 'Sniper',
    description: 'Passive: boosts ATB by 20% and applies Bleed for 2 turn(s) (25% chance) on crit.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
      { id: 'bleed', value: 0, duration: 2, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- ekans (poison) ---
  // Original: turn_start -> Cleanse 1 debuff self (30%)
  // Shiny: on_hit_received -> Poison on attacker (25% chance)
  ekans_skill3b: {
    id: 'ekans_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 1 turn(s) on attacker (25% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- arbok (poison) ---
  // Original: on_hit_received -> ATK Break on attacker (30% chance)
  // Shiny: on_attack -> Oblivion on target (25% chance) (disable passives)
  arbok_skill3b: {
    id: 'arbok_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies Oblivion for 1 turn(s) on target (25% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'oblivion', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pikachu (electric) ---
  // Original: on_hit_received -> Paralysis on attacker (25% chance)
  // Shiny: on_attack -> ATB boost 10% (25% chance) (speed playstyle)
  pikachu_skill3b: {
    id: 'pikachu_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: boosts ATB by 10% (25% chance) on attack.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- raichu (electric) ---
  // Original: on_hit_received -> Paralysis on attacker (28% chance)
  // Shiny: on_attack -> ATB reduce on target 10% (25% chance) + SPD Buff to self (20% chance)
  raichu_skill3b: {
    id: 'raichu_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: reduces target ATB by 10% (25% chance) and applies SPD Buff for 1 turn(s) to self (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_reduce', value: 10, duration: 0, chance: 25 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sandshrew (ground) ---
  // Original: on_hit_received -> Evasion to self (20%)
  // Shiny: on_attack -> DEF Break on target (20% chance)
  sandshrew_skill3b: {
    id: 'sandshrew_skill3b',
    name: 'Sand Rush',
    description: 'Passive: applies DEF Break for 1 turn(s) on target (20% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sandslash (ground) ---
  // Original: on_hit_received -> Evasion to self (25%)
  // Shiny: on_attack -> Counter for 1 turn (20% chance) + DEF Buff (20% chance)
  sandslash_skill3b: {
    id: 'sandslash_skill3b',
    name: 'Sand Rush',
    description: 'Passive: applies Counter for 1 turn(s) (20% chance) and DEF Buff for 1 turn(s) (20% chance) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 20, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- nidoran_f (poison) ---
  // Original: on_hit_received -> Poison on attacker (25% chance)
  // Shiny: on_attack -> Anti-Heal on target (20% chance)
  nidoran_f_skill3b: {
    id: 'nidoran_f_skill3b',
    name: 'Rivalry',
    description: 'Passive: applies Anti-Heal for 1 turn(s) on target (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'anti_heal', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- nidorina (poison) ---
  // Original: on_hit_received -> Poison on attacker (28% chance)
  // Shiny: on_attack -> Anti-Heal on target (22% chance)
  nidorina_skill3b: {
    id: 'nidorina_skill3b',
    name: 'Rivalry',
    description: 'Passive: applies Anti-Heal for 1 turn(s) on target (22% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'anti_heal', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- nidoqueen (poison/ground) ---
  // Original: on_attack -> Strip 1 buff on target (30% chance)
  // Shiny: on_hit_received -> Reflect for 1 turn (25% chance) + Threat for 1 turn (25% chance) (tank role)
  nidoqueen_skill3b: {
    id: 'nidoqueen_skill3b',
    name: 'Poison Armor',
    description: 'Passive: applies Reflect for 1 turn(s) (25% chance) and Threat for 1 turn(s) (25% chance) to self.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'threat', value: 0, duration: 1, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- nidoranm (poison) ---
  // Original: on_hit_received -> Poison on attacker (22% chance)
  // Shiny: on_attack -> ATK Buff to self (18% chance)
  nidoranm_skill3b: {
    id: 'nidoranm_skill3b',
    name: 'Rivalry',
    description: 'Passive: applies ATK Buff for 1 turn(s) to self (18% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 18, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- nidorino (poison) ---
  // Original: on_hit_received -> Poison on attacker (25% chance)
  // Shiny: on_attack -> ATK Buff to self (22% chance)
  nidorino_skill3b: {
    id: 'nidorino_skill3b',
    name: 'Rivalry',
    description: 'Passive: applies ATK Buff for 1 turn(s) to self (22% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- nidoking (poison/ground) ---
  // Original: turn_start -> Shield (8%) to all allies
  // Shiny: on_attack -> DEF Break + Poison on target (25% chance each) (offensive debuffer)
  nidoking_skill3b: {
    id: 'nidoking_skill3b',
    name: 'Poison Rampage',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance) and Poison for 1 turn(s) (25% chance) on target.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 25 },
      { id: 'poison', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- clefairy (fairy) ---
  // Original: on_hit_received -> Heal all allies 3% HP
  // Shiny: turn_start -> Shield (5%) to all allies
  clefairy_skill3b: {
    id: 'clefairy_skill3b',
    name: 'Friend Guard',
    description: 'Passive: applies Shield (5%) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 5, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- clefable (fairy) ---
  // Original: on_hit_received -> Heal all allies 3% HP
  // Shiny: turn_start -> Cleanse 1 debuff from all allies (25% chance)
  clefable_skill3b: {
    id: 'clefable_skill3b',
    name: 'Unaware',
    description: 'Passive: removes 1 debuff(s) from all allies (25% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cleanse', value: 1, duration: 0, chance: 25, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- vulpix (fire) ---
  // Original: on_hit_received -> Burn on attacker (25% chance)
  // Shiny: on_attack -> Brand on target (20% chance)
  vulpix_skill3b: {
    id: 'vulpix_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Brand for 1 turn(s) on target (20% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ninetales (fire) ---
  // Original: on_hit_received -> Burn on attacker (25% chance)
  // Shiny: battle_start -> ATK Buff + SPD Buff to all allies (team buffer)
  ninetales_skill3b: {
    id: 'ninetales_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies ATK Buff for 2 turn(s) and SPD Buff for 2 turn(s) to all allies.',
    type: 'fire',
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

  // --- jigglypuff (normal/fairy) ---
  // Original: on_hit_received -> Confusion on attacker (20% chance)
  // Shiny: on_attack -> Sleep on target (15% chance)
  jigglypuff_skill3b: {
    id: 'jigglypuff_skill3b',
    name: 'Friend Guard',
    description: 'Passive: applies Sleep for 1 turn(s) on target (15% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'sleep', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- wigglytuff (normal/fairy) ---
  // Original: on_hit_received -> Confusion on attacker (25% chance)
  // Shiny: turn_start -> Extend buffs on all allies by 1 turn (30% chance) (support role)
  wigglytuff_skill3b: {
    id: 'wigglytuff_skill3b',
    name: 'Competitive',
    description: 'Passive: extends buff durations by 1 turn for all allies (30% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'extend_buffs', value: 1, duration: 0, chance: 30, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- zubat (poison/flying) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_attack -> Vampire 15% (20% chance)
  zubat_skill3b: {
    id: 'zubat_skill3b',
    name: 'Infiltrator',
    description: 'Passive: applies Vampire (15%) to self (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 15, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- golbat (poison/flying) ---
  // Original: on_attack -> Heal 5% HP (25%) + Vampire 20% (30%)
  // Shiny: on_hit_received -> ATK Break on attacker (25% chance) + Evasion to self (20% chance)
  golbat_skill3b: {
    id: 'golbat_skill3b',
    name: 'Infiltrator',
    description: 'Passive: applies ATK Break for 1 turn(s) on attacker (25% chance) and Evasion for 1 turn(s) to self (20% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_break', value: 0, duration: 1, chance: 25 },
      { id: 'evasion', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- oddish (grass/poison) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_hit_received -> Poison on attacker (20% chance)
  oddish_skill3b: {
    id: 'oddish_skill3b',
    name: 'Effect Spore',
    description: 'Passive: applies Poison for 1 turn(s) on attacker (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gloom (grass/poison) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_hit_received -> Poison on attacker (22% chance) + Confusion on attacker (15% chance)
  gloom_skill3b: {
    id: 'gloom_skill3b',
    name: 'Stench',
    description: 'Passive: applies Poison for 1 turn(s) (22% chance) and Confusion for 1 turn(s) (15% chance) on attacker.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 22 },
      { id: 'confusion', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- vileplume (grass/poison) ---
  // Original: turn_start -> RES Buff to all allies
  // Shiny: on_hit_received -> Sleep on attacker (15% chance) + Heal self 3%
  vileplume_skill3b: {
    id: 'vileplume_skill3b',
    name: 'Effect Spore',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance) on attacker and heals self for 3% HP.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'sleep', value: 0, duration: 1, chance: 15 },
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- paras (bug/grass) ---
  // Original: on_hit_received -> Poison on attacker (20% chance)
  // Shiny: on_attack -> SPD Slow on target (20% chance)
  paras_skill3b: {
    id: 'paras_skill3b',
    name: 'Dry Skin',
    description: 'Passive: applies SPD Slow for 1 turn(s) on target (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- parasect (bug/grass) ---
  // Original: on_hit_received -> Poison on attacker (25% chance)
  // Shiny: on_attack -> Unrecoverable on target (20% chance) + Poison (20% chance)
  parasect_skill3b: {
    id: 'parasect_skill3b',
    name: 'Dry Skin',
    description: 'Passive: applies Unrecoverable for 1 turn(s) (20% chance) and Poison for 1 turn(s) (20% chance) on target.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'unrecoverable', value: 0, duration: 1, chance: 20 },
      { id: 'poison', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- venonat (bug/poison) ---
  // Original: battle_start -> ACC Buff to self
  // Shiny: on_hit_received -> Confusion on attacker (20% chance)
  venonat_skill3b: {
    id: 'venonat_skill3b',
    name: 'Tinted Lens',
    description: 'Passive: applies Confusion for 1 turn(s) on attacker (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'confusion', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- venomoth (bug/poison) ---
  // Original: on_hit_received -> Nullify to self (25%)
  // Shiny: on_attack -> Silence on target (20% chance)
  venomoth_skill3b: {
    id: 'venomoth_skill3b',
    name: 'Tinted Lens',
    description: 'Passive: applies Silence for 1 turn(s) on target (20% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- diglett (ground) ---
  // Original: on_hit_received -> SPD Slow on attacker (20% chance)
  // Shiny: on_attack -> ATB boost 10% (22% chance) (speed build)
  diglett_skill3b: {
    id: 'diglett_skill3b',
    name: 'Sand Force',
    description: 'Passive: boosts ATB by 10% (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dugtrio (ground) ---
  // Original: on_hit_received -> SPD Slow on attacker (25% chance)
  // Shiny: on_attack -> ATB reduce on target 10% (22% chance) (speed control)
  dugtrio_skill3b: {
    id: 'dugtrio_skill3b',
    name: 'Sand Force',
    description: 'Passive: reduces target ATB by 10% (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_reduce', value: 10, duration: 0, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- meowth (normal) ---
  // Original: on_attack -> Steal 1 buff from enemy (15% chance)
  // Shiny: on_hit_received -> ATB boost 15% (20% chance) (escapist)
  meowth_skill3b: {
    id: 'meowth_skill3b',
    name: 'Technician',
    description: 'Passive: boosts ATB by 15% (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 15, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- persian (normal) ---
  // Original: on_attack -> ATB boost 15% (22% chance)
  // Shiny: on_crit -> Strip 1 buff + Crit DMG Buff to self (assassin)
  persian_skill3b: {
    id: 'persian_skill3b',
    name: 'Technician',
    description: 'Passive: strips 1 buff from target and applies Crit DMG Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- psyduck (water) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_hit_received -> Confusion on attacker (20% chance)
  psyduck_skill3b: {
    id: 'psyduck_skill3b',
    name: 'Damp',
    description: 'Passive: applies Confusion for 1 turn(s) on attacker (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'confusion', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- golduck (water) ---
  // Original: turn_start -> Cleanse 1 debuff all allies (20%)
  // Shiny: on_attack -> Seal on target (20% chance) + Confusion (15% chance) (disruption)
  golduck_skill3b: {
    id: 'golduck_skill3b',
    name: 'Damp',
    description: 'Passive: applies Seal for 1 turn(s) (20% chance) and Confusion for 1 turn(s) (15% chance) on target.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 20 },
      { id: 'confusion', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- mankey (fighting) ---
  // Original: on_attack -> ATK Buff to self (22% chance)
  // Shiny: on_hit_received -> Counter for 1 turn (22% chance)
  mankey_skill3b: {
    id: 'mankey_skill3b',
    name: 'Anger Point',
    description: 'Passive: applies Counter for 1 turn(s) to self (22% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- primeape (fighting) ---
  // Original: on_attack -> ATK Buff to self (25% chance)
  // Shiny: on_hit_received -> Counter for 1 turn (25%) + ATK Buff (20%)
  primeape_skill3b: {
    id: 'primeape_skill3b',
    name: 'Anger Point',
    description: 'Passive: applies Counter for 1 turn(s) (25% chance) and ATK Buff for 1 turn(s) (20% chance) to self.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- growlithe (fire) ---
  // Original: on_hit_received -> ATK Break on attacker (25% chance)
  // Shiny: on_attack -> Burn on target (20% chance) (offensive fire)
  growlithe_skill3b: {
    id: 'growlithe_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Burn for 1 turn(s) on target (20% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- arcanine (fire) ---
  // Original: on_hit_received -> ATK Break on attacker (30% chance)
  // Shiny: battle_start -> ATK Buff + SPD Buff to all allies (leader role)
  arcanine_skill3b: {
    id: 'arcanine_skill3b',
    name: 'Justified',
    description: 'Passive: applies ATK Buff for 2 turn(s) and SPD Buff for 2 turn(s) to all allies.',
    type: 'fire',
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

  // --- poliwag (water) ---
  // Original: on_hit_received -> Heal self 5% HP
  // Shiny: turn_start -> SPD Buff to self (recovery through speed)
  poliwag_skill3b: {
    id: 'poliwag_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies SPD Buff for 1 turn(s) to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- poliwhirl (water) ---
  // Original: on_hit_received -> Heal self 5% HP
  // Shiny: on_attack -> SPD Slow on target (22% chance)
  poliwhirl_skill3b: {
    id: 'poliwhirl_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies SPD Slow for 1 turn(s) on target (22% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- poliwrath (water/fighting) ---
  // Original: on_hit_received -> Heal all allies 3% HP
  // Shiny: on_attack -> Provoke on target (20% chance) + DEF Buff to self (20% chance) (bruiser tank)
  poliwrath_skill3b: {
    id: 'poliwrath_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Provoke for 1 turn(s) (20% chance) on target and DEF Buff for 1 turn(s) (20% chance) to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 20 },
      { id: 'def_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- abra (psychic) ---
  // Original: on_hit_received -> Immunity to self (25% chance)
  // Shiny: on_attack -> ATB boost 15% (25% chance) (speed caster)
  abra_skill3b: {
    id: 'abra_skill3b',
    name: 'Magic Guard',
    description: 'Passive: boosts ATB by 15% (25% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 15, duration: 0, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kadabra (psychic) ---
  // Original: on_ally_death -> Shield (15%) to self
  // Shiny: on_attack -> Silence on target (20% chance) (offensive disabler)
  kadabra_skill3b: {
    id: 'kadabra_skill3b',
    name: 'Synchronize',
    description: 'Passive: applies Silence for 1 turn(s) on target (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- alakazam (psychic) ---
  // Original: on_ally_death -> Shield (10%) + ATB boost 20% + CD reset to all allies
  // Shiny: turn_start -> Shorten debuffs by 1 turn for all allies + Immunity to self (support/control)
  alakazam_skill3b: {
    id: 'alakazam_skill3b',
    name: 'Synchronize',
    description: 'Passive: shortens debuff durations by 1 turn for all allies and applies Immunity for 1 turn(s) to self.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- machop (fighting) ---
  // Original: on_hit_received -> ATK Buff to self (30% chance)
  // Shiny: on_attack -> DEF Break on target (25% chance)
  machop_skill3b: {
    id: 'machop_skill3b',
    name: 'No Guard',
    description: 'Passive: applies DEF Break for 1 turn(s) on target (25% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- machoke (fighting) ---
  // Original: on_kill -> ATK Buff to self
  // Shiny: on_crit -> DEF Break on target + ATB boost 15%
  machoke_skill3b: {
    id: 'machoke_skill3b',
    name: 'No Guard',
    description: 'Passive: applies DEF Break for 1 turn(s) on target and boosts ATB by 15%.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 100 },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- machamp (fighting) ---
  // Original: on_kill -> ATK Buff + Amplify to self
  // Shiny: on_crit -> Brand + Mark on target (area-control fighter)
  machamp_skill3b: {
    id: 'machamp_skill3b',
    name: 'No Guard',
    description: 'Passive: applies Brand for 2 turn(s) and Mark for 2 turn(s) on target.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'brand', value: 0, duration: 2, chance: 100 },
      { id: 'mark', value: 15, duration: 2, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- bellsprout (grass/poison) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_attack -> RES Break on target (18% chance)
  bellsprout_skill3b: {
    id: 'bellsprout_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies RES Break for 1 turn(s) on target (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'res_break', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- weepinbell (grass/poison) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_attack -> RES Break on target (20% chance)
  weepinbell_skill3b: {
    id: 'weepinbell_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies RES Break for 1 turn(s) on target (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'res_break', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- victreebel (grass/poison) ---
  // Original: turn_start -> SPD Buff 2 turns to self
  // Shiny: on_attack -> Unrecoverable on target (22% chance) + Vampire to self (20% chance)
  victreebel_skill3b: {
    id: 'victreebel_skill3b',
    name: 'Gluttony',
    description: 'Passive: applies Unrecoverable for 2 turn(s) (22% chance) on target and Vampire (15%) to self (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'unrecoverable', value: 0, duration: 2, chance: 22 },
      { id: 'vampire', value: 15, duration: 0, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tentacool (water/poison) ---
  // Original: on_hit_received -> Immunity to self (20%)
  // Shiny: on_attack -> Poison on target (20% chance) + RES Break (15% chance)
  tentacool_skill3b: {
    id: 'tentacool_skill3b',
    name: 'Liquid Ooze',
    description: 'Passive: applies Poison for 1 turn(s) (20% chance) and RES Break for 1 turn(s) (15% chance) on target.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 20 },
      { id: 'res_break', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- tentacruel (water/poison) ---
  // Original: on_attack -> Strip 1 buff on target (25% chance)
  // Shiny: on_hit_received -> Poison on attacker (25% chance) + Reflect for 1 turn (20% chance)
  tentacruel_skill3b: {
    id: 'tentacruel_skill3b',
    name: 'Liquid Ooze',
    description: 'Passive: applies Poison for 1 turn(s) (25% chance) on attacker and Reflect for 1 turn(s) (20% chance) to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 25 },
      { id: 'reflect', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- geodude (rock/ground) ---
  // Original: hp_threshold (<25%) -> Endure to self
  // Shiny: on_hit_received -> Counter for 1 turn (20% chance) (retaliation)
  geodude_skill3b: {
    id: 'geodude_skill3b',
    name: 'Rock Armor',
    description: 'Passive: applies Counter for 1 turn(s) to self (20% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- graveler (rock/ground) ---
  // Original: hp_threshold (<25%) -> Endure to self
  // Shiny: on_hit_received -> Counter for 1 turn (22% chance)
  graveler_skill3b: {
    id: 'graveler_skill3b',
    name: 'Rock Armor',
    description: 'Passive: applies Counter for 1 turn(s) to self (22% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- golem (rock/ground) ---
  // Original: hp_threshold (<25%) -> Endure + DEF Buff to self
  // Shiny: on_hit_received -> Reflect for 1 turn (25% chance) + Counter for 1 turn (20% chance)
  golem_skill3b: {
    id: 'golem_skill3b',
    name: 'Iron Barbs',
    description: 'Passive: applies Reflect for 1 turn(s) (25% chance) and Counter for 1 turn(s) (20% chance) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'counter', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- ponyta (fire) ---
  // Original: on_kill -> ATB boost 30% + SPD Buff to self
  // Shiny: on_attack -> Burn on target (22% chance) + ATB boost 10% (22% chance)
  ponyta_skill3b: {
    id: 'ponyta_skill3b',
    name: 'Flame Body',
    description: 'Passive: applies Burn for 1 turn(s) (22% chance) on target and boosts ATB by 10% (22% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 22 },
      { id: 'atb_boost', value: 10, duration: 0, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- rapidash (fire) ---
  // Original: hp_threshold (<30%) -> ATK Buff + Amplify to self
  // Shiny: on_crit -> Burn + Brand on target (offensive nuker)
  rapidash_skill3b: {
    id: 'rapidash_skill3b',
    name: 'Flame Body',
    description: 'Passive: applies Burn for 2 turn(s) (30% chance) and Brand for 2 turn(s) (25% chance) on crit.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 30 },
      { id: 'brand', value: 0, duration: 2, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- slowpoke (water/psychic) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_hit_received -> Heal self 5% HP (25% chance)
  slowpoke_skill3b: {
    id: 'slowpoke_skill3b',
    name: 'Regenerator',
    description: 'Passive: heals self for 5% HP (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- slowbro (water/psychic) ---
  // Original: turn_start -> Cleanse 1 debuff all allies (20%)
  // Shiny: on_hit_received -> Heal all allies 3% HP + Confusion on attacker (15% chance)
  slowbro_skill3b: {
    id: 'slowbro_skill3b',
    name: 'Regenerator',
    description: 'Passive: heals all allies for 3% HP and applies Confusion for 1 turn(s) (15% chance) on attacker.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'confusion', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- magnemite (electric/steel) ---
  // Original: hp_threshold (<25%) -> Endure to self
  // Shiny: on_hit_received -> Paralysis on attacker (20% chance)
  magnemite_skill3b: {
    id: 'magnemite_skill3b',
    name: 'Magnet Pull',
    description: 'Passive: applies Paralysis for 1 turn(s) on attacker (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- magneton (electric/steel) ---
  // Original: hp_threshold (<25%) -> Endure + Shield (10%) to self
  // Shiny: on_hit_received -> Paralysis on attacker (22% chance) + Reflect for 1 turn (18% chance)
  magneton_skill3b: {
    id: 'magneton_skill3b',
    name: 'Magnet Pull',
    description: 'Passive: applies Paralysis for 1 turn(s) (22% chance) on attacker and Reflect for 1 turn(s) (18% chance) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 22 },
      { id: 'reflect', value: 0, duration: 1, chance: 18, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- farfetchd (normal/flying) ---
  // Original: battle_start -> ACC Buff to self
  // Shiny: on_crit -> Crit DMG Buff to self + Strip 1 buff from target
  farfetchd_skill3b: {
    id: 'farfetchd_skill3b',
    name: 'Super Luck',
    description: 'Passive: applies Crit DMG Buff for 1 turn(s) to self and strips 1 buff from target.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'strip', value: 1, duration: 0, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- doduo (normal/flying) ---
  // Original: on_hit_received -> ATB boost 20% (25% chance)
  // Shiny: on_attack -> SPD Buff to self (20% chance)
  doduo_skill3b: {
    id: 'doduo_skill3b',
    name: 'Early Bird',
    description: 'Passive: applies SPD Buff for 1 turn(s) to self (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dodrio (normal/flying) ---
  // Original: on_hit_received -> ATB boost 25% (25% chance)
  // Shiny: on_crit -> ATB boost 25% + Crit Rate Buff to self
  dodrio_skill3b: {
    id: 'dodrio_skill3b',
    name: 'Early Bird',
    description: 'Passive: boosts ATB by 25% and applies Crit Rate Buff for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- seel (water) ---
  // Original: on_hit_received -> DEF Buff to self (22% chance)
  // Shiny: on_attack -> Freeze on target (12% chance)
  seel_skill3b: {
    id: 'seel_skill3b',
    name: 'Hydration',
    description: 'Passive: applies Freeze for 1 turn(s) on target (12% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 12 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- dewgong (water/ice) ---
  // Original: on_hit_received -> DEF Buff to self (25% chance)
  // Shiny: on_attack -> Freeze on target (15% chance) + SPD Slow (15% chance)
  dewgong_skill3b: {
    id: 'dewgong_skill3b',
    name: 'Hydration',
    description: 'Passive: applies Freeze for 1 turn(s) (15% chance) and SPD Slow for 1 turn(s) (15% chance) on target.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 15 },
      { id: 'spd_slow', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- grimer (poison) ---
  // Original: hp_threshold (<25%) -> Invincibility + Recovery to self
  // Shiny: on_hit_received -> Poison on attacker (25% chance) + Heal self 3%
  grimer_skill3b: {
    id: 'grimer_skill3b',
    name: 'Poison Touch',
    description: 'Passive: applies Poison for 1 turn(s) on attacker (25% chance) and heals self for 3% HP.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 25 },
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- muk (poison) ---
  // Original: hp_threshold (<40%) -> Endure + Recovery to self
  // Shiny: on_hit_received -> Poison on attacker (30% chance) + Buff Block on attacker (20% chance)
  muk_skill3b: {
    id: 'muk_skill3b',
    name: 'Poison Touch',
    description: 'Passive: applies Poison for 2 turn(s) (30% chance) and Buff Block for 1 turn(s) (20% chance) on attacker.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 2, chance: 30 },
      { id: 'buff_block', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- shellder (water) ---
  // Original: on_hit_received -> Shield (10%) to self (20% chance)
  // Shiny: on_hit_received -> Freeze on attacker (15% chance)
  shellder_skill3b: {
    id: 'shellder_skill3b',
    name: 'Skill Link',
    description: 'Passive: applies Freeze for 1 turn(s) on attacker (15% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- cloyster (water/ice) ---
  // Original: on_hit_received -> Shield (12%) to self (25% chance)
  // Shiny: on_attack -> Freeze on target (15% chance) + DEF Buff to self (20% chance)
  cloyster_skill3b: {
    id: 'cloyster_skill3b',
    name: 'Skill Link',
    description: 'Passive: applies Freeze for 1 turn(s) (15% chance) on target and DEF Buff for 1 turn(s) (20% chance) to self.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 15 },
      { id: 'def_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gastly (ghost/poison) ---
  // Original: on_hit_received -> Evasion to self (25% chance)
  // Shiny: on_attack -> Oblivion on target (20% chance) (disable passives)
  gastly_skill3b: {
    id: 'gastly_skill3b',
    name: 'Cursed Body',
    description: 'Passive: applies Oblivion for 1 turn(s) on target (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'oblivion', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- haunter (ghost/poison) ---
  // Original: on_hit_received -> Evasion to self (25% chance)
  // Shiny: on_attack -> Silence on target (22% chance)
  haunter_skill3b: {
    id: 'haunter_skill3b',
    name: 'Cursed Body',
    description: 'Passive: applies Silence for 1 turn(s) on target (22% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- gengar (ghost/poison) ---
  // Original: on_hit_received -> Silence on attacker (30% chance)
  // Shiny: on_attack -> Bomb on target (20% chance) + Oblivion (20% chance) (offensive nuker)
  gengar_skill3b: {
    id: 'gengar_skill3b',
    name: 'Shadow Tag',
    description: 'Passive: applies Bomb for 2 turn(s) (20% chance) and Oblivion for 1 turn(s) (20% chance) on target.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bomb', value: 0, duration: 2, chance: 20 },
      { id: 'oblivion', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- onix (rock/ground) ---
  // Original: hp_threshold (<25%) -> Endure + DEF Buff to self
  // Shiny: on_hit_received -> Provoke on attacker (20% chance) + Reflect for 1 turn (20% chance) (aggro tank)
  onix_skill3b: {
    id: 'onix_skill3b',
    name: 'Rock Wall',
    description: 'Passive: applies Provoke for 1 turn(s) (20% chance) on attacker and Reflect for 1 turn(s) (20% chance) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 20 },
      { id: 'reflect', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- drowzee (psychic) ---
  // Original: battle_start -> Immunity to all allies
  // Shiny: turn_start -> Heal all allies 3% HP (steady healer)
  drowzee_skill3b: {
    id: 'drowzee_skill3b',
    name: 'Forewarn',
    description: 'Passive: heals all allies for 3% HP.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- hypno (psychic) ---
  // Original: battle_start -> Immunity to all allies
  // Shiny: turn_start -> Heal all allies 3% HP + Cleanse 1 debuff (25% chance) (sustained support)
  hypno_skill3b: {
    id: 'hypno_skill3b',
    name: 'Forewarn',
    description: 'Passive: heals all allies for 3% HP and removes 1 debuff(s) from all allies (25% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 1, duration: 0, chance: 25, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- krabby (water) ---
  // Original: on_hit_received -> Shield (8%) to self (20% chance)
  // Shiny: on_attack -> DEF Break on target (18% chance)
  krabby_skill3b: {
    id: 'krabby_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies DEF Break for 1 turn(s) on target (18% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kingler (water) ---
  // Original: on_hit_received -> Shield (10%) to self (22% chance)
  // Shiny: on_crit -> DEF Break + ATK Buff to self (crit attacker)
  kingler_skill3b: {
    id: 'kingler_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies DEF Break for 1 turn(s) on target and ATK Buff for 1 turn(s) to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 100 },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- voltorb (electric) ---
  // Original: on_hit_received -> Paralysis on attacker (20% chance)
  // Shiny: on_attack -> ATB boost 10% to all allies (15% chance) (team speed)
  voltorb_skill3b: {
    id: 'voltorb_skill3b',
    name: 'Aftermath',
    description: 'Passive: boosts ATB by 10% for all allies (15% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 15, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_attack',
  },

  // --- electrode (electric) ---
  // Original: on_hit_received -> Paralysis on attacker (25% chance)
  // Shiny: on_attack -> ATB boost 10% to all allies (18% chance)
  electrode_skill3b: {
    id: 'electrode_skill3b',
    name: 'Aftermath',
    description: 'Passive: boosts ATB by 10% for all allies (18% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 18, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_attack',
  },

  // --- exeggcute (grass/psychic) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_hit_received -> Confusion on attacker (18% chance)
  exeggcute_skill3b: {
    id: 'exeggcute_skill3b',
    name: 'Harvest',
    description: 'Passive: applies Confusion for 1 turn(s) on attacker (18% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'confusion', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- exeggutor (grass/psychic) ---
  // Original: battle_start -> SPD Buff to all allies
  // Shiny: turn_start -> Heal all allies 3% HP + Nullify to self (20% chance)
  exeggutor_skill3b: {
    id: 'exeggutor_skill3b',
    name: 'Harvest',
    description: 'Passive: heals all allies for 3% HP and applies Nullify for 1 turn(s) to self (20% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'nullify', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- cubone (ground) ---
  // Original: hp_threshold (<25%) -> Endure to self
  // Shiny: on_ally_death -> ATK Buff + Amplify to self (revenge power)
  cubone_skill3b: {
    id: 'cubone_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Amplify for 1 turn(s) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- marowak (ground) ---
  // Original: hp_threshold (<30%) -> Endure + DEF Buff to self
  // Shiny: on_ally_death -> ATK Buff + Amplify + ATB boost to self (stronger revenge)
  marowak_skill3b: {
    id: 'marowak_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: applies ATK Buff for 2 turn(s), Amplify for 2 turn(s), and boosts ATB by 25%.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- hitmonlee (fighting) ---
  // Original: on_hit_received -> Immunity to self (25% chance)
  // Shiny: on_attack -> DEF Break on target (25% chance) + ATB boost 10%
  hitmonlee_skill3b: {
    id: 'hitmonlee_skill3b',
    name: 'Reckless',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance) on target and boosts ATB by 10%.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 25 },
      { id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- hitmonchan (fighting) ---
  // Original: on_attack -> ATK Buff to self (25% chance)
  // Shiny: on_crit -> Crit DMG Buff to self + ATB boost 15% (combo fighter)
  hitmonchan_skill3b: {
    id: 'hitmonchan_skill3b',
    name: 'Iron Fist',
    description: 'Passive: applies Crit DMG Buff for 1 turn(s) to self and boosts ATB by 15%.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_dmg_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- lickitung (normal) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_hit_received -> Paralysis on attacker (20% chance) + Heal self 3%
  lickitung_skill3b: {
    id: 'lickitung_skill3b',
    name: 'Oblivious',
    description: 'Passive: applies Paralysis for 1 turn(s) on attacker (20% chance) and heals self for 3% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 20 },
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- koffing (poison) ---
  // Original: on_hit_received -> Evasion to self (20%)
  // Shiny: on_attack -> Bomb on target (15% chance) + Poison (20% chance)
  koffing_skill3b: {
    id: 'koffing_skill3b',
    name: 'Neutralizing Gas',
    description: 'Passive: applies Bomb for 1 turn(s) (15% chance) and Poison for 1 turn(s) (20% chance) on target.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bomb', value: 0, duration: 1, chance: 15 },
      { id: 'poison', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- weezing (poison) ---
  // Original: on_hit_received -> Evasion to self (25%)
  // Shiny: on_attack -> Bomb on target (20% chance) + Oblivion (15% chance)
  weezing_skill3b: {
    id: 'weezing_skill3b',
    name: 'Neutralizing Gas',
    description: 'Passive: applies Bomb for 2 turn(s) (20% chance) and Oblivion for 1 turn(s) (15% chance) on target.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bomb', value: 0, duration: 2, chance: 20 },
      { id: 'oblivion', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- rhyhorn (ground/rock) ---
  // Original: hp_threshold (<25%) -> Endure to self
  // Shiny: on_hit_received -> Reflect for 1 turn (22% chance)
  rhyhorn_skill3b: {
    id: 'rhyhorn_skill3b',
    name: 'Solid Rock',
    description: 'Passive: applies Reflect for 1 turn(s) to self (22% chance).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- rhydon (ground/rock) ---
  // Original: hp_threshold (<30%) -> Endure + Shield (15%) to self
  // Shiny: on_hit_received -> Reflect for 1 turn (25% chance) + Counter for 1 turn (20% chance) (retaliation tank)
  rhydon_skill3b: {
    id: 'rhydon_skill3b',
    name: 'Solid Rock',
    description: 'Passive: applies Reflect for 1 turn(s) (25% chance) and Counter for 1 turn(s) (20% chance) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'counter', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- chansey (normal) ---
  // Original: turn_start -> Cleanse 1 debuff all allies
  // Shiny: on_hit_received -> Heal all allies 5% HP (always triggers when hit)
  chansey_skill3b: {
    id: 'chansey_skill3b',
    name: 'Serene Grace',
    description: 'Passive: heals all allies for 5% HP.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- tangela (grass) ---
  // Original: turn_start -> Heal self 5% HP
  // Shiny: on_hit_received -> SPD Slow on attacker (22% chance) + Recovery to self (22% chance)
  tangela_skill3b: {
    id: 'tangela_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: applies SPD Slow for 1 turn(s) on attacker (22% chance) and Recovery for 1 turn(s) to self (22% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 22 },
      { id: 'recovery', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- kangaskhan (normal) ---
  // Original: turn_start -> Cleanse 1 debuff + Heal self 5%
  // Shiny: on_ally_death -> ATK Buff + Endure to self (protective mother)
  kangaskhan_skill3b: {
    id: 'kangaskhan_skill3b',
    name: 'Scrappy',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Endure for 1 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- horsea (water) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_attack -> SPD Slow on target (20% chance)
  horsea_skill3b: {
    id: 'horsea_skill3b',
    name: 'Sniper',
    description: 'Passive: applies SPD Slow for 1 turn(s) on target (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_slow', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- seadra (water) ---
  // Original: on_hit_received -> Poison on attacker (25% chance)
  // Shiny: on_attack -> ATB reduce on target 10% (22% chance)
  seadra_skill3b: {
    id: 'seadra_skill3b',
    name: 'Sniper',
    description: 'Passive: reduces target ATB by 10% (22% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_reduce', value: 10, duration: 0, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- goldeen (water) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_attack -> Bleed on target (18% chance)
  goldeen_skill3b: {
    id: 'goldeen_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: applies Bleed for 1 turn(s) on target (18% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 1, chance: 18 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- seaking (water) ---
  // Original: turn_start -> SPD Buff to self
  // Shiny: on_crit -> Bleed on target (30% chance) + ATB boost 10%
  seaking_skill3b: {
    id: 'seaking_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: applies Bleed for 2 turn(s) (30% chance) on target and boosts ATB by 10%.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 30 },
      { id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- staryu (water) ---
  // Original: turn_start -> Cleanse 1 debuff self (25%)
  // Shiny: on_attack -> Heal self 3% HP (offensive sustain)
  staryu_skill3b: {
    id: 'staryu_skill3b',
    name: 'Illuminate',
    description: 'Passive: heals self for 3% HP.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- starmie (water/psychic) ---
  // Original: turn_start -> Cleanse 1 debuff all allies (20%)
  // Shiny: on_attack -> Heal all allies 2% HP + ATB boost 5% to all allies (offensive support)
  starmie_skill3b: {
    id: 'starmie_skill3b',
    name: 'Illuminate',
    description: 'Passive: heals all allies for 2% HP and boosts ATB by 5% for all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 2, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'atb_boost', value: 5, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_attack',
  },

  // --- mrmime (psychic/fairy) ---
  // Original: on_hit_received -> DEF Buff to self (30% chance)
  // Shiny: turn_start -> Shield (5%) to all allies (team barrier)
  mrmime_skill3b: {
    id: 'mrmime_skill3b',
    name: 'Soundproof',
    description: 'Passive: applies Shield (5%) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 5, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- scyther (bug/flying) ---
  // Original: on_attack -> Crit Rate Buff + Amplify to self (25% chance each)
  // Shiny: on_kill -> ATB boost 30% + CD reduce + SPD Buff (snowball on kill)
  scyther_skill3b: {
    id: 'scyther_skill3b',
    name: 'Swarm',
    description: 'Passive: boosts ATB by 30%, reduces cooldowns by 1 turn(s), and applies SPD Buff for 2 turn(s) to self.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- jynx (ice/psychic) ---
  // Original: on_hit_received -> Immunity to self (30% chance)
  // Shiny: on_attack -> Freeze on target (12% chance) + Silence (12% chance) (disruption)
  jynx_skill3b: {
    id: 'jynx_skill3b',
    name: 'Dry Skin',
    description: 'Passive: applies Freeze for 1 turn(s) (12% chance) and Silence for 1 turn(s) (12% chance) on target.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'freeze', value: 0, duration: 1, chance: 12 },
      { id: 'silence', value: 0, duration: 1, chance: 12 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- electabuzz (electric) ---
  // Original: turn_start -> Immunity to self
  // Shiny: on_attack -> Paralysis on target (22% chance) + ATB boost 10% (22% chance) (offensive electric)
  electabuzz_skill3b: {
    id: 'electabuzz_skill3b',
    name: 'Motor Drive',
    description: 'Passive: applies Paralysis for 1 turn(s) (22% chance) on target and boosts ATB by 10% (22% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 22 },
      { id: 'atb_boost', value: 10, duration: 0, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- magmar (fire) ---
  // Original: on_hit_received -> Burn on attacker (30% chance)
  // Shiny: on_attack -> Burn on target (25% chance) + Brand (15% chance) (aggressive fire)
  magmar_skill3b: {
    id: 'magmar_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: applies Burn for 1 turn(s) (25% chance) and Brand for 1 turn(s) (15% chance) on target.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 1, chance: 25 },
      { id: 'brand', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pinsir (bug) ---
  // Original: on_attack -> Oblivion on target (30% chance)
  // Shiny: on_crit -> Amplify to self + DEF Break on target (big crit plays)
  pinsir_skill3b: {
    id: 'pinsir_skill3b',
    name: 'Hyper Cutter',
    description: 'Passive: applies Amplify for 1 turn(s) to self and DEF Break for 1 turn(s) on target.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'def_break', value: 0, duration: 1, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- tauros (normal) ---
  // Original: turn_start -> Shield (10%) to all allies
  // Shiny: on_hit_received -> ATK Buff to self (25% chance) + Provoke on attacker (20% chance) (aggro bruiser)
  tauros_skill3b: {
    id: 'tauros_skill3b',
    name: 'Anger Point',
    description: 'Passive: applies ATK Buff for 1 turn(s) to self (25% chance) and Provoke for 1 turn(s) (20% chance) on attacker.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'provoke', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- magikarp (water) ---
  // Original: on_attack -> ATB boost 10% (20% chance)
  // Shiny: on_hit_received -> Evasion to self (15% chance) (slippery fish)
  magikarp_skill3b: {
    id: 'magikarp_skill3b',
    name: 'Rattled',
    description: 'Passive: applies Evasion for 1 turn(s) to self (15% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'evasion', value: 0, duration: 1, chance: 15, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- gyarados (water/flying) ---
  // Original: on_hit_received -> ATK Break on attacker (30% chance)
  // Shiny: on_kill -> ATK Buff + Amplify + ATB boost (snowball monster)
  gyarados_skill3b: {
    id: 'gyarados_skill3b',
    name: 'Moxie',
    description: 'Passive: applies ATK Buff for 2 turn(s), Amplify for 1 turn(s) to self, and boosts ATB by 25%.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- lapras (water/ice) ---
  // Original: turn_start -> Heal all allies 5% HP
  // Shiny: on_hit_received -> Shield (5%) to all allies + Freeze on attacker (15% chance)
  lapras_skill3b: {
    id: 'lapras_skill3b',
    name: 'Shell Armor',
    description: 'Passive: applies Shield (5%) to all allies and Freeze for 1 turn(s) (15% chance) on attacker.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 5, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'freeze', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- ditto (normal) ---
  // Original: turn_start -> Steal 1 buff from enemies (30% chance)
  // Shiny: on_attack -> Transfer 1 debuff to target (25% chance) (reverse debuff dump)
  ditto_skill3b: {
    id: 'ditto_skill3b',
    name: 'Limber',
    description: 'Passive: transfers own debuffs to target (25% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'transfer_debuff', value: 0, duration: 0, chance: 25, target: 'single_enemy' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- eevee (normal) ---
  // Original: on_attack -> Amplify to self (22% chance)
  // Shiny: on_hit_received -> Cleanse 1 debuff + Nullify to self (20% chance)
  eevee_skill3b: {
    id: 'eevee_skill3b',
    name: 'Anticipation',
    description: 'Passive: removes 1 debuff(s) and applies Nullify for 1 turn(s) to self (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cleanse', value: 1, duration: 0, chance: 20, target: 'self' },
      { id: 'nullify', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- vaporeon (water) ---
  // Original: turn_start -> Heal all allies 5% HP (22% chance)
  // Shiny: on_hit_received -> Recovery for 1 turn to all allies (20% chance) (reactive healer)
  vaporeon_skill3b: {
    id: 'vaporeon_skill3b',
    name: 'Hydration',
    description: 'Passive: applies Recovery for 1 turn(s) to all allies (20% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 1, chance: 20, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- jolteon (electric) ---
  // Original: turn_start -> ATB boost 15%
  // Shiny: on_attack -> Paralysis on target (20% chance) + SPD Buff to self (20% chance)
  jolteon_skill3b: {
    id: 'jolteon_skill3b',
    name: 'Quick Feet',
    description: 'Passive: applies Paralysis for 1 turn(s) (20% chance) on target and SPD Buff for 1 turn(s) (20% chance) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 20 },
      { id: 'spd_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- flareon (fire) ---
  // Original: hp_threshold (<30%) -> Amplify + ATK Buff to self
  // Shiny: on_crit -> Burn + Amplify to self (offensive crit build)
  flareon_skill3b: {
    id: 'flareon_skill3b',
    name: 'Guts',
    description: 'Passive: applies Burn for 2 turn(s) (30% chance) on target and Amplify for 1 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 30 },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- porygon (normal) ---
  // Original: turn_start -> Shorten debuffs by 1 turn for all allies
  // Shiny: on_ally_death -> Revive ally with 15% HP (5 turn CD) (backup reviver)
  porygon_skill3b: {
    id: 'porygon_skill3b',
    name: 'Download',
    description: 'Passive: revives a fallen ally with 15% HP (5 turn CD).',
    type: 'normal',
    category: 'passive',
    cooldown: 5,
    multiplier: 0,
    effects: [
      { id: 'revive', value: 15, duration: 0, chance: 100, target: 'single_ally' },
    ],
    target: 'single_ally',
    passiveTrigger: 'on_ally_death',
  },

  // --- omanyte (rock/water) ---
  // Original: on_hit_received -> Shield (10%) to self (20% chance)
  // Shiny: turn_start -> DEF Buff to self (25% chance)
  omanyte_skill3b: {
    id: 'omanyte_skill3b',
    name: 'Weak Armor',
    description: 'Passive: applies DEF Buff for 1 turn(s) to self (25% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- omastar (rock/water) ---
  // Original: on_hit_received -> Shield (10%) + DEF Buff to self (22% chance)
  // Shiny: on_attack -> Strip 1 buff + SPD Slow on target (22% chance) (offensive control)
  omastar_skill3b: {
    id: 'omastar_skill3b',
    name: 'Weak Armor',
    description: 'Passive: strips 1 buff from target and applies SPD Slow for 1 turn(s) (22% chance) on target.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'strip', value: 1, duration: 0, chance: 100 },
      { id: 'spd_slow', value: 0, duration: 1, chance: 22 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kabuto (rock/water) ---
  // Original: on_hit_received -> Counter for 1 turn (20% chance)
  // Shiny: on_attack -> Crit Rate Buff to self (22% chance) (offensive build)
  kabuto_skill3b: {
    id: 'kabuto_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Crit Rate Buff for 1 turn(s) to self (22% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 22, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kabutops (rock/water) ---
  // Original: on_hit_received -> ATK Buff + Counter to self (22% chance)
  // Shiny: on_crit -> Vampire to self (25% chance) + ATB boost 15% (crit lifesteal)
  kabutops_skill3b: {
    id: 'kabutops_skill3b',
    name: 'Swift Swim',
    description: 'Passive: applies Vampire (20%) to self (25% chance) and boosts ATB by 15%.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'vampire', value: 20, duration: 0, chance: 25, target: 'self' },
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- aerodactyl (rock/flying) ---
  // Original: hp_threshold (<33%) -> Endure to self
  // Shiny: battle_start -> SPD Buff to all allies + Evasion to self (speed opener)
  aerodactyl_skill3b: {
    id: 'aerodactyl_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies SPD Buff for 2 turn(s) to all allies and Evasion for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- snorlax (normal) ---
  // Original: hp_threshold (<30%) -> DEF Buff + Endure to self
  // Shiny: turn_start -> Heal self 5% HP + Cleanse 1 debuff from self (sustained regen tank)
  snorlax_skill3b: {
    id: 'snorlax_skill3b',
    name: 'Immunity',
    description: 'Passive: heals self for 5% HP and removes 1 debuff(s) from self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' },
      { id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- articuno (ice/flying) ---
  // Original: turn_start -> Anti-Heal on all enemies
  // Shiny: battle_start -> Shield (15%) + Immunity to all allies (defensive opener)
  articuno_skill3b: {
    id: 'articuno_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies Shield (15%) and Immunity for 1 turn(s) to all allies.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- zapdos (electric/flying) ---
  // Original: hp_threshold (<40%) -> Soul Protect to self
  // Shiny: turn_start -> ATB boost 10% to all allies + Paralysis on random enemy (25% chance) (speed aura)
  zapdos_skill3b: {
    id: 'zapdos_skill3b',
    name: 'Static',
    description: 'Passive: boosts ATB by 10% for all allies and applies Paralysis for 1 turn(s) (25% chance) on all enemies.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'paralysis', value: 0, duration: 1, chance: 25, target: 'all_enemies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- moltres (fire/flying) ---
  // Original: on_hit_received -> Burn on attacker (50% chance) + Brand on attacker (30% chance)
  // Shiny: on_crit -> Amplify for 2 turns + ATK Buff + Burn on target (aggressive crit nuker)
  moltres_skill3b: {
    id: 'moltres_skill3b',
    name: 'Berserk',
    description: 'Passive: applies Amplify for 2 turn(s) and ATK Buff for 2 turn(s) to self, and Burn for 2 turn(s) on target.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'burn', value: 0, duration: 2, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- dratini (dragon) ---
  // Original: turn_start -> Cleanse 1 debuff self (30%)
  // Shiny: on_hit_received -> Shield (8%) to self (25% chance)
  dratini_skill3b: {
    id: 'dratini_skill3b',
    name: 'Marvel Scale',
    description: 'Passive: applies Shield (8%) to self (25% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 8, duration: 0, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- dragonair (dragon) ---
  // Original: turn_start -> Cleanse 1 debuff + SPD Buff to self (25%)
  // Shiny: on_hit_received -> Shield (10%) to self (25% chance) + DEF Buff (20% chance)
  dragonair_skill3b: {
    id: 'dragonair_skill3b',
    name: 'Marvel Scale',
    description: 'Passive: applies Shield (10%) (25% chance) and DEF Buff for 1 turn(s) (20% chance) to self.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 0, chance: 25, target: 'self' },
      { id: 'def_buff', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- dragonite (dragon/flying) ---
  // Original: battle_start -> Shield (20%) + Endure to self
  // Shiny: on_kill -> ATK Buff + Crit Rate Buff + ATB boost (offensive dragon snowball)
  dragonite_skill3b: {
    id: 'dragonite_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies ATK Buff for 2 turn(s), Crit Rate Buff for 2 turn(s) to self, and boosts ATB by 25%.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 25, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- mewtwo (psychic) ---
  // Original: turn_start -> CD increase on all enemies
  // Shiny: on_attack -> Silence on target (30% chance) + Seal on target (25% chance) (hard lockdown)
  mewtwo_skill3b: {
    id: 'mewtwo_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies Silence for 1 turn(s) (30% chance) and Seal for 1 turn(s) (25% chance) on target.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'silence', value: 0, duration: 1, chance: 30 },
      { id: 'seal', value: 0, duration: 1, chance: 25 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- mew (psychic) ---
  // Original: on_hit_received -> Transfer debuffs to attacker (40%) + Skill Refresh (25%)
  // Shiny: turn_start -> Extend buffs by 1 turn for all allies + ATB boost 10% for all allies (proactive support)
  mew_skill3b: {
    id: 'mew_skill3b',
    name: 'Synchronize',
    description: 'Passive: extends buff durations by 1 turn for all allies and boosts ATB by 10% for all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },
};
