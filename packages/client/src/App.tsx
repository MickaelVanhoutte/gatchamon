import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';
import { swReady } from './services/sw-update';
import { HomePage } from './pages/HomePage';
import { SummonPage } from './pages/SummonPage';
import { CollectionPage } from './pages/CollectionPage';
import { MonsterDetail } from './pages/MonsterDetail';
import { StoryModePage } from './pages/StoryModePage';
import { TeamSelectPage } from './pages/TeamSelectPage';
import { BattlePage } from './pages/BattlePage';
import { DungeonPage } from './pages/DungeonPage';
import { MissionsPage } from './pages/MissionsPage';
import { TrainerPage } from './pages/TrainerPage';
import { PokedexPage } from './pages/PokedexPage';
import { AltarPage } from './pages/AltarPage';
import { InboxPage } from './pages/InboxPage';
import { RetrySummonPage } from './pages/RetrySummonPage';
import { ItemInventoryPage } from './pages/ItemInventoryPage';
import { BottomNav } from './components/layout/BottomNav';
import { TopHUD } from './components/layout/TopHUD';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { useTutorialStore } from './stores/tutorialStore';
import { useRotatedScroll } from './hooks/useRotatedScroll';
import { AdminPage } from './pages/admin/AdminPage';
import { RepeatBattleWidget } from './components/RepeatBattleWidget';

export function App() {
  const location = useLocation();
  const { player, createPlayer, loadPlayer } = useGameStore();
  const [nameInput, setNameInput] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [swDone, setSwDone] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useRotatedScroll(scrollRef);

  useEffect(() => {
    loadPlayer();
    useTutorialStore.getState().loadTutorial();
    swReady.then(() => setSwDone(true));
  }, [loadPlayer]);

  // Auto-focus name input
  useEffect(() => {
    if (!player && !showLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [player, showLoading]);

  if (location.pathname === '/admin') {
    return <AdminPage />;
  }

  if (showLoading) {
    return <LoadingScreen onStart={() => setShowLoading(false)} swReady={swDone} />;
  }

  if (!player) {
    return (
      <div className="app app--onboarding">
        <div className="onboarding">
          <h1>Gatchamon</h1>
          <p>Choose your trainer name</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (nameInput.trim()) {
              await createPlayer(nameInput.trim());
              useTutorialStore.getState().advanceStep(); // step 0 → 1
              navigate('/');
            }
          }}>
            <input
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Enter name..."
              maxLength={20}
            />
            <button type="submit" disabled={!nameInput.trim()}>
              Start Adventure
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <TopHUD />
      <div className="app-content" ref={scrollRef}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/summon" element={<SummonPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/pokedex" element={<PokedexPage />} />
          <Route path="/collection/:instanceId" element={<MonsterDetail />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/story" element={<StoryModePage />} />
          <Route path="/dungeons" element={<DungeonPage />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="/altar" element={<AltarPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inventory" element={<ItemInventoryPage />} />
          <Route path="/retry-summon" element={<RetrySummonPage />} />
          <Route path="/battle/team-select" element={<TeamSelectPage />} />
          <Route path="/battle/:battleId" element={<BattlePage />} />
        </Routes>
      </div>
      <BottomNav />
      <TutorialOverlay />
      <RepeatBattleWidget />
    </div>
  );
}
