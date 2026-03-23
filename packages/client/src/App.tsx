import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';
import { HomePage } from './pages/HomePage';
import { SummonPage } from './pages/SummonPage';
import { CollectionPage } from './pages/CollectionPage';
import { MonsterDetail } from './pages/MonsterDetail';
import { StoryModePage } from './pages/StoryModePage';
import { TeamSelectPage } from './pages/TeamSelectPage';
import { BattlePage } from './pages/BattlePage';
import { BottomNav } from './components/layout/BottomNav';
import { TopHUD } from './components/layout/TopHUD';
import { LoadingScreen } from './components/LoadingScreen';

export function App() {
  const { player, createPlayer, loadPlayer } = useGameStore();
  const [nameInput, setNameInput] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem('playerId');
    if (savedId) {
      loadPlayer(savedId);
    }
  }, [loadPlayer]);

  if (showLoading) {
    return <LoadingScreen onStart={() => setShowLoading(false)} />;
  }

  if (!player) {
    return (
      <div className="app">
        <div className="onboarding">
          <h1>Gatchamon</h1>
          <p>Choose your trainer name</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (nameInput.trim()) {
              await createPlayer(nameInput.trim());
              navigate('/summon');
            }
          }}>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Enter name..."
              maxLength={20}
              autoFocus
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
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/summon" element={<SummonPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:instanceId" element={<MonsterDetail />} />
          <Route path="/story" element={<StoryModePage />} />
          <Route path="/battle/team-select" element={<TeamSelectPage />} />
          <Route path="/battle/:battleId" element={<BattlePage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
