import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const TABS = [
  { path: '/', icon: '⌂' },
  { path: '/summon', icon: '◉' },
  { path: '/collection', icon: '▤' },
  { path: '/story', icon: '⚔' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
        </button>
      ))}
    </nav>
  );
}
