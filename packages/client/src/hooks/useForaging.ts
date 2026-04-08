import { useEffect, useRef, useCallback, useState } from 'react';
import type { ForagingFind } from '../services/foraging.service';
import {
  loadForagingState,
  saveForagingState,
  rollForagingLoot,
  grantForagingFind,
  FIND_INTERVAL_MS,
} from '../services/foraging.service';
import { useGameStore } from '../stores/gameStore';
import { USE_SERVER } from '../config';
import * as serverApi from '../services/server-api.service';

const TICK_MS = 1_000; // check every second

/** Cap offline catch-up to 2 hours so returning after days doesn't dump 10 finds at once */
const MAX_OFFLINE_MS = 2 * 60 * 60 * 1000;

function tryTriggerFind(
  state: ReturnType<typeof loadForagingState>,
  monsterIds: string[],
): boolean {
  if (state.accumulatedMs < FIND_INTERVAL_MS || monsterIds.length === 0) return false;

  const available = monsterIds.filter(id => !state.pendingFinds[id]);
  if (available.length === 0) return false;

  const pickId = available[Math.floor(Math.random() * available.length)];
  state.pendingFinds[pickId] = rollForagingLoot();
  state.accumulatedMs -= FIND_INTERVAL_MS;
  return true;
}

/**
 * Hook that tracks playtime and triggers Pokemon foraging finds
 * every ~15 minutes. In server mode, state is loaded from and
 * persisted to the server.
 */
export function useForaging(monsterIds: string[]) {
  const [pendingFinds, setPendingFinds] = useState<Record<string, ForagingFind>>(() => {
    if (USE_SERVER) return {};
    return loadForagingState().pendingFinds;
  });

  const stateRef = useRef(USE_SERVER ? null : loadForagingState());
  const monsterIdsRef = useRef(monsterIds);
  monsterIdsRef.current = monsterIds;

  const refreshPlayer = useGameStore(s => s.refreshPlayer);

  // Server mode: load foraging state on mount
  useEffect(() => {
    if (!USE_SERVER) return;
    serverApi.getForagingState().then((res: any) => {
      setPendingFinds(res.pendingFinds ?? {});
    }).catch(() => {});
  }, []);

  // Offline mode: credit elapsed time since last save
  useEffect(() => {
    if (USE_SERVER) return;
    const state = stateRef.current!;
    const elapsed = Math.min(Date.now() - state.lastSaveTs, MAX_OFFLINE_MS);
    if (elapsed > 0) {
      state.accumulatedMs += elapsed;
    }

    let changed = false;
    while (tryTriggerFind(state, monsterIdsRef.current)) {
      changed = true;
    }
    if (changed) {
      saveForagingState(state);
      setPendingFinds({ ...state.pendingFinds });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Offline mode: tick loop
  useEffect(() => {
    if (USE_SERVER) return;
    const interval = setInterval(() => {
      const state = stateRef.current!;
      state.accumulatedMs += TICK_MS;

      if (tryTriggerFind(state, monsterIdsRef.current)) {
        setPendingFinds({ ...state.pendingFinds });
      }

      if (Date.now() - state.lastSaveTs > 10_000) {
        saveForagingState(state);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      saveForagingState(stateRef.current!);
    };
  }, []);

  // Server mode: poll foraging state every 30s to pick up server-side finds
  useEffect(() => {
    if (!USE_SERVER) return;
    const interval = setInterval(() => {
      serverApi.getForagingState().then((res: any) => {
        setPendingFinds(res.pendingFinds ?? {});
      }).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Claim a find
  const claimFind = useCallback(async (pokemonId: string): Promise<ForagingFind | null> => {
    if (USE_SERVER) {
      try {
        const res = await serverApi.claimForaging();
        refreshPlayer();
        // Reload foraging state
        const updated = await serverApi.getForagingState();
        setPendingFinds((updated as any).pendingFinds ?? {});
        // Return the find that was claimed
        return pendingFinds[pokemonId] ?? null;
      } catch {
        return null;
      }
    }

    const state = stateRef.current!;
    const find = state.pendingFinds[pokemonId];
    if (!find) return null;

    grantForagingFind(find);
    refreshPlayer();

    delete state.pendingFinds[pokemonId];
    saveForagingState(state);
    setPendingFinds({ ...state.pendingFinds });

    return find;
  }, [refreshPlayer, pendingFinds]);

  return { pendingFinds, claimFind };
}
