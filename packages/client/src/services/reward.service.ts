import type {
  RewardState,
  MissionType,
  MissionReward,
  PlayerLifetimeStats,
  TrophyProgress,
  Difficulty,
  PokemonInstance,
} from '@gatchamon/shared';
import {
  selectDailyMissions,
  ALL_DAILIES_BONUS,
  TROPHIES,
  getTrophyStat,
  defaultLifetimeStats,
  firstClearKey,
  getTemplate,
  TOTAL_REGIONS,
  DITTO_TEMPLATE_ID,
  getFloorCount,
} from '@gatchamon/shared';
import {
  loadRewardState,
  saveRewardState,
  loadPlayer,
  savePlayer,
  loadCollection,
  addToCollection,
  addHeldItem,
} from './storage';
import { generateItem } from './rune.service';
import { grantTrainerXp } from './player.service';
import type { FloorEnemy } from './floor.service';
import { DIFFICULTY_REWARD_MULT } from './floor.service';

const SHINY_RATE = import.meta.env.VITE_DEBUG_MODE === 'true' ? 0.5 : 0.001;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadOrInitRewardState(): RewardState {
  const existing = loadRewardState();
  if (existing) return existing;

  // Bootstrap for existing players
  const player = loadPlayer();
  const collection = loadCollection();
  const stats = defaultLifetimeStats();

  if (collection.length > 0) {
    stats.totalMonstersCollected = collection.length;
    const uniqueIds = new Set(collection.map(c => c.templateId));
    stats.uniqueMonstersOwned = uniqueIds.size;
  }

  if (player) {
    const sp = player.storyProgress;
    for (const diff of ['normal', 'hard', 'hell'] as const) {
      const progress = sp[diff] ?? {};
      let completed = 0;
      for (let r = 1; r <= TOTAL_REGIONS; r++) {
        if (progress[r] === getFloorCount(r) + 1) completed++;
      }
      if (diff === 'normal') stats.highestRegionNormal = completed;
      else if (diff === 'hard') stats.highestRegionHard = completed;
      else stats.highestRegionHell = completed;
    }
  }

  const today = todayStr();
  const dailyDefs = selectDailyMissions(today);

  const state: RewardState = {
    dailyMissions: {
      date: today,
      missions: dailyDefs.map(m => ({ missionId: m.id, current: 0, claimed: false })),
      allClaimedBonus: false,
    },
    trophyProgress: TROPHIES.map(t => ({
      trophyId: t.id,
      current: stats[getTrophyStat(t.id)!] ?? 0,
      claimedTiers: [],
    })),
    firstClears: {},
    stats,
  };

  saveRewardState(state);
  return state;
}

// ---------------------------------------------------------------------------
// Daily Missions
// ---------------------------------------------------------------------------

function ensureDailyReset(state: RewardState): RewardState {
  const today = todayStr();
  if (state.dailyMissions.date === today) return state;

  const dailyDefs = selectDailyMissions(today);
  state.dailyMissions = {
    date: today,
    missions: dailyDefs.map(m => ({ missionId: m.id, current: 0, claimed: false })),
    allClaimedBonus: false,
  };
  saveRewardState(state);
  return state;
}

export function getDailyMissions() {
  const state = ensureDailyReset(loadOrInitRewardState());
  return state.dailyMissions;
}

export function incrementMission(type: MissionType, amount: number): void {
  const state = ensureDailyReset(loadOrInitRewardState());
  const todayDefs = selectDailyMissions(state.dailyMissions.date);

  for (const mission of state.dailyMissions.missions) {
    const def = todayDefs.find(d => d.id === mission.missionId);
    if (def && def.type === type && !mission.claimed) {
      mission.current = Math.min(mission.current + amount, def.target);
    }
  }

  saveRewardState(state);
}

export function claimMissionReward(missionId: string): MissionReward | null {
  const state = ensureDailyReset(loadOrInitRewardState());
  const todayDefs = selectDailyMissions(state.dailyMissions.date);

  const mission = state.dailyMissions.missions.find(m => m.missionId === missionId);
  const def = todayDefs.find(d => d.id === missionId);
  if (!mission || !def) return null;
  if (mission.claimed || mission.current < def.target) return null;

  mission.claimed = true;
  saveRewardState(state);
  applyReward(def.reward);
  return def.reward;
}

