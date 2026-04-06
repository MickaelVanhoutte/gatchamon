import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/asset-url';
import { tryLockLandscape } from '../utils/orientation-lock';
import { changelog } from '../data/changelog';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onStart: () => void;
  swReady?: boolean;
}

export function LoadingScreen({ onStart, swReady = true }: LoadingScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [justUpdated] = useState(() => {
    const flag = sessionStorage.getItem('sw-just-updated');
    if (flag) sessionStorage.removeItem('sw-just-updated');
    return !!flag;
  });

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const canStart = minTimeElapsed && swReady;

  return (
    <div className="loading-screen" onClick={() => { if (!canStart || changelogOpen) return; tryLockLandscape(); onStart(); }}>
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
            <span className="ls-title-gatcha">Forge</span>
            <span className="ls-title-mon"> : Monster Vault</span>
          </h1>
          <p className="ls-subtitle">Gotta Catch &apos;Em All</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="ls-bottom">
        {justUpdated && changelog[0] && (
          <button className="ls-changelog-btn" onClick={e => { e.stopPropagation(); setChangelogOpen(true); }}>
            Updated to {changelog[0].version} — What&apos;s New?
          </button>
        )}
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

      {/* Changelog modal */}
      {changelogOpen && (
        <div className="ls-changelog-overlay" onClick={() => setChangelogOpen(false)}>
          <div className="ls-changelog-modal" onClick={e => e.stopPropagation()}>
            <button className="ls-changelog-close" onClick={() => setChangelogOpen(false)}>&times;</button>
            <h2 className="ls-changelog-title">What&apos;s New</h2>
            {changelog.map((entry, idx) => (
              <div key={idx} className="ls-changelog-entry">
                <p className="ls-changelog-version">{entry.version} <span className="ls-changelog-date">{entry.date}</span></p>
                <ul className="ls-changelog-list">
                  {entry.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
