/**
 * Unified data access layer.
 *
 * Routes to either localStorage (offline) or server API based on USE_SERVER.
 * Services should import from here instead of directly from storage.ts.
 *
 * Functions that are purely client-local (battle settings, tutorial, team
 * selection, story difficulty) are re-exported from storage directly since
 * they don't need server persistence.
 */

import { USE_SERVER } from '../config';
import * as local from './storage';

// ── Always-local (no server equivalent needed) ─────────────────────────
// These are re-exported directly — they stay in localStorage regardless of mode.
export {
  // Battle settings (speed, auto) — client preference only
  loadBattleSettings,
  saveBattleSettings,
  // Team selection memory — client convenience only
  getTeamKey,
  loadLastTeam,
  saveLastTeam,
  // Tutorial step — client-only flow
  loadTutorialStep,
  saveTutorialStep,
  // Story difficulty selection — client preference
  loadStoryDifficulty,
  saveStoryDifficulty,
  // Retry summon state — ephemeral session state
  loadRetrySummonState,
  saveRetrySummonState,
  clearRetrySummonState,
} from './storage';

// Re-export types that other modules depend on
export type { BattleSettings, LoginCalendarData, RouletteData, DungeonRecord, DungeonRecords } from './storage';

// ── Server-aware functions ─────────────────────────────────────────────
// In offline mode these delegate to localStorage.
// In server mode they will delegate to API calls (to be implemented as
// server endpoints are built). For now, they all fall through to local.
//
// This file is the ONLY place that needs to change when wiring up each
// server endpoint — no other service file needs to be touched.

// ── Player ─────────────────────────────────────────────────────────────
export const loadPlayer = USE_SERVER ? local.loadPlayer : local.loadPlayer;
export const savePlayer = USE_SERVER ? local.savePlayer : local.savePlayer;

// ── Collection ─────────────────────────────────────────────────────────
export const loadCollection = USE_SERVER ? local.loadCollection : local.loadCollection;
export const saveCollection = USE_SERVER ? local.saveCollection : local.saveCollection;
export const addToCollection = USE_SERVER ? local.addToCollection : local.addToCollection;
export const updateInstance = USE_SERVER ? local.updateInstance : local.updateInstance;

// ── PC Box ─────────────────────────────────────────────────────────────
export const loadPcBox = USE_SERVER ? local.loadPcBox : local.loadPcBox;
export const savePcBox = USE_SERVER ? local.savePcBox : local.savePcBox;
export const addToPcBox = USE_SERVER ? local.addToPcBox : local.addToPcBox;
export const removeFromPcBox = USE_SERVER ? local.removeFromPcBox : local.removeFromPcBox;
export const loadPcAutoSend = USE_SERVER ? local.loadPcAutoSend : local.loadPcAutoSend;
export const savePcAutoSend = USE_SERVER ? local.savePcAutoSend : local.savePcAutoSend;

// ── Held Items ─────────────────────────────────────────────────────────
export const loadHeldItems = USE_SERVER ? local.loadHeldItems : local.loadHeldItems;
export const saveHeldItems = USE_SERVER ? local.saveHeldItems : local.saveHeldItems;
export const addHeldItem = USE_SERVER ? local.addHeldItem : local.addHeldItem;
export const updateHeldItem = USE_SERVER ? local.updateHeldItem : local.updateHeldItem;
export const getItemsForPokemon = USE_SERVER ? local.getItemsForPokemon : local.getItemsForPokemon;

// ── Rewards / Missions ─────────────────────────────────────────────────
export const loadRewardState = USE_SERVER ? local.loadRewardState : local.loadRewardState;
export const saveRewardState = USE_SERVER ? local.saveRewardState : local.saveRewardState;

// ── Inbox ──────────────────────────────────────────────────────────────
export const loadInbox = USE_SERVER ? local.loadInbox : local.loadInbox;
export const saveInbox = USE_SERVER ? local.saveInbox : local.saveInbox;
export const addInboxItem = USE_SERVER ? local.addInboxItem : local.addInboxItem;
export const updateInboxItem = USE_SERVER ? local.updateInboxItem : local.updateInboxItem;
export const removeReadInboxItems = USE_SERVER ? local.removeReadInboxItems : local.removeReadInboxItems;

// ── Login Calendar ─────────────────────────────────────────────────────
export const loadLoginCalendar = USE_SERVER ? local.loadLoginCalendar : local.loadLoginCalendar;
export const saveLoginCalendar = USE_SERVER ? local.saveLoginCalendar : local.saveLoginCalendar;

// ── Daily Roulette ─────────────────────────────────────────────────────
export const loadRoulette = USE_SERVER ? local.loadRoulette : local.loadRoulette;
export const saveRoulette = USE_SERVER ? local.saveRoulette : local.saveRoulette;

// ── Granted Flags ──────────────────────────────────────────────────────
export const hasGrantedFlag = USE_SERVER ? local.hasGrantedFlag : local.hasGrantedFlag;
export const setGrantedFlag = USE_SERVER ? local.setGrantedFlag : local.setGrantedFlag;

// ── Dungeon Records ────────────────────────────────────────────────────
export const loadDungeonRecords = USE_SERVER ? local.loadDungeonRecords : local.loadDungeonRecords;
export const saveDungeonRecord = USE_SERVER ? local.saveDungeonRecord : local.saveDungeonRecord;

// ── Tower Reset ────────────────────────────────────────────────────────
export const checkAndResetTower = USE_SERVER ? local.checkAndResetTower : local.checkAndResetTower;

// ── Reset ──────────────────────────────────────────────────────────────
export const clearAll = USE_SERVER ? local.clearAll : local.clearAll;
