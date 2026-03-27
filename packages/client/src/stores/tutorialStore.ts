import { create } from 'zustand';
import * as storage from '../services/storage';

interface TutorialState {
  step: number;

  loadTutorial: () => void;
  advanceStep: () => void;
  completeTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  step: 0,

  loadTutorial: () => {
    const step = storage.loadTutorialStep();
    set({ step });
  },

  advanceStep: () => {
    const next = get().step + 1;
    storage.saveTutorialStep(next);
    set({ step: next });
  },

  completeTutorial: () => {
    storage.saveTutorialStep(99);
    set({ step: 99 });
  },
}));
