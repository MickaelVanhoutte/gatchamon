import { getDungeon, getItemDungeon, getTemplate, SKILLS, getMysteryDungeonDef } from '@gatchamon/shared';
import type { BattleResult } from '@gatchamon/shared';
import {
  startDungeonBattle,
  startItemDungeonBattle,
  startMysteryDungeonBattle,
  getBattleState,
  resolvePlayerAction,
  deleteBattle,
} from './battle.service';
import { loadPlayer } from './storage';
import { pickBestAction } from '../battle/autoBattleAI';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import type { RepeatBattleConfig } from '../stores/repeatBattleStore';
import { useGameStore } from '../stores/gameStore';

// ---------------------------------------------------------------------------
// Headless single-battle runner (no animations, no React)
// ---------------------------------------------------------------------------

function runSingleBattleHeadless(
  teamIds: string[],
  dungeonId: number,
  floorIndex: number,
  mode: 'dungeon' | 'item-dungeon' | 'mystery-dungeon',
): BattleResult {
  // Start battle (deducts energy, creates state)
  const result = mode === 'mystery-dungeon'
    ? startMysteryDungeonBattle(teamIds, floorIndex)
    : mode === 'dungeon'
      ? startDungeonBattle(teamIds, dungeonId, floorIndex)
      : startItemDungeonBattle(teamIds, dungeonId, floorIndex);

  const battleId = result.state.battleId;

  // If battle already resolved during init (e.g. passives killed all enemies)
  if (result.state.status !== 'active') {
    deleteBattle(battleId);
    return result;
  }

  // Resolve turns in a loop until battle ends
  const MAX_ITERATIONS = 600;
  let iterations = 0;
  let latestResult = result;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const state = getBattleState(battleId);
    if (!state || state.status !== 'active') break;

    const currentActor = [...state.playerTeam, ...state.enemyTeam]
      .find(m => m.instanceId === state.currentActorId);

    if (!currentActor || !currentActor.isPlayerOwned) {
      // Shouldn't happen — resolvePlayerAction auto-resolves enemy turns
      // Safety break to avoid infinite loop
      break;
    }

    // AI picks best action (basic attack always available, so this rarely returns null)
    let action = pickBestAction(currentActor, state);
    if (!action) {
      // Fallback: use first skill on first alive enemy
      const template = getTemplate(currentActor.templateId);
      const firstSkillId = template?.skillIds.find(id => SKILLS[id]?.category !== 'passive');
      const firstEnemy = state.enemyTeam.find(e => e.isAlive);
      if (!firstSkillId || !firstEnemy) break;
      action = { skillId: firstSkillId, targetId: firstEnemy.instanceId };
    }

    try {
      latestResult = resolvePlayerAction(battleId, {
        actorInstanceId: currentActor.instanceId,
        skillId: action.skillId,
        targetInstanceId: action.targetId,
      });
    } catch {
      // Battle engine error — treat as defeat
      break;
    }

    if (latestResult.state.status !== 'active') break;
  }

  // If the battle didn't resolve properly (safety breaks), force defeat
  if (latestResult.state.status === 'active') {
    (latestResult.state as any).status = 'defeat';
  }

  deleteBattle(battleId);
  return latestResult;
}

// ---------------------------------------------------------------------------
// Repeat battle orchestrator
// ---------------------------------------------------------------------------

export async function runRepeatBattles(config: RepeatBattleConfig): Promise<void> {
  const store = useRepeatBattleStore.getState;

  for (let i = 0; i < config.totalRuns; i++) {
    // Check abort
    if (store()._shouldStop) {
      store().setStatus('stopped_user');
      return;
    }

    // Check energy
    const player = loadPlayer();
    let energyCost: number;
    if (config.mode === 'mystery-dungeon') {
      const mysteryDef = getMysteryDungeonDef();
      energyCost = mysteryDef.energyCosts[config.floorIndex];
    } else {
      const dungeonDef = config.mode === 'dungeon'
        ? getDungeon(config.dungeonId)
        : getItemDungeon(config.dungeonId);
      energyCost = dungeonDef?.energyCost ?? Infinity;
    }

    if (!player || player.energy < energyCost) {
      store().setStatus('stopped_no_energy');
      return;
    }

    // Update current run counter
    store().incrementRun();

    // Yield to UI thread
    await new Promise(r => setTimeout(r, 0));

    // Run battle
    let result: BattleResult;
    try {
      result = runSingleBattleHeadless(
        config.teamIds,
        config.dungeonId,
        config.floorIndex,
        config.mode,
      );
    } catch {
      // Failed to start battle (e.g. energy deducted between check and start)
      store().setStatus('stopped_no_energy');
      return;
    }

    // Refresh game state so UI (TopHUD energy, collection) updates
    useGameStore.getState().refreshPlayer();
    useGameStore.getState().loadCollection();

    if (result.state.status === 'defeat') {
      store().setStatus('stopped_defeat');
      return;
    }

    if (result.state.status === 'victory' && result.rewards) {
      store().addRunRewards(result.rewards);
    }
  }

  store().setStatus('completed');
}
