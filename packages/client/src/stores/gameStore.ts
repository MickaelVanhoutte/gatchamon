import { create } from 'zustand';
import type { Player, PokemonInstance, PokemonTemplate, HeldItemInstance } from '@gatchamon/shared';
import { getTemplate } from '@gatchamon/shared';
import * as storage from '../services/storage';
import * as playerService from '../services/player.service';
import * as gachaService from '../services/gacha.service';
import * as mergeService from '../services/merge.service';
import * as evolutionService from '../services/evolution.service';
import * as runeService from '../services/rune.service';
import { getUnclaimedMissionCount, getUnclaimedTrophyCount } from '../services/reward.service';

export interface OwnedPokemon {
  instance: PokemonInstance;
  template: PokemonTemplate;
}

interface GameState {
  player: Player | null;
  collection: OwnedPokemon[];
  heldItems: HeldItemInstance[];
  isLoading: boolean;
  unclaimedRewardCount: number;

  createPlayer: (name: string) => void;
  loadPlayer: () => void;
  refreshPlayer: () => void;
  summon: (count: 1 | 10) => OwnedPokemon[];
  loadCollection: () => void;
  mergePokemon: (baseId: string, fodderId: string) => void;
  evolvePokemon: (instanceId: string, targetTemplateId: number) => void;
  refreshRewards: () => void;
  loadHeldItems: () => void;
  equipItem: (itemId: string, pokemonInstanceId: string) => void;
  unequipItem: (itemId: string) => void;
  upgradeItem: (itemId: string) => runeService.UpgradeResult;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  heldItems: [],
  isLoading: false,
  unclaimedRewardCount: 0,

  createPlayer: (name: string) => {
    const player = playerService.createPlayer(name);
    set({ player });
  },

  loadPlayer: () => {
    const player = storage.loadPlayer();
    if (player) {
      set({ player });
      get().refreshRewards();
    }
  },

  refreshPlayer: () => {
    const player = storage.loadPlayer();
    set({ player });
    get().refreshRewards();
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

    get().refreshRewards();
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
        template: getTemplate(inst.templateId)!,
      }))
      .filter(item => item.template != null)
      .sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);

    set({ collection, isLoading: false });
  },

  mergePokemon: (baseId: string, fodderId: string) => {
    mergeService.performMerge(baseId, fodderId);
    get().loadCollection();
    get().refreshRewards();
  },

  evolvePokemon: (instanceId: string, targetTemplateId: number) => {
    evolutionService.performEvolution(instanceId, targetTemplateId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
    get().loadCollection();
    get().refreshRewards();
  },

  refreshRewards: () => {
    const count = getUnclaimedMissionCount() + getUnclaimedTrophyCount();
    set({ unclaimedRewardCount: count });
  },

  loadHeldItems: () => {
    const items = storage.loadHeldItems();
    set({ heldItems: items });
  },

  equipItem: (itemId: string, pokemonInstanceId: string) => {
    runeService.equipItem(itemId, pokemonInstanceId);
    set({ heldItems: storage.loadHeldItems() });
  },

  unequipItem: (itemId: string) => {
    runeService.unequipItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
  },

  upgradeItem: (itemId: string) => {
    const result = runeService.upgradeItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return result;
  },
}));
