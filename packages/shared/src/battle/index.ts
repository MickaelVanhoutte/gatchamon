export {
  allDead,
  hasBuff,
  hasDebuff,
  getEffectiveStats,
  getCCState,
  advanceToNextActor,
  processStartOfTurn,
  processPassiveTrigger,
  applyPassives,
  resolveSkill,
  pickEnemyAction,
  checkBattleEnd,
  autoResolveEnemyTurns,
} from './engine.js';
export type { CCResult } from './engine.js';
