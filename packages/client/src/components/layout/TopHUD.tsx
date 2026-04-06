import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { getMaxEnergy, trainerXpToNextLevel, TOTAL_REGIONS, BEGINNER_BONUS } from '@gatchamon/shared';
import { onUpdateAvailable } from '../../services/sw-update';
import { canSpinToday, getRemainingSpins } from '../../services/roulette.service';
import { DailyRouletteModal } from '../DailyRouletteModal';
import { GameIcon } from '../icons';
import './TopHUD.css';

const BEGINNER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function useBeginnerCountdown(createdAt: string | undefined) {
  const [remaining, setRemaining] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!createdAt) return;

    function tick() {
      const end = new Date(createdAt!).getTime() + BEGINNER_DURATION_MS;
      const diff = end - Date.now();
      if (diff <= 0) {
        setActive(false);
        setRemaining('');
        return;
      }
      setActive(true);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) {
        setRemaining(`${days}d ${hours}h`);
      } else {
        setRemaining(`${hours}h ${minutes}m`);
      }
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [createdAt]);

  return { active, remaining };
}

export function TopHUD() {
  const { player, inboxUnreadCount } = useGameStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBonusTooltip, setShowBonusTooltip] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteAvailable, setRouletteAvailable] = useState(canSpinToday());
  const { active: beginnerActive, remaining } = useBeginnerCountdown(player?.createdAt);

  useEffect(() => {
    onUpdateAvailable(() => setUpdateAvailable(true));
  }, []);

  if (!player) return null;
  if (location.pathname.startsWith('/battle/')) return null;
  if (location.pathname.startsWith('/collection')) return null;

  const maxEnergy = getMaxEnergy(player.trainerSkills);
  const xpNeeded = trainerXpToNextLevel(player.trainerLevel);
  const xpPct = Math.min(100, Math.floor((player.trainerExp / xpNeeded) * 100));

  return (
    <>
    <header className="top-hud">
      <div className="hud-left">
        <div className="hud-trainer-row">
          <span className="hud-trainer-level">Lv.{player.trainerLevel}</span>
          <span className="hud-player-name">{player.name}</span>
          {beginnerActive && (
            <div className="hud-beginner-wrapper">
              <button
                className="hud-beginner-badge"
                onClick={() => setShowBonusTooltip(v => !v)}
              >
                <GameIcon id="sparkles" size={12} />
                <span>Beginner</span>
                <span className="hud-beginner-timer">{remaining}</span>
              </button>
              {showBonusTooltip && (
                <>
                  <div className="hud-beginner-overlay" onClick={() => setShowBonusTooltip(false)} />
                  <div className="hud-beginner-tooltip">
                    <div className="hud-beginner-tooltip-title">Beginner Bonus</div>
                    <div className="hud-beginner-tooltip-timer">Expires in {remaining}</div>
                    <ul className="hud-beginner-tooltip-list">
                      {BEGINNER_BONUS.xpMult > 1 && <li><span className="bonus-value">x{BEGINNER_BONUS.xpMult}</span> EXP (pokemon & trainer)</li>}
                      {BEGINNER_BONUS.pokedollarMult > 1 && <li><span className="bonus-value">x{BEGINNER_BONUS.pokedollarMult}</span> Pokedollars</li>}
                      {BEGINNER_BONUS.essenceMult > 1 && <li><span className="bonus-value">x{BEGINNER_BONUS.essenceMult}</span> Essence drops</li>}
                      {BEGINNER_BONUS.summon5StarBonus > 0 && <li><span className="bonus-value">+{BEGINNER_BONUS.summon5StarBonus}%</span> 5-star summon rate</li>}
                      {BEGINNER_BONUS.summon4StarBonus > 0 && <li><span className="bonus-value">+{BEGINNER_BONUS.summon4StarBonus}%</span> 4-star summon rate</li>}
                      {BEGINNER_BONUS.itemDropBonusChance > 0 && <li><span className="bonus-value">+{Math.round(BEGINNER_BONUS.itemDropBonusChance * 100)}%</span> Held item drop chance</li>}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="hud-xp-bar">
          <div className="hud-xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <span className="hud-floor">Region {Object.keys(player.storyProgress.normal).length}/{TOTAL_REGIONS}</span>
      </div>
      <div className="hud-right">
        {updateAvailable && (
          <button className="hud-update-btn" onClick={() => window.location.reload()} title="Update available — tap to restart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        )}
        <button className={`hud-roulette-btn${rouletteAvailable ? ' hud-roulette-btn--available' : ''}`} onClick={() => { setShowRoulette(true); }} title="Daily Roulette">
          <GameIcon id="roulette" size={13} />
          {rouletteAvailable && (
            <span className="hud-inbox-badge">{getRemainingSpins()}</span>
          )}
        </button>
        <button className={`hud-inbox-btn${inboxUnreadCount > 0 ? ' hud-inbox-btn--unread' : ''}`} onClick={() => navigate('/inbox')}>
          <GameIcon id="gift" size={13} />
          {inboxUnreadCount > 0 && (
            <span className="hud-inbox-badge">{inboxUnreadCount}</span>
          )}
        </button>
        <div className="hud-resource hud-resource--energy">
          <GameIcon id="energy" size={12} className="hud-energy-icon" />
          <span>{player.energy}/{maxEnergy}</span>
        </div>
        <div className="hud-resource hud-resource--pokedollar">
          <GameIcon id="pokedollar" size={12} className="hud-pokedollar-icon" />
          <span>{(player.pokedollars ?? 0).toLocaleString()}</span>
        </div>
        <div className="hud-resource hud-resource--stardust">
          <GameIcon id="stardust" size={12} className="hud-stardust-icon" />
          <span>{(player.stardust ?? 0).toLocaleString()}</span>
        </div>
        <div className="hud-resource hud-resource--pokeball">
          <GameIcon id="pokeball" size={12} />
          <span>{player.regularPokeballs}</span>
        </div>
        <div className="hud-resource hud-resource--premium">
          <GameIcon id="premiumPokeball" size={12} />
          <span>{player.premiumPokeballs}</span>
        </div>
      </div>
    </header>
    {showRoulette && (
      <DailyRouletteModal onClose={() => { setShowRoulette(false); setRouletteAvailable(canSpinToday()); }} />
    )}
    </>
  );
}
