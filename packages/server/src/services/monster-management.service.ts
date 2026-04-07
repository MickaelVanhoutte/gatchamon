import { getDb } from '../db/schema.js';
import { rowToInstance } from '../routes/collection.js';
import type { PokemonInstance, Player } from '@gatchamon/shared';
import {
  calculateFodderXp,
  xpToNextLevel,
  canStarEvolve,
  MAX_LEVEL_BY_STARS,
  MAX_SKILL_LEVEL,
  getEvolutionLineage,
  getActiveEvolutionsFrom,
  isActivePokemon,
  getTemplate,
  getTypeChangeDef,
  getAvailableTypeChanges,
  ELEMENTS,
} from '@gatchamon/shared';

// ── Helpers ────────────────────────────────────────────────────────────

function loadInstance(instanceId: string, ownerId: string): any {
  return getDb().prepare(
    'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
  ).get(instanceId, ownerId);
}

function loadPlayerRow(playerId: string): any {
  return getDb().prepare('SELECT * FROM players WHERE id = ?').get(playerId);
}

function parseMaterials(row: any): Record<string, number> {
  return row.materials ? JSON.parse(row.materials) : {};
}

// ── Altar Feed ─────────────────────────────────────────────────────────

export interface AltarFeedResult {
  updatedBase: PokemonInstance;
  totalXpGain: number;
  skillUps: number;
  starEvolved: boolean;
  becameShiny: boolean;
}

export function performAltarFeed(
  playerId: string,
  baseInstanceId: string,
  fodderInstanceIds: string[],
): AltarFeedResult {
  const db = getDb();

  if (!fodderInstanceIds.length || fodderInstanceIds.length > 5) {
    throw new Error('Must provide 1-5 fodder monsters');
  }
  if (fodderInstanceIds.includes(baseInstanceId)) {
    throw new Error('Cannot feed a monster to itself');
  }
  if (new Set(fodderInstanceIds).size !== fodderInstanceIds.length) {
    throw new Error('Duplicate fodder not allowed');
  }

  const baseRow = loadInstance(baseInstanceId, playerId);
  if (!baseRow) throw new Error('Base monster not found');
  const base = rowToInstance(baseRow);

  const fodder: PokemonInstance[] = [];
  for (const id of fodderInstanceIds) {
    const row = db.prepare(
      'SELECT * FROM pokemon_instances WHERE instance_id = ? AND owner_id = ?'
    ).get(id, playerId) as any;
    if (!row) throw new Error(`Fodder ${id} not found`);
    fodder.push(rowToInstance(row));
  }

  // Star evolution check
  const fodderStars = fodder.map(f => f.stars);
  const willStarEvolve = canStarEvolve(base.level, base.stars, fodderStars);
  const newStars = willStarEvolve ? (Math.min(base.stars + 1, 6) as PokemonInstance['stars']) : base.stars;

  // Skill-ups: same lineage or Ditto (132)
  const baseLineage = new Set(getEvolutionLineage(base.templateId));
  const skillLevels: [number, number, number] = [...(base.skillLevels ?? [1, 1, 1])] as [number, number, number];
  let skillUps = 0;
  for (const f of fodder) {
    if (f.templateId !== 132 && !baseLineage.has(f.templateId)) continue;
    const upgradable = skillLevels
      .map((lv, i) => (lv < MAX_SKILL_LEVEL ? i : -1))
      .filter(i => i >= 0);
    if (!upgradable.length) break;
    const idx = upgradable[Math.floor(Math.random() * upgradable.length)];
    skillLevels[idx]++;
    skillUps++;
  }

  // Shiny transfer
  const becameShiny = !base.isShiny && fodder.some(f => f.isShiny && baseLineage.has(f.templateId));
  const isShiny = base.isShiny || becameShiny;

  // XP
  const totalXpGain = fodder.reduce((sum, f) => sum + calculateFodderXp(f.level, f.stars), 0);
  let { level, exp } = base;
  exp += totalXpGain;
  const maxLevel = MAX_LEVEL_BY_STARS[newStars] ?? 99;
  while (level < maxLevel && exp >= xpToNextLevel(level)) {
    exp -= xpToNextLevel(level);
    level++;
  }
  if (level >= maxLevel) {
    level = maxLevel;
    exp = 0;
  }

  // Apply in a transaction
  const txn = db.transaction(() => {
    // Update base
    db.prepare(
      'UPDATE pokemon_instances SET level = ?, stars = ?, exp = ?, is_shiny = ?, skill_levels = ? WHERE instance_id = ?'
    ).run(level, newStars, exp, isShiny ? 1 : 0, JSON.stringify(skillLevels), baseInstanceId);

    // Delete fodder
    const placeholders = fodderInstanceIds.map(() => '?').join(',');
    db.prepare(
      `DELETE FROM pokemon_instances WHERE instance_id IN (${placeholders})`
    ).run(...fodderInstanceIds);
  });
  txn();

  const updatedBase: PokemonInstance = {
    ...base,
    level,
    stars: newStars,
    exp,
    isShiny,
    skillLevels,
  };

  return { updatedBase, totalXpGain, skillUps, starEvolved: willStarEvolve, becameShiny };
}

