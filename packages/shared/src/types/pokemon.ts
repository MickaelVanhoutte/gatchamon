export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'fairy' | 'dark' | 'steel';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDmg: number;
  acc: number;
  res: number;
}

export interface PokemonTemplate {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: BaseStats;
  naturalStars: 1 | 2 | 3 | 4 | 5;
  spriteUrl: string;
  skillIds: [string, string, string];
  height: number; // meters, from official Pokedex
  summonable?: boolean;
}

export interface PokemonInstance {
  instanceId: string;
  templateId: number;
  ownerId: string;
  level: number;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  exp: number;
  isShiny: boolean;
  skillLevels?: [number, number, number];
}

export type SkillTarget =
  | 'single_enemy' | 'all_enemies'
  | 'self' | 'single_ally' | 'all_allies';

export type SkillCategory = 'basic' | 'active' | 'passive';

// ---------------------------------------------------------------------------
// Effect IDs — Summoners War inspired + Pokemon status effects
// ---------------------------------------------------------------------------

// SW Buffs
export type BuffEffectId =
  | 'atk_buff'         // +50% ATK
  | 'def_buff'         // +70% DEF
  | 'spd_buff'         // +30% SPD
  | 'crit_rate_buff'   // +30% crit rate
  | 'immunity'         // Blocks all debuffs/status
  | 'invincibility'    // Takes 0 damage (incl DoT)
  | 'endure'           // HP cannot drop below 1
  | 'shield'           // Absorbs value damage
  | 'reflect'          // Returns 30% damage to attacker
  | 'counter'          // Auto basic-attack when hit
  | 'recovery'         // Heals 15% max HP per turn
  | 'vampire';         // Heals 20% of damage dealt

// SW Debuffs
export type DebuffEffectId =
  | 'atk_break'        // -50% ATK
  | 'def_break'        // -70% DEF
  | 'spd_slow'         // -30% SPD
  | 'glancing'         // +50% glance chance (30% less dmg, no crit, no debuff apply)
  | 'brand'            // Takes 25% more damage
  | 'unrecoverable'    // Cannot be healed
  | 'silence'          // Active skills locked, basic only
  | 'oblivion'         // Passive skills disabled
  | 'buff_block'       // Cannot receive buffs
  | 'provoke';         // Must attack provoker with basic

// Pokemon Status Effects (all debuffs)
export type StatusEffectId =
  | 'poison'           // 5% max HP DoT, stackable
  | 'burn'             // 3% max HP DoT + 3% ATK reduction per stack, stackable
  | 'freeze'           // Cannot act (full stun)
  | 'paralysis'        // 50% skip turn / 50% all CDs +1
  | 'confusion'        // 50% hits random ally (AOE: hits own team)
  | 'sleep';           // Cannot act + heals 10% max HP/turn

// Instant effects (resolved immediately, not persistent)
export type InstantEffectId =
  | 'heal'             // Restore value% max HP
  | 'atb_boost'        // Increase action gauge by value%
  | 'atb_reduce'       // Decrease target action gauge by value%
  | 'cd_reset'         // Reset all skill cooldowns
  | 'cd_reduce'        // Reduce cooldowns by value turns
  | 'cd_increase'      // Increase enemy cooldowns by value turns
  | 'strip'            // Remove value buffs from target
  | 'cleanse';         // Remove value debuffs from ally

export type EffectId = BuffEffectId | DebuffEffectId | StatusEffectId | InstantEffectId;

// Legacy support — old effect types map to new IDs in the engine
export type LegacyEffectType = 'buff' | 'debuff' | 'dot' | 'heal' | 'stun';

export interface SkillEffect {
  id?: EffectId;           // Effect identifier (new system) — optional for legacy compat
  value: number;           // Magnitude (% for heals/dots, flat for shield, count for strip)
  duration: number;        // Turns (0 for instant effects like heal/atb)
  chance: number;          // 0-100 innate proc chance
  target?: SkillTarget;    // Optional per-effect target override

  // Legacy fields — kept for backward compatibility with old skill data
  // The engine maps these to new EffectId when `id` is missing
  type?: LegacyEffectType;
  stat?: keyof BaseStats;
}

// Passive trigger system
export type PassiveTrigger =
  | 'battle_start'     // Applied once at start of battle
  | 'turn_start'       // Each of this mon's turns
  | 'on_attack'        // After this mon attacks
  | 'on_hit'           // When this mon takes damage
  | 'on_crit'          // When this mon lands a crit
  | 'on_kill'          // When this mon kills an enemy
  | 'on_ally_death'    // When an ally faints
  | 'hp_threshold'     // When HP drops below condition value%
  | 'always';          // Permanent aura (disabled by oblivion)

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  type: PokemonType;
  category: SkillCategory;
  cooldown: number;
  multiplier: number;
  effects: SkillEffect[];
  target: SkillTarget;
  passiveTrigger?: PassiveTrigger;
  passiveCondition?: {
    hpBelow?: number;     // HP threshold %
  };
}
