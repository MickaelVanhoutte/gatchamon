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
    cost: 300,
  },
  {
    id: 'energy_pack_100',
    name: 'Energy Pack',
    description: '100 Energy',
    icon: 'energy',
    cost: 50,
  },
  {
    id: 'arena_ticket_pack_10',
    name: 'Arena Tickets',
    description: '10 Arena Tickets',
    icon: 'swords',
    cost: 100,
  },
  {
    id: 'glowing_pack_3',
    name: 'Glowing Pack',
    description: '3 Glowing Pokeballs (3-5★ Shiny)',
    icon: 'glowingPokeball',
    cost: 500,
  },
  {
    id: 'premium_pack_10',
    name: 'Premium Pack',
    description: '10x Premium Summons (3-5★)',
    icon: 'premiumPokeball',
    cost: 500,
  },
  {
    id: 'legendary_bundle',
    name: 'Legendary Bundle',
    description: '1x Legendary Summon + 3x Premium Pack (31 summons)',
    icon: 'legendaryPokeball',
    cost: 3000,
  },
];
