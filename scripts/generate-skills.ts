/**
 * Skill Generator Script
 *
 * Regenerates ALL pokemon skills using the new EffectId-based system.
 * Run with: npx tsx scripts/generate-skills.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Types (mirrored from pokemon.ts to avoid import issues with .js extensions)
// ---------------------------------------------------------------------------

type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'fairy' | 'dark' | 'steel';

interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDmg: number;
  acc: number;
  res: number;
}

interface PokemonTemplate {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: BaseStats;
  naturalStars: 1 | 2 | 3 | 4 | 5;
  spriteUrl: string;
  skillIds: [string, string, string];
  height: number;
  summonable?: boolean;
}

type SkillTarget = 'single_enemy' | 'all_enemies' | 'self' | 'single_ally' | 'all_allies';
type SkillCategory = 'basic' | 'active' | 'passive';

type BuffEffectId =
  | 'atk_buff' | 'def_buff' | 'spd_buff' | 'crit_rate_buff'
  | 'immunity' | 'invincibility' | 'endure' | 'shield'
  | 'reflect' | 'counter' | 'recovery' | 'vampire';

type DebuffEffectId =
  | 'atk_break' | 'def_break' | 'spd_slow' | 'glancing'
  | 'brand' | 'unrecoverable' | 'silence' | 'oblivion'
  | 'buff_block' | 'provoke';

type StatusEffectId =
  | 'poison' | 'burn' | 'freeze' | 'paralysis' | 'confusion' | 'sleep';

type InstantEffectId =
  | 'heal' | 'atb_boost' | 'atb_reduce' | 'cd_reset'
  | 'cd_reduce' | 'cd_increase' | 'strip' | 'cleanse';

type EffectId = BuffEffectId | DebuffEffectId | StatusEffectId | InstantEffectId;

type PassiveTrigger =
  | 'battle_start' | 'turn_start' | 'on_attack' | 'on_hit'
  | 'on_crit' | 'on_kill' | 'on_ally_death' | 'hp_threshold' | 'always';

interface SkillEffect {
  id: EffectId;
  value: number;
  duration: number;
  chance: number;
  target?: SkillTarget;
}

interface SkillDefinition {
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
  passiveCondition?: { hpBelow?: number };
}

// ---------------------------------------------------------------------------
// Role classification
// ---------------------------------------------------------------------------
type Role = 'attacker' | 'tank' | 'support' | 'debuffer' | 'speedster';

function classifyRole(stats: BaseStats, pokemonId: number, types: PokemonType[]): Role {
  // Stats in this game are very compressed (all scale together by star/level), so
  // pure stat-based role classification gives poor distribution. Instead we use a
  // hybrid approach: types provide a strong hint, stat deviations provide fine tuning,
  // and the pokemon ID breaks ties deterministically.

  // Type-based role affinity
  const typeRoleHint: Partial<Record<PokemonType, Role>> = {
    fighting: 'attacker', dragon: 'attacker', fire: 'attacker',
    rock: 'tank', steel: 'tank', ground: 'tank',
    fairy: 'support', grass: 'support', water: 'support',
    poison: 'debuffer', psychic: 'debuffer', ghost: 'debuffer', dark: 'debuffer',
    electric: 'speedster', flying: 'speedster', bug: 'speedster',
    ice: 'attacker', normal: 'attacker',
  };

  // Get hint from primary type
  const primaryHint = typeRoleHint[types[0]] || 'attacker';

  // Stat-based deviation: check if this pokemon deviates from its type hint
  // Use the stat ratio within the pokemon's own stats (not absolute values)
  const atkDef = stats.atk / stats.def; // typically 1.05-1.15
  const spdDef = stats.spd / stats.def; // typically 1.15-1.30

  // High relative speed -> potential speedster override
  if (spdDef > 1.28 && pokemonId % 3 === 0) return 'speedster';

  // High relative ATK -> potential attacker override
  if (atkDef > 1.12 && pokemonId % 4 === 0) return 'attacker';

  // Use secondary type to potentially shift role
  if (types.length > 1) {
    const secondaryHint = typeRoleHint[types[1]];
    if (secondaryHint && secondaryHint !== primaryHint) {
      // 40% chance to use secondary type's role (deterministic via ID)
      if (pokemonId % 5 >= 3) return secondaryHint;
    }
  }

  // Apply ID-based variety within the same primary hint
  // ~25% of pokemon get shuffled to a different role for variety
  if (pokemonId % 8 === 0) return 'tank';
  if (pokemonId % 8 === 1) return 'support';
  if (pokemonId % 8 === 7) return 'debuffer';

  return primaryHint;
}

// ---------------------------------------------------------------------------
// Type-specific effect pools
// ---------------------------------------------------------------------------
const TYPE_EFFECT_POOL: Record<PokemonType, EffectId[]> = {
  fire:     ['burn', 'atk_buff', 'brand'],
  water:    ['spd_slow', 'recovery', 'cleanse', 'heal'],
  grass:    ['poison', 'recovery', 'heal'],
  electric: ['paralysis', 'atb_boost', 'spd_buff'],
  ice:      ['freeze', 'spd_slow', 'atk_break'],
  fighting: ['def_break', 'counter', 'provoke'],
  poison:   ['poison', 'atk_break', 'unrecoverable'],
  ground:   ['def_break', 'freeze', 'brand'],
  flying:   ['spd_buff', 'atb_boost', 'glancing'],
  psychic:  ['confusion', 'silence', 'atb_reduce', 'cd_increase'],
  bug:      ['atk_break', 'glancing', 'buff_block'],
  rock:     ['def_buff', 'freeze', 'shield'],
  ghost:    ['oblivion', 'strip', 'confusion'],
  dragon:   ['atk_buff', 'brand', 'def_break'],
  fairy:    ['immunity', 'cleanse', 'heal'],
  dark:     ['strip', 'oblivion', 'silence'],
  steel:    ['def_buff', 'shield', 'immunity'],
  normal:   ['counter', 'endure', 'reflect'],
};

// ---------------------------------------------------------------------------
// Star-based scaling
// ---------------------------------------------------------------------------
interface StarScaling {
  basicChance: [number, number];    // [min, max] for basic skill effect chance
  activeCd: [number, number];       // cooldown range
  activeMult: [number, number];     // multiplier range
  activeChance: [number, number];   // effect chance for active
  duration: [number, number];       // duration range
  passiveChance: [number, number];  // passive trigger chance
  aoeChance: number;                // probability active is AOE (0-1)
}

const STAR_SCALING: Record<number, StarScaling> = {
  1: {
    basicChance: [15, 20],
    activeCd: [4, 4],
    activeMult: [1.8, 2.0],
    activeChance: [20, 30],
    duration: [1, 2],
    passiveChance: [15, 25],
    aoeChance: 0.05,
  },
  2: {
    basicChance: [18, 25],
    activeCd: [4, 4],
    activeMult: [1.9, 2.1],
    activeChance: [25, 35],
    duration: [1, 2],
    passiveChance: [20, 30],
    aoeChance: 0.1,
  },
  3: {
    basicChance: [25, 35],
    activeCd: [3, 4],
    activeMult: [2.0, 2.2],
    activeChance: [30, 45],
    duration: [2, 3],
    passiveChance: [25, 35],
    aoeChance: 0.2,
  },
  4: {
    basicChance: [30, 45],
    activeCd: [3, 4],
    activeMult: [2.1, 2.3],
    activeChance: [40, 55],
    duration: [2, 3],
    passiveChance: [30, 45],
    aoeChance: 0.35,
  },
  5: {
    basicChance: [40, 55],
    activeCd: [3, 4],
    activeMult: [2.2, 2.4],
    activeChance: [50, 70],
    duration: [2, 3],
    passiveChance: [40, 55],
    aoeChance: 0.5,
  },
};

// ---------------------------------------------------------------------------
// Seeded RNG for deterministic output per pokemon
// ---------------------------------------------------------------------------
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 16) / 32767;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randRange(min: number, max: number, rng: () => number): number {
  return Math.round((rng() * (max - min) + min) * 10) / 10;
}

/** Return an appropriate value for instant effects (which use value instead of duration). */
function instantValue(effectId: EffectId, rng: () => number, isBasic: boolean = false): number {
  switch (effectId) {
    case 'heal':       return isBasic ? randInt(5, 10, rng) : randInt(15, 25, rng);
    case 'atb_boost':  return isBasic ? randInt(10, 20, rng) : randInt(15, 30, rng);
    case 'atb_reduce': return isBasic ? randInt(10, 20, rng) : randInt(25, 50, rng);
    case 'strip':      return isBasic ? 1 : randInt(1, 2, rng);
    case 'cleanse':    return isBasic ? 1 : randInt(1, 2, rng);
    case 'cd_reset':   return 0; // resets all, value irrelevant
    case 'cd_reduce':  return 1;
    case 'cd_increase':return 1;
    default:           return 0;
  }
}

