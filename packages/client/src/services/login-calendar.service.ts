import { LOGIN_CALENDAR_REWARDS, LOGIN_CALENDAR_DAYS } from '@gatchamon/shared';
import type { MissionReward } from '@gatchamon/shared';
import { loadLoginCalendar, saveLoginCalendar } from './storage';
import type { LoginCalendarData } from './storage';
import { sendInboxItem } from './inbox.service';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export function getCurrentCalendarDay(): number {
  return Math.min(new Date().getDate(), LOGIN_CALENDAR_DAYS);
}

export function loadLoginCalendarState(): LoginCalendarData {
  const existing = loadLoginCalendar();
  const month = currentMonth();

  // Reset if month changed or no data
  if (!existing || existing.month !== month) {
    const fresh: LoginCalendarData = { month, claimedDays: [], lastClaimDate: '' };
    saveLoginCalendar(fresh);
    return fresh;
  }

  return existing;
}

export function canClaimToday(): boolean {
  const state = loadLoginCalendarState();
  return state.lastClaimDate !== todayStr();
}

export function claimTodayReward(): MissionReward | null {
  const state = loadLoginCalendarState();
  const today = todayStr();

  if (state.lastClaimDate === today) return null;

  const day = getCurrentCalendarDay();
  const reward = LOGIN_CALENDAR_REWARDS[day - 1];
  if (!reward) return null;

  // Send reward to inbox
  sendInboxItem({
    title: `Daily Login - Day ${day}`,
    message: `Your daily login reward for day ${day}!`,
    reward,
  });

  // Mark as claimed
  if (!state.claimedDays.includes(day)) {
    state.claimedDays.push(day);
  }
  state.lastClaimDate = today;
  saveLoginCalendar(state);

  return reward;
}

export function getCalendarState() {
  const state = loadLoginCalendarState();
  return {
    state,
    currentDay: getCurrentCalendarDay(),
    canClaim: state.lastClaimDate !== todayStr(),
  };
}
