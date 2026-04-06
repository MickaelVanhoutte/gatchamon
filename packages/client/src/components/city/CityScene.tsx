import { useRef, useEffect, useState, useCallback } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { useGameStore } from '../../stores/gameStore';
import { useRotatedHorizontalScroll } from '../../hooks/useRotatedHorizontalScroll';
import { CityBuilding } from './CityBuilding';
import { CityMonster } from './CityMonster';
import { assetUrl } from '../../utils/asset-url';
import './CityScene.css';

/*
 * Building positions as % of image width, mapped to the actual buildings in poke-street.png:
 *  - Far-left Japanese building  → Summon Lab
 *  - Red pagoda building         → PC Center
 *  - White columned "Mart" bldg  → PokéMart
 *  - Center alley (leads outside)→ Route Gate (Story)
 *  - Green awning "Glameow's"    → Mission Board
 *  - Gym building                → Dungeon Cave
 *  - Far-right windmill bldg     → Trainer HQ
 */
const BUILDINGS = [
  { id: 'summon',     label: 'Summon Lab',    icon: 'summon',     path: '/summon',     xPct: 8   },
  { id: 'collection', label: 'PC Center',     icon: 'collection', path: '/collection', xPct: 23  },
  { id: 'shop',       label: 'PokéMart',      icon: 'shop',       path: '/shop',       xPct: 38  },
  { id: 'story',      label: 'Route Gate',    icon: 'swords',     path: '/story',      xPct: 50  },
  { id: 'missions',   label: 'Mission Board', icon: 'trophy',     path: '/missions',   xPct: 62  },
  { id: 'dungeons',   label: 'Dungeon Cave',  icon: 'dungeon',    path: '/dungeons',   xPct: 80  },
  { id: 'trainer',    label: 'Trainer HQ',    icon: 'trainer',    path: '/trainer',     xPct: 91  },
] as const;

interface CitySceneProps {
  monsters: OwnedPokemon[];
  onNavigate: (path: string, options?: { state?: unknown }) => void;
}

export function CityScene({ monsters, onNavigate }: CitySceneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollInnerRef = useRef<HTMLDivElement>(null);
  const unclaimedRewardCount = useGameStore(s => s.unclaimedRewardCount);
  const [zooming, setZooming] = useState(false);
  useRotatedHorizontalScroll(scrollRef);

  /* Auto-scroll to center on mount */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    if (path === '/story') {
      // Zoom into the center alley, then fade to black, then navigate
      const scene = scrollRef.current;
      const inner = scrollInnerRef.current;
      if (!scene || !inner) { onNavigate(path); return; }

      // First, scroll to center the alley
      const alleyCenter = inner.scrollWidth * 0.50;
      const viewCenter = scene.clientWidth / 2;
      scene.scrollTo({ left: alleyCenter - viewCenter, behavior: 'smooth' });

      // Start zoom after scroll settles
      setTimeout(() => setZooming(true), 200);

      // Navigate after zoom + fade completes — pass state so story page fades in from black
      setTimeout(() => onNavigate(path, { state: { fromCity: true } }), 1200);
      return;
    }
    onNavigate(path);
  }, [onNavigate]);

  return (
    <div className="city-scene" ref={scrollRef} data-horizontal-scroll>
      <div
        className={`city-scroll ${zooming ? 'city-zoom-story' : ''}`}
        ref={scrollInnerRef}
      >

        {/* Background image — drives scroll width via aspect-ratio */}
        <img
          className="city-bg-img"
          src={assetUrl('backgrounds/poke-street.png')}
          alt=""
          draggable={false}
        />

        {/* Building overlay buttons */}
        {BUILDINGS.map(b => (
          <CityBuilding
            key={b.id}
            building={b}
            badgeCount={b.id === 'missions' ? unclaimedRewardCount : 0}
            onNavigate={handleNavigate}
          />
        ))}

        {/* Monster layer */}
        <div className="city-monsters">
          {monsters.map((m, i) => (
            <CityMonster key={m.instance.instanceId} owned={m} positionIndex={i} />
          ))}
        </div>

        {/* Atmospheric overlays */}
        <div className="city-vignette" />
        <div className="city-light-rays" />
      </div>

      {/* Black fade overlay for story transition */}
      <div className={`city-fade-overlay ${zooming ? 'active' : ''}`} />
    </div>
  );
}
