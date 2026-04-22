/**
 * Single source of truth for stardust shop prices. Both client (display +
 * confirm modal) and server (purchase authorization) import from here so the
 * two can never drift — that drift is what caused the 0.7.4 shop-price bug.
 */
export const SHOP_COSTS = {
  speed_x3: 300,
  energy_pack_100: 50,
  arena_ticket_pack_10: 100,
  glowing_pack_3: 200,
  premium_pack_10: 300,
  legendary_bundle: 1000,
} as const;

export type ShopItemId = keyof typeof SHOP_COSTS;
