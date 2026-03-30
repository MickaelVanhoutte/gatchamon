import { create } from 'zustand';
import type { BattleRewards } from '@gatchamon/shared';

export interface AccumulatedRewards {
  totalXp: number;
  totalStardust: number;
  essences: Record<string, number>;
  itemDrops: Array<{ itemId: string; setId: string; stars: number; grade: string }>;
  totalLevelUps: number;
  monsterLoots: Array<{ templateId: number; stars: number }>;
}

export type RepeatStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'stopped_defeat'
  | 'stopped_no_energy'
  | 'stopped_user';

export interface RepeatBattleConfig {
  teamIds: string[];
  dungeonId: number;
  floorIndex: number;
  mode: 'dungeon' | 'item-dungeon';
  totalRuns: number;
  dungeonName: string;
  floorLabel: string;
}

const EMPTY_REWARDS: AccumulatedRewards = {
  totalXp: 0,
  totalStardust: 0,
  essences: {},
  itemDrops: [],
  totalLevelUps: 0,
  monsterLoots: [],
};

interface RepeatBattleState {
  status: RepeatStatus;
  config: RepeatBattleConfig | null;
  currentRun: number;
  completedRuns: number;
  rewards: AccumulatedRewards;
  isOpen: boolean;
  _shouldStop: boolean;

  startRepeat: (config: RepeatBattleConfig) => void;
  stopRepeat: () => void;
  addRunRewards: (rewards: BattleRewards) => void;
  incrementRun: () => void;
  setStatus: (status: RepeatStatus) => void;
  openPanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useRepeatBattleStore = create<RepeatBattleState>((set, get) => ({
  status: 'idle',
  config: null,
  currentRun: 0,
  completedRuns: 0,
  rewards: { ...EMPTY_REWARDS },
  isOpen: false,
  _shouldStop: false,

  startRepeat: (config) => set({
    status: 'running',
    config,
    currentRun: 0,
    completedRuns: 0,
    rewards: { ...EMPTY_REWARDS, essences: {}, itemDrops: [], monsterLoots: [] },
    isOpen: false,
    _shouldStop: false,
  }),

  stopRepeat: () => set({ _shouldStop: true }),

  addRunRewards: (rewards) => set((state) => {
    const acc = state.rewards;
    const newEssences = { ...acc.essences };
    if (rewards.essences) {
      for (const [id, qty] of Object.entries(rewards.essences)) {
        newEssences[id] = (newEssences[id] ?? 0) + qty;
      }
    }
    return {
      completedRuns: state.completedRuns + 1,
      rewards: {
        totalXp: acc.totalXp + (rewards.xpPerMon ?? 0),
        totalStardust: acc.totalStardust + (rewards.stardust ?? 0),
        essences: newEssences,
        itemDrops: [
          ...acc.itemDrops,
          ...(rewards.itemDrops ?? []),
        ],
        totalLevelUps: acc.totalLevelUps + (rewards.levelUps?.length ?? 0),
        monsterLoots: rewards.monsterLoot
          ? [...acc.monsterLoots, { templateId: rewards.monsterLoot.templateId, stars: rewards.monsterLoot.stars }]
          : acc.monsterLoots,
      },
    };
  }),

  incrementRun: () => set((state) => ({ currentRun: state.currentRun + 1 })),

  setStatus: (status) => set({ status }),

  openPanel: () => set({ isOpen: true }),

  closePanel: () => set({ isOpen: false }),

  reset: () => set({
    status: 'idle',
    config: null,
    currentRun: 0,
    completedRuns: 0,
    rewards: { ...EMPTY_REWARDS, essences: {}, itemDrops: [], monsterLoots: [] },
    isOpen: false,
    _shouldStop: false,
  }),
}));
