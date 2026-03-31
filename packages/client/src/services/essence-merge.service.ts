import type { EssenceTier } from '@gatchamon/shared';
import { ELEMENTS } from '@gatchamon/shared';
import { loadPlayer, savePlayer } from './storage';

const MERGE_RATIO = 10;

export interface MergeCost {
  lowConsumed: number;
  midConsumed: number;
  targetTier: 'mid' | 'high';
  targetCount: number;
}

export function calculateMergeCost(
  targetTier: 'mid' | 'high',
  targetCount: number,
  availableLow: number,
  availableMid: number,
): MergeCost | null {
  if (targetCount <= 0) return null;

  if (targetTier === 'mid') {
    const lowNeeded = targetCount * MERGE_RATIO;
    if (availableLow < lowNeeded) return null;
    return { lowConsumed: lowNeeded, midConsumed: 0, targetTier, targetCount };
  }

  // targetTier === 'high'
  const midNeeded = targetCount * MERGE_RATIO;
  const midFromStock = Math.min(availableMid, midNeeded);
  const midStillNeeded = midNeeded - midFromStock;
  const lowNeeded = midStillNeeded * MERGE_RATIO;
  if (availableLow < lowNeeded) return null;
  return { lowConsumed: lowNeeded, midConsumed: midFromStock, targetTier, targetCount };
}

export function getMaxMergeCount(
  targetTier: 'mid' | 'high',
  availableLow: number,
  availableMid: number,
): number {
  if (targetTier === 'mid') {
    return Math.floor(availableLow / MERGE_RATIO);
  }
  // For high: each high needs 10 mid. Mid can come from stock or from converting low (10 low = 1 mid)
  const totalMid = availableMid + Math.floor(availableLow / MERGE_RATIO);
  return Math.floor(totalMid / MERGE_RATIO);
}

export function performMerge(element: string, targetTier: 'mid' | 'high', targetCount: number): void {
  const player = loadPlayer();
  if (!player) throw new Error('No player found');

  if (!ELEMENTS.includes(element as any)) throw new Error(`Invalid element: ${element}`);

  const materials = { ...(player.materials ?? {}) };
  const lowKey = `${element}_low`;
  const midKey = `${element}_mid`;
  const highKey = `${element}_high`;
  const availableLow = materials[lowKey] ?? 0;
  const availableMid = materials[midKey] ?? 0;

  const cost = calculateMergeCost(targetTier, targetCount, availableLow, availableMid);
  if (!cost) throw new Error('Not enough essences to merge');

  // Deduct
  materials[lowKey] = availableLow - cost.lowConsumed;
  materials[midKey] = (targetTier === 'high')
    ? availableMid - cost.midConsumed
    : (materials[midKey] ?? 0);

  // Add produced essences
  const targetKey = targetTier === 'mid' ? midKey : highKey;
  materials[targetKey] = (materials[targetKey] ?? 0) + targetCount;

  // Clean up zero values
  for (const key of Object.keys(materials)) {
    if (materials[key] <= 0) delete materials[key];
  }

  savePlayer({ ...player, materials });
}

export interface ElementEssenceSummary {
  element: string;
  low: number;
  mid: number;
  high: number;
  total: number;
}

export function getOwnedEssences(materials: Record<string, number>): ElementEssenceSummary[] {
  const summaries: ElementEssenceSummary[] = [];
  for (const element of ELEMENTS) {
    const low = materials[`${element}_low`] ?? 0;
    const mid = materials[`${element}_mid`] ?? 0;
    const high = materials[`${element}_high`] ?? 0;
    const total = low + mid + high;
    if (total > 0) {
      summaries.push({ element, low, mid, high, total });
    }
  }
  return summaries.sort((a, b) => b.total - a.total);
}
