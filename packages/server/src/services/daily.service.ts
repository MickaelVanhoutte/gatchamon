import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/schema.js';
import type { RewardState, MissionReward, InboxItem, MissionDefinition } from '@gatchamon/shared';
import {
  selectDailyMissions,
  MISSION_POOL,
  LOGIN_CALENDAR_REWARDS,
  LOGIN_CALENDAR_DAYS,
  ROULETTE_SLOTS,
  isBeginnerBonusActive,
} from '@gatchamon/shared';
import { earnPokedollars, earnStardust } from './player.service.js';

// ── Reward State ───────────────────────────────────────────────────────

function loadRewardState(playerId: string): RewardState | null {
  const row = getDb().prepare('SELECT * FROM reward_state WHERE player_id = ?').get(playerId) as any;
  if (!row) return null;
  return {
    dailyMissions: JSON.parse(row.daily_missions),
    trophyProgress: JSON.parse(row.trophy_progress),
    firstClears: JSON.parse(row.first_clears),
    stats: JSON.parse(row.stats),
  } as RewardState;
}

function saveRewardState(playerId: string, state: RewardState): void {
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM reward_state WHERE player_id = ?').get(playerId);
  if (existing) {
    db.prepare(
      'UPDATE reward_state SET daily_missions = ?, trophy_progress = ?, first_clears = ?, stats = ? WHERE player_id = ?'
    ).run(
      JSON.stringify(state.dailyMissions),
      JSON.stringify(state.trophyProgress),
      JSON.stringify(state.firstClears),
      JSON.stringify(state.stats),
      playerId,
    );
  } else {
    db.prepare(
      'INSERT INTO reward_state (player_id, daily_missions, trophy_progress, first_clears, stats) VALUES (?, ?, ?, ?, ?)'
    ).run(
      playerId,
      JSON.stringify(state.dailyMissions),
      JSON.stringify(state.trophyProgress),
      JSON.stringify(state.firstClears),
      JSON.stringify(state.stats),
    );
  }
}

export function getRewardState(playerId: string): RewardState {
  const existing = loadRewardState(playerId);
  if (existing) return existing;
  // Bootstrap empty state
  const state: RewardState = {
    dailyMissions: { date: '', missions: [], allClaimedBonus: false },
    trophyProgress: [],
    firstClears: {},
    stats: {} as any,
  };
  saveRewardState(playerId, state);
  return state;
}

export function getDailyMissions(playerId: string) {
  const state = getRewardState(playerId);
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyMissions.date !== today) {
    const defs = selectDailyMissions(today);
    state.dailyMissions = {
      date: today,
      missions: defs.map(d => ({ missionId: d.id, current: 0, claimed: false })),
      allClaimedBonus: false,
    };
    saveRewardState(playerId, state);
  }
  return state.dailyMissions;
}

export function claimMissionReward(playerId: string, missionId: string): MissionReward | null {
  const state = getRewardState(playerId);
  const mission = state.dailyMissions.missions.find(m => m.missionId === missionId);
  if (!mission) return null;
  const def = MISSION_POOL.find(d => d.id === missionId);
  if (!def) return null;
  if (mission.claimed || mission.current < def.target) return null;
  mission.claimed = true;
  saveRewardState(playerId, state);
  applyReward(playerId, def.reward);
  return def.reward;
}

export function getTrophyProgress(playerId: string) {
  const state = getRewardState(playerId);
  return state.trophyProgress;
}

export function claimTrophyTier(playerId: string, trophyId: string, tierIndex: number): MissionReward | null {
  const state = getRewardState(playerId);
  const trophy = state.trophyProgress.find(t => t.trophyId === trophyId);
  if (!trophy) return null;
  if (trophy.claimedTiers.includes(tierIndex)) return null;
  // Mark tier as claimed
  trophy.claimedTiers.push(tierIndex);
  saveRewardState(playerId, state);
  // TODO: look up trophy definition to get tier reward when trophy defs are added to shared
  return null;
}

