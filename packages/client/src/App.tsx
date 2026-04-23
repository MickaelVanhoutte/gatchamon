import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { useGameStore } from './stores/gameStore';
import { swReady, setAppReady } from './services/sw-update';
import { assetUrl } from './utils/asset-url';

import { HomePage } from './pages/HomePage';
import { BottomNav } from './components/layout/BottomNav';
import { TopHUD } from './components/layout/TopHUD';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { useTutorialStore } from './stores/tutorialStore';
import { useRotatedScroll } from './hooks/useRotatedScroll';
import { AutoBattleFloatingIcon, RepeatBattleModal } from './components/RepeatBattleWidget';
import { UpdateBanner } from './components/UpdateBanner';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { signInWithGoogle, registerWithGoogle, isAuthResponse, handleAuthSuccess } from './services/auth.service';

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
const ArenaPage = lazy(() => import('./pages/ArenaPage').then(m => ({ default: m.ArenaPage })));
const ArenaDefensePage = lazy(() => import('./pages/ArenaDefensePage').then(m => ({ default: m.ArenaDefensePage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const WorldBossPage = lazy(() => import('./pages/WorldBossPage').then(m => ({ default: m.WorldBossPage })));
const WorldBossTeamSelectPage = lazy(() => import('./pages/WorldBossTeamSelectPage').then(m => ({ default: m.WorldBossTeamSelectPage })));
const WorldBossResultPage = lazy(() => import('./pages/WorldBossResultPage').then(m => ({ default: m.WorldBossResultPage })));
const SkillTreePage = lazy(() => import('./pages/SkillTreePage').then(m => ({ default: m.SkillTreePage })));

export function App() {
  const location = useLocation();
  const { player, loadPlayer, setPlayer } = useGameStore();
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
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
  const fadeTimer = useRef<number | undefined>(undefined);

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

  // Preload the city background (sprite preloading removed — collection is loaded async by gameStore)
  const preloadUrls = useMemo(() => [assetUrl('backgrounds/poke-street.png')], []);

  // Auto-focus name input
  useEffect(() => {
    if (!player && !showLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [player, showLoading]);

  if (location.pathname === '/admin') {
    if (player?.googleEmail !== 'hktmika@gmail.com') {
      return null;
    }
    return <Suspense fallback={null}><AdminPage /></Suspense>;
  }

  if (showLoading) {
    return <LoadingScreen onStart={() => { setShowLoading(false); setAppReady(); }} preloadUrls={preloadUrls} swReady={swDone} />;
  }

  if (!player) {
    const nameForm = (onSubmitHandler: (trimmed: string) => Promise<void>) => (
      <form className="onboarding-form" onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed || isCreating) return;
        setNameError('');
        setIsCreating(true);
        try {
          await onSubmitHandler(trimmed);
        } catch (err: any) {
          setNameError(err.message || 'Failed to create account');
          setIsCreating(false);
        }
      }}>
        <label className="onboarding-label">Trainer Name</label>
        <input
          ref={inputRef}
          type="text"
          className="onboarding-input"
          value={nameInput}
          onChange={e => { setNameInput(e.target.value); setNameError(''); }}
          placeholder="Enter your name..."
          maxLength={20}
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
        />
        <div className="onboarding-char-count">{nameInput.length}/20</div>
        {nameError && <p className="onboarding-error">{nameError}</p>}
        <button type="submit" className="onboarding-submit" disabled={nameInput.trim().length < 3 || !!nameError || isCreating}>
          {isCreating ? 'Creating...' : 'Start Adventure'}
        </button>
      </form>
    );

    return (
      <div className="app app--onboarding">
        <div className="onboarding-bg">
          <img src={assetUrl('splash/pikachu-4.jpg')} alt="" className="onboarding-bg-img" />
          <div className="onboarding-bg-overlay" />
        </div>

        <div className="onboarding-particles">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="onboarding-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }} />
          ))}
        </div>

        <div className="onboarding">
          <h1 className="onboarding-title">
            <span className="onboarding-title-forge">Forge</span>
            <span className="onboarding-title-sub">Monster Vault</span>
          </h1>

          <div className="onboarding-card game-panel">
            {!googleIdToken ? (
              <>
                <p className="onboarding-heading">Sign in to play</p>
                <div className="onboarding-google-wrap">
                  <GoogleSignInButton onToken={async (idToken) => {
                    setAuthError('');
                    try {
                      const result = await signInWithGoogle(idToken);
                      if (isAuthResponse(result)) {
                        handleAuthSuccess(result);
                        setPlayer(result.player);
                        navigate('/');
                      } else {
                        setGoogleIdToken(idToken);
                      }
                    } catch (err: any) {
                      setAuthError(err.message || 'Sign-in failed');
                    }
                  }} />
                </div>
                {authError && <p className="onboarding-error">{authError}</p>}
              </>
            ) : (
              <>
                <p className="onboarding-heading">Choose your trainer name</p>
                {nameForm(async (trimmed) => {
                  const result = await registerWithGoogle(googleIdToken!, trimmed);
                  handleAuthSuccess(result);
                  setPlayer(result.player);
                  useTutorialStore.getState().advanceStep();
                  navigate('/');
                })}
              </>
            )}
          </div>
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
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/arena/defense" element={<ArenaDefensePage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/altar" element={<AltarPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/inventory" element={<ItemInventoryPage />} />
            <Route path="/items/:pokemonInstanceId" element={<HeldItemManagePage />} />
            <Route path="/retry-summon" element={<RetrySummonPage />} />
            <Route path="/battle/team-select" element={<TeamSelectPage />} />
            <Route path="/battle/:battleId" element={<BattlePage />} />
            <Route path="/world-boss" element={<WorldBossPage />} />
            <Route path="/world-boss/team" element={<WorldBossTeamSelectPage />} />
            <Route path="/world-boss/result" element={<WorldBossResultPage />} />
            <Route path="/homunculus/:instanceId" element={<SkillTreePage />} />
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
