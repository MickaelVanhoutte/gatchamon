import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import './SummonPortal.css';

interface Props {
  resultsReady: boolean;
  onComplete: () => void;
}

const PARTICLE_COUNT = 24;
const MIN_DURATION = 1.8;

export function SummonPortal({ resultsReady, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
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
    if (!orbRef.current || !ringRef.current || !circleRef.current || !containerRef.current) return;

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

    // Summoning circle appears
    tl.fromTo(circleRef.current,
      { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
      0.1
    );

    // Orb grows
    tl.fromTo(orbRef.current,
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
      0.2
    );

    // Ring spins
    tl.fromTo(ringRef.current,
      { scale: 0.5, opacity: 0, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 360, duration: 1.5, ease: 'power1.inOut' },
      0.3
    );

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

    // Orb intensifies
    tl.to(orbRef.current,
      { scale: 1.3, duration: 0.4, ease: 'power2.in' },
      MIN_DURATION - 0.4
    );

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

      <div className="portal-circle" ref={circleRef}>
        <div className="portal-circle-inner" />
        <div className="portal-circle-runes" />
      </div>

      <div className="portal-center">
        <div className="portal-ring" ref={ringRef} />
        <div className="portal-orb-main" ref={orbRef}>
          <div className="portal-orb-core" />
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
