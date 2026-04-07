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
 * every ~15 minutes. Time continues to accumulate even when the
 * user is on other pages — elapsed real time since last save is
 * credited when returning to the home page.
 */
export function useForaging(monsterIds: string[]) {
  const [pendingFinds, setPendingFinds] = useState<Record<string, ForagingFind>>(() => {
    return loadForagingState().pendingFinds;
  });

  const stateRef = useRef(loadForagingState());
  const monsterIdsRef = useRef(monsterIds);
  monsterIdsRef.current = monsterIds;

  const refreshPlayer = useGameStore(s => s.refreshPlayer);

  // On mount: credit elapsed time since last save (covers time on other pages / app backgrounded)
  useEffect(() => {
    const state = stateRef.current;
    const elapsed = Math.min(Date.now() - state.lastSaveTs, MAX_OFFLINE_MS);
    if (elapsed > 0) {
      state.accumulatedMs += elapsed;
    }

    // Process any finds that should have triggered during the elapsed time
    let changed = false;
    while (tryTriggerFind(state, monsterIdsRef.current)) {
      changed = true;
    }
    if (changed) {
      saveForagingState(state);
      setPendingFinds({ ...state.pendingFinds });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick loop: accumulate playtime, trigger finds
  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current;
      state.accumulatedMs += TICK_MS;

      if (tryTriggerFind(state, monsterIdsRef.current)) {
        setPendingFinds({ ...state.pendingFinds });
      }

      // Save periodically (every 10s)
      if (Date.now() - state.lastSaveTs > 10_000) {
        saveForagingState(state);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      saveForagingState(stateRef.current);
    };
  }, []);

  // Claim a find
  const claimFind = useCallback((pokemonId: string): ForagingFind | null => {
    const state = stateRef.current;
    const find = state.pendingFinds[pokemonId];
    if (!find) return null;

    // Grant the reward
    grantForagingFind(find);
    refreshPlayer();

    // Remove from pending
    delete state.pendingFinds[pokemonId];
    saveForagingState(state);
    setPendingFinds({ ...state.pendingFinds });

    return find;
  }, [refreshPlayer]);

  return { pendingFinds, claimFind };
}
