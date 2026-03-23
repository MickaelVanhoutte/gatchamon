import { create } from 'zustand';
import type { Player, PokemonInstance, PokemonTemplate } from '@gatchamon/shared';
import { POKEDEX } from '@gatchamon/shared';
import * as storage from '../services/storage';
import * as playerService from '../services/player.service';
import * as gachaService from '../services/gacha.service';
import * as mergeService from '../services/merge.service';
import * as evolutionService from '../services/evolution.service';

export interface OwnedPokemon {
  instance: PokemonInstance;
  template: PokemonTemplate;
}

interface GameState {
  player: Player | null;
  collection: OwnedPokemon[];
  isLoading: boolean;

  createPlayer: (name: string) => void;
  loadPlayer: () => void;
  refreshPlayer: () => void;
  summon: (count: 1 | 10) => OwnedPokemon[];
  loadCollection: () => void;
  mergePokemon: (baseId: string, fodderId: string) => void;
  evolvePokemon: (instanceId: string, targetTemplateId: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  isLoading: false,

  createPlayer: (name: string) => {
    const player = playerService.createPlayer(name);
    set({ player });
  },

  loadPlayer: () => {
    const player = storage.loadPlayer();
    if (player) {
      set({ player });
    }
  },

  refreshPlayer: () => {
    const player = storage.loadPlayer();
    set({ player });
  },

  summon: (count: 1 | 10) => {
    const { player } = get();
    if (!player) throw new Error('No player');

    const results = count === 10
      ? gachaService.summonMulti()
      : [gachaService.summonSingle()];

    const newPokemon: OwnedPokemon[] = results.map(r => ({
      instance: r.pokemon,
      template: r.template,
    }));

    // Reload player from storage (pokeballs were deducted)
    const updatedPlayer = storage.loadPlayer()!;
    set(state => ({
      player: updatedPlayer,
      collection: [...state.collection, ...newPokemon],
    }));

    return newPokemon;
  },

  loadCollection: () => {
    const { player } = get();
    if (!player) return;
    set({ isLoading: true });

    const instances = storage.loadCollection();
    const collection: OwnedPokemon[] = instances
      .map(inst => ({
        instance: inst,
        template: POKEDEX.find(p => p.id === inst.templateId)!,
      }))
      .filter(item => item.template != null)
      .sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);

    set({ collection, isLoading: false });
  },

  mergePokemon: (baseId: string, fodderId: string) => {
    mergeService.performMerge(baseId, fodderId);
    get().loadCollection();
  },

  evolvePokemon: (instanceId: string, targetTemplateId: number) => {
    evolutionService.performEvolution(instanceId, targetTemplateId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
    get().loadCollection();
  },
}));
