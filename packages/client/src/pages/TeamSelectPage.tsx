import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { MonsterCard } from '../components/monster/MonsterCard';
import { REGIONS } from '@gatchamon/shared';
import type { Difficulty } from '@gatchamon/shared';
import { startBattle } from '../services/battle.service';
import './TeamSelectPage.css';

export function TeamSelectPage() {
  const { player, collection, loadCollection } = useGameStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const region = Number(searchParams.get('region') ?? 1);
  const floor = Number(searchParams.get('floor') ?? 1);
  const difficulty = (searchParams.get('difficulty') as Difficulty) ?? 'normal';
  const regionDef = REGIONS.find(r => r.id === region);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const toggleSelect = (instanceId: string) => {
    setSelected(prev => {
      if (prev.includes(instanceId)) {
        return prev.filter(id => id !== instanceId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, instanceId];
    });
  };

  const handleStart = () => {
    if (!player || selected.length === 0) return;
    setIsStarting(true);
    try {
      const result = startBattle(selected, { region, floor, difficulty });
      navigate(`/battle/${result.state.battleId}`);
    } catch (err: any) {
      alert(err.message);
      setIsStarting(false);
    }
  };

  const sorted = [...collection].sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);
  const regionName = regionDef?.name ?? `Region ${region}`;
  const floorName = regionDef?.floorNames[(floor - 1)] ?? `Floor ${floor}`;
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <div className="page team-select-page">
      <h2>Select Team</h2>
      <p className="team-info">
        {regionName} - {floor === 10 ? 'BOSS' : floorName} ({diffLabel}) — Pick up to 4 monsters ({selected.length}/4)
      </p>

      <div className="team-grid">
        {sorted.map(mon => (
          <MonsterCard
            key={mon.instance.instanceId}
            owned={mon}
            selected={selected.includes(mon.instance.instanceId)}
            onClick={() => toggleSelect(mon.instance.instanceId)}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <div className="team-dock">
          <div className="dock-previews">
            {selected.map(id => {
              const mon = collection.find(m => m.instance.instanceId === id)!;
              return (
                <img
                  key={id}
                  src={mon.template.spriteUrl}
                  alt={mon.template.name}
                  width={40}
                  height={40}
                  className="dock-sprite"
                />
              );
            })}
          </div>
          <button
            className="start-battle-btn"
            onClick={handleStart}
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Battle!'}
          </button>
        </div>
      )}
    </div>
  );
}
