import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import './BottomNav.css';

const TABS = [
  { path: '/', icon: '\u2302', badge: false },
  { path: '/summon', icon: '\u25C9', badge: false },
  { path: '/collection', icon: '\u25A4', badge: false },
  { path: '/missions', icon: '\u{1F3C6}', badge: true },
  { path: '/story', icon: '\u2694', badge: false },
  { path: '/dungeons', icon: '\u{1F3DB}', badge: false },
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
          <span className="toolbar-icon">{tab.icon}</span>
          {tab.badge && unclaimedRewardCount > 0 && (
            <span className="toolbar-badge">{unclaimedRewardCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