// ── First Clears ───────────────────────────────────────────────────────

export function isFirstClear(playerId: string, regionId: number, floor: number, difficulty: string): boolean {
  const state = getRewardState(playerId);
  const key = `${difficulty}_${regionId}_${floor}`;
  return !state.firstClears[key];
}

export function markFirstClear(playerId: string, regionId: number, floor: number, difficulty: string): void {
  const state = getRewardState(playerId);
  const key = `${difficulty}_${regionId}_${floor}`;
  state.firstClears[key] = true;
  saveRewardState(playerId, state);
}

// ── Inbox ──────────────────────────────────────────────────────────────

export function getInbox(playerId: string): InboxItem[] {
  const now = new Date().toISOString();
  const rows = getDb().prepare(
    "SELECT * FROM inbox WHERE player_id = ? AND (expires_at IS NULL OR expires_at > ?) ORDER BY created_at DESC"
  ).all(playerId, now) as any[];
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    message: r.message,
    reward: r.reward ? JSON.parse(r.reward) : undefined,
    specialItem: r.special_item ?? undefined,
    read: !!r.read,
    claimed: !!r.claimed,
    createdAt: r.created_at,
    expiresAt: r.expires_at ?? undefined,
  }));
}

export function claimInboxReward(playerId: string, inboxId: string): MissionReward | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM inbox WHERE id = ? AND player_id = ?').get(inboxId, playerId) as any;
  if (!row || row.claimed) return null;
  db.prepare('UPDATE inbox SET claimed = 1 WHERE id = ?').run(inboxId);
  if (row.reward) {
    const reward = JSON.parse(row.reward) as MissionReward;
    applyReward(playerId, reward);
    return reward;
  }
  return null;
}

export function sendInboxItem(
  playerId: string,
  item: { title: string; message: string; reward?: MissionReward; specialItem?: string; expiresAt?: string },
): void {
  getDb().prepare(
    'INSERT INTO inbox (id, player_id, title, message, reward, special_item, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    uuidv4(), playerId, item.title, item.message,
    item.reward ? JSON.stringify(item.reward) : null,
    item.specialItem ?? null,
    item.expiresAt ?? null,
  );
}

// ── Login Calendar ─────────────────────────────────────────────────────

export function getLoginCalendar(playerId: string) {
  const db = getDb();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const today = now.toISOString().slice(0, 10);
  const currentDay = Math.min(now.getDate(), LOGIN_CALENDAR_DAYS);

  let row = db.prepare('SELECT * FROM login_calendar WHERE player_id = ?').get(playerId) as any;
  if (!row || row.month !== month) {
    // Reset for new month
    if (row) {
      db.prepare('UPDATE login_calendar SET month = ?, claimed_days = ?, last_claim_date = ? WHERE player_id = ?')
        .run(month, '[]', '', playerId);
    } else {
      db.prepare('INSERT INTO login_calendar (player_id, month, claimed_days, last_claim_date) VALUES (?, ?, ?, ?)')
        .run(playerId, month, '[]', '');
    }
    row = { month, claimed_days: '[]', last_claim_date: '' };
  }

  const claimedDays = JSON.parse(row.claimed_days) as number[];
  const canClaim = row.last_claim_date !== today;

  return { month, claimedDays, canClaim, currentDay };
}

export function claimLoginCalendarDay(playerId: string): MissionReward | null {
  const state = getLoginCalendar(playerId);
  if (!state.canClaim) return null;

  const today = new Date().toISOString().slice(0, 10);
  const dayIndex = state.claimedDays.length;
  if (dayIndex >= LOGIN_CALENDAR_DAYS) return null;

  const reward = LOGIN_CALENDAR_REWARDS[dayIndex];
  if (!reward) return null;

  state.claimedDays.push(dayIndex + 1);
  getDb().prepare('UPDATE login_calendar SET claimed_days = ?, last_claim_date = ? WHERE player_id = ?')
    .run(JSON.stringify(state.claimedDays), today, playerId);

  applyReward(playerId, reward);
  return reward;
}

