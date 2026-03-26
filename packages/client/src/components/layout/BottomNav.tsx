import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { GameIcon } from '../icons';
import './BottomNav.css';

const TABS = [
  { path: '/', icon: 'home', badge: false },
  { path: '/summon', icon: 'summon', badge: false },
  { path: '/collection', icon: 'collection', badge: false },
  { path: '/missions', icon: 'trophy', badge: true },
  { path: '/story', icon: 'swords', badge: false },
  { path: '/dungeons', icon: 'dungeon', badge: false },
  { path: '/trainer', icon: 'trainer', badge: false },
];

const COLLAPSIBLE_PATHS = ['/summon'];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unclaimedRewardCount = useGameStore(s => s.unclaimedRewardCount);
  const [expanded, setExpanded] = useState(false);

  const collapsible = COLLAPSIBLE_PATHS.includes(location.pathname);

  // Auto-collapse when navigating to a collapsible page
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/battle/')) return null;

  if (collapsible && !expanded) {
    return (
      <button
        className="bottom-toolbar-collapsed"
        onClick={() => setExpanded(true)}
      >
        <GameIcon id="collection" size={20} />
      </button>
    );
  }

  return (
    <nav className={`bottom-toolbar ${collapsible ? 'bottom-toolbar-expandable' : ''}`}>
      {collapsible && (
        <button className="toolbar-btn toolbar-collapse-btn" onClick={() => setExpanded(false)}>
          <span className="toolbar-icon">✕</span>
        </button>
      )}
      {TABS.map(tab => (
        <button
          key={tab.path}
          className={`toolbar-btn ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => { navigate(tab.path); if (collapsible) setExpanded(false); }}
        >
          <span className="toolbar-icon"><GameIcon id={tab.icon} size={20} /></span>
          {tab.badge && unclaimedRewardCount > 0 && (
            <span className="toolbar-badge">{unclaimedRewardCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
