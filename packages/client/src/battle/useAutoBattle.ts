import { useState, useEffect, useRef, useCallback } from 'react';
import type { BattleState } from '@gatchamon/shared';
import { saveBattleSettings } from '../services/storage';
import { pickBestAction } from './autoBattleAI';

type Phase = 'player_turn' | 'animating' | 'victory' | 'defeat';

export function useAutoBattle(
  state: BattleState | null,
  phase: Phase,
  handleAction: (skillId: string, targetId: string) => Promise<void>,
  isPaused: boolean,
  battleSpeedRef?: React.RefObject<number>,
  initialAuto?: boolean,
): { isAutoOn: boolean; toggleAuto: () => void } {
  const [isAutoOn, setIsAutoOn] = useState(initialAuto ?? false);
  const handleActionRef = useRef(handleAction);
  handleActionRef.current = handleAction;
  const isFirstAction = useRef(true);

  const toggleAuto = useCallback(() => setIsAutoOn(prev => {
    const next = !prev;
    saveBattleSettings({ auto: next });
    return next;
  }), []);

  useEffect(() => {
    if (!isAutoOn || phase !== 'player_turn' || !state || isPaused) return;

    const actor = state.playerTeam.find(m => m.instanceId === state.currentActorId);
    if (!actor || !actor.isAlive || !actor.isPlayerOwned) return;

    const best = pickBestAction(actor, state);
    if (!best) return;

    const spd = battleSpeedRef?.current ?? 1;
    const firstDelay = isFirstAction.current ? 1000 : 0;
    const timer = setTimeout(() => {
      isFirstAction.current = false;
      handleActionRef.current(best.skillId, best.targetId);
    }, firstDelay + 300 / spd);

    return () => clearTimeout(timer);
  }, [isAutoOn, phase, state, isPaused]);

  return { isAutoOn, toggleAuto };
}
