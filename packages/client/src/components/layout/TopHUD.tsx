import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { getMaxEnergy, trainerXpToNextLevel, TOTAL_REGIONS, BEGINNER_BONUS } from '@gatchamon/shared';
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
  const { active: beginnerActive, remaining } = useBeginnerCountdown(player?.createdAt);

  if (!player) return null;
  if (location.pathname.startsWith('/battle/')) return null;
  if (location.pathname.startsWith('/collection')) return null;

  const maxEnergy = getMaxEnergy(player.trainerSkills);
  const xpNeeded = trainerXpToNextLevel(player.trainerLevel);
  const xpPct = Math.min(100, Math.floor((player.trainerExp / xpNeeded) * 100));

  return (
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
                      <li><span className="bonus-value">x{BEGINNER_BONUS.xpMult}</span> EXP (pokemon & trainer)</li>
                      <li><span className="bonus-value">x{BEGINNER_BONUS.pokedollarMult}</span> Pokedollars</li>
                      <li><span className="bonus-value">x{BEGINNER_BONUS.essenceMult}</span> Essence drops</li>
                      <li><span className="bonus-value">+{BEGINNER_BONUS.summon5StarBonus}%</span> 5-star summon rate</li>
                      <li><span className="bonus-value">+{BEGINNER_BONUS.summon4StarBonus}%</span> 4-star summon rate</li>
                      <li><span className="bonus-value">+{Math.round(BEGINNER_BONUS.itemDropBonusChance * 100)}%</span> Held item drop chance</li>
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
        <button className="hud-inbox-btn" onClick={() => navigate('/inbox')}>
          <GameIcon id="gift" size={14} />
          {inboxUnreadCount > 0 && (
            <span className="hud-inbox-badge">{inboxUnreadCount}</span>
          )}
        </button>
        <div className="hud-resource">
          <GameIcon id="energy" size={14} className="hud-energy-icon" />
          <span>{player.energy}/{maxEnergy}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="pokedollar" size={14} className="hud-pokedollar-icon" />
          <span>{(player.pokedollars ?? 0).toLocaleString()}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="stardust" size={14} className="hud-stardust-icon" />
          <span>{(player.stardust ?? 0).toLocaleString()}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="pokeball" size={14} />
          <span>{player.regularPokeballs}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="premiumPokeball" size={14} />
          <span>{player.premiumPokeballs}</span>
        </div>
      </div>
    </header>
  );
}
