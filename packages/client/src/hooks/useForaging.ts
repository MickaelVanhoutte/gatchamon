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

/**
 * Hook that tracks active playtime on the home page and triggers
 * Pokemon foraging finds every ~15 minutes.
 *
 * Returns:
 * - pendingFinds: map of pokemonInstanceId → ForagingFind
 * - claimFind: function to claim a find (grants reward, shows bubble)
 */
export function useForaging(monsterIds: string[]) {
  const [pendingFinds, setPendingFinds] = useState<Record<string, ForagingFind>>(() => {
    const state = loadForagingState();
    return state.pendingFinds;
  });

  const stateRef = useRef(loadForagingState());
  const monsterIdsRef = useRef(monsterIds);
  monsterIdsRef.current = monsterIds;

  const refreshPlayer = useGameStore(s => s.refreshPlayer);

  // Tick loop: accumulate playtime, trigger finds
  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current;
      state.accumulatedMs += TICK_MS;

      if (state.accumulatedMs >= FIND_INTERVAL_MS && monsterIdsRef.current.length > 0) {
        // Pick a random monster that doesn't already have a pending find
        const available = monsterIdsRef.current.filter(id => !state.pendingFinds[id]);
        if (available.length > 0) {
          const pickId = available[Math.floor(Math.random() * available.length)];
          const find = rollForagingLoot();
          state.pendingFinds[pickId] = find;
          setPendingFinds({ ...state.pendingFinds });
        }
        state.accumulatedMs = 0;
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
