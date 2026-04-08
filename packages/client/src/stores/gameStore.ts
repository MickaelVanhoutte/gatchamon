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
import * as pcService from '../services/pc.service';
import { regenerateEnergy } from '../services/energy.service';
import { getUnclaimedMissionCount, getUnclaimedTrophyCount } from '../services/reward.service';
import { getUnreadInboxCount, grantNewPlayerEnergyBonus } from '../services/inbox.service';
import { useTutorialStore } from './tutorialStore';
import { USE_SERVER } from '../config';
import { createPlayerOnServer, loadPlayerFromServer, checkNameAvailable } from '../services/server-player.service';
import * as serverApi from '../services/server-api.service';

export interface OwnedPokemon {
  instance: PokemonInstance;
  template: PokemonTemplate;
}

interface GameState {
  player: Player | null;
  collection: OwnedPokemon[];
  pcBox: OwnedPokemon[];
  pcAutoSend: boolean;
  heldItems: HeldItemInstance[];
  isLoading: boolean;
  unclaimedRewardCount: number;
  inboxUnreadCount: number;

  setPlayer: (player: Player) => void;
  createPlayer: (name: string) => Promise<void>;
  checkNameAvailable: (name: string) => Promise<boolean>;
  loadPlayer: () => void;
  refreshPlayer: () => void;
  refreshInbox: () => void;
  summon: (count: 1 | 10, type?: PokeballType) => OwnedPokemon[] | Promise<OwnedPokemon[]>;
  loadCollection: () => void;
  loadPcBox: () => void;
  transferToPC: (instanceIds: string[]) => void;
  transferFromPC: (instanceIds: string[]) => void;
  togglePcAutoSend: () => void;
  mergePokemon: (baseId: string, fodderId: string) => void;
  altarFeed: (baseId: string, fodderIds: string[]) => void;
  evolvePokemon: (instanceId: string, targetTemplateId: number) => void;
  changeType: (instanceId: string, targetTemplateId: number) => void;
  refreshRewards: () => void;
  loadHeldItems: () => void;
  equipItem: (itemId: string, pokemonInstanceId: string) => void;
  unequipItem: (itemId: string) => void;
  upgradeItem: (itemId: string) => any;
  sellItem: (itemId: string) => any;
  sellItems: (itemIds: string[]) => any;
  updateInstance: (instanceId: string, updates: Partial<PokemonInstance>) => void;
  allocateTrainerSkill: (skill: keyof TrainerSkills) => void;
  mergeEssences: (element: string, targetTier: 'mid' | 'high', count: number) => void;
}

let energyRegenInterval: ReturnType<typeof setInterval> | null = null;

