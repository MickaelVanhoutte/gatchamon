import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isActivePokemon } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { IslandScene } from '../components/island/IslandScene';
import { LoginCalendarModal } from '../components/LoginCalendarModal';
import { canClaimToday } from '../services/login-calendar.service';
import { CheatBubble } from '../components/cheat/CheatBubble';
import './HomePage.css';

export function HomePage() {
  const { player, collection, loadCollection } = useGameStore();
  const tutorialStep = useTutorialStore(s => s.step);
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (player) loadCollection();
  }, [player, loadCollection]);

  useEffect(() => {
    if (tutorialStep === 99 && canClaimToday()) {
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

  if (!player) return null;

  return (
    <div className="page island-page">
      <IslandScene
        monsters={topMonsters}
        onNavigate={navigate}
      />
      {showCalendar && <LoginCalendarModal onClose={() => setShowCalendar(false)} />}
      <CheatBubble />
    </div>
  );
}
