import { useState, useCallback } from 'react';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { SummonPortal } from '../components/summon/SummonPortal';
import { SummonRevealSequence } from '../components/summon/SummonRevealSequence';
import { SummonResult } from '../components/summon/SummonResult';
import { GameIcon } from '../components/icons';
import { SUMMON_COSTS } from '../services/gacha.service';
import type { PokeballType } from '@gatchamon/shared';
import './SummonPage.css';

type Phase = 'idle' | 'summoning' | 'revealing' | 'done';

export function SummonPage() {
  const { player, summon } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<OwnedPokemon[]>([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [error, setError] = useState('');
  const [selectedBall, setSelectedBall] = useState<PokeballType>('regular');

  const costs = SUMMON_COSTS[selectedBall];
  const currency = selectedBall === 'legendary'
    ? player?.legendaryPokeballs ?? 0
    : selectedBall === 'premium'
    ? player?.premiumPokeballs ?? 0
    : player?.regularPokeballs ?? 0;
  const iconId = selectedBall === 'legendary'
    ? 'legendaryPokeball'
    : selectedBall === 'premium'
    ? 'premiumPokeball'
    : 'pokeball';

  const handleSummon = async (count: 1 | 10) => {
    setError('');
    setResultsReady(false);
    setPhase('summoning');

    try {
      const newPokemon = await summon(count, selectedBall);
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
      {phase === 'idle' && (
        <div className="summon-idle">
          <div className="summon-top-row">
            <div className="pokeball-type-selector">
              <button
                className={`pokeball-type-tab ${selectedBall === 'regular' ? 'active' : ''}`}
                onClick={() => setSelectedBall('regular')}
              >
                <GameIcon id="pokeball" size={16} />
                <span>Regular</span>
              </button>
              <button
                className={`pokeball-type-tab ${selectedBall === 'premium' ? 'active' : ''}`}
                onClick={() => setSelectedBall('premium')}
              >
                <GameIcon id="premiumPokeball" size={16} />
                <span>Premium</span>
              </button>
              <button
                className={`pokeball-type-tab legendary ${selectedBall === 'legendary' ? 'active' : ''}`}
                onClick={() => setSelectedBall('legendary')}
              >
                <GameIcon id="legendaryPokeball" size={16} />
                <span>Legendary</span>
              </button>
            </div>
            <div className="pokeball-type-info">
              {selectedBall === 'regular'
                ? 'Summons 1-3★ monsters'
                : selectedBall === 'premium'
                ? 'Summons 3-5★ monsters'
                : 'Guarantees a 5★ monster'}
            </div>
          </div>

          <div className="summon-center-row">
            <button
              className="summon-btn summon-single"
              onClick={() => handleSummon(1)}
              disabled={currency < costs.single}
            >
              <span className="btn-label">Summon x1</span>
              <span className="btn-cost">{costs.single} <GameIcon id={iconId} size={14} /></span>
            </button>

            <div className={`idle-pokeball ${selectedBall === 'premium' ? 'premium' : selectedBall === 'legendary' ? 'legendary' : ''}`}>
              <div className="idle-pokeball-top" />
              <div className="idle-pokeball-bottom" />
              <div className="idle-pokeball-band">
                <div className="idle-pokeball-button">
                  <div className="idle-pokeball-button-inner" />
                </div>
              </div>
            </div>

            {selectedBall !== 'legendary' && 'multi' in costs && (
              <button
                className="summon-btn summon-multi"
                onClick={() => handleSummon(10)}
                disabled={currency < (costs as any).multi}
              >
                <span className="btn-label">Summon x10</span>
                <span className="btn-cost">{(costs as any).multi} <GameIcon id={iconId} size={14} /></span>
              </button>
            )}
          </div>

          {error && <p className="summon-error">{error}</p>}
        </div>
      )}

      {phase === 'summoning' && (
        <SummonPortal
          resultsReady={resultsReady}
          onComplete={handlePortalComplete}
          pokeballType={selectedBall}
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
