import { create } from 'zustand';
import type { BattleRewards } from '@gatchamon/shared';

export interface AccumulatedRewards {
  totalXp: number;
  totalPokedollars: number;
  essences: Record<string, number>;
  itemDrops: Array<{ itemId: string; setId: string; stars: number; grade: string }>;
  totalLevelUps: number;
  monsterLoots: Array<{ templateId: number; stars: number }>;
  mysteryPieces: Record<number, number>;
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
  mode: 'dungeon' | 'item-dungeon' | 'mystery-dungeon';
  totalRuns: number;
  dungeonName: string;
  floorLabel: string;
}

const EMPTY_REWARDS: AccumulatedRewards = {
  totalXp: 0,
  totalPokedollars: 0,
  essences: {},
  itemDrops: [],
  totalLevelUps: 0,
  monsterLoots: [],
  mysteryPieces: {},
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
  restartRepeat: () => void;
  stopRepeat: () => void;
  stopNow: () => void;
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

  restartRepeat: () => set((state) => ({
    status: 'running',
    currentRun: 0,
    completedRuns: 0,
    rewards: { ...EMPTY_REWARDS, essences: {}, itemDrops: [], monsterLoots: [] },
    _shouldStop: false,
  })),

  stopRepeat: () => set({ _shouldStop: true }),

  stopNow: () => set({ _shouldStop: true, status: 'stopped_user' }),

  addRunRewards: (rewards) => set((state) => {
    const acc = state.rewards;
    const newEssences = { ...acc.essences };
    if (rewards.essences) {
      for (const [id, qty] of Object.entries(rewards.essences)) {
        newEssences[id] = (newEssences[id] ?? 0) + qty;
      }
    }
    const newPieces = { ...acc.mysteryPieces };
    if (rewards.mysteryPieces) {
      const { templateId, count } = rewards.mysteryPieces;
      newPieces[templateId] = (newPieces[templateId] ?? 0) + count;
    }
    return {
      completedRuns: state.completedRuns + 1,
      rewards: {
        totalXp: acc.totalXp + (rewards.xpPerMon ?? 0),
        totalPokedollars: acc.totalPokedollars + (rewards.pokedollars ?? 0),
        essences: newEssences,
        itemDrops: [
          ...acc.itemDrops,
          ...(rewards.itemDrops ?? []),
        ],
        totalLevelUps: acc.totalLevelUps + (rewards.levelUps?.length ?? 0),
        monsterLoots: rewards.monsterLoot
          ? [...acc.monsterLoots, { templateId: rewards.monsterLoot.templateId, stars: rewards.monsterLoot.stars }]
          : acc.monsterLoots,
        mysteryPieces: newPieces,
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