// ── Daily Roulette ─────────────────────────────────────────────────────

export function getRoulette(playerId: string) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const playerRow = db.prepare('SELECT created_at FROM players WHERE id = ?').get(playerId) as any;
  const isBeginner = playerRow ? isBeginnerBonusActive(playerRow.created_at) : false;
  const maxSpins = isBeginner ? 2 : 1;

  let row = db.prepare('SELECT * FROM daily_roulette WHERE player_id = ?').get(playerId) as any;
  if (!row || row.last_spin_date !== today) {
    if (row) {
      db.prepare('UPDATE daily_roulette SET last_spin_date = ?, spins_today = 0 WHERE player_id = ?')
        .run(today, playerId);
    } else {
      db.prepare('INSERT INTO daily_roulette (player_id, last_spin_date, spins_today) VALUES (?, ?, 0)')
        .run(playerId, today);
    }
    row = { spins_today: 0 };
  }

  return { remaining: maxSpins - row.spins_today, maxSpins };
}

export function spinRoulette(playerId: string): { slotIndex: number; reward: MissionReward } | null {
  const state = getRoulette(playerId);
  if (state.remaining <= 0) return null;

  // Weighted random slot
  const totalWeight = ROULETTE_SLOTS.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * totalWeight;
  let slotIndex = 0;
  for (let i = 0; i < ROULETTE_SLOTS.length; i++) {
    roll -= ROULETTE_SLOTS[i].weight;
    if (roll <= 0) { slotIndex = i; break; }
  }

  const slot = ROULETTE_SLOTS[slotIndex];
  getDb().prepare('UPDATE daily_roulette SET spins_today = spins_today + 1 WHERE player_id = ?').run(playerId);
  applyReward(playerId, slot.reward);
  return { slotIndex, reward: slot.reward };
}

// ── Foraging ───────────────────────────────────────────────────────────

export function getForagingState(playerId: string) {
  const row = getDb().prepare('SELECT * FROM foraging_state WHERE player_id = ?').get(playerId) as any;
  if (!row) return { accumulatedMs: 0, pendingFinds: {}, lastSaveTs: 0 };
  return {
    accumulatedMs: row.accumulated_ms,
    pendingFinds: JSON.parse(row.pending_finds),
    lastSaveTs: row.last_save_ts,
  };
}

export function claimForagingFinds(playerId: string): number {
  const state = getForagingState(playerId);
  const count = Object.keys(state.pendingFinds).length;
  if (count === 0) return 0;

  // Apply all pending finds
  for (const find of Object.values(state.pendingFinds) as any[]) {
    applyForagingFind(playerId, find);
  }

  // Reset
  const db = getDb();
  const existing = db.prepare('SELECT 1 FROM foraging_state WHERE player_id = ?').get(playerId);
  if (existing) {
    db.prepare("UPDATE foraging_state SET pending_finds = '{}', accumulated_ms = 0 WHERE player_id = ?")
      .run(playerId);
  }
  return count;
}

function applyForagingFind(playerId: string, find: any): void {
  const db = getDb();
  if (find.type === 'pokedollars') {
    db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?').run(find.amount, playerId);
  } else if (find.type === 'stardust') {
    db.prepare('UPDATE players SET stardust = stardust + ? WHERE id = ?').run(find.amount, playerId);
  } else if (find.type === 'regularPokeballs') {
    db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs + ? WHERE id = ?').run(find.amount, playerId);
  } else if (find.type === 'premiumPokeballs') {
    db.prepare('UPDATE players SET premium_pokeballs = premium_pokeballs + ? WHERE id = ?').run(find.amount, playerId);
  } else if (find.type === 'essence') {
    const playerRow = db.prepare('SELECT materials FROM players WHERE id = ?').get(playerId) as any;
    const materials = playerRow?.materials ? JSON.parse(playerRow.materials) : {};
    materials[find.essenceId] = (materials[find.essenceId] ?? 0) + find.amount;
    db.prepare('UPDATE players SET materials = ? WHERE id = ?').run(JSON.stringify(materials), playerId);
  }
}

