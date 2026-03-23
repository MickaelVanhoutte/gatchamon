import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './SummonLightning.css';

interface Props {
  stars: number;
  isShiny: boolean;
  onComplete: () => void;
}

const BOLT_COUNTS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 10,
  4: 14,
  5: 18,
};

const SPARK_COUNTS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 16,
  4: 24,
  5: 32,
};

const STAR_THEMES: Record<number, { color: string; glow: string; className: string }> = {
  1: { color: '#aaa', glow: 'rgba(170,170,170,0.3)', className: 'tier-low' },
  2: { color: '#aaa', glow: 'rgba(170,170,170,0.3)', className: 'tier-low' },
  3: { color: '#ffd700', glow: 'rgba(255,215,0,0.5)', className: 'tier-gold' },
  4: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)', className: 'tier-purple' },
  5: { color: '#ffd700', glow: 'rgba(255,215,0,0.6)', className: 'tier-legendary' },
};

export function SummonLightning({ stars, isShiny, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const theme = STAR_THEMES[stars] ?? STAR_THEMES[1];
  const boltCount = BOLT_COUNTS[stars] ?? 0;
  const sparkCount = SPARK_COUNTS[stars] ?? 0;

  // Generate bolts radiating outward
  const bolts = useRef(
    Array.from({ length: boltCount }, (_, i) => ({
      id: i,
      angle: (360 / boltCount) * i + (Math.random() - 0.5) * 20,
      length: 50 + Math.random() * 60,
      width: 2 + Math.random() * 2,
      delay: Math.random() * 0.15,
    }))
  ).current;

  // Generate sparks
  const sparks = useRef(
    Array.from({ length: sparkCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      distance: 60 + Math.random() * 120,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.3,
    }))
  ).current;

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ onComplete });
    tlRef.current = tl;

    if (stars <= 2) {
      // Low tier: soft pop, no lightning
      const orbPop = containerRef.current.querySelector('.lightning-orb-pop');
      if (orbPop) {
        tl.fromTo(
          orbPop,
          { scale: 0.5, opacity: 0.8 },
          { scale: 2.5, opacity: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
      return;
    }

    // 3+ stars: the lightning moment!

    // Screen flash
    const flash = containerRef.current.querySelector('.lightning-flash');
    if (flash) {
      tl.fromTo(
        flash,
        { opacity: 0 },
        { opacity: 0.9, duration: 0.08, yoyo: true, repeat: 1 },
        0
      );
    }

    // Bolts burst outward
    const boltEls = containerRef.current.querySelectorAll('.lightning-bolt');
    boltEls.forEach((el, i) => {
      const bolt = bolts[i];
      tl.fromTo(
        el,
        { scaleY: 0, opacity: 1 },
        {
          scaleY: 1,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        0.05 + bolt.delay
      );
    });

    // Sparks scatter outward
    const sparkEls = containerRef.current.querySelectorAll('.lightning-spark');
    sparkEls.forEach((el, i) => {
      const spark = sparks[i];
      const rad = (spark.angle * Math.PI) / 180;
      const endX = Math.cos(rad) * spark.distance;
      const endY = Math.sin(rad) * spark.distance;

      tl.fromTo(
        el,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: endX,
          y: endY,
          opacity: 0,
          scale: 0.3,
          duration: 0.5 + spark.delay * 0.3,
          ease: 'power2.out',
        },
        0.05 + spark.delay
      );
    });

    // Central orb flash
    const orbFlash = containerRef.current.querySelector('.lightning-orb-flash');
    if (orbFlash) {
      tl.fromTo(
        orbFlash,
        { scale: 0.3, opacity: 1 },
        { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.out' },
        0
      );
    }

    // 4+ star: screen shake
    if (stars >= 4) {
      tl.to(
        containerRef.current,
        { x: 6, duration: 0.04, yoyo: true, repeat: 7, ease: 'none' },
        0.1
      );
    }

    // 5 star: screen crack overlay
    if (stars >= 5) {
      const crack = containerRef.current.querySelector('.lightning-crack');
      if (crack) {
        tl.fromTo(
          crack,
          { opacity: 0 },
          { opacity: 1, duration: 0.15 },
          0.1
        );
        tl.to(crack, { opacity: 0, duration: 0.5 }, 0.6);
      }
    }

    // Shiny bonus effect
    if (isShiny) {
      const shimmer = containerRef.current.querySelector('.lightning-shiny-burst');
      if (shimmer) {
        tl.fromTo(
          shimmer,
          { scale: 0.5, opacity: 0 },
          { scale: 2.5, opacity: 1, duration: 0.3, ease: 'power2.out' },
          tl.duration() - 0.1
        );
        tl.to(shimmer, { opacity: 0, scale: 3, duration: 0.3 });
      }
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      className={`lightning-container ${theme.className}`}
      ref={containerRef}
      style={{ '--lightning-color': theme.color, '--lightning-glow': theme.glow } as React.CSSProperties}
    >
      <div className="lightning-flash" />

      {/* Low-tier soft pop */}
      {stars <= 2 && <div className="lightning-orb-pop" />}

      {/* 3+ star: orb flash */}
      {stars >= 3 && <div className="lightning-orb-flash" />}

      {/* Lightning bolts */}
      {stars >= 3 && (
        <div className="lightning-bolts">
          {bolts.map((bolt) => (
            <div
              key={bolt.id}
              className="lightning-bolt"
              style={{
                transform: `rotate(${bolt.angle}deg)`,
                height: bolt.length,
                width: bolt.width,
              }}
            />
          ))}
        </div>
      )}

      {/* Spark particles */}
      {stars >= 3 && (
        <div className="lightning-sparks">
          {sparks.map((spark) => (
            <div
              key={spark.id}
              className="lightning-spark"
              style={{
                width: spark.size,
                height: spark.size,
              }}
            />
          ))}
        </div>
      )}

      {/* 5-star screen crack */}
      {stars >= 5 && <div className="lightning-crack" />}

      {/* Shiny prismatic burst */}
      {isShiny && <div className="lightning-shiny-burst" />}
    </div>
  );
}
