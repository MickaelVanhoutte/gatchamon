import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const TABS = [
  { path: '/', icon: '\u2302' },
  { path: '/summon', icon: '\u25C9' },
  { path: '/collection', icon: '\u25A4' },
  { path: '/story', icon: '\u2694' },
  { path: '/dungeons', icon: '\u{1F3DB}' },
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
