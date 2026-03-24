/**
 * Pokemon Data Generation Script
 *
 * Reads GIF filenames, fetches data from PokeAPI, and generates:
 * - pokedex gen files (gen1.ts through gen9.ts + forms.ts + index.ts)
 * - skills gen files
 * - evolutions.ts
 *
 * Usage: npx tsx packages/shared/scripts/generate-pokedex.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GIF_DIR = path.resolve(__dirname, '../../client/public/monsters/ani');
const MOVES_FILE = path.resolve(__dirname, 'moves-by-type.json');
const POKEDEX_OUT = path.resolve(__dirname, '../src/data/pokedex');
const SKILLS_OUT = path.resolve(__dirname, '../src/data/skills');
const EVOLUTIONS_OUT = path.resolve(__dirname, '../src/data/evolutions.ts');

// Suffixes to exclude
const EXCLUDED_SUFFIXES = ['-gmax', '-totem'];
// Cosmetic forms to exclude
const EXCLUDED_PATTERNS = [
  /^vivillon-/, /^pikachu-(alola|belle|cosplay|hoenn|kalos|libre|original|partner|phd|pop-star|sinnoh|starter|unova)$/,
  /^unown$/, /^castform-(rainy|snowy|sunny)$/, /^burmy-(sandy|trash)$/,
  /^wormadam-(sandy|trash)$/, /^shellos-east$/, /^gastrodon-east$/,
  /^deerling-(autumn|summer|winter)$/, /^minior-(blue|green|indigo|meteor|orange|violet|yellow)$/,
  /^squawkabilly-(blue|white|yellow)$/, /^tatsugiri-(droopy|stretchy)$/,
  /^pumpkaboo-(large|small|super)$/, /^gourgeist-(large|small|super)$/,
  /^maushold-four$/, /^basculegion-f$/, /^indeedee-f$/, /^meowstic-f$/,
  /^oinkologne-f$/, /^nidoranf$/, /^eevee-starter$/, /^eevee-gmax$/,
  /^pikachu-gmax$/, /^araquanid-totem$/, /^gumshoos-totem$/, /^lurantis-totem$/,
  /^vikavolt-totem$/, /^salazzle-totem$/, /^mimikyu-(busted|busted-totem|totem)$/,
  /^togedemaru-totem$/, /^marowak-alola-totem$/, /^raticate-alola-totem$/,
  /^floette-eternal$/, /^sinistea-antique$/, /^sinistcha-masterpiece$/,
  /^polteageist-antique$/, /^poltchageist-artisan$/,
  /^magearna-original$/, /^greninja-ash$/, /^palafin-hero$/,
  /^aegislash-blade$/, /^wishiwashi-school$/,
  /^cramorant-(gorging|gulping)$/, /^morpeko-hangry$/, /^eiscue-noice$/,
  /^cherrim-sunshine$/, /^genesect-(burn|chill|douse|shock)$/,
  /^keldeo-resolute$/, /^meloetta-pirouette$/, /^hoopa-unbound$/,
  /^zarude-dada$/, /^eternatus-eternamax$/, /^necrozma-ultra$/,
  /^porygonz$/, // duplicate of porygon-z
];

type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'fairy' | 'dark' | 'steel';

interface PokemonData {
  name: string;        // GIF name (lowercase, no .gif)
  id: number;          // Pokedex number or synthetic ID
  types: PokemonType[];
  bst: number;         // Base stat total
  height: number;      // meters
  isLegendary: boolean;
  isMythical: boolean;
  evolvesFrom: string | null;
  generation: number;
  formType: 'base' | 'mega' | 'megax' | 'megay' | 'alola' | 'galar' | 'hisui' | 'paldea' | 'other';
  baseFormName: string | null;
}

// ---------------------------------------------------------------------------
// PokeAPI fetching with caching and rate limiting
// ---------------------------------------------------------------------------
const CACHE_FILE = path.resolve(__dirname, '.pokemon-cache.json');
let cache: Record<string, any> = {};

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  if (cache[url]) return cache[url];

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[url] = data;
      return data;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Name mapping: GIF name → PokeAPI name
const NAME_MAP: Record<string, string> = {
  'mrmime': 'mr-mime',
  'mrmime-galar': 'mr-mime-galar',
  'mrrime': 'mr-rime',
  'mimejr': 'mime-jr',
  'nidoranm': 'nidoran-m',
  'nidoran-f': 'nidoran-f',
  'farfetchd': "farfetch'd",
  'sirfetchd': "sirfetch'd",
  'porygon-z': 'porygon-z',
  'tapukoko': 'tapu-koko',
  'tapulele': 'tapu-lele',
  'tapubulu': 'tapu-bulu',
  'tapufini': 'tapu-fini',
  'typenull': 'type-null',
  'hooh': 'ho-oh',
  'kommoo': 'kommo-o',
  'hakamoo': 'hakamo-o',
  'jangmoo': 'jangmo-o',
  'oricorio-pau': 'oricorio-pau',
  'oricorio-sensu': 'oricorio-sensu',
};

// Mega form name → PokeAPI species for BST lookup
const MEGA_SPECIES_MAP: Record<string, string> = {};

// Known form types that PokeAPI uses different names for
const FORM_API_MAP: Record<string, string> = {
  // Regional forms
  '-alola': '-alola',
  '-galar': '-galar',
  '-hisui': '-hisui',
  '-paldea': '-paldea',
  // Megas
  '-mega': '-mega',
  '-megax': '-mega-x',
  '-megay': '-mega-y',
};

function getFormType(name: string): PokemonData['formType'] {
  if (name.endsWith('-megax')) return 'megax';
  if (name.endsWith('-megay')) return 'megay';
  if (name.endsWith('-mega')) return 'mega';
  if (name.includes('-alola')) return 'alola';
  if (name.includes('-galar')) return 'galar';
  if (name.includes('-hisui')) return 'hisui';
  if (name.includes('-paldea')) return 'paldea';

  // Special alternate forms (Deoxys, Giratina, Rotom, etc.)
  const specialForms = [
    '-attack', '-defense', '-speed', // Deoxys
    '-origin', // Giratina
    '-sky', // Shaymin
    '-therian', // Forces of Nature
    '-black', '-white', // Kyurem
    '-heat', '-wash', '-frost', '-fan', '-mow', // Rotom
    '-ice', '-shadow', // Calyrex
    '-crowned', // Zacian/Zamazenta
    '-dusk', '-midnight', // Lycanroc
    '-10', '-complete', // Zygarde
  ];

  for (const suffix of specialForms) {
    if (name.endsWith(suffix)) return 'other';
  }

  // Silvally/Arceus type forms
  if (name.startsWith('arceus-') || name.startsWith('silvally-')) return 'other';

  return 'base';
}

function getBaseFormName(name: string, formType: string): string | null {
  if (formType === 'base') return null;
  // Strip the form suffix to get the base name
  const suffixes = ['-megax', '-megay', '-mega', '-alola', '-galar', '-hisui', '-paldea',
    '-attack', '-defense', '-speed', '-origin', '-sky', '-therian',
    '-black', '-white', '-heat', '-wash', '-frost', '-fan', '-mow',
    '-ice', '-shadow', '-crowned', '-dusk', '-midnight', '-10', '-complete'];
  for (const s of suffixes) {
    if (name.endsWith(s)) return name.slice(0, -s.length);
  }
  // Type forms
  if (name.startsWith('arceus-')) return 'arceus';
  if (name.startsWith('silvally-')) return 'silvally';
  return name.split('-')[0];
}

function getSyntheticId(baseId: number, formType: string, name: string): number {
  switch (formType) {
    case 'mega': return 10000 + baseId;
    case 'megax': return 10000 + baseId;
    case 'megay': return 10001 + baseId;
    case 'alola': return 11000 + baseId;
    case 'galar': return 12000 + baseId;
    case 'hisui': return 13000 + baseId;
    case 'paldea': return 14000 + baseId;
    case 'other': return 15000 + baseId;
    default: return baseId;
  }
}

function getGeneration(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

async function fetchPokemonData(gifName: string): Promise<PokemonData | null> {
  const formType = getFormType(gifName);
  const baseFormName = getBaseFormName(gifName, formType);

  // Build PokeAPI URL
  let apiName = NAME_MAP[gifName] || gifName;

  // For PokeAPI, form names use different conventions
  if (formType === 'megax') apiName = (baseFormName || gifName) + '-mega-x';
  else if (formType === 'megay') apiName = (baseFormName || gifName) + '-mega-y';
  else if (formType === 'mega') apiName = (baseFormName || gifName) + '-mega';

  // Try fetching from PokeAPI
  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${apiName}`;
  let pokemonData = await fetchWithRetry(pokemonUrl);

  // Fallback: try base form for alternate forms
  if (!pokemonData && baseFormName) {
    const baseName = NAME_MAP[baseFormName] || baseFormName;
    pokemonData = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${baseName}`);
  }

  if (!pokemonData) {
    console.warn(`Could not fetch data for ${gifName} (tried ${apiName})`);
    return null;
  }

  // Get species data for legendary/mythical status
  const speciesUrl = pokemonData.species?.url;
  let speciesData: any = null;
  if (speciesUrl) {
    speciesData = await fetchWithRetry(speciesUrl);
  }

  const types: PokemonType[] = pokemonData.types.map((t: any) => t.type.name as PokemonType);
  const stats = pokemonData.stats as { base_stat: number; stat: { name: string } }[];
  const bst = stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);
  const height = pokemonData.height / 10; // API uses decimeters

  const baseId = speciesData?.id ?? pokemonData.id;
  const id = formType === 'base' ? baseId : getSyntheticId(baseId, formType, gifName);
  const gen = formType === 'base' ? getGeneration(baseId) : getGeneration(baseId);

  const evolvesFromSpecies = speciesData?.evolves_from_species?.name ?? null;

  return {
    name: gifName,
    id,
    types,
    bst,
    height,
    isLegendary: speciesData?.is_legendary ?? false,
    isMythical: speciesData?.is_mythical ?? false,
    evolvesFrom: (formType === 'base' && evolvesFromSpecies) ? evolvesFromSpecies : null,
    generation: gen,
    formType,
    baseFormName,
  };
}

// ---------------------------------------------------------------------------
// Stat mapping & star rating
// ---------------------------------------------------------------------------
function mapStats(bst: number): {
  hp: number; atk: number; def: number; spd: number;
  critRate: number; critDmg: number; acc: number; res: number;
} {
  const scale = bst / 500;
  return {
    hp: Math.floor(350 + scale * 300),
    atk: Math.floor(30 + scale * 80),
    def: Math.floor(30 + scale * 70),
    spd: Math.floor(75 + scale * 50),
    critRate: Math.floor(10 + scale * 12),
    critDmg: Math.floor(150 + scale * 20),
    acc: Math.floor(85 + scale * 18),
    res: Math.floor(10 + scale * 14),
  };
}

function getNaturalStars(bst: number, isLegendary: boolean, isMythical: boolean): 1 | 2 | 3 {
  if (isLegendary || isMythical) return 3;
  if (bst >= 550) return 3;
  if (bst >= 400) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Skill generation
// ---------------------------------------------------------------------------
const movesByType: Record<string, { basic: string[]; active: string[] }> = JSON.parse(
  fs.readFileSync(MOVES_FILE, 'utf-8')
);

// Passives by type
const PASSIVES: Record<string, { name: string; effects: any[]; target: string }> = {
  fire: { name: 'Blaze', effects: [{ type: 'buff', stat: 'atk', value: 15, duration: 999, chance: 100 }], target: 'self' },
  water: { name: 'Torrent', effects: [{ type: 'buff', stat: 'def', value: 15, duration: 999, chance: 100 }], target: 'self' },
  grass: { name: 'Overgrow', effects: [{ type: 'buff', stat: 'hp', value: 20, duration: 999, chance: 100 }], target: 'self' },
  electric: { name: 'Static', effects: [{ type: 'buff', stat: 'spd', value: 15, duration: 999, chance: 100 }], target: 'self' },
  ice: { name: 'Ice Body', effects: [{ type: 'buff', stat: 'res', value: 12, duration: 999, chance: 100 }], target: 'self' },
  fighting: { name: 'Guts', effects: [{ type: 'buff', stat: 'atk', value: 20, duration: 999, chance: 100 }], target: 'self' },
  poison: { name: 'Poison Point', effects: [{ type: 'buff', stat: 'atk', value: 10, duration: 999, chance: 100 }, { type: 'buff', stat: 'res', value: 10, duration: 999, chance: 100 }], target: 'self' },
  ground: { name: 'Arena Trap', effects: [{ type: 'debuff', stat: 'spd', value: -10, duration: 999, chance: 100 }], target: 'all_enemies' },
  flying: { name: 'Keen Eye', effects: [{ type: 'buff', stat: 'acc', value: 15, duration: 999, chance: 100 }], target: 'self' },
  psychic: { name: 'Inner Focus', effects: [{ type: 'buff', stat: 'res', value: 15, duration: 999, chance: 100 }], target: 'self' },
  bug: { name: 'Swarm', effects: [{ type: 'buff', stat: 'critRate', value: 10, duration: 999, chance: 100 }], target: 'self' },
  rock: { name: 'Sand Stream', effects: [{ type: 'buff', stat: 'def', value: 15, duration: 999, chance: 100 }], target: 'self' },
  ghost: { name: 'Levitate', effects: [{ type: 'buff', stat: 'spd', value: 12, duration: 999, chance: 100 }], target: 'self' },
  dragon: { name: 'Intimidate', effects: [{ type: 'debuff', stat: 'atk', value: -10, duration: 999, chance: 100 }], target: 'all_enemies' },
  fairy: { name: 'Cute Charm', effects: [{ type: 'debuff', stat: 'atk', value: -10, duration: 999, chance: 100 }], target: 'all_enemies' },
  dark: { name: 'Pressure', effects: [{ type: 'debuff', stat: 'spd', value: -10, duration: 999, chance: 100 }], target: 'all_enemies' },
  steel: { name: 'Sturdy', effects: [{ type: 'buff', stat: 'def', value: 20, duration: 999, chance: 100 }], target: 'self' },
  normal: { name: 'Adaptability', effects: [{ type: 'buff', stat: 'atk', value: 10, duration: 999, chance: 100 }], target: 'self' },
};

// Active skill effects by type
const TYPE_EFFECTS: Record<string, any[]> = {
  fire: [{ type: 'dot', value: 8, duration: 2, chance: 70 }],
  water: [{ type: 'debuff', stat: 'atk', value: -10, duration: 2, chance: 60 }],
  grass: [{ type: 'heal', stat: 'hp', value: 10, duration: 1, chance: 100 }],
  electric: [{ type: 'stun', value: 0, duration: 1, chance: 30 }],
  ice: [{ type: 'debuff', stat: 'spd', value: -15, duration: 2, chance: 80 }],
  fighting: [{ type: 'debuff', stat: 'def', value: -15, duration: 2, chance: 60 }],
  poison: [{ type: 'dot', value: 6, duration: 3, chance: 65 }],
  ground: [{ type: 'debuff', stat: 'spd', value: -10, duration: 2, chance: 70 }],
  flying: [{ type: 'debuff', stat: 'acc', value: -10, duration: 2, chance: 60 }],
  psychic: [{ type: 'debuff', stat: 'atk', value: -15, duration: 2, chance: 70 }],
  bug: [{ type: 'debuff', stat: 'atk', value: -10, duration: 2, chance: 60 }],
  rock: [{ type: 'debuff', stat: 'spd', value: -15, duration: 2, chance: 70 }],
  ghost: [{ type: 'debuff', stat: 'res', value: -15, duration: 2, chance: 60 }],
  dragon: [{ type: 'buff', stat: 'atk', value: 20, duration: 2, chance: 100 }],
  fairy: [{ type: 'debuff', stat: 'atk', value: -15, duration: 2, chance: 70 }],
  dark: [{ type: 'debuff', stat: 'acc', value: -10, duration: 2, chance: 60 }],
  steel: [{ type: 'buff', stat: 'def', value: 20, duration: 2, chance: 100 }],
  normal: [{ type: 'buff', stat: 'spd', value: 15, duration: 2, chance: 100 }],
};

// Track used move names per Pokemon to ensure uniqueness
const usedMoves = new Set<string>();

function pickMove(type: string, category: 'basic' | 'active', name: string): string {
  const pool = movesByType[type]?.[category] ?? movesByType.normal[category];
  // Hash-based deterministic pick to ensure consistency across runs
  const hash = Array.from(name).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const idx = Math.abs(hash) % pool.length;
  // Rotate through pool to avoid collisions
  for (let i = 0; i < pool.length; i++) {
    const pick = pool[(idx + i) % pool.length];
    const key = `${name}_${pick}`;
    if (!usedMoves.has(key)) {
      usedMoves.add(key);
      return pick;
    }
  }
  return pool[idx]; // Fallback
}

function generateSkills(pokemon: PokemonData): string {
  const key = pokemon.name.replace(/[^a-z0-9]/g, '_');
  const primaryType = pokemon.types[0];
  const secondaryType = pokemon.types[1] || primaryType;
  const stars = getNaturalStars(pokemon.bst, pokemon.isLegendary, pokemon.isMythical);

  // Multipliers scale with star rating
  const activeMultiplier = stars === 3 ? 1.8 : stars === 2 ? 1.5 : 1.3;
  const strongMultiplier = stars === 3 ? 2.2 : stars === 2 ? 1.9 : 1.6;
  const activeCooldown = stars === 3 ? 4 : 3;
  const strongCooldown = stars === 3 ? 5 : 4;

  // Pick move names (escape single quotes for TS string literals)
  const basicMove = pickMove(primaryType, 'basic', pokemon.name + '_b').replace(/'/g, "\\'");
  const activeMove = pickMove(secondaryType, 'active', pokemon.name + '_a').replace(/'/g, "\\'");
  const passive = PASSIVES[primaryType] ?? PASSIVES.normal;
  const activeEffects = TYPE_EFFECTS[secondaryType] ?? TYPE_EFFECTS.normal;

  const skills = `
  // --- ${pokemon.name} (${pokemon.types.join('/')}) ---
  ${key}_skill1: {
    id: '${key}_skill1',
    name: '${basicMove}',
    description: 'A basic ${primaryType}-type attack.',
    type: '${primaryType}',
    category: 'basic',
    cooldown: 0,
    multiplier: 1.0,
    effects: [],
    target: 'single_enemy',
  },
  ${key}_skill2: {
    id: '${key}_skill2',
    name: '${activeMove}',
    description: 'A powerful ${secondaryType}-type special attack.',
    type: '${secondaryType}',
    category: 'active',
    cooldown: ${activeCooldown},
    multiplier: ${strongMultiplier},
    effects: ${JSON.stringify(activeEffects)},
    target: '${activeEffects.some((e: any) => e.type === 'heal' || e.type === 'buff') && !activeEffects.some((e: any) => e.type === 'debuff' || e.type === 'dot') ? 'self' : 'single_enemy'}',
  },
  ${key}_skill3: {
    id: '${key}_skill3',
    name: '${passive.name}',
    description: '${passive.name} boosts this Pokemon\\\'s combat capabilities.',
    type: '${primaryType}',
    category: 'passive',
    cooldown: 0,
    multiplier: 0,
    effects: ${JSON.stringify(passive.effects)},
    target: '${passive.target}',
  },`;

  return skills;
}

function generatePokemonEntry(pokemon: PokemonData, allPokemon: PokemonData[]): string {
  const stats = mapStats(pokemon.bst);
  const stars = getNaturalStars(pokemon.bst, pokemon.isLegendary, pokemon.isMythical);
  const key = pokemon.name.replace(/[^a-z0-9]/g, '_');

  // Determine if summonable
  // Evolved forms, megas are not summonable
  const isEvolved = pokemon.evolvesFrom !== null;
  const isMega = ['mega', 'megax', 'megay'].includes(pokemon.formType);
  const summonable = !isEvolved && !isMega;

  const displayName = pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');

  let entry = `  {
    id: ${pokemon.id},
    name: '${displayName}',
    types: [${pokemon.types.map(t => `'${t}'`).join(', ')}],
    naturalStars: ${stars},
    spriteUrl: 'monsters/ani/${pokemon.name}.gif',
    skillIds: ['${key}_skill1', '${key}_skill2', '${key}_skill3'],
    height: ${pokemon.height},`;

  if (!summonable) {
    entry += `\n    summonable: false,`;
  }

  entry += `
    baseStats: {
      hp: ${stats.hp},
      atk: ${stats.atk},
      def: ${stats.def},
      spd: ${stats.spd},
      critRate: ${stats.critRate},
      critDmg: ${stats.critDmg},
      acc: ${stats.acc},
      res: ${stats.res},
    },
  },`;

  return entry;
}

// ---------------------------------------------------------------------------
// Evolution chain generation
// ---------------------------------------------------------------------------
function generateEvolutions(allPokemon: PokemonData[]): string {
  const byName = new Map(allPokemon.map(p => [p.name, p]));
  const chains: string[] = [];

  for (const pokemon of allPokemon) {
    if (!pokemon.evolvesFrom) continue;

    const parent = byName.get(pokemon.evolvesFrom);
    if (!parent) continue;

    const primaryType = pokemon.types[0];
    const stars = getNaturalStars(pokemon.bst, pokemon.isLegendary, pokemon.isMythical);
    const parentStars = getNaturalStars(parent.bst, parent.isLegendary, parent.isMythical);

    // Determine tier and essences based on evolution stage
    let tier: string;
    let levelReq: number;
    let essences: string;

    if (stars <= 1) {
      tier = 'low';
      levelReq = 15;
      essences = `{ ${primaryType}_low: 5, magic_low: 2 }`;
    } else if (parentStars <= 1) {
      tier = 'low';
      levelReq = 18;
      essences = `{ ${primaryType}_low: 8, magic_low: 4 }`;
    } else {
      tier = 'mid';
      levelReq = stars >= 3 ? 30 : 25;
      essences = `{ ${primaryType}_mid: 12, magic_mid: 5 }`;
    }

    chains.push(`  { from: ${parent.id}, to: ${pokemon.id}, requirements: { essences: ${essences}, levelRequired: ${levelReq} } },`);
  }

  // Mega evolution chains
  for (const pokemon of allPokemon) {
    if (!['mega', 'megax', 'megay'].includes(pokemon.formType)) continue;
    if (!pokemon.baseFormName) continue;

    const basePokemon = byName.get(pokemon.baseFormName);
    if (!basePokemon) continue;

    const primaryType = pokemon.types[0];
    chains.push(`  { from: ${basePokemon.id}, to: ${pokemon.id}, requirements: { essences: { ${primaryType}_high: 15, magic_high: 8 }, levelRequired: 40 } },`);
  }

  return chains.join('\n');
}

// ---------------------------------------------------------------------------
// File output
// ---------------------------------------------------------------------------
function genRange(gen: number): [number, number] {
  const ranges: Record<number, [number, number]> = {
    1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
    5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 905], 9: [906, 1025],
  };
  return ranges[gen] ?? [0, 0];
}

function writeGenFile(dir: string, gen: number, entries: string[], isSkills: boolean) {
  const fileName = `gen${gen}.ts`;
  const importLine = isSkills
    ? "import type { SkillDefinition } from '../../types/pokemon.js';"
    : "import type { PokemonTemplate } from '../../types/pokemon.js';";
  const exportName = isSkills ? `GEN${gen}_SKILLS` : `GEN${gen}`;
  const typeName = isSkills ? 'Record<string, SkillDefinition>' : 'PokemonTemplate[]';
  const open = isSkills ? '{' : '[';
  const close = isSkills ? '};' : '];';

  const content = `${importLine}

export const ${exportName}: ${typeName} = ${open}
${entries.join('\n')}
${close}
`;

  fs.writeFileSync(path.join(dir, fileName), content, 'utf-8');
}

function writeFormsFile(dir: string, entries: string[], isSkills: boolean) {
  const importLine = isSkills
    ? "import type { SkillDefinition } from '../../types/pokemon.js';"
    : "import type { PokemonTemplate } from '../../types/pokemon.js';";
  const exportName = isSkills ? 'FORMS_SKILLS' : 'FORMS';
  const typeName = isSkills ? 'Record<string, SkillDefinition>' : 'PokemonTemplate[]';
  const open = isSkills ? '{' : '[';
  const close = isSkills ? '};' : '];';

  const content = `${importLine}

export const ${exportName}: ${typeName} = ${open}
${entries.join('\n')}
${close}
`;

  fs.writeFileSync(path.join(dir, 'forms.ts'), content, 'utf-8');
}

function writeIndexFile(dir: string, gens: number[], hasForms: boolean, isSkills: boolean) {
  const imports: string[] = [];
  const spreads: string[] = [];

  for (const gen of gens) {
    const name = isSkills ? `GEN${gen}_SKILLS` : `GEN${gen}`;
    imports.push(`import { ${name} } from './gen${gen}.js';`);
    spreads.push(isSkills ? `...${name}` : `...${name}`);
  }

  if (hasForms) {
    const name = isSkills ? 'FORMS_SKILLS' : 'FORMS';
    imports.push(`import { ${name} } from './forms.js';`);
    spreads.push(isSkills ? `...${name}` : `...${name}`);
  }

  let content: string;

  if (isSkills) {
    const importLine = "import type { SkillDefinition } from '../../types/pokemon.js';";
    content = `${importLine}
${imports.join('\n')}

export const SKILLS: Record<string, SkillDefinition> = {
  ${spreads.join(',\n  ')},
};

export function getSkillsForPokemon(skillIds: [string, string, string]): SkillDefinition[] {
  return skillIds.map(id => SKILLS[id]).filter(Boolean);
}
`;
  } else {
    const importLine = "import type { PokemonTemplate } from '../../types/pokemon.js';";
    content = `${importLine}
${imports.join('\n')}

export const POKEDEX: PokemonTemplate[] = [
  ${spreads.join(',\n  ')},
];

export const POKEDEX_MAP = new Map<number, PokemonTemplate>(
  POKEDEX.map(p => [p.id, p])
);

export function getTemplate(id: number): PokemonTemplate | undefined {
  return POKEDEX_MAP.get(id);
}
`;
  }

  fs.writeFileSync(path.join(dir, 'index.ts'), content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Loading GIF filenames...');
  const gifs = fs.readdirSync(GIF_DIR)
    .filter(f => f.endsWith('.gif'))
    .map(f => f.replace('.gif', ''));

  console.log(`Found ${gifs.length} GIF files.`);

  // Filter GIFs
  const filtered = gifs.filter(name => {
    // Exclude gmax/totem
    for (const suffix of EXCLUDED_SUFFIXES) {
      if (name.endsWith(suffix)) return false;
    }
    // Exclude cosmetic/duplicate forms
    for (const pattern of EXCLUDED_PATTERNS) {
      if (pattern.test(name)) return false;
    }
    return true;
  });

  console.log(`After filtering: ${filtered.length} Pokemon to process.`);

  loadCache();

  // Fetch data from PokeAPI
  const allPokemon: PokemonData[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filtered.length / BATCH_SIZE)} (${batch[0]}...)`);

    const results = await Promise.all(batch.map(name => fetchPokemonData(name)));

    for (const result of results) {
      if (result) allPokemon.push(result);
    }

    // Save cache periodically
    if (i % 100 === 0) saveCache();

    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  saveCache();

  // Deduplicate IDs — if collision, add offset
  const usedIds = new Set<number>();
  for (const p of allPokemon) {
    while (usedIds.has(p.id)) {
      p.id += 1;
    }
    usedIds.add(p.id);
  }

  console.log(`\nTotal Pokemon: ${allPokemon.length}`);
  console.log(`  Base forms: ${allPokemon.filter(p => p.formType === 'base').length}`);
  console.log(`  Mega forms: ${allPokemon.filter(p => ['mega', 'megax', 'megay'].includes(p.formType)).length}`);
  console.log(`  Regional forms: ${allPokemon.filter(p => ['alola', 'galar', 'hisui', 'paldea'].includes(p.formType)).length}`);
  console.log(`  Other forms: ${allPokemon.filter(p => p.formType === 'other').length}`);

  // Group by generation
  const byGen = new Map<number, PokemonData[]>();
  const forms: PokemonData[] = [];

  for (const p of allPokemon) {
    if (p.formType !== 'base') {
      forms.push(p);
      continue;
    }
    const gen = p.generation;
    if (!byGen.has(gen)) byGen.set(gen, []);
    byGen.get(gen)!.push(p);
  }

  // Sort by ID within each group
  for (const [, group] of byGen) group.sort((a, b) => a.id - b.id);
  forms.sort((a, b) => a.id - b.id);

  // Create output directories
  fs.mkdirSync(POKEDEX_OUT, { recursive: true });
  fs.mkdirSync(SKILLS_OUT, { recursive: true });

  // Generate and write files
  const activeGens: number[] = [];

  for (const [gen, pokemon] of byGen) {
    activeGens.push(gen);

    const pokedexEntries = pokemon.map(p => generatePokemonEntry(p, allPokemon));
    const skillEntries = pokemon.map(p => generateSkills(p));

    writeGenFile(POKEDEX_OUT, gen, pokedexEntries, false);
    writeGenFile(SKILLS_OUT, gen, skillEntries, true);

    console.log(`Gen ${gen}: ${pokemon.length} Pokemon`);
  }

  activeGens.sort((a, b) => a - b);

  // Write forms
  if (forms.length > 0) {
    const formPokedexEntries = forms.map(p => generatePokemonEntry(p, allPokemon));
    const formSkillEntries = forms.map(p => generateSkills(p));

    writeFormsFile(POKEDEX_OUT, formPokedexEntries, false);
    writeFormsFile(SKILLS_OUT, formSkillEntries, true);

    console.log(`Forms: ${forms.length} alternate forms`);
  }

  // Write index files
  writeIndexFile(POKEDEX_OUT, activeGens, forms.length > 0, false);
  writeIndexFile(SKILLS_OUT, activeGens, forms.length > 0, true);

  // Write evolutions
  const evolutionContent = `import type { EvolutionChain } from '../types/evolution.js';

export const EVOLUTION_CHAINS: EvolutionChain[] = [
${generateEvolutions(allPokemon)}
];

export function getEvolutionsFrom(templateId: number): EvolutionChain[] {
  return EVOLUTION_CHAINS.filter(c => c.from === templateId);
}

export function canEvolve(templateId: number): boolean {
  return EVOLUTION_CHAINS.some(c => c.from === templateId);
}

export function getEvolutionLineage(templateId: number): number[] {
  let rootId = templateId;
  let parent = EVOLUTION_CHAINS.find(c => c.to === rootId);
  while (parent) {
    rootId = parent.from;
    parent = EVOLUTION_CHAINS.find(c => c.to === rootId);
  }

  const lineage: number[] = [rootId];
  let current = rootId;
  let next = EVOLUTION_CHAINS.find(c => c.from === current);
  while (next) {
    lineage.push(next.to);
    current = next.to;
    next = EVOLUTION_CHAINS.find(c => c.from === current);
  }
  return lineage;
}
`;

  fs.writeFileSync(EVOLUTIONS_OUT, evolutionContent, 'utf-8');

  // Write pokemon-data.json for reference
  fs.writeFileSync(
    path.resolve(__dirname, 'pokemon-data.json'),
    JSON.stringify(allPokemon, null, 2),
    'utf-8'
  );

  console.log('\nDone! Generated files:');
  console.log(`  - ${POKEDEX_OUT}/`);
  console.log(`  - ${SKILLS_OUT}/`);
  console.log(`  - ${EVOLUTIONS_OUT}`);
}

main().catch(console.error);
