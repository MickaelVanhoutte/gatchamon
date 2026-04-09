import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isActivePokemon } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { CityScene } from '../components/city/CityScene';
import { LoginCalendarModal } from '../components/LoginCalendarModal';
import { canClaimToday } from '../services/login-calendar.service';
import { ChatPanel } from '../components/chat/ChatPanel';
import { useForaging } from '../hooks/useForaging';
import './HomePage.css';

export function HomePage() {
  const { player, collection, loadCollection } = useGameStore();
  const tutorialStep = useTutorialStore(s => s.step);
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarShownRef = useRef(false);

  useEffect(() => {
    if (player) loadCollection();
  }, [player, loadCollection]);

  useEffect(() => {
    if (tutorialStep === 99 && canClaimToday() && !calendarShownRef.current) {
      calendarShownRef.current = true;
      setShowCalendar(true);
    }
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
      {showCalendar && <LoginCalendarModal onClose={() => setShowCalendar(false)} />}
      <ChatPanel />
    </div>
  );
}
