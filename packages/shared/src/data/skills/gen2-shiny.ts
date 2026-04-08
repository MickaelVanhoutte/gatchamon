import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN2_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- chikorita (grass) ---
  // Original: DEF Buff to self on hp_threshold (<30%)
  // Alt: offensive team support on turn_start
  chikorita_skill3b: {
    id: 'chikorita_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: applies Poison for 1 turn(s) (25% chance) on attack.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- bayleef (grass) ---
  // Original: Recovery to self on hp_threshold (<30%)
  // Alt: team cleanse when hit
  bayleef_skill3b: {
    id: 'bayleef_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: removes 1 debuff(s) from self when hit.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- meganium (grass) ---
  // Original: Recovery to all allies on turn_start
  // Alt: defensive shield at battle start
  meganium_skill3b: {
    id: 'meganium_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: applies Shield for 2 turn(s) and Immunity for 1 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- cyndaquil (fire) ---
  // Original: ATK Buff to self on hp_threshold (<30%)
  // Alt: Burn on attack (offensive uptime)
  cyndaquil_skill3b: {
    id: 'cyndaquil_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Burn for 1 turn(s) (25% chance) on attack.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- quilava (fire) ---
  // Original: ATK Buff 1t to self on_attack
  // Alt: Brand on crit (burst damage support)
  quilava_skill3b: {
    id: 'quilava_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Brand for 2 turn(s) on crit.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 100 }],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- typhlosion (fire) ---
  // Original: ATK Buff + SPD Buff to self on_crit
  // Alt: AoE debuff at battle start
  typhlosion_skill3b: {
    id: 'typhlosion_skill3b',
    name: 'Flash Fire',
    description: 'Passive: applies Burn for 2 turn(s) and Brand for 2 turn(s) to all enemies.',
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

  // --- totodile (water) ---
  // Original: heal 10% self on hp_threshold (<30%)
  // Alt: ATB manipulation on attack
  totodile_skill3b: {
    id: 'totodile_skill3b',
    name: 'Sheer Force',
    description: 'Passive: reduces ATB by 15% (30% chance) on attack.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 15, duration: 0, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- croconaw (water) ---
  // Original: ATB boost 15% on_attack (30%)
  // Alt: defensive when hit
  croconaw_skill3b: {
    id: 'croconaw_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies DEF Buff for 1 turn(s) and heals self for 5% HP when hit.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- feraligatr (water) ---
  // Original: heal 5% all allies on turn_start
  // Alt: offensive debuff on attack
  feraligatr_skill3b: {
    id: 'feraligatr_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies DEF Break for 1 turn(s) (30% chance) and reduces ATB by 15% (30% chance) on attack.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 30 },
      { id: 'atb_reduce', value: 15, duration: 0, chance: 30 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- sentret (normal) ---
  // Original: Evasion 1t to self on_hit_received
  // Alt: speed boost at battle start
  sentret_skill3b: {
    id: 'sentret_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies SPD Buff for 2 turn(s) and ACC Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- furret (normal) ---
  // Original: ATB boost 15% on_attack
  // Alt: strip buff when attacking
  furret_skill3b: {
    id: 'furret_skill3b',
    name: 'Keen Eye',
    description: 'Passive: strips 1 buff (25% chance) on attack.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'strip', value: 1, duration: 0, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- hoothoot (normal/flying) ---
  // Original: Evasion 1t to self on_hit_received
  // Alt: Confusion debuff on attack
  hoothoot_skill3b: {
    id: 'hoothoot_skill3b',
    name: 'Tinted Lens',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance) on attack.',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- noctowl (normal/flying) ---
  // Original: SPD Buff 2t to self on hp_threshold (<50%)
  // Alt: Silence on hit received (punish attackers)
  noctowl_skill3b: {
    id: 'noctowl_skill3b',
    name: 'Tinted Lens',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance) to attacker.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- ledyba (bug/flying) ---
  // Original: ATB boost 50% on_kill
  // Alt: team buff on turn start
  ledyba_skill3b: {
    id: 'ledyba_skill3b',
    name: 'Early Bird',
    description: 'Passive: boosts ATB by 10% to all allies.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- ledian (bug/flying) ---
  // Original: SPD Buff 2t to self on hp_threshold (<50%)
  // Alt: ACC Break on attack
  ledian_skill3b: {
    id: 'ledian_skill3b',
    name: 'Iron Fist',
    description: 'Passive: applies Glancing Hit for 1 turn(s) (25% chance) on attack.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- spinarak (bug/poison) ---
  // Original: Glancing 1t on_hit_received
  // Alt: Poison on attack
  spinarak_skill3b: {
    id: 'spinarak_skill3b',
    name: 'Insomnia',
    description: 'Passive: applies Poison for 1 turn(s) (25% chance) on attack.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- ariados (bug/poison) ---
  // Original: Poison 1t on_hit_received
  // Alt: Anti-Heal + slow on attack
  ariados_skill3b: {
    id: 'ariados_skill3b',
    name: 'Insomnia',
    description: 'Passive: applies Anti-Heal for 1 turn(s) (20% chance) on attack.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'anti_heal', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- crobat (poison/flying) ---
  // Original: SPD Buff 1t to self on turn_start
  // Alt: Vampire on crit
  crobat_skill3b: {
    id: 'crobat_skill3b',
    name: 'Infiltrator',
    description: 'Passive: applies Vampire for 1 turn(s) to self on crit.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- chinchou (water/electric) ---
  // Original: cleanse 1 debuff all allies on turn_start
  // Alt: team Immunity at battle start
  chinchou_skill3b: {
    id: 'chinchou_skill3b',
    name: 'Illuminate',
    description: 'Passive: applies Immunity for 2 turn(s) to all allies.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- lanturn (water/electric) ---
  // Original: heal 5% all allies on turn_start
  // Alt: Paralysis on hit received (punish attackers)
  lanturn_skill3b: {
    id: 'lanturn_skill3b',
    name: 'Illuminate',
    description: 'Passive: applies Paralysis for 1 turn(s) (30% chance) to attacker.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- pichu (electric) ---
  // Original: Paralysis 1t on_hit_received
  // Alt: ATB boost on attack
  pichu_skill3b: {
    id: 'pichu_skill3b',
    name: 'Lightning Rod',
    description: 'Passive: boosts ATB by 15% to self (30% chance) on attack.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 15, duration: 0, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- cleffa (fairy) ---
  // Original: heal 10% all allies on_ally_death
  // Alt: Shield team at battle start
  cleffa_skill3b: {
    id: 'cleffa_skill3b',
    name: 'Magic Guard',
    description: 'Passive: applies Shield for 2 turn(s) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- igglybuff (normal/fairy) ---
  // Original: ATB boost 50% on_kill
  // Alt: heal on hit received (tanky sustain)
  igglybuff_skill3b: {
    id: 'igglybuff_skill3b',
    name: 'Friend Guard',
    description: 'Passive: heals self for 8% HP when hit.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 8, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- togepi (fairy) ---
  // Original: Recovery 2t all allies on_ally_death
  // Alt: Immunity team at battle start
  togepi_skill3b: {
    id: 'togepi_skill3b',
    name: 'Super Luck',
    description: 'Passive: applies Immunity for 1 turn(s) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- togetic (fairy/flying) ---
  // Original: Recovery 2t to self on hp_threshold (<30%)
  // Alt: heal all allies on turn_start
  togetic_skill3b: {
    id: 'togetic_skill3b',
    name: 'Super Luck',
    description: 'Passive: heals all allies for 5% HP.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- natu (psychic/flying) ---
  // Original: ATB boost 15% (30%) on_attack
  // Alt: Reflect on hit received
  natu_skill3b: {
    id: 'natu_skill3b',
    name: 'Magic Bounce',
    description: 'Passive: applies Reflect for 1 turn(s) to self (30% chance) when hit.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- xatu (psychic/flying) ---
  // Original: SPD Buff 2t all allies at battle_start
  // Alt: Silence debuff on turn start
  xatu_skill3b: {
    id: 'xatu_skill3b',
    name: 'Synchronize',
    description: 'Passive: applies Confusion for 1 turn(s) (20% chance) on attack.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- mareep (electric) ---
  // Original: Paralysis 1t (20%) on_hit_received
  // Alt: SPD Slow on attack
  mareep_skill3b: {
    id: 'mareep_skill3b',
    name: 'Plus',
    description: 'Passive: applies SPD Slow for 1 turn(s) (20% chance) on attack.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- flaaffy (electric) ---
  // Original: ATB boost 15% (25%) on_attack
  // Alt: Paralysis retaliation on hit
  flaaffy_skill3b: {
    id: 'flaaffy_skill3b',
    name: 'Plus',
    description: 'Passive: applies Paralysis for 1 turn(s) (25% chance) to attacker.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- ampharos (electric) ---
  // Original: Paralysis 1t (20%) on_hit_received
  // Alt: team ATB boost at battle start
  ampharos_skill3b: {
    id: 'ampharos_skill3b',
    name: 'Plus',
    description: 'Passive: boosts ATB by 20% and applies ATK Buff for 2 turn(s) to all allies.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- bellossom (grass) ---
  // Original: Recovery 2t all allies at battle_start
  // Alt: cleanse on turn start
  bellossom_skill3b: {
    id: 'bellossom_skill3b',
    name: 'Healer',
    description: 'Passive: removes 1 debuff(s) from all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- marill (water/fairy) ---
  // Original: Recovery 2t to self on hp_threshold (<40%)
  // Alt: heal on attack
  marill_skill3b: {
    id: 'marill_skill3b',
    name: 'Huge Power',
    description: 'Passive: heals self for 5% HP on attack.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- azumarill (water/fairy) ---
  // Original: Shield 3t to self at battle_start
  // Alt: heal ally on ally death
  azumarill_skill3b: {
    id: 'azumarill_skill3b',
    name: 'Sap Sipper',
    description: 'Passive: heals all allies for 10% HP and removes 1 debuff(s).',
    type: 'fairy',
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

  // --- sudowoodo (rock) ---
  // Original: Endure 1t + DEF Buff 2t on hp_threshold (<30%)
  // Alt: Counter on hit received
  sudowoodo_skill3b: {
    id: 'sudowoodo_skill3b',
    name: 'Rock Head',
    description: 'Passive: applies Counter for 1 turn(s) to self (30% chance) when hit.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- politoed (water) ---
  // Original: heal 3% all allies on turn_start
  // Alt: ATB boost team at battle start
  politoed_skill3b: {
    id: 'politoed_skill3b',
    name: 'Water Absorb',
    description: 'Passive: boosts ATB by 15% to all allies and applies Recovery for 1 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 15, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- hoppip (grass/flying) ---
  // Original: SPD Buff 2t to self at battle_start
  // Alt: Evasion on hit received
  hoppip_skill3b: {
    id: 'hoppip_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: applies Evasion for 1 turn(s) to self (30% chance) when hit.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- skiploom (grass/flying) ---
  // Original: ATB boost 20% + SPD Buff 1t on_crit
  // Alt: Poison on attack
  skiploom_skill3b: {
    id: 'skiploom_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: applies Poison for 1 turn(s) (30% chance) and applies SPD Slow for 1 turn(s) (25% chance) on attack.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 30 },
      { id: 'spd_slow', value: 0, duration: 1, chance: 25 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- jumpluff (grass/flying) ---
  // Original: ATB boost 25% + SPD Buff 1t on_crit
  // Alt: team SPD support on turn start
  jumpluff_skill3b: {
    id: 'jumpluff_skill3b',
    name: 'Leaf Guard',
    description: 'Passive: boosts ATB by 10% to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 10, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- aipom (normal) ---
  // Original: ATK Buff 2t on_kill
  // Alt: steal buff on crit
  aipom_skill3b: {
    id: 'aipom_skill3b',
    name: 'Pickup',
    description: 'Passive: steals 1 buff on crit.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 100 }],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- sunkern (grass) ---
  // Original: Recovery 2t to self on hp_threshold (<40%)
  // Alt: heal on attack
  sunkern_skill3b: {
    id: 'sunkern_skill3b',
    name: 'Early Bird',
    description: 'Passive: heals self for 5% HP on attack.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- sunflora (grass) ---
  // Original: heal 5% self on turn_start
  // Alt: team Recovery on ally death
  sunflora_skill3b: {
    id: 'sunflora_skill3b',
    name: 'Solar Power',
    description: 'Passive: applies Recovery for 2 turn(s) and ATK Buff for 2 turn(s) to all allies.',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- yanma (bug/flying) ---
  // Original: ATB boost 15% + SPD Buff 1t on turn_start
  // Alt: ACC Break on attack
  yanma_skill3b: {
    id: 'yanma_skill3b',
    name: 'Compound Eyes',
    description: 'Passive: applies ACC Break for 1 turn(s) (25% chance) on attack.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_break', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- wooper (water/ground) ---
  // Original: Shield 3t to self at battle_start
  // Alt: heal on hit received
  wooper_skill3b: {
    id: 'wooper_skill3b',
    name: 'Unaware',
    description: 'Passive: heals self for 8% HP when hit.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 8, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- quagsire (water/ground) ---
  // Original: heal 5% self on_hit_received
  // Alt: DEF Break on attack
  quagsire_skill3b: {
    id: 'quagsire_skill3b',
    name: 'Unaware',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance) on attack.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- espeon (psychic) ---
  // Original: Confusion 1t (25%) on_hit_received
  // Alt: Seal on attack
  espeon_skill3b: {
    id: 'espeon_skill3b',
    name: 'Magic Bounce',
    description: 'Passive: applies Seal for 1 turn(s) (20% chance) on attack.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- umbreon (dark) ---
  // Original: Brand 2t (30%) on_hit_received
  // Alt: Oblivion at battle start
  umbreon_skill3b: {
    id: 'umbreon_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Oblivion for 2 turn(s) to all enemies.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- murkrow (dark/flying) ---
  // Original: strip 1 buff all enemies on turn_start
  // Alt: Oblivion on crit
  murkrow_skill3b: {
    id: 'murkrow_skill3b',
    name: 'Super Luck',
    description: 'Passive: applies Oblivion for 2 turn(s) and steals 1 buff on crit.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'oblivion', value: 0, duration: 2, chance: 100 },
      { id: 'steal_buff', value: 1, duration: 0, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- slowking (water/psychic) ---
  // Original: heal 5% all allies on turn_start
  // Alt: Silence retaliation on hit
  slowking_skill3b: {
    id: 'slowking_skill3b',
    name: 'Regenerator',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance) to attacker.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- misdreavus (ghost) ---
  // Original: Bomb 2t (30%) on_hit_received
  // Alt: Silence on attack
  misdreavus_skill3b: {
    id: 'misdreavus_skill3b',
    name: 'Cursed Body',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance) on attack.',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- wobbuffet (psychic) ---
  // Original: Provoke 1t (20%) on_hit_received
  // Alt: Counter + Reflect at battle start
  wobbuffet_skill3b: {
    id: 'wobbuffet_skill3b',
    name: 'Telepathy',
    description: 'Passive: applies Counter for 2 turn(s) and Reflect for 2 turn(s) to self.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- girafarig (normal/psychic) ---
  // Original: Seal 2t (20%) on_attack
  // Alt: Confusion on hit received
  girafarig_skill3b: {
    id: 'girafarig_skill3b',
    name: 'Sap Sipper',
    description: 'Passive: applies Confusion for 1 turn(s) (30% chance) to attacker.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- pineco (bug) ---
  // Original: Endure 1t + DEF Buff 2t on hp_threshold (<50%)
  // Alt: Bomb on hit received
  pineco_skill3b: {
    id: 'pineco_skill3b',
    name: 'Overcoat',
    description: 'Passive: applies Bomb for 2 turn(s) (25% chance) to attacker.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- forretress (bug/steel) ---
  // Original: Reflect 1t (30%) on_hit_received
  // Alt: Shield team at battle start
  forretress_skill3b: {
    id: 'forretress_skill3b',
    name: 'Overcoat',
    description: 'Passive: applies Shield for 2 turn(s) and DEF Buff for 2 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 12, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- dunsparce (normal) ---
  // Original: ACC Break 2t (25%) on_attack
  // Alt: SPD Slow on hit received
  dunsparce_skill3b: {
    id: 'dunsparce_skill3b',
    name: 'Rattled',
    description: 'Passive: applies SPD Slow for 2 turn(s) (30% chance) to attacker.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 2, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- gligar (ground/flying) ---
  // Original: DEF Break 2t (20%) on_attack
  // Alt: Evasion + SPD Buff at battle start
  gligar_skill3b: {
    id: 'gligar_skill3b',
    name: 'Immunity',
    description: 'Passive: applies Evasion for 2 turn(s) and SPD Buff for 2 turn(s) to self.',
    type: 'flying',
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

  // --- steelix (steel/ground) ---
  // Original: Shield 1t all allies on turn_start
  // Alt: Provoke + DEF Buff on hit received
  steelix_skill3b: {
    id: 'steelix_skill3b',
    name: 'Sheer Force',
    description: 'Passive: applies Provoke for 1 turn(s) (20% chance) to attacker and applies DEF Buff for 1 turn(s) to self.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'provoke', value: 0, duration: 1, chance: 20 },
      { id: 'def_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- snubbull (fairy) ---
  // Original: ATK Break 2t all enemies at battle_start
  // Alt: DEF Buff team at battle start
  snubbull_skill3b: {
    id: 'snubbull_skill3b',
    name: 'Rattled',
    description: 'Passive: applies DEF Buff for 2 turn(s) to all allies.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- granbull (fairy) ---
  // Original: revive 20% on_ally_death (6t CD)
  // Alt: Recovery + Immunity team at battle start
  granbull_skill3b: {
    id: 'granbull_skill3b',
    name: 'Quick Feet',
    description: 'Passive: applies Recovery for 2 turn(s) and Immunity for 1 turn(s) to all allies.',
    type: 'fairy',
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

  // --- qwilfish (water/poison) ---
  // Original: Poison 2t (40%) on_hit_received
  // Alt: Anti-Heal on attack
  qwilfish_skill3b: {
    id: 'qwilfish_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Anti-Heal for 2 turn(s) (25% chance) on attack.',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'anti_heal', value: 0, duration: 2, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- scizor (bug/steel) ---
  // Original: Glancing 2t (30%) on_attack
  // Alt: ATK Buff on crit
  scizor_skill3b: {
    id: 'scizor_skill3b',
    name: 'Swarm',
    description: 'Passive: applies ATK Buff for 1 turn(s) and Crit Rate Buff for 1 turn(s) to self on crit.',
    type: 'steel',
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

  // --- shuckle (bug/rock) ---
  // Original: Endure 1t + DEF Buff 2t on_ally_death
  // Alt: Shield + Reflect on hit received
  shuckle_skill3b: {
    id: 'shuckle_skill3b',
    name: 'Contrary',
    description: 'Passive: applies Reflect for 1 turn(s) (35% chance) to self when hit.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- heracross (bug/fighting) ---
  // Original: ATK Buff 2t (40%) on_hit_received
  // Alt: DEF Break on crit
  heracross_skill3b: {
    id: 'heracross_skill3b',
    name: 'Moxie',
    description: 'Passive: applies DEF Break for 2 turn(s) and Expose for 1 turn(s) on crit.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 2, chance: 100 },
      { id: 'expose', value: 0, duration: 1, chance: 100 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- sneasel (dark/ice) ---
  // Original: Oblivion 1t (20%) on_attack
  // Alt: SPD Slow on hit received
  sneasel_skill3b: {
    id: 'sneasel_skill3b',
    name: 'Pickpocket',
    description: 'Passive: steals 1 buff (25% chance) from attacker when hit.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- teddiursa (normal) ---
  // Original: Crit DMG Buff 2t on_crit
  // Alt: ATK Buff on kill
  teddiursa_skill3b: {
    id: 'teddiursa_skill3b',
    name: 'Quick Feet',
    description: 'Passive: applies ATK Buff for 2 turn(s) and boosts ATB by 30% to self on kill.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- ursaring (normal) ---
  // Original: ATK Buff 2t + Crit DMG Buff 2t on hp_threshold (<30%)
  // Alt: Vampire on attack
  ursaring_skill3b: {
    id: 'ursaring_skill3b',
    name: 'Quick Feet',
    description: 'Passive: applies Vampire for 1 turn(s) to self on crit.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- slugma (fire) ---
  // Original: Burn 1t (25%) on_hit_received
  // Alt: Brand on attack
  slugma_skill3b: {
    id: 'slugma_skill3b',
    name: 'Weak Armor',
    description: 'Passive: applies Brand for 1 turn(s) (20% chance) on attack.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- magcargo (fire/rock) ---
  // Original: Shield 2t (30%) on_hit_received
  // Alt: Burn all enemies at battle start
  magcargo_skill3b: {
    id: 'magcargo_skill3b',
    name: 'Weak Armor',
    description: 'Passive: applies Burn for 2 turn(s) to all enemies.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- swinub (ice/ground) ---
  // Original: DEF Buff 2t (30%) on_hit_received
  // Alt: SPD Slow on attack
  swinub_skill3b: {
    id: 'swinub_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies SPD Slow for 1 turn(s) (25% chance) on attack.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- piloswine (ice/ground) ---
  // Original: Anti-Heal 2t (20%) on_attack
  // Alt: DEF Buff on hit received
  piloswine_skill3b: {
    id: 'piloswine_skill3b',
    name: 'Snow Cloak',
    description: 'Passive: applies Shield for 2 turn(s) (30% chance) to self when hit.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 2, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- corsola (water/rock) ---
  // Original: heal 8% all allies on turn_start
  // Alt: Shield + DEF Buff on ally death
  corsola_skill3b: {
    id: 'corsola_skill3b',
    name: 'Regenerator',
    description: 'Passive: applies Shield for 2 turn(s) and DEF Buff for 2 turn(s) to all allies.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 12, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- remoraid (water) ---
  // Original: ACC Buff 2t at battle_start
  // Alt: Crit Rate Buff on attack
  remoraid_skill3b: {
    id: 'remoraid_skill3b',
    name: 'Moody',
    description: 'Passive: applies Crit Rate Buff for 1 turn(s) (25% chance) to self on attack.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- octillery (water) ---
  // Original: Crit Rate Buff 2t on_kill
  // Alt: ATK Buff + ATB boost at battle start
  octillery_skill3b: {
    id: 'octillery_skill3b',
    name: 'Moody',
    description: 'Passive: applies ATK Buff for 2 turn(s) and ACC Buff for 2 turn(s) to self.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- delibird (ice/flying) ---
  // Original: SPD Buff 2t all allies at battle_start
  // Alt: Freeze on attack
  delibird_skill3b: {
    id: 'delibird_skill3b',
    name: 'Hustle',
    description: 'Passive: applies Freeze for 1 turn(s) (15% chance) on attack.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 15 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- mantine (water/flying) ---
  // Original: Recovery 2t (30%) on_hit_received
  // Alt: team heal on ally death
  mantine_skill3b: {
    id: 'mantine_skill3b',
    name: 'Swift Swim',
    description: 'Passive: heals all allies for 10% HP and applies SPD Buff for 2 turn(s) to all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 10, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- skarmory (steel/flying) ---
  // Original: DEF Buff 2t (35%) on_hit_received
  // Alt: Reflect at battle start
  skarmory_skill3b: {
    id: 'skarmory_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Reflect for 2 turn(s) to self and DEF Buff for 2 turn(s) to all allies.',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- houndour (dark/fire) ---
  // Original: ATK Buff 2t on_crit
  // Alt: Brand on attack
  houndour_skill3b: {
    id: 'houndour_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies Brand for 1 turn(s) (25% chance) on attack.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- houndoom (dark/fire) ---
  // Original: ATK Buff 2t + Crit Rate Buff 2t on hp_threshold (<50%)
  // Alt: Amplify + strip on crit
  houndoom_skill3b: {
    id: 'houndoom_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies Amplify for 1 turn(s) to self and strips 1 buff on crit.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'strip', value: 1, duration: 0, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- kingdra (water/dragon) ---
  // Original: SPD Buff 2t at battle_start
  // Alt: ATK Buff + Crit Rate Buff at battle start
  kingdra_skill3b: {
    id: 'kingdra_skill3b',
    name: 'Sniper',
    description: 'Passive: applies ATK Buff for 2 turn(s) and Crit Rate Buff for 2 turn(s) to self.',
    type: 'dragon',
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

  // --- phanpy (ground) ---
  // Original: DEF Buff 2t on_hit_received
  // Alt: Shield at battle start
  phanpy_skill3b: {
    id: 'phanpy_skill3b',
    name: 'Sand Veil',
    description: 'Passive: applies Shield for 3 turn(s) to self.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 3, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- donphan (ground) ---
  // Original: Invincibility 1t + DEF Buff 2t on hp_threshold (<25%)
  // Alt: Counter + Threat on hit received
  donphan_skill3b: {
    id: 'donphan_skill3b',
    name: 'Sand Veil',
    description: 'Passive: applies Counter for 1 turn(s) (30% chance) and Threat for 1 turn(s) to self when hit.',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 30, target: 'self' },
      { id: 'threat', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- porygon2 (normal) ---
  // Original: extend buffs 1t all allies on turn_start
  // Alt: shorten debuffs on turn start
  porygon2_skill3b: {
    id: 'porygon2_skill3b',
    name: 'Download',
    description: 'Passive: shortens debuff durations by 1 turn from all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- stantler (normal) ---
  // Original: Crit Rate Buff 2t (40%) on_attack
  // Alt: ATK Break on hit received
  stantler_skill3b: {
    id: 'stantler_skill3b',
    name: 'Frisk',
    description: 'Passive: applies ATK Break for 1 turn(s) (30% chance) to attacker.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_break', value: 0, duration: 1, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- smeargle (normal) ---
  // Original: ATB boost 20% on_crit
  // Alt: ACC Buff at battle start
  smeargle_skill3b: {
    id: 'smeargle_skill3b',
    name: 'Technician',
    description: 'Passive: applies ACC Buff for 2 turn(s) and Crit Rate Buff for 2 turn(s) to self.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'acc_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- tyrogue (fighting) ---
  // Original: Brand 1t (24%) on_attack
  // Alt: DEF Break on crit
  tyrogue_skill3b: {
    id: 'tyrogue_skill3b',
    name: 'Steadfast',
    description: 'Passive: applies DEF Break for 1 turn(s) on crit.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 100 }],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- hitmontop (fighting) ---
  // Original: Provoke 1t to self on turn_start
  // Alt: ATK Buff + Counter on hit received
  hitmontop_skill3b: {
    id: 'hitmontop_skill3b',
    name: 'Technician',
    description: 'Passive: applies Counter for 1 turn(s) (35% chance) to self when hit.',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- smoochum (ice/psychic) ---
  // Original: Anti-Heal 2t (26%) on_attack
  // Alt: Freeze on hit received
  smoochum_skill3b: {
    id: 'smoochum_skill3b',
    name: 'Forewarn',
    description: 'Passive: applies Freeze for 1 turn(s) (20% chance) to attacker.',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 20 }],
    target: 'single_enemy',
    passiveTrigger: 'on_hit_received',
  },

  // --- elekid (electric) ---
  // Original: Paralysis 1t (30%) on_hit_received
  // Alt: ATB reduce on attack
  elekid_skill3b: {
    id: 'elekid_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: reduces ATB by 15% (25% chance) on attack.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 15, duration: 0, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- magby (fire) ---
  // Original: Burn 1t (30%) on_hit_received
  // Alt: Detonate on crit
  magby_skill3b: {
    id: 'magby_skill3b',
    name: 'Vital Spirit',
    description: 'Passive: detonates all DoT effects on target (30% chance) on crit.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'detonate', value: 0, duration: 0, chance: 30 }],
    target: 'single_enemy',
    passiveTrigger: 'on_crit',
  },

  // --- miltank (normal) ---
  // Original: Recovery 2t all allies at battle_start
  // Alt: heal on turn start
  miltank_skill3b: {
    id: 'miltank_skill3b',
    name: 'Scrappy',
    description: 'Passive: heals all allies for 5% HP and removes 1 debuff(s).',
    type: 'normal',
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

  // --- blissey (normal) ---
  // Original: heal 8% all allies on turn_start
  // Alt: Recovery + Shield at battle start
  blissey_skill3b: {
    id: 'blissey_skill3b',
    name: 'Healer',
    description: 'Passive: applies Recovery for 2 turn(s) and Shield for 2 turn(s) to all allies.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- raikou (electric) ---
  // Original: SPD Buff 999t + ATB boost 15% at battle_start
  // Alt: Paralysis all enemies + ATK Buff at battle start
  raikou_skill3b: {
    id: 'raikou_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Paralysis for 1 turn(s) to all enemies and applies ATK Buff for 999 turn(s) to self.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'paralysis', value: 0, duration: 1, chance: 100, target: 'all_enemies' },
      { id: 'atk_buff', value: 0, duration: 999, chance: 100, target: 'self' },
    ],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- entei (fire) ---
  // Original: detonate (25%) + Amplify 1t on_attack
  // Alt: Burn + Brand all enemies at battle start
  entei_skill3b: {
    id: 'entei_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies ATK Buff for 999 turn(s) and Crit Rate Buff for 999 turn(s) to self.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 999, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- suicune (water) ---
  // Original: balance_hp + Recovery 1t all allies on_hit_received
  // Alt: Immunity + cleanse at battle start
  suicune_skill3b: {
    id: 'suicune_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Immunity for 2 turn(s) and removes 2 debuff(s) from all allies.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'immunity', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'cleanse', value: 2, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- larvitar (rock/ground) ---
  // Original: Shield 2t on_hit_received
  // Alt: DEF Break on attack
  larvitar_skill3b: {
    id: 'larvitar_skill3b',
    name: 'Sand Veil',
    description: 'Passive: applies DEF Break for 1 turn(s) (25% chance) on attack.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 25 }],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- pupitar (rock/ground) ---
  // Original: DEF Buff 2t at battle_start
  // Alt: Endure on hp threshold
  pupitar_skill3b: {
    id: 'pupitar_skill3b',
    name: 'Sand Veil',
    description: 'Passive: applies Endure for 1 turn(s) and Shield for 2 turn(s) to self.',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- tyranitar (rock/dark) ---
  // Original: Expose 2t all enemies at battle_start
  // Alt: DEF Break + strip on attack
  tyranitar_skill3b: {
    id: 'tyranitar_skill3b',
    name: 'Unnerve',
    description: 'Passive: applies DEF Break for 2 turn(s) (25% chance) and strips 1 buff (25% chance) on attack.',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 2, chance: 25 },
      { id: 'strip', value: 1, duration: 0, chance: 25 },
    ],
    target: 'single_enemy',
    passiveTrigger: 'on_attack',
  },

  // --- lugia (psychic/flying) ---
  // Original: Shield 999t all allies + Immunity 1t to self at battle_start
  // Alt: team SPD + Reflect at battle start
  lugia_skill3b: {
    id: 'lugia_skill3b',
    name: 'Pressure',
    description: 'Passive: applies SPD Buff for 999 turn(s) and Reflect for 2 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 999, chance: 100, target: 'all_allies' },
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- hooh (fire/flying) ---
  // Original: Recovery 999t to self + Revive on_ally_death (6t CD)
  // Alt: team heal + Amplify at battle start
  hooh_skill3b: {
    id: 'hooh_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Amplify for 2 turn(s) and ATK Buff for 999 turn(s) to all allies.',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'atk_buff', value: 0, duration: 999, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- celebi (psychic/grass) ---
  // Original: Recovery 999t all allies + cleanse 1 at battle_start
  // Alt: heal + Immunity on turn start
  celebi_skill3b: {
    id: 'celebi_skill3b',
    name: 'Healer',
    description: 'Passive: heals all allies for 5% HP and applies Immunity for 1 turn(s) to all allies.',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'immunity', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

};
