/**
 * Server API calls for all game operations.
 * Used when USE_SERVER is enabled — all game logic runs server-side.
 */
import type { Player, PokemonInstance, PokemonTemplate, HeldItemInstance, PokeballType } from '@gatchamon/shared';
import { api } from './api';
import { getPlayerId } from '../config';

function pid(): string {
  const id = getPlayerId();
  if (!id) throw new Error('No player ID');
  return id;
}

// ── Player ────────────────────────────────────────────────────────────

export async function loadPlayer(): Promise<Player | null> {
  const id = getPlayerId();
  if (!id) return null;
  try {
    return await api.get<Player>(`/player/${id}`);
  } catch {
    return null;
  }
}

export async function allocateTrainerSkill(skill: string): Promise<{ trainerSkills: any }> {
  return api.post(`/player/${pid()}/trainer-skill`, { skill });
}

// ── Summon ─────────────────────────────────────────────────────────────

export interface SummonResultServer {
  results: Array<{ pokemon: PokemonInstance; template: PokemonTemplate }>;
}

export async function summon(count: 1 | 10, type: PokeballType): Promise<SummonResultServer> {
  return api.post<SummonResultServer>('/summon', { playerId: pid(), count, type });
}

export async function shopSummon(type: 'premium_multi' | 'legendary_single'): Promise<SummonResultServer> {
  return api.post<SummonResultServer>('/summon/shop', { playerId: pid(), type });
}

// ── Collection ────────────────────────────────────────────────────────

export interface CollectionResponse {
  collection: Array<{ instance: PokemonInstance; template: PokemonTemplate }>;
}

export async function loadCollection(): Promise<CollectionResponse> {
  return api.get<CollectionResponse>(`/collection/${pid()}`);
}

export async function loadPcBox(): Promise<{ pcBox: Array<{ instance: PokemonInstance; template: PokemonTemplate }> }> {
  return api.get(`/collection/${pid()}/pc`);
}

export async function transferPokemon(instanceIds: string[], to: 'collection' | 'pc'): Promise<void> {
  await api.post(`/collection/${pid()}/transfer`, { instanceIds, to });
}

export async function setPcAutoSend(enabled: boolean): Promise<void> {
  await api.put(`/collection/${pid()}/pc-auto-send`, { enabled });
}

// ── Monster Management ────────────────────────────────────────────────

export async function performMerge(baseInstanceId: string, fodderInstanceId: string): Promise<{ instance: PokemonInstance }> {
  return api.post('/merge', { playerId: pid(), baseInstanceId, fodderInstanceId });
}

export async function performAltarFeed(baseInstanceId: string, fodderInstanceIds: string[]): Promise<any> {
  return api.post('/altar/feed', { playerId: pid(), baseInstanceId, fodderInstanceIds });
}

export async function performEvolution(instanceId: string, targetTemplateId: number): Promise<{ instance: PokemonInstance }> {
  return api.post('/evolution/perform', { playerId: pid(), instanceId, targetTemplateId });
}

export async function performTypeChange(instanceId: string, targetTemplateId: number): Promise<{ instance: PokemonInstance }> {
  return api.post('/type-change/perform', { playerId: pid(), instanceId, targetTemplateId });
}

export async function performEssenceMerge(element: string, targetTier: string, targetCount: number): Promise<{ materials: Record<string, number> }> {
  return api.post('/essence-merge', { playerId: pid(), element, targetTier, targetCount });
}

// ── Held Items ────────────────────────────────────────────────────────

export async function loadHeldItems(): Promise<HeldItemInstance[]> {
  const res = await api.get<{ items: HeldItemInstance[] }>(`/items/${pid()}`);
  return res.items;
}

export async function equipItem(itemId: string, pokemonInstanceId: string): Promise<void> {
  await api.post('/items/equip', { playerId: pid(), itemId, pokemonInstanceId });
}

export async function unequipItem(itemId: string): Promise<void> {
  await api.post('/items/unequip', { playerId: pid(), itemId });
}

export async function upgradeItem(itemId: string): Promise<any> {
  return api.post('/items/upgrade', { playerId: pid(), itemId });
}

export async function sellItems(itemIds: string[]): Promise<{ totalValue: number }> {
  return api.post('/items/sell', { playerId: pid(), itemIds });
}

// ── Battle ─────────────────────────────────────────────────────────────

export async function startBattle(
  teamInstanceIds: string[],
  floor: { region: number; floor: number; difficulty: string },
): Promise<any> {
  return api.post('/battle/start', { playerId: pid(), teamInstanceIds, floor });
}

export async function startDungeonBattle(
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): Promise<any> {
  return api.post('/battle/dungeon/start', { playerId: pid(), teamInstanceIds, dungeonId, floorIndex });
}

