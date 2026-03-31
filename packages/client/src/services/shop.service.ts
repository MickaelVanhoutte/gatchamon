import type { SummonResult } from './gacha.service';
import { shopSummonMultiPremium, shopSummonSingleLegendary } from './gacha.service';
import { spendStardust } from './player.service';

export interface ShopItemDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
}

export const SHOP_ITEMS: ShopItemDef[] = [
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

export interface ShopPurchaseResult {
  results: SummonResult[];
}

export function purchaseShopItem(itemId: string): ShopPurchaseResult {
  const def = SHOP_ITEMS.find(i => i.id === itemId);
  if (!def) throw new Error('Unknown shop item');

  // Spend stardust (throws if insufficient)
  spendStardust(def.cost);

  const results: SummonResult[] = [];

  if (itemId === 'premium_pack_10') {
    results.push(...shopSummonMultiPremium());
  } else if (itemId === 'legendary_bundle') {
    // 1 legendary + 3 premium multi packs
    results.push(shopSummonSingleLegendary());
    results.push(...shopSummonMultiPremium());
    results.push(...shopSummonMultiPremium());
    results.push(...shopSummonMultiPremium());
  }

  return { results };
}
