import { useState, useCallback, useRef, useEffect } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { StarRating } from '../icons';
import { assetUrl } from '../../utils/asset-url';
import { getSpriteBoost } from '../../utils/sprite-scale';
import './IslandMonster.css';

// Pixel positions within the 1200x800 meadow world
const MEADOW_POSITIONS = [
  { x: 350, y: 200 },
  { x: 800, y: 180 },
  { x: 200, y: 500 },
  { x: 950, y: 500 },
  { x: 450, y: 600 },
  { x: 700, y: 300 },
];

interface IslandMonsterProps {
  owned: OwnedPokemon;
  positionIndex: number;
}

// Map Pokedex height (meters) to sprite size (px).
// Clamp between 56px (tiny mons like Diancie 0.7m) and 120px (huge mons like Kyogre 4.5m).
function spriteSize(heightM: number): number {
  const MIN_PX = 56;
  const MAX_PX = 120;
  const MIN_H = 0.3;
  const MAX_H = 5.0;
  const t = Math.min(1, Math.max(0, (heightM - MIN_H) / (MAX_H - MIN_H)));
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
}

export function IslandMonster({ owned, positionIndex }: IslandMonsterProps) {
  const [showLabel, setShowLabel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pos = MEADOW_POSITIONS[positionIndex] ?? MEADOW_POSITIONS[0];
  const size = spriteSize(owned.template.height) * getSpriteBoost(owned.template.name);

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

  return (
    <div
      className="island-monster"
      style={{ left: pos.x, top: pos.y }}
      onClick={handleTap}
    >
      <div className={`island-monster-label ${showLabel ? 'visible' : ''}`}>
        {owned.template.name} <span style={{ color: '#ffd700' }}><StarRating count={owned.instance.stars} size={10} /></span>
      </div>
      <div className={`island-monster-sprite-wrap roam-${positionIndex % 6}`}>
        <img
          src={assetUrl(owned.template.spriteUrl)}
          alt={owned.template.name}
          draggable={false}
          style={{ width: size, height: size }}
        />
      </div>
      <div className="island-monster-shadow" style={{ width: size * 0.6 }} />
    </div>
  );
}