// ---------------------------------------------------------------------------
// Effect description helpers
// ---------------------------------------------------------------------------
const EFFECT_NAMES: Record<EffectId, string> = {
  atk_buff: 'ATK Buff', def_buff: 'DEF Buff', spd_buff: 'SPD Buff',
  crit_rate_buff: 'Crit Rate Buff', immunity: 'Immunity', invincibility: 'Invincibility',
  endure: 'Endure', shield: 'Shield', reflect: 'Reflect', counter: 'Counter',
  recovery: 'Recovery', vampire: 'Vampire',
  atk_break: 'ATK Break', def_break: 'DEF Break', spd_slow: 'Slow',
  glancing: 'Glancing Hit', brand: 'Brand', unrecoverable: 'Unrecoverable',
  silence: 'Silence', oblivion: 'Oblivion', buff_block: 'Buff Block', provoke: 'Provoke',
  poison: 'Poison', burn: 'Burn', freeze: 'Freeze', paralysis: 'Paralysis',
  confusion: 'Confusion', sleep: 'Sleep',
  heal: 'Heal', atb_boost: 'ATB Boost', atb_reduce: 'ATB Reduce',
  cd_reset: 'Cooldown Reset', cd_reduce: 'Cooldown Reduce',
  cd_increase: 'Cooldown Increase', strip: 'Strip', cleanse: 'Cleanse',
};

const INSTANT_EFFECTS: Set<EffectId> = new Set([
  'heal', 'atb_boost', 'atb_reduce', 'cd_reset', 'cd_reduce', 'cd_increase', 'strip', 'cleanse',
]);

const BUFF_EFFECTS: Set<EffectId> = new Set([
  'atk_buff', 'def_buff', 'spd_buff', 'crit_rate_buff', 'immunity', 'invincibility',
  'endure', 'shield', 'reflect', 'counter', 'recovery', 'vampire',
]);

const DEBUFF_EFFECTS: Set<EffectId> = new Set([
  'atk_break', 'def_break', 'spd_slow', 'glancing', 'brand', 'unrecoverable',
  'silence', 'oblivion', 'buff_block', 'provoke',
]);

const STATUS_EFFECTS: Set<EffectId> = new Set([
  'poison', 'burn', 'freeze', 'paralysis', 'confusion', 'sleep',
]);