// ── Shop ───────────────────────────────────────────────────────────────

import { spendStardust } from './player.service.js';
import { shopSummonMultiPremium, shopSummonSingleLegendary } from './gacha.service.js';

const SHOP_ITEMS: Record<string, { cost: number; apply: (playerId: string) => any }> = {
  speed_x3: {
    cost: 100,
    apply: (playerId) => {
      const db = getDb();
      db.prepare('INSERT OR IGNORE INTO granted_flags (player_id, flag) VALUES (?, ?)').run(playerId, 'speed_x3');
      return { granted: 'speed_x3' };
    },
  },
  energy_pack_100: {
    cost: 50,
    apply: (playerId) => {
      getDb().prepare('UPDATE players SET energy = energy + 100 WHERE id = ?').run(playerId);
      return { energy: 100 };
    },
  },
  glowing_pack_3: {
    cost: 200,
    apply: (playerId) => {
      getDb().prepare('UPDATE players SET glowing_pokeballs = glowing_pokeballs + 3 WHERE id = ?').run(playerId);
      return { glowingPokeballs: 3 };
    },
  },
  premium_pack_10: {
    cost: 300,
    apply: (playerId) => {
      const results = shopSummonMultiPremium(playerId);
      return { summonResults: results };
    },
  },
  legendary_bundle: {
    cost: 1000,
    apply: (playerId) => {
      const legendary = shopSummonSingleLegendary(playerId);
      const premiums = [
        shopSummonMultiPremium(playerId),
        shopSummonMultiPremium(playerId),
        shopSummonMultiPremium(playerId),
      ];
      return { legendary, premiums };
    },
  },
};

export function purchaseShopItem(playerId: string, itemId: string): any {
  const shopItem = SHOP_ITEMS[itemId];
  if (!shopItem) throw new Error('Unknown shop item');
  spendStardust(playerId, shopItem.cost);
  return shopItem.apply(playerId);
}

// ── Mystery Summon (from pieces) ───────────────────────────────────────

import { PIECE_COST, getTemplate } from '@gatchamon/shared';
import type { PokemonInstance } from '@gatchamon/shared';

