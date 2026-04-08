import { useEffect, useState } from 'react';
import './ShinyEntrySparkle.css';

type SparkleSize = 'sm' | 'md' | 'star';

interface Sparkle {
  id: number;
  tx: string;
  ty: string;
  delay: string;
  dur: string;
  left: string;
  top: string;
  size: SparkleSize;
}

function makeEntrySparkles(): Sparkle[] {
  const sparkles: Sparkle[] = [];
  const sizes: SparkleSize[] = ['sm', 'md', 'star'];
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
    const dist = 30 + Math.random() * 50;
    sparkles.push({
      id: i,
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      delay: `${Math.random() * 0.3}s`,
      dur: `${0.6 + Math.random() * 0.6}s`,
      left: `calc(50% + ${(Math.random() - 0.5) * 10}px)`,
      top: `calc(50% + ${(Math.random() - 0.5) * 10}px)`,
      size: sizes[Math.floor(Math.random() * sizes.length)],
    });
  }
  return sparkles;
}

export function ShinyEntrySparkle({ onComplete }: { onComplete?: () => void }) {
  const [sparkles] = useState(makeEntrySparkles);

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="shiny-entry-sparkles">
      {sparkles.map(s => (
        <div
          key={s.id}
          className={`shiny-entry-sparkle shiny-entry-sparkle--${s.size}`}
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
  );
}