function describeEffect(eff: SkillEffect): string {
  const name = EFFECT_NAMES[eff.id];
  if (INSTANT_EFFECTS.has(eff.id)) {
    if (eff.id === 'heal') return `heals for ${eff.value}% HP`;
    if (eff.id === 'atb_boost') return `boosts ATB by ${eff.value}%`;
    if (eff.id === 'atb_reduce') return `reduces ATB by ${eff.value}%`;
    if (eff.id === 'strip') return `strips ${eff.value} buff(s)`;
    if (eff.id === 'cleanse') return `removes ${eff.value} debuff(s)`;
    if (eff.id === 'cd_reset') return `resets all cooldowns`;
    if (eff.id === 'cd_reduce') return `reduces cooldowns by ${eff.value} turn(s)`;
    if (eff.id === 'cd_increase') return `increases cooldowns by ${eff.value} turn(s)`;
  }
  const dur = eff.duration > 0 ? ` for ${eff.duration} turn(s)` : '';
  const ch = eff.chance < 100 ? ` (${eff.chance}% chance)` : '';
  return `applies ${name}${dur}${ch}`;
}

function generateDescription(category: SkillCategory, typeName: PokemonType, effects: SkillEffect[], target: SkillTarget): string {
  const typeLabel = typeName.charAt(0).toUpperCase() + typeName.slice(1);
  if (category === 'basic') {
    if (effects.length === 0) return `A basic ${typeLabel}-type attack.`;
    const effDesc = effects.map(describeEffect).join(' and ');
    return `A basic ${typeLabel}-type attack that ${effDesc}.`;
  }
  if (category === 'active') {
    const parts: string[] = [];
    const targetLabel = target === 'all_enemies' ? 'all enemies'
      : target === 'all_allies' ? 'all allies'
      : target === 'self' ? 'self'
      : 'one enemy';
    parts.push(`Attacks ${targetLabel}`);
    if (effects.length > 0) {
      const effDescs = effects.map(describeEffect);
      parts.push(effDescs.join(', '));
    }
    return parts.join('. ') + '.';
  }
  // passive
  const effDescs = effects.map(describeEffect);
  return `Passive: ${effDescs.join(', ')}.`;
}

// ---------------------------------------------------------------------------
// Move name pools per type (used when no existing name is available)
// ---------------------------------------------------------------------------
const TYPE_MOVE_NAMES: Record<PokemonType, { basic: string[]; active: string[] }> = {
  fire: {
    basic: ['Ember', 'Fire Spin', 'Flame Charge', 'Incinerate', 'Fire Punch'],
    active: ['Flamethrower', 'Fire Blast', 'Overheat', 'Pyro Ball', 'Blue Flare', 'Sacred Fire', 'Fiery Dance'],
  },
  water: {
    basic: ['Water Gun', 'Bubble Beam', 'Aqua Jet', 'Waterfall', 'Bubble'],
    active: ['Hydro Pump', 'Surf', 'Scald', 'Origin Pulse', 'Hydro Cannon', 'Water Spout', 'Flip Turn'],
  },
  grass: {
    basic: ['Vine Whip', 'Razor Leaf', 'Leafage', 'Mega Drain', 'Absorb', 'Magical Leaf'],
    active: ['Solar Beam', 'Petal Blizzard', 'Petal Dance', 'Leaf Storm', 'Frenzy Plant'],
  },
  electric: {
    basic: ['Thunder Shock', 'Charge Beam', 'Nuzzle', 'Volt Switch', 'Electro Ball'],
    active: ['Thunderbolt', 'Thunder', 'Wild Charge', 'Zing Zap', 'Volt Tackle', 'Fusion Bolt'],
  },
  ice: {
    basic: ['Ice Shard', 'Icy Wind', 'Powder Snow', 'Ice Fang', 'Frost Breath'],
    active: ['Ice Beam', 'Blizzard', 'Freeze-Dry', 'Triple Axel', 'Icicle Spear', 'Glaciate'],
  },
  fighting: {
    basic: ['Mach Punch', 'Low Kick', 'Force Palm', 'Power-Up Punch', 'Karate Chop'],
    active: ['Aura Sphere', 'Close Combat', 'Dynamic Punch', 'Superpower', 'Sky Uppercut', 'Meteor Assault'],
  },
  poison: {
    basic: ['Poison Sting', 'Acid', 'Venoshock', 'Poison Fang', 'Cross Poison'],
    active: ['Sludge Bomb', 'Sludge Wave', 'Gunk Shot', 'Shell Side Arm', 'Noxious Torque', 'Malignant Chain'],
  },
  ground: {
    basic: ['Mud-Slap', 'Mud Shot', 'Sand Attack', 'Bone Club', 'Bulldoze'],
    active: ['Earthquake', 'Earth Power', 'Precipice Blades', 'Scorching Sands', 'High Horsepower', 'Thousand Arrows'],
  },
  flying: {
    basic: ['Gust', 'Peck', 'Wing Attack', 'Quick Attack', 'Aerial Ace'],
    active: ['Brave Bird', 'Air Slash', 'Sky Attack', 'Aeroblast', 'Drill Peck', 'Acrobatics', 'Oblivion Wing'],
  },
  psychic: {
    basic: ['Confusion', 'Psywave', 'Psybeam', 'Zen Headbutt', 'Extrasensory'],
    active: ['Psychic', 'Future Sight', 'Expanding Force', 'Photon Geyser', 'Luster Purge', 'Mist Ball'],
  },
  bug: {
    basic: ['Bug Bite', 'Fury Cutter', 'Struggle Bug', 'Fell Stinger', 'Pin Missile', 'Infestation'],
    active: ['Bug Buzz', 'U-Turn', 'Pollen Puff', 'Megahorn', 'X-Scissor', 'First Impression'],
  },
  rock: {
    basic: ['Rock Throw', 'Smack Down', 'Rollout', 'Accelerock', 'Rock Blast'],
    active: ['Stone Edge', 'Rock Slide', 'Diamond Storm', 'Rock Wrecker', 'Power Gem', 'Meteor Beam'],
  },
  ghost: {
    basic: ['Lick', 'Shadow Punch', 'Ominous Wind', 'Astonish', 'Shadow Sneak'],
    active: ['Shadow Ball', 'Phantom Force', 'Poltergeist', 'Spectral Thief', 'Moongeist Beam'],
  },
  dragon: {
    basic: ['Dragon Rage', 'Dragon Claw', 'Dragon Breath', 'Twister', 'Dragon Tail'],
    active: ['Dragon Pulse', 'Draco Meteor', 'Outrage', 'Dragon Energy', 'Spacial Rend', 'Roaring Moon'],
  },
  fairy: {
    basic: ['Draining Kiss', 'Play Rough', 'Fairy Wind', 'Disarming Voice', 'Sweet Kiss'],
    active: ['Moonblast', 'Dazzling Gleam', 'Nature\'s Madness', 'Strange Steam', 'Light of Ruin', 'Fleur Cannon'],
  },
  dark: {
    basic: ['Bite', 'Pursuit', 'Feint Attack', 'Snarl', 'Thief'],
    active: ['Dark Pulse', 'Crunch', 'Night Slash', 'Foul Play', 'Wicked Blow', 'Fiery Wrath'],
  },
  steel: {
    basic: ['Metal Claw', 'Bullet Punch', 'Iron Head', 'Gear Grind', 'Smart Strike'],
    active: ['Flash Cannon', 'Iron Tail', 'Heavy Slam', 'Meteor Mash', 'Doom Desire', 'Steel Beam'],
  },
  normal: {
    basic: ['Tackle', 'Scratch', 'Pound', 'Headbutt', 'Body Slam', 'Slam', 'Take Down', 'Slash', 'Quick Attack'],
    active: ['Return', 'Hyper Beam', 'Double-Edge', 'Last Resort', 'Facade', 'Mega Punch', 'Retaliate', 'Thrash', 'Crush Claw'],
  },
};

