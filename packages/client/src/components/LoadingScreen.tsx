import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/asset-url';
import { tryLockLandscape } from '../utils/orientation-lock';
import { changelog } from '../data/changelog';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onStart: () => void;
  preloadUrls?: string[];
  swReady?: boolean;
}

export function LoadingScreen({ onStart, preloadUrls, swReady = true }: LoadingScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [swTimedOut, setSwTimedOut] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [justUpdated] = useState(() => {
    const flag = sessionStorage.getItem('sw-just-updated');
    if (flag) sessionStorage.removeItem('sw-just-updated');
    return !!flag;
  });

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Give the SW up to 3s to finish its update check, then stop waiting
  useEffect(() => {
    if (swReady) return;
    const timer = setTimeout(() => setSwTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [swReady]);

  // Preload home screen assets only after the splash background is displayed
  useEffect(() => {
    if (!bgLoaded || !preloadUrls || preloadUrls.length === 0) return;
    preloadUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [bgLoaded, preloadUrls]);

  const canStart = minTimeElapsed && (swReady || swTimedOut);

  return (
    <div className="loading-screen" onClick={() => { if (!canStart || changelogOpen) return; tryLockLandscape(); onStart(); }}>
      {/* Full-screen background image */}
      <div className="ls-bg">
        <img src={assetUrl('splash/pikachu-4.jpg')} alt="" className="ls-bg-img" onLoad={() => setBgLoaded(true)} />
      </div>

      {/* Dark gradient overlay */}
      <div className="ls-overlay" />

      {/* Vignette */}
      <div className="ls-vignette" />

      {/* White flash burst */}
      <div className="ls-flash" />

      {/* Light rays behind title */}
      <div className="ls-rays" />

      {/* Firefly particles */}
      <div className="ls-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="ls-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Center title */}
      <h1 className="ls-title">
        <span className="ls-title-gatcha">Forge</span>
        <span className="ls-title-mon"> : Monster Vault</span>
      </h1>

      {/* Top-left changelog button */}
      {changelog[0] && (
        <button className="ls-changelog-btn" onClick={e => { e.stopPropagation(); setChangelogOpen(true); }}>
          {justUpdated ? `Updated to ${changelog[0].version} — ` : ''}What&apos;s New?
        </button>
      )}

      {/* Bottom-anchored content */}
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
