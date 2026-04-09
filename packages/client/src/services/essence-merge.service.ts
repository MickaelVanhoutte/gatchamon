import { ELEMENTS } from '@gatchamon/shared';

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
