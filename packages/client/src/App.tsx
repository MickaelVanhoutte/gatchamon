import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getTemplate, isActivePokemon } from '@gatchamon/shared';
import { useGameStore } from './stores/gameStore';
import { swReady, setAppReady } from './services/sw-update';
import { assetUrl } from './utils/asset-url';
import { loadCollection as loadCollectionFromStorage } from './services/storage';
import { HomePage } from './pages/HomePage';
import { BottomNav } from './components/layout/BottomNav';
import { TopHUD } from './components/layout/TopHUD';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { useTutorialStore } from './stores/tutorialStore';
import { useRotatedScroll } from './hooks/useRotatedScroll';
import { AutoBattleFloatingIcon, RepeatBattleModal } from './components/RepeatBattleWidget';
import { UpdateBanner } from './components/UpdateBanner';

// Lazy-loaded routes — only downloaded when navigated to
const SummonPage = lazy(() => import('./pages/SummonPage').then(m => ({ default: m.SummonPage })));
const CollectionPage = lazy(() => import('./pages/CollectionPage').then(m => ({ default: m.CollectionPage })));
const MonsterDetail = lazy(() => import('./pages/MonsterDetail').then(m => ({ default: m.MonsterDetail })));
const StoryModePage = lazy(() => import('./pages/StoryModePage').then(m => ({ default: m.StoryModePage })));
const TeamSelectPage = lazy(() => import('./pages/TeamSelectPage').then(m => ({ default: m.TeamSelectPage })));
const BattlePage = lazy(() => import('./pages/BattlePage').then(m => ({ default: m.BattlePage })));
const DungeonPage = lazy(() => import('./pages/DungeonPage').then(m => ({ default: m.DungeonPage })));
const MissionsPage = lazy(() => import('./pages/MissionsPage').then(m => ({ default: m.MissionsPage })));
const TrainerPage = lazy(() => import('./pages/TrainerPage').then(m => ({ default: m.TrainerPage })));
const PokedexPage = lazy(() => import('./pages/PokedexPage').then(m => ({ default: m.PokedexPage })));
const PCBoxPage = lazy(() => import('./pages/PCBoxPage').then(m => ({ default: m.PCBoxPage })));
const AltarPage = lazy(() => import('./pages/AltarPage').then(m => ({ default: m.AltarPage })));
const InboxPage = lazy(() => import('./pages/InboxPage').then(m => ({ default: m.InboxPage })));
const RetrySummonPage = lazy(() => import('./pages/RetrySummonPage').then(m => ({ default: m.RetrySummonPage })));
const ItemInventoryPage = lazy(() => import('./pages/ItemInventoryPage').then(m => ({ default: m.ItemInventoryPage })));
const HeldItemManagePage = lazy(() => import('./pages/HeldItemManagePage').then(m => ({ default: m.HeldItemManagePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));

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
  const fadeTimer = useRef<number>();

  // Clean up fade timer on unmount
  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      const state = location.state as { fromCity?: boolean } | null;
      if (state?.fromCity) {
        // Coming from city zoom: fade from black, skip cloud wipe
        // Use a ref-based timer so subsequent location.state changes
        // (e.g. DungeonPage syncing search params) don't cancel it
        setFadeFromBlack(true);
        clearTimeout(fadeTimer.current);
        fadeTimer.current = window.setTimeout(() => setFadeFromBlack(false), 50);

        // Preload story background during the fade transition
        if (location.pathname === '/story') {
          const img = new Image();
          img.src = assetUrl('backgrounds/story-path.png');
        }
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

  // Compute preload URLs for home screen assets (city background + top monster sprites)
  const preloadUrls = useMemo(() => {
    const urls: string[] = [assetUrl('backgrounds/poke-street.png')];
    if (!player) return urls;
    const instances = loadCollectionFromStorage();
    const owned = instances
      .map(inst => ({ inst, tpl: getTemplate(inst.templateId) }))
      .filter((o): o is { inst: typeof o.inst; tpl: NonNullable<typeof o.tpl> } =>
        o.tpl != null && isActivePokemon(o.inst.templateId),
      );
    const homeOnes = owned.filter(o => o.inst.showOnHome);
    const source = homeOnes.length > 0 ? homeOnes : owned;
    source
      .sort((a, b) => b.inst.stars - a.inst.stars || b.inst.level - a.inst.level)
      .slice(0, 6)
      .forEach(o => urls.push(assetUrl(o.tpl.spriteUrl)));
    return urls;
  }, [player]);

  // Auto-focus name input
  useEffect(() => {
    if (!player && !showLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [player, showLoading]);

  if (location.pathname === '/admin') {
    return <Suspense fallback={null}><AdminPage /></Suspense>;
  }

  if (showLoading) {
    return <LoadingScreen onStart={() => { setShowLoading(false); setAppReady(); }} preloadUrls={preloadUrls} swReady={swDone} />;
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
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
      <BottomNav />
      <TutorialOverlay />
      <AutoBattleFloatingIcon />
      <RepeatBattleModal />
      <UpdateBanner />
      {cloudWipe && <div className="cloud-wipe" />}
      {fadeFromBlack && (
        <div className="fade-from-black active" />
      )}
    </div>
  );
}