// ── Merge ──────────────────────────────────────────────────────────────

export function performMerge(
  playerId: string,
  baseInstanceId: string,
  fodderInstanceId: string,
): PokemonInstance {
  const db = getDb();
  const baseRow = loadInstance(baseInstanceId, playerId);
  const fodderRow = loadInstance(fodderInstanceId, playerId);
  if (!baseRow) throw new Error('Base not found');
  if (!fodderRow) throw new Error('Fodder not found');

  const base = rowToInstance(baseRow);
  const fodderInst = rowToInstance(fodderRow);

  if (base.templateId !== fodderInst.templateId) {
    throw new Error('Must be same species');
  }
  if (base.stars >= 6) throw new Error('Already max stars');

  const maxLevel = MAX_LEVEL_BY_STARS[base.stars] ?? 99;
  if (base.level < maxLevel) {
    throw new Error('Base must be at max level for current stars');
  }

  const newStars = (base.stars + 1) as PokemonInstance['stars'];
  const isShiny = base.isShiny || fodderInst.isShiny;

  const txn = db.transaction(() => {
    db.prepare(
      'UPDATE pokemon_instances SET stars = ?, is_shiny = ? WHERE instance_id = ?'
    ).run(newStars, isShiny ? 1 : 0, baseInstanceId);
    db.prepare('DELETE FROM pokemon_instances WHERE instance_id = ?').run(fodderInstanceId);
  });
  txn();

  return { ...base, stars: newStars, isShiny };
}

// ── Evolution ──────────────────────────────────────────────────────────

export function performEvolution(
  playerId: string,
  instanceId: string,
  targetTemplateId: number,
): PokemonInstance {
  const db = getDb();
  const row = loadInstance(instanceId, playerId);
  if (!row) throw new Error('Monster not found');
  const instance = rowToInstance(row);

  if (!isActivePokemon(targetTemplateId)) {
    throw new Error('Target not available');
  }

  const chains = getActiveEvolutionsFrom(instance.templateId);
  const chain = chains.find(c => c.to === targetTemplateId);
  if (!chain) throw new Error('No evolution path to target');

  if (instance.level < chain.requirements.levelRequired) {
    throw new Error(`Level ${chain.requirements.levelRequired} required`);
  }

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  for (const [essenceId, needed] of Object.entries(chain.requirements.essences)) {
    if ((materials[essenceId] ?? 0) < needed) {
      throw new Error(`Not enough ${essenceId}`);
    }
  }

  const txn = db.transaction(() => {
    // Deduct materials
    for (const [essenceId, needed] of Object.entries(chain.requirements.essences)) {
      materials[essenceId] = (materials[essenceId] ?? 0) - needed;
      if (materials[essenceId] <= 0) delete materials[essenceId];
    }
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);

    // Update templateId
    db.prepare('UPDATE pokemon_instances SET template_id = ? WHERE instance_id = ?')
      .run(targetTemplateId, instanceId);
  });
  txn();

  return { ...instance, templateId: targetTemplateId };
}

