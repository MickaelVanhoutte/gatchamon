import { useEffect, useState } from 'react';
import './BattleLoadingScreen.css';

interface BattleLoadingScreenProps {
  assetUrls: string[];
  onReady: () => void;
}

export function BattleLoadingScreen({ assetUrls, onReady }: BattleLoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (assetUrls.length === 0) {
      onReady();
      return;
    }

    let loaded = 0;
    const total = assetUrls.length;
    let done = false;

    const markDone = () => {
      if (done) return;
      done = true;
      setProgress(100);
      setTimeout(onReady, 200);
    };

    // Timeout fallback
    const timeout = setTimeout(markDone, 5000);

    for (const url of assetUrls) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        setProgress(Math.floor((loaded / total) * 100));
        if (loaded >= total) markDone();
      };
      img.src = url;
    }

    return () => clearTimeout(timeout);
  }, [assetUrls, onReady]);

  return (
    <div className="battle-loading">
      <div className="battle-loading-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="battle-loading-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>
      <div className="battle-loading-swords">&#9876;&#65039;</div>
      <div className="battle-loading-title">Preparing Battle</div>
      <div className="battle-loading-bar-bg">
        <div className="battle-loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="battle-loading-subtitle">Loading assets...</div>
    </div>
  );
}
