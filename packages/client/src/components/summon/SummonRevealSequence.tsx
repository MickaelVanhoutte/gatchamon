import { useState, useCallback } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { SummonLightning } from './SummonLightning';
import { SummonReveal } from './SummonReveal';
import './SummonRevealSequence.css';

interface Props {
  results: OwnedPokemon[];
  onAllRevealed: () => void;
}

type SubPhase = 'lightning' | 'reveal';

export function SummonRevealSequence({ results, onAllRevealed }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subPhase, setSubPhase] = useState<SubPhase>('lightning');

  const handleLightningComplete = useCallback(() => {
    setSubPhase('reveal');
  }, []);

  const handleRevealComplete = useCallback(() => {
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

      {subPhase === 'reveal' && (
        <SummonReveal
          key={`reveal-${currentIndex}`}
          pokemon={current}
          onComplete={handleRevealComplete}
        />
      )}
    </div>
  );
}
