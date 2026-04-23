import { create } from 'zustand';
import type { Player, PokemonInstance, PokemonTemplate, HeldItemInstance, TrainerSkills, PokeballType } from '@gatchamon/shared';
import { getTemplate } from '@gatchamon/shared';
import { loadPcAutoSend, savePcAutoSend, setGrantedFlag } from '../services/storage';
import { useTutorialStore } from './tutorialStore';
import { createPlayerOnServer, loadPlayerFromServer, checkNameAvailable } from '../services/server-player.service';
import * as serverApi from '../services/server-api.service';
import { reportError } from '../utils/report-error';

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
  summon: (count: 1 | 10, type?: PokeballType) => Promise<OwnedPokemon[]>;
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
  attackWorldBoss: (instanceIds: string[]) => Promise<import('@gatchamon/shared').WorldBossAttackResult>;
}

function syncGrantedFlags(player: Player) {
  for (const flag of player.grantedFlags ?? []) setGrantedFlag(flag);
}

async function reloadFromServer(set: any, get: any) {
  const player = await serverApi.loadPlayer();
  if (player) { syncGrantedFlags(player); set({ player }); }
  get().loadCollection();
  get().loadHeldItems();
}

/**
 * Serializes mutate-then-reload pairs through a single promise chain.
 *
 * The previous pattern (`serverApi.foo().then(() => reloadFromServer(...))`)
 * fired without awaiting, so two rapid taps could race: reload A starts,
 * mutation B mutates, reload A resolves with pre-B state, reload B then
 * resolves with the correct state — net result was a stale snapshot
 * lingering until the next manual refresh. The chain below ensures every
 * reload sees the database state produced by the mutation that triggered it,
 * and that mutations never overlap.
 */
let mutationChain: Promise<void> = Promise.resolve();

