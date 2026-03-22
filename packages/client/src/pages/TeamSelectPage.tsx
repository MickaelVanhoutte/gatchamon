import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { MonsterCard } from '../components/monster/MonsterCard';
import { api } from '../api/client';
import type { BattleResult } from '@gatchamon/shared';
import './TeamSelectPage.css';

export function TeamSelectPage() {
  const { player, collection, loadCollection } = useGameStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const level = Number(searchParams.get('level') ?? 1);
  const floor = Number(searchParams.get('floor') ?? 1);

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

  const handleStart = async () => {
    if (!player || selected.length === 0) return;
    setIsStarting(true);
    try {
      const result = await api.post<BattleResult>('/battle/start', {
        playerId: player.id,
        teamInstanceIds: selected,
        floor: { level, floor },
      });
      navigate(`/battle/${result.state.battleId}`);
    } catch (err: any) {
      alert(err.message);
      setIsStarting(false);
    }
  };

  const sorted = [...collection].sort((a, b) => b.instance.stars - a.instance.stars || b.instance.level - a.instance.level);

  return (
    <div className="page team-select-page">
      <h2>Select Team</h2>
      <p className="team-info">Floor {floor} — Pick up to 4 monsters ({selected.length}/4)</p>

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
