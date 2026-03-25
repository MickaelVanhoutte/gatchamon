import { useLocation } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { getMaxEnergy, trainerXpToNextLevel, TOTAL_REGIONS } from '@gatchamon/shared';
import { GameIcon } from '../icons';
import './TopHUD.css';

export function TopHUD() {
  const { player } = useGameStore();
  const location = useLocation();

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
        </div>
        <div className="hud-xp-bar">
          <div className="hud-xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <span className="hud-floor">Region {Object.keys(player.storyProgress.normal).length}/{TOTAL_REGIONS}</span>
      </div>
      <div className="hud-right">
        <div className="hud-resource">
          <GameIcon id="energy" size={14} className="hud-energy-icon" />
          <span>{player.energy}/{maxEnergy}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="stardust" size={14} className="hud-stardust-icon" />
          <span>{(player.stardust ?? 0).toLocaleString()}</span>
        </div>
        <div className="hud-resource">
          <GameIcon id="pokeball" size={14} />
          <span>{player.pokeballs}</span>
        </div>
      </div>
    </header>
  );
}
