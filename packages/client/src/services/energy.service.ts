import type { Player } from '@gatchamon/shared';

/**
 * Compute energy regeneration based on elapsed time.
 * Pure function — returns updated player without side effects.
 */
export function regenerateEnergy(
  player: Player,
  maxEnergy: number,
  regenIntervalMs: number,
): Player {
  const now = Date.now();
  const lastUpdate = player.lastEnergyUpdate
    ? new Date(player.lastEnergyUpdate).getTime()
    : now;

  if (player.energy >= maxEnergy) {
    return { ...player, lastEnergyUpdate: new Date(now).toISOString() };
  }

  const elapsed = now - lastUpdate;
  if (elapsed < regenIntervalMs) return player;

  const ticks = Math.floor(elapsed / regenIntervalMs);
  if (ticks <= 0) return player;

  const newEnergy = Math.min(maxEnergy, player.energy + ticks);
  // Advance timestamp by exact ticks to preserve partial-tick progress
  const advancedMs = lastUpdate + ticks * regenIntervalMs;

  return {
    ...player,
    energy: newEnergy,
    lastEnergyUpdate: new Date(advancedMs).toISOString(),
  };
}
