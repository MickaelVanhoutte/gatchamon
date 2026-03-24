import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { POKEDEX, REGIONS } from '@gatchamon/shared';
import type { Difficulty } from '@gatchamon/shared';
import { getFloorDefsForRegion } from '../services/floor.service';
import { getFloorRewardPreview } from '../services/reward.service';
import type { FloorRewardPreview } from '../services/reward.service';
import { assetUrl } from '../utils/asset-url';
import './StoryModePage.css';

interface FloorEnemy {
  templateId: number;
  level: number;
  stars: number;
}

interface FloorInfo {
  region: number;
  floor: number;
  difficulty: Difficulty;
  enemyCount: number;
  isBoss: boolean;
  enemies: FloorEnemy[];
  rewardPreview: FloorRewardPreview;
}

const DIFFICULTIES: { key: Difficulty; label: string; color: string }[] = [
  { key: 'normal', label: 'Normal', color: '#78c850' },
  { key: 'hard', label: 'Hard', color: '#f08030' },
  { key: 'hell', label: 'Hell', color: '#e94560' },
];

function getMonsterName(templateId: number): string {
  return POKEDEX.find(p => p.id === templateId)?.name ?? `#${templateId}`;
}

export function StoryModePage() {
  const { player } = useGameStore();
  const navigate = useNavigate();
  const [floors, setFloors] = useState<FloorInfo[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const floorListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRegionId) {
      const defs = getFloorDefsForRegion(selectedRegionId, difficulty);
      const floorList: FloorInfo[] = Object.entries(defs).map(([floorNum, def]) => {
        const fn = Number(floorNum);
        const enemies = def.enemies.map(e => ({ templateId: e.templateId, level: e.level, stars: e.stars }));
        return {
          region: selectedRegionId,
          floor: fn,
          difficulty,
          enemyCount: def.enemies.length,
          isBoss: def.isBoss,
          enemies,
          rewardPreview: getFloorRewardPreview(selectedRegionId, fn, difficulty, def.enemies),
        };
      });
      setFloors(floorList);
    }
  }, [selectedRegionId, difficulty]);

  // Auto-scroll to first non-finished level when opening a region
  useEffect(() => {
    if (!floorListRef.current || floors.length === 0 || !selectedRegionId) return;
    setTimeout(() => {
      const currentEl = floorListRef.current?.querySelector('.floor-entry.current');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }, [floors, selectedRegionId]);

  if (!player) return null;

  const progress = player.storyProgress;
  const regionProgress = progress[difficulty] ?? {};
  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const selectedFloors = selectedRegion
    ? floors.filter(f => f.region === selectedRegion.id)
    : [];

  function isDifficultyUnlocked(diff: Difficulty): boolean {
    const rp = progress[diff];
    return rp && Object.keys(rp).length > 0;
  }

  function getRegionStatus(regionId: number) {
    const floor = regionProgress[regionId];
    if (floor === undefined) return 'locked';
    if (floor === 11) return 'completed';
    return 'available';
  }

  function getRegionStars(regionId: number) {
    const floor = regionProgress[regionId] ?? 0;
    // Completed floors = floor - 1, capped at 10
    const completed = floor === 11 ? 10 : Math.max(0, floor - 1);
    return { completed, total: 10 };
  }

  function handleDifficultyChange(diff: Difficulty) {
    if (!isDifficultyUnlocked(diff)) return;
    setDifficulty(diff);
    setSelectedRegionId(null);
    setFloors([]);
  }

  // Build SVG path connecting all regions in order
  const pathSegments: string[] = [];
  for (let i = 0; i < REGIONS.length - 1; i++) {
    const from = REGIONS[i].mapPosition;
    const to = REGIONS[i + 1].mapPosition;
    const midX = (from.x + to.x) / 2 + (i % 2 === 0 ? 5 : -5);
    const midY = (from.y + to.y) / 2 + (i % 2 === 0 ? -5 : 5);
    pathSegments.push(`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`);
  }

  return (
    <div className="page story-page">
      {/* World Map — horizontal scroll */}
      <div className="world-map">
        <div className="map-scroll">
          {/* Map background */}
          <div className="map-bg">
            <div className="map-water" />
            <div className="map-terrain terrain-grass-1" />
            <div className="map-terrain terrain-grass-2" />
            <div className="map-terrain terrain-mountain" />
            <div className="map-terrain terrain-snow" />

            {/* Paths connecting regions */}
            <svg className="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none">
              {pathSegments.map((d, i) => (
                <path key={i} d={d}
                  stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" fill="none" strokeDasharray="1.5,1.5" />
              ))}
            </svg>
          </div>

          {/* Region markers */}
          {REGIONS.map(region => {
          const status = getRegionStatus(region.id);
          const stars = getRegionStars(region.id);
          const isSelected = selectedRegionId === region.id;

          return (
            <button
              key={region.id}
              className={`zone-marker ${status} ${isSelected ? 'selected' : ''}`}
              style={{ left: `${region.mapPosition.x}%`, top: `${region.mapPosition.y}%` }}
              onClick={() => status !== 'locked' && setSelectedRegionId(isSelected ? null : region.id)}
              disabled={status === 'locked'}
            >
              <div className="zone-pin" style={{ '--zone-color': region.color } as React.CSSProperties}>
                <span className="zone-icon">{region.icon}</span>
              </div>
              <div className="zone-label">
                <span className="zone-name">{region.name}</span>
                <span className="zone-stars">
                  {Array.from({ length: Math.min(stars.total, 10) }).map((_, i) => (
                    <span key={i} className={`zone-star ${i < stars.completed ? 'filled' : ''}`}>
                      {'\u2605'}
                    </span>
                  ))}
                </span>
              </div>
              {status === 'locked' && <div className="zone-lock-icon">{'\uD83D\uDD12'}</div>}
              {status === 'available' && (
                <div className="zone-pulse" style={{ '--zone-color': region.color } as React.CSSProperties} />
              )}
            </button>
          );
        })}

        </div>{/* end map-scroll */}

        {/* Difficulty selector — fixed over map */}
        <div className="map-header">
          <div className="difficulty-tabs">
            {DIFFICULTIES.map(d => {
              const unlocked = isDifficultyUnlocked(d.key);
              return (
                <button
                  key={d.key}
                  className={`difficulty-tab ${difficulty === d.key ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                  style={{ '--diff-color': d.color } as React.CSSProperties}
                  onClick={() => handleDifficultyChange(d.key)}
                  disabled={!unlocked}
                >
                  {unlocked ? d.label : `${'\uD83D\uDD12'} ${d.label}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floor selection panel */}
      {selectedRegion && (
        <div className="floor-panel">
          <div className="floor-panel-header">
            <h3>{selectedRegion.icon} {selectedRegion.name}</h3>
            <button className="floor-panel-close" onClick={() => setSelectedRegionId(null)}>
              {'\u2715'}
            </button>
          </div>
          <div className="floor-panel-difficulty">
            <span className="difficulty-label">Difficulty</span>
            <span className="difficulty-value" style={{ color: DIFFICULTIES.find(d => d.key === difficulty)?.color }}>
              {DIFFICULTIES.find(d => d.key === difficulty)?.label}
            </span>
          </div>
          <div className="floor-panel-list" ref={floorListRef}>
            {selectedFloors.map(floor => {
              const currentFloor = regionProgress[selectedRegion.id] ?? 0;
              const isUnlocked = floor.floor <= currentFloor;
              const isCurrent = floor.floor === currentFloor;
              const isCompleted = floor.floor < currentFloor;

              return (
                <div
                  key={floor.floor}
                  className={`floor-entry ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="floor-entry-info">
                    <span className="floor-entry-number">
                      {floor.isBoss
                        ? `BOSS - ${selectedRegion.floorNames[9]}`
                        : `${floor.floor}. ${selectedRegion.floorNames[floor.floor - 1]}`}
                    </span>
                    <div className="floor-entry-enemies">
                      {floor.enemies.map((enemy, i) => (
                        <div key={i} className="floor-enemy-portrait" title={`${getMonsterName(enemy.templateId)} Lv.${enemy.level}`}>
                          <img src={assetUrl(`sprites/${enemy.templateId}.png`)} alt={getMonsterName(enemy.templateId)} />
                        </div>
                      ))}
                    </div>
                    {isUnlocked && (
                      <div className="floor-reward-preview">
                        {floor.rewardPreview.isFirstClear ? (
                          <span className="reward-tag first-clear">
                            {'\u2728'} +{floor.rewardPreview.pokeballs} <span className="pokeball-icon" />
                          </span>
                        ) : (
                          <span className="reward-tag replay">XP only</span>
                        )}
                        <span className="reward-tag loot-hint">
                          {'\u{1F340}'} Drop
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="floor-go-btn"
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && navigate(
                      `/battle/team-select?region=${selectedRegion.id}&floor=${floor.floor}&difficulty=${difficulty}`
                    )}
                  >
                    {!isUnlocked ? (
                      <span className="go-lock">{'\uD83D\uDD12'}</span>
                    ) : (
                      <>
                        <span className="go-energy">{'\u26A1'}3</span>
                        <span className="go-text">GO</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
