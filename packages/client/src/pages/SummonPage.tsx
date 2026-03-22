import { useState } from 'react';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { SummonAnimation } from '../components/summon/SummonAnimation';
import { SummonResult } from '../components/summon/SummonResult';
import './SummonPage.css';

type Phase = 'idle' | 'animating' | 'revealing';

export function SummonPage() {
  const { player, summon } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<OwnedPokemon[]>([]);
  const [error, setError] = useState('');

  const handleSummon = async (count: 1 | 10) => {
    setError('');
    setPhase('animating');
    try {
      const newPokemon = await summon(count);
      setResults(newPokemon);
      setTimeout(() => setPhase('revealing'), 1500);
    } catch (err: any) {
      setError(err.message);
      setPhase('idle');
    }
  };

  const handleDone = () => {
    setPhase('idle');
    setResults([]);
  };

  if (!player) return null;

  return (
    <div className="page summon-page">
      <div className="summon-header">
        <h2>Summon</h2>
        <div className="pokeball-count">
          <span className="pokeball-icon">●</span>
          {player.pokeballs}
        </div>
      </div>

      {phase === 'idle' && (
        <div className="summon-portal">
          <div className="portal-orb" />
          <div className="summon-buttons">
            <button
              className="summon-btn summon-single"
              onClick={() => handleSummon(1)}
              disabled={player.pokeballs < 5}
            >
              <span className="btn-label">Summon x1</span>
              <span className="btn-cost">5 ●</span>
            </button>
            <button
              className="summon-btn summon-multi"
              onClick={() => handleSummon(10)}
              disabled={player.pokeballs < 45}
            >
              <span className="btn-label">Summon x10</span>
              <span className="btn-cost">45 ●</span>
            </button>
          </div>
          {error && <p className="summon-error">{error}</p>}
        </div>
      )}

      {phase === 'animating' && <SummonAnimation />}

      {phase === 'revealing' && (
        <SummonResult results={results} onDone={handleDone} />
      )}
    </div>
  );
}
