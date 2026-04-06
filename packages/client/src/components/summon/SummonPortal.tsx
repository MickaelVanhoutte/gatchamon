import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import './SummonPortal.css';

import type { PokeballType } from '@gatchamon/shared';

interface Props {
  resultsReady: boolean;
  onComplete: () => void;
  pokeballType?: PokeballType;
}

const PARTICLE_COUNT = 24;
const WISP_COUNT = 7;
const MIN_DURATION = 1.8;

export function SummonPortal({ resultsReady, onComplete, pokeballType = 'regular' }: Props) {
  const variantClass = pokeballType !== 'regular' ? pokeballType : '';
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const animDoneRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      angle: (360 / PARTICLE_COUNT) * i + Math.random() * 15,
      radius: 120 + Math.random() * 80,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.8,
      hue: 200 + Math.random() * 60,
    }))
  ).current;

  const wisps = useRef(
    Array.from({ length: WISP_COUNT }, (_, i) => ({
      id: i,
      orbitRadius: 55 + Math.random() * 25, // 55-80px from center
      orbitSpeed: 1.5 + Math.random() * 1.5, // 1.5-3s per revolution
      startAngle: (360 / WISP_COUNT) * i + Math.random() * 20,
      size: 4 + Math.random() * 4,
      hue: 200 + Math.random() * 60,
    }))
  ).current;

  const doComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  // Check completion whenever resultsReady changes
  useEffect(() => {
    if (resultsReady && animDoneRef.current) {
      doComplete();
    }
  }, [resultsReady, doComplete]);

  useEffect(() => {
    if (!orbRef.current || !containerRef.current) return;

    // Reset refs in case of strict mode re-mount
    animDoneRef.current = false;
    completedRef.current = false;

    const tl = gsap.timeline();

    // Backdrop fade in
    tl.fromTo(
      containerRef.current.querySelector('.portal-backdrop'),
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    // Pokeball appears and starts rotating
    tl.fromTo(orbRef.current,
      { scale: 0.3, opacity: 0, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 360, duration: 1.0, ease: 'power2.out' },
      0.1
    );

    // Continue a slower spin while energy gathers
    tl.to(orbRef.current,
      { rotation: 720, duration: 1.2, ease: 'power1.inOut' },
      1.1
    );

    // Wisps fade in with stagger
    const wispEls = containerRef.current.querySelectorAll('.portal-wisp');
    wispEls.forEach((el, i) => {
      tl.fromTo(el,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
        0.3 + i * 0.08
      );
    });

    // Particles spiral inward
    const particleEls = containerRef.current.querySelectorAll('.portal-particle');
    particleEls.forEach((el, i) => {
      const p = particles[i];
      const rad = (p.angle * Math.PI) / 180;
      const startX = Math.cos(rad) * p.radius;
      const startY = Math.sin(rad) * p.radius;
      tl.fromTo(el,
        { x: startX, y: startY, opacity: 0, scale: 1 },
        { x: 0, y: 0, opacity: 1, scale: 0, duration: 1.0 + p.delay * 0.5, ease: 'power2.in' },
        0.3 + p.delay * 0.3
      );
    });

    // Orb intensifies + wisps get absorbed
    tl.to(orbRef.current,
      { scale: 1.3, duration: 0.4, ease: 'power2.in' },
      MIN_DURATION - 0.4
    );
    wispEls.forEach((el) => {
      tl.to(el,
        { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' },
        MIN_DURATION - 0.4
      );
    });

    // White flash at the end
    tl.fromTo(
      containerRef.current.querySelector('.portal-flash'),
      { opacity: 0 },
      { opacity: 0.9, duration: 0.15 },
      MIN_DURATION
    );
    tl.to(
      containerRef.current.querySelector('.portal-flash'),
      { opacity: 0, duration: 0.2 },
      MIN_DURATION + 0.15
    );

    // Mark animation done and try to transition
    tl.call(() => {
      animDoneRef.current = true;
      doComplete();
    }, [], MIN_DURATION + 0.35);

    // Fallback: ensure completion even if GSAP callback doesn't fire (e.g. strict mode)
    const fallback = setTimeout(() => {
      animDoneRef.current = true;
      doComplete();
    }, (MIN_DURATION + 0.5) * 1000);

    return () => {
      tl.kill();
      clearTimeout(fallback);
    };
  }, [doComplete]);

  return (
    <div className="summon-portal-container" ref={containerRef}>
      <div className="portal-backdrop" />
      <div className="portal-flash" />

      <div className="portal-center">
        <div className="portal-orb-main" ref={orbRef}>
          <div className={`portal-pokeball ${variantClass}`}>
            <div className="portal-pokeball-top" />
            <div className="portal-pokeball-bottom" />
            <div className="portal-pokeball-band">
              <div className="portal-pokeball-button" />
            </div>
          </div>
        </div>
        <div className="portal-wisps">
          {wisps.map((w) => (
            <div
              key={w.id}
              className="portal-wisp"
              style={{
                '--wisp-orbit-radius': `${w.orbitRadius}px`,
                '--wisp-orbit-speed': `${w.orbitSpeed}s`,
                '--wisp-start-angle': `${w.startAngle}deg`,
                '--wisp-hue': w.hue,
                width: w.size,
                height: w.size,
              } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="portal-particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="portal-particle"
              style={{ width: p.size, height: p.size, '--hue': p.hue } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
