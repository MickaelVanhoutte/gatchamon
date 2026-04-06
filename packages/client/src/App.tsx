import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';
import { swReady, setAppReady } from './services/sw-update';
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
import { PCBoxPage } from './pages/PCBoxPage';
import { AltarPage } from './pages/AltarPage';
import { InboxPage } from './pages/InboxPage';
import { RetrySummonPage } from './pages/RetrySummonPage';
import { ItemInventoryPage } from './pages/ItemInventoryPage';
import { HeldItemManagePage } from './pages/HeldItemManagePage';
import { ShopPage } from './pages/ShopPage';
import { BottomNav } from './components/layout/BottomNav';
import { TopHUD } from './components/layout/TopHUD';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { useTutorialStore } from './stores/tutorialStore';
import { useRotatedScroll } from './hooks/useRotatedScroll';
import { AdminPage } from './pages/admin/AdminPage';
import { AutoBattleFloatingIcon, RepeatBattleModal } from './components/RepeatBattleWidget';
import { UpdateBanner } from './components/UpdateBanner';

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

  // Transition on route change: fade-from-black (city) or cloud wipe (other)
  const [cloudWipe, setCloudWipe] = useState(false);
  const [fadeFromBlack, setFadeFromBlack] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      const state = location.state as { fromCity?: boolean } | null;
      if (state?.fromCity) {
        // Coming from city zoom: fade from black, skip cloud wipe
        setFadeFromBlack(true);
        const t = setTimeout(() => setFadeFromBlack(false), 50);
        return () => clearTimeout(t);
      } else {
        // Normal navigation: cloud wipe
        setCloudWipe(true);
        const t = setTimeout(() => setCloudWipe(false), 400);
        return () => clearTimeout(t);
      }
    }
  }, [location.pathname, location.state]);

  // Clear fromCity state to prevent fade on browser back/forward
  useEffect(() => {
    if ((location.state as { fromCity?: boolean } | null)?.fromCity) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);

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
    return <LoadingScreen onStart={() => { setShowLoading(false); setAppReady(); }} swReady={swDone} />;
  }

  if (!player) {
    return (
      <div className="app app--onboarding">
        <div className="onboarding">
          <h1>Forge : Monster Vault</h1>
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
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
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
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/pokedex" element={<PokedexPage />} />
          <Route path="/pc" element={<PCBoxPage />} />
          <Route path="/collection/:instanceId" element={<MonsterDetail />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/story" element={<StoryModePage />} />
          <Route path="/dungeons" element={<DungeonPage />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="/altar" element={<AltarPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inventory" element={<ItemInventoryPage />} />
          <Route path="/items/:pokemonInstanceId" element={<HeldItemManagePage />} />
          <Route path="/retry-summon" element={<RetrySummonPage />} />
          <Route path="/battle/team-select" element={<TeamSelectPage />} />
          <Route path="/battle/:battleId" element={<BattlePage />} />
        </Routes>
      </div>
      <BottomNav />
      <TutorialOverlay />
      <AutoBattleFloatingIcon />
      <RepeatBattleModal />
      <UpdateBanner />
      {cloudWipe && <div className="cloud-wipe" />}
      {fadeFromBlack !== undefined && (
        <div className={`fade-from-black ${fadeFromBlack ? 'active' : ''}`} />
      )}
    </div>
  );
}
