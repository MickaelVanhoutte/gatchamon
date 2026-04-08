import type { SkillDefinition } from '../../types/pokemon.js';

export const GEN7_SHINY_SKILLS: Record<string, SkillDefinition> = {

  // --- rowlet --- original: heal 3% all_allies, on_hit_received (team heal reactive)
  // alt: evasion self at battle_start (dodge-based defense)
  rowlet_skill3b: {
    id: 'rowlet_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Evasion for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 2, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- dartrix --- original: atb_reduce 10% on_attack (speed control)
  // alt: spd_buff self on_attack (self speed boost)
  dartrix_skill3b: {
    id: 'dartrix_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies SPD Buff for 1 turn(s) (25% chance).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- decidueye --- original: res_break on_attack (debuff)
  // alt: mark on_crit (damage amplify debuff, different trigger)
  decidueye_skill3b: {
    id: 'decidueye_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Mark for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'mark', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- litten --- original: heal 15% + cleanse self, on_kill (self sustain, rare)
  // alt: counter + reflect self, on_hit_received (frequent defensive)
  litten_skill3b: {
    id: 'litten_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Counter for 1 turn(s) (25% chance), applies Reflect for 1 turn(s) (25% chance).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'counter', value: 0, duration: 1, chance: 25, target: 'self' },
      { id: 'reflect', value: 0, duration: 1, chance: 25, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- torracat --- original: cd_reduce on_crit (cooldown management)
  // alt: atk_buff + crit_dmg_buff self on_kill (snowball offense)
  torracat_skill3b: {
    id: 'torracat_skill3b',
    name: 'Blaze',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit DMG Buff for 2 turn(s).',
    type: 'fire',
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

  // --- incineroar --- original: expose all_enemies, battle_start (AoE debuff)
  // alt: amplify 999 self, always (permanent self damage buff)
  incineroar_skill3b: {
    id: 'incineroar_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Amplify for 999 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- popplio --- original: recovery self, turn_start (self HoT)
  // alt: heal all_allies, turn_start (team heal instead of self)
  popplio_skill3b: {
    id: 'popplio_skill3b',
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

  // --- brionne --- original: cd_reduce on_crit (cooldown management)
  // alt: atb_boost all_allies on_kill (team speed, different trigger)
  brionne_skill3b: {
    id: 'brionne_skill3b',
    name: 'Torrent',
    description: 'Passive: boosts ATB by 20%.',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_kill',
  },

  // --- primarina --- original: spd_buff all_allies, battle_start (team speed)
  // alt: immunity all_allies, battle_start (team debuff protection)
  primarina_skill3b: {
    id: 'primarina_skill3b',
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

  // --- pikipek --- original: amplify 999, always (permanent self-buff)
  // alt: acc_buff 999, always (permanent accuracy)
  pikipek_skill3b: {
    id: 'pikipek_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ACC Buff for 999 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'acc_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- trumbeak --- original: acc_buff 999, always (permanent accuracy)
  // alt: amplify 999, always (permanent damage boost)
  trumbeak_skill3b: {
    id: 'trumbeak_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Amplify for 999 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'amplify', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- toucannon --- original: atb_reduce 10% on_attack (speed control)
  // alt: brand on_attack (sustained damage debuff)
  toucannon_skill3b: {
    id: 'toucannon_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Brand for 1 turn(s) (20% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'brand', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- yungoos --- original: amplify 999, always (permanent damage)
  // alt: crit_rate_buff 999, always (permanent crit)
  yungoos_skill3b: {
    id: 'yungoos_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Crit Rate Buff for 999 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_rate_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- gumshoos --- original: acc_buff 999, always (permanent accuracy)
  // alt: evasion 999, always (permanent dodge)
  gumshoos_skill3b: {
    id: 'gumshoos_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Evasion for 999 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'evasion', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- grubbin --- original: provoke on_hit_received (CC retaliation)
  // alt: heal self on_hit_received (sustain retaliation)
  grubbin_skill3b: {
    id: 'grubbin_skill3b',
    name: 'Swarm',
    description: 'Passive: heals for 5% HP.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 5, duration: 0, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- charjabug --- original: heal 15% self, on_ally_death (self heal, rare)
  // alt: shield all_allies on_ally_death (team protection, same trigger)
  charjabug_skill3b: {
    id: 'charjabug_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Shield for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'shield', value: 12, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- vikavolt --- original: atb_boost 10% all_allies, turn_start (team speed)
  // alt: acc_break on_attack (enemy debuff)
  vikavolt_skill3b: {
    id: 'vikavolt_skill3b',
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

  // --- crabrawler --- original: amplify 999, always (permanent damage)
  // alt: counter 999, always (permanent counter-attack)
  crabrawler_skill3b: {
    id: 'crabrawler_skill3b',
    name: 'Guts',
    description: 'Passive: applies Counter for 999 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'counter', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- crabominable --- original: amplify 999, always (permanent damage)
  // alt: vampire 999, always (permanent lifesteal)
  crabominable_skill3b: {
    id: 'crabominable_skill3b',
    name: 'Guts',
    description: 'Passive: applies Vampire for 999 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- oricorio_pau --- original: strip all_enemies, turn_start (AoE strip)
  // alt: silence on_attack (CC debuff)
  oricorio_pau_skill3b: {
    id: 'oricorio_pau_skill3b',
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

  // --- cutiefly --- original: atb_boost 15% self, on_attack (self speed)
  // alt: spd_buff all_allies, battle_start (team speed instead)
  cutiefly_skill3b: {
    id: 'cutiefly_skill3b',
    name: 'Swarm',
    description: 'Passive: applies SPD Buff for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- oricorio_sensu --- original: steal_buff on_attack (buff steal)
  // alt: oblivion on_attack (passive disable)
  oricorio_sensu_skill3b: {
    id: 'oricorio_sensu_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Oblivion for 1 turn(s) (20% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'oblivion', value: 0, duration: 1, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- ribombee --- original: spd_buff self, turn_start (self speed)
  // alt: heal all_allies, turn_start (team support)
  ribombee_skill3b: {
    id: 'ribombee_skill3b',
    name: 'Swarm',
    description: 'Passive: heals for 3% HP.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'heal', value: 3, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- rockruff --- original: cleanse all_allies, turn_start (team cleanse)
  // alt: def_buff all_allies, battle_start (team defense)
  rockruff_skill3b: {
    id: 'rockruff_skill3b',
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

  // --- mareanie --- original: atb_boost 25% + spd_buff self, on_crit (self speed)
  // alt: poison on_hit_received (retaliation DoT)
  mareanie_skill3b: {
    id: 'mareanie_skill3b',
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

  // --- toxapex --- original: spd_buff all_allies, battle_start (team speed)
  // alt: recovery all_allies, battle_start (team sustain)
  toxapex_skill3b: {
    id: 'toxapex_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Recovery for 2 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- mudbray --- original: threat + shield self, battle_start (tank identity)
  // alt: def_buff all_allies + endure self, on_ally_death (emergency tank)
  mudbray_skill3b: {
    id: 'mudbray_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies DEF Buff for 2 turn(s), applies Endure for 1 turn(s).',
    type: 'ground',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_ally_death',
  },

  // --- mudsdale --- original: def_buff all_allies, battle_start (team defense)
  // alt: counter + threat self, battle_start (tank + retaliation)
  mudsdale_skill3b: {
    id: 'mudsdale_skill3b',
    name: 'Arena Trap',
    description: 'Passive: applies Counter for 2 turn(s), applies Threat for 2 turn(s).',
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

  // --- dewpider --- original: anti_heal on_attack (heal prevention)
  // alt: glancing on_hit_received (damage reduction retaliation)
  dewpider_skill3b: {
    id: 'dewpider_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Glancing Hit for 1 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'glancing', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- araquanid --- original: def_buff + endure self, on_ally_death (defensive rally)
  // alt: heal + cleanse all_allies, on_ally_death (team support rally)
  araquanid_skill3b: {
    id: 'araquanid_skill3b',
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

  // --- fomantis --- original: atb_boost 10% all_allies, turn_start (team speed)
  // alt: recovery all_allies, turn_start (team HoT)
  fomantis_skill3b: {
    id: 'fomantis_skill3b',
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

  // --- lurantis --- original: extend_buffs all_allies, turn_start (buff sustain)
  // alt: shorten_debuffs all_allies, turn_start (debuff cleanse)
  lurantis_skill3b: {
    id: 'lurantis_skill3b',
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

  // --- morelull --- original: heal 15% self, on_ally_death (self sustain, rare)
  // alt: heal 3% all_allies, on_hit_received (team sustain, frequent)
  morelull_skill3b: {
    id: 'morelull_skill3b',
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

  // --- shiinotic --- original: spd_buff all_allies, battle_start (team speed)
  // alt: nullify all_allies, battle_start (team debuff immunity)
  shiinotic_skill3b: {
    id: 'shiinotic_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Nullify for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- salandit --- original: detonate on_attack (DoT burst)
  // alt: bomb on_crit (apply DoT on crit instead)
  salandit_skill3b: {
    id: 'salandit_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Bomb for 2 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 100 }],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- salazzle --- original: amplify 999, always (permanent damage)
  // alt: crit_dmg_buff 999, always (permanent crit damage)
  salazzle_skill3b: {
    id: 'salazzle_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Crit DMG Buff for 999 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'crit_dmg_buff', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- stufful --- original: skill_refresh self, on_kill (cooldown reset, rare)
  // alt: atk_buff + spd_buff self on_crit (offense, more frequent)
  stufful_skill3b: {
    id: 'stufful_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ATK Buff for 1 turn(s), applies SPD Buff for 1 turn(s).',
    type: 'normal',
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

  // --- bewear --- original: recovery self, turn_start (self HoT)
  // alt: endure self, hp_threshold (survival at low HP)
  bewear_skill3b: {
    id: 'bewear_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Endure for 2 turn(s), applies Vampire for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'endure', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'vampire', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 30 },
  },

  // --- bounsweet --- original: cleanse all_allies, turn_start (team cleanse)
  // alt: immunity all_allies, battle_start (prevent debuffs entirely)
  bounsweet_skill3b: {
    id: 'bounsweet_skill3b',
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

  // --- steenee --- original: atb_boost 10% all_allies, turn_start (team speed)
  // alt: extend_buffs all_allies, turn_start (team buff sustain)
  steenee_skill3b: {
    id: 'steenee_skill3b',
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

  // --- tsareena --- original: revive on_ally_death, cd 6 (resurrection)
  // alt: heal 5% + recovery all_allies, turn_start (prevention over cure)
  tsareena_skill3b: {
    id: 'tsareena_skill3b',
    name: 'Overgrow',
    description: 'Passive: heals for 5% HP, applies Recovery for 1 turn(s).',
    type: 'grass',
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

  // --- comfey --- original: revive on_ally_death, cd 6 (resurrection)
  // alt: soul_protect + shield all_allies, battle_start (death prevention)
  comfey_skill3b: {
    id: 'comfey_skill3b',
    name: 'Cute Charm',
    description: 'Passive: applies Soul Protect for 2 turn(s), applies Shield for 2 turn(s).',
    type: 'fairy',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'soul_protect', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- oranguru --- original: vampire self, hp_threshold (lifesteal at low HP)
  // alt: invincibility + recovery self, hp_threshold (full survival mode)
  oranguru_skill3b: {
    id: 'oranguru_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Invincibility for 1 turn(s), applies Recovery for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'invincibility', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 50 },
  },

  // --- passimian --- original: atk_buff + spd_buff self, on_crit (self offense)
  // alt: expose + bleed on_attack (enemy debuff, different trigger)
  passimian_skill3b: {
    id: 'passimian_skill3b',
    name: 'Guts',
    description: 'Passive: applies Expose for 1 turn(s) (20% chance), applies Bleed for 1 turn(s) (20% chance).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'expose', value: 0, duration: 1, chance: 20 },
      { id: 'bleed', value: 0, duration: 1, chance: 20 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- wimpod --- original: atk_break all_enemies, battle_start (enemy debuff)
  // alt: def_buff all_allies, battle_start (team buff instead)
  wimpod_skill3b: {
    id: 'wimpod_skill3b',
    name: 'Swarm',
    description: 'Passive: applies DEF Buff for 2 turn(s).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- golisopod --- original: heal 15% self, on_ally_death (self sustain, rare)
  // alt: shield + endure self, on_hit_received (frequent reactive defense)
  golisopod_skill3b: {
    id: 'golisopod_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Shield for 1 turn(s) (30% chance), applies Endure for 1 turn(s) (30% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 1, chance: 30, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 30, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- sandygast --- original: recovery self, turn_start (self HoT)
  // alt: reflect self, turn_start (damage reflection)
  sandygast_skill3b: {
    id: 'sandygast_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Reflect for 1 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 1, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'turn_start',
  },

  // --- palossand --- original: bomb all_enemies, battle_start (AoE DoT)
  // alt: strip all_enemies + silence on_attack (sustained debuff)
  palossand_skill3b: {
    id: 'palossand_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Seal for 1 turn(s) (25% chance).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'seal', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pyukumuku --- original: atb_boost 15% self, on_attack (self speed)
  // alt: heal 3% all_allies, turn_start (team sustain)
  pyukumuku_skill3b: {
    id: 'pyukumuku_skill3b',
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

  // --- typenull --- original: brand on_attack (DoT debuff)
  // alt: def_break on_attack (armor shred)
  typenull_skill3b: {
    id: 'typenull_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies DEF Break for 1 turn(s) (30% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'def_break', value: 0, duration: 1, chance: 30 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- silvally --- original: atk_buff self, on_kill (rare trigger)
  // alt: crit_rate_buff + amplify self, on_crit (more frequent offense)
  silvally_skill3b: {
    id: 'silvally_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Crit Rate Buff for 1 turn(s), applies Amplify for 1 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'crit_rate_buff', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'amplify', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- komala --- original: detonate on_attack (DoT burst)
  // alt: sleep on_hit_received (CC retaliation)
  komala_skill3b: {
    id: 'komala_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies Sleep for 1 turn(s) (15% chance).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'sleep', value: 0, duration: 1, chance: 15 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- turtonator --- original: recovery self, turn_start (self HoT)
  // alt: shield + counter self, battle_start (proactive tank)
  turtonator_skill3b: {
    id: 'turtonator_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Shield for 2 turn(s), applies Counter for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 15, duration: 2, chance: 100, target: 'self' },
      { id: 'counter', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'battle_start',
  },

  // --- togedemaru --- original: acc_buff 999, always (permanent accuracy)
  // alt: reflect 999, always (permanent damage reflection)
  togedemaru_skill3b: {
    id: 'togedemaru_skill3b',
    name: 'Static',
    description: 'Passive: applies Reflect for 999 turn(s).',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'reflect', value: 0, duration: 999, chance: 100, target: 'self' }],
    target: 'self',
    passiveTrigger: 'always',
  },

  // --- bruxish --- original: spd_slow on_attack (speed debuff)
  // alt: confusion on_attack (CC debuff instead)
  bruxish_skill3b: {
    id: 'bruxish_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Confusion for 1 turn(s) (25% chance).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'confusion', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- drampa --- original: atb_boost 20% self, on_crit (self speed)
  // alt: atk_buff all_allies on_ally_death (team rally)
  drampa_skill3b: {
    id: 'drampa_skill3b',
    name: 'Adaptability',
    description: 'Passive: applies ATK Buff for 2 turn(s).',
    type: 'normal',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- dhelmise --- original: atk_break all_enemies, battle_start (enemy debuff)
  // alt: spd_slow all_enemies, battle_start (different enemy debuff)
  dhelmise_skill3b: {
    id: 'dhelmise_skill3b',
    name: 'Levitate',
    description: 'Passive: applies Slow for 2 turn(s).',
    type: 'ghost',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'spd_slow', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- jangmoo --- original: detonate on_attack (DoT burst)
  // alt: bleed on_attack (apply DoT instead of burst)
  jangmoo_skill3b: {
    id: 'jangmoo_skill3b',
    name: 'Intimidate',
    description: 'Passive: applies Bleed for 2 turn(s) (25% chance).',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bleed', value: 0, duration: 2, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- hakamoo --- original: atb_reduce 10% on_attack (speed control)
  // alt: steal_buff on_attack (buff theft)
  hakamoo_skill3b: {
    id: 'hakamoo_skill3b',
    name: 'Intimidate',
    description: 'Passive: steals 1 buff(s) from the enemy.',
    type: 'dragon',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'steal_buff', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- kommoo --- original: endure self, hp_threshold (survival)
  // alt: atk_buff + crit_dmg_buff self, hp_threshold (offense at low HP)
  kommoo_skill3b: {
    id: 'kommoo_skill3b',
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
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- tapukoko --- original: extend_buffs all_allies, turn_start (buff sustain)
  // alt: cd_reduce all_allies, battle_start (team cooldown advantage)
  tapukoko_skill3b: {
    id: 'tapukoko_skill3b',
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

  // --- tapulele --- original: strip all_enemies, turn_start (AoE strip)
  // alt: silence on_hit_received (CC retaliation)
  tapulele_skill3b: {
    id: 'tapulele_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Silence for 1 turn(s) (25% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'silence', value: 0, duration: 1, chance: 25 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- tapubulu --- original: heal 3% all_allies, on_hit_received (team heal)
  // alt: shorten_debuffs all_allies, turn_start (team cleanse)
  tapubulu_skill3b: {
    id: 'tapubulu_skill3b',
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

  // --- tapufini --- original: recovery all_allies, battle_start (team HoT)
  // alt: nullify all_allies, battle_start (team debuff immunity)
  tapufini_skill3b: {
    id: 'tapufini_skill3b',
    name: 'Torrent',
    description: 'Passive: applies Nullify for 2 turn(s).',
    type: 'water',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'nullify', value: 0, duration: 2, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- cosmog --- original: atb_boost 25% + spd_buff self, on_crit (self speed)
  // alt: cd_reduce + skill_refresh self on_kill (cooldown mastery)
  cosmog_skill3b: {
    id: 'cosmog_skill3b',
    name: 'Inner Focus',
    description: 'Passive: reduces cooldowns by 1 turn(s), applies Skill Refresh for 1 turn(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
      { id: 'skill_refresh', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- cosmoem --- original: detonate on_attack (DoT burst)
  // alt: seal + buff_block on_attack (lockdown debuff)
  cosmoem_skill3b: {
    id: 'cosmoem_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies Seal for 1 turn(s) (15% chance), applies Buff Block for 1 turn(s) (15% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'seal', value: 0, duration: 1, chance: 15 },
      { id: 'buff_block', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- solgaleo --- original: seal on_attack (skill lock)
  // alt: atk_buff + crit_rate_buff self, battle_start (proactive offense)
  solgaleo_skill3b: {
    id: 'solgaleo_skill3b',
    name: 'Inner Focus',
    description: 'Passive: applies ATK Buff for 2 turn(s), applies Crit Rate Buff for 2 turn(s).',
    type: 'psychic',
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

  // --- lunala --- original: provoke on_hit_received (CC retaliation)
  // alt: strip + atb_reduce on_hit_received (control retaliation)
  lunala_skill3b: {
    id: 'lunala_skill3b',
    name: 'Inner Focus',
    description: 'Passive: strips 1 buff(s) (20% chance).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'strip', value: 1, duration: 0, chance: 20 }],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },

  // --- nihilego --- original: detonate on_attack (DoT burst)
  // alt: poison + bleed on_attack (apply DoTs)
  nihilego_skill3b: {
    id: 'nihilego_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Poison for 1 turn(s) (15% chance), applies Bleed for 1 turn(s) (15% chance).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'poison', value: 0, duration: 1, chance: 15 },
      { id: 'bleed', value: 0, duration: 1, chance: 15 },
    ],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- buzzwole --- original: atk_buff self, on_kill (offense reward, rare)
  // alt: vampire self on_attack (sustain via attacks, frequent)
  buzzwole_skill3b: {
    id: 'buzzwole_skill3b',
    name: 'Swarm',
    description: 'Passive: applies Vampire for 1 turn(s) (25% chance).',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'vampire', value: 0, duration: 1, chance: 25, target: 'self' }],
    target: 'self',
    passiveTrigger: 'on_attack',
  },

  // --- pheromosa --- original: skill_refresh self, on_kill (cooldown reset, rare)
  // alt: spd_buff + atb_boost self, on_kill (speed burst on kill)
  pheromosa_skill3b: {
    id: 'pheromosa_skill3b',
    name: 'Swarm',
    description: 'Passive: applies SPD Buff for 2 turn(s), boosts ATB by 30%.',
    type: 'bug',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'atb_boost', value: 30, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- xurkitree --- original: atb_reduce on_attack (speed control)
  // alt: paralysis on_attack (hard CC)
  xurkitree_skill3b: {
    id: 'xurkitree_skill3b',
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

  // --- celesteela --- original: threat + shield self, battle_start (proactive tank)
  // alt: def_buff + res_buff all_allies, battle_start (team defense)
  celesteela_skill3b: {
    id: 'celesteela_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies DEF Buff for 2 turn(s), applies RES Buff for 2 turn(s).',
    type: 'steel',
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

  // --- kartana --- original: endure self, hp_threshold (survival)
  // alt: amplify + crit_dmg_buff self, hp_threshold (offense at low HP)
  kartana_skill3b: {
    id: 'kartana_skill3b',
    name: 'Overgrow',
    description: 'Passive: applies Amplify for 2 turn(s), applies Crit DMG Buff for 2 turn(s).',
    type: 'grass',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'amplify', value: 0, duration: 2, chance: 100, target: 'self' },
      { id: 'crit_dmg_buff', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 33 },
  },

  // --- guzzlord --- original: heal 15% + cleanse self, on_kill (self sustain, rare)
  // alt: atb_boost 20% + atk_buff self on_crit (offense, more frequent)
  guzzlord_skill3b: {
    id: 'guzzlord_skill3b',
    name: 'Pressure',
    description: 'Passive: boosts ATB by 20%, applies ATK Buff for 1 turn(s).',
    type: 'dark',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' },
      { id: 'atk_buff', value: 0, duration: 1, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- necrozma --- original: shield all_allies, turn_start (team shield)
  // alt: cleanse all_allies, turn_start (team debuff removal)
  necrozma_skill3b: {
    id: 'necrozma_skill3b',
    name: 'Inner Focus',
    description: 'Passive: removes 1 debuff(s).',
    type: 'psychic',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'cleanse', value: 1, duration: 0, chance: 100, target: 'all_allies' }],
    target: 'all_allies',
    passiveTrigger: 'turn_start',
  },

  // --- magearna --- original: shorten_debuffs all_allies, turn_start (team cleanse)
  // alt: recovery + shield all_allies, battle_start (proactive team protection)
  magearna_skill3b: {
    id: 'magearna_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Recovery for 2 turn(s), applies Shield for 2 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'recovery', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'shield', value: 10, duration: 2, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- marshadow --- original: atb_boost 20% self, on_crit (self speed)
  // alt: skill_refresh + cd_reduce self on_kill (cooldown mastery)
  marshadow_skill3b: {
    id: 'marshadow_skill3b',
    name: 'Guts',
    description: 'Passive: applies Skill Refresh for 1 turn(s), reduces cooldowns by 1 turn(s).',
    type: 'fighting',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'skill_refresh', value: 0, duration: 1, chance: 100, target: 'self' },
      { id: 'cd_reduce', value: 1, duration: 0, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_kill',
  },

  // --- poipole --- original: strip all_enemies, turn_start (AoE buff removal)
  // alt: bomb all_enemies, battle_start (AoE DoT)
  poipole_skill3b: {
    id: 'poipole_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Bomb for 2 turn(s).',
    type: 'poison',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [{ id: 'bomb', value: 0, duration: 2, chance: 100, target: 'all_enemies' }],
    target: 'all_enemies',
    passiveTrigger: 'battle_start',
  },

  // --- naganadel --- original: crit_dmg_buff self, on_crit (crit stacking)
  // alt: amplify + atk_buff self on_kill (power spike on kill)
  naganadel_skill3b: {
    id: 'naganadel_skill3b',
    name: 'Poison Point',
    description: 'Passive: applies Amplify for 2 turn(s), applies ATK Buff for 2 turn(s).',
    type: 'poison',
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

  // --- stakataka --- original: invincibility + recovery self, hp_threshold (survival)
  // alt: soul_protect + endure self, hp_threshold (different survival)
  stakataka_skill3b: {
    id: 'stakataka_skill3b',
    name: 'Sand Stream',
    description: 'Passive: applies Soul Protect for 999 turn(s), applies Endure for 2 turn(s).',
    type: 'rock',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'soul_protect', value: 0, duration: 999, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 2, chance: 100, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'hp_threshold',
    passiveCondition: { hpBelow: 25 },
  },

  // --- blacephalon --- original: absorb_atb on_attack (speed steal)
  // alt: burn + brand on_crit (fire DoTs on crit)
  blacephalon_skill3b: {
    id: 'blacephalon_skill3b',
    name: 'Blaze',
    description: 'Passive: applies Burn for 2 turn(s), applies Brand for 2 turn(s).',
    type: 'fire',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'burn', value: 0, duration: 2, chance: 100 },
      { id: 'brand', value: 0, duration: 2, chance: 100 },
    ],
    target: 'self',
    passiveTrigger: 'on_crit',
  },

  // --- zeraora --- original: bomb all_enemies, battle_start (AoE DoT)
  // alt: spd_buff + atb_boost all_allies, battle_start (team speed)
  zeraora_skill3b: {
    id: 'zeraora_skill3b',
    name: 'Static',
    description: 'Passive: applies SPD Buff for 2 turn(s), boosts ATB by 20%.',
    type: 'electric',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' },
      { id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'battle_start',
  },

  // --- meltan --- original: def_buff + endure self, on_ally_death (defensive rally)
  // alt: shield + recovery all_allies, on_ally_death (team rally)
  meltan_skill3b: {
    id: 'meltan_skill3b',
    name: 'Sturdy',
    description: 'Passive: applies Shield for 1 turn(s), applies Recovery for 1 turn(s).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'shield', value: 10, duration: 1, chance: 100, target: 'all_allies' },
      { id: 'recovery', value: 0, duration: 1, chance: 100, target: 'all_allies' },
    ],
    target: 'all_allies',
    passiveTrigger: 'on_ally_death',
  },

  // --- melmetal --- original: balance_hp on_hit_received (HP equalize)
  // alt: endure + heal self on_hit_received (self-sustain)
  melmetal_skill3b: {
    id: 'melmetal_skill3b',
    name: 'Sturdy',
    description: 'Passive: heals for 3% HP, applies Endure for 1 turn(s) (20% chance).',
    type: 'steel',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: [
      { id: 'heal', value: 3, duration: 0, chance: 100, target: 'self' },
      { id: 'endure', value: 0, duration: 1, chance: 20, target: 'self' },
    ],
    target: 'self',
    passiveTrigger: 'on_hit_received',
  },
};