// ── Type Change ────────────────────────────────────────────────────────

export function performTypeChange(
  playerId: string,
  instanceId: string,
  targetTemplateId: number,
): PokemonInstance {
  const db = getDb();
  const row = loadInstance(instanceId, playerId);
  if (!row) throw new Error('Monster not found');
  const instance = rowToInstance(row);

  const def = getTypeChangeDef(instance.templateId);
  if (!def) throw new Error('Type change not supported for this monster');

  const options = getAvailableTypeChanges(def, instance.templateId);
  const target = options.find(o => o.targetTemplateId === targetTemplateId);
  if (!target) throw new Error('Invalid type change target');

  if (!getTemplate(targetTemplateId)) throw new Error('Target template not found');

  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  for (const [essenceId, needed] of Object.entries(target.cost.essences)) {
    if ((materials[essenceId] ?? 0) < needed) {
      throw new Error(`Not enough ${essenceId}`);
    }
  }

  const txn = db.transaction(() => {
    for (const [essenceId, needed] of Object.entries(target.cost.essences)) {
      materials[essenceId] = (materials[essenceId] ?? 0) - needed;
      if (materials[essenceId] <= 0) delete materials[essenceId];
    }
    db.prepare('UPDATE players SET materials = ? WHERE id = ?')
      .run(JSON.stringify(materials), playerId);

    db.prepare('UPDATE pokemon_instances SET template_id = ? WHERE instance_id = ?')
      .run(targetTemplateId, instanceId);
  });
  txn();

  return { ...instance, templateId: targetTemplateId };
}

// ── Essence Merge ──────────────────────────────────────────────────────

const MERGE_RATIO = 10;

export function performEssenceMerge(
  playerId: string,
  element: string,
  targetTier: 'mid' | 'high',
  targetCount: number,
): Record<string, number> {
  if (targetCount < 1) throw new Error('Count must be >= 1');
  if (!ELEMENTS.includes(element as any)) throw new Error('Invalid element');

  const db = getDb();
  const playerRow = loadPlayerRow(playerId);
  if (!playerRow) throw new Error('Player not found');
  const materials = parseMaterials(playerRow);

  const lowKey = `${element}_low`;
  const midKey = `${element}_mid`;
  const highKey = `${element}_high`;
  const availLow = materials[lowKey] ?? 0;
  const availMid = materials[midKey] ?? 0;

  if (targetTier === 'mid') {
    const lowNeeded = targetCount * MERGE_RATIO;
    if (availLow < lowNeeded) throw new Error('Not enough low-tier essences');
    materials[lowKey] = availLow - lowNeeded;
    materials[midKey] = availMid + targetCount;
  } else {
    // high: use mid first, then convert low → mid for remainder
    const midNeeded = targetCount * MERGE_RATIO;
    const midFromStock = Math.min(availMid, midNeeded);
    const midStillNeeded = midNeeded - midFromStock;
    const lowNeeded = midStillNeeded * MERGE_RATIO;
    if (availLow < lowNeeded) throw new Error('Not enough essences');
    materials[lowKey] = availLow - lowNeeded;
    materials[midKey] = availMid - midFromStock;
    materials[highKey] = (materials[highKey] ?? 0) + targetCount;
  }

  // Clean up zero/negative values
  for (const key of Object.keys(materials)) {
    if (materials[key] <= 0) delete materials[key];
  }

  db.prepare('UPDATE players SET materials = ? WHERE id = ?')
    .run(JSON.stringify(materials), playerId);

  return materials;
}
