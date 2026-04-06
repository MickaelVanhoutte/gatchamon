import type { MissionReward } from '../types/rewards.js';

export interface RouletteSlot {
  id: number;
  label: string;
  icon: string;
  reward: MissionReward;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
}

export const ROULETTE_SLOTS: RouletteSlot[] = [
  { id: 1, label: '5K ₽', icon: 'pokedollar', reward: { pokedollars: 5000 }, weight: 15, rarity: 'common' },
  { id: 2, label: '10 Energy', icon: 'energy', reward: { energy: 10 }, weight: 15, rarity: 'common' },
  { id: 3, label: '5 PB', icon: 'pokeball', reward: { regularPokeballs: 5 }, weight: 14, rarity: 'common' },
  { id: 4, label: '75 SD', icon: 'stardust', reward: { stardust: 75 }, weight: 13, rarity: 'common' },
  { id: 5, label: '10K ₽', icon: 'pokedollar', reward: { pokedollars: 10000 }, weight: 12, rarity: 'uncommon' },
  { id: 6, label: '20 Energy', icon: 'energy', reward: { energy: 20 }, weight: 10, rarity: 'uncommon' },
  { id: 7, label: '10 PB', icon: 'pokeball', reward: { regularPokeballs: 10 }, weight: 8, rarity: 'uncommon' },
  { id: 8, label: '1 PPB', icon: 'premiumPokeball', reward: { premiumPokeballs: 1 }, weight: 7, rarity: 'rare' },
  { id: 9, label: '3 PPB', icon: 'premiumPokeball', reward: { premiumPokeballs: 3 }, weight: 4, rarity: 'rare' },
  { id: 10, label: 'Glowing!', icon: 'glowingPokeball', reward: { glowingPokeballs: 1 }, weight: 2, rarity: 'ultra-rare' },
];