// Passive ability name pools by role
const PASSIVE_NAMES_BY_TYPE: Record<PokemonType, string[]> = {
  fire:     ['Blaze', 'Flash Fire', 'Flame Body', 'Magma Armor'],
  water:    ['Torrent', 'Rain Dish', 'Water Absorb', 'Swift Swim'],
  grass:    ['Overgrow', 'Chlorophyll', 'Leaf Guard', 'Grassy Surge'],
  electric: ['Static', 'Lightning Rod', 'Motor Drive', 'Volt Absorb'],
  ice:      ['Ice Body', 'Snow Warning', 'Refrigerate', 'Slush Rush'],
  fighting: ['Guts', 'Iron Fist', 'Steadfast', 'Inner Focus'],
  poison:   ['Poison Point', 'Corrosion', 'Merciless', 'Poison Touch'],
  ground:   ['Arena Trap', 'Sand Stream', 'Sand Force', 'Sand Veil'],
  flying:   ['Gale Wings', 'Aerilate', 'Wind Rider', 'Big Pecks'],
  psychic:  ['Inner Focus', 'Synchronize', 'Magic Guard', 'Psychic Surge'],
  bug:      ['Swarm', 'Compound Eyes', 'Tinted Lens', 'Shield Dust'],
  rock:     ['Sand Stream', 'Solid Rock', 'Sturdy', 'Rough Skin'],
  ghost:    ['Levitate', 'Cursed Body', 'Shadow Tag', 'Perish Body'],
  dragon:   ['Intimidate', 'Multiscale', 'Marvel Scale', 'Dragon Scale'],
  fairy:    ['Cute Charm', 'Pixilate', 'Fairy Aura', 'Misty Surge'],
  dark:     ['Dark Aura', 'Moxie', 'Justified', 'Prankster'],
  steel:    ['Sturdy', 'Clear Body', 'Iron Barbs', 'Heavy Metal'],
  normal:   ['Adaptability', 'Fur Coat', 'Scrappy', 'Normalize'],
};

// ---------------------------------------------------------------------------
// Read existing skill files to extract current move names
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const skillsDir = path.join(projectRoot, 'packages/shared/src/data/skills');
const pokedexDir = path.join(projectRoot, 'packages/shared/src/data/pokedex');

interface ExistingNames {
  skill1Name?: string;
  skill2Name?: string;
  skill3Name?: string;
}