export function claimAllDailiesBonus(): MissionReward | null {
  const state = ensureDailyReset(loadOrInitRewardState());
  if (state.dailyMissions.allClaimedBonus) return null;

  const allClaimed = state.dailyMissions.missions.every(m => m.claimed);
  if (!allClaimed) return null;

  state.dailyMissions.allClaimedBonus = true;
  saveRewardState(state);
  applyReward(ALL_DAILIES_BONUS);
  return ALL_DAILIES_BONUS;
}

export function claimAllMissions(): MissionReward | null {
  const state = ensureDailyReset(loadOrInitRewardState());
  const todayDefs = selectDailyMissions(state.dailyMissions.date);
  const aggregated: MissionReward = {};
  let claimed = false;

  for (const mission of state.dailyMissions.missions) {
    const def = todayDefs.find(d => d.id === mission.missionId);
    if (def && !mission.claimed && mission.current >= def.target) {
      mission.claimed = true;
      mergeReward(aggregated, def.reward);
      claimed = true;
    }
  }

  // Also claim all-dailies bonus if all missions are now claimed
  const allClaimed = state.dailyMissions.missions.every(m => m.claimed);
  if (allClaimed && !state.dailyMissions.allClaimedBonus) {
    state.dailyMissions.allClaimedBonus = true;
    mergeReward(aggregated, ALL_DAILIES_BONUS);
    claimed = true;
  }

  if (!claimed) return null;
  saveRewardState(state);
  applyReward(aggregated);
  return aggregated;
}

export function getUnclaimedMissionCount(): number {
  const state = ensureDailyReset(loadOrInitRewardState());
  const todayDefs = selectDailyMissions(state.dailyMissions.date);
  let count = 0;

  for (const mission of state.dailyMissions.missions) {
    const def = todayDefs.find(d => d.id === mission.missionId);
    if (def && !mission.claimed && mission.current >= def.target) count++;
  }

  // Check all-dailies bonus
  const allClaimed = state.dailyMissions.missions.every(m => m.claimed);
  if (allClaimed && !state.dailyMissions.allClaimedBonus) count++;

  return count;
}

// ---------------------------------------------------------------------------
// Trophies
// ---------------------------------------------------------------------------

export function checkAndUpdateTrophies(): void {
  const state = loadOrInitRewardState();

  for (const trophy of state.trophyProgress) {
    const statKey = getTrophyStat(trophy.trophyId);
    if (statKey) {
      trophy.current = state.stats[statKey];
    }
  }

  saveRewardState(state);
}

export function claimTrophyTier(trophyId: string, tierIndex: number): MissionReward | null {
  const state = loadOrInitRewardState();
  const def = TROPHIES.find(t => t.id === trophyId);
  const progress = state.trophyProgress.find(t => t.trophyId === trophyId);
  if (!def || !progress) return null;

  const tier = def.tiers[tierIndex];
  if (!tier) return null;
  if (progress.claimedTiers.includes(tierIndex)) return null;
  if (progress.current < tier.threshold) return null;

  progress.claimedTiers.push(tierIndex);
  saveRewardState(state);
  applyReward(tier.reward);
  return tier.reward;
}

export function claimAllTrophyTiers(): MissionReward | null {
  const state = loadOrInitRewardState();
  const aggregated: MissionReward = {};
  let claimed = false;

  for (const progress of state.trophyProgress) {
    const def = TROPHIES.find(t => t.id === progress.trophyId);
    if (!def) continue;

    for (let i = 0; i < def.tiers.length; i++) {
      if (!progress.claimedTiers.includes(i) && progress.current >= def.tiers[i].threshold) {
        progress.claimedTiers.push(i);
        mergeReward(aggregated, def.tiers[i].reward);
        claimed = true;
      }
    }
  }

  if (!claimed) return null;
  saveRewardState(state);
  applyReward(aggregated);
  return aggregated;
}

