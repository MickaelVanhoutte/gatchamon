import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isActivePokemon } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { CityScene } from '../components/city/CityScene';
import { LoginCalendarModal } from '../components/LoginCalendarModal';
import { OptionsModal } from '../components/OptionsModal';
import { GameIcon } from '../components/icons';
import { haptic } from '../utils/haptics';
import * as serverApi from '../services/server-api.service';
import { ChatPanel } from '../components/chat/ChatPanel';
import { useForaging } from '../hooks/useForaging';
import './HomePage.css';

// Module-level flag survives component remounts but resets on page refresh
let calendarShownToday = false;

export function HomePage() {
  const { player, collection, loadCollection } = useGameStore();
  const tutorialStep = useTutorialStore(s => s.step);
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (player) loadCollection();
  }, [player, loadCollection]);

  useEffect(() => {
    if (tutorialStep !== 99 || calendarShownToday) return;
    serverApi.getLoginCalendar().then((res: any) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (res.lastClaimDate !== todayStr) {
        calendarShownToday = true;
        setShowCalendar(true);
      }
    }).catch(() => {});
  }, [tutorialStep]);

  const topMonsters = useMemo(() => {
    const visible = collection.filter(m => isActivePokemon(m.instance.templateId));
    const homeMonsters = visible.filter(m => m.instance.showOnHome);
    const source = homeMonsters.length > 0 ? homeMonsters : visible;
    return [...source]
      .sort((a, b) => {
        if (b.instance.stars !== a.instance.stars) return b.instance.stars - a.instance.stars;
        return b.instance.level - a.instance.level;
      })
      .slice(0, 6);
  }, [collection]);

  const monsterIds = useMemo(() => topMonsters.map(m => m.instance.instanceId), [topMonsters]);
  const { pendingFinds, claimFind } = useForaging(monsterIds);

  if (!player) return null;

  return (
    <div className="page island-page">
      <CityScene
        monsters={topMonsters}
        onNavigate={navigate}
        pendingFinds={pendingFinds}
        onClaimFind={claimFind}
      />
      <button
        className="home-options-btn"
        aria-label="Options"
        onClick={() => { haptic.tap(); setShowOptions(true); }}
      >
        <GameIcon id="gear" size={20} />
      </button>
      {showCalendar && <LoginCalendarModal onClose={() => setShowCalendar(false)} />}
      {showOptions && <OptionsModal onClose={() => setShowOptions(false)} />}
      <ChatPanel />
    </div>
  );
}