function extractExistingNames(): Map<string, ExistingNames> {
  const map = new Map<string, ExistingNames>();

  const skillFiles = [
    'gen1.ts', 'gen2.ts', 'gen3.ts', 'gen4.ts', 'gen5.ts',
    'gen6.ts', 'gen7.ts', 'gen8.ts', 'gen9.ts', 'forms.ts',
  ];

  for (const file of skillFiles) {
    // Read from git HEAD to avoid reading already-overwritten files
    const gitPath = `packages/shared/src/data/skills/${file}`;
    let content: string;
    try {
      const { execSync } = require('child_process');
      content = execSync(`git show HEAD:${gitPath}`, { encoding: 'utf-8', cwd: projectRoot });
    } catch {
      // Fall back to reading file if git fails
      const filePath = path.join(skillsDir, file);
      if (!fs.existsSync(filePath)) continue;
      content = fs.readFileSync(filePath, 'utf-8');
    }

    // Match patterns like:  somekey_skill1: { ... name: 'Foo', ... }
    // Use a simpler line-based extraction to handle edge cases
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match skill key lines like: bulbasaur_skill1: {
      const keyMatch = line.match(/^\s+(\w+)_skill([123]):\s*\{/);
      if (!keyMatch) continue;

      const baseKey = keyMatch[1];
      const skillNum = keyMatch[2];

      // Look ahead for the name line (usually 2 lines ahead)
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nameMatch = lines[j].match(/^\s+name:\s*'((?:[^'\\]|\\.)*)'/);
        if (nameMatch) {
          let name = nameMatch[1].replace(/\\'/g, "'"); // unescape
          // Validate: name should be reasonable (not corrupted)
          if (name.length < 2 || name.includes('\n') || name.endsWith('\\')) break;

          if (!map.has(baseKey)) map.set(baseKey, {});
          const entry = map.get(baseKey)!;
          if (skillNum === '1') entry.skill1Name = name;
          else if (skillNum === '2') entry.skill2Name = name;
          else if (skillNum === '3') entry.skill3Name = name;
          break;
        }
      }
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Read pokedex data
// ---------------------------------------------------------------------------
function extractPokemonFromFile(filePath: string): PokemonTemplate[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const templates: PokemonTemplate[] = [];

  // Match each object block in the array
  // We parse the file as JS since it's close enough to JSON
  const arrayMatch = content.match(/\[\s*([\s\S]*)\s*\];/);
  if (!arrayMatch) return templates;

  // Use a Function constructor to parse the array data
  // We need to be careful - just extract the data we need with regex
  const blockRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*types:\s*\[([^\]]*)\],\s*naturalStars:\s*(\d+),\s*spriteUrl:\s*'[^']*',\s*skillIds:\s*\['([^']+)',\s*'([^']+)',\s*'([^']+)'\],\s*height:\s*[\d.]+,\s*(?:summonable:\s*(?:true|false),\s*)?baseStats:\s*\{([^}]+)\}/g;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(content)) !== null) {
    const id = parseInt(match[1]);
    const name = match[2];
    const typesStr = match[3];
    const naturalStars = parseInt(match[4]) as 1|2|3|4|5;
    const skillId1 = match[5];
    const skillId2 = match[6];
    const skillId3 = match[7];
    const statsStr = match[8];

    // Parse types
    const types = typesStr.match(/'([^']+)'/g)?.map(t => t.replace(/'/g, '')) as PokemonType[] || [];

    // Parse stats
    const statMap: Record<string, number> = {};
    const statRegex = /(\w+):\s*([\d.]+)/g;
    let sm: RegExpExecArray | null;
    while ((sm = statRegex.exec(statsStr)) !== null) {
      statMap[sm[1]] = parseFloat(sm[2]);
    }

    templates.push({
      id,
      name,
      types,
      naturalStars,
      spriteUrl: '',
      skillIds: [skillId1, skillId2, skillId3],
      height: 0,
      baseStats: {
        hp: statMap.hp || 500,
        atk: statMap.atk || 80,
        def: statMap.def || 80,
        spd: statMap.spd || 100,
        critRate: statMap.critRate || 15,
        critDmg: statMap.critDmg || 150,
        acc: statMap.acc || 85,
        res: statMap.res || 15,
      },
    });
  }

  return templates;
}

// ---------------------------------------------------------------------------
// Skill generation
// ---------------------------------------------------------------------------

function getSkillKeyPrefix(skillId: string): string {
  // "bulbasaur_skill1" -> "bulbasaur"
  return skillId.replace(/_skill[123]$/, '');
}

function isOffensiveDebuff(id: EffectId): boolean {
  return DEBUFF_EFFECTS.has(id) || STATUS_EFFECTS.has(id);
}

function isSelfBuff(id: EffectId): boolean {
  return BUFF_EFFECTS.has(id);
}

function isHealEffect(id: EffectId): boolean {
  return id === 'heal' || id === 'recovery' || id === 'cleanse';
}

