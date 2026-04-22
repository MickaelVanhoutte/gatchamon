import { SHOP_COSTS } from '@gatchamon/shared';

export interface ShopItemDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
}

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'speed_x3',
    name: 'Speed x3',
    description: 'Unlock x3 battle speed',
    icon: 'sparkles',
    cost: SHOP_COSTS.speed_x3,
  },
  {
    id: 'energy_pack_100',
    name: 'Energy Pack',
    description: '100 Energy',
    icon: 'energy',
    cost: SHOP_COSTS.energy_pack_100,
  },
  {
    id: 'arena_ticket_pack_10',
    name: 'Arena Tickets',
    description: '10 Arena Tickets',
    icon: 'swords',
    cost: SHOP_COSTS.arena_ticket_pack_10,
  },
  {
    id: 'glowing_pack_3',
    name: 'Glowing Pack',
    description: '3 Glowing Pokeballs (3-5★ Shiny)',
    icon: 'glowingPokeball',
    cost: SHOP_COSTS.glowing_pack_3,
  },
  {
    id: 'premium_pack_10',
    name: 'Premium Pack',
    description: '10 Premium Pokeballs (3-5★)',
    icon: 'premiumPokeball',
    cost: SHOP_COSTS.premium_pack_10,
  },
  {
    id: 'legendary_bundle',
    name: 'Legendary Bundle',
    description: '1 Legendary + 30 Premium Pokeballs',
    icon: 'legendaryPokeball',
    cost: SHOP_COSTS.legendary_bundle,
  },
];
