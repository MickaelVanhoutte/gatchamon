import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMysteryDungeonDef, getMysteryDungeonResetTime, getTemplate, PIECE_COST } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import { useGameStore } from '../stores/gameStore';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';

function formatTimeUntilMysteryReset(): string {
  const now = new Date();
  const next = getMysteryDungeonResetTime(now);
  const diff = next.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function MysteryDungeonPanel() {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [energyError, setEnergyError] = useState<string | null>(null);
  const repeatStatus = useRepeatBattleStore(s => s.status);

  const def = useMemo(() => getMysteryDungeonDef(), []);
  const template = useMemo(() => getTemplate(def.featuredTemplateId), [def.featuredTemplateId]);
  const resetTimer = useMemo(() => formatTimeUntilMysteryReset(), []);

  if (!template || !player) return null;

  const floor = def.floors[selectedFloor];
  const energyCost = def.energyCosts[selectedFloor];
  const currentPieces = player.mysteryPieces?.[def.featuredTemplateId] ?? 0;
  const neededPieces = PIECE_COST[template.naturalStars] ?? 30;
  const progressPct = Math.min(100, Math.round((currentPieces / neededPieces) * 100));

  const primaryType = template.types[0];
  const typeColors: Record<string, string> = {
    normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850',
    electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
    ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
    steel: '#b8b8d0', fairy: '#ee99ac',
  };
  const themeColor = typeColors[primaryType] ?? '#a855f7';

  const showError = (msg: string) => {
    setEnergyError(msg);
    setTimeout(() => setEnergyError(null), 2000);
  };

  const handleEnter = () => {
    if (!player) return;
    if (repeatStatus === 'running') {
      showError('Repeat battle in progress!');
      return;
    }
    if (player.energy < energyCost) {
      showError('Not enough energy!');
      return;
    }
    navigate(`/battle/team-select?mode=mystery-dungeon&floor=${selectedFloor}`);
  };

  // Get unique enemy templates for the floor
  const uniqueEnemyIds = [...new Set(floor.enemies)];
  const enemyTemplates = uniqueEnemyIds.map(id => getTemplate(id)).filter(Boolean);

  return (
    <div className="mystery-dungeon-panel">
      {energyError && <div className="dungeon-energy-error">{energyError}</div>}

      {/* Featured pokemon header */}
      <div className="mystery-featured" style={{ borderColor: themeColor }}>
        <div className="mystery-featured-sprite">
          <img
            src={assetUrl(template.spriteUrl)}
            alt={template.name}
          />
        </div>
        <div className="mystery-featured-info">
          <h3 className="mystery-featured-name">{template.name}</h3>
          <StarRating count={template.naturalStars} size={14} />
          <span className="mystery-featured-type" style={{ background: themeColor }}>
            {primaryType}
          </span>
        </div>
        <div className="mystery-reset-timer">
          Resets in {resetTimer}
        </div>
      </div>

      {/* Piece progress */}
      <div className="mystery-pieces">
        <span className="mystery-pieces-label">Pieces</span>
        <div className="mystery-pieces-bar-container">
          <div className="mystery-pieces-bar" style={{ width: `${progressPct}%`, background: themeColor }} />
        </div>
        <span className="mystery-pieces-count">{currentPieces} / {neededPieces}</span>
      </div>

      {/* Floor selector */}
      <div className="dungeon-floors">
        <span className="dungeon-floors-label">Floor</span>
        <div className="dungeon-floor-btns">
          {def.floors.map((f, i) => (
            <button
              key={i}
              className={`dungeon-floor-btn ${selectedFloor === i ? 'dungeon-floor-btn--active' : ''}`}
              onClick={() => setSelectedFloor(i)}
            >
              B{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Floor details */}
      <div className="mystery-floor-details">
        <div className="mystery-floor-enemies">
          <span className="mystery-floor-enemies-label">Enemies</span>
          <div className="mystery-floor-enemy-list">
            {enemyTemplates.map(t => t && (
              <div key={t.id} className="mystery-floor-enemy">
                <img src={assetUrl(t.spriteUrl)} alt={t.name} />
                <span className="mystery-floor-enemy-name">{t.name}</span>
              </div>
            ))}
          </div>
          <div className="mystery-floor-stats">
            <span>Lv.{floor.enemyLevel}</span>
            <StarRating count={Math.min(floor.enemyStars, 6)} size={10} />
            {floor.statBoost && <span>+{Math.round((floor.statBoost - 1) * 100)}% stats</span>}
          </div>
        </div>

        <div className="mystery-floor-reward">
          <GameIcon id="sparkles" size={14} />
          <span>{floor.pieceReward} piece{floor.pieceReward > 1 ? 's' : ''}</span>
        </div>
      </div>

      <button
        className="dungeon-enter-btn"
        onClick={handleEnter}
        disabled={!player || player.energy < energyCost}
        style={{ background: themeColor }}
      >
        Go ({energyCost} <GameIcon id="energy" size={14} />)
      </button>
    </div>
  );
}