export function getUnclaimedTrophyCount(): number {
  const state = loadOrInitRewardState();
  let count = 0;

  for (const progress of state.trophyProgress) {
    const def = TROPHIES.find(t => t.id === progress.trophyId);
    if (!def) continue;

    for (let i = 0; i < def.tiers.length; i++) {
      if (!progress.claimedTiers.includes(i) && progress.current >= def.tiers[i].threshold) {
        count++;
      }
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// First Clear
// ---------------------------------------------------------------------------

export function isFirstClear(regionId: number, floor: number, difficulty: Difficulty): boolean {
  const state = loadOrInitRewardState();
  const key = firstClearKey(regionId, floor, difficulty);
  return !state.firstClears[key];
}

export function markFirstClear(regionId: number, floor: number, difficulty: Difficulty): void {
  const state = loadOrInitRewardState();
  const key = firstClearKey(regionId, floor, difficulty);
  state.firstClears[key] = true;
  saveRewardState(state);
}

// ---------------------------------------------------------------------------
// Monster Loot
// ---------------------------------------------------------------------------

const STAR_LOOT_RATES: Record<number, number> = { 1: 0.15, 2: 0.08, 3: 0.03 };
const DIFF_LOOT_BONUS: Record<string, number> = { normal: 0, hard: 0.02, hell: 0.05 };

export function rollMonsterLoot(
  enemies: FloorEnemy[],
  difficulty: Difficulty,
): { templateId: number; stars: 1 | 2 | 3; instanceId: string } | undefined {
  const player = loadPlayer();
  if (!player) return undefined;

  const diffBonus = DIFF_LOOT_BONUS[difficulty] ?? 0;

  for (const enemy of enemies) {
    const rate = (STAR_LOOT_RATES[enemy.stars] ?? 0.10) + diffBonus;
    if (Math.random() < rate) {
      const template = getTemplate(enemy.templateId);
      if (!template) continue;

      const instance: PokemonInstance = {
        instanceId: crypto.randomUUID(),
        templateId: enemy.templateId,
        ownerId: player.id,
        level: 1,
        stars: enemy.stars,
        exp: 0,
        isShiny: Math.random() < SHINY_RATE,
        skillLevels: [1, 1, 1],
      };

      addToCollection([instance]);
      trackStat('totalMonsterLoots', 1);
      trackStat('totalMonstersCollected', 1);
      incrementMission('collect_monster', 1);

      // Update unique count
      const collection = loadCollection();
      const uniqueIds = new Set(collection.map(c => c.templateId));
      const state = loadOrInitRewardState();
      state.stats.uniqueMonstersOwned = uniqueIds.size;
      saveRewardState(state);

      return { templateId: enemy.templateId, stars: enemy.stars, instanceId: instance.instanceId };
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Stat Tracking
// ---------------------------------------------------------------------------

export function trackStat(stat: keyof PlayerLifetimeStats, increment: number): void {
  const state = loadOrInitRewardState();
  state.stats[stat] = (state.stats[stat] ?? 0) + increment;
  saveRewardState(state);
}

// ---------------------------------------------------------------------------
// Reward Preview
// ---------------------------------------------------------------------------

export interface FloorRewardPreview {
  regularPokeballs: number;
  premiumPokeballs: number;
  isFirstClear: boolean;
  possibleMonsters: Array<{ templateId: number; stars: number; dropRate: number }>;
}

export function getFloorRewardPreview(
  regionId: number,
  floor: number,
  difficulty: Difficulty,
  enemies: FloorEnemy[],
): FloorRewardPreview {
  const isBoss = regionId === 10 || floor === getFloorCount(regionId);
  const diffMult = DIFFICULTY_REWARD_MULT[difficulty];
  const bossMult = isBoss ? 3 : 1;
  const pokeballBase = 2 + regionId + Math.floor(floor / 3);
  const pokeballs = Math.floor(pokeballBase * diffMult * bossMult);

  const first = isFirstClear(regionId, floor, difficulty);
  const diffBonus = DIFF_LOOT_BONUS[difficulty] ?? 0;

  const possibleMonsters = enemies.map(e => ({
    templateId: e.templateId,
    stars: e.stars,
    dropRate: (STAR_LOOT_RATES[e.stars] ?? 0.10) + diffBonus,
  }));

  return {
    regularPokeballs: first ? pokeballs : 0,
    premiumPokeballs: (isBoss && first) ? 1 : 0,
    isFirstClear: first,
    possibleMonsters,
  };
}

// ---------------------------------------------------------------------------
// Merge Reward Helper
// ---------------------------------------------------------------------------

function mergeReward(target: MissionReward, source: MissionReward): void {
  if (source.regularPokeballs) target.regularPokeballs = (target.regularPokeballs ?? 0) + source.regularPokeballs;
  if (source.premiumPokeballs) target.premiumPokeballs = (target.premiumPokeballs ?? 0) + source.premiumPokeballs;
  if (source.energy) target.energy = (target.energy ?? 0) + source.energy;
  if (source.trainerXp) target.trainerXp = (target.trainerXp ?? 0) + source.trainerXp;
  if (source.dittos) target.dittos = (target.dittos ?? 0) + source.dittos;
  if (source.legendaryPokeballs) target.legendaryPokeballs = (target.legendaryPokeballs ?? 0) + source.legendaryPokeballs;
  if (source.stardust) target.stardust = (target.stardust ?? 0) + source.stardust;
}

// ---------------------------------------------------------------------------
// Apply Reward Helper
// ---------------------------------------------------------------------------

export function applyReward(reward: MissionReward): void {
  const player = loadPlayer();
  if (!player) return;

  const updates: Partial<typeof player> = {};
  if (reward.regularPokeballs) updates.regularPokeballs = player.regularPokeballs + reward.regularPokeballs;
  if (reward.premiumPokeballs) updates.premiumPokeballs = player.premiumPokeballs + reward.premiumPokeballs;
  if (reward.energy) updates.energy = player.energy + reward.energy;

  if (reward.essences) {
    const materials = { ...(player.materials ?? {}) };
    for (const [essId, qty] of Object.entries(reward.essences)) {
      materials[essId] = (materials[essId] ?? 0) + qty;
    }
    updates.materials = materials;
  }

  savePlayer({ ...player, ...updates });

  // Trainer XP
  if (reward.trainerXp) {
    grantTrainerXp(reward.trainerXp);
  }

  // Held item reward
  if (reward.heldItem) {
    const { setId, stars, grade, slot } = reward.heldItem;
    const actualSlot = slot ?? (Math.ceil(Math.random() * 6) as 1 | 2 | 3 | 4 | 5 | 6);
    const p = loadPlayer();
    if (p) {
      const item = generateItem(setId, actualSlot, stars, grade, p.id);
      addHeldItem(item);
    }
  }

  // Ditto reward — create Ditto instances and add to collection
  if (reward.dittos && reward.dittos > 0) {
    const p = loadPlayer();
    if (p) {
      const dittoTemplate = getTemplate(DITTO_TEMPLATE_ID);
      if (dittoTemplate) {
        const instances: PokemonInstance[] = [];
        for (let i = 0; i < reward.dittos; i++) {
          instances.push({
            instanceId: crypto.randomUUID(),
            templateId: DITTO_TEMPLATE_ID,
            ownerId: p.id,
            level: 1,
            stars: dittoTemplate.naturalStars,
            exp: 0,
            isShiny: false,
            skillLevels: [1, 1, 1],
          });
        }
        addToCollection(instances);
        trackStat('totalMonstersCollected', reward.dittos);
      }
    }
  }

  // Legendary pokeball reward
  if (reward.legendaryPokeballs && reward.legendaryPokeballs > 0) {
    const p = loadPlayer();
    if (p) {
      savePlayer({
        ...p,
        legendaryPokeballs: (p.legendaryPokeballs ?? 0) + reward.legendaryPokeballs,
      });
    }
  }

  // Stardust reward
  if (reward.stardust && reward.stardust > 0) {
    const p = loadPlayer();
    if (p) {
      savePlayer({
        ...p,
        stardust: (p.stardust ?? 0) + reward.stardust,
      });
    }
  }
}
