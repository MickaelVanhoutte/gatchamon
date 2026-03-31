import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useTutorialStore } from '../../stores/tutorialStore';
import { useRepeatBattleStore } from '../../stores/repeatBattleStore';
import { GameIcon } from '../icons';
import './BottomNav.css';

const TABS = [
  { path: '/', icon: 'home', badge: false, tutorialId: 'nav-home' },
  { path: '/summon', icon: 'summon', badge: false, tutorialId: 'nav-summon' },
  { path: '/shop', icon: 'shop', badge: false, tutorialId: 'nav-shop' },
  { path: '/collection', icon: 'collection', badge: false, tutorialId: 'nav-collection' },
  { path: '/missions', icon: 'trophy', badge: true, tutorialId: 'nav-missions' },
  { path: '/story', icon: 'swords', badge: false, tutorialId: 'nav-story' },
  { path: '/dungeons', icon: 'dungeon', badge: false, tutorialId: 'nav-dungeons' },
  { path: '/trainer', icon: 'trainer', badge: false, tutorialId: 'nav-trainer' },
];

/** During tutorial, which tab is allowed per step */
const TUTORIAL_ALLOWED_TAB: Record<number, string> = {
  3: '/summon',
  7: '/story',
  12: '/collection',
};

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unclaimedRewardCount = useGameStore(s => s.unclaimedRewardCount);
  const repeatStatus = useRepeatBattleStore(s => s.status);
  const repeatDone = repeatStatus !== 'idle' && repeatStatus !== 'running';
  const tutorialStep = useTutorialStore(s => s.step);
  const advanceStep = useTutorialStore(s => s.advanceStep);
  const tutorialActive = tutorialStep > 0 && tutorialStep < 18;
  const [expanded, setExpanded] = useState(false);

  // Force expand during tutorial steps 3, 7, and 12
  const forceExpanded = tutorialActive && (tutorialStep === 3 || tutorialStep === 7 || tutorialStep === 12);

  // Auto-collapse when navigating (unless tutorial forces it open)
  useEffect(() => {
    if (!forceExpanded) setExpanded(false);
  }, [location.pathname, forceExpanded]);

  // Keep expanded when tutorial forces it
  useEffect(() => {
    if (forceExpanded) setExpanded(true);
  }, [forceExpanded]);

  if (location.pathname.startsWith('/battle/')) return null;

  // During tutorial steps that don't involve nav, hide completely
  if (tutorialActive && ![2, 3, 7, 12].includes(tutorialStep)) return null;

  // Elevate nav above tutorial overlay during nav-targeted steps
  const elevate = tutorialActive && (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 7 || tutorialStep === 12);

  if (!expanded && !forceExpanded) {
    return (
      <button
        className={`bottom-toolbar-collapsed ${elevate ? 'tutorial-target' : ''}`}
        data-tutorial-id="nav-toggle"
        onClick={() => {
          setExpanded(true);
          if (tutorialStep === 2) advanceStep();
        }}
      >
        <GameIcon id="collection" size={20} />
        {repeatDone && <span className="toolbar-repeat-dot" />}
      </button>
    );
  }

  const allowedTab = TUTORIAL_ALLOWED_TAB[tutorialStep];

  const handleTabClick = (path: string) => {
    if (tutorialActive && allowedTab && path !== allowedTab) return;
    navigate(path);
    if (tutorialActive && allowedTab && path === allowedTab) {
      advanceStep();
    }
    setExpanded(false);
  };

  return (
    <nav className={`bottom-toolbar bottom-toolbar-expandable ${elevate ? 'tutorial-target' : ''}`}>
      {!forceExpanded && (
        <button className="toolbar-btn toolbar-collapse-btn" onClick={() => setExpanded(false)}>
          <span className="toolbar-icon">✕</span>
        </button>
      )}
      {TABS.map(tab => {
        const disabled = tutorialActive && allowedTab && tab.path !== allowedTab;
        return (
          <button
            key={tab.path}
            data-tutorial-id={tab.tutorialId}
            className={`toolbar-btn ${location.pathname === tab.path ? 'active' : ''} ${disabled ? 'toolbar-btn-disabled' : ''}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <span className="toolbar-icon"><GameIcon id={tab.icon} size={20} /></span>
            {tab.badge && unclaimedRewardCount > 0 && (
              <span className="toolbar-badge">{unclaimedRewardCount}</span>
            )}
            {tab.path === '/' && repeatDone && (
              <span className="toolbar-repeat-dot" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
