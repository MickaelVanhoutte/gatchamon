import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { POKEDEX } from '@gatchamon/shared';
import { api } from '../api/client';
import './StoryModePage.css';

interface FloorInfo {
  level: number;
  floor: number;
  enemyCount: number;
  isBoss: boolean;
}

export function StoryModePage() {
  const { player } = useGameStore();
  const navigate = useNavigate();
  const [floors, setFloors] = useState<FloorInfo[]>([]);

  useEffect(() => {
    api.get<{ floors: FloorInfo[] }>('/battle/floors/list').then(data => {
      setFloors(data.floors);
    });
  }, []);

  if (!player) return null;

  const currentFloor = player.storyProgress.floor;

  return (
    <div className="page story-page">
      <h2>Story Mode</h2>
      <p className="story-subtitle">Level 1 - Normal</p>

      <div className="floor-list">
        {floors.map(floor => {
          const isUnlocked = floor.floor <= currentFloor;
          const isCurrent = floor.floor === currentFloor;

          return (
            <button
              key={floor.floor}
              className={`floor-card ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => isUnlocked && navigate(`/battle/team-select?level=1&floor=${floor.floor}`)}
              disabled={!isUnlocked}
            >
              <div className="floor-number">
                {floor.isBoss ? 'BOSS' : `F${floor.floor}`}
              </div>
              <div className="floor-info">
                <span className="floor-enemies">
                  {floor.isBoss ? '1 Boss' : `${floor.enemyCount} enemies`}
                </span>
                {!isUnlocked && <span className="floor-lock">Locked</span>}
                {isCurrent && <span className="floor-current">Current</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
