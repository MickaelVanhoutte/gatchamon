import { useEffect, useState } from 'react';
import { LOGIN_CALENDAR_REWARDS, LOGIN_CALENDAR_DAYS } from '@gatchamon/shared';
import type { MissionReward } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import * as serverApi from '../services/server-api.service';
import { GameIcon } from './icons';
import { haptic } from '../utils/haptics';
import './LoginCalendarModal.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getRewardIcon(reward: MissionReward): string {
  if (reward.heldItem) return 'gift';
  if (reward.premiumPokeballs) return 'premiumPokeball';
  if (reward.essences) return 'sparkles';
  if (reward.pokedollars) return 'pokedollar';
  if (reward.stardust) return 'stardust';
  if (reward.regularPokeballs) return 'pokeball';
  if (reward.energy) return 'energy';
  return 'star';
}

function getRewardLabel(reward: MissionReward): string {
  if (reward.heldItem && reward.premiumPokeballs) return `${reward.premiumPokeballs} PB+Item`;
  if (reward.heldItem) return 'Item';
  if (reward.premiumPokeballs) return `${reward.premiumPokeballs} PB`;
  if (reward.essences) {
    const total = Object.values(reward.essences).reduce((a, b) => a + b, 0);
    return `${total} Ess`;
  }
  if (reward.pokedollars) {
    return reward.pokedollars >= 1000 ? `${reward.pokedollars / 1000}K ₽` : `${reward.pokedollars} ₽`;
  }
  if (reward.stardust) {
    return reward.stardust >= 1000 ? `${reward.stardust / 1000}K SD` : `${reward.stardust} SD`;
  }
  if (reward.regularPokeballs) return `${reward.regularPokeballs} RB`;
  if (reward.energy) return `${reward.energy} E`;
  return '???';
}

interface LoginCalendarModalProps {
  onClose: () => void;
}

export function LoginCalendarModal({ onClose }: LoginCalendarModalProps) {
  const [claimedDay, setClaimedDay] = useState<number | null>(null);

  const [serverState, setServerState] = useState<{ claimedDays: number[]; lastClaimDate: string } | null>(null);

  const currentDay = Math.min(new Date().getDate(), LOGIN_CALENDAR_DAYS);

  useEffect(() => {
    // Load calendar then auto-claim
    serverApi.getLoginCalendar().then(async (res: any) => {
      setServerState(res);
      const todayStr = new Date().toISOString().slice(0, 10);
      if (res.lastClaimDate !== todayStr) {
        try {
          const claimRes = await serverApi.claimLoginCalendarDay();
          if (claimRes?.reward) {
            setClaimedDay(currentDay);
            haptic.success();
            useGameStore.getState().refreshInbox();
            useGameStore.getState().refreshPlayer();
            // Reload calendar state
            const updated = await serverApi.getLoginCalendar();
            setServerState(updated);
          }
        } catch {}
      }
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const state = serverState ?? { claimedDays: [], lastClaimDate: '' };

  const monthIndex = new Date().getMonth();
  const monthName = MONTH_NAMES[monthIndex];

  return (
    <div className="lcm-overlay" onClick={onClose}>
      <div className="lcm-modal" onClick={e => e.stopPropagation()}>
        <button className="lcm-close" onClick={onClose}>
          <GameIcon id="close" size={18} />
        </button>

        <div className="lcm-header">
          <h3 className="lcm-title">Daily Login</h3>
          <div className="lcm-month">{monthName}</div>
        </div>

        <div className="lcm-grid">
          {Array.from({ length: LOGIN_CALENDAR_DAYS }, (_, i) => {
            const day = i + 1;
            const reward = LOGIN_CALENDAR_REWARDS[i];
            const isClaimed = state.claimedDays.includes(day) || day === claimedDay;
            const isToday = day === currentDay;
            const isFuture = day > currentDay;

            let cellClass = 'lcm-cell';
            if (isClaimed) cellClass += ' lcm-cell--claimed';
            if (isToday) cellClass += ' lcm-cell--today';
            if (isToday && !isClaimed) cellClass += ' lcm-cell--today-unclaimed';
            if (isFuture) cellClass += ' lcm-cell--future';

            return (
              <div key={day} className={cellClass}>
                {isClaimed && (
                  <span className="lcm-check">
                    <GameIcon id="check" size={8} />
                  </span>
                )}
                <span className="lcm-day-number">{day}</span>
                <span className="lcm-reward-icon">
                  <GameIcon id={getRewardIcon(reward)} size={14} />
                </span>
                <span className="lcm-reward-label">{getRewardLabel(reward)}</span>
              </div>
            );
          })}
        </div>

        {claimedDay !== null && (
          <div className="lcm-banner">
            <p className="lcm-banner-text">
              Day {claimedDay} reward sent to your inbox!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
