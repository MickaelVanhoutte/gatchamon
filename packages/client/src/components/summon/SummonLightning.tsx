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
  3: 14,
  4: 18,
  5: 22,
};

const SPARK_COUNTS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 24,
  4: 32,
  5: 40,
};

const STAR_THEMES: Record<number, { color: string; glow: string; className: string }> = {
  1: { color: '#aaa', glow: 'rgba(170,170,170,0.3)', className: 'tier-low' },
  2: { color: '#aaa', glow: 'rgba(170,170,170,0.3)', className: 'tier-low' },
  3: { color: '#ffd700', glow: 'rgba(255,215,0,0.5)', className: 'tier-gold' },
  4: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)', className: 'tier-purple' },
  5: { color: '#ffd700', glow: 'rgba(255,215,0,0.6)', className: 'tier-legendary' },
};

const CRACK_OPACITY: Record<number, number> = {
  3: 0.4,
  4: 0.7,
  5: 1.0,
};

const ENERGY_PARTICLE_COUNT = 16;
const PRISMATIC_RAY_COUNT = 8;

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
      length: 60 + Math.random() * 80,
      width: 2 + Math.random() * 2,
      delay: Math.random() * 0.15,
    }))
  ).current;

  // Generate sparks
  const sparks = useRef(
    Array.from({ length: sparkCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      distance: 60 + Math.random() * 140,
      size: 2 + Math.random() * 5,
      delay: Math.random() * 0.3,
    }))
  ).current;

  // Energy particles that converge to center (3+ stars)
  const energyParticles = useRef(
    Array.from({ length: ENERGY_PARTICLE_COUNT }, (_, i) => ({
      id: i,
      angle: (360 / ENERGY_PARTICLE_COUNT) * i + Math.random() * 20,
      startDistance: 200 + Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.4,
    }))
  ).current;

  // Prismatic rays for shiny
  const prismaticRays = useRef(
    Array.from({ length: PRISMATIC_RAY_COUNT }, (_, i) => ({
      id: i,
      angle: (360 / PRISMATIC_RAY_COUNT) * i,
      length: 80 + Math.random() * 40,
      width: 3 + Math.random() * 2,
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

    // ============================================
    // 3+ stars: Multi-phase dramatic lightning
    // ============================================

    // --- PHASE 1: Tension Build-Up (0s to ~1.8s) ---

    // Screen darkens slowly
    const darken = containerRef.current.querySelector('.lightning-darken');
    if (darken) {
      tl.fromTo(darken, { opacity: 0 }, { opacity: 0.8, duration: 1.2, ease: 'power2.in' }, 0);
    }

    // Subtle rumble shake - starts quiet, builds intensity
    tl.to(containerRef.current, { x: 1, duration: 0.03, yoyo: true, repeat: 10, ease: 'none' }, 0.3);
    tl.to(containerRef.current, { x: 3, duration: 0.03, yoyo: true, repeat: 15, ease: 'none' }, 0.8);
    tl.to(containerRef.current, { x: 5, duration: 0.03, yoyo: true, repeat: 10, ease: 'none' }, 1.3);

    // Energy particles converge from edges to center
    const energyEls = containerRef.current.querySelectorAll('.lightning-energy-particle');
    energyEls.forEach((el, i) => {
      const p = energyParticles[i];
      const rad = (p.angle * Math.PI) / 180;
      const startX = Math.cos(rad) * p.startDistance;
      const startY = Math.sin(rad) * p.startDistance;
      tl.fromTo(el,
        { x: startX, y: startY, opacity: 0.9, scale: 1 },
        { x: 0, y: 0, opacity: 0, scale: 0.2, duration: 1.3, ease: 'power2.in' },
        0.2 + p.delay
      );
    });

    // Golden shimmer ring pulses during tension
    const shimmerRing = containerRef.current.querySelector('.lightning-shimmer-ring');
    if (shimmerRing) {
      tl.fromTo(shimmerRing,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 0.7, duration: 0.6, ease: 'power2.out' },
        0.5
      );
      tl.to(shimmerRing,
        { scale: 1.3, opacity: 0.4, duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' },
        1.1
      );
    }

    // Orb flickers with increasing intensity
    const orbFlash = containerRef.current.querySelector('.lightning-orb-flash');
    if (orbFlash) {
      tl.fromTo(orbFlash,
        { scale: 0.3, opacity: 0 },
        { scale: 0.8, opacity: 0.5, duration: 0.1, yoyo: true, repeat: 3, ease: 'power1.inOut' },
        0.9
      );
      tl.fromTo(orbFlash,
        { scale: 0.5, opacity: 0 },
        { scale: 1.2, opacity: 0.9, duration: 0.08, yoyo: true, repeat: 5, ease: 'power1.inOut' },
        1.4
      );
    }

    // --- PHASE 2: First Lightning Strike (~1.8s) ---

    const strikeTime1 = 1.8;

    // First strike: screen flash + strong shake + first wave of bolts
    const flash = containerRef.current.querySelector('.lightning-flash');
    if (flash) {
      tl.fromTo(flash, { opacity: 0 }, { opacity: 0.9, duration: 0.06, yoyo: true, repeat: 1 }, strikeTime1);
    }
    tl.to(containerRef.current, { x: 8, duration: 0.04, yoyo: true, repeat: 5, ease: 'none' }, strikeTime1);

    // First wave: first third of bolts
    const boltEls = containerRef.current.querySelectorAll('.lightning-bolt');
    const firstWaveCount = Math.ceil(boltCount / 3);
    boltEls.forEach((el, i) => {
      if (i >= firstWaveCount) return;
      const bolt = bolts[i];
      tl.fromTo(el,
        { scaleY: 0, opacity: 1 },
        { scaleY: 1, opacity: 0, duration: 0.5, ease: 'power2.out' },
        strikeTime1 + 0.05 + bolt.delay
      );
    });

    // First wave of sparks scatter
    const sparkEls = containerRef.current.querySelectorAll('.lightning-spark');
    const firstSparkWave = Math.ceil(sparkCount / 3);
    sparkEls.forEach((el, i) => {
      if (i >= firstSparkWave) return;
      const spark = sparks[i];
      const rad = (spark.angle * Math.PI) / 180;
      const endX = Math.cos(rad) * spark.distance * 0.6;
      const endY = Math.sin(rad) * spark.distance * 0.6;
      tl.fromTo(el,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: endX, y: endY, opacity: 0, scale: 0.3, duration: 0.4, ease: 'power2.out' },
        strikeTime1 + 0.05 + spark.delay * 0.5
      );
    });

    // --- Brief dramatic pause (dark holds ~0.5s) ---

    // --- PHASE 3: Second Lightning Strike (~2.5s) ---
    const strikeTime2 = 2.5;

    // Second strike: bigger flash + stronger shake
    if (flash) {
      tl.fromTo(flash, { opacity: 0 }, { opacity: 1, duration: 0.06, yoyo: true, repeat: 2 }, strikeTime2);
    }
    tl.to(containerRef.current, { x: 12, duration: 0.04, yoyo: true, repeat: 8, ease: 'none' }, strikeTime2);

    // Second wave: remaining bolts
    const secondWaveCount = Math.ceil(boltCount * 2 / 3);
    boltEls.forEach((el, i) => {
      if (i < firstWaveCount) return;
      const bolt = bolts[i];
      tl.fromTo(el,
        { scaleY: 0, opacity: 1 },
        { scaleY: 1, opacity: 0, duration: 0.5, ease: 'power2.out' },
        strikeTime2 + 0.03 + bolt.delay
      );
    });

    // Second wave of sparks - bigger, more dramatic
    sparkEls.forEach((el, i) => {
      if (i < firstSparkWave) return;
      const spark = sparks[i];
      const rad = (spark.angle * Math.PI) / 180;
      const endX = Math.cos(rad) * spark.distance;
      const endY = Math.sin(rad) * spark.distance;
      tl.fromTo(el,
        { x: 0, y: 0, opacity: 1, scale: 1.2 },
        { x: endX, y: endY, opacity: 0, scale: 0.2, duration: 0.6 + spark.delay * 0.3, ease: 'power2.out' },
        strikeTime2 + 0.03 + spark.delay
      );
    });

    // Crack overlay for all 3+ stars (varying opacity)
    const crackOpacity = CRACK_OPACITY[stars] ?? 0;
    if (crackOpacity > 0) {
      const crack = containerRef.current.querySelector('.lightning-crack');
      if (crack) {
        tl.fromTo(crack, { opacity: 0 }, { opacity: crackOpacity, duration: 0.12 }, strikeTime2);
        tl.to(crack, { opacity: 0, duration: 0.6 }, strikeTime2 + 0.6);
      }
    }

    // Shimmer ring explodes outward on second strike
    if (shimmerRing) {
      tl.to(shimmerRing,
        { scale: 3, opacity: 0, duration: 0.4, ease: 'power2.out' },
        strikeTime2
      );
    }

    // 4+ star: extra third strike
    if (stars >= 4) {
      const strikeTime3 = 3.0;
      if (flash) {
        tl.fromTo(flash, { opacity: 0 }, { opacity: 1, duration: 0.06, yoyo: true, repeat: 2 }, strikeTime3);
      }
      tl.to(containerRef.current, { x: 14, duration: 0.04, yoyo: true, repeat: 11, ease: 'none' }, strikeTime3);
    }

    // --- PHASE 4: Transition to Reveal ---

    const transitionTime = stars >= 4 ? 3.3 : 3.0;

    // Orb flash expands massively
    if (orbFlash) {
      tl.fromTo(orbFlash,
        { scale: 0.5, opacity: 1 },
        { scale: 6, opacity: 0, duration: 0.5, ease: 'power2.out' },
        transitionTime
      );
    }

    // White flash out
    if (flash) {
      tl.fromTo(flash, { opacity: 0 }, { opacity: 0.9, duration: 0.1 }, transitionTime + 0.05);
      tl.to(flash, { opacity: 0, duration: 0.35 }, transitionTime + 0.15);
    }

    // Darken fades out
    if (darken) {
      tl.to(darken, { opacity: 0, duration: 0.3 }, transitionTime + 0.1);
    }

    // --- SHINY BONUS (+1.0s extra) ---
    if (isShiny) {
      const shinyTime = transitionTime + 0.5;

      // Prismatic burst - much bigger
      const shimmer = containerRef.current.querySelector('.lightning-shiny-burst');
      if (shimmer) {
        tl.fromTo(shimmer,
          { scale: 0.3, opacity: 0 },
          { scale: 4, opacity: 1, duration: 0.4, ease: 'power2.out' },
          shinyTime
        );
        tl.to(shimmer, { opacity: 0, scale: 6, duration: 0.5 }, shinyTime + 0.4);
      }

      // Prismatic rays radiate outward
      const rayEls = containerRef.current.querySelectorAll('.lightning-prismatic-ray');
      rayEls.forEach((el, i) => {
        tl.fromTo(el,
          { scaleY: 0, opacity: 1 },
          { scaleY: 1, opacity: 0, duration: 0.7, ease: 'power2.out' },
          shinyTime + 0.1 + i * 0.04
        );
      });

      // Rainbow color wash
      const wash = containerRef.current.querySelector('.lightning-shiny-wash');
      if (wash) {
        tl.fromTo(wash, { opacity: 0 }, { opacity: 0.5, duration: 0.25 }, shinyTime);
        tl.to(wash, { opacity: 0, duration: 0.5 }, shinyTime + 0.5);
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
      <div className="lightning-darken" />

      {/* Low-tier soft pop */}
      {stars <= 2 && <div className="lightning-orb-pop" />}

      {/* 3+ star: orb flash */}
      {stars >= 3 && <div className="lightning-orb-flash" />}

      {/* Golden shimmer ring */}
      {stars >= 3 && <div className="lightning-shimmer-ring" />}

      {/* Energy particles converging to center */}
      {stars >= 3 && (
        <div className="lightning-energy-particles">
          {energyParticles.map((p) => (
            <div
              key={p.id}
              className="lightning-energy-particle"
              style={{ width: p.size, height: p.size }}
            />
          ))}
        </div>
      )}

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

      {/* Screen crack for 3+ stars */}
      {stars >= 3 && <div className="lightning-crack" />}

      {/* Shiny prismatic burst */}
      {isShiny && <div className="lightning-shiny-burst" />}

      {/* Shiny prismatic rays */}
      {isShiny && (
        <div className="lightning-prismatic-rays">
          {prismaticRays.map((ray) => (
            <div
              key={ray.id}
              className="lightning-prismatic-ray"
              style={{
                transform: `rotate(${ray.angle}deg)`,
                height: ray.length,
                width: ray.width,
              }}
            />
          ))}
        </div>
      )}

      {/* Shiny rainbow wash */}
      {isShiny && <div className="lightning-shiny-wash" />}
    </div>
  );
}
