import { ROULETTE_SLOTS, isBeginnerBonusActive } from '@gatchamon/shared';
import type { RouletteSlot } from '@gatchamon/shared';
import { loadRoulette, saveRoulette, loadPlayer } from './storage';
import { applyReward } from './reward.service';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMaxSpins(): number {
  const player = loadPlayer();
  if (player?.createdAt && isBeginnerBonusActive(player.createdAt)) {
    return 2;
  }
  return 1;
}

export function getRemainingSpins(): number {
  const data = loadRoulette();
  const maxSpins = getMaxSpins();

  if (!data || data.lastSpinDate !== todayStr()) {
    return maxSpins;
  }

  return Math.max(0, maxSpins - (data.spinsToday ?? 0));
}

export function canSpinToday(): boolean {
  return getRemainingSpins() > 0;
}

export function spinRoulette(): { slotIndex: number; slot: RouletteSlot } {
  const totalWeight = ROULETTE_SLOTS.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * totalWeight;
  let slotIndex = 0;

  for (let i = 0; i < ROULETTE_SLOTS.length; i++) {
    roll -= ROULETTE_SLOTS[i].weight;
    if (roll <= 0) {
      slotIndex = i;
      break;
    }
  }

  const slot = ROULETTE_SLOTS[slotIndex];

  // Apply reward immediately
  applyReward(slot.reward);

  // Update spin count
  const data = loadRoulette();
  const today = todayStr();
  const spinsToday = (data && data.lastSpinDate === today) ? (data.spinsToday ?? 0) + 1 : 1;
  saveRoulette({ lastSpinDate: today, spinsToday });

  return { slotIndex, slot };
}
