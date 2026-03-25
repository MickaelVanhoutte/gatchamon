import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { OwnedPokemon } from '../../stores/gameStore';
import { assetUrl } from '../../utils/asset-url';
import { GameIcon } from '../icons';
import './SummonReveal.css';

interface Props {
  pokemon: OwnedPokemon;
  isSpecial?: boolean;
  onComplete: () => void;
}

const STAR_COLORS: Record<number, string> = {
  1: '#aaa',
  2: '#4ade80',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
};

export function SummonReveal({ pokemon, isSpecial = false, onComplete }: Props) {
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
    ? assetUrl(`monsters/ani-shiny/${template.name.toLowerCase()}.gif`)
    : assetUrl(`monsters/ani/${template.name.toLowerCase()}.gif`);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(0.6, onComplete);
      },
    });
    tlRef.current = tl;

    if (isSpecial) {
      // === SPECIAL REVEAL: Silhouette-first with dramatic timing ===

      // Background glow starts small and dim
      if (glowRef.current) {
        tl.fromTo(glowRef.current,
          { scale: 0.2, opacity: 0.3 },
          { scale: 0.8, opacity: 0.2, duration: 0.6, ease: 'power2.out' },
          0
        );
      }

      // Sprite wrapper: scale/opacity animation
      if (spriteRef.current) {
        const imgEl = spriteRef.current.querySelector('img');

        tl.fromTo(spriteRef.current,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.4)',
          },
          0.1
        );

        // Filter animations target the img directly so CSS specificity doesn't interfere
        if (imgEl) {
          // Start as black silhouette with colored glow
          tl.set(imgEl, { filter: `brightness(0) drop-shadow(0 0 20px ${starColor})` }, 0.1);

          // Silhouette pulses subtly during hold (0.9s to 2.0s)
          tl.to(imgEl,
            { filter: `brightness(0.05) drop-shadow(0 0 30px ${starColor})`, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' },
            1.0
          );

          // Flash bright reveal at 2.0s
          tl.to(imgEl,
            { filter: 'brightness(3) drop-shadow(0 0 40px rgba(255,255,255,0.9))', duration: 0.2, ease: 'power3.in' },
            2.0
          );
          // Settle to normal
          const normalFilter = isShiny
            ? 'brightness(1) drop-shadow(0 0 12px rgba(255,215,0,0.6)) drop-shadow(0 0 24px rgba(255,215,0,0.3))'
            : 'brightness(1) drop-shadow(0 0 12px rgba(255,255,255,0.4))';
          tl.to(imgEl,
            { filter: normalFilter, duration: 0.5, ease: 'power2.out' },
            2.2
          );
        }
      }

      // Glow expands to full during reveal
      if (glowRef.current) {
        tl.to(glowRef.current,
          { scale: 1.8, opacity: 0.5, duration: 0.4, ease: 'power2.out' },
          2.0
        );
        tl.to(glowRef.current,
          { opacity: 0.3, scale: 1.5, duration: 0.4 },
          2.4
        );
      }

      // Name appears as dark/dim text during silhouette, then brightens with reveal
      if (nameRef.current) {
        tl.fromTo(nameRef.current,
          { opacity: 0, y: 10, color: 'rgba(60, 70, 90, 0.5)' },
          { opacity: 0.6, y: 0, duration: 0.5, ease: 'power2.out' },
          1.0
        );
        // Brighten name when monster is revealed
        tl.to(nameRef.current,
          { opacity: 1, color: '#ffffff', textShadow: '0 2px 12px rgba(255,255,255,0.5)', duration: 0.3, ease: 'power2.out' },
          2.0
        );
      }

      // Stars pop in sequence after reveal
      if (starsRef.current) {
        const starEls = starsRef.current.querySelectorAll('.reveal-star');
        starEls.forEach((el, i) => {
          tl.fromTo(el,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(3)' },
            2.3 + i * 0.12
          );
        });
      }
    } else {
      // === STANDARD REVEAL: Fast animation for 1-2 star pulls ===

      // Glow expands from center
      if (glowRef.current) {
        tl.fromTo(glowRef.current,
          { scale: 0.3, opacity: 0.8 },
          { scale: 1.5, opacity: 0.3, duration: 0.5, ease: 'power2.out' },
          0
        );
      }

      // Monster sprite materializes with overshoot bounce
      if (spriteRef.current) {
        tl.fromTo(spriteRef.current,
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
          tl.fromTo(el,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(3)' },
            0.5 + i * 0.08
          );
        });
      }

      // Name fades in (white for readability on dark background)
      if (nameRef.current) {
        tl.fromTo(nameRef.current,
          { opacity: 0, y: 10, color: '#ffffff' },
          { opacity: 1, y: 0, color: '#ffffff', duration: 0.3, ease: 'power2.out' },
          0.6
        );
      }
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
      <div
        className={`reveal-sprite ${isShiny ? 'shiny' : ''}`}
        ref={spriteRef}
      >
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
            <GameIcon id="star" size={20} />
          </span>
        ))}
      </div>

      {/* Monster name */}
      <div className="reveal-name" ref={nameRef}>
        {template.name}
        {isShiny && <span className="reveal-shiny-icon"><GameIcon id="shiny" size={16} /></span>}
      </div>
    </div>
  );
}
