import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/asset-url';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onStart: () => void;
  swReady?: boolean;
}

export function LoadingScreen({ onStart, swReady = true }: LoadingScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const canStart = minTimeElapsed && swReady;

  return (
    <div className="loading-screen" onClick={() => canStart && onStart()}>
      {/* Animated particles */}
      <div className="ls-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="ls-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Radial glow behind logo */}
      <div className="ls-glow" />

      {/* Silhouette Pokémon on left and right */}
      <div className="ls-pokemon ls-pokemon-left">
        <img src={assetUrl('monsters/ani/charizard.gif')} alt="" />
      </div>
      <div className="ls-pokemon ls-pokemon-right">
        <img src={assetUrl('monsters/ani/mewtwo.gif')} alt="" />
      </div>

      {/* Center content */}
      <div className="ls-center">
        <div className="ls-logo-container">
          <div className="ls-pokeball-icon">
            <div className="ls-pokeball-top" />
            <div className="ls-pokeball-band">
              <div className="ls-pokeball-button" />
            </div>
            <div className="ls-pokeball-bottom" />
          </div>
          <h1 className="ls-title">
            <span className="ls-title-gatcha">Gatcha</span>
            <span className="ls-title-mon">mon</span>
          </h1>
          <p className="ls-subtitle">Gotta Catch &apos;Em All</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="ls-bottom">
        {canStart ? (
          <p className="ls-tap-text">Touch to Start</p>
        ) : minTimeElapsed ? (
          <p className="ls-updating-text">Updating...</p>
        ) : (
          <div className="ls-loading-bar">
            <div className="ls-loading-fill" />
          </div>
        )}
        <p className="ls-copyright">Fan Project - Not affiliated with Nintendo or The Pok&eacute;mon Company</p>
      </div>
    </div>
  );
}