async function reloadFromServer(set: any, get: any) {
  const player = await serverApi.loadPlayer();
  if (player) set({ player });
  // Reload collection and items
  get().loadCollection();
  get().loadHeldItems();
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  pcBox: [],
  pcAutoSend: storage.loadPcAutoSend(),
  heldItems: [],
  isLoading: false,
  unclaimedRewardCount: 0,
  inboxUnreadCount: 0,

  setPlayer: (player: Player) => {
    set({ player });
    grantNewPlayerEnergyBonus();
    get().refreshRewards();
  },

  createPlayer: async (name: string) => {
    if (USE_SERVER) {
      const player = await createPlayerOnServer(name);
      set({ player });
    } else {
      const player = playerService.createPlayer(name);
      set({ player });
    }
  },

  checkNameAvailable: async (name: string) => {
    if (!USE_SERVER) return true; // No name check in offline mode
    return checkNameAvailable(name);
  },

  loadPlayer: () => {
    if (USE_SERVER) {
      // Server mode: async load
      loadPlayerFromServer().then(player => {
        if (player) {
          set({ player });
          grantNewPlayerEnergyBonus();
          get().loadCollection();
          get().loadPcBox();
          get().loadHeldItems();
          get().refreshRewards();
        }
      });
      return;
    }

    // Offline mode: sync load
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
    if (USE_SERVER) {
      serverApi.loadPlayer().then(player => {
        if (player) set({ player });
        get().refreshRewards();
      });
      return;
    }
    const player = storage.loadPlayer();
    set({ player });
    get().refreshRewards();
  },

  summon: (count: 1 | 10, type: PokeballType = 'regular') => {
    // Tutorial summons are always fixed (same for everyone), handled client-side
    const tutorialStep = useTutorialStore.getState().step;
    if (tutorialStep === 4 && type === 'regular' && count === 1) {
      const results = [gachaService.summonSingleRegular(58)];
      const newPokemon: OwnedPokemon[] = results.map(r => ({
        instance: r.pokemon,
        template: r.template,
      }));
      const updatedPlayer = storage.loadPlayer()!;
      set({ player: updatedPlayer });
      get().loadCollection();
      get().loadPcBox();
      get().refreshRewards();
      return newPokemon;
    }
    if (tutorialStep === 5 && type === 'premium' && count === 1) {
      const results = [gachaService.summonSinglePremium(133)];
      const newPokemon: OwnedPokemon[] = results.map(r => ({
        instance: r.pokemon,
        template: r.template,
      }));
      const updatedPlayer = storage.loadPlayer()!;
      set({ player: updatedPlayer });
      get().loadCollection();
      get().loadPcBox();
      get().refreshRewards();
      return newPokemon;
    }

    if (USE_SERVER) {
      // Server mode: async summon — returns a promise
      return serverApi.summon(count, type).then(async (res) => {
        const newPokemon: OwnedPokemon[] = res.results.map(r => ({
          instance: r.pokemon,
          template: r.template,
        }));
        await reloadFromServer(set, get);
        get().loadPcBox();
        return newPokemon;
      });
    }

    // Offline mode: sync summon
    const { player } = get();
    if (!player) throw new Error('No player');

    let results: gachaService.SummonResult[];
    if (type === 'glowing') {
      results = count === 10
        ? gachaService.summonMultiGlowing()
        : [gachaService.summonSingleGlowing()];
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

    const updatedPlayer = storage.loadPlayer()!;
    set({ player: updatedPlayer });
    get().loadCollection();
    get().loadPcBox();
    get().refreshRewards();
    return newPokemon;
  },

  loadCollection: () => {
    const { player } = get();
    if (!player) return;
    set({ isLoading: true });

    if (USE_SERVER) {
      serverApi.loadCollection().then(res => {
        const collection = res.collection
          .filter(item => item.template != null)
          .sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
        set({ collection, isLoading: false });
      }).catch(() => set({ isLoading: false }));
      return;
    }

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

  loadPcBox: () => {
    if (USE_SERVER) {
      serverApi.loadPcBox().then(res => {
        const pcBox = res.pcBox
          .filter(item => item.template != null)
          .sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
        set({ pcBox });
      });
      return;
    }

    const instances = storage.loadPcBox();
    const pcBox: OwnedPokemon[] = instances
      .map(inst => ({
        instance: inst,
        template: getTemplate(inst.templateId)!,
      }))
      .filter(item => item.template != null)
      .sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
    set({ pcBox });
  },

  transferToPC: (instanceIds: string[]) => {
    if (USE_SERVER) {
      serverApi.transferPokemon(instanceIds, 'pc').then(() => {
        get().loadCollection();
        get().loadPcBox();
      });
      return;
    }
    pcService.transferToPC(instanceIds);
    get().loadCollection();
    get().loadPcBox();
  },

  transferFromPC: (instanceIds: string[]) => {
    if (USE_SERVER) {
      serverApi.transferPokemon(instanceIds, 'collection').then(() => {
        get().loadCollection();
        get().loadPcBox();
      });
      return;
    }
    pcService.transferFromPC(instanceIds);
    get().loadCollection();
    get().loadPcBox();
  },

  togglePcAutoSend: () => {
    const next = !get().pcAutoSend;
    if (USE_SERVER) {
      serverApi.setPcAutoSend(next);
    }
    storage.savePcAutoSend(next);
    set({ pcAutoSend: next });
  },

  mergePokemon: (baseId: string, fodderId: string) => {
    if (USE_SERVER) {
      serverApi.performMerge(baseId, fodderId).then(() => {
        reloadFromServer(set, get);
      });
      return;
    }
    mergeService.performMerge(baseId, fodderId);
    get().loadCollection();
    get().refreshRewards();
  },

  altarFeed: (baseId: string, fodderIds: string[]) => {
    if (USE_SERVER) {
      serverApi.performAltarFeed(baseId, fodderIds).then(() => {
        reloadFromServer(set, get);
        get().loadPcBox();
      });
      return;
    }
    altarService.performAltarFeed(baseId, fodderIds);
    get().loadCollection();
    get().loadPcBox();
    get().refreshRewards();
  },

  evolvePokemon: (instanceId: string, targetTemplateId: number) => {
    if (USE_SERVER) {
      serverApi.performEvolution(instanceId, targetTemplateId).then(() => {
        reloadFromServer(set, get);
      });
      return;
    }
    evolutionService.performEvolution(instanceId, targetTemplateId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
    get().loadCollection();
    get().refreshRewards();
  },

  changeType: (instanceId: string, targetTemplateId: number) => {
    if (USE_SERVER) {
      serverApi.performTypeChange(instanceId, targetTemplateId).then(() => {
        reloadFromServer(set, get);
      });
      return;
    }
    typeChangeService.performTypeChange(instanceId, targetTemplateId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
    get().loadCollection();
    get().refreshRewards();
  },

  refreshInbox: () => {
    if (USE_SERVER) {
      serverApi.getInbox().then((res: any) => {
        const items = res.items ?? res;
        const count = Array.isArray(items) ? items.filter((i: any) => !i.claimed).length : 0;
        set({ inboxUnreadCount: count });
      }).catch(() => {});
      return;
    }
    const count = getUnreadInboxCount();
    set({ inboxUnreadCount: count });
  },

  refreshRewards: () => {
    if (USE_SERVER) {
      Promise.all([
        serverApi.getDailyMissions(),
        serverApi.getTrophyProgress(),
      ]).then(([missionsRes, trophiesRes]: [any, any]) => {
        const missions = missionsRes.missions ?? missionsRes.dailyMissions?.missions ?? [];
        const unclaimedMissions = Array.isArray(missions)
          ? missions.filter((m: any) => m.current >= (m.target ?? Infinity) && !m.claimed).length
          : 0;
        const trophyProgress = trophiesRes.progress ?? [];
        let unclaimedTrophies = 0;
        if (Array.isArray(trophyProgress)) {
          for (const tp of trophyProgress) {
            const claimed = tp.claimedTiers ?? [];
            const current = tp.current ?? 0;
            // Count tiers that are reached but not claimed
            const trophyDef = (tp as any).tiers;
            if (Array.isArray(trophyDef)) {
              unclaimedTrophies += trophyDef.filter((_: any, i: number) => !claimed.includes(i) && current >= trophyDef[i]?.threshold).length;
            }
          }
        }
        set({ unclaimedRewardCount: unclaimedMissions + unclaimedTrophies });
      }).catch(() => {});
      get().refreshInbox();
      return;
    }
    const count = getUnclaimedMissionCount() + getUnclaimedTrophyCount();
    set({ unclaimedRewardCount: count });
    get().refreshInbox();
  },

  loadHeldItems: () => {
    if (USE_SERVER) {
      serverApi.loadHeldItems().then(items => {
        set({ heldItems: items });
      });
      return;
    }
    const items = storage.loadHeldItems();
    set({ heldItems: items });
  },

  equipItem: (itemId: string, pokemonInstanceId: string) => {
    if (USE_SERVER) {
      serverApi.equipItem(itemId, pokemonInstanceId).then(() => {
        get().loadHeldItems();
      });
      return;
    }
    heldItemService.equipItem(itemId, pokemonInstanceId);
    set({ heldItems: storage.loadHeldItems() });
  },

  unequipItem: (itemId: string) => {
    if (USE_SERVER) {
      serverApi.unequipItem(itemId).then(() => {
        reloadFromServer(set, get);
      });
      return;
    }
    heldItemService.unequipItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
  },

  upgradeItem: (itemId: string) => {
    if (USE_SERVER) {
      return serverApi.upgradeItem(itemId).then(async (result: any) => {
        await reloadFromServer(set, get);
        return result;
      });
    }
    const result = heldItemService.upgradeItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return result;
  },

  sellItem: (itemId: string) => {
    if (USE_SERVER) {
      return serverApi.sellItems([itemId]).then(async (res) => {
        await reloadFromServer(set, get);
        return res.totalValue;
      });
    }
    const value = heldItemService.sellItem(itemId);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return value;
  },

  sellItems: (itemIds: string[]) => {
    if (USE_SERVER) {
      return serverApi.sellItems(itemIds).then(async (res) => {
        await reloadFromServer(set, get);
        return res.totalValue;
      });
    }
    const total = heldItemService.sellItems(itemIds);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer, heldItems: storage.loadHeldItems() });
    return total;
  },

  updateInstance: (instanceId: string, updates: Partial<PokemonInstance>) => {
    // In server mode, instance updates happen server-side via battle/merge/evolve routes
    // This is only used for offline mode local updates
    if (!USE_SERVER) {
      storage.updateInstance(instanceId, updates);
    }
    get().loadCollection();
  },

  allocateTrainerSkill: (skill: keyof TrainerSkills) => {
    if (USE_SERVER) {
      serverApi.allocateTrainerSkill(skill).then(() => {
        get().refreshPlayer();
      });
      return;
    }
    playerService.allocateTrainerSkill(skill);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
  },

  mergeEssences: (element: string, targetTier: 'mid' | 'high', count: number) => {
    if (USE_SERVER) {
      serverApi.performEssenceMerge(element, targetTier, count).then(() => {
        get().refreshPlayer();
      });
      return;
    }
    essenceMergeService.performMerge(element, targetTier, count);
    const updatedPlayer = storage.loadPlayer();
    set({ player: updatedPlayer });
  },
}));
