import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { OwnedPokemon } from '../../stores/gameStore';
import './SummonReveal.css';

interface Props {
  pokemon: OwnedPokemon;
  onComplete: () => void;
}

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
};

export function SummonReveal({ pokemon, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { instance, template } = pokemon;
  const starColor = STAR_COLORS[instance.stars] ?? STAR_COLORS[1];
  const isShiny = instance.isShiny ?? false;
  const spriteUrl = isShiny
    ? `/monsters/ani-shiny/${template.name.toLowerCase()}.gif`
    : `/monsters/ani/${template.name.toLowerCase()}.gif`;

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Hold for a moment then complete
        gsap.delayedCall(0.6, onComplete);
      },
    });
    tlRef.current = tl;

    // Glow expands from center
    if (glowRef.current) {
      tl.fromTo(
        glowRef.current,
        { scale: 0.3, opacity: 0.8 },
        { scale: 1.5, opacity: 0.3, duration: 0.5, ease: 'power2.out' },
        0
      );
    }

    // Monster sprite materializes with overshoot bounce
    if (spriteRef.current) {
      tl.fromTo(
        spriteRef.current,
        { scale: 0, opacity: 0, filter: 'brightness(3)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'brightness(1)',
          duration: 0.6,
          ease: 'back.out(1.8)',
        },
        0.1
      );
    }

    // Stars pop in one by one
    if (starsRef.current) {
      const starEls = starsRef.current.querySelectorAll('.reveal-star');
      starEls.forEach((el, i) => {
        tl.fromTo(
          el,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(3)' },
          0.5 + i * 0.08
        );
      });
    }

    // Name fades in
    if (nameRef.current) {
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0.6
      );
    }

    return () => {
      tl.kill();
      gsap.killTweensOf(onComplete);
    };
  }, []);

  return (
    <div className="reveal-container" ref={containerRef}>
      {/* Background glow matching star color */}
      <div
        className="reveal-glow"
        ref={glowRef}
        style={{ background: `radial-gradient(circle, ${starColor}40 0%, transparent 70%)` }}
      />

      {/* Monster sprite */}
      <div className={`reveal-sprite ${isShiny ? 'shiny' : ''}`} ref={spriteRef}>
        <img
          src={spriteUrl}
          alt={template.name}
        />
        {isShiny && (
          <>
            <div className="reveal-shiny-sparkles">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="reveal-shiny-particle"
                  style={{
                    '--sparkle-angle': `${(360 / 8) * i}deg`,
                    '--sparkle-delay': `${i * 0.15}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
            <div className="reveal-shiny-badge">SHINY</div>
          </>
        )}
      </div>

      {/* Star indicators */}
      <div className="reveal-stars" ref={starsRef}>
        {Array.from({ length: instance.stars }, (_, i) => (
          <span key={i} className="reveal-star" style={{ color: starColor }}>
            ★
          </span>
        ))}
      </div>

      {/* Monster name */}
      <div className="reveal-name" ref={nameRef}>
        {template.name}
        {isShiny && <span className="reveal-shiny-icon">✦</span>}
      </div>
    </div>
  );
}
