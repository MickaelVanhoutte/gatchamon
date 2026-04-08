import { useRef, useEffect, useState, useCallback } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import type { ForagingFind } from '../../services/foraging.service';
import { useGameStore } from '../../stores/gameStore';
import { useRotatedHorizontalScroll } from '../../hooks/useRotatedHorizontalScroll';
import { CityBuilding } from './CityBuilding';
import { CityMonster } from './CityMonster';
import { assetUrl } from '../../utils/asset-url';
import './CityScene.css';

/*
 * Building positions as % of image width, mapped to the actual buildings in poke-street.png:
 *  - Far-left Japanese building    → Summon Lab
 *  - Red pagoda building           → PC Center
 *  - White columned "Mart" bldg    → PokéMart
 *  - Center alley (leads outside)  → Route Gate (Story)
 *  - Green awning "Sweet & Slowpoke" → Mission Board
 *  - Brown "Glameow's Closet" bldg → Arena
 *  - Gym building                  → Dungeon Cave
 *  - Far-right windmill bldg       → Trainer HQ
 */
const BUILDINGS = [
  { id: 'summon',     label: 'Summon Lab',    icon: 'summon',     path: '/summon',     xPct: 8,  yPct: 48 },
  { id: 'collection', label: 'PC Center',     icon: 'collection', path: '/collection', xPct: 23, yPct: 42 },
  { id: 'shop',       label: 'PokéMart',      icon: 'shop',       path: '/shop',       xPct: 38, yPct: 38 },
  { id: 'story',      label: 'Route Gate',    icon: 'book',       path: '/story',      xPct: 50, yPct: 55 },
  { id: 'missions',   label: 'Mission Board', icon: 'trophy',     path: '/missions',   xPct: 60, yPct: 42 },
  { id: 'arena',      label: 'Arena',         icon: 'swords',     path: '/arena',      xPct: 70, yPct: 48 },
  { id: 'dungeons',   label: 'Dungeon Cave',  icon: 'dungeon',    path: '/dungeons',   xPct: 80, yPct: 40 },
  { id: 'trainer',    label: 'Trainer HQ',    icon: 'trainer',    path: '/trainer',     xPct: 91, yPct: 45 },
] as const;

interface CitySceneProps {
  monsters: OwnedPokemon[];
  onNavigate: (path: string, options?: { state?: unknown }) => void;
  pendingFinds?: Record<string, ForagingFind>;
  onClaimFind?: (pokemonId: string) => ForagingFind | null | Promise<ForagingFind | null>;
}

export function CityScene({ monsters, onNavigate, pendingFinds, onClaimFind }: CitySceneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollInnerRef = useRef<HTMLDivElement>(null);
  const unclaimedRewardCount = useGameStore(s => s.unclaimedRewardCount);
  const [zoomTarget, setZoomTarget] = useState<{ xPct: number; buildingId: string } | null>(null);
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
    if (zoomTarget) return; // prevent double-click

    const building = BUILDINGS.find(b => b.path === path);
    const scene = scrollRef.current;
    const inner = scrollInnerRef.current;
    if (!building || !scene || !inner) { onNavigate(path); return; }

    // Scroll to center the target building
    const targetCenter = inner.scrollWidth * (building.xPct / 100);
    const viewCenter = scene.clientWidth / 2;
    scene.scrollTo({ left: targetCenter - viewCenter, behavior: 'smooth' });

    // Start zoom after scroll settles
    setTimeout(() => setZoomTarget({ xPct: building.xPct, buildingId: building.id }), 200);

    // Navigate after zoom + fade completes
    setTimeout(() => {
      onNavigate(path, { state: { fromCity: true, buildingId: building.id } });
      setZoomTarget(null);
    }, 1200);
  }, [onNavigate, zoomTarget]);

  return (
    <div className="city-scene" ref={scrollRef} data-horizontal-scroll>
      <div
        className={`city-scroll ${zoomTarget ? 'city-zooming' : ''}`}
        ref={scrollInnerRef}
        style={zoomTarget ? { transformOrigin: `${zoomTarget.xPct}% 35%` } as React.CSSProperties : undefined}
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
            <CityMonster
              key={m.instance.instanceId}
              owned={m}
              positionIndex={i}
              pendingFind={pendingFinds?.[m.instance.instanceId] ?? null}
              onClaimFind={onClaimFind ? () => onClaimFind(m.instance.instanceId) : undefined}
            />
          ))}
        </div>

        {/* Atmospheric overlays */}
        <div className="city-vignette" />
        <div className="city-light-rays" />
        <div className="city-particles">
          {[
            { left: 8,  bottom: 5,  path: 'a', dur: 4.2, delay: 0 },
            { left: 22, bottom: 20, path: 'b', dur: 5.0, delay: 1.2 },
            { left: 35, bottom: 12, path: 'c', dur: 4.6, delay: 0.5 },
            { left: 48, bottom: 8,  path: 'd', dur: 5.4, delay: 2.0 },
            { left: 58, bottom: 25, path: 'a', dur: 5.8, delay: 3.1 },
            { left: 67, bottom: 15, path: 'c', dur: 4.0, delay: 0.8 },
            { left: 75, bottom: 3,  path: 'b', dur: 4.8, delay: 1.8 },
            { left: 84, bottom: 18, path: 'd', dur: 5.2, delay: 2.6 },
            { left: 15, bottom: 10, path: 'c', dur: 4.4, delay: 3.5 },
            { left: 91, bottom: 22, path: 'a', dur: 5.6, delay: 0.3 },
          ].map((f, i) => (
            <div
              key={`ff-${i}`}
              className={`city-firefly city-firefly-${f.path}`}
              style={{
                left: `${f.left}%`,
                bottom: `${f.bottom}%`,
                animationDuration: `${f.dur}s`,
                animationDelay: `${f.delay}s`,
              }}
            />
          ))}
          {[10, 22, 14, 28, 12, 24, 16, 20].map((size, i) => (
            <div
              key={`lf-${i}`}
              className={`city-leaf city-leaf-${(i % 3) + 1}`}
              style={{
                left: `${4 + ((i * 31 + 9) % 90)}%`,
                animationDuration: `${5 + (i % 4) * 1.5}s`,
                animationDelay: `${(i * 1.1) % 6}s`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Black fade overlay for building transition */}
      <div className={`city-fade-overlay ${zoomTarget ? 'active' : ''}`} />
    </div>
  );
}
