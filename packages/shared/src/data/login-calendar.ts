import type { MissionReward } from '../types/rewards.js';

export const LOGIN_CALENDAR_DAYS = 28;

const ELEMENTS = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'fairy', 'dark', 'steel', 'magic',
] as const;

function allEssences(tier: 'low' | 'mid' | 'high', qty: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const el of ELEMENTS) {
    result[`${el}_${tier}`] = qty;
  }
  return result;
}

/** 28-day login calendar rewards (index 0 = day 1). */
export const LOGIN_CALENDAR_REWARDS: MissionReward[] = [
  // Week 1
  { stardust: 5000 },                                                          // Day 1
  { regularPokeballs: 10 },                                                    // Day 2
  { energy: 20 },                                                              // Day 3
  { essences: allEssences('low', 1) },                                         // Day 4
  { premiumPokeballs: 3 },                                                     // Day 5
  { stardust: 10000 },                                                         // Day 6
  { heldItem: { setId: 'swift_wing', stars: 2, grade: 'rare' } },              // Day 7

  // Week 2
  { regularPokeballs: 15 },                                                    // Day 8
  { energy: 30 },                                                              // Day 9
  { essences: allEssences('mid', 1) },                                         // Day 10
  { premiumPokeballs: 5 },                                                     // Day 11
  { stardust: 15000 },                                                         // Day 12
  { regularPokeballs: 20 },                                                    // Day 13
  { heldItem: { setId: 'power_band', stars: 3, grade: 'rare' } },              // Day 14

  // Week 3
  { energy: 40 },                                                              // Day 15
  { essences: allEssences('high', 1) },                                        // Day 16
  { premiumPokeballs: 8 },                                                     // Day 17
  { stardust: 20000 },                                                         // Day 18
  { regularPokeballs: 25 },                                                    // Day 19
  { essences: allEssences('low', 2) },                                         // Day 20
  { heldItem: { setId: 'scope_lens', stars: 3, grade: 'hero' } },              // Day 21

  // Week 4
  { energy: 50 },                                                              // Day 22
  { premiumPokeballs: 10 },                                                    // Day 23
  { stardust: 30000 },                                                         // Day 24
  { essences: allEssences('mid', 2) },                                         // Day 25
  { regularPokeballs: 30 },                                                    // Day 26
  { stardust: 50000 },                                                         // Day 27
  { premiumPokeballs: 15, heldItem: { setId: 'kings_rock', stars: 4, grade: 'hero' } }, // Day 28
];
