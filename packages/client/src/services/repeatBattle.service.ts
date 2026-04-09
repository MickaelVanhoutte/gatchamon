import { getTemplate, SKILLS } from '@gatchamon/shared';
import type { BattleResult } from '@gatchamon/shared';
import { pickBestAction } from '../battle/autoBattleAI';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import type { RepeatBattleConfig } from '../stores/repeatBattleStore';
import { useGameStore } from '../stores/gameStore';
import * as serverApi from './server-api.service';

// ---------------------------------------------------------------------------
// Headless single-battle runner — SERVER
// ---------------------------------------------------------------------------

async function runSingleBattleServer(
  teamIds: string[],
  dungeonId: number,
  floorIndex: number,
  mode: 'dungeon' | 'item-dungeon' | 'mystery-dungeon',
): Promise<BattleResult> {
  // Start battle on server
  let startRes: any;
  if (mode === 'mystery-dungeon') {
    startRes = await serverApi.startMysteryDungeonBattle(teamIds, floorIndex);
  } else if (mode === 'dungeon') {
    startRes = await serverApi.startDungeonBattle(teamIds, dungeonId, floorIndex);
  } else {
    startRes = await serverApi.startItemDungeonBattle(teamIds, dungeonId, floorIndex);
  }

  const state = startRes.state ?? startRes;
  const battleId = state.battleId;

  if (state.status !== 'active') {
    return { state } as BattleResult;
  }

  // Resolve turns
  const MAX_ITERATIONS = 600;
  let iterations = 0;
  let latestState = state;
  let latestRewards: any = undefined;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    if (latestState.status !== 'active') break;

    const currentActor = [...latestState.playerTeam, ...latestState.enemyTeam]
      .find((m: any) => m.instanceId === latestState.currentActorId);

    if (!currentActor || !currentActor.isPlayerOwned) break;

    let action = pickBestAction(currentActor, latestState);
    if (!action) {
      const template = getTemplate(currentActor.templateId);
      const firstSkillId = template?.skillIds.find(id => SKILLS[id]?.category !== 'passive');
      const firstEnemy = latestState.enemyTeam.find((e: any) => e.isAlive);
      if (!firstSkillId || !firstEnemy) break;
      action = { skillId: firstSkillId, targetId: firstEnemy.instanceId };
    }

    try {
      const result = await serverApi.resolveBattleAction(
        battleId,
        currentActor.instanceId,
        action.skillId,
        action.targetId,
      );
      latestState = result.state;
      if (result.rewards) latestRewards = result.rewards;
    } catch {
      break;
    }

    if (latestState.status !== 'active') break;
  }

  if (latestState.status === 'active') {
    latestState.status = 'defeat';
  }

  const finalResult: BattleResult = { state: latestState };
  if (latestRewards) finalResult.rewards = latestRewards;
  return finalResult;
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

    // Update current run counter
    store().incrementRun();

    // Yield to UI thread
    await new Promise(r => setTimeout(r, 0));

    // Run battle
    let result: BattleResult;
    try {
      result = await runSingleBattleServer(
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
