import { useState, useCallback } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { SummonLightning } from './SummonLightning';
import { SummonReveal } from './SummonReveal';
import './SummonRevealSequence.css';

interface Props {
  results: OwnedPokemon[];
  onAllRevealed: () => void;
}

type SubPhase = 'lightning' | 'reveal' | 'waiting';

function isSpecialPull(pokemon: OwnedPokemon): boolean {
  return pokemon.instance.stars >= 4 || (pokemon.instance.isShiny ?? false);
}

export function SummonRevealSequence({ results, onAllRevealed }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>('lightning');

  const handleLightningComplete = useCallback(() => {
    setSubPhase('reveal');
  }, []);

  const handleRevealComplete = useCallback(() => {
    const current = results[currentIndex];
    // If this is a special pull in multi-summon, pause and wait for tap
    if (current && isSpecialPull(current) && results.length > 1) {
      setSubPhase('waiting');
      return;
    }
    // Otherwise advance normally
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubPhase('lightning');
    } else {
      onAllRevealed();
    }
  }, [currentIndex, results, onAllRevealed]);

  const handleTapToContinue = useCallback(() => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubPhase('lightning');
    } else {
      onAllRevealed();
    }
  }, [currentIndex, results.length, onAllRevealed]);

  const handleSkip = useCallback(() => {
    onAllRevealed();
  }, [onAllRevealed]);

  const current = results[currentIndex];
  if (!current) return null;

  const special = isSpecialPull(current);

  return (
    <div className="reveal-sequence">
      {/* Progress indicator for multi-summon */}
      {results.length > 1 && (
        <div className="reveal-progress">
          {currentIndex + 1} / {results.length}
        </div>
      )}

      {/* Skip button for multi-summon */}
      {results.length > 1 && (
        <button className="reveal-skip-btn" onClick={handleSkip}>
          Skip ▸▸
        </button>
      )}

      {/* Current reveal phase */}
      {subPhase === 'lightning' && (
        <SummonLightning
          key={`lightning-${currentIndex}`}
          stars={current.instance.stars}
          isShiny={current.instance.isShiny ?? false}
          onComplete={handleLightningComplete}
        />
      )}

      {(subPhase === 'reveal' || subPhase === 'waiting') && (
        <SummonReveal
          key={`reveal-${currentIndex}`}
          pokemon={current}
          isSpecial={special}
          onComplete={handleRevealComplete}
        />
      )}

      {/* Tap to continue overlay for special pulls */}
      {subPhase === 'waiting' && (
        <div className="tap-to-continue-overlay" onClick={handleTapToContinue}>
          <div className="tap-to-continue-text">Tap to continue</div>
        </div>
      )}
    </div>
  );
}
