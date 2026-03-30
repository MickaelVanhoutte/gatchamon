import { useState, useCallback, useEffect } from 'react';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { useTutorialStore } from '../stores/tutorialStore';
import { SummonPortal } from '../components/summon/SummonPortal';
import { SummonRevealSequence } from '../components/summon/SummonRevealSequence';
import { SummonResult } from '../components/summon/SummonResult';
import { GameIcon } from '../components/icons';
import { SUMMON_COSTS } from '../services/gacha.service';
import { assetUrl } from '../utils/asset-url';
import type { PokeballType } from '@gatchamon/shared';
import './SummonPage.css';

type Phase = 'idle' | 'summoning' | 'revealing' | 'done';

export function SummonPage() {
  const { player, summon } = useGameStore();
  const tutorialStep = useTutorialStore(s => s.step);
  const advanceStep = useTutorialStore(s => s.advanceStep);
  const inTutorial = tutorialStep === 4 || tutorialStep === 5;

  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<OwnedPokemon[]>([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [error, setError] = useState('');
  const [selectedBall, setSelectedBall] = useState<PokeballType>('regular');

  // Tutorial step 5: auto-switch to premium
  useEffect(() => {
    if (tutorialStep === 5) {
      setSelectedBall('premium');
    }
  }, [tutorialStep]);

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
      // Preload reveal sprites while the portal animation is still playing
      for (const p of newPokemon) {
        const name = p.template.name.toLowerCase();
        const dir = p.instance.isShiny ? 'monsters/ani-shiny' : 'monsters/ani';
        const img = new Image();
        img.src = assetUrl(`${dir}/${name}.gif`);
      }
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
    // Advance tutorial after summon completes
    if (inTutorial) {
      advanceStep();
    }
    setPhase('idle');
    setResults([]);
    setResultsReady(false);
  }, [inTutorial, advanceStep]);

  if (!player) return null;

  return (
    <div className="page summon-page">
      {phase === 'idle' && (
        <div className="summon-idle">
          {/* Hide type selector during tutorial */}
          {!inTutorial && (
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
              <div className="summon-rates">
                {selectedBall === 'regular' && (
                  <>
                    <span className="rate-item"><GameIcon id="star" size={12} /> 57%</span>
                    <span className="rate-item"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 38%</span>
                    <span className="rate-item rate-rare"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 5%</span>
                  </>
                )}
                {selectedBall === 'premium' && (
                  <>
                    <span className="rate-item"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 75%</span>
                    <span className="rate-item rate-rare"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 20%</span>
                    <span className="rate-item rate-legendary"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 5%</span>
                  </>
                )}
                {selectedBall === 'legendary' && (
                  <span className="rate-item rate-legendary"><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /><GameIcon id="star" size={12} /> 100%</span>
                )}
                <span className="rate-item rate-shiny"><GameIcon id="shiny" size={12} /> 0.1%</span>
              </div>
              {selectedBall === 'premium' && (
                <div className="summon-pity">
                  <div className="summon-pity-bar">
                    <div
                      className="summon-pity-fill"
                      style={{ width: `${Math.min(100, ((player.premiumPityCounter ?? 0) / 200) * 100)}%` }}
                    />
                  </div>
                  <span className="summon-pity-label">{player.premiumPityCounter ?? 0}/200 — 5★ guaranteed</span>
                </div>
              )}
            </div>
          )}

          {/* During tutorial, show a label for which summon type */}
          {inTutorial && (
            <div className="summon-top-row">
              <div className="pokeball-type-info">
                {tutorialStep === 4
                  ? 'Regular Summon — catch your first monster!'
                  : 'Premium Summon — try a stronger Pokeball!'}
              </div>
            </div>
          )}

          <div className="summon-center-row">
            <button
              className={`summon-btn summon-single ${inTutorial ? 'tutorial-target' : ''}`}
              data-tutorial-id="summon-btn-single"
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

            {/* Hide x10 during tutorial */}
            {!inTutorial && selectedBall !== 'legendary' && 'multi' in costs && (
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