function runMutation(work: () => Promise<unknown>): Promise<void> {
  const next = mutationChain.then(() => work().then(() => undefined, err => {
    reportError('gameStore.runMutation', err);
  }));
  mutationChain = next;
  return next;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  pcBox: [],
  pcAutoSend: loadPcAutoSend(),
  heldItems: [],
  isLoading: false,
  unclaimedRewardCount: 0,
  inboxUnreadCount: 0,

  setPlayer: (player: Player) => {
    set({ player });
    get().refreshRewards();
  },

  createPlayer: async (name: string) => {
    const player = await createPlayerOnServer(name);
    set({ player });
  },

  checkNameAvailable: async (name: string) => {
    return checkNameAvailable(name);
  },

  loadPlayer: () => {
    loadPlayerFromServer().then(player => {
      if (player) {
        syncGrantedFlags(player);
        set({ player });
        get().loadCollection();
        get().loadPcBox();
        get().loadHeldItems();
        get().refreshRewards();
      }
    });
  },

  refreshPlayer: () => {
    serverApi.loadPlayer().then(player => {
      if (player) { syncGrantedFlags(player); set({ player }); }
      get().refreshRewards();
    });
  },

  summon: (count: 1 | 10, type: PokeballType = 'regular') => {
    const tutorialStep = useTutorialStore.getState().step;
    const forcedTemplateId =
      tutorialStep === 4 && type === 'regular' && count === 1 ? 58 :
      tutorialStep === 5 && type === 'premium' && count === 1 ? 133 :
      undefined;

    return serverApi.summon(count, type, forcedTemplateId).then(async (res) => {
      const newPokemon: OwnedPokemon[] = res.results.map((r: any) => ({
        instance: r.pokemon,
        template: r.template,
      }));
      await reloadFromServer(set, get);
      get().loadPcBox();
      return newPokemon;
    });
  },

  loadCollection: () => {
    const { player } = get();
    if (!player) return;
    set({ isLoading: true });

    serverApi.loadCollection().then(res => {
      const collection = res.collection
        .filter((item: any) => item.template != null)
        .sort((a: any, b: any) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
      set({ collection, isLoading: false });
    }).catch(() => set({ isLoading: false }));
  },

  loadPcBox: () => {
    serverApi.loadPcBox().then(res => {
      const pcBox = res.pcBox
        .filter((item: any) => item.template != null)
        .sort((a: any, b: any) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
      set({ pcBox });
    });
  },

  transferToPC: (instanceIds: string[]) => {
    serverApi.transferPokemon(instanceIds, 'pc').then(() => {
      get().loadCollection();
      get().loadPcBox();
    });
  },

  transferFromPC: (instanceIds: string[]) => {
    serverApi.transferPokemon(instanceIds, 'collection').then(() => {
      get().loadCollection();
      get().loadPcBox();
    });
  },

  togglePcAutoSend: () => {
    const next = !get().pcAutoSend;
    serverApi.setPcAutoSend(next);
    savePcAutoSend(next);
    set({ pcAutoSend: next });
  },

  mergePokemon: (baseId: string, fodderId: string) => {
    runMutation(async () => {
      await serverApi.performMerge(baseId, fodderId);
      await reloadFromServer(set, get);
    });
  },

  altarFeed: (baseId: string, fodderIds: string[]) => {
    runMutation(async () => {
      await serverApi.performAltarFeed(baseId, fodderIds);
      await reloadFromServer(set, get);
      get().loadPcBox();
    });
  },

  evolvePokemon: (instanceId: string, targetTemplateId: number) => {
    runMutation(async () => {
      await serverApi.performEvolution(instanceId, targetTemplateId);
      await reloadFromServer(set, get);
    });
  },

  changeType: (instanceId: string, targetTemplateId: number) => {
    runMutation(async () => {
      await serverApi.performTypeChange(instanceId, targetTemplateId);
      await reloadFromServer(set, get);
    });
  },

  refreshInbox: () => {
    serverApi.getInbox().then((res: any) => {
      const items = res.items ?? res;
      const count = Array.isArray(items) ? items.filter((i: any) => !i.claimed).length : 0;
      set({ inboxUnreadCount: count });
    }).catch(err => reportError('gameStore.refreshInbox', err));
  },

  refreshRewards: () => {
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
          const trophyDef = (tp as any).tiers;
          if (Array.isArray(trophyDef)) {
            unclaimedTrophies += trophyDef.filter((_: any, i: number) => !claimed.includes(i) && current >= trophyDef[i]?.threshold).length;
          }
        }
      }
      set({ unclaimedRewardCount: unclaimedMissions + unclaimedTrophies });
    }).catch(err => reportError('gameStore.refreshRewards', err));
    get().refreshInbox();
  },

  loadHeldItems: () => {
    serverApi.loadHeldItems().then(items => {
      set({ heldItems: items });
    });
  },

  equipItem: (itemId: string, pokemonInstanceId: string) => {
    return serverApi.equipItem(itemId, pokemonInstanceId).then(() => {
      get().loadHeldItems();
    });
  },

  unequipItem: (itemId: string) => {
    runMutation(async () => {
      await serverApi.unequipItem(itemId);
      await reloadFromServer(set, get);
    });
  },

  upgradeItem: (itemId: string) => {
    return serverApi.upgradeItem(itemId).then(async (result: any) => {
      await reloadFromServer(set, get);
      return result;
    });
  },

  sellItem: (itemId: string) => {
    return serverApi.sellItems([itemId]).then(async (res) => {
      await reloadFromServer(set, get);
      return res.totalValue;
    });
  },

  sellItems: (itemIds: string[]) => {
    return serverApi.sellItems(itemIds).then(async (res) => {
      await reloadFromServer(set, get);
      return res.totalValue;
    });
  },

  updateInstance: (instanceId: string, updates: Partial<PokemonInstance>) => {
    serverApi.updateInstance(instanceId, {
      isLocked: updates.isLocked,
      showOnHome: updates.showOnHome,
    }).then(() => get().loadCollection());
  },

  allocateTrainerSkill: (skill: keyof TrainerSkills) => {
    serverApi.allocateTrainerSkill(skill).then(() => {
      get().refreshPlayer();
    });
  },

  mergeEssences: (element: string, targetTier: 'mid' | 'high', count: number) => {
    serverApi.performEssenceMerge(element, targetTier, count).then(() => {
      get().refreshPlayer();
    });
  },

  attackWorldBoss: async (instanceIds: string[]) => {
    const result = await serverApi.attackWorldBoss(instanceIds);
    await reloadFromServer(set, get);
    return result;
  },
}));
