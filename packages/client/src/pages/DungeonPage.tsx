import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { DUNGEONS, ESSENCES } from '@gatchamon/shared';
import './DungeonPage.css';

export function DungeonPage() {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const [selectedDungeon, setSelectedDungeon] = useState(DUNGEONS[0]);
  const [selectedFloor, setSelectedFloor] = useState(0);

  const handleEnter = () => {
    if (!player) return;
    if (player.energy < selectedDungeon.energyCost) {
      alert('Not enough energy!');
      return;
    }
    navigate(`/battle/team-select?mode=dungeon&dungeonId=${selectedDungeon.id}&floor=${selectedFloor}`);
  };

  // Gather unique essence types this dungeon drops
  const droppableEssences = new Set<string>();
  for (const floor of selectedDungeon.floors) {
    for (const drop of floor.drops) {
      droppableEssences.add(drop.essenceId);
    }
  }

  const materials = player?.materials ?? {};

  return (
    <div className="page dungeon-page">
      <h2 className="dungeon-title">Dungeons</h2>

      <div className="dungeon-layout">
        {/* Left: Dungeon list */}
        <div className="dungeon-list">
          {DUNGEONS.map(d => (
            <div
              key={d.id}
              className={`dungeon-card ${selectedDungeon.id === d.id ? 'dungeon-card--selected' : ''}`}
              onClick={() => { setSelectedDungeon(d); setSelectedFloor(0); }}
              style={{ borderLeftColor: d.color }}
            >
              <span className="dungeon-card-icon">{d.icon}</span>
              <div className="dungeon-card-info">
                <span className="dungeon-card-name">{d.name}</span>
                <span className="dungeon-card-cost">{d.energyCost} Energy</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detail panel */}
        <div className="dungeon-detail">
          <div className="dungeon-detail-header" style={{ borderBottomColor: selectedDungeon.color }}>
            <span className="dungeon-detail-icon">{selectedDungeon.icon}</span>
            <h3>{selectedDungeon.name}</h3>
          </div>

          <p className="dungeon-desc">{selectedDungeon.description}</p>

          {/* Floor selector */}
          <div className="dungeon-floors">
            <span className="dungeon-floors-label">Floor</span>
            <div className="dungeon-floor-btns">
              {selectedDungeon.floors.map((_, i) => (
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

          {/* Floor info */}
          <div className="dungeon-floor-info">
            <div className="dungeon-info-row">
              <span>Enemy Level</span>
              <span>Lv.{selectedDungeon.floors[selectedFloor].enemyLevel}</span>
            </div>
            <div className="dungeon-info-row">
              <span>Energy Cost</span>
              <span>{selectedDungeon.energyCost}</span>
            </div>
          </div>

          {/* Droppable essences */}
          <div className="dungeon-drops">
            <span className="dungeon-drops-label">Possible Drops</span>
            <div className="dungeon-drops-grid">
              {Array.from(droppableEssences).map(essId => {
                const ess = ESSENCES[essId];
                if (!ess) return null;
                return (
                  <div key={essId} className="dungeon-drop-item">
                    <span className="drop-icon">{ess.icon}</span>
                    <span className="drop-name">{ess.name}</span>
                    <span className="drop-owned">x{materials[essId] ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="dungeon-enter-btn"
            onClick={handleEnter}
            disabled={!player || player.energy < selectedDungeon.energyCost}
            style={{ background: selectedDungeon.color }}
          >
            Enter Dungeon
          </button>
        </div>
      </div>
    </div>
  );
}
