import { useLocation } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import './TopHUD.css';

export function TopHUD() {
  const { player } = useGameStore();
  const location = useLocation();

  if (!player) return null;
  if (location.pathname.startsWith('/battle/')) return null;

  return (
    <header className="top-hud">
      <div className="hud-left">
        <span className="hud-player-name">{player.name}</span>
        <span className="hud-floor">Region {Object.keys(player.storyProgress.normal).length}/11</span>
      </div>
      <div className="hud-right">
        <div className="hud-resource">
          <span className="hud-energy-icon">⚡</span>
          <span>{player.energy}</span>
        </div>
        <div className="hud-resource">
          <span className="hud-pokeball-icon">●</span>
          <span>{player.pokeballs}</span>
        </div>
      </div>
    </header>
  );
}
