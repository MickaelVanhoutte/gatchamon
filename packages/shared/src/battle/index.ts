export {
  allDead,
  hasBuff,
  hasDebuff,
  getEffectiveStats,
  getCCState,
  advanceToNextActor,
  simulateTimeline,
  processStartOfTurn,
  processPassiveTrigger,
  applyPassives,
  resolveSkill,
  pickEnemyAction,
  checkBattleEnd,
  autoResolveEnemyTurns,
} from './engine.js';
export type { CCResult, TimelineEntry, TurnStartResult } from './engine.js';
