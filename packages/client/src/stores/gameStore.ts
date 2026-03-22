import { create } from 'zustand';
import type { Player, PokemonInstance, PokemonTemplate } from '@gatchamon/shared';
import { api } from '../api/client';

export interface OwnedPokemon {
  instance: PokemonInstance;
  template: PokemonTemplate;
}

interface GameState {
  player: Player | null;
  collection: OwnedPokemon[];
  isLoading: boolean;

  createPlayer: (name: string) => Promise<void>;
  loadPlayer: (id: string) => Promise<void>;
  summon: (count: 1 | 10) => Promise<OwnedPokemon[]>;
  loadCollection: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  collection: [],
  isLoading: false,

  createPlayer: async (name: string) => {
    const player = await api.post<Player>('/player', { name });
    set({ player });
    localStorage.setItem('playerId', player.id);
  },

  loadPlayer: async (id: string) => {
    try {
      const player = await api.get<Player>(`/player/${id}`);
      set({ player });
    } catch {
      localStorage.removeItem('playerId');
    }
  },

  summon: async (count: 1 | 10) => {
    const { player } = get();
    if (!player) throw new Error('No player');

    const data = await api.post<{ results: Array<{ pokemon: PokemonInstance; template: PokemonTemplate }> }>(
      '/summon',
      { playerId: player.id, count }
    );

    const newPokemon: OwnedPokemon[] = data.results.map(r => ({
      instance: r.pokemon,
      template: r.template,
    }));

    // Update player pokeballs
    const updatedPlayer = await api.get<Player>(`/player/${player.id}`);
    set(state => ({
      player: updatedPlayer,
      collection: [...state.collection, ...newPokemon],
    }));

    return newPokemon;
  },

  loadCollection: async () => {
    const { player } = get();
    if (!player) return;
    set({ isLoading: true });
    try {
      const data = await api.get<{ collection: OwnedPokemon[] }>(`/collection/${player.id}`);
      set({ collection: data.collection, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
