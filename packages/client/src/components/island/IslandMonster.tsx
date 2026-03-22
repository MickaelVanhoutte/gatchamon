import { useState, useCallback, useRef, useEffect } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import './IslandMonster.css';

const ISLAND_POSITIONS = [
  { x: 22, y: 38 },
  { x: 75, y: 42 },
  { x: 18, y: 60 },
  { x: 80, y: 62 },
  { x: 38, y: 78 },
  { x: 62, y: 50 },
];

interface IslandMonsterProps {
  owned: OwnedPokemon;
  positionIndex: number;
}

export function IslandMonster({ owned, positionIndex }: IslandMonsterProps) {
  const [showLabel, setShowLabel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const pos = ISLAND_POSITIONS[positionIndex] ?? ISLAND_POSITIONS[0];

  const handleTap = useCallback(() => {
    setShowLabel(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowLabel(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const stars = '★'.repeat(owned.instance.stars);

  return (
    <div
      className="island-monster"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onClick={handleTap}
    >
      <div className={`island-monster-label ${showLabel ? 'visible' : ''}`}>
        {owned.template.name} <span style={{ color: '#ffd700' }}>{stars}</span>
      </div>
      <div className={`island-monster-sprite-wrap roam-${positionIndex % 6}`}>
        <img
          src={owned.template.spriteUrl}
          alt={owned.template.name}
          draggable={false}
        />
      </div>
      <div className="island-monster-shadow" />
    </div>
  );
}