export function summonFromPieces(playerId: string, templateId: number): PokemonInstance {
  const db = getDb();
  const template = getTemplate(templateId);
  if (!template) throw new Error('Unknown template');

  const cost = PIECE_COST[template.naturalStars];
  if (!cost) throw new Error('Cannot summon this monster from pieces');

  const playerRow = db.prepare('SELECT mystery_pieces FROM players WHERE id = ?').get(playerId) as any;
  if (!playerRow) throw new Error('Player not found');
  const pieces = playerRow.mystery_pieces ? JSON.parse(playerRow.mystery_pieces) : {};
  if ((pieces[templateId] ?? 0) < cost) throw new Error('Not enough pieces');

  pieces[templateId] -= cost;
  if (pieces[templateId] <= 0) delete pieces[templateId];
  db.prepare('UPDATE players SET mystery_pieces = ? WHERE id = ?').run(JSON.stringify(pieces), playerId);

  const isShiny = Math.random() < 0.001;
  const instance: PokemonInstance = {
    instanceId: uuidv4(),
    templateId,
    ownerId: playerId,
    level: 1,
    stars: template.naturalStars,
    exp: 0,
    isShiny,
    skillLevels: [1, 1, 1],
  };

  db.prepare(
    'INSERT INTO pokemon_instances (instance_id, template_id, owner_id, level, stars, exp, is_shiny, skill_levels) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(instance.instanceId, instance.templateId, instance.ownerId, instance.level, instance.stars, instance.exp, isShiny ? 1 : 0, JSON.stringify(instance.skillLevels));

  return instance;
}

// ── Granted Flags ──────────────────────────────────────────────────────

export function hasGrantedFlag(playerId: string, flag: string): boolean {
  const row = getDb().prepare('SELECT 1 FROM granted_flags WHERE player_id = ? AND flag = ?').get(playerId, flag);
  return !!row;
}

export function setGrantedFlag(playerId: string, flag: string): void {
  getDb().prepare('INSERT OR IGNORE INTO granted_flags (player_id, flag) VALUES (?, ?)').run(playerId, flag);
}

// ── Dungeon Records ────────────────────────────────────────────────────

export function getDungeonRecords(playerId: string): Record<string, { maxFloor: number; bestTimeSec: number }> {
  const rows = getDb().prepare('SELECT * FROM dungeon_records WHERE player_id = ?').all(playerId) as any[];
  const records: Record<string, { maxFloor: number; bestTimeSec: number }> = {};
  for (const r of rows) {
    records[r.dungeon_key] = { maxFloor: r.max_floor, bestTimeSec: r.best_time_sec };
  }
  return records;
}

export function saveDungeonRecord(playerId: string, key: string, floor: number, timeSec: number): void {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM dungeon_records WHERE player_id = ? AND dungeon_key = ?').get(playerId, key) as any;
  if (!existing) {
    db.prepare('INSERT INTO dungeon_records (player_id, dungeon_key, max_floor, best_time_sec) VALUES (?, ?, ?, ?)')
      .run(playerId, key, floor, timeSec);
  } else if (floor > existing.max_floor || (floor === existing.max_floor && timeSec < existing.best_time_sec)) {
    db.prepare('UPDATE dungeon_records SET max_floor = ?, best_time_sec = ? WHERE player_id = ? AND dungeon_key = ?')
      .run(floor, timeSec, playerId, key);
  }
}

// ── Generic reward application ─────────────────────────────────────────

function applyReward(playerId: string, reward: MissionReward): void {
  const db = getDb();
  if (reward.regularPokeballs) {
    db.prepare('UPDATE players SET regular_pokeballs = regular_pokeballs + ? WHERE id = ?')
      .run(reward.regularPokeballs, playerId);
  }
  if (reward.premiumPokeballs) {
    db.prepare('UPDATE players SET premium_pokeballs = premium_pokeballs + ? WHERE id = ?')
      .run(reward.premiumPokeballs, playerId);
  }
  if (reward.legendaryPokeballs) {
    db.prepare('UPDATE players SET legendary_pokeballs = legendary_pokeballs + ? WHERE id = ?')
      .run(reward.legendaryPokeballs, playerId);
  }
  if (reward.glowingPokeballs) {
    db.prepare('UPDATE players SET glowing_pokeballs = glowing_pokeballs + ? WHERE id = ?')
      .run(reward.glowingPokeballs, playerId);
  }
  if (reward.energy) {
    db.prepare('UPDATE players SET energy = energy + ? WHERE id = ?').run(reward.energy, playerId);
  }
  if (reward.stardust) {
    db.prepare('UPDATE players SET stardust = stardust + ? WHERE id = ?').run(reward.stardust, playerId);
  }
  if (reward.pokedollars) {
    db.prepare('UPDATE players SET pokedollars = pokedollars + ? WHERE id = ?').run(reward.pokedollars, playerId);
  }
  if (reward.essences) {
    const playerRow = db.prepare('SELECT materials FROM players WHERE id = ?').get(playerId) as any;
    const materials = playerRow?.materials ? JSON.parse(playerRow.materials) : {};
    for (const [key, qty] of Object.entries(reward.essences)) {
      materials[key] = (materials[key] ?? 0) + (qty as number);
    }
    db.prepare('UPDATE players SET materials = ? WHERE id = ?').run(JSON.stringify(materials), playerId);
  }
}
