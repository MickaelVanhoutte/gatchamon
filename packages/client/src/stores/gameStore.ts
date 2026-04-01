import { create } from 'zustand';
import type { Player, PokemonInstance, PokemonTemplate, HeldItemInstance, TrainerSkills, PokeballType } from '@gatchamon/shared';
import { getTemplate, getMaxEnergy, getEnergyRegenInterval } from '@gatchamon/shared';
import * as storage from '../services/storage';
import * as playerService from '../services/player.service';
import * as gachaService from '../services/gacha.service';
import * as mergeService from '../services/merge.service';
import * as altarService from '../services/altar.service';
import * as evolutionService from '../services/evolution.service';
import * as typeChangeService from '../services/type-change.service';
import * as essenceMergeService from '../services/essence-merge.service';
import * as heldItemService from '../services/held-item.service';
import { regenerateEnergy } from '../services/energy.service';
import { getUnclaimedMissionCount, getUnclaimedTrophyCount } from '../services/reward.service';
import { getUnreadInboxCount, grantNewPlayerEnergyBonus } from '../services/inbox.service';
import { useTutorialStore } from './tutorialStore';

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
  inboxUnreadCount: number;

  createPlayer: (name: string) => void;
  loadPlayer: () => void;
  refreshPlayer: () => void;
  refreshInbox: () => void;
  summon: (count: 1 | 10, type?: PokeballType) => OwnedPokemon[];
  loadCollection: () => void;
  mergePokemon: (baseId: string, fodderId: string) => void;
  altarFeed: (baseId: string, fodderIds: string[]) => void;
  evolvePokemon: (instanceId: string, targetTemplateId: number) => void;
  changeType: (instanceId: string, targetTemplateId: number) => void;
  refreshRewards: () => void;
  loadHeldItems: () => void;
  equipItem: (itemId: string, pokemonInstanceId: string) => void;
  unequipItem: (itemId: string) => void;
  upgradeItem: (itemId: string) => heldItemService.UpgradeResult;
  sellItem: (itemId: string) => number;
  sellItems: (itemIds: string[]) => number;
  updateInstance: (instanceId: string, updates: Partial<PokemonInstance>) => void;
  allocateTrainerSkill: (skill: keyof TrainerSkills) => void;
  mergeEssences: (element: string, targetTier: 'mid' | 'high', count: number) => void;
}

let energyRegenInterval: ReturnType<typeof setInterval> | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  heldItems: [],
  isLoading: false,
  unclaimedRewardCount: 0,
  inboxUnreadCount: 0,

  createPlayer: (name: string) => {
    const player = playerService.createPlayer(name);
    set({ player });
  },

  loadPlayer: () => {
    storage.checkAndResetTower();
    let player = storage.loadPlayer();
    if (player) {
      // Regenerate energy based on elapsed time
      const maxE = getMaxEnergy(player.trainerSkills);
      const interval = getEnergyRegenInterval(player.trainerSkills);
      const updated = regenerateEnergy(player, maxE, interval);
      if (updated !== player) {
        storage.savePlayer(updated);
        player = updated;
      }
      set({ player });
      grantNewPlayerEnergyBonus();
      get().refreshRewards();

      // Clear any previous energy regen interval before creating a new one
      if (energyRegenInterval !== null) {
        clearInterval(energyRegenInterval);
      }

      // Periodic energy regen check every 60s
      energyRegenInterval = setInterval(() => {
        let p = storage.loadPlayer();
        if (!p) return;
        const mE = getMaxEnergy(p.trainerSkills);
        const iv = getEnergyRegenInterval(p.trainerSkills);
        const u = regenerateEnergy(p, mE, iv);
        if (u !== p) {
          storage.savePlayer(u);
          set({ player: u });
        }
      }, 60_000);
    }
  },

  refreshPlayer: () => {
    const player = storage.loadPlayer();
    set({ player });
    get().refreshRewards();
  },

  summon: (count: 1 | 10, type: PokeballType = 'regular') => {
    const { player } = get();
    if (!player) throw new Error('No player');

    const tutorialStep = useTutorialStore.getState().step;

    let results: gachaService.SummonResult[];
    if (tutorialStep === 4 && type === 'regular' && count === 1) {
      // Tutorial step 4: always summon Growlithe (fire 2★)
      results = [gachaService.summonSingleRegular(58)];
    } else if (tutorialStep === 5 && type === 'premium' && count === 1) {
      // Tutorial step 5: always summon Eevee (normal 3★)
      results = [gachaService.summonSinglePremium(133)];
    } else if (type === 'legendary') {
      results = [gachaService.summonSingleLegendary()];
    } else if (type === 'premium') {
      results = count === 10
        ? gachaService.summonMultiPremium()
        : [gachaService.summonSinglePremium()];
    } else {
      results = count === 10
        ? gachaService.summonMultiRegular()
        : [gachaService.summonSingleRegular()];
    }

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

  altarFeed: (baseId: string, fodderIds: string[]) => {
    altarService.performAltarFeed(baseId, fodderIds);
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

  changeType: (instanceId: string, targetTemplateId: number) => {
    typeChangeService.performTypeChange(instanceId, targetTemplateId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
    get().loadCollection();
    get().refreshRewards();
  },

  refreshInbox: () => {
    const count = getUnreadInboxCount();
    set({ inboxUnreadCount: count });
  },

  refreshRewards: () => {
    const count = getUnclaimedMissionCount() + getUnclaimedTrophyCount();
    set({ unclaimedRewardCount: count });
    get().refreshInbox();
  },

  loadHeldItems: () => {
    const items = storage.loadHeldItems();
    set({ heldItems: items });
  },

  equipItem: (itemId: string, pokemonInstanceId: string) => {
    heldItemService.equipItem(itemId, pokemonInstanceId);
    set({ heldItems: storage.loadHeldItems() });
  },

  unequipItem: (itemId: string) => {
    heldItemService.unequipItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
  },

  upgradeItem: (itemId: string) => {
    const result = heldItemService.upgradeItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return result;
  },

  sellItem: (itemId: string) => {
    const value = heldItemService.sellItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return value;
  },

  sellItems: (itemIds: string[]) => {
    const total = heldItemService.sellItems(itemIds);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return total;
  },

  updateInstance: (instanceId: string, updates: Partial<PokemonInstance>) => {
    storage.updateInstance(instanceId, updates);
    get().loadCollection();
  },

  allocateTrainerSkill: (skill: keyof TrainerSkills) => {
    playerService.allocateTrainerSkill(skill);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
  },

  mergeEssences: (element: string, targetTier: 'mid' | 'high', count: number) => {
    essenceMergeService.performMerge(element, targetTier, count);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
  },
}));
