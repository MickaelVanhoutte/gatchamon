import { useState, useCallback, useRef, useEffect } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { StarRating } from '../icons';
import { assetUrl } from '../../utils/asset-url';
import { getSpriteBoost } from '../../utils/sprite-scale';
import './CityMonster.css';

/* Irregular positions along the street — intentionally uneven for organic feel */
const STREET_POSITIONS = [
  { xPct: 7,  yPct: 78 },
  { xPct: 24, yPct: 72 },
  { xPct: 38, yPct: 80 },
  { xPct: 55, yPct: 74 },
  { xPct: 75, yPct: 79 },
  { xPct: 92, yPct: 73 },
];

function spriteSize(heightM: number): number {
  const MIN_PX = 56;
  const MAX_PX = 120;
  const MIN_H = 0.3;
  const MAX_H = 5.0;
  const t = Math.min(1, Math.max(0, (heightM - MIN_H) / (MAX_H - MIN_H)));
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
}

interface CityMonsterProps {
  owned: OwnedPokemon;
  positionIndex: number;
}

export function CityMonster({ owned, positionIndex }: CityMonsterProps) {
  const [showLabel, setShowLabel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pos = STREET_POSITIONS[positionIndex] ?? STREET_POSITIONS[0];
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
      className="city-monster"
      style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
      onClick={handleTap}
    >
      <div className={`city-monster-label ${showLabel ? 'visible' : ''}`}>
        {owned.template.name} <span style={{ color: '#ffd700' }}><StarRating count={owned.instance.stars} size={10} /></span>
      </div>
      <div className={`city-monster-sprite-wrap roam-${positionIndex % 6}`}>
        <img
          src={assetUrl(owned.template.spriteUrl)}
          alt={owned.template.name}
          draggable={false}
          style={{ width: size, height: size }}
        />
      </div>
      <div className={`city-monster-shadow shadow-breathe-${positionIndex % 6}`} style={{ width: size * 0.6 }} />
    </div>
  );
}
