import { useState, useCallback } from 'react';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { SummonPortal } from '../components/summon/SummonPortal';
import { SummonRevealSequence } from '../components/summon/SummonRevealSequence';
import { SummonResult } from '../components/summon/SummonResult';
import './SummonPage.css';

type Phase = 'idle' | 'summoning' | 'revealing' | 'done';

export function SummonPage() {
  const { player, summon } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<OwnedPokemon[]>([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [error, setError] = useState('');

  const handleSummon = async (count: 1 | 10) => {
    setError('');
    setResultsReady(false);
    setPhase('summoning');

    try {
      const newPokemon = await summon(count);
      setResults(newPokemon);
      setResultsReady(true);
    } catch (err: any) {
      setError(err.message);
      setPhase('idle');
    }
  };

  const handlePortalComplete = useCallback(() => {
    setPhase('revealing');
  }, []);

  const handleAllRevealed = useCallback(() => {
    setPhase('done');
  }, []);

  const handleDone = useCallback(() => {
    setPhase('idle');
    setResults([]);
    setResultsReady(false);
  }, []);

  if (!player) return null;

  return (
    <div className="page summon-page">
      <div className="summon-header">
        <h2>Summon</h2>
        <div className="pokeball-count">
          <span className="pokeball-icon" />
          {player.pokeballs}
        </div>
      </div>

      {phase === 'idle' && (
        <div className="summon-idle">
          <div className="idle-portal-orb" />
          <div className="summon-buttons">
            <button
              className="summon-btn summon-single"
              onClick={() => handleSummon(1)}
              disabled={player.pokeballs < 5}
            >
              <span className="btn-label">Summon x1</span>
              <span className="btn-cost">5 <span className="pokeball-icon" /></span>
            </button>
            <button
              className="summon-btn summon-multi"
              onClick={() => handleSummon(10)}
              disabled={player.pokeballs < 45}
            >
              <span className="btn-label">Summon x10</span>
              <span className="btn-cost">45 <span className="pokeball-icon" /></span>
            </button>
          </div>
          {error && <p className="summon-error">{error}</p>}
        </div>
      )}

      {phase === 'summoning' && (
        <SummonPortal
          resultsReady={resultsReady}
          onComplete={handlePortalComplete}
        />
      )}

      {phase === 'revealing' && results.length > 0 && (
        <SummonRevealSequence
          results={results}
          onAllRevealed={handleAllRevealed}
        />
      )}

      {phase === 'done' && (
        <SummonResult results={results} onDone={handleDone} />
      )}
    </div>
  );
}
