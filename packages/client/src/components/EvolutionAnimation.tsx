import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './EvolutionAnimation.css';

interface Props {
  fromSprite: string;
  toSprite: string;
  evolvedName: string;
  onComplete: () => void;
}

type Phase =
  | 'black'        // overlay fades in, show current sprite
  | 'glow'         // glow builds behind sprite + ambient particles
  | 'white-in'     // screen flashes white
  | 'morph'        // alternate between old/new sprite
  | 'white-out'    // white fades, reveal evolved sprite
  | 'sparkle'      // sparkles burst + name
  | 'linger'       // hold the final pose
  | 'done';        // fade out overlay

type SparkleSize = 'sm' | 'md' | 'lg' | 'star';

interface Sparkle {
  id: number;
  tx: string;
  ty: string;
  delay: string;
  dur: string;
  left: string;
  top: string;
  size: SparkleSize;
  wave2: boolean;
}

interface Particle {
  id: number;
  left: string;
  top: string;
  py: string;
  pdur: string;
  pdelay: string;
}

function makeSparkles(): Sparkle[] {
  const sparkles: Sparkle[] = [];
  let id = 0;

  // Wave 1: tight burst from center (24 sparkles)
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.3;
    const dist = 60 + Math.random() * 120;
    const sizes: SparkleSize[] = ['sm', 'md', 'lg', 'star'];
    sparkles.push({
      id: id++,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      delay: `${Math.random() * 0.2}s`,
      dur: `${0.8 + Math.random() * 0.5}s`,
      left: `calc(50% + ${(Math.random() - 0.5) * 16}px)`,
      top: `calc(50% + ${(Math.random() - 0.5) * 16}px)`,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      wave2: false,
    });
  }

  // Wave 2: wider, delayed burst (20 sparkles)
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.5;
    const dist = 120 + Math.random() * 200;
    const sizes: SparkleSize[] = ['sm', 'md', 'lg'];
    sparkles.push({
      id: id++,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      delay: `${0.3 + Math.random() * 0.4}s`,
      dur: `${1.0 + Math.random() * 0.8}s`,
      left: `calc(50% + ${(Math.random() - 0.5) * 30}px)`,
      top: `calc(50% + ${(Math.random() - 0.5) * 30}px)`,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      wave2: true,
    });
  }

  // Wave 3: star-shaped accents, very wide (12 sparkles)
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.6;
    const dist = 150 + Math.random() * 250;
    sparkles.push({
      id: id++,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      delay: `${0.5 + Math.random() * 0.5}s`,
      dur: `${1.2 + Math.random() * 0.8}s`,
      left: `calc(50% + ${(Math.random() - 0.5) * 10}px)`,
      top: `calc(50% + ${(Math.random() - 0.5) * 10}px)`,
      size: 'star',
      wave2: false,
    });
  }

  return sparkles;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${30 + Math.random() * 40}%`,
    top: `${40 + Math.random() * 30}%`,
    py: `${-(30 + Math.random() * 60)}px`,
    pdur: `${1.5 + Math.random() * 2}s`,
    pdelay: `${Math.random() * 2}s`,
  }));
}

export function EvolutionAnimation({ fromSprite, toSprite, evolvedName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('black');
  const [morphShow, setMorphShow] = useState<'from' | 'to'>('from');
  const [sparkles] = useState(makeSparkles);
  const [particles] = useState(makeParticles);
  const [portalTarget] = useState(() => document.querySelector('.app') ?? document.body);

  const advancePhase = useCallback((next: Phase, delay: number) => {
    const t = setTimeout(() => setPhase(next), delay);
    return t;
  }, []);

  // Phase timeline
  useEffect(() => {
    const t = advancePhase('glow', 1200);
    return () => clearTimeout(t);
  }, [advancePhase]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'glow')      t = advancePhase('white-in', 2000);
    if (phase === 'white-in')  t = advancePhase('morph', 1200);
    if (phase === 'white-out') t = advancePhase('sparkle', 1500);
    if (phase === 'sparkle')   t = advancePhase('linger', 2500);
    if (phase === 'linger')    t = advancePhase('done', 1500);
    if (phase === 'done') {
      t = setTimeout(onComplete, 1200);
    }
    return () => clearTimeout(t!);
  }, [phase, advancePhase, onComplete]);

  // Morph: alternate sprites with increasing speed
  useEffect(() => {
    if (phase !== 'morph') return;

    let cancelled = false;
    let count = 0;
    const maxCount = 18;

    function tick() {
      if (cancelled) return;
      count++;
      setMorphShow(prev => (prev === 'from' ? 'to' : 'from'));

      if (count >= maxCount) {
        setMorphShow('to');
        setPhase('white-out');
        return;
      }

      const interval = 400 - (count / maxCount) * 320;
      setTimeout(tick, interval);
    }

    setTimeout(tick, 400);
    return () => { cancelled = true; };
  }, [phase]);

  const showFrom = phase === 'black' || phase === 'glow' || phase === 'white-in' || (phase === 'morph' && morphShow === 'from');
  const showTo = (phase === 'morph' && morphShow === 'to') || phase === 'white-out' || phase === 'sparkle' || phase === 'linger' || phase === 'done';
  const isReveal = phase === 'white-out' || phase === 'sparkle' || phase === 'linger' || phase === 'done';

  const whiteClass =
    phase === 'white-in' ? 'flash-in' :
    phase === 'morph' ? 'flash-hold' :
    phase === 'white-out' ? 'flash-out' : '';

  const content = (
    <div className={`evo-overlay ${phase === 'done' ? 'phase-done' : ''}`}>
      {/* White flash layer */}
      <div className={`evo-white-flash ${whiteClass}`} />

      {/* Center content: sprite + name stacked vertically */}
      <div className="evo-center">
        {/* Sprite stage */}
        <div className="evo-sprite-stage">
          <div className={`evo-glow ${phase === 'glow' ? 'glow-on' : ''}`} />

          {/* Ambient particles during glow phase */}
          {(phase === 'glow') && particles.map(p => (
            <div
              key={p.id}
              className="evo-particle"
              style={{
                left: p.left,
                top: p.top,
                '--py': p.py,
                '--pdur': p.pdur,
                '--pdelay': p.pdelay,
              } as React.CSSProperties}
            />
          ))}

          {/* "From" sprite */}
          <img
            className={`evo-sprite ${phase === 'morph' && morphShow === 'from' ? 'morph-bright' : ''}`}
            src={fromSprite}
            alt="current"
            style={{ opacity: showFrom ? 1 : 0, zIndex: 1 }}
          />

          {/* "To" sprite */}
          <img
            className={`evo-sprite ${isReveal ? 'reveal' : ''} ${phase === 'morph' && morphShow === 'to' ? 'morph-bright' : ''}`}
            src={toSprite}
            alt="evolved"
            style={{ opacity: showTo ? 1 : 0, zIndex: 2 }}
          />
        </div>

        {/* Evolved name — below sprite */}
        <div className={`evo-text ${phase === 'sparkle' || phase === 'linger' || phase === 'done' ? 'show' : ''}`}>
          {evolvedName}
        </div>
      </div>

      {/* Sparkles */}
      {(phase === 'sparkle' || phase === 'linger' || phase === 'done') && (
        <div className="evo-sparkles">
          {sparkles.map(s => (
            <div
              key={s.id}
              className={`evo-sparkle evo-sparkle--${s.size} ${s.wave2 ? 'evo-sparkle--wave2' : ''}`}
              style={{
                left: s.left,
                top: s.top,
                '--tx': s.tx,
                '--ty': s.ty,
                '--delay': s.delay,
                '--dur': s.dur,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(content, portalTarget);
}
