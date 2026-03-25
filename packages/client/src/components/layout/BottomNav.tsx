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

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unclaimedRewardCount = useGameStore(s => s.unclaimedRewardCount);

  if (location.pathname.startsWith('/battle/')) return null;

  return (
    <nav className="bottom-toolbar">
      {TABS.map(tab => (
        <button
          key={tab.path}
          className={`toolbar-btn ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
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