function generateSkillsForPokemon(
  poke: PokemonTemplate,
  existingNames: Map<string, ExistingNames>,
  rng: () => number,
): SkillDefinition[] {
  const role = classifyRole(poke.baseStats, poke.id, poke.types);
  const stars = poke.naturalStars;
  const scaling = STAR_SCALING[stars];
  const primaryType = poke.types[0];
  const secondaryType = poke.types.length > 1 ? poke.types[1] : primaryType;
  const pool = TYPE_EFFECT_POOL[primaryType];
  const pool2 = TYPE_EFFECT_POOL[secondaryType];
  const keyPrefix = getSkillKeyPrefix(poke.skillIds[0]);
  const existing = existingNames.get(keyPrefix) || {};

  // ---------- SKILL 1: BASIC ----------
  const skill1Type = primaryType;
  const basicEffect = pick(pool, rng);
  const basicChance = randInt(scaling.basicChance[0], scaling.basicChance[1], rng);
  const basicDuration = INSTANT_EFFECTS.has(basicEffect) ? 0 : randInt(1, 2, rng);
  const basicValue = INSTANT_EFFECTS.has(basicEffect) ? instantValue(basicEffect, rng, true) : 0;

  // For support role basics, sometimes target self with buff
  let basicTarget: SkillTarget = 'single_enemy';
  let basicEffects: SkillEffect[] = [{
    id: basicEffect,
    value: basicValue,
    duration: basicDuration,
    chance: basicChance,
  }];

  if (role === 'support' && isSelfBuff(basicEffect)) {
    basicEffects[0].target = 'self';
  }

  const basicName = existing.skill1Name || pick(TYPE_MOVE_NAMES[skill1Type].basic, rng);

  const skill1: SkillDefinition = {
    id: poke.skillIds[0],
    name: basicName,
    description: '',
    type: skill1Type,
    category: 'basic',
    cooldown: 0,
    multiplier: 1.0,
    effects: basicEffects,
    target: basicTarget,
  };
  skill1.description = generateDescription('basic', skill1Type, skill1.effects, skill1.target);

  // ---------- SKILL 2: ACTIVE ----------
  const skill2Type = secondaryType;
  const cd = randInt(scaling.activeCd[0], scaling.activeCd[1], rng);
  const mult = randRange(scaling.activeMult[0], scaling.activeMult[1], rng);
  const isAoe = rng() < scaling.aoeChance;

  let activeTarget: SkillTarget;
  let activeEffects: SkillEffect[] = [];
  let activeMult = mult;

  switch (role) {
    case 'attacker': {
      activeTarget = isAoe ? 'all_enemies' : 'single_enemy';
      // Offensive debuff OR self-buff
      if (rng() > 0.4) {
        // Offensive debuff
        const offEffect = pick(pool2.filter(e => isOffensiveDebuff(e)) || [pool2[0]], rng) || pool2[0];
        const ch = randInt(scaling.activeChance[0], scaling.activeChance[1], rng);
        const dur = INSTANT_EFFECTS.has(offEffect) ? 0 : randInt(scaling.duration[0], scaling.duration[1], rng);
        const val = INSTANT_EFFECTS.has(offEffect) ? instantValue(offEffect, rng) : 0;
        activeEffects.push({ id: offEffect, value: val, duration: dur, chance: ch });
      } else {
        // Self-buff
        const selfBuff = pick(['atk_buff', 'crit_rate_buff'] as EffectId[], rng);
        const dur = randInt(scaling.duration[0], scaling.duration[1], rng);
        activeEffects.push({ id: selfBuff, value: 0, duration: dur, chance: 100, target: 'self' });
      }
      // High-star attackers may get a second effect
      if (stars >= 4 && rng() > 0.4) {
        const extra = pick(pool.filter(e => e !== activeEffects[0].id), rng) || pool[0];
        const ch = randInt(scaling.activeChance[0] - 10, scaling.activeChance[1] - 10, rng);
        const dur = INSTANT_EFFECTS.has(extra) ? 0 : randInt(1, 2, rng);
        const val = INSTANT_EFFECTS.has(extra) ? instantValue(extra, rng) : 0;
        activeEffects.push({ id: extra, value: val, duration: dur, chance: Math.max(15, ch) });
      }
      break;
    }
    case 'tank': {
      activeTarget = isAoe ? 'all_enemies' : 'single_enemy';
      activeMult = Math.round((mult * 0.85) * 10) / 10;
      if (rng() > 0.5) {
        // Team buff
        const teamBuff = pick(['def_buff', 'shield'] as EffectId[], rng);
        const dur = randInt(scaling.duration[0], scaling.duration[1], rng);
        const val = teamBuff === 'shield' ? randInt(15, 25, rng) : 0;
        activeEffects.push({ id: teamBuff, value: val, duration: dur, chance: 100, target: 'all_allies' });
      } else {
        // Enemy debuff
        const debuff = pick(['provoke', 'atk_break'] as EffectId[], rng);
        const dur = randInt(scaling.duration[0], scaling.duration[1], rng);
        activeEffects.push({ id: debuff, value: 0, duration: dur, chance: randInt(scaling.activeChance[0], scaling.activeChance[1], rng) });
      }
      break;
    }
    case 'support': {
      activeMult = Math.round((mult * 0.6) * 10) / 10;
      activeTarget = 'all_allies';
      // Heal + buff or cleanse
      activeEffects.push({ id: 'heal', value: randInt(15, 25, rng), duration: 0, chance: 100, target: 'all_allies' });
      const supportExtra = pick(['cleanse', 'spd_buff', 'recovery', 'immunity'] as EffectId[], rng);
      if (supportExtra === 'cleanse') {
        activeEffects.push({ id: 'cleanse', value: randInt(1, 2, rng), duration: 0, chance: 100, target: 'all_allies' });
      } else {
        const dur = randInt(scaling.duration[0], scaling.duration[1], rng);
        activeEffects.push({ id: supportExtra, value: 0, duration: dur, chance: 100, target: 'all_allies' });
      }
      break;
    }
    case 'debuffer': {
      activeTarget = isAoe ? 'all_enemies' : 'single_enemy';
      activeMult = Math.round((mult * 0.8) * 10) / 10;
      // 2 debuffs
      const debuff1 = pick(pool.filter(e => isOffensiveDebuff(e)) || [pool[0]], rng) || pool[0];
      const ch1 = randInt(scaling.activeChance[0], scaling.activeChance[1], rng);
      const dur1 = INSTANT_EFFECTS.has(debuff1) ? 0 : randInt(scaling.duration[0], scaling.duration[1], rng);
      const val1 = INSTANT_EFFECTS.has(debuff1) ? instantValue(debuff1, rng) : 0;
      activeEffects.push({ id: debuff1, value: val1, duration: dur1, chance: ch1 });

      const remaining = pool2.filter(e => isOffensiveDebuff(e) && e !== debuff1);
      const debuff2 = remaining.length > 0 ? pick(remaining, rng) : pick(pool2, rng);
      const ch2 = Math.max(15, randInt(scaling.activeChance[0] - 10, scaling.activeChance[1] - 10, rng));
      const dur2 = INSTANT_EFFECTS.has(debuff2) ? 0 : randInt(scaling.duration[0], scaling.duration[1], rng);
      const val2 = INSTANT_EFFECTS.has(debuff2) ? instantValue(debuff2, rng) : 0;
      activeEffects.push({ id: debuff2, value: val2, duration: dur2, chance: ch2 });
      break;
    }
    case 'speedster': {
      activeTarget = isAoe ? 'all_enemies' : 'single_enemy';
      // ATB reduce + self atb boost
      const reduceChance = randInt(scaling.activeChance[0], scaling.activeChance[1], rng);
      activeEffects.push({ id: 'atb_reduce', value: randInt(25, 50, rng), duration: 0, chance: reduceChance });
      activeEffects.push({ id: 'atb_boost', value: randInt(15, 30, rng), duration: 0, chance: 100, target: 'self' });
      break;
    }
  }

  const activeName = existing.skill2Name || pick(TYPE_MOVE_NAMES[skill2Type].active, rng);

  const skill2: SkillDefinition = {
    id: poke.skillIds[1],
    name: activeName,
    description: '',
    type: skill2Type,
    category: 'active',
    cooldown: cd,
    multiplier: activeMult,
    effects: activeEffects,
    target: activeTarget,
  };
  skill2.description = generateDescription('active', skill2Type, skill2.effects, skill2.target);

  // ---------- SKILL 3: PASSIVE ----------
  let passiveTrigger: PassiveTrigger;
  let passiveEffects: SkillEffect[] = [];
  let passiveTarget: SkillTarget = 'self';
  let passiveCondition: { hpBelow?: number } | undefined;

  switch (role) {
    case 'attacker': {
      const r = rng();
      if (r < 0.4) {
        // on_attack: apply type debuff
        passiveTrigger = 'on_attack';
        const debuff = pick(pool.filter(e => isOffensiveDebuff(e)) || [pool[0]], rng) || pool[0];
        const ch = randInt(scaling.passiveChance[0], scaling.passiveChance[1], rng);
        const dur = INSTANT_EFFECTS.has(debuff) ? 0 : randInt(1, 2, rng);
        const val = INSTANT_EFFECTS.has(debuff) ? instantValue(debuff, rng) : 0;
        passiveEffects.push({ id: debuff, value: val, duration: dur, chance: ch });
      } else if (r < 0.7) {
        // on_crit: atb_boost self
        passiveTrigger = 'on_crit';
        passiveEffects.push({ id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' });
      } else {
        // on_kill: atk_buff self
        passiveTrigger = 'on_kill';
        passiveEffects.push({ id: 'atk_buff', value: 0, duration: 2, chance: 100, target: 'self' });
      }
      break;
    }
    case 'tank': {
      const r = rng();
      if (r < 0.35) {
        // on_hit: counter
        passiveTrigger = 'on_hit';
        const ch = randInt(scaling.passiveChance[0], scaling.passiveChance[1], rng);
        passiveEffects.push({ id: 'counter', value: 0, duration: 1, chance: ch, target: 'self' });
      } else if (r < 0.65) {
        // hp_threshold: endure
        passiveTrigger = 'hp_threshold';
        passiveCondition = { hpBelow: 33 };
        passiveEffects.push({ id: 'endure', value: 0, duration: 1, chance: 100, target: 'self' });
      } else {
        // battle_start: def_buff all_allies
        passiveTrigger = 'battle_start';
        passiveTarget = 'all_allies';
        passiveEffects.push({ id: 'def_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' });
      }
      break;
    }
    case 'support': {
      const r = rng();
      if (r < 0.35) {
        // turn_start: heal all allies
        passiveTrigger = 'turn_start';
        passiveTarget = 'all_allies';
        passiveEffects.push({ id: 'heal', value: 5, duration: 0, chance: 100, target: 'all_allies' });
      } else if (r < 0.65) {
        // battle_start: spd_buff all_allies
        passiveTrigger = 'battle_start';
        passiveTarget = 'all_allies';
        passiveEffects.push({ id: 'spd_buff', value: 0, duration: 2, chance: 100, target: 'all_allies' });
      } else {
        // on_ally_death: heal self
        passiveTrigger = 'on_ally_death';
        passiveEffects.push({ id: 'heal', value: 15, duration: 0, chance: 100, target: 'self' });
      }
      break;
    }
    case 'debuffer': {
      const r = rng();
      if (r < 0.5) {
        // on_attack: extra debuff from type pool
        passiveTrigger = 'on_attack';
        const debuff = pick(pool.filter(e => isOffensiveDebuff(e)) || [pool[0]], rng) || pool[0];
        const ch = randInt(15, 25, rng);
        const dur = INSTANT_EFFECTS.has(debuff) ? 0 : randInt(1, 2, rng);
        const val = INSTANT_EFFECTS.has(debuff) ? instantValue(debuff, rng) : 0;
        passiveEffects.push({ id: debuff, value: val, duration: dur, chance: ch });
      } else {
        // battle_start: atk_break all enemies
        passiveTrigger = 'battle_start';
        passiveTarget = 'all_enemies';
        passiveEffects.push({ id: 'atk_break', value: 0, duration: 2, chance: 100, target: 'all_enemies' });
      }
      break;
    }
    case 'speedster': {
      const r = rng();
      if (r < 0.5) {
        // battle_start: atb_boost self
        passiveTrigger = 'battle_start';
        passiveEffects.push({ id: 'atb_boost', value: 20, duration: 0, chance: 100, target: 'self' });
      } else {
        // on_attack: atb_boost self
        passiveTrigger = 'on_attack';
        passiveEffects.push({ id: 'atb_boost', value: 15, duration: 0, chance: randInt(10, 20, rng), target: 'self' });
      }
      break;
    }
  }

  const passiveName = existing.skill3Name || pick(PASSIVE_NAMES_BY_TYPE[primaryType], rng);

  const skill3: SkillDefinition = {
    id: poke.skillIds[2],
    name: passiveName,
    description: '',
    type: primaryType,
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: passiveEffects,
    target: passiveTarget,
    passiveTrigger,
  };
  if (passiveCondition) skill3.passiveCondition = passiveCondition;
  skill3.description = generateDescription('passive', primaryType, skill3.effects, skill3.target);

  return [skill1, skill2, skill3];
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

function serializeEffect(eff: SkillEffect): string {
  const parts: string[] = [
    `id: '${eff.id}'`,
    `value: ${eff.value}`,
    `duration: ${eff.duration}`,
    `chance: ${eff.chance}`,
  ];
  if (eff.target) {
    parts.push(`target: '${eff.target}'`);
  }
  return `{ ${parts.join(', ')} }`;
}

function serializeSkill(skill: SkillDefinition, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}${skill.id}: {`);
  lines.push(`${indent}  id: '${skill.id}',`);
  lines.push(`${indent}  name: '${skill.name.replace(/'/g, "\\'")}',`);
  lines.push(`${indent}  description: '${skill.description.replace(/'/g, "\\'")}',`);
  lines.push(`${indent}  type: '${skill.type}',`);
  lines.push(`${indent}  category: '${skill.category}',`);
  lines.push(`${indent}  cooldown: ${skill.cooldown},`);
  lines.push(`${indent}  multiplier: ${skill.multiplier},`);

  if (skill.effects.length === 0) {
    lines.push(`${indent}  effects: [],`);
  } else if (skill.effects.length === 1) {
    lines.push(`${indent}  effects: [${serializeEffect(skill.effects[0])}],`);
  } else {
    lines.push(`${indent}  effects: [`);
    for (const eff of skill.effects) {
      lines.push(`${indent}    ${serializeEffect(eff)},`);
    }
    lines.push(`${indent}  ],`);
  }

  lines.push(`${indent}  target: '${skill.target}',`);

  if (skill.passiveTrigger) {
    lines.push(`${indent}  passiveTrigger: '${skill.passiveTrigger}',`);
  }
  if (skill.passiveCondition) {
    const cond = skill.passiveCondition;
    const condParts: string[] = [];
    if (cond.hpBelow !== undefined) condParts.push(`hpBelow: ${cond.hpBelow}`);
    lines.push(`${indent}  passiveCondition: { ${condParts.join(', ')} },`);
  }

  lines.push(`${indent}},`);
  return lines.join('\n');
}

function generateFileContent(
  constName: string,
  pokemons: PokemonTemplate[],
  allSkills: Map<string, SkillDefinition[]>,
): string {
  const lines: string[] = [];
  lines.push("import type { SkillDefinition } from '../../types/pokemon.js';");
  lines.push('');
  lines.push(`export const ${constName}: Record<string, SkillDefinition> = {`);

  for (const poke of pokemons) {
    const skills = allSkills.get(poke.skillIds[0]);
    if (!skills) continue;

    const keyPrefix = getSkillKeyPrefix(poke.skillIds[0]);
    const typesStr = poke.types.join('/');
    lines.push('');
    lines.push(`  // --- ${keyPrefix} (${typesStr}) ---`);
    for (const skill of skills) {
      lines.push(serializeSkill(skill, '  '));
    }
  }

  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Extracting existing move names...');
  const existingNames = extractExistingNames();
  console.log(`Found names for ${existingNames.size} pokemon.`);

  // Load all pokedex data
  const genFiles: { file: string; constName: string; skillConst: string }[] = [
    { file: 'gen1.ts', constName: 'GEN1', skillConst: 'GEN1_SKILLS' },
    { file: 'gen2.ts', constName: 'GEN2', skillConst: 'GEN2_SKILLS' },
    { file: 'gen3.ts', constName: 'GEN3', skillConst: 'GEN3_SKILLS' },
    { file: 'gen4.ts', constName: 'GEN4', skillConst: 'GEN4_SKILLS' },
    { file: 'gen5.ts', constName: 'GEN5', skillConst: 'GEN5_SKILLS' },
    { file: 'gen6.ts', constName: 'GEN6', skillConst: 'GEN6_SKILLS' },
    { file: 'gen7.ts', constName: 'GEN7', skillConst: 'GEN7_SKILLS' },
    { file: 'gen8.ts', constName: 'GEN8', skillConst: 'GEN8_SKILLS' },
    { file: 'gen9.ts', constName: 'GEN9', skillConst: 'GEN9_SKILLS' },
    { file: 'forms.ts', constName: 'FORMS', skillConst: 'FORMS_SKILLS' },
  ];

  let totalPokemon = 0;
  let totalSkills = 0;

  for (const gen of genFiles) {
    const pokedexFile = path.join(pokedexDir, gen.file);
    console.log(`\nProcessing ${gen.file}...`);

    const pokemons = extractPokemonFromFile(pokedexFile);
    console.log(`  Found ${pokemons.length} pokemon in ${gen.file}`);

    if (pokemons.length === 0) {
      console.warn(`  WARNING: No pokemon found in ${gen.file}!`);
      continue;
    }

    const allSkills = new Map<string, SkillDefinition[]>();

    for (const poke of pokemons) {
      const rng = seededRng(poke.id * 31337 + poke.name.length * 7);
      const skills = generateSkillsForPokemon(poke, existingNames, rng);
      allSkills.set(poke.skillIds[0], skills);
    }

    const content = generateFileContent(gen.skillConst, pokemons, allSkills);
    const outputPath = path.join(skillsDir, gen.file);
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`  Wrote ${outputPath} (${pokemons.length} pokemon, ${pokemons.length * 3} skills)`);

    totalPokemon += pokemons.length;
    totalSkills += pokemons.length * 3;
  }

  console.log(`\nDone! Generated ${totalSkills} skills for ${totalPokemon} pokemon.`);
}

main();
