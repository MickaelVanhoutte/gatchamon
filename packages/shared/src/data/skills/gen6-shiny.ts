import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN6_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- chespin --- original: heal 5% all_allies, turn_start (defensive/heal)
  // alt: offensive team ATK buff on attack
  chespin_skill3b: {
    id: 'chespin_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies ATK Buff for 1 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 25, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_attack',
  },

  // --- quilladin --- original: atb_boost 25% + spd_buff self, on_crit
  // alt: team cleanse on turn_start (support vs self-speed)
  quilladin_skill3b: {
    id: 'quilladin_skill3b',
    name: 'Overgrow',
    description: 'Passive: removes 1 debuff(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- chesnaught --- original: shorten_debuffs all_allies, turn_start (team support)
  // alt: counter + endure self on_hit_received (tanky self-defense)
  chesnaught_skill3b: {
    id: 'chesnaught_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Counter for 1 turn(s), applies Endure for 1 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- fennekin --- original: expose on_attack (debuff on attack)
  // alt: crit_rate_buff self on_hit_received (offensive from defensive trigger)
  fennekin_skill3b: {
    id: 'fennekin_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Crit Rate Buff for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- braixen --- original: atb_boost 15% self, on_attack
  // alt: bomb on all_enemies at battle_start
  braixen_skill3b: {
    id: 'braixen_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Bomb for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- delphox --- original: bomb all_enemies, battle_start (AoE debuff once)
  // alt: brand on_attack (sustained single-target debuff)
  delphox_skill3b: {
    id: 'delphox_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Brand for 2 turn(s) (30% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- froakie --- original: invincibility + recovery self, hp_threshold (survival)
  // alt: reflect + shield self, battle_start (proactive defense)
  froakie_skill3b: {
    id: 'froakie_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Reflect for 2 turn(s), applies Shield for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'reflect', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- frogadier --- original: steal_buff 15% on_attack (self-buff via offense)
  // alt: spd_slow on enemies at battle_start (team control)
  frogadier_skill3b: {
    id: 'frogadier_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Slow for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- greninja --- original: anti_heal on_attack (debuff)
  // alt: vampire self on_crit (sustain via offense)
  greninja_skill3b: {
    id: 'greninja_skill3b',
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

  // --- bunnelby --- original: heal 15% + cleanse self, on_kill (self sustain, rare trigger)
  // alt: def_buff all_allies on_hit_received (team defense, frequent trigger)
  bunnelby_skill3b: {
    id: 'bunnelby_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies DEF Buff for 1 turn(s) (30% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 1, chance: 30, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- diggersby --- original: spd_buff all_allies, battle_start (team speed)
  // alt: provoke + endure self on turn_start (tank identity)
  diggersby_skill3b: {
    id: 'diggersby_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Threat for 2 turn(s), applies Endure for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'threat', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- fletchling --- original: amplify 999 self, always (permanent self-buff)
  // alt: atb_boost for team on turn_start (team speed support)
  fletchling_skill3b: {
    id: 'fletchling_skill3b',
    name: 'Adaptability',
    description: 'Passive: boosts ATB by 8%.',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 8, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- fletchinder --- original: atk_buff self, on_kill (rare trigger)
  // alt: amplify self on_attack (frequent but weaker trigger)
  fletchinder_skill3b: {
    id: 'fletchinder_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Amplify for 1 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- talonflame --- original: atb_boost 10% all_allies, turn_start (team speed)
  // alt: brand on_attack (offensive debuff)
  talonflame_skill3b: {
    id: 'talonflame_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Brand for 1 turn(s) (30% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- scatterbug --- original: invincibility + recovery self, hp_threshold (survival)
  // alt: evasion self at battle_start (dodge-based defense)
  scatterbug_skill3b: {
    id: 'scatterbug_skill3b',
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

  // --- spewpa --- original: soul_protect self, hp_threshold (anti-death)
  // alt: shield all_allies at battle_start (proactive team defense)
  spewpa_skill3b: {
    id: 'spewpa_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 15, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- vivillon --- original: atb_boost 30% + spd_buff self, hp_threshold (self-speed emergency)
  // alt: silence on_attack (offensive CC)
  vivillon_skill3b: {
    id: 'vivillon_skill3b',
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

  // --- litleo --- original: amplify + crit_dmg_buff self, hp_threshold (offense at low HP)
  // alt: atk_buff + crit_rate_buff self at battle_start (proactive offense)
  litleo_skill3b: {
    id: 'litleo_skill3b',
    name: 'Blaze',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'fire',
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

  // --- floette --- original: shorten_debuffs all_allies, turn_start (team cleanse)
  // alt: recovery all_allies on_ally_death (emergency team heal)
  floette_skill3b: {
    id: 'floette_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Recovery for 2 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- florges --- original: strip all_enemies, turn_start (AoE strip)
  // alt: res_break on_attack (single-target offense debuff)
  florges_skill3b: {
    id: 'florges_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies RES Break for 2 turn(s) (25% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'res_break', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- skiddo --- original: spd_buff all_allies, battle_start (team speed)
  // alt: heal all_allies on_hit_received (team sustain)
  skiddo_skill3b: {
    id: 'skiddo_skill3b',
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

  // --- gogoat --- original: atb_boost 15% all_allies, on_ally_death (team speed, rare trigger)
  // alt: extend_buffs all_allies, turn_start (team buff sustain, frequent)
  gogoat_skill3b: {
    id: 'gogoat_skill3b',
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

  // --- pancham --- original: amplify 999 self, always (permanent damage buff)
  // alt: crit_rate_buff 999 self, always (permanent crit focus)
  pancham_skill3b: {
    id: 'pancham_skill3b',
    name: 'Guts',
    description: 'Passive: applies Crit Rate Buff for 999 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- pangoro --- original: atk_buff + spd_buff self, on_crit (self offense)
  // alt: def_break + expose on enemy, on_attack (debuff enemy instead)
  pangoro_skill3b: {
    id: 'pangoro_skill3b',
    name: 'Guts',
    description: 'Passive: applies DEF Break for 1 turn(s) (20% chance), applies Expose for 1 turn(s) (20% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_break', value: 0, duration: 1, chance: 20 },
      { id: 'expose', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- furfrou --- original: atk_buff self, on_kill (rare trigger)
  // alt: reflect self on_hit_received (defensive, frequent)
  furfrou_skill3b: {
    id: 'furfrou_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Reflect for 1 turn(s) (35% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 35, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- espurr --- original: sleep on_attack (CC debuff)
  // alt: nullify self on_hit_received (defensive anti-debuff)
  espurr_skill3b: {
    id: 'espurr_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Nullify for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- honedge --- original: glancing on_hit_received (defensive debuff)
  // alt: atk_buff self on_attack (offensive self-buff)
  honedge_skill3b: {
    id: 'honedge_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies ATK Buff for 1 turn(s) (30% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 1, chance: 30, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- doublade --- original: def_buff all_allies, battle_start (team defense)
  // alt: atk_break all_enemies, battle_start (enemy weaken instead)
  doublade_skill3b: {
    id: 'doublade_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies ATK Break for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_break', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- aegislash --- original: recovery all_allies, battle_start (team heal over time)
  // alt: immunity all_allies, turn_start with low chance (team debuff protection)
  aegislash_skill3b: {
    id: 'aegislash_skill3b',
    name: 'Heavy Metal',
    description: 'Passive: applies Immunity for 1 turn(s) (25% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'immunity', value: 0, duration: 1, chance: 25, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- spritzee --- original: recovery all_allies, battle_start (team heal over time)
  // alt: nullify all_allies, battle_start (team debuff immunity)
  spritzee_skill3b: {
    id: 'spritzee_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Nullify for 2 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- aromatisse --- original: atb_boost 15% all_allies, on_ally_death (team speed, rare)
  // alt: heal 5% all_allies, turn_start (steady team sustain)
  aromatisse_skill3b: {
    id: 'aromatisse_skill3b',
    name: 'Cute Charm',
    description: 'Passive: heals for 5% HP.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- swirlix --- original: absorb_atb on_attack (speed control)
  // alt: buff_block on_attack (anti-buff)
  swirlix_skill3b: {
    id: 'swirlix_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Buff Block for 1 turn(s) (20% chance).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'buff_block', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- slurpuff --- original: heal 5% all_allies, turn_start (team heal)
  // alt: shield all_allies on_ally_death (emergency team protection)
  slurpuff_skill3b: {
    id: 'slurpuff_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- inkay --- original: expose on_attack (debuff)
  // alt: confusion on_hit_received (CC on defense)
  inkay_skill3b: {
    id: 'inkay_skill3b',
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

  // --- malamar --- original: mark on_attack (single debuff)
  // alt: oblivion on_attack (different debuff identity)
  malamar_skill3b: {
    id: 'malamar_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Oblivion for 1 turn(s) (25% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- binacle --- original: nullify all_allies, battle_start (team debuff immunity)
  // alt: def_buff all_allies, battle_start (team physical defense)
  binacle_skill3b: {
    id: 'binacle_skill3b',
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

  // --- barbaracle --- original: atb_boost 15% all_allies, on_ally_death (rally, rare)
  // alt: heal 3% all_allies, turn_start (steady sustain)
  barbaracle_skill3b: {
    id: 'barbaracle_skill3b',
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

  // --- skrelp --- original: atb_reduce 10% on_attack (speed control)
  // alt: poison on_hit_received (DoT retaliation)
  skrelp_skill3b: {
    id: 'skrelp_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Poison for 2 turn(s) (30% chance).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'poison', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- dragalge --- original: bleed on_attack (DoT)
  // alt: def_break on_crit (armor shred on crit)
  dragalge_skill3b: {
    id: 'dragalge_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies DEF Break for 2 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- clauncher --- original: spd_buff all_allies, battle_start (team speed)
  // alt: immunity all_allies, battle_start (team debuff protection)
  clauncher_skill3b: {
    id: 'clauncher_skill3b',
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

  // --- clawitzer --- original: heal 15% self, on_ally_death (self sustain, rare)
  // alt: atb_boost all_allies, turn_start (team speed, frequent)
  clawitzer_skill3b: {
    id: 'clawitzer_skill3b',
    name: 'Torrent',
    description: 'Passive: boosts ATB by 8%.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 8, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- helioptile --- original: atb_boost 30% + cd_reduce self, on_kill (big reward, rare)
  // alt: paralysis on_attack (CC, frequent but weaker)
  helioptile_skill3b: {
    id: 'helioptile_skill3b',
    name: 'Static',
    description: 'Passive: applies Paralysis for 1 turn(s) (20% chance).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'paralysis', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- heliolisk --- original: acc_break on_attack (debuff)
  // alt: spd_buff + atb_boost self on_crit (speed burst)
  heliolisk_skill3b: {
    id: 'heliolisk_skill3b',
    name: 'Static',
    description: 'Passive: applies SPD Buff for 1 turn(s), boosts ATB by 15%.',
    type: 'electric',
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

  // --- tyrunt --- original: spd_buff all_allies, battle_start (team speed)
  // alt: atk_buff all_allies, battle_start (team offense)
  tyrunt_skill3b: {
    id: 'tyrunt_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- tyrantrum --- original: spd_buff all_allies, battle_start (team speed)
  // alt: res_buff all_allies, turn_start (sustained team resistance)
  tyrantrum_skill3b: {
    id: 'tyrantrum_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies RES Buff for 1 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'res_buff', value: 0, duration: 1, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- amaura --- original: detonate on_attack (burst DoTs)
  // alt: freeze on_hit_received (CC retaliation)
  amaura_skill3b: {
    id: 'amaura_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Freeze for 1 turn(s) (20% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'freeze', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- aurorus --- original: atk_buff + spd_buff self, on_crit (self offense)
  // alt: shield + def_buff all_allies at battle_start (team defense)
  aurorus_skill3b: {
    id: 'aurorus_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Shield for 2 turn(s), applies DEF Buff for 2 turn(s).',
    type: 'rock',
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

  // --- sylveon --- original: nullify all_allies, battle_start (anti-debuff)
  // alt: heal 3% + shorten_debuffs all_allies, turn_start (sustained cleanse)
  sylveon_skill3b: {
    id: 'sylveon_skill3b',
    name: 'Cute Charm',
    description: 'Passive: heals for 3% HP, shortens debuff durations by 1 turn.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shorten_debuffs', value: 1, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- hawlucha --- original: heal 15% + cleanse self, on_kill (self sustain, rare)
  // alt: crit_dmg_buff + amplify self on_crit (offense stacking)
  hawlucha_skill3b: {
    id: 'hawlucha_skill3b',
    name: 'Guts',
    description: 'Passive: applies Crit DMG Buff for 2 turn(s), applies Amplify for 1 turn(s).',
    type: 'fighting',
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

  // --- dedenne --- original: spd_buff all_allies, battle_start (team speed)
  // alt: cd_reduce all_allies, battle_start (team cooldown)
  dedenne_skill3b: {
    id: 'dedenne_skill3b',
    name: 'Static',
    description: 'Passive: reduces cooldowns by 1 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- carbink --- original: heal 3% all_allies, on_hit_received (team heal)
  // alt: reflect self on_hit_received (damage reflection)
  carbink_skill3b: {
    id: 'carbink_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Reflect for 1 turn(s) (40% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 40, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- goomy --- original: endure self, hp_threshold (survival)
  // alt: vampire self, hp_threshold (lifesteal at low HP)
  goomy_skill3b: {
    id: 'goomy_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Vampire for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- sliggoo --- original: steal_buff on_attack (buff steal)
  // alt: glancing on_hit_received (weakening attackers)
  sliggoo_skill3b: {
    id: 'sliggoo_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Glancing Hit for 2 turn(s) (25% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- goodra --- original: detonate on_attack (burst DoTs)
  // alt: atk_buff + crit_dmg_buff self on_kill (snowball offense)
  goodra_skill3b: {
    id: 'goodra_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit DMG Buff for 2 turn(s).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- klefki --- original: atb_reduce on_hit_received (speed control)
  // alt: provoke on_hit_received (force enemies to target)
  klefki_skill3b: {
    id: 'klefki_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Provoke for 1 turn(s) (30% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'provoke', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- phantump --- original: evasion self, battle_start (dodge)
  // alt: soul_protect self, hp_threshold (anti-death)
  phantump_skill3b: {
    id: 'phantump_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Soul Protect for 999 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'soul_protect', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- trevenant --- original: cleanse all_allies, turn_start (team cleanse)
  // alt: recovery all_allies, battle_start (team HoT)
  trevenant_skill3b: {
    id: 'trevenant_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Recovery for 2 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- bergmite --- original: atb_reduce on_hit_received (speed control)
  // alt: freeze on_hit_received (hard CC)
  bergmite_skill3b: {
    id: 'bergmite_skill3b',
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

  // --- avalugg --- original: revive on_ally_death (team revive, rare)
  // alt: heal 5% + shield all_allies, turn_start (steady team defense)
  avalugg_skill3b: {
    id: 'avalugg_skill3b',
    name: 'Ice Body',
    description: 'Passive: heals for 3% HP, applies Shield for 1 turn(s).',
    type: 'ice',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 8, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- noibat --- original: atb_boost 25% + spd_buff self, on_crit (self speed)
  // alt: atb_reduce on_attack (enemy speed control)
  noibat_skill3b: {
    id: 'noibat_skill3b',
    name: 'Keen Eye',
    description: 'Passive: reduces ATB by 10% (25% chance).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_reduce', value: 10, duration: 0, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- noivern --- original: atb_boost 30% + spd_buff self, hp_threshold (speed emergency)
  // alt: amplify + crit_rate_buff self, hp_threshold (damage burst emergency)
  noivern_skill3b: {
    id: 'noivern_skill3b',
    name: 'Keen Eye',
    description: 'Passive: applies Amplify for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'flying',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_rate_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 50 },
  },

  // --- xerneas --- original: heal 5% all_allies, turn_start (team heal)
  // alt: extend_buffs all_allies, turn_start (team buff duration)
  xerneas_skill3b: {
    id: 'xerneas_skill3b',
    name: 'Cute Charm',
    description: 'Passive: extends buff durations by 1 turn.',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'extend_buffs', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- yveltal --- original: mark on_attack (damage amplify debuff)
  // alt: bleed + poison on_attack (DoT focus)
  yveltal_skill3b: {
    id: 'yveltal_skill3b',
    name: 'Pressure',
    description: 'Passive: applies Bleed for 2 turn(s) (20% chance), applies Poison for 2 turn(s) (20% chance).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'bleed', value: 0, duration: 2, chance: 20 },
      { id: 'poison', value: 0, duration: 2, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- diancie --- original: res_buff all_allies, turn_start (team resistance)
  // alt: shield all_allies, on_hit_received (reactive team shield)
  diancie_skill3b: {
    id: 'diancie_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Shield for 1 turn(s) (30% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 10, duration: 1, chance: 30, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_hit_received',
  },

  // --- hoopa --- original: atb_reduce on_hit_received (speed control)
  // alt: silence on_hit_received (skill lockout)
  hoopa_skill3b: {
    id: 'hoopa_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Silence for 1 turn(s) (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- volcanion --- original: balance_hp on_hit_received (team HP equalize)
  // alt: burn on_hit_received (offensive retaliation)
  volcanion_skill3b: {
    id: 'volcanion_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s) (30% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'burn', value: 0, duration: 2, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },
};