export async function startItemDungeonBattle(
  teamInstanceIds: string[],
  dungeonId: number,
  floorIndex: number,
): Promise<any> {
  return api.post('/battle/item-dungeon/start', { playerId: pid(), teamInstanceIds, dungeonId, floorIndex });
}

export async function startTowerBattle(
  teamInstanceIds: string[],
  towerFloor: number,
): Promise<any> {
  return api.post('/battle/tower/start', { playerId: pid(), teamInstanceIds, towerFloor });
}

export async function startMysteryDungeonBattle(
  teamInstanceIds: string[],
  floorIndex: number,
): Promise<any> {
  return api.post('/battle/mystery-dungeon/start', { playerId: pid(), teamInstanceIds, floorIndex });
}

export async function resolveBattleAction(
  battleId: string,
  actorInstanceId: string,
  skillId: string,
  targetInstanceId: string,
): Promise<any> {
  return api.post(`/battle/${battleId}/action`, { actorInstanceId, skillId, targetInstanceId });
}

export async function getBattleState(battleId: string): Promise<any> {
  return api.get(`/battle/${battleId}`);
}

// ── Daily / Rewards ───────────────────────────────────────────────────

export async function getDailyMissions(): Promise<any> {
  return api.get(`/daily/missions/${pid()}`);
}

export async function claimMission(missionId: string): Promise<any> {
  return api.post(`/daily/missions/${pid()}/claim`, { missionId });
}

export async function getTrophyProgress(): Promise<any> {
  return api.get(`/daily/trophies/${pid()}`);
}

export async function claimTrophy(trophyId: string, tierIndex: number): Promise<any> {
  return api.post(`/daily/trophies/${pid()}/claim`, { trophyId, tierIndex });
}

export async function getInbox(): Promise<any> {
  return api.get(`/daily/inbox/${pid()}`);
}

export async function claimInboxReward(inboxId: string): Promise<any> {
  return api.post(`/daily/inbox/${pid()}/claim`, { inboxId });
}

export async function getLoginCalendar(): Promise<any> {
  return api.get(`/daily/calendar/${pid()}`);
}

export async function claimLoginCalendarDay(): Promise<any> {
  return api.post(`/daily/calendar/${pid()}/claim`, {});
}

export async function getRoulette(): Promise<any> {
  return api.get(`/daily/roulette/${pid()}`);
}

export async function spinRoulette(): Promise<any> {
  return api.post(`/daily/roulette/${pid()}/spin`, {});
}

export async function getForagingState(): Promise<any> {
  return api.get(`/daily/foraging/${pid()}`);
}

export async function claimForaging(): Promise<any> {
  return api.post(`/daily/foraging/${pid()}/claim`, {});
}

export async function purchaseShopItem(itemId: string): Promise<any> {
  return api.post('/daily/shop/purchase', { playerId: pid(), itemId });
}

export async function summonFromPieces(templateId: number): Promise<any> {
  return api.post('/daily/mystery-summon', { playerId: pid(), templateId });
}

export async function getDungeonRecords(): Promise<any> {
  const res = await api.get<{ records: any }>(`/daily/dungeon-records/${pid()}`);
  return res.records;
}

export async function saveDungeonRecord(key: string, floor: number, timeSec: number): Promise<void> {
  await api.post(`/daily/dungeon-records/${pid()}`, { key, floor, timeSec });
}

// ── Arena ─────────────────────────────────────────────────────────────

export async function getArenaDefense(): Promise<any> {
  return api.get(`/arena/defense/${pid()}`);
}

export async function setArenaDefense(teamInstanceIds: string[]): Promise<any> {
  return api.post('/arena/defense', { playerId: pid(), teamInstanceIds });
}

export async function getArenaOpponents(): Promise<any> {
  return api.get(`/arena/opponents/${pid()}`);
}

export async function startArenaBattle(teamInstanceIds: string[], defenderId: string): Promise<any> {
  return api.post('/arena/battle/start', { playerId: pid(), teamInstanceIds, defenderId });
}

export async function startRivalBattle(teamInstanceIds: string[], rivalId: string): Promise<any> {
  return api.post('/arena/rival/start', { playerId: pid(), teamInstanceIds, rivalId });
}

export async function getArenaHistory(): Promise<any> {
  return api.get(`/arena/history/${pid()}`);
}

export async function getArenaRivals(): Promise<any> {
  return api.get(`/arena/rivals/${pid()}`);
}

// ── Reset ─────────────────────────────────────────────────────────────

export async function resetPlayer(): Promise<void> {
  await api.post(`/player/${pid()}/reset`);
}

// ── Admin ─────────────────────────────────────────────────────────────

export async function adminResetPlayer(): Promise<void> {
  await api.post('/admin/reset', { playerId: pid() });
}
