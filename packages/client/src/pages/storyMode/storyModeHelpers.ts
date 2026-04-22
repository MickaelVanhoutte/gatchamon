import { getFloorCount } from '@gatchamon/shared';
import type { Difficulty, StoryProgress, StoryArc } from '@gatchamon/shared';

export type RegionStatus = 'locked' | 'available' | 'completed';

/**
 * Pure helpers extracted from StoryModePage. Keep this file dependency-free
 * (no React, no stores) so the logic is testable in isolation and the page
 * stays focused on rendering.
 */

export function isDifficultyUnlocked(
  diff: Difficulty,
  currentArc: StoryArc | undefined,
  progress: StoryProgress,
): boolean {
  if (!currentArc) return diff === 'normal';
  const rp = progress[diff];
  return !!rp && rp[currentArc.regionIds[0]] !== undefined;
}

export function getRegionStatus(
  regionId: number,
  regionProgress: Record<number, number> | undefined,
): RegionStatus {
  const floor = regionProgress?.[regionId];
  if (floor === undefined) return 'locked';
  if (floor === getFloorCount(regionId) + 1) return 'completed';
  return 'available';
}

export function getRegionStars(
  regionId: number,
  regionProgress: Record<number, number> | undefined,
): { completed: number; total: number } {
  const floor = regionProgress?.[regionId] ?? 0;
  const total = getFloorCount(regionId);
  const completed = floor === total + 1 ? total : Math.max(0, floor - 1);
  return { completed, total };
}
